import { Worker, Job } from 'bullmq';
import { redis, bullMQRedis } from '../lib/redis';
import Assignment from '../models/Assignment';
import Paper from '../models/Paper';
import { generatePaper } from '../lib/llm';
import { wss } from '../lib/websocket';
import { extractTextFromPDF } from '../lib/parsePdf';

export const startWorker = () => {
    const worker = new Worker(
        'generate-paper',
        async (job: Job) => {
            const { assignmentId } = job.data;
            console.log(`Processing job for assignment: ${assignmentId}`);

            await Assignment.findByIdAndUpdate(assignmentId, { status: 'processing' });
            broadcast({ type: 'JOB_STARTED', assignmentId });

            try {
                const assignment = await Assignment.findById(assignmentId);
                if (!assignment) throw new Error('Assignment not found');

                // extract PDF text if file was uploaded
                let pdfText = '';
                if (assignment.fileUrl) {
                    console.log('Extracting text from PDF...');
                    pdfText = await extractTextFromPDF(assignment.fileUrl);
                    console.log(`Extracted ${pdfText.length} characters from PDF`);
                }

                // pass pdfText into LLM
                const paperData = await generatePaper(assignment, pdfText);

                const paper = await Paper.create({
                    assignmentId,
                    ...paperData,
                });

                await redis.set(
                    `paper:${assignmentId}`,
                    JSON.stringify(paper),
                    'EX',
                    3600
                );

                await Assignment.findByIdAndUpdate(assignmentId, { status: 'completed' });
                broadcast({ type: 'JOB_COMPLETED', assignmentId, paperId: paper._id });

                console.log(`Job completed for assignment: ${assignmentId}`);
            } catch (err) {
                await Assignment.findByIdAndUpdate(assignmentId, { status: 'failed' });
                broadcast({ type: 'JOB_FAILED', assignmentId, error: (err as Error).message });
                throw err;
            }
        },
        { connection: bullMQRedis }
    );

    worker.on('failed', (job, err) => {
        console.error(`Job ${job?.id} failed:`, err.message);
    });

    console.log('BullMQ worker started');
};

const broadcast = (payload: object) => {
    const message = JSON.stringify(payload);
    wss.clients.forEach((client) => {
        if (client.readyState === 1) {
            client.send(message);
        }
    });
};
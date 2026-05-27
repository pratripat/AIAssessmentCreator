import { Router, Request, Response } from 'express';
import Assignment from '../models/Assignment';
import { paperQueue } from '../lib/queue';
import { upload } from '../lib/upload';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const assignments = await Assignment.find().sort({ createdAt: -1 });
        res.json({ success: true, data: assignments });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to fetch assignments' });
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) {
            res.status(404).json({ success: false, error: 'Assignment not found' });
            return;
        }
        res.json({ success: true, data: assignment });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to fetch assignment' });
    }
});

// POST — now accepts multipart/form-data for file upload
router.post('/', upload.single('file'), async (req: Request, res: Response) => {
    try {
        const {
            title,
            subject,
            className,
            schoolName,
            dueDate,
            timeAllowed,
            questionTypes,       // comes as JSON string from FormData
            totalQuestions,
            totalMarks,
            additionalInstructions,
        } = req.body;

        if (!title || !subject || !className || !schoolName || !dueDate) {
            res.status(400).json({ success: false, error: 'Missing required fields' });
            return;
        }

        // questionTypes comes as a JSON string when sent via FormData
        const parsedQuestionTypes =
            typeof questionTypes === 'string'
                ? JSON.parse(questionTypes)
                : questionTypes;

        if (!parsedQuestionTypes || parsedQuestionTypes.length === 0) {
            res.status(400).json({ success: false, error: 'At least one question type required' });
            return;
        }

        const assignment = await Assignment.create({
            title,
            subject,
            className,
            schoolName,
            dueDate,
            timeAllowed,
            questionTypes: parsedQuestionTypes,
            totalQuestions: Number(totalQuestions),
            totalMarks: Number(totalMarks),
            additionalInstructions,
            fileUrl: req.file ? req.file.path : undefined,  // store file path
            status: 'pending',
        });

        await paperQueue.add('generate', {
            assignmentId: assignment._id.toString(),
        });

        res.status(201).json({ success: true, data: assignment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to create assignment' });
    }
});

router.delete('/:id', async (req: Request, res: Response) => {
    try {
        await Assignment.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Assignment deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to delete assignment' });
    }
});

export default router;
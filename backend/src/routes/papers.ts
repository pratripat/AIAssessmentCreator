import { Router, Request, Response } from 'express';
import Paper from '../models/Paper';
import { redis } from '../lib/redis';
import { paperQueue } from '../lib/queue';

const router = Router();

// GET paper by assignmentId
router.get('/:assignmentId', async (req: Request, res: Response) => {
    try {
        // check Redis cache first
        const { redis } = await import('../lib/redis');
        const cached = await redis.get(`paper:${req.params.assignmentId}`);
        if (cached) {
            res.json({ success: true, data: JSON.parse(cached), fromCache: true });
            return;
        }

        const paper = await Paper.findOne({ assignmentId: req.params.assignmentId });
        if (!paper) {
            res.status(404).json({ success: false, error: 'Paper not found yet' });
            return;
        }

        res.json({ success: true, data: paper });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to fetch paper' });
    }
});

// POST regenerate
router.post('/:assignmentId/regenerate', async (req: Request, res: Response) => {
    try {
        const { assignmentId } = req.params;

        // 1. delete old paper
        await Paper.deleteOne({ assignmentId });

        // 2. clear Redis cache
        await redis.del(`paper:${assignmentId}`);

        // 3. queue new generation job
        await paperQueue.add('generate', { assignmentId });

        res.json({ success: true, message: 'Regeneration started' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to regenerate' });
    }
});

export default router;
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { connectDB } from './lib/db';
import { redis } from './lib/redis';
import { initWebSocket } from './lib/websocket';
import { startWorker } from './workers/paperWorker';
import assignmentRoutes from './routes/assignments';
import paperRoutes from './routes/papers';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use('/api/assignments', assignmentRoutes);
app.use('/api/papers', paperRoutes);

app.get('/health', async (req, res) => {
    const redisStatus = await redis.ping();
    res.json({ status: 'ok', redis: redisStatus });
});

// create http server (needed to share with WebSocket)
const server = http.createServer(app);

// init WebSocket on same server
initWebSocket(server);

// start BullMQ worker
startWorker();

const PORT = process.env.PORT || 5000;

const start = async () => {
    await connectDB();
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

start();
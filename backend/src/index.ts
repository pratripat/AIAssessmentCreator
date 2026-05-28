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

// --- STRICT PRODUCTION CORS CONFIGURATION ---
const allowedOrigins = [
    'http://localhost:3000', // Local Next.js / React dev
    'https://ai-assessment-creator-lilac.vercel.app' // Your live Vercel frontend
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow server-to-server or tools like Postman/Insomnia (no origin header)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true, // Absolutely mandatory if you handle auth headers, tokens, or cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.use(express.json());

// routes
app.use('/api/assignments', assignmentRoutes);
app.use('/api/papers', paperRoutes);

app.get('/health', async (req, res) => {
    try {
        const redisStatus = await redis.ping();
        res.json({ status: 'ok', database: 'connected', redis: redisStatus });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
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
import { WebSocketServer } from 'ws';
import { Server } from 'http';

export let wss: WebSocketServer;

export const initWebSocket = (server: Server) => {
    wss = new WebSocketServer({ server });

    wss.on('connection', (ws) => {
        console.log('Client connected via WebSocket');

        ws.on('close', () => {
            console.log('Client disconnected');
        });
    });

    console.log('WebSocket server ready');
};
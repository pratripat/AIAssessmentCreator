type WSMessage = {
    type: 'JOB_STARTED' | 'JOB_COMPLETED' | 'JOB_FAILED';
    assignmentId: string;
    paperId?: string;
    error?: string;
};

type MessageHandler = (msg: WSMessage) => void;

class WSClient {
    private ws: WebSocket | null = null;
    private handlers: MessageHandler[] = [];

    connect() {
        if (this.ws) return;

        this.ws = new WebSocket(
            process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000'
        );

        this.ws.onmessage = (event) => {
            try {
                const msg: WSMessage = JSON.parse(event.data);
                this.handlers.forEach((h) => h(msg));
            } catch { }
        };

        this.ws.onclose = () => {
            this.ws = null;
            // reconnect after 3 seconds
            setTimeout(() => this.connect(), 3000);
        };
    }

    onMessage(handler: MessageHandler) {
        this.handlers.push(handler);
        return () => {
            this.handlers = this.handlers.filter((h) => h !== handler);
        };
    }

    disconnect() {
        this.ws?.close();
        this.ws = null;
    }
}

export const wsClient = new WSClient();
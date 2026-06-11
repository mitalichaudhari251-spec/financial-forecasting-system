type WSHandler = (data: unknown) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private handlers: Map<string, WSHandler[]> = new Map();
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('[WS] Connected');
      if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    };

    this.ws.onmessage = (event) => {
      try {
        const { type, data } = JSON.parse(event.data);
        this.handlers.get(type)?.forEach((h) => h(data));
      } catch {}
    };

    this.ws.onclose = () => {
      console.log('[WS] Disconnected. Reconnecting in 3s...');
      this.reconnectTimeout = setTimeout(() => this.connect(), 3000);
    };
  }

  on(type: string, handler: WSHandler) {
    if (!this.handlers.has(type)) this.handlers.set(type, []);
    this.handlers.get(type)!.push(handler);
    return () => this.off(type, handler);
  }

  off(type: string, handler: WSHandler) {
    const arr = this.handlers.get(type);
    if (arr) this.handlers.set(type, arr.filter((h) => h !== handler));
  }

  send(type: string, data: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    }
  }

  disconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.ws?.close();
  }
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
export const wsService = new WebSocketService(WS_URL);

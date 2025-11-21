
type MessageHandler = (data: any) => void;

class SocketClient {
  private ws: WebSocket | null = null;
  private handlers: Record<string, MessageHandler[]> = {};
  private url: string;

  constructor() {
    // Prefer explicit env var when provided. Otherwise default to the
    // current page hostname so other devices on the LAN can connect
    // without changing the code (e.g. use ws://<your-pc-ip>:5000/ai).
    const envUrl = (import.meta.env.VITE_SIGNAL_URL as string) || '';
    if (envUrl && envUrl.length > 0) {
      this.url = envUrl;
    } else {
      const host = (typeof location !== 'undefined' && location.hostname) ? location.hostname : 'localhost';
      this.url = `ws://${host}:5000/ai`;
    }
  }

  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('WebSocket connected to', this.url);
    };

    this.ws.onmessage = (ev) => {
      try {
        const parsed = JSON.parse(ev.data);
        const type = parsed?.type ?? 'message';
        (this.handlers[type] || []).forEach((h) => h(parsed));
      } catch {
        (this.handlers['message'] || []).forEach((h) => h(ev.data));
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket closed');
      setTimeout(() => this.connect(), 2000);
    };

    this.ws.onerror = (err) => console.error('WebSocket error', err);
  }

  send(obj: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not open');
      return;
    }
    try {
      const data = typeof obj === 'string' ? obj : JSON.stringify(obj);
      this.ws.send(data);
    } catch (e) {
      console.error('Failed to send', e);
    }
  }

  on(event: string, handler: MessageHandler) {
    if (!this.handlers[event]) this.handlers[event] = [];
    this.handlers[event].push(handler);
  }

  off(event: string, handler?: MessageHandler) {
    if (!handler) {
      delete this.handlers[event];
      return;
    }
    this.handlers[event] = (this.handlers[event] || []).filter(h => h !== handler);
  }
}

export const socketClient = new SocketClient();
socketClient.connect();

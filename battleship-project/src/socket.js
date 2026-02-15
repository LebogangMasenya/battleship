
class SocketService {
  constructor() {
    if (!SocketService.instance) {
      const socket = new WebSocket(import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3000');
      this.socket = socket;
      SocketService.instance = this;
      return this;
    }
    return SocketService.instance;
  }

  sendMessage(message) {
    this.socket.send(JSON.stringify(message));
  }

  onMessage(callback) {
    this.socket.onmessage = (event) => {
      const response = JSON.parse(event.data);
      callback(response);
    };
  }

  getSocket() {
    return this.socket;
  }
}
const socketService = new SocketService();
export default socketService;

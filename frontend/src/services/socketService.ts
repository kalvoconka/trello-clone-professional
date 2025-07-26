import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    this.socket.on('error', (error: any) => {
      console.error('WebSocket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinBoard(boardId: string) {
    this.socket?.emit('join-board', boardId);
  }

  leaveBoard(boardId: string) {
    this.socket?.emit('leave-board', boardId);
  }

  // Board events
  onBoardUpdated(callback: (data: any) => void) {
    this.socket?.on('board-updated', callback);
  }

  emitBoardUpdated(boardId: string, changes: any) {
    this.socket?.emit('board-updated', { boardId, changes });
  }

  // List events
  onListCreated(callback: (data: any) => void) {
    this.socket?.on('list-created', callback);
  }

  emitListCreated(boardId: string, list: any) {
    this.socket?.emit('list-created', { boardId, list });
  }

  onListUpdated(callback: (data: any) => void) {
    this.socket?.on('list-updated', callback);
  }

  emitListUpdated(boardId: string, listId: string, changes: any) {
    this.socket?.emit('list-updated', { boardId, listId, changes });
  }

  onListDeleted(callback: (data: any) => void) {
    this.socket?.on('list-deleted', callback);
  }

  emitListDeleted(boardId: string, listId: string) {
    this.socket?.emit('list-deleted', { boardId, listId });
  }

  onListsReordered(callback: (data: any) => void) {
    this.socket?.on('lists-reordered', callback);
  }

  emitListsReordered(boardId: string, lists: any[]) {
    this.socket?.emit('lists-reordered', { boardId, lists });
  }

  // Remove listeners
  removeAllListeners() {
    this.socket?.removeAllListeners();
  }
}

export default new SocketService();
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import logger from '../config/logger';
import { BoardService } from '../services/boardService';

interface SocketWithAuth extends Socket {
  userId?: string;
  boardRooms?: Set<string>;
}

export const setupSocketHandlers = (io: Server) => {
  // Authentication middleware
  io.use(async (socket: SocketWithAuth, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = verifyAccessToken(token);
      socket.userId = decoded.userId;
      socket.boardRooms = new Set();
      
      logger.info(`User ${decoded.userId} connected via WebSocket`);
      next();
    } catch (error) {
      logger.error('Socket authentication failed', error);
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: SocketWithAuth) => {
    logger.info(`Socket connected: ${socket.id}, User: ${socket.userId}`);

    // Join board room
    socket.on('join-board', async (boardId: string) => {
      try {
        if (!socket.userId) return;

        // Verify user has access to board
        const board = await BoardService.getBoardById(boardId, socket.userId);
        if (!board) {
          socket.emit('error', { message: 'Board not found or access denied' });
          return;
        }

        // Join the board room
        socket.join(`board-${boardId}`);
        socket.boardRooms?.add(boardId);
        
        logger.info(`User ${socket.userId} joined board ${boardId}`);
        socket.emit('joined-board', { boardId });
      } catch (error) {
        logger.error('Error joining board', error);
        socket.emit('error', { message: 'Failed to join board' });
      }
    });

    // Leave board room
    socket.on('leave-board', (boardId: string) => {
      socket.leave(`board-${boardId}`);
      socket.boardRooms?.delete(boardId);
      logger.info(`User ${socket.userId} left board ${boardId}`);
    });

    // Board updates
    socket.on('board-updated', (data: { boardId: string; changes: any }) => {
      socket.to(`board-${data.boardId}`).emit('board-updated', data);
    });

    // List updates
    socket.on('list-created', (data: { boardId: string; list: any }) => {
      socket.to(`board-${data.boardId}`).emit('list-created', data);
    });

    socket.on('list-updated', (data: { boardId: string; listId: string; changes: any }) => {
      socket.to(`board-${data.boardId}`).emit('list-updated', data);
    });

    socket.on('list-deleted', (data: { boardId: string; listId: string }) => {
      socket.to(`board-${data.boardId}`).emit('list-deleted', data);
    });

    socket.on('lists-reordered', (data: { boardId: string; lists: any[] }) => {
      socket.to(`board-${data.boardId}`).emit('lists-reordered', data);
    });

    // Card updates (for future use)
    socket.on('card-created', (data: { boardId: string; listId: string; card: any }) => {
      socket.to(`board-${data.boardId}`).emit('card-created', data);
    });

    socket.on('card-updated', (data: { boardId: string; cardId: string; changes: any }) => {
      socket.to(`board-${data.boardId}`).emit('card-updated', data);
    });

    socket.on('card-moved', (data: { boardId: string; cardId: string; from: string; to: string }) => {
      socket.to(`board-${data.boardId}`).emit('card-moved', data);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}, User: ${socket.userId}`);
      
      // Leave all board rooms
      if (socket.boardRooms) {
        socket.boardRooms.forEach(boardId => {
          socket.leave(`board-${boardId}`);
        });
      }
    });
  });
};
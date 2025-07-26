import { Request, Response } from 'express';
import { BoardService } from '../services/boardService';
import { CreateBoardRequest, UpdateBoardRequest } from '../types/board';
import logger from '../config/logger';

export class BoardController {
  static async createBoard(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { name, description, background } = req.body as CreateBoardRequest;

      if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'Board name is required' });
      }

      const board = await BoardService.createBoard(req.user.userId, {
        name: name.trim(),
        description,
        background,
      });

      res.status(201).json({
        message: 'Board created successfully',
        data: board,
      });
    } catch (error) {
      logger.error('Error creating board', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to create board',
      });
    }
  }

  static async getUserBoards(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const boards = await BoardService.getUserBoards(req.user.userId);

      res.json({
        message: 'Boards retrieved successfully',
        data: boards,
      });
    } catch (error) {
      logger.error('Error fetching boards', error);
      res.status(500).json({
        error: 'Failed to fetch boards',
      });
    }
  }

  static async getBoardById(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'Board ID is required' });
      }

      const board = await BoardService.getBoardById(id, req.user.userId);

      if (!board) {
        return res.status(404).json({ error: 'Board not found' });
      }

      // Get user role for permissions
      const role = await BoardService.getUserRole(id, req.user.userId);

      res.json({
        message: 'Board retrieved successfully',
        data: {
          ...board,
          currentUserRole: role,
          permissions: {
            canEdit: role === 'OWNER' || role === 'ADMIN',
            canDelete: role === 'OWNER',
            canInvite: role === 'OWNER' || role === 'ADMIN',
            canCreateLists: true, // All members can create lists
          },
        },
      });
    } catch (error) {
      logger.error('Error fetching board', error);
      res.status(500).json({
        error: 'Failed to fetch board',
      });
    }
  }

  static async updateBoard(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { id } = req.params;
      const updates = req.body as UpdateBoardRequest;

      if (!id) {
        return res.status(400).json({ error: 'Board ID is required' });
      }

      const board = await BoardService.updateBoard(id, req.user.userId, updates);

      res.json({
        message: 'Board updated successfully',
        data: board,
      });
    } catch (error) {
      logger.error('Error updating board', error);
      res.status(error instanceof Error && error.message.includes('permissions') ? 403 : 500).json({
        error: error instanceof Error ? error.message : 'Failed to update board',
      });
    }
  }

  static async deleteBoard(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'Board ID is required' });
      }

      await BoardService.deleteBoard(id, req.user.userId);

      res.json({
        message: 'Board deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting board', error);
      res.status(error instanceof Error && error.message.includes('permissions') ? 403 : 500).json({
        error: error instanceof Error ? error.message : 'Failed to delete board',
      });
    }
  }
}
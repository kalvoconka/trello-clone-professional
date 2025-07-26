import { Request, Response } from 'express';
import { ListService } from '../services/listService';
import { CreateListRequest, UpdateListRequest, ReorderListsRequest } from '../types/board';
import logger from '../config/logger';

export class ListController {
  static async createList(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { boardId } = req.params;
      const { name, position } = req.body as CreateListRequest;

      if (!boardId) {
        return res.status(400).json({ error: 'Board ID is required' });
      }

      if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'List name is required' });
      }

      const list = await ListService.createList(boardId, req.user.userId, {
        name: name.trim(),
        position,
      });

      res.status(201).json({
        message: 'List created successfully',
        data: list,
      });
    } catch (error) {
      logger.error('Error creating list', error);
      res.status(error instanceof Error && error.message.includes('not a member') ? 403 : 500).json({
        error: error instanceof Error ? error.message : 'Failed to create list',
      });
    }
  }

  static async updateList(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { id } = req.params;
      const updates = req.body as UpdateListRequest;

      if (!id) {
        return res.status(400).json({ error: 'List ID is required' });
      }

      const list = await ListService.updateList(id, req.user.userId, updates);

      res.json({
        message: 'List updated successfully',
        data: list,
      });
    } catch (error) {
      logger.error('Error updating list', error);
      res.status(error instanceof Error && error.message.includes('permissions') ? 403 : 500).json({
        error: error instanceof Error ? error.message : 'Failed to update list',
      });
    }
  }

  static async deleteList(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'List ID is required' });
      }

      await ListService.deleteList(id, req.user.userId);

      res.json({
        message: 'List deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting list', error);
      res.status(error instanceof Error && error.message.includes('permissions') ? 403 : 500).json({
        error: error instanceof Error ? error.message : 'Failed to delete list',
      });
    }
  }

  static async reorderLists(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const data = req.body as ReorderListsRequest;

      if (!data.boardId || !data.lists || !Array.isArray(data.lists)) {
        return res.status(400).json({ error: 'Invalid reorder request' });
      }

      await ListService.reorderLists(req.user.userId, data);

      res.json({
        message: 'Lists reordered successfully',
      });
    } catch (error) {
      logger.error('Error reordering lists', error);
      res.status(error instanceof Error && error.message.includes('not a member') ? 403 : 500).json({
        error: error instanceof Error ? error.message : 'Failed to reorder lists',
      });
    }
  }
}
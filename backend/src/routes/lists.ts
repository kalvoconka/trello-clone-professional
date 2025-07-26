import { Router } from 'express';
import { ListController } from '../controllers/listController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All list routes require authentication
router.use(authenticateToken);

// List operations
router.put('/:id', ListController.updateList);
router.delete('/:id', ListController.deleteList);
router.put('/reorder', ListController.reorderLists);

export default router;
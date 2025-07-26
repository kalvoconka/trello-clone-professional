import { Router } from 'express';
import { BoardController } from '../controllers/boardController';
import { ListController } from '../controllers/listController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All board routes require authentication
router.use(authenticateToken);

// Board CRUD
router.post('/', BoardController.createBoard);
router.get('/', BoardController.getUserBoards);
router.get('/:id', BoardController.getBoardById);
router.put('/:id', BoardController.updateBoard);
router.delete('/:id', BoardController.deleteBoard);

// List operations on a board
router.post('/:boardId/lists', ListController.createList);

export default router;
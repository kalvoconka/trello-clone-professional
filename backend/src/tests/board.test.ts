import request from 'supertest';
import express from 'express';
import boardRoutes from '../routes/boards';
import { BoardService } from '../services/boardService';

// Mock the BoardService
jest.mock('../services/boardService');
const mockedBoardService = BoardService as jest.Mocked<typeof BoardService>;

const app = express();
app.use(express.json());
app.use('/api/boards', boardRoutes);

// Mock authentication middleware
jest.mock('../middleware/auth', () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    req.user = { userId: 'test-user-id', email: 'test@example.com', username: 'testuser' };
    next();
  },
}));

describe('Board Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/boards', () => {
    it('should create a new board successfully', async () => {
      const mockBoard = {
        id: 'board-1',
        name: 'Test Board',
        description: 'Test Description',
        background: '#0079BF',
        ownerId: 'test-user-id',
        lists: [],
        members: [],
        _count: { lists: 0, members: 1 },
      };

      mockedBoardService.createBoard.mockResolvedValue(mockBoard as any);

      const response = await request(app)
        .post('/api/boards')
        .send({
          name: 'Test Board',
          description: 'Test Description',
          background: '#0079BF',
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Board created successfully');
      expect(response.body.data).toEqual(mockBoard);
      expect(mockedBoardService.createBoard).toHaveBeenCalledWith('test-user-id', {
        name: 'Test Board',
        description: 'Test Description',
        background: '#0079BF',
      });
    });

    it('should return 400 if board name is missing', async () => {
      const response = await request(app)
        .post('/api/boards')
        .send({
          description: 'Test Description',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Board name is required');
    });
  });

  describe('GET /api/boards', () => {
    it('should get user boards successfully', async () => {
      const mockBoards = [
        {
          id: 'board-1',
          name: 'Test Board 1',
          lists: [],
          members: [],
          _count: { lists: 0, members: 1 },
        },
        {
          id: 'board-2',
          name: 'Test Board 2',
          lists: [],
          members: [],
          _count: { lists: 2, members: 1 },
        },
      ];

      mockedBoardService.getUserBoards.mockResolvedValue(mockBoards as any);

      const response = await request(app).get('/api/boards');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Boards retrieved successfully');
      expect(response.body.data).toEqual(mockBoards);
      expect(mockedBoardService.getUserBoards).toHaveBeenCalledWith('test-user-id');
    });
  });

  describe('GET /api/boards/:id', () => {
    it('should get board by ID successfully', async () => {
      const mockBoard = {
        id: 'board-1',
        name: 'Test Board',
        lists: [],
        members: [],
        _count: { lists: 0, members: 1 },
      };

      mockedBoardService.getBoardById.mockResolvedValue(mockBoard as any);
      mockedBoardService.getUserRole.mockResolvedValue('OWNER');

      const response = await request(app).get('/api/boards/board-1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Board retrieved successfully');
      expect(response.body.data.currentUserRole).toBe('OWNER');
      expect(response.body.data.permissions.canEdit).toBe(true);
    });

    it('should return 404 if board not found', async () => {
      mockedBoardService.getBoardById.mockResolvedValue(null);

      const response = await request(app).get('/api/boards/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Board not found');
    });
  });
});
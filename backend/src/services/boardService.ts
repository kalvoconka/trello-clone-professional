import { PrismaClient, Role } from '@prisma/client';
import { CreateBoardRequest, UpdateBoardRequest, BoardWithDetails } from '../types/board';
import logger from '../config/logger';

const prisma = new PrismaClient();

export class BoardService {
  static async createBoard(userId: string, data: CreateBoardRequest): Promise<BoardWithDetails> {
    logger.info(`Creating board for user ${userId}`, { data });

    const board = await prisma.board.create({
      data: {
        ...data,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: Role.OWNER,
          },
        },
      },
      include: {
        lists: {
          orderBy: { position: 'asc' },
          include: {
            cards: {
              orderBy: { position: 'asc' },
              select: {
                id: true,
                title: true,
                position: true,
                dueDate: true,
                _count: {
                  select: {
                    assignees: true,
                    labels: true,
                    comments: true,
                  },
                },
              },
            },
            _count: {
              select: { cards: true },
            },
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                username: true,
              },
            },
          },
        },
        _count: {
          select: {
            lists: true,
            members: true,
          },
        },
      },
    });

    logger.info(`Board created successfully`, { boardId: board.id });
    return board;
  }

  static async getUserBoards(userId: string): Promise<BoardWithDetails[]> {
    const boards = await prisma.board.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        lists: {
          orderBy: { position: 'asc' },
          include: {
            cards: {
              orderBy: { position: 'asc' },
              select: {
                id: true,
                title: true,
                position: true,
                dueDate: true,
                _count: {
                  select: {
                    assignees: true,
                    labels: true,
                    comments: true,
                  },
                },
              },
            },
            _count: {
              select: { cards: true },
            },
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                username: true,
              },
            },
          },
        },
        _count: {
          select: {
            lists: true,
            members: true,
          },
        },
      },
    });

    return boards;
  }

  static async getBoardById(boardId: string, userId: string): Promise<BoardWithDetails | null> {
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        lists: {
          orderBy: { position: 'asc' },
          include: {
            cards: {
              orderBy: { position: 'asc' },
              select: {
                id: true,
                title: true,
                position: true,
                dueDate: true,
                _count: {
                  select: {
                    assignees: true,
                    labels: true,
                    comments: true,
                  },
                },
              },
            },
            _count: {
              select: { cards: true },
            },
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                username: true,
              },
            },
          },
        },
        _count: {
          select: {
            lists: true,
            members: true,
          },
        },
      },
    });

    return board;
  }

  static async updateBoard(
    boardId: string,
    userId: string,
    data: UpdateBoardRequest
  ): Promise<BoardWithDetails> {
    // Check permissions
    const member = await prisma.boardMember.findUnique({
      where: {
        userId_boardId: {
          userId,
          boardId,
        },
      },
    });

    if (!member || (member.role !== Role.OWNER && member.role !== Role.ADMIN)) {
      throw new Error('Insufficient permissions to update board');
    }

    const board = await prisma.board.update({
      where: { id: boardId },
      data,
      include: {
        lists: {
          orderBy: { position: 'asc' },
          include: {
            cards: {
              orderBy: { position: 'asc' },
              select: {
                id: true,
                title: true,
                position: true,
                dueDate: true,
                _count: {
                  select: {
                    assignees: true,
                    labels: true,
                    comments: true,
                  },
                },
              },
            },
            _count: {
              select: { cards: true },
            },
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                username: true,
              },
            },
          },
        },
        _count: {
          select: {
            lists: true,
            members: true,
          },
        },
      },
    });

    logger.info(`Board updated`, { boardId, userId });
    return board;
  }

  static async deleteBoard(boardId: string, userId: string): Promise<void> {
    // Check if user is owner
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        ownerId: userId,
      },
    });

    if (!board) {
      throw new Error('Board not found or insufficient permissions');
    }

    await prisma.board.delete({
      where: { id: boardId },
    });

    logger.info(`Board deleted`, { boardId, userId });
  }

  static async getUserRole(boardId: string, userId: string): Promise<Role | null> {
    const member = await prisma.boardMember.findUnique({
      where: {
        userId_boardId: {
          userId,
          boardId,
        },
      },
    });

    return member?.role || null;
  }
}
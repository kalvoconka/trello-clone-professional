import { PrismaClient, Role } from '@prisma/client';
import { CreateListRequest, UpdateListRequest, ReorderListsRequest } from '../types/board';
import logger from '../config/logger';

const prisma = new PrismaClient();

export class ListService {
  static async createList(
    boardId: string,
    userId: string,
    data: CreateListRequest
  ) {
    // Check permissions
    const member = await prisma.boardMember.findUnique({
      where: {
        userId_boardId: {
          userId,
          boardId,
        },
      },
    });

    if (!member) {
      throw new Error('User is not a member of this board');
    }

    // Get the highest position
    const lastList = await prisma.list.findFirst({
      where: { boardId },
      orderBy: { position: 'desc' },
    });

    const position = data.position ?? (lastList ? lastList.position + 1 : 0);

    const list = await prisma.list.create({
      data: {
        name: data.name,
        position,
        boardId,
      },
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
    });

    logger.info(`List created`, { listId: list.id, boardId, userId });
    return list;
  }

  static async updateList(
    listId: string,
    userId: string,
    data: UpdateListRequest
  ) {
    // Get list with board info to check permissions
    const list = await prisma.list.findUnique({
      where: { id: listId },
      include: {
        board: {
          include: {
            members: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!list || list.board.members.length === 0) {
      throw new Error('List not found or insufficient permissions');
    }

    const updatedList = await prisma.list.update({
      where: { id: listId },
      data,
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
    });

    logger.info(`List updated`, { listId, userId });
    return updatedList;
  }

  static async deleteList(listId: string, userId: string) {
    // Get list with board info to check permissions
    const list = await prisma.list.findUnique({
      where: { id: listId },
      include: {
        board: {
          include: {
            members: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!list || list.board.members.length === 0) {
      throw new Error('List not found or insufficient permissions');
    }

    await prisma.list.delete({
      where: { id: listId },
    });

    logger.info(`List deleted`, { listId, userId });
  }

  static async reorderLists(userId: string, data: ReorderListsRequest) {
    // Check if user is member of the board
    const member = await prisma.boardMember.findUnique({
      where: {
        userId_boardId: {
          userId,
          boardId: data.boardId,
        },
      },
    });

    if (!member) {
      throw new Error('User is not a member of this board');
    }

    // Update positions in a transaction
    await prisma.$transaction(
      data.lists.map((list) =>
        prisma.list.update({
          where: { id: list.id },
          data: { position: list.position },
        })
      )
    );

    logger.info(`Lists reordered`, { boardId: data.boardId, userId });
  }
}
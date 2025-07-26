import api from './api';
import { Board, CreateBoardRequest, CreateListRequest, ReorderListsRequest } from '../types/board';

export const boardService = {
  async getBoards(): Promise<Board[]> {
    const response = await api.get('/boards');
    return response.data.data;
  },

  async getBoard(id: string): Promise<Board> {
    const response = await api.get(`/boards/${id}`);
    return response.data.data;
  },

  async createBoard(data: CreateBoardRequest): Promise<Board> {
    const response = await api.post('/boards', data);
    return response.data.data;
  },

  async updateBoard(id: string, data: Partial<CreateBoardRequest>): Promise<Board> {
    const response = await api.put(`/boards/${id}`, data);
    return response.data.data;
  },

  async deleteBoard(id: string): Promise<void> {
    await api.delete(`/boards/${id}`);
  },

  async createList(boardId: string, data: CreateListRequest): Promise<any> {
    const response = await api.post(`/boards/${boardId}/lists`, data);
    return response.data.data;
  },

  async updateList(listId: string, data: Partial<CreateListRequest>): Promise<any> {
    const response = await api.put(`/lists/${listId}`, data);
    return response.data.data;
  },

  async deleteList(listId: string): Promise<void> {
    await api.delete(`/lists/${listId}`);
  },

  async reorderLists(data: ReorderListsRequest): Promise<void> {
    await api.put('/lists/reorder', data);
  },
};
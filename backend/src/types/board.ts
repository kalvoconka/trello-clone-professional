import { Board, List, BoardMember, User } from '@prisma/client';

export interface CreateBoardRequest {
  name: string;
  description?: string;
  background?: string;
}

export interface UpdateBoardRequest {
  name?: string;
  description?: string;
  background?: string;
}

export interface BoardWithDetails extends Board {
  lists: ListWithCards[];
  members: BoardMemberWithUser[];
  _count: {
    lists: number;
    members: number;
  };
}

export interface ListWithCards extends List {
  cards: {
    id: string;
    title: string;
    position: number;
    dueDate: Date | null;
    _count: {
      assignees: number;
      labels: number;
      comments: number;
    };
  }[];
  _count: {
    cards: number;
  };
}

export interface BoardMemberWithUser extends BoardMember {
  user: Pick<User, 'id' | 'name' | 'email' | 'avatar' | 'username'>;
}

export interface CreateListRequest {
  name: string;
  position?: number;
}

export interface UpdateListRequest {
  name?: string;
  position?: number;
}

export interface ReorderListsRequest {
  boardId: string;
  lists: {
    id: string;
    position: number;
  }[];
}

export interface BoardPermissions {
  canEdit: boolean;
  canDelete: boolean;
  canInvite: boolean;
  canCreateLists: boolean;
}
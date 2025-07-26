export interface Board {
  id: string;
  name: string;
  description?: string;
  background?: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  lists: List[];
  members: BoardMember[];
  _count: {
    lists: number;
    members: number;
  };
  currentUserRole?: 'OWNER' | 'ADMIN' | 'MEMBER';
  permissions?: BoardPermissions;
}

export interface List {
  id: string;
  name: string;
  position: number;
  boardId: string;
  createdAt: string;
  updatedAt: string;
  cards: Card[];
  _count: {
    cards: number;
  };
}

export interface Card {
  id: string;
  title: string;
  position: number;
  dueDate: string | null;
  _count: {
    assignees: number;
    labels: number;
    comments: number;
  };
}

export interface BoardMember {
  id: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    username: string;
  };
}

export interface BoardPermissions {
  canEdit: boolean;
  canDelete: boolean;
  canInvite: boolean;
  canCreateLists: boolean;
}

export interface CreateBoardRequest {
  name: string;
  description?: string;
  background?: string;
}

export interface CreateListRequest {
  name: string;
  position?: number;
}

export interface ReorderListsRequest {
  boardId: string;
  lists: {
    id: string;
    position: number;
  }[];
}
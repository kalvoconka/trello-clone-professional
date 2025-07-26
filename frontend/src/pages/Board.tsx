import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Board as BoardType, List, CreateListRequest } from '../types/board';
import { boardService } from '../services/boardService';
import socketService from '../services/socketService';
import { ListColumn } from '../components/ListColumn';
import { AddListForm } from '../components/AddListForm';

export const Board: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [board, setBoard] = useState<BoardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    
    loadBoard();
    socketService.joinBoard(id);

    // Socket event listeners
    socketService.onListCreated(handleListCreated);
    socketService.onListUpdated(handleListUpdated);
    socketService.onListDeleted(handleListDeleted);
    socketService.onListsReordered(handleListsReordered);

    return () => {
      socketService.leaveBoard(id);
    };
  }, [id]);

  const loadBoard = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await boardService.getBoard(id);
      setBoard(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load board');
      if (err.response?.status === 404) {
        navigate('/boards');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleListCreated = (data: { boardId: string; list: List }) => {
    if (data.boardId === id && board) {
      setBoard({
        ...board,
        lists: [...board.lists, data.list],
      });
    }
  };

  const handleListUpdated = (data: { boardId: string; listId: string; changes: any }) => {
    if (data.boardId === id && board) {
      setBoard({
        ...board,
        lists: board.lists.map(list =>
          list.id === data.listId ? { ...list, ...data.changes } : list
        ),
      });
    }
  };

  const handleListDeleted = (data: { boardId: string; listId: string }) => {
    if (data.boardId === id && board) {
      setBoard({
        ...board,
        lists: board.lists.filter(list => list.id !== data.listId),
      });
    }
  };

  const handleListsReordered = (data: { boardId: string; lists: any[] }) => {
    if (data.boardId === id && board) {
      // Update list positions based on the reorder data
      const updatedLists = board.lists.map(list => {
        const reorderedList = data.lists.find(l => l.id === list.id);
        return reorderedList ? { ...list, position: reorderedList.position } : list;
      }).sort((a, b) => a.position - b.position);
      
      setBoard({
        ...board,
        lists: updatedLists,
      });
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !board) return;

    const lists = Array.from(board.lists);
    const [reorderedList] = lists.splice(result.source.index, 1);
    lists.splice(result.destination.index, 0, reorderedList);

    // Update positions
    const updatedLists = lists.map((list, index) => ({
      ...list,
      position: index,
    }));

    // Optimistic update
    setBoard({ ...board, lists: updatedLists });

    try {
      // Send reorder request
      await boardService.reorderLists({
        boardId: board.id,
        lists: updatedLists.map(list => ({
          id: list.id,
          position: list.position,
        })),
      });

      // Emit socket event
      socketService.emitListsReordered(board.id, updatedLists);
    } catch (err) {
      // Revert on error
      setBoard({ ...board, lists: board.lists });
      setError('Failed to reorder lists');
    }
  };

  const handleCreateList = async (data: CreateListRequest) => {
    if (!board) return;

    try {
      const newList = await boardService.createList(board.id, data);
      setBoard({
        ...board,
        lists: [...board.lists, newList],
      });
      socketService.emitListCreated(board.id, newList);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create list');
    }
  };

  const handleUpdateList = async (listId: string, name: string) => {
    if (!board) return;

    try {
      const updatedList = await boardService.updateList(listId, { name });
      setBoard({
        ...board,
        lists: board.lists.map(list =>
          list.id === listId ? { ...list, name } : list
        ),
      });
      socketService.emitListUpdated(board.id, listId, { name });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update list');
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!board) return;

    try {
      await boardService.deleteList(listId);
      setBoard({
        ...board,
        lists: board.lists.filter(list => list.id !== listId),
      });
      socketService.emitListDeleted(board.id, listId);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete list');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!board) {
    return null;
  }

  const backgroundStyle = board.background?.startsWith('#')
    ? { backgroundColor: board.background }
    : board.background
    ? { backgroundImage: `url(${board.background})` }
    : { backgroundColor: '#0079BF' };

  return (
    <div className="min-h-screen" style={backgroundStyle}>
      <nav className="bg-black bg-opacity-30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/boards')}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded"
            >
              ← Back
            </button>
            <h1 className="text-xl font-bold text-white">{board.name}</h1>
          </div>
          <div className="flex items-center space-x-2">
            {board.members.map(member => (
              <div
                key={member.id}
                className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold"
                title={member.user.name}
              >
                {member.user.name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      </nav>

      {error && (
        <div className="mx-4 mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="p-4 overflow-x-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="board" direction="horizontal" type="list">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex space-x-4"
              >
                {board.lists.map((list, index) => (
                  <Draggable key={list.id} draggableId={list.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`w-80 ${snapshot.isDragging ? 'opacity-50' : ''}`}
                      >
                        <ListColumn
                          list={list}
                          onUpdate={(name) => handleUpdateList(list.id, name)}
                          onDelete={() => handleDeleteList(list.id)}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                <div className="w-80">
                  <AddListForm onAdd={handleCreateList} />
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Board, CreateBoardRequest } from '../types/board';
import { boardService } from '../services/boardService';
import { BoardCard } from '../components/BoardCard';
import { CreateBoardModal } from '../components/CreateBoardModal';
import socketService from '../services/socketService';

export const Boards: React.FC = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadBoards();
    
    // Connect to WebSocket
    const token = localStorage.getItem('accessToken');
    if (token) {
      socketService.connect(token);
    }

    return () => {
      socketService.removeAllListeners();
    };
  }, []);

  const loadBoards = async () => {
    try {
      setLoading(true);
      const data = await boardService.getBoards();
      setBoards(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load boards');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (data: CreateBoardRequest) => {
    try {
      const newBoard = await boardService.createBoard(data);
      setBoards([newBoard, ...boards]);
      setIsCreateModalOpen(false);
      navigate(`/board/${newBoard.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create board');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-600 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">Trello Clone</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white">Welcome, {user?.name}!</span>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Boards</h2>
            
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="h-32 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 flex items-center justify-center transition-colors duration-200"
              >
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Create new board
                  </span>
                </div>
              </button>

              {boards.map((board) => (
                <BoardCard key={board.id} board={board} />
              ))}
            </div>

            {boards.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  You don't have any boards yet. Create your first board!
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateBoard}
      />
    </div>
  );
};
import React from 'react';
import { Link } from 'react-router-dom';
import { Board } from '../types/board';

interface BoardCardProps {
  board: Board;
}

export const BoardCard: React.FC<BoardCardProps> = ({ board }) => {
  const getBackgroundStyle = () => {
    if (board.background?.startsWith('#')) {
      return { backgroundColor: board.background };
    }
    if (board.background) {
      return { backgroundImage: `url(${board.background})` };
    }
    return { backgroundColor: '#0079BF' };
  };

  return (
    <Link
      to={`/board/${board.id}`}
      className="block rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 h-32"
      style={getBackgroundStyle()}
    >
      <div className="h-full p-4 bg-black bg-opacity-20 hover:bg-opacity-30 transition-opacity duration-200">
        <h3 className="text-white font-semibold text-lg mb-2">{board.name}</h3>
        <div className="flex items-center space-x-4 text-white text-sm opacity-90">
          <span>{board._count.lists} lists</span>
          <span>{board._count.members} members</span>
        </div>
      </div>
    </Link>
  );
};
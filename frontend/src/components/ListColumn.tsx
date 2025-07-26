import React, { useState } from 'react';
import { List } from '../types/board';

interface ListColumnProps {
  list: List;
  onUpdate: (name: string) => void;
  onDelete: () => void;
}

export const ListColumn: React.FC<ListColumnProps> = ({ list, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(list.name);

  const handleSave = () => {
    if (name.trim() && name !== list.name) {
      onUpdate(name.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(list.name);
    setIsEditing(false);
  };

  return (
    <div className="bg-gray-100 rounded-lg p-3 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        {isEditing ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSave}
            onKeyPress={(e) => e.key === 'Enter' && handleSave()}
            onKeyDown={(e) => e.key === 'Escape' && handleCancel()}
            className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <h3
            className="font-semibold text-gray-800 cursor-pointer flex-1"
            onClick={() => setIsEditing(true)}
          >
            {list.name}
          </h3>
        )}
        <button
          onClick={onDelete}
          className="text-gray-500 hover:text-red-600 p-1 rounded hover:bg-gray-200"
          title="Delete list"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-2">
        {list.cards.map((card) => (
          <div
            key={card.id}
            className="bg-white rounded-md p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <p className="text-sm text-gray-800">{card.title}</p>
            <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
              {card.dueDate && (
                <span className="flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(card.dueDate).toLocaleDateString()}
                </span>
              )}
              {card._count.comments > 0 && (
                <span className="flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {card._count.comments}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        className="w-full mt-2 p-2 text-left text-gray-600 hover:bg-gray-200 rounded transition-colors"
      >
        + Add a card
      </button>
    </div>
  );
};
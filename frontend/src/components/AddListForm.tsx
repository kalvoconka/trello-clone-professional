import React, { useState } from 'react';
import { CreateListRequest } from '../types/board';

interface AddListFormProps {
  onAdd: (data: CreateListRequest) => void;
}

export const AddListForm: React.FC<AddListFormProps> = ({ onAdd }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd({ name: name.trim() });
      setName('');
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setName('');
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="bg-white bg-opacity-80 hover:bg-opacity-100 rounded-lg p-3 w-full text-left font-medium text-gray-700 transition-colors"
      >
        + Add another list
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-100 rounded-lg p-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter list title..."
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        autoFocus
      />
      <div className="flex space-x-2 mt-2">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add list
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-md"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingAddButtonProps {
  onClick: () => void;
}

const FloatingAddButton: React.FC<FloatingAddButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-12 right-6 h-14 w-14 rounded-full bg-black text-white flex items-center justify-center shadow-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
      aria-label="Create new post"
    >
      <Plus className="h-6 w-6" />
    </button>
  );
};

export default FloatingAddButton;
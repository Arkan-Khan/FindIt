import React from 'react';

type GroupCardProps = {
  title: string;
  abbreviation: string;
  color: string;
  onClick: (abbreviation: string, color: string) => void;
};

const GroupCard: React.FC<GroupCardProps> = ({ title, abbreviation, color, onClick }) => {
  return (
    <div 
      className="border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(abbreviation, color)} // Pass abbreviation and color
    >
      <div className="p-4">
        <div className="flex items-center space-x-4">
          <div
            className="w-12 h-12 rounded flex items-center justify-center text-white text-xl font-semibold"
            style={{ backgroundColor: color }}
          >
            {abbreviation}
          </div>
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-gray-500">Click to view details</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupCard;

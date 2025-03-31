import React from 'react';

interface GroupCardProps {
  id: string;
  groupName: string;
  profileImage?: string;
  onClick?: () => void;
}

const GroupCard: React.FC<GroupCardProps> = ({ 
  groupName, 
  profileImage, 
  onClick 
}) => {
  return (
    <div 
      onClick={onClick}
      className="group-card flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
    >
      <div className="group-profile-image w-10 h-10 rounded-full border border-black mr-4 overflow-hidden">
        {profileImage ? (
          <img 
            src={profileImage} 
            alt={`${groupName} profile`} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            {groupName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <span className="group-name font-medium">{groupName}</span>
    </div>
  );
};

export default GroupCard;
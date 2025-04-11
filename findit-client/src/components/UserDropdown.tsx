import React from 'react';

type UserDropdownProps = {
  onProfileClick: () => void;
  onLogoutClick: () => void;
};

const UserDropdown: React.FC<UserDropdownProps> = ({ onProfileClick, onLogoutClick }) => {
  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-10 border border-gray-200">
      <div className="py-1">
        <button 
          onClick={onProfileClick}
          className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          My Profile
        </button>
        <button 
          onClick={onLogoutClick}
          className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v7a1 1 0 11-2 0V4H5v12h9v-3a1 1 0 112 0v4a1 1 0 01-1 1H4a1 1 0 01-1-1V3z" clipRule="evenodd" />
            <path d="M16 12l-4-4m0 0l-4 4m4-4v9" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserDropdown;
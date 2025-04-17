import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import ImageModal from './ImageModal';

interface GroupNavbarProps {
  group: {
    id: string;
    name: string;
    code: string;
    groupImageUrl: string | null;
  };
  activeTab: 'POSTS' | 'MEMBERS';
  onTabChange: (tab: 'POSTS' | 'MEMBERS') => void;
}

const GroupNavbar: React.FC<GroupNavbarProps> = ({ group, activeTab, onTabChange }) => {
  const [copied, setCopied] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const copyGroupCode = () => {
    navigator.clipboard.writeText(group.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openImageModal = () => {
    if (group.groupImageUrl) {
      setShowImageModal(true);
    }
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  return (
    <>
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Group Info */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div 
                  className="h-10 w-10 rounded-full overflow-hidden border border-gray-200 cursor-pointer"
                  onClick={openImageModal}
                >
                  <img
                    src={group.groupImageUrl || '/default-group.png'}
                    alt={group.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="ml-3">
                <h2 className="text-lg font-semibold text-gray-900">{group.name}</h2>
              </div>
            </div>

            {/* Right side - Navigation */}
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-4">
                <button
                  onClick={() => onTabChange('POSTS')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'POSTS'
                      ? 'bg-gray-200 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Posts
                </button>
                <button
                  onClick={() => onTabChange('MEMBERS')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'MEMBERS'
                      ? 'bg-gray-200 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Members
                </button>
              </nav>

              {/* Group Code */}
              <div className="flex items-center px-3 py-1 rounded-full bg-gray-100 text-sm">
                <span className="font-mono mr-2">Code: {group.code}</span>
                <button 
                  onClick={copyGroupCode}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && group.groupImageUrl && (
        <ImageModal 
          imageUrl={group.groupImageUrl} 
          altText={group.name} 
          onClose={closeImageModal} 
        />
      )}
    </>
  );
};

export default GroupNavbar;
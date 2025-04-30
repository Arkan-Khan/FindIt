import React, { useState } from 'react';
import { Copy, Check, ArrowLeft, MoreVertical} from 'lucide-react';
import ImageModal from './ImageModal';
import { useNavigate } from 'react-router-dom';

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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();

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

  const handleGoBack = () => {
    navigate('/groups');
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <>
      <div className="bg-black py-3 shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Left side - Back Arrow and Group Info */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleGoBack}
                className="p-1 rounded-full hover:bg-gray-800 text-white"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div 
                className="h-10 w-10 rounded-full overflow-hidden border-2 border-white cursor-pointer"
                onClick={openImageModal}
              >
                <img
                  src={group.groupImageUrl || '/default-group.png'}
                  alt={group.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-white font-bold text-xl truncate max-w-[150px] md:max-w-xs">
                {group.name}
              </span>
            </div>
  
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <nav className="flex space-x-4">
                <button
                  onClick={() => onTabChange('POSTS')}
                  className={`px-3 py-1.5 rounded-[10px] text-sm font-medium ${
                    activeTab === 'POSTS'
                      ? 'bg-white text-black'
                      : 'text-white hover:bg-gray-800'
                  }`}
                >
                  Posts
                </button>
                <button
                  onClick={() => onTabChange('MEMBERS')}
                  className={`px-3 py-1.5 rounded-[10px] text-sm font-medium ${
                    activeTab === 'MEMBERS'
                      ? 'bg-white text-black'
                      : 'text-white hover:bg-gray-800'
                  }`}
                >
                  Members
                </button>
              </nav>
  
              {/* Group Code */}
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white text-sm">
                <span className="font-mono">Code: {group.code}</span>
                <button
                  onClick={copyGroupCode}
                  className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
  
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={toggleMobileMenu}
                className="p-2 rounded-full text-white hover:bg-gray-800 focus:outline-none"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
  
        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-black border-t border-gray-700 py-2 px-4 mt-3">
            <div className="flex flex-col items-center space-y-2">
              {/* Posts and Members buttons in same row */}
              <div className="flex w-full">
                <button
                  onClick={() => {
                    onTabChange('POSTS');
                    setShowMobileMenu(false);
                  }}
                  className="w-1/2 py-2 text-sm font-medium text-center bg-black text-white hover:bg-gray-800"
                >
                  <span className={activeTab === 'POSTS' ? 'font-bold' : ''}>Posts</span>
                </button>
                <button
                  onClick={() => {
                    onTabChange('MEMBERS');
                    setShowMobileMenu(false);
                  }}
                  className="w-1/2 py-2 text-sm font-medium text-center bg-black text-white hover:bg-gray-800"
                >
                  <span className={activeTab === 'MEMBERS' ? 'font-bold' : ''}>Members</span>
                </button>
              </div>
              
              <div className="flex justify-center w-full">
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white text-sm">
                <span className="font-mono">Code: {group.code}</span>
                <button 
                  onClick={copyGroupCode}
                  className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
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
        )}
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
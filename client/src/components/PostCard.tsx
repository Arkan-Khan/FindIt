import React, { useState } from 'react';
import axios from 'axios';
import { useRecoilValue } from 'recoil';
import { userAtom } from '../recoil/userAtom';
import { Clock } from 'lucide-react';
import CommentsModal from './CommentsModal';
import ImageModal from './ImageModal';
import { PostCardProps } from '../types';

const PostCard: React.FC<PostCardProps> = ({ post, currentUserId, onStatusChange }) => {
  const [showComments, setShowComments] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showProfileImageModal, setShowProfileImageModal] = useState(false);
  const [localStatus, setLocalStatus] = useState(post.status);
  const user = useRecoilValue(userAtom);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  
  const postType = post.postType || post.type || 'LOST';
  const authorId = post.author?.id || post.user?.id || post.authorId || '';
  const authorName = post.author?.name || post.user?.name || 'Unknown';
  const profileImageUrl = post.author?.profileImageUrl;
  
  const authorEmail = post.author?.email || post.user?.email;
  const authorPhone = post.author?.phone || post.user?.phone;
  
  const isOwner = authorId === currentUserId;
  const isClaimed = localStatus === 'CLAIMED';
  
  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
    
    return `${formattedDate} at ${formattedTime}`;
  };
  
  const postDate = post.createdAt ? formatDate(post.createdAt) : 'Unknown date';
  
  const handleStatusToggle = async () => {
    if (!user?.token) return;
    
    const newStatus = localStatus === 'ACTIVE' ? 'CLAIMED' : 'ACTIVE';
    
    // Update UI immediately for better UX
    setLocalStatus(newStatus);
    
    // Then update in the backend
    try {
      await axios.put(
        `${backendUrl}posts/${post.id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      
      onStatusChange(post.id, newStatus);
    } catch (err) {
      console.error('Error updating post status:', err);
      setLocalStatus(localStatus);
    }
  };

  const getStatusDisplay = () => {
    if (localStatus === 'CLAIMED') {
      return { bgColor: 'bg-yellow-100', textColor: 'text-black', label: 'Claimed' };
    }
    return { bgColor: 'bg-blue-600', textColor: 'text-white', label: 'Active' };
  };

  const statusDisplay = getStatusDisplay();
  
  const postTypeDisplay = () => {
    if (postType === 'LOST') {
      return { bgColor: 'bg-red-600', textColor: 'text-white', label: 'Lost' };
    }
    return { bgColor: 'bg-green-600', textColor: 'text-white', label: 'Found' };
  };

  const typeDisplay = postTypeDisplay();

  const hasContactInfo = authorEmail || authorPhone;

  const toggleDetailsView = () => {
    setShowFullDetails(!showFullDetails);
  };

  const handleImageClick = () => {
    if (post.imageUrl) {
      setShowImageModal(true);
    }
  };

  const handleProfileImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (profileImageUrl) {
      setShowProfileImageModal(true);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg border shadow-md overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:shadow-blue-100 hover:translate-y-px">
        <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div 
                className="h-6 w-6 rounded-full bg-gray-200 mr-2 overflow-hidden cursor-pointer"
                onClick={handleProfileImageClick}
              >
                {profileImageUrl && (
                  <img
                    src={profileImageUrl}
                    alt={authorName}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{authorName}</p>
              </div>
            </div>
            
            {/* Status badges - both post type and active/claimed status */}
            <div className="flex space-x-1">
              <div className={`px-2 py-0.5 rounded-full ${typeDisplay.bgColor} ${typeDisplay.textColor} text-xs font-medium`}>
                {typeDisplay.label}
              </div>
              <div className={`px-2 py-0.5 rounded-full ${statusDisplay.bgColor} ${statusDisplay.textColor} text-xs font-medium`}>
                {statusDisplay.label}
              </div>
            </div>
          </div>
          
          <div className="flex items-center mt-1 text-xs text-gray-500">
            <Clock size={12} className="mr-1" />
            <span>{postDate}</span>
          </div>
        </div>
        
        <div 
          className="w-full pt-[100%] relative bg-gray-100 cursor-pointer"
          onClick={handleImageClick}
        >
          {post.imageUrl ? (
            <img
              src={post.imageUrl}
              alt={post.title}
              className="absolute top-0 left-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute top-0 left-0 flex h-full w-full items-center justify-center text-gray-400">
              Item Img
            </div>
          )}
        </div>
        
        <div className="p-4 flex-grow flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">{post.title}</h3>
            
            <div className="mb-3">
              {showFullDetails ? (
                <p className="text-xs text-gray-700">{post.details}</p>
              ) : (
                <p className="text-xs text-gray-700 line-clamp-2">{post.details}</p>
              )}
              
              {post.details.length > 100 && (
                <button 
                  onClick={toggleDetailsView} 
                  className="text-xs text-blue-600 mt-1 font-medium hover:underline"
                >
                  {showFullDetails ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
            
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-900">Contact Details</p>
              {authorEmail && (
                <p className="text-xs text-gray-700">Email: {authorEmail}</p>
              )}
              {authorPhone && (
                <p className="text-xs text-gray-700">Phone: {authorPhone}</p>
              )}
              {!hasContactInfo && (
                <p className="text-xs text-gray-500 italic">No contact information</p>
              )}
            </div>
          </div>
          
          {isOwner ? (
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center">
                <span className="text-xs font-medium text-gray-700 mr-2">Mark as Claimed</span>
                <button
                  onClick={handleStatusToggle}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                    localStatus === 'ACTIVE' ? 'bg-gray-200' : 'bg-blue-600'
                  }`}
                  aria-pressed={localStatus !== 'ACTIVE'}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
                      localStatus === 'ACTIVE' ? 'translate-x-1' : 'translate-x-5'
                    }`}
                  />
                </button>
              </div>
              {!isClaimed && (
                <button
                  onClick={() => setShowComments(true)}
                  className="bg-black text-white font-bold text-xs rounded-full px-4 py-2 border border-black hover:bg-gray-800 transition-colors duration-200"
                >
                  Comments
                </button>
              )}
              {isClaimed && (
                <button
                  disabled
                  className="bg-gray-300 text-gray-500 font-bold text-xs rounded-full px-4 py-2 border border-gray-300 cursor-not-allowed"
                >
                  Comments
                </button>
              )}
            </div>
          ) : (
            <div className="flex justify-center mt-2">
              {!isClaimed ? (
                <button
                  onClick={() => setShowComments(true)}
                  className="bg-black text-white font-bold text-xs rounded-full px-4 py-2 border border-black hover:bg-gray-800 transition-colors duration-200"
                >
                  Comments
                </button>
              ) : (
                <button
                  disabled
                  className="bg-gray-300 text-gray-500 font-bold text-xs rounded-full px-4 py-2 border border-gray-300 cursor-not-allowed"
                >
                  Item Claimed
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {showComments && !isClaimed && (
        <CommentsModal
          postId={post.id}
          onClose={() => setShowComments(false)}
        />
      )}
      
      {showImageModal && post.imageUrl && (
        <ImageModal 
          imageUrl={post.imageUrl}
          altText={post.title}
          onClose={() => setShowImageModal(false)}
        />
      )}

      {showProfileImageModal && profileImageUrl && (
        <ImageModal 
          imageUrl={profileImageUrl}
          altText={authorName}
          onClose={() => setShowProfileImageModal(false)}
        />
      )}
    </>
  );
};

export default PostCard;
import React, { useState } from 'react';
import axios from 'axios';
import { useRecoilValue } from 'recoil';
import { userAtom } from '../recoil/userAtom';
import { MessageCircle } from 'lucide-react';
import CommentsModal from './CommentsModal';
import ImageModal from './ImageModal';

interface PostCardProps {
  post: {
    id: string;
    title: string;
    details: string;
    imageUrl?: string;
    postType?: 'LOST' | 'FOUND';
    type?: 'LOST' | 'FOUND';
    status: 'ACTIVE' | 'CLAIMED';
    createdAt: string;
    updatedAt?: string;
    author?: {
      id: string;
      name: string;
      email?: string;
      phone?: string;
      profileImageUrl?: string;
    };
    user?: {
      id: string;
      name: string;
      email?: string;
      phone?: string;
    };
    authorId?: string;
    groupId?: string;
  };
  currentUserId: string;
  onStatusChange: (postId: string, newStatus: 'ACTIVE' | 'CLAIMED') => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUserId, onStatusChange }) => {
  const [showComments, setShowComments] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showProfileImageModal, setShowProfileImageModal] = useState(false);
  const user = useRecoilValue(userAtom);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  
  // Handle different post structure possibilities
  const postType = post.postType || post.type || 'LOST';
  const authorId = post.author?.id || post.user?.id || post.authorId || '';
  const authorName = post.author?.name || post.user?.name || 'Unknown';
  const profileImageUrl = post.author?.profileImageUrl;
  
  // Extract contact details explicitly
  const authorEmail = post.author?.email || post.user?.email;
  const authorPhone = post.author?.phone || post.user?.phone;
  
  const isOwner = authorId === currentUserId;
  
  const handleStatusToggle = async () => {
    if (!user?.token) return;
    
    const newStatus = post.status === 'ACTIVE' ? 'CLAIMED' : 'ACTIVE';
    
    try {
      // Changed from PATCH to PUT to match backend endpoint
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
    }
  };

  // Determine status display color and text
  const getStatusDisplay = () => {
    if (post.status === 'CLAIMED') {
      return { bgColor: 'bg-yellow-100', textColor: 'text-black', label: 'Claimed' };
    }
    return { bgColor: 'bg-blue-600', textColor: 'text-white', label: 'Active' };
  };

  const statusDisplay = getStatusDisplay();
  
  // Post type display
  const postTypeDisplay = () => {
    if (postType === 'LOST') {
      return { bgColor: 'bg-red-600', textColor: 'text-white', label: 'Lost' };
    }
    return { bgColor: 'bg-green-600', textColor: 'text-white', label: 'Found' };
  };

  const typeDisplay = postTypeDisplay();

  // Check if contact info exists
  const hasContactInfo = authorEmail || authorPhone;

  // Toggle full details view
  const toggleDetailsView = () => {
    setShowFullDetails(!showFullDetails);
  };

  // Open image modal for post image
  const handleImageClick = () => {
    if (post.imageUrl) {
      setShowImageModal(true);
    }
  };

  // Open image modal for profile image
  const handleProfileImageClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    if (profileImageUrl) {
      setShowProfileImageModal(true);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
      {/* Header Section with user info and status */}
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
      </div>
      
      {/* Item Image - Clickable to open modal */}
      <div 
        className="w-full pt-[100%] relative bg-gray-100 cursor-pointer"
        onClick={handleImageClick}
      >
        {post.imageUrl ? (
          <>
            <img
              src={post.imageUrl}
              alt={post.title}
              className="absolute top-0 left-0 w-full h-full object-cover"
            />
          </>
        ) : (
          <div className="absolute top-0 left-0 flex h-full w-full items-center justify-center text-gray-400">
            Item Img
          </div>
        )}
      </div>
      
      {/* Content - showing title and details directly */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">{post.title}</h3>
          
          {/* Details with expand/collapse functionality */}
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
          
          {/* Contact Details - Improved display */}
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
        
        {/* Mark as Claimed Toggle - only for owner */}
        {isOwner && (
          <div className="flex items-center justify-between mb-3 bg-gray-50 p-1.5 rounded">
            <span className="text-xs font-medium text-gray-700">Mark as Claimed</span>
            <button
              onClick={handleStatusToggle}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                post.status === 'ACTIVE' ? 'bg-gray-200' : 'bg-blue-600'
              }`}
              aria-pressed={post.status !== 'ACTIVE'}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
                  post.status === 'ACTIVE' ? 'translate-x-1' : 'translate-x-5'
                }`}
              />
            </button>
          </div>
        )}
        
        {/* Comments Button */}
        <button
          onClick={() => setShowComments(true)}
          className="w-full flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          <MessageCircle className="h-3 w-3 mr-1" />
          Comments
        </button>
      </div>
      
      {/* Modals */}
      {showComments && (
        <CommentsModal
          postId={post.id}
          onClose={() => setShowComments(false)}
        />
      )}
      
      {/* Post Image Modal */}
      {showImageModal && post.imageUrl && (
        <ImageModal 
          imageUrl={post.imageUrl}
          altText={post.title}
          onClose={() => setShowImageModal(false)}
        />
      )}
      
      {/* Profile Image Modal */}
      {showProfileImageModal && profileImageUrl && (
        <ImageModal 
          imageUrl={profileImageUrl}
          altText={authorName}
          onClose={() => setShowProfileImageModal(false)}
        />
      )}
    </div>
  );
};

export default PostCard;
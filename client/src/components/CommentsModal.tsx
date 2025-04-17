import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRecoilValue } from 'recoil';
import { userAtom } from '../recoil/userAtom';
import { X, Loader2, Send, MessageSquare } from 'lucide-react';

interface CommentAuthor {
  id: string;
  name: string;
  profileImageUrl?: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: CommentAuthor;
}

interface CommentsModalProps {
  postId: string;
  onClose: () => void;
}

const CommentsModal: React.FC<CommentsModalProps> = ({ postId, onClose }) => {
  const user = useRecoilValue(userAtom);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchComments = async () => {
      if (!user?.token) return;
      
      setLoading(true);
      try {
        const res = await axios.get(`${backendUrl}comments/${postId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        
        // Handle the API response format
        if (res.data && Array.isArray(res.data.comments)) {
          setComments(res.data.comments);
        } else {
          console.error('Unexpected response format:', res.data);
          setComments([]);
        }
      } catch (err) {
        console.error('Error fetching comments:', err);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchComments();
  }, [postId, user?.token, backendUrl]);
  
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.token || !newComment.trim()) return;
    
    setSubmitting(true);
    try {
      const res = await axios.post(
        `${backendUrl}comments`,
        {
          postId,
          content: newComment.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      
      // Add the new comment to the list
      if (res.data && res.data.comment) {
        // Add current user info to the returned comment
        const newCommentWithUser = {
          ...res.data.comment,
          author: {
            id: user.user?.id || '',
            name: user.user?.name || 'You',
            profileImageUrl: user.user?.profileImageUrl
          }
        };
        setComments((prev) => [newCommentWithUser, ...prev]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setSubmitting(false);
    }
  };
  
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };
  
  // Check if it's the current user's comment
  const isCurrentUserComment = (authorId: string) => {
    return authorId === user?.user?.id;
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[80vh] flex flex-col shadow-xl">
        {/* Header with comment count */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold">
              Comments {comments.length > 0 && `(${comments.length})`}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Comment Form - Moved to top for better UX */}
        <div className="p-4 border-b">
          <form onSubmit={handleSubmitComment} className="flex space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center min-w-[44px]"
            >
              {submitting ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>
        
        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="animate-spin h-6 w-6 text-gray-500 mb-2" />
              <p className="text-gray-500">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div 
                  key={comment.id} 
                  className={`rounded-lg p-3 ${
                    isCurrentUserComment(comment.author.id) 
                      ? 'bg-blue-50 border border-blue-100' 
                      : 'bg-gray-50 border border-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-xs font-medium text-gray-500">
                        {comment.author.profileImageUrl ? (
                          <img 
                            src={comment.author.profileImageUrl} 
                            alt="" 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          comment.author.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <h4 className="font-medium text-gray-900">
                        {isCurrentUserComment(comment.author.id) ? 'You' : comment.author.name}
                      </h4>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDateTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700 ml-8">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;
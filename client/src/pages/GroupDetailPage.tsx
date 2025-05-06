import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useRecoilValue } from 'recoil';
import { userAtom } from '../recoil/userAtom';
import { Loader2, Search } from 'lucide-react';
import GroupNavbar from '../components/GroupNavbar';
import PostCard from '../components/PostCard';
import FloatingAddButton from '../components/FloatingAddButton';
import MembersTable from '../components/MembersTable';
import PostModal from '../components/PostModal';
import { Post, GroupDetails, Member, LocationState } from '../types';

const GroupDetailPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const location = useLocation();
  const locationState = location.state as LocationState;
  
  const user = useRecoilValue(userAtom);
  const [activeTab, setActiveTab] = useState<'POSTS' | 'MEMBERS'>('POSTS');
  const [filter, setFilter] = useState<'ALL' | 'LOST' | 'FOUND' | 'CLAIMED' | 'MY_POSTS'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(
    locationState?.groupDetails || null
  );
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!user?.token || !groupId) return;
  
      if (groupDetails && groupDetails.id === groupId) {
        setDetailsLoading(false);
        return;
      }
  
      setDetailsLoading(true);
      setError(null);
  
      try {
        const res = await axios.get(`${backendUrl}groups/${groupId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
  
        const { id, name, code, groupImageUrl } = res.data;
        setGroupDetails({ id, name, code, groupImageUrl });
      } catch (err) {
        console.error("Error fetching group details:", err);
  
        if (axios.isAxiosError(err)) {
          const msg = err.response?.data?.message || "Failed to load group details. Please try again.";
          setError(msg);
        } else {
          setError("Failed to load group details. Please try again.");
        }
      } finally {
        setDetailsLoading(false);
      }
    };
  
    fetchGroupDetails();
  }, [groupId, user?.token, backendUrl]);
  
  useEffect(() => {
    const fetchPosts = async () => {
      if (!user?.token || !groupId) return;

      setPostsLoading(true);
      try {
        const res = await axios.get(`${backendUrl}posts/group/${groupId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        
        if (res.data && Array.isArray(res.data.posts)) {
          const sortedPosts = [...res.data.posts].sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          setPosts(sortedPosts);
        } else {
          console.error("Invalid posts data format:", res.data);
          setPosts([]);
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
        setPosts([]);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();
  }, [groupId, user?.token, backendUrl]);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!user?.token || !groupId) return;
      
      setMembersLoading(true);
      try {
        const res = await axios.get(`${backendUrl}groups/${groupId}/members`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        
        if (res.data && Array.isArray(res.data.members)) {
          setMembers(res.data.members);
        } else {
          console.error("Invalid members data format:", res.data);
          setMembers([]);
        }
      } catch (err) {
        console.error('Error fetching group members:', err);
        setMembers([]);
      } finally {
        setMembersLoading(false);
      }
    };
  
    if (activeTab === 'MEMBERS') {
      fetchMembers();
    }
  }, [groupId, user?.token, backendUrl, activeTab]);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchTerm || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filter === 'ALL') return true;
    if (filter === 'LOST') return post.postType === 'LOST' && post.status === 'ACTIVE';
    if (filter === 'FOUND') return post.postType === 'FOUND' && post.status === 'ACTIVE';
    if (filter === 'CLAIMED') return post.status === 'CLAIMED';
    if (filter === 'MY_POSTS') {
      const authorId = post.author?.id || post.user?.id || post.authorId;
      return authorId === user?.user?.id;
    }
    return true;
  });

  const handlePostCreated = (newPost: Post) => {
    const enhancedPost = {
      ...newPost,
      author: newPost.author || {
        id: user?.user?.id || '',
        name: user?.user?.name || '',
        email: user?.user?.email || '',
        profileImageUrl: user?.user?.profileImageUrl
      }
    };
    setPosts(prevPosts => [enhancedPost, ...prevPosts]);
  };

  const handlePostStatusChange = (postId: string, newStatus: 'ACTIVE' | 'CLAIMED') => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId ? { ...post, status: newStatus } : post
      )
    );
  };

  const handleTabChange = (tab: 'POSTS' | 'MEMBERS') => {
    if (tab === 'MEMBERS' && activeTab !== 'MEMBERS') {
      setMembersLoading(true);
    }
    setActiveTab(tab);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (detailsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 px-4">
        <Loader2 className="animate-spin h-8 w-8 text-gray-600 mb-4" />
        <p className="text-gray-700 font-medium text-lg">Loading group details...</p>
      </div>
    );
  }

  if (error || !groupDetails) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 px-4">
        <p className="text-red-500 font-medium text-lg">{error || "Could not load group details"}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200">
      <GroupNavbar 
        group={groupDetails}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <div className="max-w-7xl mx-auto px-4 py-6 mt-16">
        {activeTab === 'POSTS' && (
          <>
            <div className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search for posts by title..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="block w-full pl-10 pr-3 py-2 border border-black rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
            
            <div className="mb-6 overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 pb-2 min-w-max">
                <button
                  onClick={() => setFilter('ALL')}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                    filter === 'ALL' 
                      ? 'bg-black text-white' 
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  All Posts
                </button>
                <button
                  onClick={() => setFilter('MY_POSTS')}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border border-black ${
                    filter === 'MY_POSTS' 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  My Posts
                </button>
                <button
                  onClick={() => setFilter('LOST')}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border border-black ${
                    filter === 'LOST' 
                      ? 'bg-red-500 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  Lost Items
                </button>
                <button
                  onClick={() => setFilter('FOUND')}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border border-black ${
                    filter === 'FOUND' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  Found Items
                </button>
                <button
                  onClick={() => setFilter('CLAIMED')}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border border-black ${
                    filter === 'CLAIMED' 
                      ? 'bg-yellow-500 text-black' 
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  Claimed Items
                </button>
              </div>
            </div>
            
            {postsLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="animate-spin h-8 w-8 text-gray-600 mb-4" />
                <p className="text-gray-700 font-medium text-lg">Loading posts...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-16 bg-gray-100 rounded-lg">
                <p className="text-gray-600">
                  {searchTerm ? `No posts found matching "${searchTerm}"` : "No posts found in this category."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredPosts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    currentUserId={user?.user?.id || ''}
                    onStatusChange={handlePostStatusChange}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'MEMBERS' && (
          <>
            {membersLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="animate-spin h-8 w-8 text-gray-600 mb-4" />
                <p className="text-gray-700 font-medium text-lg">Loading members...</p>
              </div>
            ) : (
              <MembersTable members={members} />
            )}
          </>
        )}
      </div>

      <FloatingAddButton onClick={() => setShowPostModal(true)} />

      {showPostModal && (
        <PostModal 
          groupId={groupId || ''} 
          onClose={() => setShowPostModal(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </div>
  );
};

export default GroupDetailPage;
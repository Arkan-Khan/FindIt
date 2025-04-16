import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useRecoilValue } from 'recoil';
import { userAtom } from '../recoil/userAtom';
import { Loader2 } from 'lucide-react';
import GroupNavbar from '../components/GroupNavbar';
import PostCard from '../components/PostCard';
import FloatingAddButton from '../components/FloatingAddButton';
import MembersTable from '../components/MembersTable';
import PostModal from '../components/PostModal';
import { GroupDetails } from './GroupsPage'; // Import the interface

// Types
interface Post {
  id: string;
  title: string;
  details: string;
  imageUrl?: string;
  postType: 'LOST' | 'FOUND';
  status: 'ACTIVE' | 'CLAIMED';
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    profileImageUrl?: string;
  };
}

interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface LocationState {
  groupDetails: GroupDetails;
}

const GroupDetailPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const location = useLocation();
  const locationState = location.state as LocationState;
  
  const user = useRecoilValue(userAtom);
  const [activeTab, setActiveTab] = useState<'POSTS' | 'MEMBERS'>('POSTS');
  const [filter, setFilter] = useState<'ALL' | 'LOST' | 'FOUND' | 'CLAIMED'>('ALL');
  const [posts, setPosts] = useState<Post[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(
    locationState?.groupDetails || null
  );
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch group details only if not passed from GroupsPage
  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!user?.token || !groupId) return;
      
      // Only fetch if we don't already have details
      if (groupDetails && groupDetails.id === groupId) {
        return;
      }

      setLoading(true);
      try {
        const res = await axios.get(`${backendUrl}groups/${groupId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        setGroupDetails(res.data);
      } catch (err) {
        console.error('Error fetching group details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [groupId, user?.token, backendUrl, groupDetails]);

  // Fetch posts for the group
  useEffect(() => {
    const fetchPosts = async () => {
      if (!user?.token || !groupId) return;

      setLoading(true);
      try {
        const res = await axios.get(`${backendUrl}posts/group/${groupId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        
        // Check if posts array exists and set it
        if (res.data && Array.isArray(res.data.posts)) {
          setPosts(res.data.posts);
        } else {
          console.error("Invalid posts data format:", res.data);
          setPosts([]);
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [groupId, user?.token, backendUrl]);

  // Fetch members when the Members tab is activated
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
  
    // Important: Only fetch members when the tab changes to 'MEMBERS'
    if (activeTab === 'MEMBERS') {
      fetchMembers();
    }
    
    // Do NOT include members or membersLoading in the dependency array
  }, [groupId, user?.token, backendUrl, activeTab]);

  const filteredPosts = posts.filter(post => {
    if (filter === 'ALL') return true;
    if (filter === 'LOST') return post.postType === 'LOST' && post.status === 'ACTIVE';
    if (filter === 'FOUND') return post.postType === 'FOUND' && post.status === 'ACTIVE';
    if (filter === 'CLAIMED') return post.status === 'CLAIMED';
    return true;
  });

  const handlePostCreated = (newPost: Post) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const handlePostStatusChange = (postId: string, newStatus: 'ACTIVE' | 'CLAIMED') => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId ? { ...post, status: newStatus } : post
      )
    );
  };

  const handleTabChange = (tab: 'POSTS' | 'MEMBERS') => {
    // Reset loading state when switching tabs
    if (tab === 'MEMBERS' && activeTab !== 'MEMBERS') {
      // Only reset if actually changing to Members tab
      setMembersLoading(true);
    }
    setActiveTab(tab);
  };

  if (loading && !groupDetails) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 px-4">
        <Loader2 className="animate-spin h-8 w-8 text-gray-600 mb-4" />
        <p className="text-gray-700 font-medium text-lg">Loading group details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {groupDetails && (
        <GroupNavbar 
          group={groupDetails}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'POSTS' && (
          <>
            <div className="mb-6 flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  filter === 'ALL' 
                    ? 'bg-black text-white' 
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                All Posts
              </button>
              <button
                onClick={() => setFilter('LOST')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  filter === 'LOST' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                Lost Items
              </button>
              <button
                onClick={() => setFilter('FOUND')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  filter === 'FOUND' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                Found Items
              </button>
              <button
                onClick={() => setFilter('CLAIMED')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  filter === 'CLAIMED' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                Claimed Items
              </button>
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="animate-spin h-8 w-8 text-gray-600 mb-4" />
                <p className="text-gray-700 font-medium text-lg">Loading posts...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-16 bg-gray-100 rounded-lg">
                <p className="text-gray-600">No posts found in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
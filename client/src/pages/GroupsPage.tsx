import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRecoilValue } from 'recoil';
import { useNavigate } from 'react-router-dom';
import { userAtom } from '../recoil/userAtom';
import { UserState } from '../types/user';
import { Group, GroupDetails } from '../types/group';
import CreateGroupModal from '../components/CreateGroupModal';
import JoinGroupModal from '../components/JoinGroupModal';
import ImageModal from '../components/ImageModal';
import { Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';

const GroupsPage: React.FC = () => {
  const user = useRecoilValue<UserState>(userAtom);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; alt: string } | null>(null);

  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchGroups = async () => {
      if (!user?.token) return;

      setLoading(true);
      try {
        const res = await axios.get(`${backendUrl}groups/my-groups`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const { createdGroups = [], joinedGroups = [] } = res.data;
        const allGroups = [...createdGroups, ...joinedGroups];
        const uniqueGroups = Array.from(new Map(allGroups.map(g => [g.id, g])).values());

        setMyGroups(uniqueGroups);
      } catch (err) {
        console.error('Error fetching groups:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [user?.token, backendUrl]);

  const handleCreateOrJoinSuccess = (newGroup: Group) => {
    setMyGroups(prev => {
      const exists = prev.some(g => g.id === newGroup.id);
      if (exists) {
        return prev;
      }
      return [...prev, newGroup];
    });
  };

  const handleGroupClick = (group: Group) => {
    const groupDetails: GroupDetails = {
      id: group.id,
      name: group.name,
      code: group.code,
      groupImageUrl: group.groupImageUrl,
      createdAt: group.createdAt,
      memberCount: group.memberCount,
      postCount: group.postCount,
      creator: group.creator,
      members: group.members
    };
    
    navigate(`/groups/${group.id}`, { state: { groupDetails } });
  };

  const handleImageClick = (e: React.MouseEvent, imageUrl: string, altText: string) => {
    e.stopPropagation();
    setSelectedImage({ url: imageUrl, alt: altText });
    setShowImageModal(true);
  };

  return (
    <>
    <Navbar/>
    <div className="min-h-screen w-full bg-gray-200 pt-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 border-b border-black pb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Groups</h1>
        </div>

        <div className="flex flex-row gap-3 mb-8">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            + Create Group
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
            className="bg-white text-black px-6 py-3 rounded-md font-medium border-2 border-black hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            + Join Group
          </button>
        </div>

        {showCreateModal && (
          <CreateGroupModal
            onClose={() => setShowCreateModal(false)}
            onGroupCreated={handleCreateOrJoinSuccess}
          />
        )}

        {showJoinModal && (
          <JoinGroupModal
            onClose={() => setShowJoinModal(false)}
            onGroupJoined={handleCreateOrJoinSuccess}
          />
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="animate-spin h-8 w-8 text-gray-600 mb-4" />
            <p className="text-gray-700 font-medium text-lg">Fetching your groups... hang tight 🚀</p>
          </div>
        ) : myGroups.length === 0 ? (
          <div className="text-center py-16 bg-gray-100 rounded-lg">
            <p className="text-gray-600">You haven't joined any groups yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {myGroups.map((group) => (
              <div
                key={group.id}
                onClick={() => handleGroupClick(group)}
                className="flex items-center bg-white border border-black rounded-lg p-4 cursor-pointer hover:shadow-lg hover:shadow-blue-400 transition-shadow"
              >
                <div className="flex-shrink-0 mr-4">
                  <div 
                    className="w-16 h-16 rounded-full overflow-hidden border border-black cursor-pointer"
                    onClick={(e) => handleImageClick(e, group.groupImageUrl || '/default-group.png', group.name)}
                  >
                    <img
                      src={group.groupImageUrl || '/default-group.png'}
                      alt={group.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/default-group.png';
                      }}
                    />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1 truncate">{group.name}</h2>
                  <p className="text-gray-600 text-sm truncate">
                    <span className="font-mono">Code: {group.code}</span>
                  </p>
                  <p className="text-gray-500 text-sm truncate">
                    Created by {group.creator?.name || 'Unknown'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

    {/* Image Modal */}
    {showImageModal && selectedImage && (
      <ImageModal
        imageUrl={selectedImage.url}
        altText={selectedImage.alt}
        onClose={() => setShowImageModal(false)}
      />
    )}
    </>
  );
};

export default GroupsPage;
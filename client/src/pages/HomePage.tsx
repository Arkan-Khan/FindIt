import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GroupCard from '../components/GroupCard';
import Modal from '../components/Modal';

interface Group {
  id: string;
  name: string;
  description: string;
  profileImage?: string;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [msg, setMsg] = useState('');

  // Dummy groups data
  const [groups, setGroups] = useState<Group[]>([
    { 
      id: '1', 
      name: 'Study Group', 
      description: 'Advanced learning',
      profileImage: '/study-group.png'
    },
    { 
      id: '2', 
      name: 'Work Colleagues', 
      description: 'Professional network',
      profileImage: '/work-group.png'
    },
    { 
      id: '3', 
      name: 'Family', 
      description: 'Family connections',
      profileImage: '/family-group.png'
    },
    { 
      id: '4', 
      name: 'Sports Team', 
      description: 'Athletic group',
      profileImage: '/sports-group.png'
    }
  ]);

  const handleGroupClick = (groupId: string) => {
    navigate(`/group-detail-view/${groupId}`);
  };

  const handleCreateGroup = () => {
    if (groupName.trim() === '') {
      setMsg('Group name is required');
      return;
    }

    const newGroup: Group = {
      id: Date.now().toString(),
      name: groupName,
      description: groupDesc
    };

    setGroups([...groups, newGroup]);
    setMsg('Group created successfully');
    setIsCreateModalOpen(false);
    setGroupName('');
    setGroupDesc('');
  };

  const handleJoinGroup = () => {
    if (teamCode.trim() === '') {
      setMsg('Team code is required');
      return;
    }

    setMsg('Successfully joined the group');
    setIsJoinModalOpen(false);
    setTeamCode('');
  };

  return (
    <div className="min-h-screen bg-white text-black p-6 pt-24">
      <div className="container mx-auto">
        <div className="page-header mb-6 flex justify-between items-center border-b pb-4 border-gray-200">
          <h1 className="text-3xl font-bold">Groups</h1>
          <div className="action-buttons space-x-4">
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="border border-black text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Create Group
            </button>
            <button 
              onClick={() => setIsJoinModalOpen(true)}
              className="bg-black text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors"
            >
              Join Group
            </button>
          </div>
        </div>

        <div className="groups-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              id={group.id}
              groupName={group.name}
              profileImage={group.profileImage}
              onClick={() => handleGroupClick(group.id)}
            />
          ))}
        </div>

        {/* Join Group Modal */}
        <Modal
          isOpen={isJoinModalOpen}
          onClose={() => setIsJoinModalOpen(false)}
          title="Join a Group"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Enter the group code to join an existing group
            </p>
            <input
              type="text"
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value)}
              placeholder="Enter group code"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button 
              onClick={handleJoinGroup}
              className="w-full bg-black text-white py-2 px-4 rounded hover:opacity-90 transition-colors"
            >
              Join Group
            </button>
            {msg && <p className="text-green-600">{msg}</p>}
          </div>
        </Modal>

        {/* Create Group Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create a New Group"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Fill in the details to create your group
            </p>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
            />
            <input
              type="text"
              value={groupDesc}
              onChange={(e) => setGroupDesc(e.target.value)}
              placeholder="Group description"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button 
              onClick={handleCreateGroup}
              className="w-full bg-black text-white py-2 px-4 rounded hover:opacity-90 transition-colors"
            >
              Create Group
            </button>
            {msg && <p className="text-green-600">{msg}</p>}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default HomePage;
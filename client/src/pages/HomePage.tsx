import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GroupCard from '../components/GroupCard';
import Modal from '../components/Modal';

interface Team {
  id: string;
  teamName: string;
  description: string;
}

const Groups: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [teamName, setTeamName] = useState<string>('');
  const [teamDesc, setTeamDesc] = useState<string>('');
  const [msg, setMsg] = useState<string>('');
  const [teamCode, setTeamCode] = useState<string>('');
  const [Groups, setGroups] = useState<Team[]>([]); // Mock Groups for now
  const navigate = useNavigate();

  const colorArray = ['#8B5CF6', '#3B82F6', '#059669', '#EC4899', '#6B7280'];

  // Simulating data instead of fetching from backend
  useEffect(() => {
    // Mock admin status
    const adminStatus = localStorage.getItem('isAdmin');
    setIsAdmin(adminStatus === 'true');

    // Mock Groups data
    const mockGroups: Team[] = [
      { id: '1', teamName: 'Mathematics', description: 'Advanced math group' },
      { id: '2', teamName: 'Physics', description: 'Physics study group' },
      { id: '3', teamName: 'Computer Science', description: 'Programming and algorithms' },
      { id: '4', teamName: 'Chemistry', description: 'Chemistry lab group' },
      { id: '5', teamName: 'Biology', description: 'Biology research group' }
    ];
    
    setGroups(mockGroups);
  }, []);

  const handleTeamClick = (abbreviation: string, color: string, title: string) => {
    navigate(`/team-detail-view/${abbreviation}`, { state: { abbreviation, color, title } });
  };

  const handleTeamCreate = () => {
    if (teamName.trim() === '') {
      setMsg('Team name is required');
      return;
    }
    
    // Instead of API call, just add to the local state
    const newTeam: Team = {
      id: Date.now().toString(),
      teamName: teamName,
      description: teamDesc
    };
    
    setGroups([...Groups, newTeam]);
    setMsg('Team created successfully');
    setIsCreateModalOpen(false);
    setTeamName('');
    setTeamDesc('');
  };

  const handleJoinTeam = () => {
    if (teamCode.trim() === '') {
      setMsg('Team code is required');
      return;
    }
    
    // Mock successful join
    setMsg('Successfully joined the team');
    setIsJoinModalOpen(false);
    setTeamCode('');
  };

  const generateAbbreviation = (teamName: string): string => {
    return teamName.slice(0, 2).toUpperCase();
  };

  const getRandomColor = (): string => {
    return colorArray[Math.floor(Math.random() * colorArray.length)];
  };

  return (
    <>
      <div className="p-6 pt-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Groups</h1>
          <div>
            {isAdmin ? (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors flex items-center"
              >
                <span className="mr-2">+</span>
                Create Team
              </button>
            ) : (
              <button
                onClick={() => setIsJoinModalOpen(true)}
                className="border border-gray-300 py-2 px-4 rounded hover:bg-gray-50 transition-colors flex items-center"
              >
                <span className="mr-2">👥</span>
                Join Team
              </button>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">{isAdmin ? "My Groups" : "Classes"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Groups.map((team) => {
              const abbreviation = generateAbbreviation(team.teamName);
              const color = getRandomColor();
              
              return (
                <GroupCard
                  key={team.id}
                  abbreviation={abbreviation}
                  color={color}
                  title={team.teamName}
                  onClick={() => handleTeamClick(abbreviation, color, team.teamName)}
                />
              );
            })}
          </div>
        </div>

        {/* Modals */}
        <Modal
          isOpen={isJoinModalOpen}
          onClose={() => setIsJoinModalOpen(false)}
          title="Join a Team"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Enter the team code to join an existing team
            </p>
            <input
              type="text"
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value)}
              placeholder="Enter team code"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={handleJoinTeam}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            >
              Join Team
            </button>
            {msg.length !== 0 && <h1 className="text-green-500">{msg}</h1>}
          </div>
        </Modal>

        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create a New Team"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Fill in the details to create your team
            </p>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Team name"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={teamDesc}
              onChange={(e) => setTeamDesc(e.target.value)}
              placeholder="Team description"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={handleTeamCreate}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            >
              Create Team
            </button>
            {msg.length !== 0 && <h1 className="text-green-500">{msg}</h1>}
          </div>
        </Modal>
      </div>
    </>
  );
};

export default Groups;
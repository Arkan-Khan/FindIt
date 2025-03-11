import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AssignmentCard from './Assignment';

// Define TypeScript interfaces
interface Member {
  _id: string;
  name: string;
  rollNo: string;
  branch: string;
  teamId?: string;
}

interface Assignment {
  _id: string;
  title: string;
  dueDate: string;
  createdAt: string;
  team: {
    _id: string;
  };
}

interface LocationState {
  abbreviation?: string;
  color?: string;
  title?: string;
}

const TeamDetailView: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'members'>('posts');
  const [copySuccess, setCopySuccess] = useState<string>('');
  const [teamCode] = useState<string>('TEAM123');
  const [msg, setMsg] = useState<string>('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([]);

  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const { abbreviation: passedAbbreviation, color: passedColor, title } = state || {};

  useEffect(() => {
    // Simulate fetching admin status from localStorage
    setIsAdmin(true);
    
    // Load dummy data for assignments and members
    loadDummyData();
  }, []);

  const loadDummyData = () => {
    // Dummy assignments data
    const dummyAssignments: Assignment[] = [
      {
        _id: '1',
        title: 'React Fundamentals Quiz',
        dueDate: '2025-03-15T23:59:59',
        createdAt: '2025-03-07T10:30:00',
        team: { _id: 'team1' }
      },
      {
        _id: '2',
        title: 'TypeScript Assessment',
        dueDate: '2025-03-20T23:59:59',
        createdAt: '2025-03-07T14:45:00',
        team: { _id: 'team1' }
      },
      {
        _id: '3',
        title: 'State Management Project',
        dueDate: '2025-03-25T23:59:59',
        createdAt: '2025-03-06T09:15:00',
        team: { _id: 'team1' }
      },
      {
        _id: '4',
        title: 'API Integration Challenge',
        dueDate: '2025-04-01T23:59:59',
        createdAt: '2025-03-05T16:20:00',
        team: { _id: 'team1' }
      }
    ];

    // Dummy members data
    const dummyMembers: Member[] = [
      {
        _id: 'member1',
        name: 'John Doe',
        rollNo: '2023001',
        branch: 'Computer Science',
        teamId: 'team1'
      },
      {
        _id: 'member2',
        name: 'Jane Smith',
        rollNo: '2023002',
        branch: 'Information Technology',
        teamId: 'team1'
      },
      {
        _id: 'member3',
        name: 'Robert Johnson',
        rollNo: '2023003',
        branch: 'Data Science',
        teamId: 'team1'
      },
      {
        _id: 'member4',
        name: 'Emily Williams',
        rollNo: '2023004',
        branch: 'Computer Science',
        teamId: 'team1'
      }
    ];

    setAssignments(dummyAssignments);
    setMembers(dummyMembers);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(teamCode)
      .then(() => {
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
      })
      .catch(() => setCopySuccess('Failed to copy!'));
  };

  const openModal = (member: Member) => {
    setMemberToRemove(member);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleRemove = () => {
    if (memberToRemove) {
      // Update members after successful removal (no actual API call since we're using dummy data)
      setMembers(prevMembers => prevMembers.filter(member => member._id !== memberToRemove._id));
      setMsg('Member removed successfully');
    }
    setIsModalOpen(false);
  };

  const fetchMembers = () => {
    // This function now only switches to the members tab
    // The members data is already loaded from the dummy data
    console.log("Fetching members for team code:", teamCode);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Are you sure you want to remove this member?</h2>
            <p className='text-center'>{memberToRemove?.name}</p>
            <div className="mt-6 flex justify-center space-x-4 ">
              <button 
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600" 
                onClick={closeModal}
              >
                Cancel
              </button>
              <button 
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" 
                onClick={handleRemove}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Secondary Navbar */}
      <div className="fixed top-16 w-full z-10 flex items-center p-4 bg-white border-b border-gray-200 shadow-sm">
        <div 
          style={{ backgroundColor: passedColor || '#4F46E5' }} 
          className="w-8 h-8 rounded flex items-center justify-center text-white mr-3"
        >
          {passedAbbreviation || 'T'}
        </div>

        <div className="flex-grow">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">{title || 'Web Development Team'}</h1>
            <div className="ml-8 space-x-4">
              <button 
                onClick={() => setActiveTab('posts')}
                className={`text-gray-700 pb-1 ${activeTab === 'posts' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
              >
                Posts
              </button>
              <button 
                onClick={() => {
                  setActiveTab('members');
                  fetchMembers();
                }}
                className={`text-gray-700 pb-1 ${activeTab === 'members' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
              >
                Members
              </button>
            </div>
          </div>
        </div>

        {/* Display Team Code with Copy Button */}
        <div className="ml-8 text-gray-500 flex items-center space-x-2">
          <span className="text-sm font-medium">Team Code: </span>
          <span className="text-blue-600 font-semibold">{teamCode}</span>
          <button 
            onClick={copyToClipboard} 
            className="bg-gray-200 text-gray-600 px-2 py-1 rounded hover:bg-gray-300 transition-colors"
          >
            Copy
          </button>
          {copySuccess && (
            <span className="text-sm text-green-500 ml-2">{copySuccess}</span>
          )}
        </div>

        {isAdmin && (
          <button 
            onClick={() => navigate('/generateQuestions', { state: { teamCode } })}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex items-center ml-4"
          >
            <span className="mr-2">✏️</span>
            Generate Test
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="pt-40 px-6">
        {activeTab === 'posts' && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {assignments.length > 0 ? (
              assignments.map((assignment) => (
                <AssignmentCard 
                  key={assignment._id}
                  title={assignment.title}
                  dueDate={assignment.dueDate}
                  timestamp={assignment.createdAt}
                  isAdmin={isAdmin}
                  teamId={assignment.team._id}
                  testId={assignment._id}
                />
              ))
            ) : (
              <p>No assignments available for this team.</p>
            )}
          </div>
        )}

        {/* Members Section */}
        {activeTab === 'members' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.length > 0 ? (
                  members.map((member) => (
                    <tr key={member._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.rollNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.branch}</td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button 
                            className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition-colors"
                            onClick={() => openModal(member)}
                          >
                            Remove
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isAdmin ? 4 : 3} className="px-6 py-4 text-center text-sm text-gray-500">
                      No members found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Message display */}
      {msg && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
          {msg}
        </div>
      )}
    </div>
  );
};

export default TeamDetailView;
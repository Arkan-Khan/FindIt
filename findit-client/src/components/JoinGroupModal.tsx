import React, { useState } from 'react';
import axios from 'axios';
import { useRecoilValue } from 'recoil';
import { userAtom } from '../recoil/userAtom';

interface Props {
  onClose: () => void;
  onGroupJoined: (group: any) => void;
}

const JoinGroupModal: React.FC<Props> = ({ onClose, onGroupJoined }) => {
  const user = useRecoilValue(userAtom);
  const [teamCode, setTeamCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoinGroup = async () => {
    if (!teamCode || !user?.token) return;
    setLoading(true);
    
    try {
      const res = await axios.post(
        'http://localhost:5000/groups/join',
        { code: teamCode },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      onGroupJoined(res.data.group);
      setTeamCode('');
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to join group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Join Group</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="teamCode" className="block text-sm font-medium text-gray-700 mb-1">
              Group Code
            </label>
            <input
              id="teamCode"
              type="text"
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value)}
              placeholder="Enter group code"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex flex-col sm:flex-row-reverse gap-3">
          <button
            onClick={handleJoinGroup}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-black text-white rounded-md font-medium disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Joining...
              </div>
            ) : (
              "Join Group"
            )}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-white text-black border-2 border-black rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinGroupModal;
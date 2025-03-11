import { useNavigate } from 'react-router-dom';


interface AssignmentCardProps {
  title: string;
  dueDate: string;
  timestamp: string;
  isAdmin: boolean;
  teamId: string;
  testId: string;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({
  title,
  dueDate,
  timestamp,
  isAdmin,
  teamId,
  testId
}) => {
  const navigate = useNavigate();

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Check if assignment is past due
  const isPastDue = (): boolean => {
    const now = new Date();
    const due = new Date(dueDate);
    return now > due;
  };

  // Handle card click
  const handleCardClick = () => {
    navigate('/test', {
      state: {
        testId,
        teamId,
        isAdmin
      }
    });
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleCardClick}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-800 truncate">{title}</h3>
          <span className={`text-xs px-2 py-1 rounded ${
            isPastDue() ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {isPastDue() ? 'Past Due' : 'Active'}
          </span>
        </div>
        
        <div className="flex flex-col space-y-2">
          <div className="flex items-center text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span className="text-sm">Due: {formatDate(dueDate)}</span>
          </div>
          
          <div className="flex items-center text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="text-xs">Created: {formatDate(timestamp)}</span>
          </div>
        </div>
        
        {isAdmin && (
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
            <button 
              className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/edit-test/${testId}`, { state: { teamId, testId } });
              }}
            >
              Edit
            </button>
            <button 
              className="text-xs bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/results/${testId}`, { state: { teamId, testId } });
              }}
            >
              View Results
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentCard;
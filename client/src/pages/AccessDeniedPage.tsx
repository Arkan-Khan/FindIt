import { Link } from 'react-router-dom';
import { Lock, AlertTriangle, LogIn, UserPlus } from 'lucide-react';

const AccessDeniedPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg text-center">
        <div className="flex justify-center">
        <div className="relative">
            <AlertTriangle size={64} className="text-yellow-500" />
            <div className="absolute -bottom-3 -right-3 bg-red-500 rounded-full p-2">
              <Lock size={24} className="text-white" />
            </div>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mt-6">Access Denied</h1>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
          <p className="text-yellow-700">Hmm... trying to sneak in?</p>
          <p className="text-gray-600 mt-2">You need to be signed in to view this page.</p>
        </div>
        
        <div className="mt-8 flex flex-row gap-4 justify-center">
          <Link 
            to="/login"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            <LogIn size={18} />
            <span>Sign In</span>
          </Link>
          
          <Link
            to="/signup"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            <UserPlus size={18} />
            <span>Sign Up</span>
          </Link>
        </div>
        
        <div className="mt-4">
            <Link 
            to="/"
            className="inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Back to Home
          </Link>
        </div>
        
        <p className="text-gray-500 mt-8">If you believe this is an error, please contact support.</p>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
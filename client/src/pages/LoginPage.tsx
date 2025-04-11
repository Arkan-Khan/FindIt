import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom'; 
import { useSetRecoilState, useRecoilValue} from 'recoil';
import { userState } from '../atoms/userAtom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const setUser = useSetRecoilState(userState);
  const user = useRecoilValue(userState);
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect to home
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
  
    try {
      const response = await axios.post(
        'http://localhost:5000/auth/login',
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setUser(response.data.user);
      navigate('/Groups');
    } catch (error: any) {
      console.error('Login failed:', error);

      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Login failed. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Login Form */}
        <div className="mt-8 bg-white py-5 px-10 shadow-xl rounded-xl border border-gray-200">
            <div className="text-center">
            <div className="flex justify-center">
                <Search className="w-8 h-8 text-black" />
            </div>
            <h2 className="mt-2 mb-6 text-3xl font-extrabold text-gray-900">Sign in to FindIt</h2>
            </div>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="py-3 text-gray-900 placeholder-gray-400 focus:ring-black focus:border-black block w-full pl-10 border-gray-300 rounded-md"
                  placeholder="enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="py-3 text-gray-900 placeholder-gray-400 focus:ring-black focus:border-black block w-full pl-10 border-gray-300 rounded-md"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
              
              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-black hover:text-gray-800">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isLoading}
                className={`py-3 px-10 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
          <div className="text-center mt-3">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-gray-900 font-medium hover:underline">
                  Register
                </Link>
              </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
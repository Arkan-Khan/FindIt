import React, { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { userAtom, UserState } from '../recoil/userAtom';
import { useNavigate, Link } from 'react-router-dom';
import { Search } from 'lucide-react'; 
import Navbar from '../components/Navbar';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useSetRecoilState(userAtom);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        const userData: UserState = {
          token: data.token,
          user: data.user,
        };
        setUser(userData);
        navigate('/groups');
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Navbar/>
    <div className="min-h-screen pt-16 bg-gray-200 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 sm:p-8 border border-gray-200">
        <div className="flex justify-center">
          <Search className="w-8 h-8 text-black" />
        </div>
        <h2 className="mt-2 mb-6 text-3xl font-extrabold text-center text-gray-900">Login to FindIt</h2>
        <form onSubmit={handleLogin} className="space-y-6">
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
                type="email"
                id="email"
                placeholder="enter your email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="py-3 text-gray-900 placeholder-gray-400 focus:ring-black focus:border-black block w-full pl-10 border-gray-300 rounded-md"
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
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="py-3 text-gray-900 placeholder-gray-400 focus:ring-black focus:border-black block w-full pl-10 border-gray-300 rounded-md"
              />
            </div>
          </div>
  
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className={`py-3 px-10 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Signing in...' : 'Sign in'}
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
    </>
  );
};

export default LoginPage;
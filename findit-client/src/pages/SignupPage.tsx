import React, { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { userAtom, UserState } from '../recoil/userAtom';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react'; // You can change this icon if needed

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setUser = useSetRecoilState(userAtom);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          password,
        }),
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
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-200 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-4 sm:p-6 border border-gray-200">
        <div className="flex justify-center">
          <UserPlus className="w-7 h-7 text-black" />
        </div>
        <h2 className="mt-1 mb-4 text-xl font-bold text-center text-gray-900">Sign up to FindIt</h2>
  
        {error && <p className="text-red-600 text-sm mb-3 text-center">{error}</p>}
  
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="py-2.5 text-gray-900 placeholder-gray-400 focus:ring-black focus:border-black block w-full border border-gray-300 rounded-md px-3"
            />
          </div>
  
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="py-2.5 text-gray-900 placeholder-gray-400 focus:ring-black focus:border-black block w-full border border-gray-300 rounded-md px-3"
            />
          </div>
  
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone (Optional)
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              className="py-2.5 text-gray-900 placeholder-gray-400 focus:ring-black focus:border-black block w-full border border-gray-300 rounded-md px-3"
            />
          </div>
  
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="py-2.5 text-gray-900 placeholder-gray-400 focus:ring-black focus:border-black block w-full border border-gray-300 rounded-md px-3"
            />
          </div>
  
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className={`py-2.5 px-8 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Creating...' : 'Sign Up'}
            </button>
          </div>
        </form>
  
        <div className="text-center mt-2">
          <p className="text-sm text-gray-600">
            Already a user?{' '}
            <a href="/login" className="text-gray-900 font-medium hover:underline">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
  
};

export default SignupPage;

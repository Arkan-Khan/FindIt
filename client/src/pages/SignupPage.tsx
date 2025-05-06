import React, { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { userAtom, UserState } from '../recoil/userAtom';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const setUser = useSetRecoilState(userAtom);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${backendUrl}auth/signup`, {
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
        toast.success('Account created successfully!');
        navigate('/groups');
      } else {
        if (data.errors) {
          if (Array.isArray(data.errors)) {
            data.errors.forEach((error: any) => {
              toast.error(error.message || JSON.stringify(error));
            });
          } else if (typeof data.errors === 'object') {
            Object.values(data.errors).forEach((error: any) => {
              toast.error(typeof error === 'string' ? error : JSON.stringify(error));
            });
          } else {
            toast.error(typeof data.errors === 'string' ? data.errors : JSON.stringify(data.errors));
          }
        } else {
          toast.error(data.message || 'Signup failed');
        }
      }
    } catch (err) {
      console.error('Signup error:', err);
      toast.error('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar/>
      <div className="min-h-screen pt-20 bg-gray-200 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-4 sm:p-6 border border-gray-200">
          <div className="flex justify-center">
            <UserPlus className="w-7 h-7 text-black" />
          </div>
          <h2 className="mt-1 mb-4 text-xl font-bold text-center text-gray-900">Sign up to FindIt</h2>
    
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
              <Link to="/login" className="text-gray-900 font-medium hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupPage;
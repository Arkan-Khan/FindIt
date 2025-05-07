import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from "../components/Helpers/Footer.tsx";
import axios from 'axios';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface Stats {
  totalUsers: number;
  totalGroups: number;
  totalPosts: number;
  returnedItems: number;
}

const LandingPage: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalGroups: 0,
    totalPosts: 0,
    returnedItems: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${backendUrl}stats`);
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <>
    <Navbar/>
    <div className="min-h-screen flex flex-col bg-gray-50">
    <section className="bg-white text-black pt-40 pb-10 px-4">
        <div className="container mx-auto max-w-6xl flex justify-center items-center">
          <div className="text-center">
            <h1 className="font-bold leading-tight mb-6">
              <div className="text-5xl md:text-6xl">Find What You've Lost</div>
              <div className="text-4xl md:text-5xl my-2">&</div>
              <div className="text-5xl md:text-6xl">Return What You've Found</div>
            </h1>
            <p className="text-xl mb-8 text-gray-600">
              Connect with your community to recover lost items and help others find theirs.
            </p>
            <div className="flex flex-col sm:flex-row sm:space-x-4 justify-center items-center space-y-4 sm:space-y-0">
              <Link
                to="/signup"
                className="bg-black text-white hover:bg-gray-800 px-6 py-3 rounded-lg font-medium text-center transition-colors w-fit mx-auto"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-10 pb-10 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">How FindIt Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md p-6 transition-transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Join Your Community</h3>
              <p className="text-gray-600">Connect with your college, office, apartment, or society through our group system.</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 transition-transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Post Lost & Found Items</h3>
              <p className="text-gray-600">Create detailed posts with images and descriptions to help recover or return items.</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 transition-transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Connect & Claim</h3>
              <p className="text-gray-600">Connect with finders and verify item ownership to reclaim your belongings.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-100 py-10 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Making a Difference</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <h3 className="text-black text-4xl font-bold mb-2">
                {loading ? "..." : stats.returnedItems.toLocaleString()}
              </h3>
              <p className="text-gray-600">Items Returned</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <h3 className="text-black text-4xl font-bold mb-2">
                {loading ? "..." : stats.totalGroups.toLocaleString()}
              </h3>
              <p className="text-gray-600">Active Communities</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <h3 className="text-black text-4xl font-bold mb-2">
                {loading ? "..." : stats.totalUsers.toLocaleString()}
              </h3>
              <p className="text-gray-600">Registered Users</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <h3 className="text-black text-4xl font-bold mb-2">
                {loading ? "..." : stats.totalPosts.toLocaleString()}
              </h3>
              <p className="text-gray-600">Total Items Posted</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-gray-800 to-black text-white py-10 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Finding?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-300">Join FindIt today and connect with your community to help recover lost items and return found belongings.</p>
          <div className="flex flex-row justify-center space-x-4">
            <Link to="/signup" className="bg-white text-black hover:bg-gray-200 px-4 py-3 rounded-lg font-medium transition-colors">
              Create an Account
            </Link>
            <Link to="/login" className="border border-white text-white hover:bg-white hover:bg-opacity-10 px-6 py-3 rounded-lg font-medium transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
    </>
  );
};

export default LandingPage;
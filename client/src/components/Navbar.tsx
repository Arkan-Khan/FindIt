// src/components/Navbar.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react'; 

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-black py-4 shadow-md fixed left-0 right-0 top-0">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Search className="w-6 h-6 text-white" /> {/* Magnifying glass icon */}
            <span className="text-white font-bold text-xl">FindIt</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 ">
            <Link to="/docs" className="text-gray-300 hover:text-white transition-colors font-medium">Docs</Link>
            <Link to="/login" className="text-gray-300 hover:text-white transition-colors font-medium">Login</Link>
            <Link to="/signup" className="bg-gray-300 text-black hover:bg-gray-400 transition-colors px-4 py-2 rounded-lg font-medium">Sign Up</Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-gray-300 focus:outline-none"
            >
              {isOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="mt-4 md:hidden">
            <Link to="/docs" className="block text-gray-300 hover:bg-gray-700 px-3 py-2 rounded-md">Docs</Link>
            <Link to="/login" className="block text-gray-300 hover:bg-gray-700 px-3 py-2 rounded-md">Login</Link>
            <Link to="/signup" className="block text-gray-300 hover:bg-gray-700 px-3 py-2 rounded-md">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

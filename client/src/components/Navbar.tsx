import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { userAtom } from '../recoil/userAtom';
import { useState } from 'react';
import ProfileModal from './ProfileModal';
import UserDropdown from './UserDropdown';
import ImageModal from './ImageModal';
import { UserState } from '../types/user';
import GitHubStars from '../utils/GitHubStars';
import { Search, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useRecoilState<UserState>(userAtom);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  const toggleDropdown = () => setShowDropdown(prev => !prev);
  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);
  const openProfileModal = () => setShowProfileModal(true);
  const closeProfileModal = () => setShowProfileModal(false);
  
  const openImageModal = (e: React.MouseEvent) => {
    // Stop propagation to prevent the dropdown from toggling
    e.stopPropagation();
    if (user?.user.profileImageUrl) {
      setShowImageModal(true);
    }
  };
  
  const closeImageModal = () => {
    setShowImageModal(false);
  };

  return (
    <>
      <nav className="bg-black py-3 shadow-md fixed left-0 right-0 top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Search className="w-6 h-6 text-white" />
              <span className="text-white font-bold text-xl">FindIt</span>
            </Link>

            {/* Desktop */}
            <div className="hidden md:flex items-center space-x-8">
              <GitHubStars repoUrl="https://github.com/Arkan-Khan/FindIt" />

              {!user && pathname !== '/login' && (
                <Link
                  to="/login"
                  className="bg-white text-black px-4 py-1.5 rounded-[10px] font-medium shadow hover:bg-gray-200 transition-all"
                >
                  Login
                </Link>
              )}

              {!user && pathname !== '/signup' && (
                <Link
                  to="/signup"
                  className="bg-white text-black px-4 py-1.5 rounded-[10px] font-medium shadow hover:bg-gray-200 transition-all"
                >
                  Signup
                </Link>
              )}

              {user && (
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden cursor-pointer border-2 border-white"
                    onClick={toggleDropdown}
                  >
                    <img
                      src={user.user.profileImageUrl || '/assets/profilePic.jpg'}
                      alt="User profile"
                      className="w-full h-full object-cover"
                      onClick={openImageModal}
                    />
                  </div>
                  {showDropdown && (
                    <UserDropdown
                      onProfileClick={openProfileModal}
                      onLogoutClick={handleLogout}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Mobile */}
            <div className="flex md:hidden items-center space-x-4">
              <GitHubStars repoUrl="https://github.com/Arkan-Khan/FindIt" />
              {user ? (
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden cursor-pointer border-2 border-white"
                    onClick={toggleDropdown}
                  >
                    <img
                      src={user.user.profileImageUrl || '/assets/profilePic.jpg'}
                      alt="User profile"
                      className="w-full h-full object-cover"
                      onClick={openImageModal}
                    />
                  </div>
                  {showDropdown && (
                    <UserDropdown
                      onProfileClick={openProfileModal}
                      onLogoutClick={handleLogout}
                    />
                  )}
                </div>
              ) : (
                <button onClick={toggleMobileMenu} className="text-white focus:outline-none">
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Slide-down Menu (minimal links) */}
        {!user && mobileMenuOpen && (
          <div className="md:hidden bg-black px-4 pt-4 space-y-2">
            {pathname !== '/login' && (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-white text-base hover:underline"
              >
                Login
              </Link>
            )}
            {pathname !== '/signup' && (
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-white text-base hover:underline"
              >
                Signup
              </Link>
            )}
          </div>
        )}
      </nav>

      {showProfileModal && user && (
        <ProfileModal
          user={user}
          setUser={setUser}
          onClose={closeProfileModal}
        />
      )}
      
      {/* Image Modal */}
      {showImageModal && user?.user.profileImageUrl && (
        <ImageModal 
          imageUrl={user.user.profileImageUrl} 
          altText="User profile" 
          onClose={closeImageModal} 
        />
      )}
    </>
  );
};

export default Navbar;
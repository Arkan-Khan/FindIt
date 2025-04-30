import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { userAtom } from '../recoil/userAtom';
import { useState, useEffect, useRef } from 'react';
import ProfileModal from './ProfileModal';
import UserDropdown from './UserDropdown';
import ImageModal from './ImageModal';
import { UserState } from '../types/user';
import GitHubStars from '../utils/GitHubStars';
import { Search, Menu, X, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useRecoilState<UserState>(userAtom);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = () => {
    setShowDropdown(false);
    setShowProfileModal(false);
    setShowImageModal(false);
 
    setUser(null);
    
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 10);
  };

  const toggleDropdown = () => {
    setShowDropdown(prev => {
      if (!prev) {
        if (dropdownTimerRef.current) {
          clearTimeout(dropdownTimerRef.current);
        }
 
        dropdownTimerRef.current = setTimeout(() => {
          setShowDropdown(false);
        }, 3000);
      } else {
        // If we're closing it, clear the timer
        if (dropdownTimerRef.current) {
          clearTimeout(dropdownTimerRef.current);
          dropdownTimerRef.current = null;
        }
      }
      return !prev;
    });
  };

  useEffect(() => {
    return () => {
      if (dropdownTimerRef.current) {
        clearTimeout(dropdownTimerRef.current);
      }
    };
  }, []);

  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);
  const openProfileModal = () => setShowProfileModal(true);
  const closeProfileModal = () => setShowProfileModal(false);
  
  const openImageModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user?.user?.profileImageUrl) {
      setShowImageModal(true);
    }
  };
  
  const closeImageModal = () => {
    setShowImageModal(false);
  };

  return (
    <>
      <nav className="bg-black py-3 min-h-[64px] shadow-md fixed left-0 right-0 top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Search className="w-6 h-6 text-white" />
              <span className="text-white font-bold text-xl">FindIt</span>
            </Link>

            {/* Main navigation items */}
            <div className="flex items-center space-x-4 md:space-x-8">
              <div className="h-8 flex items-center">
                <GitHubStars repoUrl="https://github.com/Arkan-Khan/FindIt" />
              </div>

              {!user && (
                <>
                  {pathname !== '/login' && (
                    <Link
                      to="/login"
                      className="hidden md:block bg-white text-black px-4 py-1.5 rounded-[10px] font-medium shadow hover:bg-gray-200 transition-all"
                    >
                      Login
                    </Link>
                  )}

                  {pathname !== '/signup' && (
                    <Link
                      to="/signup"
                      className="hidden md:block bg-white text-black px-4 py-1.5 rounded-[10px] font-medium shadow hover:bg-gray-200 transition-all"
                    >
                      Signup
                    </Link>
                  )}
                </>
              )}

              {user && user.user ? (
                <div className="relative flex items-center">
                  <div
                    className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden cursor-pointer border-2 border-white"
                    onClick={openImageModal}
                  >
                    <img
                      src={user.user.profileImageUrl || '/assets/profilePic.jpg'}
                      alt="User profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button 
                    onClick={toggleDropdown}
                    className="ml-2 text-white focus:outline-none p-1 rounded-full hover:bg-gray-800"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={toggleMobileMenu} 
                  className="md:hidden text-white focus:outline-none"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {!user && mobileMenuOpen && (
          <div className="md:hidden bg-black px-4 pt-4 pb-2 space-y-2">
            {pathname !== '/login' && (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-white text-base hover:underline py-2"
              >
                Login
              </Link>
            )}
            {pathname !== '/signup' && (
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-white text-base hover:underline py-2"
              >
                Signup
              </Link>
            )}
          </div>
        )}
      </nav>

      {showDropdown && user && user.user && (
        <div className="fixed top-[64px] right-4 md:right-8 z-50">
          <UserDropdown
            onProfileClick={() => {
              openProfileModal();
              setShowDropdown(false);
            }}
            onLogoutClick={handleLogout}
          />
        </div>
      )}

      {showProfileModal && user && user.user && (
        <ProfileModal
          user={user}
          setUser={setUser}
          onClose={closeProfileModal}
        />
      )}
      
      {showImageModal && user && user.user && user.user.profileImageUrl && (
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
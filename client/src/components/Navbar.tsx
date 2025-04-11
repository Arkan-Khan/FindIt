import { Link } from 'react-router-dom';
import { Search } from 'lucide-react'; 

const Navbar: React.FC = () => {

  return (
    <nav className="bg-black py-4 shadow-md fixed left-0 right-0 top-0">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Search className="w-6 h-6 text-white" />
            <span className="text-white font-bold text-xl">FindIt</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8 ">
            <Link to="/docs" className="text-gray-300 hover:text-white transition-colors font-medium">Docs</Link>
            <Link to="/login" className="text-gray-300 hover:text-white transition-colors font-medium">Login</Link>
            <Link to="/signup" className="bg-gray-300 text-black hover:bg-gray-400 transition-colors px-4 py-2 rounded-lg font-medium">Sign Up</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

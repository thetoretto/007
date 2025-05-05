import { Link } from 'react-router-dom';
import { Bus, Home, User, LogIn } from 'lucide-react';

export const AppNavbar = () => (
  <nav className="bg-white shadow-sm py-3">
    <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2 text-primary-600 hover:text-primary-700">
        <Bus className="h-6 w-6" />
        <span className="text-xl font-bold">RideBooker</span>
      </Link>
      
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-1 hover:text-primary-600">
          <Home className="h-5 w-5" />
          Home
        </Link>
        
        <div className="relative group">
          <button className="flex items-center gap-1 hover:text-primary-600">
            <User className="h-5 w-5" />
            Account
          </button>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 
                        invisible group-hover:visible transition-all opacity-0 group-hover:opacity-100">
            <Link to="/login" className="flex items-center px-4 py-2 hover:bg-gray-100">
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Link>
            {/* Add more dropdown items */}
          </div>
        </div>
      </div>
    </div>
  </nav>
);
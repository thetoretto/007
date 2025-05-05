import { Link } from 'react-router-dom';
import { Bus, Home } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown'; // Import the new component

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
        
        {/* Replace existing account section with ProfileDropdown */}
        <ProfileDropdown />
      </div>
    </div>
  </nav>
);
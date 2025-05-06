import { Link } from 'react-router-dom';
import { Bus, Home } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown'; // Import the new component

export const AppNavbar = () => (
  // Updated: Added border-b, adjusted padding, background to white
  <nav className="bg-white border-b border-gray-200">
    {/* Updated: Increased max-width, adjusted padding */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
      {/* Updated: Adjusted text size/color for logo */}
      <Link to="/" className="flex items-center gap-2 text-gray-900 hover:text-primary-600 transition-colors">
        <Bus className="h-7 w-7 text-primary-600" />
        <span className="text-xl font-semibold">RideBooker</span>
      </Link>
      
      {/* Updated: Adjusted gap, text size/color for nav links */}
      <div className="flex items-center gap-6 sm:gap-8">
        <Link to="/" className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
          <Home className="h-5 w-5" />
          Home
        </Link>
        
        {/* ProfileDropdown remains */}
        <ProfileDropdown />
      </div>
    </div>
  </nav>
);
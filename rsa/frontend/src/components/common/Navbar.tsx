import '../../index.css';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { Menu, X, Bus } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';

const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    // Updated: Added border-b, adjusted padding, background to white
    <nav className="bg-white border-b border-gray-200">
      {/* Updated: Increased max-width, adjusted padding */}
      <div className="container-app">
        {/* Updated: Adjusted height */}
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              {/* Updated: Adjusted logo size and text */}
              <Link to="/" className="flex items-center gap-2 text-gray-900 transition-colors">
                <Bus className="icon-xl text-primary-600" />
                <span className="text-xl font-semibold">RideBooker</span>
              </Link>
            </div>
            {/* Updated: Adjusted spacing and link styling */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-6 lg:space-x-8">
              <Link to="/" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-600 hover:text-primary-600 hover:border-primary-300 transition-colors">
                Home
              </Link>
              <Link to="/book" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-600 hover:text-primary-600 hover:border-primary-300 transition-colors">
                Book a Ride
              </Link>
              {user && (
                <>
                  {user.role === 'passenger' && (
                    <Link to="/passenger/trips" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-600 hover:text-primary-600 hover:border-primary-300 transition-colors">
                      My Trips
                    </Link>
                  )}
                  {user.role === 'driver' && (
                    <Link to="/driver/dashboard" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-600 hover:text-primary-600 hover:border-primary-300 transition-colors">
                      Driver Portal
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin/dashboard" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-600 hover:text-primary-600 hover:border-primary-300 transition-colors">
                      Admin Panel
                    </Link>
                  )}
                </>
              )}
              <Link to="/contact" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-600 hover:text-primary-600 hover:border-primary-300 transition-colors">
                Contact
              </Link>
              {/* Consider removing or hiding Components link in production */}
              <Link to="/components" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-600 hover:text-primary-600 hover:border-primary-300 transition-colors">
                Components
              </Link>
            </div>
          </div>
          {/* ProfileDropdown remains */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <ProfileDropdown />
          </div>
          {/* Mobile menu button styling */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              aria-expanded="false"
              onClick={toggleMenu}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu styling */}
      {isMenuOpen && (
        <div className="sm:hidden border-t border-gray-200">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link
              to="/book"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              onClick={toggleMenu}
            >
              Book a Ride
            </Link>
            {user && (
              <>
                {user.role === 'passenger' && (
                  <Link
                    to="/passenger/trips"
                    className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                    onClick={toggleMenu}
                  >
                    My Trips
                  </Link>
                )}
                {user.role === 'driver' && (
                  <Link
                    to="/driver/dashboard"
                    className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                    onClick={toggleMenu}
                  >
                    Driver Portal
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                    onClick={toggleMenu}
                  >
                    Admin Panel
                  </Link>
                )}
              </>
            )}
            <Link
              to="/contact"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              onClick={toggleMenu}
            >
              Contact
            </Link>
          </div>
          {/* Mobile Profile Section - Add ProfileDropdown here */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-4">
              <ProfileDropdown />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
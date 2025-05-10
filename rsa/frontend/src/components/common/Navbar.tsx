import '../../index.css';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { Menu, X, Bus } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import ThemeToggle from './ThemeToggle'; // Import the ThemeToggle component

const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar-main">
      <div className="navbar-container">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="navbar-logo-link">
                <Bus className="icon-xl text-primary dark:text-primary-200" /> {/* Adjusted icon color for dark mode compatibility with navbar-logo-link */}
                <span className="navbar-logo-text">RideBooker</span>
              </Link>
            </div>
            <div className="navbar-links-desktop">
              <Link to="/" className="navbar-link">
                Home
              </Link>
              <Link to="/book" className="navbar-link">
                Book a Ride
              </Link>
              {user && (
                <>
                  {user.role === 'passenger' && (
                    <Link to="/passenger/trips" className="navbar-link">
                      My Trips
                    </Link>
                  )}
                  {user.role === 'driver' && (
                    <Link to="/driver/dashboard" className="navbar-link">
                      Driver Portal
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin/dashboard" className="navbar-link">
                      Admin Panel
                    </Link>
                  )}
                </>
              )}
              <Link to="/contact" className="navbar-link">
                Contact
              </Link>
              {/* Consider removing or hiding Components link in production */}
              <Link to="/components" className="navbar-link">
                Components
              </Link>
            </div>
          </div>
          {/* ProfileDropdown remains */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <ThemeToggle /> {/* Add ThemeToggle here */}
            <ProfileDropdown />
          </div>
          {/* Mobile menu button styling */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              className="navbar-mobile-menu-button"
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
      {/* </div> */}

      {/* Mobile menu styling */}
      {isMenuOpen && (
        <div className="navbar-mobile-menu">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="navbar-mobile-link"
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link
              to="/book"
              className="navbar-mobile-link"
              onClick={toggleMenu}
            >
              Book a Ride
            </Link>
            {user && (
              <>
                {user.role === 'passenger' && (
                  <Link
                    to="/passenger/trips"
                    className="navbar-mobile-link"
                    onClick={toggleMenu}
                  >
                    My Trips
                  </Link>
                )}
                {user.role === 'driver' && (
                  <Link
                    to="/driver/dashboard"
                    className="navbar-mobile-link"
                    onClick={toggleMenu}
                  >
                    Driver Portal
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className="navbar-mobile-link"
                    onClick={toggleMenu}
                  >
                    Admin Panel
                  </Link>
                )}
              </>
            )}
            <Link
              to="/contact"
              className="navbar-mobile-link"
              onClick={toggleMenu}
            >
              Contact
            </Link>
          </div>
          {/* Mobile Profile Section - Add ProfileDropdown here */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4 mb-2">
              <ThemeToggle /> {/* Add ThemeToggle here for mobile view */}
            </div>
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
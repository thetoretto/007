import '../../index.css';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { Menu, X, Bus, ChevronDown } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import ThemeToggle from './ThemeToggle';

const Navbar: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scrolling effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close menu when location changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Check if a path is active (exact match or starts with)
  const isActive = (path: string) => {
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path));
  };

  return (
    <nav className={`sticky top-0 z-40 w-full bg-background-light dark:bg-section-dark border-b border-primary-100 dark:border-primary-800 transition-all duration-300 ${
      scrolled ? 'shadow-md' : 'shadow-sm'
    }`}>
      <div className="container-app mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Bus className="icon-xl text-primary dark:text-primary-200" />
              <span className="text-lg font-semibold text-text-base dark:text-text-inverse transition-colors duration-200">RideBooker</span>
              </Link>
            </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:justify-between md:flex-1">
            <div className="flex items-center space-x-1 lg:space-x-4 ml-6">
              <Link 
                to="/" 
                className={`px-3 py-2 text-sm lg:text-base rounded-md text-text-base hover:text-primary dark:text-text-inverse dark:hover:text-primary-200 border-b-2 ${
                  isActive('/') 
                    ? 'border-primary dark:border-primary-200 font-medium' 
                    : 'border-transparent'
                } transition-all duration-200`}
              >
                Home
              </Link>
              <Link 
                to="/book" 
                className={`px-3 py-2 text-sm lg:text-base rounded-md text-text-base hover:text-primary dark:text-text-inverse dark:hover:text-primary-200 border-b-2 ${
                  isActive('/book') 
                    ? 'border-primary dark:border-primary-200 font-medium' 
                    : 'border-transparent'
                } transition-all duration-200`}
              >
                Book a Ride
              </Link>
              <Link 
                to="/passenger/demo" 
                className={`px-3 py-2 text-sm lg:text-base rounded-md text-text-base hover:text-primary dark:text-text-inverse dark:hover:text-primary-200 border-b-2 ${
                  isActive('/passenger/demo') 
                    ? 'border-primary dark:border-primary-200 font-medium' 
                    : 'border-transparent'
                } transition-all duration-200`}
              >
                Demo Features
              </Link>
              {user && (
                <>
                  {user.role === 'passenger' && (
                    <Link 
                      to="/passenger/trips" 
                      className={`px-3 py-2 text-sm lg:text-base rounded-md text-text-base hover:text-primary dark:text-text-inverse dark:hover:text-primary-200 border-b-2 ${
                        isActive('/passenger/trips') 
                          ? 'border-primary dark:border-primary-200 font-medium' 
                          : 'border-transparent'
                      } transition-all duration-200`}
                    >
                      My Trips
                    </Link>
                  )}
                  {user.role === 'driver' && (
                    <Link 
                      to="/driver/dashboard" 
                      className={`px-3 py-2 text-sm lg:text-base rounded-md text-text-base hover:text-primary dark:text-text-inverse dark:hover:text-primary-200 border-b-2 ${
                        isActive('/driver/dashboard') 
                          ? 'border-primary dark:border-primary-200 font-medium' 
                          : 'border-transparent'
                      } transition-all duration-200`}
                    >
                      Driver Portal
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link 
                      to="/admin/dashboard" 
                      className={`px-3 py-2 text-sm lg:text-base rounded-md text-text-base hover:text-primary dark:text-text-inverse dark:hover:text-primary-200 border-b-2 ${
                        isActive('/admin/dashboard') 
                          ? 'border-primary dark:border-primary-200 font-medium' 
                          : 'border-transparent'
                      } transition-all duration-200`}
                    >
                      Admin Panel
                    </Link>
                  )}
                </>
              )}
              <Link 
                to="/contact" 
                className={`px-3 py-2 text-sm lg:text-base rounded-md text-text-base hover:text-primary dark:text-text-inverse dark:hover:text-primary-200 border-b-2 ${
                  isActive('/contact') 
                    ? 'border-primary dark:border-primary-200 font-medium' 
                    : 'border-transparent'
                } transition-all duration-200`}
              >
                Contact
              </Link>
            </div>
            
            {/* Desktop Right Side */}
            <div className="flex items-center space-x-4">
              <ThemeToggle size="md" showLabel={false} className="mr-1" />
              <ProfileDropdown />
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center space-x-3 md:hidden">
            <ThemeToggle size="sm" showLabel={false} />
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-text-base hover:text-primary hover:bg-section-light dark:text-text-inverse dark:hover:text-primary-200 dark:hover:bg-primary-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary dark:focus:ring-primary-200 transition-colors duration-200"
              aria-expanded={isMenuOpen ? 'true' : 'false'}
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

      {/* Mobile menu, show/hide based on menu state */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background-light dark:bg-section-dark border-b border-primary-100 dark:border-primary-800">
            <Link
              to="/"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/') 
                ? 'text-primary dark:text-primary-200 bg-section-light dark:bg-primary-900' 
                : 'text-text-base dark:text-text-inverse hover:bg-section-light hover:text-primary dark:hover:bg-primary-900 dark:hover:text-primary-200'
            } transition-colors duration-200`}
            >
              Home
            </Link>
            <Link
              to="/book"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/book') 
                ? 'text-primary dark:text-primary-200 bg-section-light dark:bg-primary-900' 
                : 'text-text-base dark:text-text-inverse hover:bg-section-light hover:text-primary dark:hover:bg-primary-900 dark:hover:text-primary-200'
            } transition-colors duration-200`}
            >
              Book a Ride
            </Link>
          <Link
            to="/passenger/demo"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/passenger/demo') 
                ? 'text-primary dark:text-primary-200 bg-section-light dark:bg-primary-900' 
                : 'text-text-base dark:text-text-inverse hover:bg-section-light hover:text-primary dark:hover:bg-primary-900 dark:hover:text-primary-200'
            } transition-colors duration-200`}
          >
            Demo Features
          </Link>
            {user && (
              <>
                {user.role === 'passenger' && (
                  <Link
                    to="/passenger/trips"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/passenger/trips') 
                      ? 'text-primary dark:text-primary-200 bg-section-light dark:bg-primary-900' 
                      : 'text-text-base dark:text-text-inverse hover:bg-section-light hover:text-primary dark:hover:bg-primary-900 dark:hover:text-primary-200'
                  } transition-colors duration-200`}
                  >
                    My Trips
                  </Link>
                )}
                {user.role === 'driver' && (
                  <Link
                    to="/driver/dashboard"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/driver/dashboard') 
                      ? 'text-primary dark:text-primary-200 bg-section-light dark:bg-primary-900' 
                      : 'text-text-base dark:text-text-inverse hover:bg-section-light hover:text-primary dark:hover:bg-primary-900 dark:hover:text-primary-200'
                  } transition-colors duration-200`}
                  >
                    Driver Portal
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/admin/dashboard') 
                      ? 'text-primary dark:text-primary-200 bg-section-light dark:bg-primary-900' 
                      : 'text-text-base dark:text-text-inverse hover:bg-section-light hover:text-primary dark:hover:bg-primary-900 dark:hover:text-primary-200'
                  } transition-colors duration-200`}
                  >
                    Admin Panel
                  </Link>
                )}
              </>
            )}
            <Link
              to="/contact"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/contact') 
                ? 'text-primary dark:text-primary-200 bg-section-light dark:bg-primary-900' 
                : 'text-text-base dark:text-text-inverse hover:bg-section-light hover:text-primary dark:hover:bg-primary-900 dark:hover:text-primary-200'
            } transition-colors duration-200`}
            >
              Contact
            </Link>
          </div>
        
        {/* Mobile profile section */}
        <div className="pt-4 pb-3 border-t border-primary-100 dark:border-primary-800 bg-background-light dark:bg-section-dark">
            <div className="px-4">
              <ProfileDropdown />
            </div>
          </div>
        </div>
    </nav>
  );
};

export default Navbar;
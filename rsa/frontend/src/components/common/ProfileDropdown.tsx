import '../../index.css';
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { ChevronDown, User, LogOut, LogIn, UserPlus } from 'lucide-react';

interface ProfileDropdownProps {
  className?: string;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ className = '' }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  // Handle scrolling effect for styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get initials for avatar placeholder
  const getInitials = (firstName: string, lastName: string) => {
    return (firstName?.[0] || '') + (lastName?.[0] || '');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {user ? (
        // Logged-in user view
        <button
          type="button"
          className={`flex items-center text-sm rounded-full focus:outline-none ${
            scrolled 
              ? 'text-gray-700 dark:text-gray-300' 
              : 'text-white dark:text-white'
          }`}
          onClick={toggleDropdown}
        >
          {/* User Avatar - we'll use initials since there's no avatar property */}
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
            scrolled 
              ? 'bg-primary-100 text-primary-800 dark:bg-primary-800 dark:text-primary-100' 
              : 'bg-white/20 text-white dark:bg-gray-800/50'
          }`}>
            <span className="font-medium text-sm">
              {getInitials(user.firstName, user.lastName)}
            </span>
          </div>
          <span className={`ml-2 hidden sm:inline transition-colors duration-200 ${
            scrolled 
              ? 'text-gray-700 dark:text-gray-300' 
              : 'text-white dark:text-gray-200'
          }`}>
            {user.firstName}
          </span>
          <ChevronDown className={`ml-1 h-4 w-4 hidden sm:inline transition-colors duration-200 ${
            scrolled 
              ? 'text-gray-500 dark:text-gray-400' 
              : 'text-gray-200 dark:text-gray-400'
          }`} />
        </button>
      ) : (
        // Logged-out user view
        <button
          type="button"
          className={`flex items-center gap-1 transition-colors duration-200 ${
            scrolled 
              ? 'text-gray-700 hover:text-primary-800 dark:text-gray-300 dark:hover:text-primary-200' 
              : 'text-white hover:text-white/80 dark:text-gray-200 dark:hover:text-white'
          }`}
          onClick={toggleDropdown}
        >
          <User className="h-5 w-5" />
          <span className="hidden sm:inline">Account</span>
          <ChevronDown className="ml-1 h-4 w-4 hidden sm:inline" />
        </button>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-20"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-button"
        >
          {user ? (
            // Dropdown items for logged-in user
            <>
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
              </div>
              <Link
                to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'driver' ? '/driver/dashboard' : '/passenger/dashboard'}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-primary-200"
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                My Dashboard
              </Link>
              <Link
                to="/profile"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-primary-200"
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                <User className="mr-2 h-4 w-4" />
                Your Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-primary-200"
                role="menuitem"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </button>
            </>
          ) : (
            // Dropdown items for logged-out user
            <>
              <Link
                to="/login"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-primary-200"
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
              <Link
                to="/register"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-primary-200"
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
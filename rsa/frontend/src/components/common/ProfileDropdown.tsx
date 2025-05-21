import '../../index.css';
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { ChevronDown, User, LogOut, LogIn, UserPlus } from 'lucide-react';

const ProfileDropdown: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  const toggleDropdown = () => {
    console.log('ProfileDropdown: toggleDropdown called. Current isOpen:', isOpen);
    setIsOpen(!isOpen);
    console.log('ProfileDropdown: new isOpen state:', !isOpen);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        console.log('ProfileDropdown: Clicked outside, closing dropdown.');
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  console.log('ProfileDropdown: Rendering, isOpen:', isOpen, 'User:', user);

  return (
    <div className="relative" ref={dropdownRef}>
      {user ? (
        // Logged-in user view
        <button
          type="button"
          className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary-200 dark:focus:ring-offset-background-dark"
          onClick={toggleDropdown}
        >
          {user.avatar ? (
            <img
              className="h-8 w-8 rounded-full"
              src={user.avatar}
              alt={`${user.firstName} ${user.lastName}`}
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
              <span className="text-primary-800 dark:text-primary-100 font-medium text-sm">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </span>
            </div>
          )}
          <span className="ml-2 hidden sm:inline text-text-base hover:text-primary dark:text-text-inverse dark:hover:text-primary-200">{user.firstName}</span>
          <ChevronDown className="ml-1 h-4 w-4 text-text-muted dark:text-text-inverse hidden sm:inline" />
        </button>
      ) : (
        // Logged-out user view
        <button
          type="button"
          className="flex items-center gap-1 text-text-base hover:text-primary dark:text-text-inverse dark:hover:text-primary-200"
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
          className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 card ring-1 ring-black ring-opacity-5 focus:outline-none z-20"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-button"
        >
          {user ? (
            // Dropdown items for logged-in user
            <>
              <div className="px-4 py-2 border-b border-gray-100 dark:border-primary-800">
                <p className="text-sm font-medium text-text-base dark:text-text-inverse truncate">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-text-muted dark:text-primary-200 truncate">{user.email}</p>
              </div>
              <Link
                to="/profile"
                className="flex items-center px-4 py-2 text-sm text-text-base hover:bg-section-light hover:text-primary dark:text-text-inverse dark:hover:bg-primary-900 dark:hover:text-primary-200"
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                <User className="mr-2 h-4 w-4" />
                Your Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-text-base hover:bg-section-light hover:text-primary dark:text-text-inverse dark:hover:bg-primary-900 dark:hover:text-primary-200"
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
                className="flex items-center px-4 py-2 text-sm text-text-base hover:bg-section-light hover:text-primary dark:text-text-inverse dark:hover:bg-primary-900 dark:hover:text-primary-200"
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
              <Link
                to="/register"
                className="flex items-center px-4 py-2 text-sm text-text-base hover:bg-section-light hover:text-primary dark:text-text-inverse dark:hover:bg-primary-900 dark:hover:text-primary-200"
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
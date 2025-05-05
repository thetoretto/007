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
    setIsOpen(!isOpen);
  };

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

  return (
    <div className="relative" ref={dropdownRef}>
      {user ? (
        // Logged-in user view
        <button
          type="button"
          className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          onClick={toggleDropdown}
        >
          {user.avatar ? (
            <img
              className="h-8 w-8 rounded-full"
              src={user.avatar}
              alt={`${user.firstName} ${user.lastName}`}
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-800 font-medium text-sm">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </span>
            </div>
          )}
          <span className="ml-2 hidden sm:inline text-gray-700 hover:text-primary-600">{user.firstName}</span>
          <ChevronDown className="ml-1 h-4 w-4 text-gray-500 hidden sm:inline" />
        </button>
      ) : (
        // Logged-out user view
        <button
          type="button"
          className="flex items-center gap-1 text-gray-500 hover:text-primary-600"
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
          className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-button"
        >
          {user ? (
            // Dropdown items for logged-in user
            <>
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900 truncate">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <Link
                to="/profile"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                <User className="mr-2 h-4 w-4" />
                Your Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
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
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
              <Link
                to="/register"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
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
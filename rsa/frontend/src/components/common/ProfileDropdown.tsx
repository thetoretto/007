import '../../index.css';
import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TransitionContext } from '../../context/TransitionContext';
import useAuthStore from '../../store/authStore';
import { ChevronDown, User as UserIcon, LogOut, LogIn, UserPlus, LayoutDashboard } from 'lucide-react';

interface ProfileDropdownProps {
  className?: string;
  // isMobile?: boolean; // Consider if specific mobile styling needed beyond responsive classes
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ className = '' }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { startPageTransition, isPending } = useContext(TransitionContext);
  // const isNavbarTransparent = location.pathname === '/'; // Removed
  // const [scrolled, setScrolled] = useState(window.scrollY > 20); // Removed

  // useEffect(() => { // Removed scroll effect
  //   const handleScroll = () => {
  //     setScrolled(window.scrollY > 20);
  //   };
  //   window.addEventListener('scroll', handleScroll);
  //   return () => window.removeEventListener('scroll', handleScroll);
  // }, []);

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    startPageTransition(() => {
      navigate(path);
    });
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    startPageTransition(() => {
      navigate('/login');
    });
  };

  const toggleDropdown = () => setIsOpen(!isOpen);

  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';
  };
  
  const textColorClass = 'text-text-light-primary dark:text-text-dark-primary';
  const avatarBgColorClass = 'bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200';
  const chevronColorClass = 'text-text-light-secondary dark:text-text-dark-secondary';

  const menuItemClass = "flex items-center w-full px-4 py-2.5 text-sm text-text-light-primary dark:text-text-dark-primary hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300";
  const iconClass = "mr-2.5 h-5 w-5 text-primary-600 dark:text-primary-400";

  return (
    <div className={`relative group  ${className}`} ref={dropdownRef}>
      {user ? (
        <button
          type="button"
          className={`flex items-center text-sm rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800 p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300`}
          onClick={toggleDropdown}
          aria-expanded={isOpen}
          aria-haspopup="true"
          data-testid="profile-dropdown-button-user"
        >
          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${avatarBgColorClass} transition-colors duration-300 border-2 border-primary-200 dark:border-primary-700`}>
            {getInitials(user.firstName, user.lastName)}
          </div>
          <span className={`ml-2 hidden md:inline ${textColorClass} transition-colors duration-300 font-medium`}>
            {user.firstName}
          </span>
          <ChevronDown className={`ml-1 h-4 w-4 hidden md:inline ${chevronColorClass} transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      ) : (
        <button
          type="button"
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg ${textColorClass} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 border border-gray-300 dark:border-gray-600`}
          onClick={toggleDropdown}
          aria-expanded={isOpen}
          aria-haspopup="true"
          data-testid="profile-dropdown-button-guest"
        >
          <UserIcon className={`h-5 w-5 ${textColorClass}`} />
          <span className="hidden sm:inline font-medium">Account</span>
          <ChevronDown className={`ml-0.5 h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      )}

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-56 rounded-lg bg-white dark:bg-gray-800 shadow-xl py-2 border border-gray-200 dark:border-gray-700 focus:outline-none z-50 transition-all duration-300"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-button"
          data-testid="profile-dropdown-menu"
        >
          {user ? (
            <>
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 mb-1">
                <p className="text-sm font-semibold text-text-light-primary dark:text-text-dark-primary truncate transition-colors duration-300" title={user.email}>{user.firstName} {user.lastName}</p>
                <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary truncate transition-colors duration-300">{user.email}</p>
              </div>
              <a 
                href="#" 
                className={menuItemClass} 
                role="menuitem" 
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation(user.role === 'admin' ? '/admin/dashboard' : user.role === 'driver' ? '/driver/dashboard' : '/passenger/dashboard');
                }} 
                data-testid="dashboard-link"
              >
                <LayoutDashboard className={iconClass} /> My Dashboard
              </a>
              <a 
                href="#" 
                className={menuItemClass} 
                role="menuitem" 
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation('/profile');
                }} 
                data-testid="profile-link"
              >
                <UserIcon className={iconClass} /> Your Profile
              </a>
              <button onClick={handleLogout} className={`${menuItemClass} text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20`} role="menuitem" data-testid="logout-button">
                <LogOut className={`mr-2.5 h-5 w-5 text-red-600 dark:text-red-400`} /> Sign out
              </button>
            </>
          ) : (
            <>
              <a 
                href="#" 
                className={menuItemClass} 
                role="menuitem" 
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation('/login');
                }} 
                data-testid="login-link"
              >
                <LogIn className={iconClass} /> Login
              </a>
              <a 
                href="#" 
                className={menuItemClass} 
                role="menuitem" 
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation('/register');
                }} 
                data-testid="register-link"
              >
                <UserPlus className={iconClass} /> Sign Up
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
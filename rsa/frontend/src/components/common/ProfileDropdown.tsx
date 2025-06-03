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
  
  const textColorClass = 'text-text-base dark:text-text-inverse'; 
  const avatarBgColorClass = 'bg-primary-soft text-primary dark:bg-primary-700 dark:text-primary-100';
  const chevronColorClass = 'text-text-muted dark:text-text-muted-dark';


  const menuItemClass = "flex items-center w-full px-4 py-2.5 text-sm text-text-base dark:text-text-inverse hover:bg-base-200 dark:hover:bg-section-medium transition-colors duration-150";
  const iconClass = "mr-2.5 h-5 w-5 text-primary dark:text-primary-300";

  return (
    <div className={`relative group  ${className}`} ref={dropdownRef}>
      {user ? (
        <button
          type="button"
          className={`flex items-center text-sm rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-base-300 p-0.5 hover:bg-base-200 dark:hover:bg-section-medium transition-colors duration-150`}
          onClick={toggleDropdown}
          aria-expanded={isOpen}
          aria-haspopup="true"
          data-testid="profile-dropdown-button-user"
        >
          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${avatarBgColorClass} transition-colors duration-150`}>
            {getInitials(user.firstName, user.lastName)}
          </div>
          <span className={`ml-2 hidden md:inline ${textColorClass} transition-colors duration-150`}>
            {user.firstName}
          </span>
          <ChevronDown className={`ml-1 h-4 w-4 hidden md:inline ${chevronColorClass} transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      ) : (
        <button
          type="button"
          className={`btn btn-ghost btn-sm flex items-center gap-1.5 ${textColorClass} hover:bg-base-200 dark:hover:bg-section-medium transition-colors duration-150 px-2 sm:px-3`}
          onClick={toggleDropdown}
          aria-expanded={isOpen}
          aria-haspopup="true"
          data-testid="profile-dropdown-button-guest"
        >
          <UserIcon className={`h-5 w-5 ${textColorClass}`} />
          <span className="hidden sm:inline">Account</span>
          <ChevronDown className={`ml-0.5 h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      )}

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-56 rounded-lg shadow-xl py-1.5 ring-1 ring-black/5 dark:ring-white/10 focus:outline-none z-50 animate-fadeInUpSm"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-button"
          data-testid="profile-dropdown-menu"
        >
          {user ? (
            <>
              <div className="px-4 py-2.5 border-b border-border dark:border-border-dark mb-1">
                <p className="text-sm font-semibold text-text-base dark:text-text-inverse truncate" title={user.email}>{user.firstName} {user.lastName}</p>
                <p className="text-xs text-text-muted dark:text-text-muted-dark truncate">{user.email}</p>
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
              <button onClick={handleLogout} className={`${menuItemClass} text-error dark:text-error`} role="menuitem" data-testid="logout-button">
                <LogOut className={`${iconClass} text-error dark:text-error`} /> Sign out
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
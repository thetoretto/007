import '../../index.css';
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  const isNavbarTransparent = location.pathname === '/'; // Example: Navbar is transparent only on homepage
  const [scrolled, setScrolled] = useState(window.scrollY > 20);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
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
  
  // Determine text color based on navbar state (transparent on home, scrolled, or other pages)
  let textColorClass = 'text-text-base dark:text-text-inverse'; // Default for solid navbar
  if (isNavbarTransparent && !scrolled) {
    textColorClass = 'text-white group-hover:text-opacity-80'; // For transparent navbar (e.g. homepage top)
  }
  let avatarBgColorClass = scrolled || !isNavbarTransparent 
    ? 'bg-primary-soft text-primary dark:bg-primary-700 dark:text-primary-100' 
    : 'bg-white/20 text-white';
  let chevronColorClass = scrolled || !isNavbarTransparent 
    ? 'text-text-muted dark:text-text-muted-dark' 
    : 'text-white/70 group-hover:text-white';


  const menuItemClass = "flex items-center w-full px-4 py-2.5 text-sm text-text-base dark:text-text-inverse hover:bg-base-200 dark:hover:bg-section-medium transition-colors duration-150";
  const iconClass = "mr-2.5 h-5 w-5 text-primary dark:text-primary-300";

  return (
    <div className={`relative group ${className}`} ref={dropdownRef}>
      {user ? (
        <button
          type="button"
          className={`flex items-center text-sm rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-base-300 p-0.5 ${isNavbarTransparent && !scrolled ? 'hover:bg-white/10' : 'hover:bg-base-200 dark:hover:bg-section-medium'} transition-colors duration-150`}
          onClick={toggleDropdown}
          aria-expanded={isOpen}
          aria-haspopup="true"
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
          className={`btn btn-ghost btn-sm flex items-center gap-1.5 ${textColorClass} ${isNavbarTransparent && !scrolled ? 'hover:bg-white/10' : 'hover:bg-base-200 dark:hover:bg-section-medium'} transition-colors duration-150 px-2 sm:px-3`}
          onClick={toggleDropdown}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <UserIcon className={`h-5 w-5 ${textColorClass}`} />
          <span className="hidden sm:inline">Account</span>
          <ChevronDown className={`ml-0.5 h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      )}

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-56 rounded-lg shadow-xl py-1.5 bg-base-100 dark:bg-section-dark ring-1 ring-black/5 dark:ring-white/10 focus:outline-none z-30 animate-fadeInUpSm"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-button"
        >
          {user ? (
            <>
              <div className="px-4 py-2.5 border-b border-border dark:border-border-dark mb-1">
                <p className="text-sm font-semibold text-text-base dark:text-text-inverse truncate" title={user.email}>{user.firstName} {user.lastName}</p>
                <p className="text-xs text-text-muted dark:text-text-muted-dark truncate">{user.email}</p>
              </div>
              <Link to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'driver' ? '/driver/dashboard' : '/passenger/dashboard'} className={menuItemClass} role="menuitem" onClick={() => setIsOpen(false)}>
                <LayoutDashboard className={iconClass} /> My Dashboard
              </Link>
              <Link to="/profile" className={menuItemClass} role="menuitem" onClick={() => setIsOpen(false)}>
                <UserIcon className={iconClass} /> Your Profile
              </Link>
              <button onClick={handleLogout} className={`${menuItemClass} text-error dark:text-error`} role="menuitem">
                <LogOut className={`${iconClass} text-error dark:text-error`} /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={menuItemClass} role="menuitem" onClick={() => setIsOpen(false)}>
                <LogIn className={iconClass} /> Login
              </Link>
              <Link to="/register" className={menuItemClass} role="menuitem" onClick={() => setIsOpen(false)}>
                <UserPlus className={iconClass} /> Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
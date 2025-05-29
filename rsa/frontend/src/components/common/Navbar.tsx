import '../../index.css';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { Menu, X, Bus, Home, BookOpen, Phone, User } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import ThemeToggle from './ThemeToggle';

interface NavItem {
  path: string;
  label: string;
  icon?: React.ReactNode;
  roles?: string[];
  isButton?: boolean;
}

const Navbar: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Simplified navigation items
  const navItems: NavItem[] = [
    { path: '/', label: 'Home' },
    { path: '/book', label: 'Book a Ride' },
    { path: '/contact', label: 'Contact' },
  ];

  // User-specific items that will be in profile dropdown
  const userNavItems: NavItem[] = [
    { 
      path: '/passenger/dashboard', 
      label: 'Dashboard', 
      roles: ['passenger'],
      icon: <User className="h-4 w-4" />
    },
    { 
      path: '/driver/dashboard', 
      label: 'Driver Portal', 
      roles: ['driver'],
      icon: <User className="h-4 w-4" />
    },
    { 
      path: '/admin/dashboard', 
      label: 'Admin Panel', 
      roles: ['admin'],
      icon: <User className="h-4 w-4" />
    }
  ];

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

  // Check if a path is active (exact match or starts with)
  const isActive = (path: string) => {
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path));
  };

  // Filter nav items based on user role
  const filteredUserNavItems = userNavItems.filter(item => {
    if (!item.roles) return true;
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-40 w-full transition-all duration-300 backdrop-blur-md ${
        scrolled 
          ? 'bg-white/90 dark:bg-gray-900/90 shadow-md' 
          : 'bg-transparent dark:bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <Bus className={`h-6 w-6 ${
                scrolled ? 'text-primary-800 dark:text-primary-200' : 'text-white dark:text-white'
              }`} />
              <span className={`text-lg font-semibold transition-colors duration-200 ${
                scrolled ? 'text-primary-900 dark:text-white' : 'text-white'
              }`}>
                RideBooker
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path} 
                className={`px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? scrolled 
                      ? 'text-primary-800 dark:text-primary-200 border-b-2 border-primary-800 dark:border-primary-200' 
                      : 'text-white dark:text-white border-b-2 border-white'
                    : scrolled
                      ? 'text-gray-700 dark:text-gray-300 hover:text-primary-800 dark:hover:text-primary-200' 
                      : 'text-gray-200 hover:text-white dark:text-gray-300 dark:hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          {/* Desktop Right Side */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <ThemeToggle 
              size="sm" 
              showLabel={false} 
              className={scrolled ? '' : 'bg-white/10 text-white hover:bg-white/20 dark:bg-gray-900/30 dark:hover:bg-gray-900/50'} 
            />
            <ProfileDropdown />
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center space-x-4 md:hidden">
            <ThemeToggle 
              size="sm" 
              showLabel={false} 
              className={scrolled ? '' : 'bg-white/10 text-white hover:bg-white/20 dark:bg-gray-900/30 dark:hover:bg-gray-900/50'} 
            />
            <button
              type="button"
              className={`inline-flex items-center justify-center p-2 rounded-md ${
                scrolled 
                  ? 'text-gray-700 hover:text-primary-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-primary-200 dark:hover:bg-gray-800' 
                  : 'text-white hover:text-white hover:bg-white/10 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800/20'
              } focus:outline-none`}
              aria-expanded={isMenuOpen ? 'true' : 'false'}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
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

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive(item.path) 
                ? 'text-primary-800 dark:text-primary-200 bg-gray-100 dark:bg-gray-800' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 hover:text-primary-800 dark:hover:bg-gray-800 dark:hover:text-primary-200'
              } transition-colors duration-200`}
            >
              {item.label}
            </Link>
          ))}
          
          {filteredUserNavItems.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
              {filteredUserNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 hover:text-primary-800 dark:hover:bg-gray-800 dark:hover:text-primary-200 transition-colors duration-200"
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
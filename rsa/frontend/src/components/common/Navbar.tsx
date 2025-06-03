import '../../index.css';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import { Menu, X, Bus, BarChart2, Users, Clock, Settings, ChevronDown, LogIn, UserPlus } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';

interface NavItem {
  path: string;
  label: string;
  icon?: React.ReactNode;
  roles?: string[];
  isButton?: boolean;
  submenu?: { path: string; label: string }[];
}

const Navbar: React.FC = () => {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const isDarkMode = theme === 'dark';
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDesktopSubmenu, setOpenDesktopSubmenu] = useState<string | null>(null);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState<string | null>(null);

  const isDashboard = location.pathname.includes('/dashboard') || 
                      location.pathname.includes('/admin') || 
                      location.pathname.includes('/driver') || 
                      location.pathname.includes('/passenger');

  // Main navigation items
  const mainNavItems: NavItem[] = [
    { path: '/', label: 'Home', icon: <Bus className="h-5 w-5" /> },
    { path: '/book', label: 'Book a Ride', icon: <Bus className="h-5 w-5" /> },
    { path: '/contact', label: 'Contact', icon: <Bus className="h-5 w-5" /> },
  ];

  // Dashboard navigation items based on user role
  const getDashboardNavItems = (): NavItem[] => {
    if (!user) return [];

    const basePath = user.role === 'admin' ? '/admin' : 
                    user.role === 'driver' ? '/driver' : 
                    '/passenger';

    const commonItems = [
      { 
        path: `${basePath}/dashboard`, 
        label: 'Dashboard', 
        icon: <BarChart2 className="h-5 w-5" />,
        roles: ['passenger', 'driver', 'admin']
      },
    ];

    if (user.role === 'admin') {
      return [
        ...commonItems,
        { 
          path: `${basePath}/statistics`, 
          label: 'Statistics', 
          icon: <BarChart2 className="h-5 w-5" />,
          roles: ['admin']
        },
        { 
          path: `${basePath}/trips`, 
          label: 'Trip Management', 
          icon: <Clock className="h-5 w-5" />,
          roles: ['admin']
        },
        { 
          path: `${basePath}/users`,
          label: 'Users',
          icon: <Users className="h-5 w-5" />,
          roles: ['admin'],
          submenu: [
            { path: `${basePath}/users`, label: 'User Management' },
            { path: `${basePath}/users/registered`, label: 'Registered Users' }
          ]
        },
        {
          path: `${basePath}/settings`,
          label: 'Settings',
          icon: <Settings className="h-5 w-5" />,
          roles: ['admin'],
          submenu: [
            { path: `${basePath}/hotpoints`, label: 'Hot Points Management' },
            { path: `${basePath}/routes`, label: 'Route Management' },
            { path: `${basePath}/vehicle`, label: 'Vehicle Management' }
          ]
        },
      ];
    } else if (user.role === 'driver') {
      return [
        ...commonItems,
        { 
          path: `${basePath}/trips`, 
          label: 'Trip Management', 
          icon: <Clock className="h-5 w-5" />,
          roles: ['driver']
        },
        {
          path: `${basePath}/settings`,
          label: 'Settings',
          icon: <Settings className="h-5 w-5" />,
          roles: ['driver'],
          submenu: [
            { path: `${basePath}/vehicle`, label: 'Vehicle Management' }
          ]
        },
      ];
    }

    // Passenger-specific navigation items
    return [
      ...commonItems,
      { 
        path: `${basePath}/trips`, 
        label: 'My Trips', 
        icon: <Clock className="h-5 w-5" />,
        roles: ['passenger']
      },
      {
        path: `${basePath}/settings`,
        label: 'Settings',
        icon: <Settings className="h-5 w-5" />,
        roles: ['passenger']
      },
    ];
  };

  const dashboardNavItems = getDashboardNavItems();

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
    setOpenDesktopSubmenu(null);
    setOpenMobileSubmenu(null);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMenuOpen) {
      setOpenMobileSubmenu(null); // Close mobile submenu when main mobile menu closes
    }
  }, [isMenuOpen]);

  // Check if a path is active (exact match or starts with)
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname === path || location.pathname.startsWith(path);
  };

  // Get the appropriate nav items based on whether we're in a dashboard or main site
  const navItems = isDashboard ? dashboardNavItems : mainNavItems;

  return (
    <nav
      className={
        isDashboard
          ? `rounded-xl z-50 glass-navbar-dashboard transition-all duration-300 py-2` // Removed fixed, transform, width, max-w, mt, and shadow-md on scroll
          : `fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? 'py-2 bg-white dark:bg-gray-900 shadow-md' : 'py-4 bg-transparent'}`
      }
    >
      <div className="container-app px-0">
        <div className="flex items-center justify-between h-16 md:h-20 min-w-0 gap-x-4">
          {/* Logo */}
          <div className="flex-shrink-0 min-w-0">
            <Link to="/" className="flex items-center gap-2 whitespace-nowrap">
              <Logo 
                variant={
                  isDashboard
                    ? 'primary'
                    : scrolled 
                      ? 'primary' 
                      : 'white'
                }
                size="lg"
                showText={false}
                className="h-7 w-7 sm:h-8 sm:w-8"
              />
              <span className={`text-lg font-semibold transition-colors duration-200 whitespace-nowrap ${
                isDashboard
                  ? 'text-gray-900 dark:text-gray-100'
                  : scrolled 
                    ? 'text-gray-900 dark:text-gray-100' 
                    : 'text-white dark:text-white'
              }`}>
                {isDashboard && user ? (
                  user.role === 'admin' ? 'Admin Panel' : 
                  user.role === 'driver' ? 'Driver Portal' : 
                  'Passenger Dashboard'
                ) : (
                  'RideBooker'
                )}
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6 lg:space-x-8 min-w-0 flex-shrink">
            {navItems.map((item) => (
              <div key={item.label} className="relative min-w-0 flex-shrink">
                {item.submenu ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setOpenDesktopSubmenu(openDesktopSubmenu === item.path ? null : item.path)}
                      className={`flex items-center px-3 py-2 text-sm lg:text-base rounded-md whitespace-nowrap ${
                        isDashboard
                          ? `text-gray-800 hover:text-primary-600 dark:text-gray-200 dark:hover:text-primary-400 border-b-2 ${
                              item.submenu.some(sub => isActive(sub.path)) || openDesktopSubmenu === item.path
                                ? 'border-primary-600 dark:border-primary-400 font-medium' 
                                : 'border-transparent'
                            }`
                          : `${
                              isActive(item.path)
                                ? scrolled 
                                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' 
                                  : 'text-white dark:text-white border-b-2 border-white dark:border-white'
                                : scrolled
                                  ? 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400' 
                                  : 'text-gray-200 hover:text-white dark:text-gray-300 dark:hover:text-white'
                            }`
                      } transition-all duration-200`}
                    >
                      {item.icon && <span className="mr-1.5">{item.icon}</span>}
                      {item.label}
                      <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${openDesktopSubmenu === item.path ? 'transform rotate-180' : ''}`} />
                    </button>
                    {openDesktopSubmenu === item.path && (
                      <div className="absolute z-60 mt-2 w-56 origin-top-right bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black/5 dark:ring-white/10 focus:outline-none border border-gray-200/50 dark:border-gray-700/50">
                        {item.submenu.map((sub) => (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            onClick={() => setOpenDesktopSubmenu(null)}
                            className={`block px-4 py-2 text-sm whitespace-nowrap ${
                              isActive(sub.path) 
                                ? 'text-primary-600 dark:text-primary-400 bg-gray-100 dark:bg-gray-700 font-medium' 
                                : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-700 dark:hover:text-primary-400'
                            } transition-colors duration-200`}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link 
                    key={item.path}
                    to={item.path} 
                    className={`flex items-center px-3 py-2 text-sm whitespace-nowrap transition-all duration-200 ${
                      isDashboard
                        ? `rounded-md text-gray-800 hover:text-primary-600 dark:text-gray-200 dark:hover:text-primary-400 ${
                            isActive(item.path) 
                              ? 'font-medium text-primary-600 dark:text-primary-400 bg-gray-100 dark:bg-gray-700 border-b-2 border-primary-600 dark:border-primary-400' 
                              : 'text-gray-800 dark:text-gray-200 border-b-2 border-transparent'
                          }`
                        : `${
                            isActive(item.path)
                              ? scrolled 
                                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' 
                                : 'text-white dark:text-white border-b-2 border-white dark:border-white'
                              : scrolled
                                ? 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400' 
                                : 'text-gray-200 hover:text-white dark:text-gray-300 dark:hover:text-white'
                          }`
                    }`}
                  >
                    {item.icon && <span className="mr-1.5">{item.icon}</span>}
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
            {isDashboard && <ThemeToggle />}
          </div>
          
          {/* Right side: Profile/Login & Theme Toggle (Desktop) */}
          <div className="hidden md:flex items-center space-x-3">
            {!isDashboard && <ThemeToggle />}
            {user ? (
              <ProfileDropdown />
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/login" 
                  className={`btn btn-sm btn-outline flex items-center transition-colors duration-200 text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/50`}
                >
                  <LogIn size={16} className="mr-1.5" />
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className={`btn btn-sm flex items-center transition-colors duration-200 bg-primary-600 hover:bg-primary-700 text-white dark:bg-primary-700 dark:hover:bg-primary-600 dark:text-white`}
                >
                  <UserPlus size={16} className="mr-1.5" />
                  Sign Up
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className={`ml-2 inline-flex items-center justify-center p-2 rounded-md focus:outline-none transition-colors duration-200 ${
                isDashboard ? 'text-gray-800 hover:bg-primary-50 dark:text-gray-200 dark:hover:bg-primary-900/50' : 
                scrolled ? 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800' : 
                'text-white hover:bg-white/10 dark:text-white dark:hover:bg-white/10'
              }`}
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
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

      {/* Mobile Menu */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} absolute top-full left-0 right-0 w-full pb-3 z-60`}
        id="mobile-menu"
      >
        <div className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 rounded-b-xl mx-2 ${
          isDashboard 
            ? 'glass-navbar-dashboard shadow-lg'
            : 'bg-white dark:bg-gray-900 shadow-lg border-t border-gray-200/50 dark:border-gray-700/50'
        }`}>
          {navItems.map((item) => (
            <div key={item.label}>
              {item.submenu ? (
                <>
                  <button
                    type="button"
                    onClick={() => setOpenMobileSubmenu(openMobileSubmenu === item.path ? null : item.path)}
                    className={`flex w-full items-center justify-between px-3 py-2 rounded-md text-base font-medium ${
                      isDashboard
                        ? `${
                            item.submenu.some(sub => isActive(sub.path)) || openMobileSubmenu === item.path
                              ? 'text-primary-600 dark:text-primary-400 bg-gray-100 dark:bg-gray-700' 
                              : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-700 dark:hover:text-primary-400'
                          }`
                        : `${
                            isActive(item.path) 
                            ? 'text-primary-600 dark:text-primary-400 bg-gray-100 dark:bg-gray-800' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800 dark:hover:text-primary-400'
                          }`
                    } transition-colors duration-200`}
                  >
                    <span className="flex items-center">
                      {item.icon && <span className="mr-2">{item.icon}</span>}
                      {item.label}
                    </span>
                    <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${openMobileSubmenu === item.path ? 'transform rotate-180' : ''}`} />
                  </button>
                  {openMobileSubmenu === item.path && (
                    <div className="mt-1 space-y-1 pl-10 pr-4">
                      {item.submenu.map((sub) => (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          onClick={() => {
                            setIsMenuOpen(false);
                            setOpenMobileSubmenu(null);
                          }}
                          className={`block py-2 px-3 text-sm rounded-md ${
                            isActive(sub.path) 
                              ? 'text-primary-600 dark:text-primary-400 bg-gray-100 dark:bg-gray-700 font-medium' 
                              : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-700 dark:hover:text-primary-400'
                          } transition-colors duration-200`}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.path}
                  onClick={() => {
                    setIsMenuOpen(false);
                    setOpenMobileSubmenu(null);
                  }}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    isDashboard
                      ? `${
                          isActive(item.path) 
                            ? 'text-primary-600 dark:text-primary-400 bg-gray-100 dark:bg-gray-700' 
                            : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-700 dark:hover:text-primary-400'
                        }`
                      : `${
                          isActive(item.path) 
                            ? 'text-primary-600 dark:text-primary-400 bg-gray-100 dark:bg-gray-800' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800 dark:hover:text-primary-400'
                        }`
                  } transition-colors duration-200`}
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                </Link>
              )}
            </div>
          ))}
          {/* Login/Signup or Profile for Mobile */}
          <div className="pt-4 pb-2 border-t border-gray-200/50 dark:border-gray-700/50">
            {user ? (
              <div className="px-2">
                <ProfileDropdown />
              </div>
            ) : (
              <div className="px-2 space-y-2">
                <Link 
                  to="/login" 
                  className={`block w-full text-left btn btn-outline transition-colors duration-200 text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/50`}
                >
                  <LogIn size={16} className="mr-1.5 inline" /> Login
                </Link>
                <Link 
                  to="/register" 
                  className={`block w-full text-left btn transition-colors duration-200 bg-primary-600 hover:bg-primary-700 text-white dark:bg-primary-700 dark:hover:bg-primary-600 dark:text-white`}
                >
                  <UserPlus size={16} className="mr-1.5 inline" /> Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
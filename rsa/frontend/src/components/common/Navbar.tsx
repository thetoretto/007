import '../../index.css';
import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import { Menu, X, BarChart2, Users, Clock, Settings, ChevronDown, LogIn, UserPlus, Home, Phone, Calendar, Sparkles } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';
import { TransitionContext } from '../../context/TransitionContext';

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
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDesktopSubmenu, setOpenDesktopSubmenu] = useState<string | null>(null);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState<string | null>(null);
  const { startPageTransition } = useContext(TransitionContext);

  const isDashboard = location.pathname.includes('/dashboard') || 
                      location.pathname.includes('/admin') || 
                      location.pathname.includes('/driver') || 
                      location.pathname.includes('/passenger');
                      
  // Custom navigation handler that uses startTransition
  const handleNavigation = (path: string) => {
    startPageTransition(() => {
      navigate(path);
    });
  };

  // Main navigation items
  const mainNavItems: NavItem[] = [
    { path: '/', label: 'Home', icon: <Home className="h-5 w-5" /> },
    { path: '/about', label: 'About', icon: <Sparkles className="h-5 w-5" /> },
    { path: '/book', label: 'Book a Ride', icon: <Calendar className="h-5 w-5" /> },
    { path: '/contact', label: 'Contact', icon: <Phone className="h-5 w-5" /> },
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
            { path: `${basePath}/settings`, label: 'My Account' },
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
          ? `rounded-xl z-50 transition-all duration-300 py-3 bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-xl border border-light dark:border-dark shadow-lg hover:shadow-xl`
          : `fixed w-full top-0 z-50 transition-all duration-500 ${
              scrolled
                ? 'py-3 bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-xl shadow-lg border-b border-light dark:border-dark'
                : 'py-4 bg-gradient-to-b from-surface-light/80 via-surface-light/60 to-transparent dark:from-surface-dark/80 dark:via-surface-dark/60 dark:to-transparent backdrop-blur-sm'
            }`
      }
    >
      {/* Enhanced background gradient for non-dashboard navbar when scrolled */}
      {!isDashboard && scrolled && (
        <div className="absolute inset-0 bg-gradient-to-r from-surface-light/90 via-primary/5 to-surface-light/90 dark:from-surface-dark/90 dark:via-primary/10 dark:to-surface-dark/90 backdrop-blur-xl"></div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-16 md:h-20 min-w-0 gap-x-4">
          {/* Enhanced Logo */}
          <div className="flex-shrink-0 min-w-0">
            <Link to="/" className="group flex items-center gap-3 whitespace-nowrap">
              <div className="relative">
                <div className={`p-2 rounded-xl transition-all duration-300 shadow-lg ${
                  isDashboard
                    ? 'bg-primary/10 dark:bg-primary/20 group-hover:bg-primary/20 dark:group-hover:bg-primary/30'
                    : scrolled
                      ? 'bg-primary/10 dark:bg-primary/20 group-hover:bg-primary/20 dark:group-hover:bg-primary/30'
                      : 'bg-black/20 dark:bg-white/20 backdrop-blur-sm group-hover:bg-black/30 dark:group-hover:bg-white/30 border border-black/10 dark:border-white/10'
                }`}>
                  <Logo
                    variant="primary"
                    size="lg"
                    showText={false}
                    className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                {/* Enhanced glow effect */}
                <div className={`absolute inset-0 rounded-xl blur-lg transition-all duration-300 ${
                  isDashboard
                    ? 'bg-primary/20 group-hover:bg-primary/40'
                    : scrolled
                      ? 'bg-primary/20 group-hover:bg-primary/40'
                      : 'bg-primary/30 group-hover:bg-primary/50'
                } group-hover:opacity-100 opacity-0 group-hover:scale-110`}></div>
              </div>
              <div className="flex flex-col">
                <span className={`text-xl font-bold transition-all duration-300 whitespace-nowrap ${
                  isDashboard
                    ? 'text-text-light-primary dark:text-text-dark-primary'
                    : scrolled
                      ? 'bg-gradient-to-r from-primary to-primary/80 dark:from-primary dark:to-primary/80 bg-clip-text text-transparent'
                      : 'text-black dark:text-white drop-shadow-lg'
                } group-hover:scale-105`}>
                  {isDashboard && user ? (
                    user.role === 'admin' ? 'Admin Panel' :
                    user.role === 'driver' ? 'Driver Portal' :
                    'Passenger Dashboard'
                  ) : (
                    'GIGI move'
                  )}
                </span>
                {!isDashboard && (
                  <span className={`text-xs font-medium transition-all duration-300 ${
                    scrolled
                      ? 'text-primary dark:text-primary'
                      : 'text-black/70 dark:text-white/80 drop-shadow-md'
                  } group-hover:text-primary`}>
                    Travel with confidence
                  </span>
                )}
              </div>
            </Link>
          </div>

          {/* Enhanced Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-2 lg:space-x-4 min-w-0 flex-shrink">
            {navItems.map((item) => (
              <div key={item.label} className="relative min-w-0 flex-shrink">
                {item.submenu ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setOpenDesktopSubmenu(openDesktopSubmenu === item.path ? null : item.path)}
                      className={`group flex items-center px-4 py-2.5 text-sm lg:text-base rounded-xl whitespace-nowrap transition-all duration-300 ${
                        isDashboard
                          ? `hover:bg-primary/10 dark:hover:bg-primary/20 ${
                              item.submenu.some(sub => isActive(sub.path)) || openDesktopSubmenu === item.path
                                ? 'bg-primary text-black font-semibold shadow-primary border border-primary/30'
                                : 'text-text-light-primary dark:text-text-dark-primary hover:text-primary'
                            }`
                          : `hover:bg-white/10 backdrop-blur-sm ${
                              isActive(item.path)
                                ? scrolled
                                  ? 'bg-primary text-black font-semibold shadow-primary border border-primary/30'
                                  : 'bg-black/80 text-white dark:bg-white/20 dark:text-white font-semibold shadow-glass border border-black/20 dark:border-white/30'
                                : scrolled
                                  ? 'text-text-light-primary dark:text-text-dark-primary hover:text-primary'
                                  : 'text-black hover:text-primary dark:text-white/90 dark:hover:text-white font-medium drop-shadow-sm'
                            }`
                      }`}
                    >
                      {item.icon && <span className="mr-2 transition-transform duration-300 group-hover:scale-110">{item.icon}</span>}
                      {item.label}
                      <ChevronDown className={`ml-2 h-4 w-4 transition-all duration-300 ${openDesktopSubmenu === item.path ? 'transform rotate-180' : 'group-hover:translate-y-0.5'}`} />
                    </button>
                    {openDesktopSubmenu === item.path && (
                      <div className="absolute z-60 mt-3 w-64 origin-top-right bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-xl rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 border border-light dark:border-dark overflow-hidden animate-slide-down">
                        <div className="p-2">
                          {item.submenu.map((sub) => (
                            <a
                              key={sub.path}
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setOpenDesktopSubmenu(null);
                                handleNavigation(sub.path);
                              }}
                              className={`block px-4 py-3 text-sm whitespace-nowrap rounded-lg transition-all duration-200 ${
                                isActive(sub.path)
                                  ? 'text-black bg-primary font-semibold shadow-primary border border-primary/30'
                                  : 'text-text-light-primary dark:text-text-dark-primary hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20'
                              }`}
                            >
                              {sub.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <a
                    key={item.path}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation(item.path);
                    }}
                    className={`group flex items-center px-4 py-2.5 text-sm lg:text-base whitespace-nowrap rounded-xl transition-all duration-300 ${
                      isDashboard
                        ? `hover:bg-primary/10 dark:hover:bg-primary/20 ${
                            isActive(item.path)
                              ? 'bg-primary text-black font-semibold shadow-primary border border-primary/30'
                              : 'text-text-light-primary dark:text-text-dark-primary hover:text-primary'
                          }`
                        : `hover:bg-white/10 backdrop-blur-sm ${
                            isActive(item.path)
                              ? scrolled
                                ? 'bg-primary text-black font-semibold shadow-primary border border-primary/30'
                                : 'bg-black/80 text-white dark:bg-white/20 dark:text-white font-semibold shadow-glass border border-black/20 dark:border-white/30'
                              : scrolled
                                ? 'text-text-light-primary dark:text-text-dark-primary hover:text-primary'
                                : 'text-black hover:text-primary dark:text-white/90 dark:hover:text-white font-medium drop-shadow-sm'
                          }`
                    }`}
                  >
                    {item.icon && <span className="mr-2 transition-transform duration-300 group-hover:scale-110">{item.icon}</span>}
                    {item.label}
                  </a>
                )}
              </div>
            ))}
            {isDashboard && <ThemeToggle />}
          </div>

          {/* Enhanced Right side: Profile/Login & Theme Toggle (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {!isDashboard && <ThemeToggle />}
            {user ? (
              <ProfileDropdown />
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className={`group flex items-center px-4 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                    isDashboard || scrolled
                      ? 'text-primary hover:bg-primary/10 dark:hover:bg-primary/20 border border-light dark:border-dark hover:border-primary shadow-sm hover:shadow-lg'
                      : 'text-black border border-black/40 hover:bg-black/10 hover:border-black/60 backdrop-blur-sm dark:text-white dark:border-white/40 dark:hover:bg-white/10 dark:hover:border-white/60 shadow-md hover:shadow-lg drop-shadow-sm'
                  }`}
                >
                  <LogIn size={16} className="mr-2 transition-transform duration-300 group-hover:scale-110" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`group flex items-center px-4 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 ${
                    isDashboard || scrolled
                      ? 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-black'
                      : 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-black'
                  }`}
                >
                  <UserPlus size={16} className="mr-2 transition-transform duration-300 group-hover:scale-110" />
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Enhanced Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className={`relative inline-flex items-center justify-center p-3 rounded-xl focus:outline-none transition-all duration-300 ${
                isDashboard ? 'text-text-light-primary dark:text-text-dark-primary hover:bg-primary/10 border border-light dark:border-dark shadow-sm hover:shadow-lg' :
                scrolled ? 'text-text-light-primary dark:text-text-dark-primary hover:bg-primary/10 border border-light dark:border-dark shadow-sm hover:shadow-lg' :
                'text-black hover:bg-black/10 border border-black/40 hover:border-black/60 backdrop-blur-sm dark:text-white dark:hover:bg-white/10 dark:border-white/40 dark:hover:border-white/60 shadow-md hover:shadow-lg drop-shadow-sm'
              } ${isMenuOpen ? 'scale-95' : 'hover:scale-105'}`}
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              <div className="relative">
                {isMenuOpen ? (
                  <X className="block h-6 w-6 transition-transform duration-300 rotate-90" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6 transition-transform duration-300" aria-hidden="true" />
                )}
              </div>
              {/* Animated background */}
              <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
                isMenuOpen ? 'opacity-100' : 'opacity-0'
              } ${
                isDashboard || scrolled
                  ? 'bg-primary/20 dark:bg-primary/30'
                  : 'bg-black/20 dark:bg-white/20'
              }`}></div>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden animate-slide-down" id="mobile-menu">
          <div className="mx-4 my-4 rounded-2xl overflow-hidden shadow-xl border bg-surface-light/95 dark:bg-surface-dark/95 border-light dark:border-dark backdrop-blur-xl">
            <div className="p-6 space-y-2">
              {navItems.map((item, index) => (
                <div key={item.label} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                  {item.submenu ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setOpenMobileSubmenu(openMobileSubmenu === item.path ? null : item.path)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-base font-medium rounded-xl transition-all duration-300 ${
                          item.submenu.some(sub => isActive(sub.path)) || openMobileSubmenu === item.path
                            ? 'text-black bg-primary shadow-primary border border-primary/30'
                            : 'text-text-light-primary dark:text-text-dark-primary hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20'
                        }`}
                      >
                        <span className="flex items-center">
                          {item.icon && <span className="mr-3 transition-transform duration-300">{item.icon}</span>}
                          {item.label}
                        </span>
                        <ChevronDown className={`h-5 w-5 transition-all duration-300 ${openMobileSubmenu === item.path ? 'transform rotate-180 text-primary' : ''}`} />
                      </button>
                      {openMobileSubmenu === item.path && (
                        <div className="ml-6 mt-2 space-y-1 animate-slide-down">
                          {item.submenu.map((sub) => (
                            <a
                              key={sub.path}
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setIsMenuOpen(false);
                                setOpenMobileSubmenu(null);
                                handleNavigation(sub.path);
                              }}
                              className={`block px-4 py-2.5 text-sm rounded-lg transition-all duration-300 ${
                                isActive(sub.path)
                                  ? 'text-black bg-primary font-semibold shadow-primary border border-primary/30'
                                  : 'text-text-light-secondary dark:text-text-dark-secondary hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20'
                              }`}
                            >
                              {sub.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsMenuOpen(false);
                        handleNavigation(item.path);
                      }}
                      className={`flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-300 ${
                        isActive(item.path)
                          ? 'text-black bg-primary shadow-primary border border-primary/30'
                          : 'text-text-light-primary dark:text-text-dark-primary hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20'
                      }`}
                    >
                      {item.icon && <span className="mr-3 transition-transform duration-300">{item.icon}</span>}
                      {item.label}
                    </a>
                  )}
                </div>
              ))}

              {/* Enhanced Mobile Auth Buttons */}
              <div className="pt-6 border-t border-light dark:border-dark space-y-3 animate-slide-up" style={{ animationDelay: `${navItems.length * 100}ms` }}>
                {user ? (
                  <div className="px-2">
                    <ProfileDropdown />
                  </div>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full flex items-center justify-center px-4 py-3 text-base font-medium text-primary bg-primary/10 dark:bg-primary/20 rounded-xl hover:bg-primary/20 dark:hover:bg-primary/30 transition-all duration-300 border border-light dark:border-dark shadow-sm hover:shadow-lg"
                    >
                      <LogIn size={18} className="mr-2" />
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full flex items-center justify-center px-4 py-3 text-base font-medium text-black bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <UserPlus size={18} className="mr-2" />
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
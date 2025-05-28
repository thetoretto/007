import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings, BarChart2, Users, Clock, Menu, X, ChevronDown, Bus } from "lucide-react";
import useAuthStore from '../../store/authStore';
import ProfileDropdown from '../common/ProfileDropdown';
import ThemeToggle from '../common/ThemeToggle';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  submenu?: { path: string; label: string }[];
}

interface DashboardNavbarProps {
  userRole: 'driver' | 'admin';
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ userRole }) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDesktopSubmenu, setOpenDesktopSubmenu] = useState<string | null>(null);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const basePath = userRole === 'driver' ? '/driver' : '/admin';

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
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const getNavItems = (): NavItem[] => {
    const commonItems = [
      { path: `${basePath}/dashboard`, label: 'Dashboard', icon: <BarChart2 className="h-5 w-5" /> },
    ];

    if (userRole === 'admin') {
      return [
        ...commonItems,
        { path: `${basePath}/trips`, label: 'Trip Management', icon: <Clock className="h-5 w-5" /> },
        { 
          path: `${basePath}/users`,
          label: 'Users',
          icon: <Users className="h-5 w-5" />,
          submenu: [
            { path: `${basePath}/users`, label: 'User Management' },
            { path: `${basePath}/users/registered`, label: 'Registered Users' }
          ]
        },
        {
          path: `${basePath}/settings`,
          label: 'Settings',
          icon: <Settings className="h-5 w-5" />,
          submenu: [
            { path: `${basePath}/hotpoints`, label: 'Hot Points Management' },
            { path: `${basePath}/routes`, label: 'Route Management' },
            { path: `${basePath}/vehicle`, label: 'Vehicle Management' }
          ]
        },
      ];
    }

    // Driver-specific navigation items
    return [
      ...commonItems,
      { path: `${basePath}/trips`, label: 'Trip Management', icon: <Clock className="h-5 w-5" /> },
      {
        path: `${basePath}/settings`,
        label: 'Settings',
        icon: <Settings className="h-5 w-5" />,
        submenu: [
          { path: `${basePath}/vehicle`, label: 'Vehicle Management' }
        ]
      },
    ];
  };

  const navItems = getNavItems();
  
  const isActive = (path: string) => {
    return location.pathname === path || 
           (path !== `${basePath}/dashboard` && location.pathname.startsWith(path));
  };

  return (
    <nav className={`sticky top-0 z-40 w-full bg-background-light dark:bg-section-dark border-b border-primary-100 dark:border-primary-800 transition-all duration-300 ${
      scrolled ? 'shadow-md' : 'shadow-sm'
    }`}>
      <div className="container-app mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo and Title */}
          <div className="flex-shrink-0 flex items-center">
            <Link to={`${basePath}/dashboard`} className="flex items-center gap-2">
              <Bus className="h-6 w-6 text-primary dark:text-primary-200" />
              <span className="text-lg font-semibold text-text-base dark:text-text-inverse transition-colors duration-200">
                {userRole === 'driver' ? 'Driver Portal' : 'Admin Panel'}
              </span>
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center space-x-3 md:hidden">
            <ThemeToggle size="sm" showLabel={false} />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-text-base hover:text-primary hover:bg-section-light dark:text-text-inverse dark:hover:text-primary-200 dark:hover:bg-primary-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary dark:focus:ring-primary-200 transition-colors duration-200"
              aria-expanded={isMobileMenuOpen ? 'true' : 'false'}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:justify-between md:flex-1">
            <div className="flex items-center space-x-1 lg:space-x-4 ml-6">
              {navItems.map((item) => (
                <div key={item.label} className="relative">
                  {item.submenu ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setOpenDesktopSubmenu(openDesktopSubmenu === item.path ? null : item.path)}
                        className={`flex items-center px-3 py-2 text-sm lg:text-base rounded-md text-text-base hover:text-primary dark:text-text-inverse dark:hover:text-primary-200 border-b-2 ${
                          item.submenu.some(sub => isActive(sub.path)) || openDesktopSubmenu === item.path
                            ? 'border-primary dark:border-primary-200 font-medium' 
                            : 'border-transparent'
                        } transition-all duration-200`}
                      >
                        <span className="mr-1.5">{item.icon}</span>
                        {item.label}
                        <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${openDesktopSubmenu === item.path ? 'transform rotate-180' : ''}`} />
                      </button>
                      {openDesktopSubmenu === item.path && (
                        <div className="absolute z-20 mt-2 w-56 origin-top-right bg-background-light dark:bg-section-dark rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {item.submenu.map((sub) => (
                            <Link
                              key={sub.path}
                              to={sub.path}
                              onClick={() => setOpenDesktopSubmenu(null)}
                              className={`block px-4 py-2 text-sm ${
                                isActive(sub.path) 
                                  ? 'text-primary dark:text-primary-200 bg-section-light dark:bg-primary-900 font-medium' 
                                  : 'text-text-base dark:text-text-inverse hover:bg-section-light hover:text-primary dark:hover:bg-primary-900 dark:hover:text-primary-200'
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
                      onClick={() => setOpenDesktopSubmenu(null)}
                      className={`flex items-center px-3 py-2 text-sm lg:text-base rounded-md text-text-base hover:text-primary dark:text-text-inverse dark:hover:text-primary-200 border-b-2 ${
                        isActive(item.path) 
                          ? 'border-primary dark:border-primary-200 font-medium' 
                          : 'border-transparent'
                      } transition-all duration-200`}
                    >
                      <span className="mr-1.5">{item.icon}</span>
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
            
            {/* Desktop Right Side */}
            <div className="flex items-center space-x-4">
              <ThemeToggle size="md" showLabel={false} className="mr-1" />
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background-light dark:bg-section-dark border-b border-primary-100 dark:border-primary-800">
          {navItems.map((item) => (
            <div key={item.label} className="py-1">
              {item.submenu ? (
                <>
                  <button
                    type="button"
                    onClick={() => setOpenMobileSubmenu(openMobileSubmenu === item.path ? null : item.path)}
                    className={`flex w-full items-center justify-between px-3 py-2 rounded-md text-base font-medium ${
                      item.submenu.some(sub => isActive(sub.path)) || openMobileSubmenu === item.path
                        ? 'text-primary dark:text-primary-200 bg-section-light dark:bg-primary-900' 
                        : 'text-text-base dark:text-text-inverse hover:bg-section-light hover:text-primary dark:hover:bg-primary-900 dark:hover:text-primary-200'
                    } transition-colors duration-200`}
                  >
                    <span className="flex items-center">
                      <span className="mr-2">{item.icon}</span>
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
                            setIsMobileMenuOpen(false);
                            setOpenMobileSubmenu(null);
                          }}
                          className={`block py-2 px-3 text-sm rounded-md ${
                            isActive(sub.path) 
                              ? 'text-primary dark:text-primary-200 bg-section-light dark:bg-primary-900 font-medium' 
                              : 'text-text-base dark:text-text-inverse hover:bg-section-light hover:text-primary dark:hover:bg-primary-900 dark:hover:text-primary-200'
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
                    setIsMobileMenuOpen(false);
                    setOpenMobileSubmenu(null);
                  }}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    isActive(item.path) 
                      ? 'text-primary dark:text-primary-200 bg-section-light dark:bg-primary-900' 
                      : 'text-text-base dark:text-text-inverse hover:bg-section-light hover:text-primary dark:hover:bg-primary-900 dark:hover:text-primary-200'
                  } transition-colors duration-200`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              )}
            </div>
          ))}
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

export default DashboardNavbar;
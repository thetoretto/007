import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings, Activity, Users, Clock, Menu, X, ChevronDown } from "react-feather";
import useAuthStore from '../../store/authStore';
import ProfileDropdown from '../common/ProfileDropdown'; // Import the new component
import ThemeToggle from '../common/ThemeToggle'; // Import the new component

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
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
  const basePath = userRole === 'driver' ? '/driver' : '/admin';

  const getNavItems = (): NavItem[] => {
    const commonItems = [
      { path: `${basePath}/dashboard`, label: 'Dashboard', icon: <Activity className="h-4 w-4 mr-2" /> },
    ];

    if (userRole === 'admin') {
      return [
        ...commonItems,
        { path: `${basePath}/trips`, label: 'Trip Management', icon: <Clock className="h-4 w-4 mr-2" /> },
        { path: `${basePath}/statistics`, label: 'Statistics', icon: <Activity className="h-4 w-4 mr-2" /> },
        {
          path: `${basePath}/users`,
          label: 'Users',
          icon: <Users className="h-4 w-4 mr-2" />,
          submenu: [
            { path: `${basePath}/users`, label: 'User Management' },
            { path: `${basePath}/users/registered`, label: 'Registered Users' }
          ]
        },
        {
          path: `${basePath}/settings`, // This can be a general settings page or the first submenu item by default
          label: 'Settings',
          icon: <Settings className="h-4 w-4 mr-2" />,
          submenu: [
            { path: `${basePath}/hotpoints`, label: 'Hot Points Management' },
            { path: `${basePath}/routes`, label: 'Route Management' },
            { path: `${basePath}/vehicle`, label: 'Vehicle Management' }
            // Add other general settings links here if needed, e.g.:
            // { path: `${basePath}/settings/general`, label: 'General Settings' }
          ]
        },
      ];
    }

    // Driver-specific navigation items
    return [
      ...commonItems,
      { path: `${basePath}/trips`, label: 'Trip Management', icon: <Clock className="h-4 w-4 mr-2" /> },
      {
        path: `${basePath}/settings`, // This can be a general settings page or the first submenu item by default
        label: 'Settings',
        icon: <Settings className="h-4 w-4 mr-2" />,
        submenu: [
          { path: `${basePath}/vehicle`, label: 'Vehicle Management' }
          // Add other general settings links here if needed
        ]
      },
    ];
  };

  const navItems = getNavItems();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
        setOpenMobileSubmenu(null); // Close mobile submenus on resize to desktop view
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="card shadow-sm mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-gray-900">
              {userRole === 'driver' ? 'Driver Portal' : 'Admin Panel'}
            </h2>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
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
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <div key={item.label} className="relative"> {/* Using item.label for key if paths might not be unique for toggles */}
                {item.submenu ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setOpenDesktopSubmenu(openDesktopSubmenu === item.path ? null : item.path)}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 ${ 
                        item.submenu.some(sub => isActive(sub.path)) || openDesktopSubmenu === item.path
                          ? 'border-primary-500 text-gray-900' 
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } text-sm font-medium cursor-pointer focus:outline-none`}
                    >
                      {item.icon}
                      {item.label}
                      <ChevronDown className={`h-4 w-4 ml-1 transition-transform duration-200 ${openDesktopSubmenu === item.path ? 'transform rotate-180' : ''}`} />
                    </button>
                    {openDesktopSubmenu === item.path && (
                      <div className="absolute z-20 card shadow-lg rounded-md mt-2 py-1 w-56 origin-top-right ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {item.submenu.map((sub) => (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            onClick={() => {
                              setOpenDesktopSubmenu(null); // Close submenu on item click
                            }}
                            className={`block px-4 py-2 text-sm ${isActive(sub.path) ? 'font-semibold text-primary-600 bg-primary-50' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-800'}`}
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
                    onClick={() => setOpenDesktopSubmenu(null)} // Close any open submenu when clicking a direct link
                    className={`inline-flex items-center px-1 pt-1 border-b-2 ${isActive(item.path) ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} text-sm font-medium`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
          {/* Add ProfileDropdown to the desktop view */}
          <div className="hidden md:flex items-center ml-4">
          <ThemeToggle /> 
            <ProfileDropdown />
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <div key={item.label} className="py-1"> {/* Using item.label for key */}
                  {item.submenu ? (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setOpenMobileSubmenu(openMobileSubmenu === item.path ? null : item.path);
                        }}
                        className={`w-full flex items-center justify-between pl-3 pr-4 py-2 border-l-4 ${ 
                          item.submenu.some(sub => isActive(sub.path)) || openMobileSubmenu === item.path
                            ? 'bg-primary-50 border-primary-500 text-primary-700' 
                            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                        } text-base font-medium focus:outline-none text-left`}
                      >
                        <span className="flex items-center">
                          {item.icon}
                          {item.label}
                        </span>
                        <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${openMobileSubmenu === item.path ? 'transform rotate-180' : ''}`} />
                      </button>
                      {openMobileSubmenu === item.path && (
                        <div className="mt-1 space-y-1 pl-10 pr-4"> {/* Indented submenu, increased pl from 8 to 10 for better visual nesting */}
                          {item.submenu.map((sub) => (
                            <Link
                              key={sub.path}
                              to={sub.path}
                              className={`block py-2 text-sm rounded-md ${isActive(sub.path) ? 'bg-primary-100 font-semibold text-primary-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'}`}
                              onClick={() => {
                                setIsMobileMenuOpen(false); // Close main mobile menu
                                setOpenMobileSubmenu(null);   // Close this mobile submenu
                              }}
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
                      className={`${isActive(item.path) ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                      onClick={() => {
                        setIsMobileMenuOpen(false); // Close main mobile menu
                        setOpenMobileSubmenu(null);   // Close any open mobile submenu
                      }}
                    >
                      <div className="flex items-center">
                        {item.icon}
                        {item.label}
                      </div>
                    </Link>
                  )}
                </div>
              ))}
            </div>
            {/* Replace mobile profile section with ProfileDropdown */}
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="px-4">
                 <ProfileDropdown />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardNavbar;
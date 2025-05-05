import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings, Activity, Users, Clock, Menu, X } from "react-feather";
import useAuthStore from '../../store/authStore';
import ProfileDropdown from '../common/ProfileDropdown'; // Import the new component

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
  const basePath = userRole === 'driver' ? '/driver' : '/admin';

  const navItems: NavItem[] = [
    { path: `${basePath}/dashboard`, label: 'Dashboard', icon: <Activity className="h-4 w-4 mr-2" /> },
    { path: `${basePath}/trips`, label: 'Trip Management', icon: <Clock className="h-4 w-4 mr-2" /> },
    { path: `${basePath}/statistics`, label: 'Statistics', icon: <Activity className="h-4 w-4 mr-2" /> },
    { path: `${basePath}/users`, label: 'User Management', icon: <Users className="h-4 w-4 mr-2" /> },
    { path: `${basePath}/settings`, label: 'Settings', icon: <Settings className="h-4 w-4 mr-2" /> },
  ];
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="bg-white shadow-sm mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-gray-900">
              {userRole === 'driver' ? 'Driver Portal' : 'Admin Panel'}
            </h2>
            {user && (
              <p className="ml-4 text-sm text-gray-500 hidden md:block">
                Welcome, {user.firstName}
              </p>
            )}
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
              <Link
                key={item.path}
                to={item.path}
                className={`inline-flex items-center px-1 pt-1 border-b-2 ${isActive(item.path) ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} text-sm font-medium`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
          {/* Add ProfileDropdown to the desktop view */}
          <div className="hidden md:flex items-center ml-4">
            <ProfileDropdown />
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`${isActive(item.path) ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    {item.icon}
                    {item.label}
                  </div>
                </Link>
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
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const dashboardPaths = ['/dashboard', '/admin', '/driver', '/passenger'];
const authPaths = ['/login', '/register', '/forgot', '/reset'];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  
  // Responsive breakpoint detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isDashboard = dashboardPaths.some((p) => location.pathname.startsWith(p));
  const isAuth = authPaths.some((p) => location.pathname.startsWith(p));
  const isHome = location.pathname === '/';
  const isPublic = !isDashboard && !isAuth;

  // Enhanced container classes with better responsive design
  const getLayoutContainerClasses = () => {
    const baseClasses = 'min-h-screen flex flex-col transition-all duration-300 ease-in-out relative';

    if (isDashboard) {
      return `${baseClasses} bg-light dark:bg-dark text-black dark:text-white`;
    } else if (isAuth) {
      return `${baseClasses} hero-gradient text-white overflow-hidden`;
    } else if (isHome) {
      return `${baseClasses} bg-transparent text-black dark:text-white`;
    } else {
      return `${baseClasses} bg-light dark:bg-dark text-black dark:text-white`;
    }
  };

  // Enhanced main classes with better spacing and accessibility
  const getMainClasses = () => {
    const baseClasses = 'flex-grow w-full';
    
    if (isAuth) {
      return `${baseClasses} flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 min-h-screen`;
    } else {
      if (isHome) {
        return `${baseClasses} p-0`; // HomePage handles its own layout
      } else {
        // Improved responsive spacing for non-home pages
        const topPadding = isMobile ? 'pt-16' : 'pt-20'; // Adjust for mobile navbar height
        const horizontalPadding = 'px-4 sm:px-6 lg:px-8 xl:px-12';
        const bottomPadding = isDashboard ? 'pb-6 sm:pb-8' : 'pb-8 sm:pb-12';
        
        return `${baseClasses} ${topPadding} ${horizontalPadding} ${bottomPadding} max-w-full overflow-x-hidden`;
      }
    }
  };

  // Skip link for accessibility
  const SkipLink = () => (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-black px-4 py-2 rounded-md z-50 transition-all duration-200 shadow-primary"
    >
      Skip to main content
    </a>
  );

  return (
    <>
      <SkipLink />
      <div className={getLayoutContainerClasses()}>
        {/* Navbar with improved responsive behavior */}
        {!isAuth && (
          <header className="relative z-40">
            <Navbar />
          </header>
        )}
        
        {/* Main content area with enhanced accessibility */}
        <main 
          id="main-content"
          className={getMainClasses()}
          role="main"
          aria-label={isAuth ? 'Authentication content' : isDashboard ? 'Dashboard content' : 'Main content'}
          tabIndex={-1}
        >
          <div className={`w-full ${!isHome && !isAuth ? 'max-w-7xl mx-auto' : ''}`}>
            {children}
          </div>
        </main>
        
        {/* Footer with improved conditional rendering */}
        {isPublic && !isHome && (
          <footer className="relative z-10">
            <Footer />
          </footer>
        )}
      </div>
    </>
  );
};

export default React.memo(Layout);
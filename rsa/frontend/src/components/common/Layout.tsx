import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const dashboardPaths = ['/dashboard', '/admin', '/driver', '/passenger'];
const authPaths = ['/login', '/register', '/forgot', '/reset'];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isDashboard = dashboardPaths.some((p) => location.pathname.startsWith(p));
  const isAuth = authPaths.some((p) => location.pathname.startsWith(p));
  const isHome = location.pathname === '/';
  const isPublic = !isDashboard && !isAuth; // Variable for footer condition clarity

  // Determine classes for the main container div
  let layoutContainerClasses = 'min-h-screen flex flex-col transition-colors duration-500';
  if (isDashboard) {
    layoutContainerClasses += ' bg-gray-100 dark:bg-surface-dark text-text-light dark:text-text-dark';
  } else if (isAuth) {
    layoutContainerClasses += ' bg-gradient-to-br from-primary-600 via-primary-700 to-darkBlue-800 dark:from-gray-900 dark:via-gray-800 dark:to-primary-900 text-white';
  } else if (isHome) {
    layoutContainerClasses += ' bg-transparent text-text-light dark:text-text-dark';
  } else { // Other public pages
    layoutContainerClasses += ' bg-gray-50 dark:bg-gray-900 text-text-light dark:text-text-dark subtle-bg-gradient';
  }

  // Determine classes for the main element
  const mainClasses: string[] = [];
  if (isAuth) {
    // Auth pages are typically centered and take available space
    mainClasses.push('flex-grow', 'flex', 'flex-col', 'items-center', 'justify-center', 'p-4');
  } else {
    mainClasses.push('flex-grow'); // Ensure main content area takes available vertical space
    if (isHome) {
      mainClasses.push('p-0'); // HomePage handles its own layout and padding
    } else {
      // Common horizontal padding and top padding for Navbar for both dashboard and other public pages
      mainClasses.push('pt-24', 'px-4', 'sm:px-6', 'lg:px-8'); 
      if (isDashboard) {
        mainClasses.push('pb-8'); // Dashboard specific bottom padding
      } else { // Public pages (not home)
        mainClasses.push('pb-12'); // Public specific bottom padding
      }
    }
  }
  const mainClassString = mainClasses.join(' ');

  return (
    <div className={layoutContainerClasses}>
      {!isAuth && <Navbar />} 
      <main className={mainClassString} role="main">
        {children}
      </main>
      {isPublic && !isHome && <Footer />} {/* Footer on public pages (not auth, not dashboard) and not on home */}
    </div>
  );
};

export default React.memo(Layout);
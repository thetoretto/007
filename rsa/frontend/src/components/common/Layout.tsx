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
  const isPublic = !isDashboard && !isAuth;

  let layoutClasses = 'min-h-screen flex flex-col transition-colors duration-500';
  let mainPadding = 'pt-24 pb-12 px-4 sm:px-6 lg:px-8'; // Default padding for public pages after navbar

  if (isDashboard) {
    layoutClasses += ' bg-gray-100 dark:bg-surface-dark text-text-light dark:text-text-dark';
    // Navbar is fixed, so main content needs padding. Footer is not typically in dashboard.
    mainPadding = 'pt-24 pb-8 px-4 sm:px-6 lg:px-8'; // Increased top padding to prevent collision with navbar
  } else if (isAuth) {
    layoutClasses += ' bg-gradient-to-br from-primary-600 via-primary-700 to-darkBlue-800 dark:from-gray-900 dark:via-gray-800 dark:to-primary-900 text-white';
    mainPadding = 'flex-grow flex flex-col items-center justify-center p-4'; // Auth pages are typically centered
  } else if (isHome) {
    // Homepage manages its own background. Layout provides fallback text colors.
    layoutClasses += ' bg-transparent text-text-light dark:text-text-dark'; 
    mainPadding = 'p-0'; // No padding, HomePage handles its own layout
  } else { // Other public pages
    layoutClasses += ' bg-gray-50 dark:bg-gray-900 text-text-light dark:text-text-dark subtle-bg-gradient';
    // Navbar is present, main content needs top padding
  }

  // Adjust mainPadding if Navbar is not present (Auth pages) or if it's dashboard (different navbar height/behavior)
  if (isAuth) {
    // mainPadding already set for auth
  } else if (isDashboard) {
    // mainPadding already set for dashboard
  } else {
    // For public pages (including home if it had a standard navbar)
    // The pt-navbar class (if Navbar is fixed/absolute) or direct padding is needed.
    // Assuming Navbar height is accounted for by pt-24 or similar in mainPadding for public pages.
  }


  return (
    <div className={layoutClasses}>
      {!isAuth && <Navbar />}
      <main className={` ${isAuth ? '' : 'flex-grow'} `} role="main">
        {children}
      </main>
      {isPublic && !isHome && <Footer />} {/* Footer on public pages, but not on home if it has its own full-page design */}
    </div>
  );
};

export default React.memo(Layout);
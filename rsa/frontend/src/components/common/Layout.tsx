import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import LoadingSpinner from './LoadingSpinner';

const dashboardPaths = ['/dashboard', '/admin', '/driver', '/passenger'];
const authPaths = ['/login', '/register', '/forgot', '/reset'];
const bookingPaths = ['/book', '/booking'];

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  keywords?: string;
  loading?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'RSA Travel - Your Journey Starts Here',
  description = 'Book comfortable and reliable transportation with RSA Travel. Safe, affordable, and convenient travel solutions.',
  keywords = 'travel, transportation, booking, RSA, trips, bus, taxi, ride',
  loading = false
}) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Enhanced responsive breakpoint detection
  useEffect(() => {
    const checkBreakpoints = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkBreakpoints();
    window.addEventListener('resize', checkBreakpoints);
    return () => window.removeEventListener('resize', checkBreakpoints);
  }, []);

  const isDashboard = dashboardPaths.some((p) => location.pathname.startsWith(p));
  const isAuth = authPaths.some((p) => location.pathname.startsWith(p));
  const isBooking = bookingPaths.some((p) => location.pathname.startsWith(p));
  const isHome = location.pathname === '/';
  const isPublic = !isDashboard && !isAuth && !isBooking;

  // Dynamic page title based on route
  const getPageTitle = () => {
    if (title !== 'RSA Travel - Your Journey Starts Here') return title;

    if (isAuth) {
      if (location.pathname.includes('login')) return 'Login - RSA Travel';
      if (location.pathname.includes('register')) return 'Register - RSA Travel';
      if (location.pathname.includes('forgot')) return 'Forgot Password - RSA Travel';
      return 'Authentication - RSA Travel';
    }

    if (isBooking) return 'Book Your Trip - RSA Travel';
    if (isDashboard) {
      if (location.pathname.includes('admin')) return 'Admin Dashboard - RSA Travel';
      if (location.pathname.includes('driver')) return 'Driver Dashboard - RSA Travel';
      if (location.pathname.includes('passenger')) return 'Passenger Dashboard - RSA Travel';
      return 'Dashboard - RSA Travel';
    }

    return title;
  };

  // Enhanced container classes with better responsive design and accessibility
  const getLayoutContainerClasses = () => {
    const baseClasses = 'min-h-screen flex flex-col transition-all duration-300 ease-in-out relative antialiased';

    if (isDashboard) {
      return `${baseClasses} bg-light dark:bg-dark text-text-light-primary dark:text-text-dark-primary`;
    } else if (isAuth) {
      return `${baseClasses} hero-gradient text-white overflow-hidden`;
    } else if (isBooking) {
      return `${baseClasses} bg-surface-light dark:bg-surface-dark text-text-light-primary dark:text-text-dark-primary overflow-hidden`;
    } else if (isHome) {
      return `${baseClasses} bg-transparent text-text-light-primary dark:text-text-dark-primary`;
    } else {
      return `${baseClasses} bg-light dark:bg-dark text-text-light-primary dark:text-text-dark-primary`;
    }
  };

  // Enhanced main classes with better spacing, accessibility, and responsive design
  const getMainClasses = () => {
    const baseClasses = 'flex-grow w-full relative';

    if (isAuth) {
      return `${baseClasses} flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 min-h-screen`;
    } else if (isBooking) {
      return `${baseClasses} p-0 min-h-screen`; // Full screen for booking
    } else {
      if (isHome) {
        return `${baseClasses} p-0`; // HomePage handles its own layout
      } else {
        // Enhanced responsive spacing with better mobile optimization
        const topPadding = isMobile ? 'pt-16' : isTablet ? 'pt-18' : 'pt-20';
        const horizontalPadding = isMobile ? 'px-4' : isTablet ? 'px-6' : 'px-8 xl:px-12';
        const bottomPadding = isDashboard ? 'pb-6 sm:pb-8' : 'pb-8 sm:pb-12 lg:pb-16';

        return `${baseClasses} ${topPadding} ${horizontalPadding} ${bottomPadding} max-w-full overflow-x-hidden`;
      }
    }
  };

  // Enhanced Skip Link for accessibility
  const SkipLink = () => (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-black px-4 py-2 rounded-md z-50 transition-all duration-200 shadow-lg font-medium"
    >
      Skip to main content
    </a>
  );

  // Loading overlay component
  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-center text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    </div>
  );

  // Update document title and basic meta tags when route changes
  useEffect(() => {
    // Update document title
    document.title = getPageTitle();

    // Update meta description if available
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }

    // Update meta keywords if available
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywords);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = keywords;
      document.head.appendChild(meta);
    }

    // Update theme color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#FEE47B');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = '#FEE47B';
      document.head.appendChild(meta);
    }
  }, [location.pathname, title, description, keywords]);

  return (
    <>
      {/* Loading Overlay */}
      {loading && <LoadingOverlay />}

      {/* Accessibility Skip Link */}
      <SkipLink />

      <div className={getLayoutContainerClasses()}>
        {/* Enhanced Navbar with better responsive behavior */}
        {!isAuth && !isBooking && (
          <header className="relative z-40 sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-border-light dark:border-border-dark">
            <Navbar />
          </header>
        )}

        {/* Main content area with enhanced accessibility and focus management */}
        <main
          id="main-content"
          className={getMainClasses()}
          role="main"
          aria-label={
            isAuth ? 'Authentication content' :
            isDashboard ? 'Dashboard content' :
            isBooking ? 'Booking content' :
            'Main content'
          }
          tabIndex={-1}
        >
          <div className={`w-full transition-all duration-300 ${
            !isHome && !isAuth && !isBooking ? 'max-w-7xl mx-auto' : ''
          }`}>
            {/* Content wrapper with better error boundaries */}
            <div className="relative">
              {children}
            </div>
          </div>
        </main>

        {/* Enhanced Footer with better conditional rendering */}
        {isPublic && (
          <footer className="relative z-10 mt-auto">
            <Footer variant="public" />
          </footer>
        )}

        {/* Dashboard Footer */}
        {isDashboard && (
          <footer className="relative z-10 mt-auto">
            <Footer variant="dashboard" />
          </footer>
        )}
      </div>
    </>
  );
};

export default React.memo(Layout);
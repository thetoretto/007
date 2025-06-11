import React, { Suspense, useEffect, lazy, useTransition } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/common/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import BookingPage from './pages/booking/BookingPage';
import ContactPage from './pages/ContactPage';
import LearnMorePage from './pages/LearnMorePage'; // Import the new page // Import the new contact page
import BecomeMemberPage from './pages/BecomeMemberPage'; // Import the new become member page
import TripsPage from './pages/passenger/TripsPage';
import TripDetailsPage from './pages/passenger/TripDetailsPage'; // Import the new TripDetailsPage
import PassengerDashboard from './pages/passenger/PassengerDashboard'; // Import PassengerDashboard
import PassengerSettingsPage from './pages/passenger/SettingsPage';
import DriverDashboard from './pages/driver/DriverDashboard';
import DriverSettingsPage from './pages/driver/SettingsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSettingsPage from './pages/admin/SettingsPage';
import useAuthStore from './store/authStore';
import FloatingThemeToggle from './components/common/FloatingThemeToggle';
import ErrorBoundary from './components/common/ErrorBoundary';
import { TransitionContext } from './context/TransitionContext';

// Lazy-loaded components


const TripManagement = lazy(() => import('./components/dashboard/TripManagement')); 
const TripActivityLog = lazy(() => import('./components/common/TripActivityLog'));
const AdminStatistics = lazy(() => import('./pages/admin/Statistics'));
const AdminUserManagement = lazy(() => import('./pages/admin/UserManagement'));
const AdminHotPointManagement = lazy(() => import('./pages/admin/AdminHotPointManagement')); // Import the new Hot Point Management page
const AdminRouteManagement = lazy(() => import('./pages/admin/AdminRouteManagement')); // Import the new Route Management page
const VehiclePage = lazy(() => import('./pages/driver/VehiclePage')); // Renamed for clarity, serves both admin and driver roles
const ProfilePage = lazy(() => import('./components/common/ProfilePage')); // Import the ProfilePage
const DriverCheckInPage = lazy(() => import('./components/driver/DriverCheckInPage')); // Import the DriverCheckInPage
const CreateTripPage = lazy(() => import('./components/dashboard/CreateTripPage')); // Import the CreateTripPage
import AboutPage from './pages/AboutPage';
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const CookiesPage = lazy(() => import('./pages/CookiesPage'));

interface ProtectedRouteProps {
  element: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, allowedRoles = [] }) => {
  const { user, token } = useAuthStore();
  
  // If user is not authenticated, redirect to login
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }
  
  // If roles are specified and user's role is not included, redirect to home
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  // User is authenticated and authorized
  return <>{element}</>;
};



function App() {
  const { checkAuth } = useAuthStore();
  const [isPending, startTransition] = useTransition();
  
  useEffect(() => {
    // Check if the user is already authenticated
    checkAuth();
  }, [checkAuth]);

  // Wrap route changes in startTransition
  const startPageTransition = (callback: () => void) => {
    startTransition(() => {
      callback();
    });
  };

  return (
    <TransitionContext.Provider value={{ startPageTransition, isPending }}>
      <Router>
        <FloatingThemeToggle position="bottom-right" />
        {isPending && (
          <div className="fixed top-0 left-0 w-full h-1 bg-primary z-50">
            <div className="h-full w-1/3 bg-primary/60 animate-pulse-slow"></div>
          </div>
        )}
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/book" element={<BookingPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/learn-more" element={<LearnMorePage />} />
            <Route path="/become-member" element={<BecomeMemberPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/cookies" element={<CookiesPage />} />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute 
                  element={
                    <ErrorBoundary>
                    <Suspense fallback={<div>Loading...</div>}>
                      <ProfilePage />
                    </Suspense>
                  </ErrorBoundary>
                  } 
                  allowedRoles={['passenger', 'driver', 'admin']} 
                />
              }
            />
            
            {/* Passenger routes */}
            <Route 
              path="/passenger/dashboard" 
              element={<ProtectedRoute element={<PassengerDashboard />} allowedRoles={['passenger']} />} 
            />
            <Route 
              path="/passenger/trips" 
              element={<ProtectedRoute element={<TripsPage />} allowedRoles={['passenger']} />} 
            />
            <Route
              path="/passenger/trips/:tripId"
              element={<ProtectedRoute element={<TripDetailsPage />} allowedRoles={['passenger', 'driver', 'admin']} />}
            />
            <Route
              path="/passenger/settings"
              element={<ProtectedRoute element={<PassengerSettingsPage />} allowedRoles={['passenger']} />}
            />
            
            {/* Driver routes */}
            <Route 
              path="/driver/dashboard" 
              element={<ProtectedRoute element={<DriverDashboard />} allowedRoles={['driver']} />} 
            />
            <Route 
              path="/driver/trips" 
              element={
                <ProtectedRoute 
                  element={
                    <ErrorBoundary>
                      <Suspense fallback={<div>Loading...</div>}>
                        <TripManagement />
                      </Suspense>
                    </ErrorBoundary>
                  } 
                  allowedRoles={['driver']} 
                />
              } 
            />
    
        
            {/* Driver Vehicle Management Route */}
            <Route 
              path="/driver/vehicle" // Path updated to /driver/vehicle
              element={
                <ProtectedRoute 
                  element={
                    <ErrorBoundary>
                      <Suspense fallback={<div>Loading...</div>}>
                        <VehiclePage /> {/* Component updated to VehiclePage */}
                      </Suspense>
                    </ErrorBoundary>
                  } 
                  allowedRoles={['driver']} 
                />
              }
            />
            <Route 
              path="/driver/trips/new" 
              element={
                <ProtectedRoute 
                  element={
                    <ErrorBoundary>
                      <Suspense fallback={<div>Loading...</div>}>
                        <CreateTripPage />
                      </Suspense>
                    </ErrorBoundary>
                  } 
                  allowedRoles={['driver']} 
                />
              }
            />
            <Route
              path="/driver/check-in"
              element={
                <ProtectedRoute
                  element={
                    <ErrorBoundary>
                      <Suspense fallback={<div>Loading...</div>}>
                        <DriverCheckInPage />
                      </Suspense>
                    </ErrorBoundary>
                  }
                  allowedRoles={['driver']}
                />
              }
            />
            <Route
              path="/driver/settings"
              element={<ProtectedRoute element={<DriverSettingsPage />} allowedRoles={['driver']} />}
            />
            
            {/* Admin routes */}
            <Route 
              path="/admin/dashboard" 
              element={<ProtectedRoute element={<AdminDashboard />} allowedRoles={['admin']} />} 
            />
            <Route 
              path="/admin/trips" 
              element={
                <ProtectedRoute 
                  element={
                    <ErrorBoundary>
                      <Suspense fallback={<div>Loading...</div>}>
                        <TripManagement />
                      </Suspense>
                    </ErrorBoundary>
                  } 
                  allowedRoles={['admin']} 
                />
              } 
            />
            <Route 
              path="/admin/statistics" 
              element={
                <ProtectedRoute 
                  element={
                    <ErrorBoundary>
                      <Suspense fallback={<div>Loading...</div>}>
                        <AdminStatistics />
                      </Suspense>
                    </ErrorBoundary>
                  } 
                  allowedRoles={['admin']} 
                />
              } 
            />
            {/* Admin Vehicle Management Route */}
            <Route 
              path="/admin/vehicle" // Path for admin vehicle management
              element={
                <ProtectedRoute 
                  element={
                    <ErrorBoundary>
                      <Suspense fallback={<div>Loading...</div>}>
                        <VehiclePage /> {/* Uses the same VehiclePage component */}
                      </Suspense>
                    </ErrorBoundary>
                  } 
                  allowedRoles={['admin']} 
                />
              }
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute 
                  element={
                    <ErrorBoundary>
                      <Suspense fallback={<div>Loading...</div>}>
                        <AdminUserManagement />
                      </Suspense>
                    </ErrorBoundary>
                  } 
                  allowedRoles={['admin']} 
                />
              } 
            />
            <Route
              path="/admin/routes"
              element={
                <ProtectedRoute
                  element={
                    <ErrorBoundary>
                      <Suspense fallback={<div>Loading...</div>}>
                        <AdminRouteManagement />
                      </Suspense>
                    </ErrorBoundary>
                  }
                  allowedRoles={['admin']}
                />
              }
            />
            <Route 
              path="/admin/hotpoints"
              element={
                <ProtectedRoute 
                  element={
                    <ErrorBoundary>
                      <Suspense fallback={<div>Loading...</div>}>
                        <AdminHotPointManagement />
                      </Suspense>
                    </ErrorBoundary>
                  } 
                  allowedRoles={['admin']} 
                />
              }
            />
            <Route 
              path="/admin/hotpoints/create"
              element={
                <ProtectedRoute 
                  element={
                    <ErrorBoundary>
                      <Suspense fallback={<div>Loading...</div>}>
                        <AdminHotPointManagement mode="create" />
                      </Suspense>
                    </ErrorBoundary>
                  } 
                  allowedRoles={['admin']} 
                />
              }
            />
            <Route
              path="/admin/trips/new"
              element={
                <ProtectedRoute
                  element={
                    <ErrorBoundary>
                      <Suspense fallback={<div>Loading...</div>}>
                        <CreateTripPage />
                      </Suspense>
                    </ErrorBoundary>
                  }
                  allowedRoles={['admin']}
                />
              }
            />
            <Route
              path="/admin/settings"
              element={<ProtectedRoute element={<AdminSettingsPage />} allowedRoles={['admin']} />}
            />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </TransitionContext.Provider>
  );
}

export default App;
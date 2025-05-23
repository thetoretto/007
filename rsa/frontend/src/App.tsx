import React, { Suspense, useEffect, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import BookingPage from './pages/booking/BookingPage';
import ContactPage from './pages/ContactPage';
import LearnMorePage from './pages/LearnMorePage'; // Import the new page // Import the new contact page
import BecomeMemberPage from './pages/BecomeMemberPage'; // Import the new become member page
import TripsPage from './pages/passenger/TripsPage';
import TripDetailsPage from './pages/passenger/TripDetailsPage'; // Import the new TripDetailsPage
import DemoPage from './pages/passenger/DemoPage'; // Import DemoPage
import DriverDashboard from './pages/driver/DriverDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import useAuthStore from './store/authStore';
import FloatingThemeToggle from './components/common/FloatingThemeToggle';

// Lazy-loaded components

const DriverStatistics = lazy(() => import('./pages/driver/Statistics'));

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
  
  useEffect(() => {
    // Check if the user is already authenticated
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {/* <Navbar /> */}
        <main className="flex-grow">
          <FloatingThemeToggle position="bottom-right" />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/book" element={<BookingPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/learn-more" element={<LearnMorePage />} />
            <Route path="/become-member" element={<BecomeMemberPage />} />
            <Route path="/passenger/demo" element={<DemoPage />} />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute 
                  element={
                    <Suspense fallback={<div>Loading...</div>}>
                      <ProfilePage />
                    </Suspense>
                  } 
                  // Allow all authenticated users to access their profile
                  allowedRoles={['passenger', 'driver', 'admin']} 
                />
              }
            />
            
            {/* Passenger routes */}
            <Route 
              path="/passenger/trips" 
              element={<ProtectedRoute element={<TripsPage />} allowedRoles={['passenger']} />} 
            />
            <Route 
              path="/trip/:tripId"
              element={<ProtectedRoute element={<TripDetailsPage />} allowedRoles={['passenger', 'driver', 'admin']} />}
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
                    <Suspense fallback={<div>Loading...</div>}>
                      <TripManagement />
                    </Suspense>
                  } 
                  allowedRoles={['driver']} 
                />
              } 
            />
            <Route 
              path="/driver/statistics" 
              element={
                <ProtectedRoute 
                  element={
                    <Suspense fallback={<div>Loading...</div>}>
                      <DriverStatistics />
                    </Suspense>
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
                    <Suspense fallback={<div>Loading...</div>}>
                      <VehiclePage /> {/* Component updated to VehiclePage */}
                    </Suspense>
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
                    <Suspense fallback={<div>Loading...</div>}>
                      <CreateTripPage />
                    </Suspense>
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
                    <Suspense fallback={<div>Loading...</div>}>
                      <DriverCheckInPage />
                    </Suspense>
                  } 
                  allowedRoles={['driver']} 
                />
              }
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
                    <Suspense fallback={<div>Loading...</div>}>
                      <TripManagement />
                    </Suspense>
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
                    <Suspense fallback={<div>Loading...</div>}>
                      <AdminStatistics />
                    </Suspense>
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
                    <Suspense fallback={<div>Loading...</div>}>
                      <VehiclePage /> {/* Uses the same VehiclePage component */}
                    </Suspense>
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
                    <Suspense fallback={<div>Loading...</div>}>
                      <AdminUserManagement />
                    </Suspense>
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
                    <Suspense fallback={<div>Loading...</div>}>
                      <AdminRouteManagement />
                    </Suspense>
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
                    <Suspense fallback={<div>Loading...</div>}>
                      <AdminHotPointManagement />
                    </Suspense>
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
                    <Suspense fallback={<div>Loading...</div>}>
                      <AdminHotPointManagement mode="create" />
                    </Suspense>
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
                    <Suspense fallback={<div>Loading...</div>}>
                      <CreateTripPage />
                    </Suspense>
                  } 
                  allowedRoles={['admin']} 
                />
              }
            />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
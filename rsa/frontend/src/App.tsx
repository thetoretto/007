import React, { Suspense, useEffect, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import BookingPage from './pages/booking/BookingPage';
import TripsPage from './pages/passenger/TripsPage';
import DriverDashboard from './pages/driver/DriverDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ComponentsGallery from './pages/ComponentsGallery';
import useAuthStore from './store/authStore';

// Lazy-loaded components
const DriverTripManagement = lazy(() => import('./pages/driver/TripManagement'));
const DriverStatistics = lazy(() => import('./pages/driver/Statistics'));
const DriverUserManagement = lazy(() => import('./pages/driver/UserManagement'));
const AdminTripManagement = lazy(() => import('./pages/admin/TripManagement'));
const AdminStatistics = lazy(() => import('./pages/admin/Statistics'));
const AdminUserManagement = lazy(() => import('./pages/admin/UserManagement'));

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
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/book" element={<BookingPage />} />
            <Route path="/components" element={<ComponentsGallery />} />
            
            {/* Passenger routes */}
            <Route 
              path="/passenger/trips" 
              element={<ProtectedRoute element={<TripsPage />} allowedRoles={['passenger']} />} 
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
                      <DriverTripManagement />
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
            <Route 
              path="/driver/users" 
              element={
                <ProtectedRoute 
                  element={
                    <Suspense fallback={<div>Loading...</div>}>
                      <DriverUserManagement />
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
                      <AdminTripManagement />
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
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
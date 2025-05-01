import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import BookingPage from './pages/booking/BookingPage';
import TripsPage from './pages/passenger/TripsPage';
import DriverDashboard from './pages/driver/DriverDashboard';
import QRScanner from './pages/driver/QRScanner';
import NewTrip from './pages/driver/NewTrip';
import ManageVehicles from './pages/driver/ManageVehicles';
import AdminDashboard from './pages/admin/AdminDashboard';
import useAuthStore from './store/authStore';
import { useEffect } from 'react';

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
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/book" element={<BookingPage />} />
            
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
              path="/driver/qr-scanner" 
              element={<ProtectedRoute element={<QRScanner />} allowedRoles={['driver']} />} 
            />
            <Route 
              path="/driver/trips/new" 
              element={<ProtectedRoute element={<NewTrip />} allowedRoles={['driver']} />} 
            />
            <Route 
              path="/driver/vehicles" 
              element={<ProtectedRoute element={<ManageVehicles />} allowedRoles={['driver']} />} 
            />
            
            {/* Admin routes */}
            <Route 
              path="/admin/dashboard" 
              element={<ProtectedRoute element={<AdminDashboard />} allowedRoles={['admin']} />} 
            />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
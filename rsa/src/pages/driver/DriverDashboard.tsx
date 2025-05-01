import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, AlertCircle, Settings, Plus, Info } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useDriverStore from '../../store/driverStore';
import TripCard from '../../components/driver/TripCard';
import SummaryMetric from '../../components/driver/SummaryMetric';
import QuickActionButton from '../../components/driver/QuickActionButton';
import CancelTripModal from '../../components/driver/modals/CancelTripModal';
import PassengerListModal from '../../components/driver/modals/PassengerListModal';

const DriverDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    upcomingTrips,
    selectedTripId,
    dailySummary,
    loading,
    error,
    fetchUpcomingTrips,
    loadPreferences,
  } = useDriverStore();

  useEffect(() => {
    fetchUpcomingTrips();
    loadPreferences();
  }, []);

  if (loading && upcomingTrips.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-error-50 text-error-700 p-4 rounded-lg">
          <p>Error: {error}</p>
          <button
            onClick={() => fetchUpcomingTrips()}
            className="mt-2 btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            {user && `Welcome back, ${user.firstName} ${user.lastName}`}
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link to="/driver/profile" className="btn btn-secondary mr-3">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Link>
          <Link to="/driver/trips/new" className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            New Trip
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Upcoming Trips</h2>
            </div>
            
            <div className="overflow-hidden">
              {upcomingTrips.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {upcomingTrips.map((trip) => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      expanded={selectedTripId === trip.id}
                    />
                    
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming trips</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You don't have any scheduled trips at the moment.
                  </p>
                  <div className="mt-6">
                    <Link to="/driver/trips/new" className="btn btn-primary">
                      Create New Trip
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Daily Summary</h2>
            </div>
            <div className="p-4 sm:px-6">
              <div className="grid grid-cols-2 gap-4">
                <SummaryMetric
                  title="Total Trips Today"
                  value={dailySummary.totalTrips}
                  icon={Calendar}
                  color="primary"
                />
                <SummaryMetric
                  title="Passengers"
                  value={dailySummary.totalPassengers}
                  icon={Users}
                  color="accent"
                />
                <SummaryMetric
                  title="Completed"
                  value={dailySummary.completedTrips}
                  icon={Clock}
                  color="success"
                />
                <SummaryMetric
                  title="Upcoming"
                  value={dailySummary.upcomingTrips}
                  icon={AlertCircle}
                  color="warning"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-4 sm:px-6">
              <div className="space-y-3">
                <QuickActionButton
                  icon={QRScannerIcon}
                  label="Open QR Scanner"
                  onClick={() => navigate('/driver/qr-scanner')}
                  variant="primary"
                />
                <QuickActionButton
                  icon={Plus}
                  label="New Trip"
                  onClick={() => navigate('/driver/trips/new')}
                  variant="secondary"
                />
                <QuickActionButton
                  icon={Settings}
                  label="Manage Vehicles"
                  onClick={() => navigate('/driver/vehicles')}
                  variant="secondary"
                />
              </div>
              
              <div className="mt-6 p-3 bg-primary-50 rounded-lg border border-primary-100 flex items-start">
                <Info className="h-5 w-5 text-primary-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-primary-800 font-medium">Remember</p>
                  <p className="text-xs text-primary-700 mt-1">
                    Always check passenger tickets and verify their identity before allowing boarding.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Custom QR Scanner Icon
const QRScannerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <rect x="7" y="7" width="3" height="3" />
    <rect x="14" y="7" width="3" height="3" />
    <rect x="7" y="14" width="3" height="3" />
    <rect x="14" y="14" width="3" height="3" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

export default DriverDashboard;
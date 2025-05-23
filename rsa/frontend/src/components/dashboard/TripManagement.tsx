import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { Calendar, Map, Users, Clock, AlertCircle, CheckCircle, Plus } from 'react-feather';
import { Link } from 'react-router-dom';
import { mockTimeSlots, mockVehicles, mockRoutes, getBookingsWithDetails } from '../../utils/mockData';
import TripActivityLog from '../common/TripActivityLog';


// Import the DashboardNavbar component
const DashboardNavbar = React.lazy(() => import('./DashboardNavbar'));

const TripManagement: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedTrip, setSelectedTrip] = React.useState<string | null>(null);

  // Use mockVehicles directly instead of maintaining a separate state
  const [trips, setTrips] = React.useState(mockTimeSlots.map(ts => ({
    ...ts,
    id: ts.id || `trip-${Math.random().toString(36).substr(2, 9)}`,
    vehicleId: ts.vehicleId || 'v1',
    driverId: ts.driverId || user?.id, // Add driverId to track trip ownership
    passengers: 8,
    status: 'upcoming',
    availableSeats: mockVehicles.find(v => v.id === (ts.vehicleId || 'v1'))?.capacity || 16
  })));
  
  // Create tripsWithDetails array that enhances each trip with its associated vehicle
  const tripsWithDetails = trips.map((trip) => ({
    ...trip,
    vehicle: mockVehicles.find((v) => v.id === trip.vehicleId),
  }));

  // Trip handlers
  const handleAddTrip = (newTrip: any) => {
    setTrips([...trips, newTrip]);
  };

  const handleEditTrip = (tripId: string, updatedTrip: any) => {
    setTrips(trips.map(t => t.id === tripId ? { ...t, ...updatedTrip } : t));
  };

  const handleDeleteTrip = (tripId: string) => {
    setTrips(trips.filter(t => t.id !== tripId));
  };

  // Get all bookings with details
  const allBookings = getBookingsWithDetails();

  // Group bookings by trip (timeSlotId)
  const tripGroups = allBookings.reduce((groups: { [key: string]: typeof allBookings }, booking) => {
    const key = booking.timeSlotId;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(booking);
    return groups;
  }, {});

  // Get trip details from tripsWithDetails instead of trips
  const detailedTrips = tripsWithDetails.map(trip => {
    try {
      const route = mockRoutes.find(r => r.id === trip.routeId);
      const bookingsForTrip = tripGroups[trip.id] || [];

      return {
        ...trip,
        route,
        bookings: bookingsForTrip,
        pendingBookings: bookingsForTrip.filter(b => b.status === 'pending').length,
        confirmedBookings: bookingsForTrip.filter(b => b.status === 'confirmed').length,
        totalBookings: bookingsForTrip.length,
      };
    } catch (error) {
      console.error(`Error processing trip ${trip.id}:`, error);
      return trip;
    }
  });

  // Filter trips based on user role
  const filteredTrips = React.useMemo(() => {
    if (user?.role === 'admin') {
      return detailedTrips; // Admin sees all trips
    } else if (user?.role === 'driver' && user?.id) {
      return detailedTrips.filter(trip => trip.driverId === user.id); // Driver sees only their trips
    }
    return [];
  }, [detailedTrips, user]);

  // Determine the new trip route based on user role
  const newTripRoute = user?.role === 'admin' ? '/admin/trips/new' : '/driver/trips/new';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Add the horizontal navigation bar */}
      <React.Suspense fallback={<div>Loading...</div>}>
        <DashboardNavbar userRole={user?.role || 'driver'} />
      </React.Suspense>
      
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-gray-900">Trip Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            {user?.role === 'admin' ? 'Manage all trips' : 'Manage your trips'}
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link to={newTripRoute} className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            New Trip
          </Link>
        </div>
      </div>

      <TripActivityLog/>
    </div>
  );
};

export default TripManagement;
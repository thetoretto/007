import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { Calendar, Map, Users, Clock, AlertCircle, CheckCircle, Plus } from 'react-feather';
import { Link } from 'react-router-dom';
import { mockTimeSlots, mockVehicles, mockRoutes, getBookingsWithDetails } from '../../utils/mockData';

// Import the DashboardNavbar component
const DashboardNavbar = React.lazy(() => import('../../components/dashboard/DashboardNavbar'));

const TripManagement: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedTrip, setSelectedTrip] = React.useState<string | null>(null);

  // Use mockVehicles directly instead of maintaining a separate state
  const [trips, setTrips] = React.useState(mockTimeSlots.map(ts => ({
    ...ts,
    id: ts.id || `trip-${Math.random().toString(36).substr(2, 9)}`,
    vehicleId: ts.vehicleId || 'v1',
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Add the horizontal navigation bar */}
      <React.Suspense fallback={<div>Loading...</div>}>
        <DashboardNavbar userRole="driver" />
      </React.Suspense>
      
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-gray-900">Trip Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your upcoming and past trips
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link to="/driver/trips/new" className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            New Trip
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">All Trips</h2>
        </div>

        <div className="overflow-hidden">
          {detailedTrips.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {detailedTrips.map((trip) => (
                <div
                  key={trip.id}
                  className={`hover:bg-gray-50 cursor-pointer p-4 sm:px-6 lg:px-8 transition-colors ${selectedTrip === trip.id ? 'bg-primary-100' : ''}`}
                  onClick={() => setSelectedTrip(trip.id === selectedTrip ? null : trip.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium text-gray-900">
                        {/* {trip.route?.name} */} {/* Removed route name */}
                        {trip.fromLocation} to {trip.toLocation} {/* Added from/to location */}
                      </h3>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{trip.date}</span>
                        <span className="mx-2">•</span>
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{trip.time}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm">
                          {trip.confirmedBookings} / {trip.availableSeats}
                        </span>
                      </div>
                      {trip.pendingBookings > 0 && (
                        <div className="mt-1 flex items-center text-xs text-warning-DEFAULT">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          <span>{trip.pendingBookings} pending bookings</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedTrip === trip.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
                      <div className="mb-4 flex justify-between items-center">
                        <h4 className="font-medium text-gray-900">Trip Details</h4>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTrip(trip.id);
                            }}
                            className="btn btn-danger py-1 px-3 text-xs"
                          >
                            Delete Trip
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Open edit modal or navigate to edit page
                            }}
                            className="btn btn-secondary py-1 px-3 text-xs"
                          >
                            Edit Trip
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-500 mb-1">Route</h5>
                          {/* <p className="text-sm">{trip.route?.name}</p> */} {/* Removed route name */}
                          <p className="text-sm">{trip.fromLocation} to {trip.toLocation}</p> {/* Added from/to location */}
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-500 mb-1">Vehicle</h5>
                          <p className="text-sm">{trip.vehicle?.name}</p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-500 mb-1">Date & Time</h5>
                          <p className="text-sm">{trip.date} at {trip.time}</p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-500 mb-1">Capacity</h5>
                          <p className="text-sm">{trip.confirmedBookings} / {trip.availableSeats} seats</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No trips found</h3>
              <p className="mt-1 text-sm text-gray-500">
                You don't have any trips at the moment.
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
  );
};

export default TripManagement;
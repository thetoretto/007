import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getBookingsWithDetails, mockRoutes, mockTimeSlots } from '../../utils/mockData';
import { Calendar, Clock, Users, AlertCircle, Settings, Plus, CheckCircle, Info } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { DashboardLayout, TripList, DailySummary, QuickActions } from '../../components/dashboard';
import QRScannerIcon from '../../components/icons/QRScannerIcon';
import { useTripStore } from '../../store/tripStore';
import { useAuthStore } from '../../store/authStore';


const DriverDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);

  // Mock data stores
  const [trips, setTrips] = useState(mockTimeSlots.map(ts => ({
    ...ts,
    vehicleId: 'vehicle-1',
    passengers: 8,
    status: 'upcoming'
  })));

  const [vehicles, setVehicles] = useState([
    { id: 'vehicle-1', type: 'Van', model: 'Mercedes Sprinter', seats: 16 },
    { id: 'vehicle-2', type: 'SUV', model: 'Toyota Highlander', seats: 7 }
  ]);

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

  // Vehicle handlers
  const handleAddVehicle = (newVehicle: any) => {
    setVehicles([...vehicles, newVehicle]);
  };

  // Calculate metrics
  const totalTripsToday = trips.filter(t => {
    const tripDate = new Date(t.date);
    const today = new Date();
    return tripDate.toDateString() === today.toDateString();
  }).length;

  const totalPassengers = trips.reduce((sum, trip) => sum + trip.passengers, 0);
  // Added real-time calculations
  const completedTrips = trips.filter(t => t.status === 'completed').length;
  const upcomingTrips = trips.filter(t => t.status === 'upcoming').length;

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

  // Get trip details (combine time slot and route info)
  const detailedTrips = mockTimeSlots.map(timeSlot => {
    const route = mockRoutes.find(r => r.id === timeSlot.routeId);
    const bookingsForTrip = tripGroups[timeSlot.id] || [];

    return {
      ...timeSlot,
      route,
      bookings: bookingsForTrip,
      pendingBookings: bookingsForTrip.filter(b => b.status === 'pending').length,
      confirmedBookings: bookingsForTrip.filter(b => b.status === 'confirmed').length,
      totalBookings: bookingsForTrip.length,
    };
  });

  // Filter for upcoming trips (future dates)
  const upcomingDetailedTrips = detailedTrips.filter(trip => {
    const tripDate = new Date(trip.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tripDate >= today;
  });

  // Sort upcoming trips by date and time
  upcomingDetailedTrips.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });

  const handleCheckInPassenger = (bookingId: string) => {
    alert(`Passenger with booking ${bookingId} would be checked in here. This is just a demo.`);
  };

  const handleCancelTrip = (tripId: string) => {
    alert(`Trip ${tripId} would be cancelled here. This is just a demo.`);
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
                    <div
                      key={trip.id}
                      className={`hover:bg-gray-50 cursor-pointer p-4 sm:px-6 lg:px-8 transition-colors ${selectedTrip === trip.id ? 'bg-primary-50' : ''
                        }`}
                      onClick={() => setSelectedTrip(trip.id === selectedTrip ? null : trip.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-medium text-gray-900">
                            {trip.route?.name}
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
                            <div className="mt-1 flex items-center text-xs text-warning-600">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              <span>{trip.pendingBookings} pending bookings</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {selectedTrip === trip.id && (
                        <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
                          <div className="mb-4 flex justify-between items-center">
                            <h4 className="font-medium text-gray-900">Passenger List</h4>
                            <div className="flex space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelTrip(trip.id);
                                }}
                                className="btn btn-danger py-1 px-3 text-xs"
                              >
                                Cancel Trip
                              </button>
                              <Link
                                to={`/driver/trips/${trip.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="btn btn-primary py-1 px-3 text-xs"
                              >
                                Trip Details
                              </Link>
                            </div>
                          </div>

                          {trip.bookings.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                              {trip.bookings.map((booking) => (
                                <div key={booking.id} className="py-2 flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">
                                      {booking.passenger?.firstName} {booking.passenger?.lastName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Seat {booking.seatId.split('s')[1].split('v')[0]}
                                      {booking.hasDoorstepPickup && ' • Doorstep Pickup'}
                                    </p>
                                  </div>
                                  <div>
                                    {booking.status === 'confirmed' ? (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCheckInPassenger(booking.id);
                                        }}
                                        className="btn bg-success-500 hover:bg-success-600 text-white py-1 px-3 text-xs"
                                      >
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Check In
                                      </button>
                                    ) : booking.status === 'checked-in' ? (
                                      <span className="badge badge-success text-xs">Checked In</span>
                                    ) : (
                                      <span className="badge badge-warning text-xs">{booking.status}</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 text-center py-4">
                              No bookings for this trip yet.
                            </p>
                          )}
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
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Total Trips Today</p>
                  <p className="text-2xl font-bold text-primary-600">3</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Passengers</p>
                  <p className="text-2xl font-bold text-primary-600">27</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-success-600">1</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Upcoming</p>
                  <p className="text-2xl font-bold text-accent-600">2</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-4 sm:px-6">
              <div className="space-y-3">
                <Link
                  to="/driver/scanner"
                  className="btn btn-primary w-full flex items-center justify-center"
                >
                  <QRScannerIcon className="h-5 w-5 mr-2" />
                  Open QR Scanner
                </Link>
                <Link
                  to="/driver/trips/new"
                  className="btn btn-secondary w-full flex items-center justify-center"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  New Trip
                </Link>
                <Link
                  to="/driver/vehicles"
                  className="btn btn-secondary w-full flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2">
                    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.4 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.6-1.2-.9-1.9-1.7H4c-.9 0-1.6.7-1.6 1.6v7.3c0 .9.7 1.7 1.6 1.7h2" />
                    <circle cx="7" cy="17" r="2" />
                    <path d="M9 17h6" />
                    <circle cx="17" cy="17" r="2" />
                  </svg>
                  Manage Vehicles
                </Link>
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
const QRScannerIcon = ({ className }: { className?: string }) => (
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
          trips={trips}
          onCancel={cancelTrip}
          onCheckIn={checkInPassenger}
          detailLinkBase="/driver/trips"
          vehicles={vehicles}
        />
      }
      sidebarContent={
        <>
          <DailySummary metrics={metrics} className="mb-8" />
          <QuickActions
            actions={[
              { label: 'QR Scanner', to: '/driver/scanner', icon: <QRScannerIcon /> },
              { label: 'Manage Vehicles', to: '/driver/vehicles', icon: <VehicleIcon /> }
            ]}
          />
        </>
      }
    />
  );
};

// Custom QR Scanner Icon
const QRScannerIcon = ({ className }: { className?: string }) => (
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
          trips={trips}
          onCancel={cancelTrip}
          onCheckIn={checkInPassenger}
          detailLinkBase="/driver/trips"
          vehicles={vehicles}
        />
      }
      sidebarContent={
        <>
          <DailySummary metrics={metrics} className="mb-8" />
          <QuickActions
            actions={[
              { label: 'QR Scanner', to: '/driver/scanner', icon: <QRScannerIcon /> },
              { label: 'Manage Vehicles', to: '/driver/vehicles', icon: <VehicleIcon /> }
            ]}
          />
        </>
      }
    />
  );
};

// Custom QR Scanner Icon
const QRScannerIcon = ({ className }: { className?: string }) => (
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
          trips={trips}
          onCancel={cancelTrip}
          onCheckIn={checkInPassenger}
          detailLinkBase="/driver/trips"
          vehicles={vehicles}
        />
      }
      sidebarContent={
        <>
          <DailySummary metrics={metrics} className="mb-8" />
          <QuickActions
            actions={[
              { label: 'QR Scanner', to: '/driver/scanner', icon: <QRScannerIcon /> },
              { label: 'Manage Vehicles', to: '/driver/vehicles', icon: <VehicleIcon /> }
            ]}
          />
        </>
      }
    />
  );
};

// Custom QR Scanner Icon
const QRScannerIcon = ({ className }: { className?: string }) => (
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
          trips={trips}
          onCancel={cancelTrip}
          onCheckIn={checkInPassenger}
          detailLinkBase="/driver/trips"
          vehicles={vehicles}
        />
      }
      sidebarContent={
        <>
          <DailySummary metrics={metrics} className="mb-8" />
          <QuickActions
            actions={[
              { label: 'QR Scanner', to: '/driver/scanner', icon: <QRScannerIcon /> },
              { label: 'Manage Vehicles', to: '/driver/vehicles', icon: <VehicleIcon /> }
            ]}
          />
        </>
      }
    />
  );
};

// Custom QR Scanner Icon
const QRScannerIcon = ({ className }: { className?: string }) => (
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
          trips={trips}
          onCancel={cancelTrip}
          onCheckIn={checkInPassenger}
          detailLinkBase="/driver/trips"
          vehicles={vehicles}
        />
      }
      sidebarContent={
        <>
          <DailySummary metrics={metrics} className="mb-8" />
          <QuickActions
            actions={[
              { label: 'QR Scanner', to: '/driver/scanner', icon: <QRScannerIcon /> },
              { label: 'Manage Vehicles', to: '/driver/vehicles', icon: <VehicleIcon /> }
            ]}
          />
        </>
      }
    />
  );
};

// Custom QR Scanner Icon
const QRScannerIcon = ({ className }: { className?: string }) => (
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
          trips={trips}
          onCancel={cancelTrip}
          onCheckIn={checkInPassenger}
          detailLinkBase="/driver/trips"
          vehicles={vehicles}
        />
      }
      sidebarContent={
        <>
          <DailySummary metrics={metrics} className="mb-8" />
          <QuickActions
            actions={[
              { label: 'QR Scanner', to: '/driver/scanner', icon: <QRScannerIcon /> },
              { label: 'Manage Vehicles', to: '/driver/vehicles', icon: <VehicleIcon /> }
            ]}
          />
        </>
      }
    />
  );
};

// Custom QR Scanner Icon
const QRScannerIcon = ({ className }: { className?: string }) => (
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
          trips={trips}
          onCancel={cancelTrip}
          onCheckIn={checkInPassenger}
          detailLinkBase="/driver/trips"
          vehicles={vehicles}
        />
      }
      sidebarContent={
        <>
          <DailySummary metrics={metrics} className="mb-8" />
          <QuickActions
            actions={[
              { label: 'QR Scanner', to: '/driver/scanner', icon: <QRScannerIcon /> },
              { label: 'Manage Vehicles', to: '/driver/vehicles', icon: <VehicleIcon /> }
            ]}
          />
        </>
      }
    />
  );
};

// Custom QR Scanner Icon
const QRScannerIcon = ({ className }: { className?: string }) => (
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
          trips={trips}
          onCancel={cancelTrip}
          onCheckIn={checkInPassenger}
          detailLinkBase="/driver/trips"
          vehicles={vehicles}
        />
      }
      sidebarContent={
        <>
          <DailySummary metrics={metrics} className="mb-8" />
          <QuickActions
            actions={[
              { label: 'QR Scanner', to: '/driver/scanner', icon: <QRScannerIcon /> },
              { label: 'Manage Vehicles', to: '/driver/vehicles', icon: <VehicleIcon /> }
            ]}
          />
        </>
      }
    />
  );
};

// Custom QR Scanner Icon
const QRScannerIcon = ({ className }: { className?: string }) => (
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
          trips={trips}
          onCancel={cancelTrip}
          onCheckIn={checkInPassenger}
          detailLinkBase="/driver/trips"
          vehicles={vehicles}
        />
      }
      sidebarContent={
        <>
          <DailySummary metrics={metrics} className="mb-8" />
          <QuickActions
            actions={[
              { label: 'QR Scanner', to: '/driver/scanner', icon: <QRScannerIcon /> },
              { label: 'Manage Vehicles', to: '/driver/vehicles', icon: <VehicleIcon /> }
            ]}
          />
        </>
      }
    />
  );
};

// Custom QR Scanner Icon
const QRScannerIcon = ({ className }: { className?: string }) => (
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
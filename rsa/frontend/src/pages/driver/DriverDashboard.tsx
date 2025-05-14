import '../../index.css';
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getBookingsWithDetails, mockRoutes, mockVehicles, mockDriverIncome } from '../../utils/mockData'; // Added mockDriverIncome
import { Calendar, Clock, Users, AlertCircle, Settings, Plus, CheckCircle, Info, Edit, Trash2, DollarSign, Eye, EyeOff, Filter } from 'lucide-react'; // Added DollarSign, Eye, EyeOff, Filter
import useAuthStore from '../../store/authStore';
import useTripStore, { Trip } from '../../store/tripStore'; // Ensure Trip type is imported
import QRScannerIcon from '../../components/icons/QRScannerIcon';
import TripForm from '../../components/trips/TripForm';
import PasswordConfirmationModal from '../../components/common/PasswordConfirmationModal'; // To be created

const DriverDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { trips, fetchTrips, updateTrip, markTripAsCompleted } = useTripStore(); // Added markTripAsCompleted
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [tripToEdit, setTripToEdit] = useState<Trip | null>(null);
  const [showIncome, setShowIncome] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [timePeriod, setTimePeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');

  // Import the DashboardNavbar component
  const DashboardNavbar = React.lazy(() => import('../../components/dashboard/DashboardNavbar'));

  useEffect(() => {
    fetchTrips(); // Fetch trips on component mount
  }, [fetchTrips]);

  // Remove local state and handlers for trips
  // const [trips, setTrips] = useState(...);
  // const handleAddTrip = ...;
  // const handleEditTrip = ...;
  // const handleDeleteTrip = ...;

  // Calculate metrics based on trips from the store
  const totalTripsToday = trips.filter(t => {
    const tripDate = new Date(t.date);
    const today = new Date();
    return tripDate.toDateString() === today.toDateString();
  }).length;

  // Note: 'passengers' might not be directly on the trip object from the store
  // Adjust calculation if needed based on booking data or trip details
  // Let's assume 'totalPassengers' should represent completed trips for now
  const totalPassengers = trips.filter(t => t.status === 'completed').length;
  const upcomingTripsCount = trips.filter(t => t.status === 'upcoming').length;
  // Calculate completed trips count - REMOVED FROM HERE
  // const completedTrips = trips.filter(t => t.status === 'completed').length;

  // Get all bookings with details (assuming this function remains relevant)
  const allBookings = getBookingsWithDetails();

  // Group bookings by trip (timeSlotId which is now trip.id)
  const tripGroups = allBookings.reduce((groups: { [key: string]: typeof allBookings }, booking) => {
    const key = booking.timeSlotId; // Assuming booking still uses timeSlotId, map to trip.id if needed
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(booking);
    return groups;
  }, {});

  // Enhance trips from the store with booking details
  const detailedTrips = trips.map(trip => {
    const bookingsForTrip = tripGroups[trip.id] || [];
    const confirmedBookingsCount = bookingsForTrip.filter(b => b.status === 'confirmed').length;
    return {
      ...trip,
      bookings: bookingsForTrip,
      pendingBookings: bookingsForTrip.filter(b => b.status === 'pending').length,
      confirmedBookings: confirmedBookingsCount,
      totalBookings: bookingsForTrip.length,
      // Ensure availableSeats is calculated correctly (e.g., capacity - confirmed bookings)
      // availableSeats: trip.vehicle?.capacity ? trip.vehicle.capacity - confirmedBookingsCount : 0,
    };
  });

  // Filter for upcoming trips (future dates or today)
  const upcomingDetailedTrips = detailedTrips.filter(trip => {
    const tripDateTime = new Date(`${trip.date}T${trip.time}`);
    const now = new Date();
    // Consider trips starting from now onwards as upcoming
    return trip.status === 'upcoming' && tripDateTime >= now;
  });

  // Sort upcoming trips by date and time
  upcomingDetailedTrips.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });

  const filterTripsByTimePeriod = (tripsToFilter: Trip[], period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    const now = new Date();
    return tripsToFilter.filter(trip => {
      const tripDate = new Date(trip.date);
      if (period === 'daily') {
        return tripDate.toDateString() === now.toDateString();
      }
      if (period === 'weekly') {
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
        startOfWeek.setHours(0, 0, 0, 0);
        endOfWeek.setHours(23, 59, 59, 999);
        return tripDate >= startOfWeek && tripDate <= endOfWeek;
      }
      if (period === 'monthly') {
        return tripDate.getFullYear() === now.getFullYear() && tripDate.getMonth() === now.getMonth();
      }
      if (period === 'yearly') {
        return tripDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  const tripsForPeriod = useMemo(() => filterTripsByTimePeriod(trips, timePeriod), [trips, timePeriod]);

  const completedTripsForPeriod = useMemo(() => tripsForPeriod.filter(t => t.status === 'completed').length, [tripsForPeriod]);
  const cancelledTripsForPeriod = useMemo(() => tripsForPeriod.filter(t => t.status === 'cancelled').length, [tripsForPeriod]);
  const scheduledTripsForPeriod = useMemo(() => tripsForPeriod.filter(t => t.status === 'upcoming' || t.status === 'scheduled').length, [tripsForPeriod]); // Assuming 'upcoming' can also mean scheduled

  const driverIncome = useMemo(() => mockDriverIncome(user?.id || '', timePeriod), [user?.id, timePeriod]);

  const handlePasswordConfirm = (password: string) => {
    // Simulate password check
    if (password === 'password123') { // Replace with actual password check logic
      setShowIncome(true);
      setIsPasswordModalOpen(false);
    } else {
      alert('Incorrect password');
    }
  };

  const toggleShowIncome = () => {
    if (showIncome) {
      setShowIncome(false);
    } else {
      setIsPasswordModalOpen(true);
    }
  };

  const handleCheckInPassenger = (bookingId: string) => {
    alert(`Passenger with booking ${bookingId} would be checked in here. This is just a demo.`);
    // Future: Update booking status via API/store
  };

  const openEditModal = (trip: Trip) => {
    setTripToEdit(trip);
    setIsTripModalOpen(true);
  };

  const openCreateModal = () => {
    setTripToEdit(null); // Ensure we are creating, not editing
    setIsTripModalOpen(true);
  };

  // Define completedTrips just before the return statement
  const completedTrips = trips.filter(t => t.status === 'completed').length;

  const availableTrips = useMemo(() => {
    return trips.filter(trip => !trip.driverId || trip.driverId === '');
  }, [trips]);

  const handleClaimTrip = (tripId: string) => {
    if (!user || !user.id) {
      alert("You must be logged in to claim a trip.");
      return;
    }
    if (window.confirm("Are you sure you want to claim this trip?")) {
      updateTrip(tripId, { driverId: user.id, status: 'scheduled' }); // Assuming 'scheduled' is an appropriate status after claiming
      alert("Trip claimed successfully!");
      fetchTrips(); // Refresh trip lists
    }
  };

  const handleMarkTripAsCompleted = (tripId: string) => {
    if (window.confirm("Are you sure you want to mark this trip as completed?")) {
      markTripAsCompleted(tripId);
      alert("Trip marked as completed!");
      fetchTrips(); // Refresh trips to update UI
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Add the horizontal navigation bar */}
      <React.Suspense fallback={<div>Loading...</div>}>
        <DashboardNavbar userRole="driver" />
      </React.Suspense>

      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            {user && `Welcome back, ${user.firstName} ${user.lastName}`}
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          {/* Changed Link to button to open modal */}
          <button onClick={openCreateModal} className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            New Trip
          </button>
          <Link to="/driver/check-in" className="btn btn-secondary ml-2">
            <QRScannerIcon className="h-4 w-4 mr-2" /> 
            Validate Ticket
          </Link>
        </div>
      </div>

      {/* Available Trips Section */}
      {availableTrips.length > 0 && (
        <div className="mb-8 card bg-base-100 shadow-xl p-4 sm:p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Available Trips for Claiming</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableTrips.map(trip => (
              <div key={trip.id} className="card bg-base-200 shadow-md p-4">
                <h3 className="font-semibold text-lg">{trip.route?.origin.name} to {trip.route?.destination.name}</h3>
                <p className="text-sm text-gray-600">Date: {trip.date} at {trip.time}</p>
                <p className="text-sm text-gray-600">Vehicle: {trip.vehicle?.make} {trip.vehicle?.model} ({trip.vehicle?.licensePlate})</p>
                {trip.price && <p className="text-sm text-gray-600">Price: ${trip.price.toFixed(2)}</p>}
                <p className={`text-sm font-medium mt-2 ${trip.status === 'pending_approval' ? 'text-warning' : 'text-info'}`}>Status: {trip.status}</p>
                <button 
                  onClick={() => handleClaimTrip(trip.id)} 
                  className="btn btn-sm btn-success mt-3 w-full"
                >
                  Claim Trip
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trip Statistics Section */}
      <div className="mb-8 card rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Trip Statistics</h2>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly')}
              className="select select-bordered select-sm"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700 mb-1">Scheduled Trips</p>
            <p className="text-3xl font-bold text-blue-600">{scheduledTripsForPeriod}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-700 mb-1">Completed Trips</p>
            <p className="text-3xl font-bold text-green-600">{completedTripsForPeriod}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-700 mb-1">Cancelled Trips</p>
            <p className="text-3xl font-bold text-red-600">{cancelledTripsForPeriod}</p>
          </div>
        </div>
      </div>

      {/* Income Section */}
      <div className="mb-8 card rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Income ({timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)})</h2>
          <button onClick={toggleShowIncome} className="btn btn-ghost btn-sm">
            {showIncome ? <EyeOff className="h-5 w-5 mr-1" /> : <Eye className="h-5 w-5 mr-1" />}
            {showIncome ? 'Hide' : 'Show'} Income
          </button>
        </div>
        {showIncome ? (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-700 mb-1">Total Earnings</p>
            <p className="text-3xl font-bold text-yellow-600">
              <DollarSign className="inline h-7 w-7 mr-1" />
              {driverIncome.toFixed(2)}
            </p>
          </div>
        ) : (
          <div className="text-center py-6 card rounded-lg">
            <p className="text-gray-500">Income is hidden. Click 'Show Income' and enter password to view.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Upcoming Trips</h2>
            </div>

            <div className="overflow-hidden">
              {upcomingDetailedTrips.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {upcomingDetailedTrips.map((trip) => (
                    <div
                      key={trip.id}
                      className={`hover:card cursor-pointer p-4 sm:px-6 lg:px-8 transition-colors ${selectedTrip?.id === trip.id ? 'bg-primary-50' : ''
                        }`}
                      onClick={() => setSelectedTrip(trip.id === selectedTrip?.id ? null : trip)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-medium text-gray-900">
                            {trip.fromLocation} to {trip.toLocation}
                          </h3>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{trip.date}</span>
                            <span className="mx-2">•</span>
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{trip.time}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Status: <span className={`font-medium ${trip.status === 'completed' ? 'text-success-600' :
                              trip.status === 'active' ? 'text-sky-600' :
                              trip.status === 'cancelled' ? 'text-error-600' :
                                'text-warning-600' // For scheduled, pending_approval
                              }`}>{trip.status.charAt(0).toUpperCase() + trip.status.slice(1).replace('_', ' ')}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Onboarding: {trip.confirmedBookings || 0} confirmed / {trip.totalBookings || 0} total bookings
                          </p>
                        </div>

                        <div className="flex flex-col items-end">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-sm">
                              {trip.confirmedBookings || 0} / {trip.vehicle?.capacity || 'N/A'} seats
                            </span>
                          </div>
                          {trip.pendingBookings > 0 && (
                            <div className="mt-1 flex items-center text-xs text-warning-600">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              <span>{trip.pendingBookings} pending</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {selectedTrip?.id === trip.id && (
                        <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
                          <div className="mb-4 flex justify-between items-center">
                            <h4 className="font-medium text-gray-900">Passenger List & Actions</h4>
                            <div className="flex space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditModal(trip);
                                }}
                                className="btn btn-secondary py-1 px-3 text-xs flex items-center"
                              >
                                <Edit size={12} className="mr-1" /> Edit
                              </button>
                              {trip.status !== 'completed' && trip.status !== 'cancelled' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkTripAsCompleted(trip.id);
                                  }}
                                  className="btn btn-success py-1 px-3 text-xs flex items-center"
                                >
                                  <CheckCircle size={12} className="mr-1" /> Mark Completed
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Passenger List */}                          
                          {trip.bookings.length > 0 ? (
                            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-2">
                              {trip.bookings.map((booking) => (
                                <div key={booking.id} className="py-2 flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-sm">
                                      {booking.passenger?.firstName} {booking.passenger?.lastName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Seat {booking.seatId ? booking.seatId.split('s')[1]?.split('v')[0] || 'N/A' : 'N/A'}
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
                                      <span className={`badge badge-${booking.status === 'pending' ? 'warning' : 'secondary'} text-xs`}>{booking.status}</span>
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
                    You don't have any scheduled trips starting soon.
                  </p>
                  <div className="mt-6">
                    {/* Changed Link to button */}
                    <button onClick={openCreateModal} className="btn btn-primary">
                      Create New Trip
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div>
          <div className="card rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Daily Summary</h2>
            </div>
            <div className="p-4 sm:px-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="card p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Trips Today</p>
                  <p className="text-2xl font-bold text-primary-600">{totalTripsToday}</p>
                </div>
                <div className="card p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Passengers (Est.)</p>
                  <p className="text-2xl font-bold text-primary-600">{totalPassengers}</p>
                </div>
                <div className="card p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-success-600">{completedTrips}</p>
                </div>
                <div className="card p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Upcoming</p>
                  <p className="text-2xl font-bold text-accent-600">{upcomingTripsCount}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-4 sm:px-6">
              <div className="space-y-3">
                <Link
                  to="/driver/scanner" // Keep as Link for navigation
                  className="btn btn-primary w-full flex items-center justify-center"
                >
                  <QRScannerIcon className="h-5 w-5 mr-2" />
                  Open QR Scanner
                </Link>
                {/* Changed Link to button */}
                <button
                  onClick={openCreateModal}
                  className="btn btn-secondary w-full flex items-center justify-center"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  New Trip
                </button>
                <Link
                  to="/driver/vehicles" // Ensure this is a Link for navigation
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

      {/* Trip Form Modal */}
      <TripForm
        isOpen={isTripModalOpen}
        onClose={() => setIsTripModalOpen(false)}
        tripToEdit={tripToEdit}
      />
      <PasswordConfirmationModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onConfirm={handlePasswordConfirm}
        title="Confirm Password to View Income"
        message="Please enter your password to view your income details."
      />
    </div>
  );
};

export default DriverDashboard;

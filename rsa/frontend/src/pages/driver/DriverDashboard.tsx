import '../../index.css';
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getBookingsWithDetails, mockRoutes, mockVehicles, mockDriverIncome } from '../../utils/mockData';
import { Calendar, Clock, Users, AlertCircle, Settings, Plus, CheckCircle, Info, Edit, Trash2, DollarSign, Eye, EyeOff, Filter, MapPin, Navigation, ArrowRight, Shield, Truck, BarChart } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useTripStore, { Trip } from '../../store/tripStore';
import QRScannerIcon from '../../components/icons/QRScannerIcon';
import TripForm from '../../components/trips/TripForm';
import PasswordConfirmationModal from '../../components/common/PasswordConfirmationModal';

// Define BookingWithDetails interface for type safety
interface BookingWithDetails {
  id: string;
  tripId: string;
  passenger?: {
    firstName: string;
    lastName: string;
  };
  status: string;
  seat?: string;
  pickupOption?: string;
}

const DriverDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { trips, fetchTrips, updateTrip, markTripAsCompleted } = useTripStore();
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

  // Calculate metrics based on trips from the store
  const totalTripsToday = trips.filter(t => {
    const tripDate = new Date(t.date);
    const today = new Date();
    return tripDate.toDateString() === today.toDateString();
  }).length;

  const totalPassengers = trips.filter(t => t.status === 'completed').length;
  const upcomingTripsCount = trips.filter(t => t.status === 'upcoming').length;

  // Get all bookings with details
  const allBookings = getBookingsWithDetails() as BookingWithDetails[];

  // Group bookings by trip
  const tripGroups = allBookings.reduce((groups: { [key: string]: BookingWithDetails[] }, booking) => {
    const key = booking.tripId;
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
  const scheduledTripsForPeriod = useMemo(() => tripsForPeriod.filter(t => t.status === 'upcoming' || t.status === 'scheduled').length, [tripsForPeriod]);

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
      updateTrip(tripId, { driverId: user.id, status: 'scheduled' });
      alert("Trip claimed successfully!");
      fetchTrips();
    }
  };

  const handleMarkTripAsCompleted = (tripId: string) => {
    if (window.confirm("Are you sure you want to mark this trip as completed?")) {
      markTripAsCompleted(tripId);
      alert("Trip marked as completed!");
      fetchTrips();
    }
  };

  // Helper function to format seat information
  const formatSeatInfo = (booking: BookingWithDetails) => {
    if (!booking.seat) return 'N/A';
    return booking.seat;
  };

  // Helper function to check if pickup is doorstep
  const hasDoorstepPickup = (booking: BookingWithDetails) => {
    return booking.pickupOption === 'doorstep';
  };

  // Helper function to get the vehicle name from a trip
  const getVehicleInfo = (trip: Trip): string => {
    if (trip.vehicle) {
      // Use optional chaining to access potentially undefined properties
      return `${trip.vehicle.model || 'Vehicle'}`;
    }
    return 'Vehicle';
  };

  // Helper function to get the seat capacity
  const getSeatCapacity = (trip: Trip): string | number => {
    if (trip.vehicle && trip.vehicle.capacity) {
      return trip.vehicle.capacity;
    }
    if (trip.availableSeats !== undefined) {
      return trip.availableSeats;
    }
    return 'N/A';
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-section-dark">
      {/* Dashboard Navigation */}
      <React.Suspense fallback={<div className="p-8 text-center">Loading navigation...</div>}>
        <DashboardNavbar userRole="driver" />
      </React.Suspense>

      <div className="container-app mx-auto px-4 py-8">
        {/* Header with actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0 mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold text-text-base dark:text-text-inverse">Driver Dashboard</h1>
            <p className="mt-1 text-sm text-text-muted dark:text-text-muted-dark">
            {user && `Welcome back, ${user.firstName} ${user.lastName}`}
          </p>
        </div>
          <div className="flex flex-wrap gap-3 items-center">
            <button onClick={openCreateModal} className="btn btn-primary flex items-center gap-2">
              <Plus className="h-4 w-4" />
            New Trip
          </button>
            <Link to="/driver/check-in" className="btn btn-secondary flex items-center gap-2">
              <QRScannerIcon className="h-4 w-4" /> 
            Validate Ticket
          </Link>
        </div>
      </div>

      {/* Available Trips Section */}
      {availableTrips.length > 0 && (
          <div className="mb-8 card bg-base-100 dark:bg-section-dark rounded-lg shadow-sm border border-primary-100 dark:border-primary-800 p-6">
            <h2 className="text-xl font-semibold mb-4 text-text-base dark:text-text-inverse flex items-center">
              <Truck className="h-5 w-5 mr-2 text-primary dark:text-primary-200" />
              Available Trips for Claiming
            </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableTrips.map(trip => (
                <div key={trip.id} className="card bg-section-light dark:bg-section-medium rounded-lg shadow-sm border border-primary-100 dark:border-primary-800 p-4 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-text-base dark:text-text-inverse">{trip.fromLocation || ''} to {trip.toLocation || ''}</h3>
                    <span className="badge badge-sm badge-warning">
                      {trip.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="space-y-1 mb-3">
                    <p className="text-sm text-text-muted dark:text-text-muted-dark flex items-center">
                      <Calendar className="h-4 w-4 mr-1" /> {trip.date} at {trip.time}
                    </p>
                    <p className="text-sm text-text-muted dark:text-text-muted-dark flex items-center">
                      <Truck className="h-4 w-4 mr-1" /> {getVehicleInfo(trip)}
                    </p>
                    {trip.price && (
                      <p className="text-sm text-text-muted dark:text-text-muted-dark flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" /> ${trip.price.toFixed(2)}
                      </p>
                    )}
                  </div>
                <button 
                  onClick={() => handleClaimTrip(trip.id)} 
                    className="btn btn-success btn-sm w-full flex items-center justify-center gap-2"
                >
                    <Shield className="h-4 w-4" />
                  Claim Trip
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trip Statistics Section */}
        <div className="mb-8 card bg-base-100 dark:bg-section-dark rounded-lg shadow-sm border border-primary-100 dark:border-primary-800 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-text-base dark:text-text-inverse flex items-center">
              <BarChart className="h-5 w-5 mr-2 text-primary dark:text-primary-200" />
              Trip Statistics
            </h2>
            <div className="flex items-center bg-section-light dark:bg-section-medium rounded-lg p-2">
              <Filter className="h-5 w-5 text-text-muted dark:text-text-muted-dark mr-2" />
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly')}
                className="select select-bordered select-sm focus:ring-0 focus:outline-none text-text-base dark:text-text-inverse bg-transparent"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card bg-section-light dark:bg-section-medium p-4 rounded-lg border border-primary-100 dark:border-primary-800 transition-all hover:shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-text-muted dark:text-text-muted-dark">Scheduled</p>
                <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900">
                  <Clock className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-3xl font-semibold text-text-base dark:text-text-inverse">{scheduledTripsForPeriod}</p>
              <p className="text-xs text-text-muted dark:text-text-muted-dark mt-1 capitalize">For {timePeriod} Period</p>
            </div>
            <div className="card bg-section-light dark:bg-section-medium p-4 rounded-lg border border-primary-100 dark:border-primary-800 transition-all hover:shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-text-muted dark:text-text-muted-dark">Completed</p>
                <div className="p-2 rounded-full bg-green-50 dark:bg-green-900">
                  <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
                </div>
              </div>
              <p className="text-3xl font-semibold text-text-base dark:text-text-inverse">{completedTripsForPeriod}</p>
              <p className="text-xs text-text-muted dark:text-text-muted-dark mt-1 capitalize">For {timePeriod} Period</p>
            </div>
            <div className="card bg-section-light dark:bg-section-medium p-4 rounded-lg border border-primary-100 dark:border-primary-800 transition-all hover:shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-text-muted dark:text-text-muted-dark">Cancelled</p>
                <div className="p-2 rounded-full bg-red-50 dark:bg-red-900">
                  <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
          </div>
          </div>
              <p className="text-3xl font-semibold text-text-base dark:text-text-inverse">{cancelledTripsForPeriod}</p>
              <p className="text-xs text-text-muted dark:text-text-muted-dark mt-1 capitalize">For {timePeriod} Period</p>
          </div>
        </div>
      </div>

      {/* Income Section */}
        <div className="mb-8 card bg-base-100 dark:bg-section-dark rounded-lg shadow-sm border border-primary-100 dark:border-primary-800 p-6">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-text-base dark:text-text-inverse flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-primary dark:text-primary-200" />
              Income ({timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)})
            </h2>
            <button 
              onClick={toggleShowIncome} 
              className="btn btn-ghost btn-sm flex items-center gap-2"
            >
              {showIncome ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showIncome ? 'Hide' : 'Show'} Income
          </button>
        </div>
        {showIncome ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-200 mb-1">Total Earnings</p>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-300 flex items-center">
                    <DollarSign className="h-7 w-7 mr-1" />
              {driverIncome.toFixed(2)}
            </p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-800 rounded-full">
                  <DollarSign className="h-8 w-8 text-yellow-600 dark:text-yellow-300" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-yellow-200 dark:border-yellow-800 text-sm text-yellow-700 dark:text-yellow-200">
                <p className="flex justify-between mb-1">
                  <span>Trips completed:</span>
                  <span className="font-medium">{completedTripsForPeriod}</span>
                </p>
                <p className="flex justify-between">
                  <span>Average per trip:</span>
                  <span className="font-medium">${completedTripsForPeriod > 0 ? (driverIncome / completedTripsForPeriod).toFixed(2) : '0.00'}</span>
                </p>
              </div>
          </div>
        ) : (
            <div className="text-center py-10 bg-section-light dark:bg-section-medium rounded-lg border border-dashed border-primary-200 dark:border-primary-800">
              <div className="mx-auto h-12 w-12 text-text-muted dark:text-text-muted-dark">
                <DollarSign className="h-12 w-12" />
              </div>
              <p className="mt-2 text-text-muted dark:text-text-muted-dark">Income is hidden. Click 'Show Income' and enter password to view.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <div className="card bg-base-100 dark:bg-section-dark rounded-lg shadow-sm border border-primary-100 dark:border-primary-800 overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-primary-100 dark:border-primary-800 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-text-base dark:text-text-inverse flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary dark:text-primary-200" />
                  Upcoming Trips
                </h2>
                <button 
                  onClick={openCreateModal}
                  className="btn btn-primary btn-sm flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" /> New Trip
                </button>
            </div>

            <div className="overflow-hidden">
              {upcomingDetailedTrips.length > 0 ? (
                  <div className="divide-y divide-primary-100 dark:divide-primary-800">
                  {upcomingDetailedTrips.map((trip) => (
                    <div
                      key={trip.id}
                        className={`cursor-pointer p-6 transition-colors hover:bg-section-light dark:hover:bg-section-medium ${
                          selectedTrip?.id === trip.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                        }`}
                      onClick={() => setSelectedTrip(trip.id === selectedTrip?.id ? null : trip)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-medium text-text-base dark:text-text-inverse">
                            {trip.fromLocation} to {trip.toLocation}
                          </h3>
                            <div className="mt-1 flex items-center text-sm text-text-muted dark:text-text-muted-dark">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{trip.date}</span>
                            <span className="mx-2">•</span>
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{trip.time}</span>
                          </div>
                            <div className="mt-1 flex items-center">
                              <span className={`badge ${
                                trip.status === 'completed' ? 'badge-success' :
                                trip.status === 'active' ? 'badge-info' :
                                trip.status === 'cancelled' ? 'badge-error' :
                                'badge-warning'
                              }`}>{trip.status.charAt(0).toUpperCase() + trip.status.slice(1).replace('_', ' ')}</span>
                              
                              <span className="ml-3 text-xs text-text-muted dark:text-text-muted-dark flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                {trip.confirmedBookings || 0} confirmed / {trip.totalBookings || 0} total
                              </span>
                            </div>
                        </div>

                        <div className="flex flex-col items-end">
                            <div className="flex items-center text-sm text-text-muted dark:text-text-muted-dark">
                              <Users className="h-4 w-4 mr-1" />
                              <span>
                                {trip.confirmedBookings || 0} / {getSeatCapacity(trip)} seats
                            </span>
                          </div>
                          {trip.pendingBookings > 0 && (
                              <div className="mt-1 flex items-center text-xs text-yellow-600 dark:text-yellow-400">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              <span>{trip.pendingBookings} pending</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {selectedTrip?.id === trip.id && (
                          <div className="mt-4 pt-4 border-t border-primary-100 dark:border-primary-800 animate-fade-in">
                          <div className="mb-4 flex justify-between items-center">
                              <h4 className="font-medium text-text-base dark:text-text-inverse">Passenger List & Actions</h4>
                            <div className="flex space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditModal(trip);
                                }}
                                  className="btn btn-ghost btn-sm flex items-center gap-2"
                              >
                                  <Edit size={12} /> Edit
                              </button>
                              {trip.status !== 'completed' && trip.status !== 'cancelled' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkTripAsCompleted(trip.id);
                                  }}
                                    className="btn btn-success btn-sm flex items-center gap-2"
                                >
                                    <CheckCircle size={12} /> Mark Completed
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Passenger List */}                          
                            {trip.bookings && trip.bookings.length > 0 ? (
                              <div className="divide-y divide-primary-100 dark:divide-primary-800 max-h-60 overflow-y-auto pr-2">
                              {trip.bookings.map((booking) => (
                                  <div key={booking.id} className="py-3 flex items-center justify-between">
                                  <div>
                                      <p className="font-medium text-sm text-text-base dark:text-text-inverse">
                                      {booking.passenger?.firstName} {booking.passenger?.lastName}
                                    </p>
                                      <p className="text-xs text-text-muted dark:text-text-muted-dark">
                                        Seat {formatSeatInfo(booking)}
                                        {hasDoorstepPickup(booking) && ' • Doorstep Pickup'}
                                    </p>
                                  </div>
                                  <div>
                                    {booking.status === 'confirmed' ? (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCheckInPassenger(booking.id);
                                        }}
                                          className="btn btn-success btn-sm flex items-center gap-2"
                                      >
                                          <CheckCircle size={12} />
                                        Check In
                                      </button>
                                    ) : booking.status === 'checked-in' ? (
                                        <span className="badge badge-success">Checked In</span>
                                      ) : (
                                        <span className={`badge ${
                                          booking.status === 'pending' 
                                            ? 'badge-warning'
                                            : 'badge-ghost'
                                        }`}>{booking.status}</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                              <div className="text-center py-6 bg-section-light dark:bg-section-medium rounded-lg">
                                <p className="text-text-muted dark:text-text-muted-dark">
                              No bookings for this trip yet.
                            </p>
                              </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                    <div className="mx-auto h-12 w-12 bg-section-light dark:bg-section-medium rounded-full flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-text-muted dark:text-text-muted-dark" />
                  </div>
                    <h3 className="mt-2 text-sm font-medium text-text-base dark:text-text-inverse">No upcoming trips</h3>
                    <p className="mt-1 text-sm text-text-muted dark:text-text-muted-dark">
                    You don't have any scheduled trips starting soon.
                  </p>
                  <div className="mt-6">
                    <button onClick={openCreateModal} className="btn btn-primary">
                        <Plus className="h-4 w-4 mr-2" />
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
            <div className="card bg-base-100 dark:bg-section-dark rounded-lg shadow-sm border border-primary-100 dark:border-primary-800 overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-primary-100 dark:border-primary-800">
                <h2 className="text-lg font-semibold text-text-base dark:text-text-inverse flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-primary dark:text-primary-200" />
                  Daily Summary
                </h2>
            </div>
              <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                  <div className="card bg-section-light dark:bg-section-medium p-3 rounded-lg">
                    <p className="text-xs text-text-muted dark:text-text-muted-dark mb-1">Trips Today</p>
                    <p className="text-2xl font-bold text-primary dark:text-primary-200">{totalTripsToday}</p>
                </div>
                  <div className="card bg-section-light dark:bg-section-medium p-3 rounded-lg">
                    <p className="text-xs text-text-muted dark:text-text-muted-dark mb-1">Passengers</p>
                    <p className="text-2xl font-bold text-primary dark:text-primary-200">{totalPassengers}</p>
                </div>
                  <div className="card bg-section-light dark:bg-section-medium p-3 rounded-lg">
                    <p className="text-xs text-text-muted dark:text-text-muted-dark mb-1">Completed</p>
                    <p className="text-2xl font-bold text-green-500 dark:text-green-400">{completedTrips}</p>
                </div>
                  <div className="card bg-section-light dark:bg-section-medium p-3 rounded-lg">
                    <p className="text-xs text-text-muted dark:text-text-muted-dark mb-1">Upcoming</p>
                    <p className="text-2xl font-bold text-blue-500 dark:text-blue-400">{upcomingTripsCount}</p>
                </div>
              </div>
            </div>
          </div>

            <div className="card bg-base-100 dark:bg-section-dark rounded-lg shadow-sm border border-primary-100 dark:border-primary-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-primary-100 dark:border-primary-800">
                <h2 className="text-lg font-semibold text-text-base dark:text-text-inverse flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-primary dark:text-primary-200" />
                  Quick Actions
                </h2>
            </div>
              <div className="p-4">
              <div className="space-y-3">
                <Link
                    to="/driver/scanner"
                    className="btn btn-primary w-full flex items-center justify-center gap-2"
                >
                    <QRScannerIcon className="h-5 w-5" />
                  Open QR Scanner
                </Link>
                <button
                  onClick={openCreateModal}
                    className="btn btn-secondary w-full flex items-center justify-center gap-2"
                >
                    <Plus className="h-5 w-5" />
                  New Trip
                </button>
                <Link
                    to="/driver/vehicles"
                    className="btn btn-outline btn-secondary w-full flex items-center justify-center gap-2"
                  >
                    <Truck className="h-5 w-5" />
                  Manage Vehicles
                </Link>
              </div>

                <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-100 dark:border-primary-800 flex items-start">
                  <Info className="h-5 w-5 text-primary dark:text-primary-200 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                    <p className="text-sm text-primary-700 dark:text-primary-300 font-medium">Remember</p>
                    <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
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
        
        {/* Password Confirmation Modal */}
      <PasswordConfirmationModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onConfirm={handlePasswordConfirm}
        title="Confirm Password to View Income"
        message="Please enter your password to view your income details."
      />
      </div>
    </div>
  );
};

export default DriverDashboard;

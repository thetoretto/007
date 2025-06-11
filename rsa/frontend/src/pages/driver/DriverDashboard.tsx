import '../../index.css';
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getBookingsWithDetails, mockDriverIncome } from '../../utils/mockData';
import { Calendar, Clock, Users, AlertCircle, Settings, Plus, CheckCircle, Info, Edit, DollarSign, Eye, EyeOff, Filter, Navigation, ArrowRight, Shield, Truck, BarChart } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useTripStore, { Trip } from '../../store/tripStore';
import QRScannerIcon from '../../components/icons/QRScannerIcon';
import TripForm from '../../components/trips/TripForm';
import PasswordConfirmationModal from '../../components/common/PasswordConfirmationModal';
import ToastContainer from '../../components/common/ToastContainer';

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

  useEffect(() => {
    fetchTrips(); // Fetch trips on component mount
  }, [fetchTrips]);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    <div className="driver-dashboard">
      <ToastContainer />

      {/* Modern Header */}
      <header className="driver-header mb-8">
        <div className="container-app">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="icon-badge icon-badge-lg bg-primary text-on-primary">
                  <Truck className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-light-primary dark:text-dark-primary">
                    Driver Dashboard
                  </h1>
                  <p className="text-sm text-light-secondary dark:text-dark-secondary">
                    {user && `Welcome back, ${user.firstName} ${user.lastName}`}
                  </p>
                </div>
              </div>
              <div className="driver-status-badge online">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                Online & Available
              </div>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <button
                onClick={openCreateModal}
                className="btn btn-primary flex items-center gap-2 px-4 py-3 shadow-primary"
              >
                <Plus className="h-5 w-5" />
                New Trip
              </button>
              <Link
                to="/driver/check-in"
                className="btn btn-secondary flex items-center gap-2 px-4 py-3 shadow-secondary"
              >
                <QRScannerIcon className="h-5 w-5" />
                Validate Ticket
              </Link>
              <Link
                to="/driver/settings"
                className="btn btn-ghost flex items-center gap-2 px-4 py-3"
                title="My Account Settings"
              >
                <Settings className="h-5 w-5" />
                My Account
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-app py-8">
        {/* Key Metrics Section */}
        <section className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="driver-metric-card">
              <div className="flex items-center justify-between mb-3">
                <div className="driver-metric-label">Today's Trips</div>
                <div className="icon-badge icon-badge-md bg-primary-light text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>
              <div className="driver-metric-value">{totalTripsToday}</div>
              <div className="driver-metric-change positive">
                <ArrowRight className="h-3 w-3 rotate-[-45deg]" />
                +12% from yesterday
              </div>
            </div>

            <div className="driver-metric-card">
              <div className="flex items-center justify-between mb-3">
                <div className="driver-metric-label">Total Passengers</div>
                <div className="icon-badge icon-badge-md bg-secondary-light text-secondary">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="driver-metric-value">{totalPassengers}</div>
              <div className="driver-metric-change positive">
                <ArrowRight className="h-3 w-3 rotate-[-45deg]" />
                +8% this week
              </div>
            </div>

            <div className="driver-metric-card">
              <div className="flex items-center justify-between mb-3">
                <div className="driver-metric-label">Completed</div>
                <div className="icon-badge icon-badge-md bg-secondary-light text-secondary">
                  <CheckCircle className="h-5 w-5" />
                </div>
              </div>
              <div className="driver-metric-value">{completedTrips}</div>
              <div className="driver-metric-change positive">
                <ArrowRight className="h-3 w-3 rotate-[-45deg]" />
                +15% this month
              </div>
            </div>

            <div className="driver-metric-card">
              <div className="flex items-center justify-between mb-3">
                <div className="driver-metric-label">Upcoming</div>
                <div className="icon-badge icon-badge-md bg-primary-light text-primary">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
              <div className="driver-metric-value">{upcomingTripsCount}</div>
              <div className="driver-metric-change positive">
                <ArrowRight className="h-3 w-3 rotate-[-45deg]" />
                Next trip in 2h
              </div>
            </div>
          </div>
        </section>

        {/* Available Trips Section */}
        {availableTrips.length > 0 && (
          <section className="mb-8">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="icon-badge icon-badge-md bg-accent-light text-accent">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-light-primary dark:text-dark-primary">
                      Available Trips
                    </h2>
                    <p className="text-sm text-light-secondary dark:text-dark-secondary">
                      {availableTrips.length} trips waiting to be claimed
                    </p>
                  </div>
                </div>
                <div className="driver-status-badge busy">
                  <AlertCircle className="h-3 w-3" />
                  {availableTrips.length} Available
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {availableTrips.map(trip => (
                  <div key={trip.id} className="driver-trip-card group">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-light-primary dark:text-dark-primary mb-1">
                          {trip.fromLocation || ''} → {trip.toLocation || ''}
                        </h3>
                        <div className="driver-status-badge online">
                          {trip.status.replace('_', ' ')}
                        </div>
                      </div>
                      <div className="icon-badge icon-badge-sm bg-primary-light text-primary">
                        <Navigation className="h-4 w-4" />
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-light-secondary dark:text-dark-secondary">
                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                        {trip.date} at {trip.time}
                      </div>
                      <div className="flex items-center text-sm text-light-secondary dark:text-dark-secondary">
                        <Truck className="h-4 w-4 mr-2 text-secondary" />
                        {getVehicleInfo(trip)}
                      </div>
                      {trip.price && (
                        <div className="flex items-center text-sm text-light-secondary dark:text-dark-secondary">
                          <DollarSign className="h-4 w-4 mr-2 text-accent" />
                          ${trip.price.toFixed(2)}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleClaimTrip(trip.id)}
                      className="btn btn-primary w-full flex items-center justify-center gap-2 group-hover:shadow-primary-lg transition-all duration-300"
                    >
                      <Shield className="h-4 w-4" />
                      Claim Trip
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Trip Statistics Section */}
        <section className="mb-8">
          <div className="card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="icon-badge icon-badge-md bg-secondary-light text-secondary">
                  <BarChart className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-light-primary dark:text-dark-primary">
                    Trip Analytics
                  </h2>
                  <p className="text-sm text-light-secondary dark:text-dark-secondary">
                    Performance overview for {timePeriod} period
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-light-tertiary dark:text-dark-tertiary" />
                <select
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly')}
                  className="form-select text-sm min-w-[120px]"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="driver-metric-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="driver-metric-label">Scheduled</div>
                  <div className="icon-badge icon-badge-md bg-primary-light text-primary">
                    <Clock className="h-5 w-5" />
                  </div>
                </div>
                <div className="driver-metric-value">{scheduledTripsForPeriod}</div>
                <div className="driver-progress-bar mt-3">
                  <div
                    className="driver-progress-fill"
                    style={{ width: `${Math.min((scheduledTripsForPeriod / Math.max(scheduledTripsForPeriod + completedTripsForPeriod + cancelledTripsForPeriod, 1)) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-light-tertiary dark:text-dark-tertiary mt-2 capitalize">
                  {timePeriod} period
                </p>
              </div>

              <div className="driver-metric-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="driver-metric-label">Completed</div>
                  <div className="icon-badge icon-badge-md bg-secondary-light text-secondary">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                </div>
                <div className="driver-metric-value">{completedTripsForPeriod}</div>
                <div className="driver-progress-bar mt-3">
                  <div
                    className="driver-progress-fill"
                    style={{ width: `${Math.min((completedTripsForPeriod / Math.max(scheduledTripsForPeriod + completedTripsForPeriod + cancelledTripsForPeriod, 1)) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-light-tertiary dark:text-dark-tertiary mt-2 capitalize">
                  {timePeriod} period
                </p>
              </div>

              <div className="driver-metric-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="driver-metric-label">Cancelled</div>
                  <div className="icon-badge icon-badge-md bg-accent-light text-accent">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                </div>
                <div className="driver-metric-value">{cancelledTripsForPeriod}</div>
                <div className="driver-progress-bar mt-3">
                  <div
                    className="driver-progress-fill"
                    style={{
                      width: `${Math.min((cancelledTripsForPeriod / Math.max(scheduledTripsForPeriod + completedTripsForPeriod + cancelledTripsForPeriod, 1)) * 100, 100)}%`,
                      background: 'linear-gradient(90deg, var(--accent), var(--accent-dark))'
                    }}
                  ></div>
                </div>
                <p className="text-xs text-light-tertiary dark:text-dark-tertiary mt-2 capitalize">
                  {timePeriod} period
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Today's Performance Summary */}
        <section className="mb-8">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="icon-badge icon-badge-md bg-primary-light text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-light-primary dark:text-dark-primary">
                  Today's Performance
                </h2>
                <p className="text-sm text-light-secondary dark:text-dark-secondary">
                  Real-time daily overview and progress
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="driver-metric-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="driver-metric-label">Trips Today</div>
                  <div className="icon-badge icon-badge-sm bg-primary-light text-primary">
                    <Calendar className="h-4 w-4" />
                  </div>
                </div>
                <div className="driver-metric-value text-2xl">{totalTripsToday}</div>
                <div className="driver-progress-bar mt-2">
                  <div className="driver-progress-fill" style={{ width: `${Math.min((totalTripsToday / 10) * 100, 100)}%` }}></div>
                </div>
                <p className="text-xs text-light-tertiary dark:text-dark-tertiary mt-2">
                  Target: 10 trips
                </p>
              </div>

              <div className="driver-metric-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="driver-metric-label">Passengers</div>
                  <div className="icon-badge icon-badge-sm bg-secondary-light text-secondary">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
                <div className="driver-metric-value text-2xl">{totalPassengers}</div>
                <div className="driver-progress-bar mt-2">
                  <div className="driver-progress-fill" style={{ width: `${Math.min((totalPassengers / 50) * 100, 100)}%` }}></div>
                </div>
                <p className="text-xs text-light-tertiary dark:text-dark-tertiary mt-2">
                  Target: 50 passengers
                </p>
              </div>

              <div className="driver-metric-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="driver-metric-label">Completed</div>
                  <div className="icon-badge icon-badge-sm bg-secondary-light text-secondary">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                </div>
                <div className="driver-metric-value text-2xl">{completedTrips}</div>
                <div className="driver-progress-bar mt-2">
                  <div className="driver-progress-fill" style={{ width: `${Math.min((completedTrips / 20) * 100, 100)}%` }}></div>
                </div>
                <p className="text-xs text-light-tertiary dark:text-dark-tertiary mt-2">
                  Success rate: {Math.round((completedTrips / Math.max(totalTripsToday, 1)) * 100)}%
                </p>
              </div>

              <div className="driver-metric-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="driver-metric-label">Efficiency</div>
                  <div className="icon-badge icon-badge-sm bg-accent-light text-accent">
                    <BarChart className="h-4 w-4" />
                  </div>
                </div>
                <div className="driver-metric-value text-2xl">
                  {Math.round((completedTrips / Math.max(totalTripsToday, 1)) * 100)}%
                </div>
                <div className="driver-progress-bar mt-2">
                  <div className="driver-progress-fill" style={{ width: `${Math.round((completedTrips / Math.max(totalTripsToday, 1)) * 100)}%` }}></div>
                </div>
                <p className="text-xs text-light-tertiary dark:text-dark-tertiary mt-2">
                  Completion rate
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Income Section */}
        <section className="mb-8">
          <div className="card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="icon-badge icon-badge-md bg-primary-light text-primary">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-light-primary dark:text-dark-primary">
                    Earnings Overview
                  </h2>
                  <p className="text-sm text-light-secondary dark:text-dark-secondary">
                    {timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)} income summary
                  </p>
                </div>
              </div>

              <button
                onClick={toggleShowIncome}
                className="btn btn-ghost btn-sm flex items-center gap-2"
              >
                {showIncome ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showIncome ? 'Hide' : 'Show'} Income
              </button>
            </div>

            {showIncome ? (
              <div className="driver-income-card">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="driver-income-label">Total Earnings</div>
                    <div className="driver-income-value">
                      ${driverIncome.toFixed(2)}
                    </div>
                  </div>
                  <div className="icon-badge icon-badge-xl bg-white/20 text-on-primary">
                    <DollarSign className="h-8 w-8" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-on-primary mb-1">
                      {completedTripsForPeriod}
                    </div>
                    <div className="text-sm text-on-primary opacity-80">
                      Trips Completed
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-on-primary mb-1">
                      ${completedTripsForPeriod > 0 ? (driverIncome / completedTripsForPeriod).toFixed(2) : '0.00'}
                    </div>
                    <div className="text-sm text-on-primary opacity-80">
                      Average per Trip
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-on-primary mb-1">
                      {Math.round((completedTripsForPeriod / Math.max(scheduledTripsForPeriod + completedTripsForPeriod, 1)) * 100)}%
                    </div>
                    <div className="text-sm text-on-primary opacity-80">
                      Completion Rate
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="driver-loading-card">
                <div className="icon-badge icon-badge-xl bg-light-secondary text-light-tertiary dark:bg-dark-secondary dark:text-dark-tertiary mx-auto mb-4">
                  <DollarSign className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-2">
                  Income Protected
                </h3>
                <p className="text-light-secondary dark:text-dark-secondary">
                  Click 'Show Income' and enter your password to view earnings details.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions Section */}
        <section className="mb-8">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="icon-badge icon-badge-md bg-secondary-light text-secondary">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-light-primary dark:text-dark-primary">
                  Quick Actions
                </h2>
                <p className="text-sm text-light-secondary dark:text-dark-secondary">
                  Essential driver tools and shortcuts
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to="/driver/check-in"
                className="driver-quick-action group"
              >
                <div className="icon-badge icon-badge-md bg-primary-light text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-300 mb-3">
                  <QRScannerIcon className="h-5 w-5" />
                </div>
                <div className="font-medium text-light-primary dark:text-dark-primary mb-1">
                  QR Scanner
                </div>
                <div className="text-sm text-light-secondary dark:text-dark-secondary">
                  Validate tickets
                </div>
              </Link>

              <Link
                to="/driver/vehicle"
                className="driver-quick-action group"
              >
                <div className="icon-badge icon-badge-md bg-accent-light text-accent group-hover:bg-accent group-hover:text-on-accent transition-all duration-300 mb-3">
                  <Truck className="h-5 w-5" />
                </div>
                <div className="font-medium text-light-primary dark:text-dark-primary mb-1">
                  Vehicles
                </div>
                <div className="text-sm text-light-secondary dark:text-dark-secondary">
                  Manage fleet
                </div>
              </Link>

              <Link
                to="/driver/settings"
                className="driver-quick-action group"
              >
                <div className="icon-badge icon-badge-md bg-primary-light text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-300 mb-3">
                  <Settings className="h-5 w-5" />
                </div>
                <div className="font-medium text-light-primary dark:text-dark-primary mb-1">
                  My Account
                </div>
                <div className="text-sm text-light-secondary dark:text-dark-secondary">
                  Settings & profile
                </div>
              </Link>

              <button
                onClick={openCreateModal}
                className="driver-quick-action group w-full"
              >
                <div className="icon-badge icon-badge-md bg-secondary-light text-secondary group-hover:bg-secondary group-hover:text-on-secondary transition-all duration-300 mb-3">
                  <Plus className="h-5 w-5" />
                </div>
                <div className="font-medium text-light-primary dark:text-dark-primary mb-1">
                  New Trip
                </div>
                <div className="text-sm text-light-secondary dark:text-dark-secondary">
                  Create schedule
                </div>
              </button>
            </div>

            {/* Driver Tip */}
            <div className="driver-notification mt-6">
              <div className="flex items-start gap-3">
                <div className="icon-badge icon-badge-sm bg-primary-light text-primary mt-0.5">
                  <Info className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium text-light-primary dark:text-dark-primary mb-1">
                    Safety Reminder
                  </div>
                  <div className="text-sm text-light-secondary dark:text-dark-secondary">
                    Always verify passenger identity and check tickets before boarding.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming Trips Section */}
        <section className="mb-8">
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-light dark:border-dark">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="icon-badge icon-badge-md bg-primary-light text-primary">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-light-primary dark:text-dark-primary">
                      Upcoming Trips
                    </h2>
                    <p className="text-sm text-light-secondary dark:text-dark-secondary">
                      {upcomingDetailedTrips.length} trips scheduled
                    </p>
                  </div>
                </div>
                <button
                  onClick={openCreateModal}
                  className="btn btn-primary flex items-center gap-2 shadow-primary"
                >
                  <Plus className="h-4 w-4" />
                  New Trip
                </button>
              </div>
            </div>

              <div className="overflow-hidden">
                {upcomingDetailedTrips.length > 0 ? (
                  <div className="divide-y divide-light dark:divide-dark">
                    {upcomingDetailedTrips.map((trip) => (
                      <div
                        key={trip.id}
                        className={`driver-trip-card cursor-pointer p-6 rounded-none border-0 ${
                          selectedTrip?.id === trip.id ? 'selected' : ''
                        }`}
                        onClick={() => setSelectedTrip(trip.id === selectedTrip?.id ? null : trip)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="icon-badge icon-badge-sm bg-primary-light text-primary">
                                <Navigation className="h-4 w-4" />
                              </div>
                              <div>
                                <h3 className="text-base font-semibold text-light-primary dark:text-dark-primary">
                                  {trip.fromLocation} → {trip.toLocation}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-light-secondary dark:text-dark-secondary mt-1">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {trip.date}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {trip.time}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className={`driver-status-badge ${
                                trip.status === 'completed' ? 'online' :
                                trip.status === 'active' ? 'busy' :
                                trip.status === 'cancelled' ? 'offline' :
                                'online'
                              }`}>
                                {trip.status.charAt(0).toUpperCase() + trip.status.slice(1).replace('_', ' ')}
                              </div>

                              <div className="flex items-center text-xs text-light-tertiary dark:text-dark-tertiary">
                                <Users className="h-3 w-3 mr-1" />
                                {trip.confirmedBookings || 0} confirmed / {trip.totalBookings || 0} total
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center text-sm text-light-secondary dark:text-dark-secondary">
                              <Users className="h-4 w-4 mr-1" />
                              <span className="font-medium">
                                {trip.confirmedBookings || 0} / {getSeatCapacity(trip)}
                              </span>
                            </div>
                            {trip.pendingBookings > 0 && (
                              <div className="driver-status-badge busy">
                                <AlertCircle className="h-3 w-3" />
                                {trip.pendingBookings} pending
                              </div>
                            )}
                          </div>
                        </div>

                        {selectedTrip?.id === trip.id && (
                          <div className="mt-6 pt-6 border-t border-light dark:border-dark animate-fade-in">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                              <div className="flex items-center gap-3">
                                <div className="icon-badge icon-badge-sm bg-secondary-light text-secondary">
                                  <Users className="h-4 w-4" />
                                </div>
                                <h4 className="font-semibold text-light-primary dark:text-dark-primary">
                                  Passenger Management
                                </h4>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditModal(trip);
                                  }}
                                  className="btn btn-ghost btn-sm flex items-center gap-2"
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit Trip
                                </button>
                                {trip.status !== 'completed' && trip.status !== 'cancelled' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkTripAsCompleted(trip.id);
                                    }}
                                    className="btn btn-secondary btn-sm flex items-center gap-2"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                    Complete Trip
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Passenger List */}
                            {trip.bookings && trip.bookings.length > 0 ? (
                              <div className="space-y-3 max-h-80 overflow-y-auto">
                                {trip.bookings.map((booking) => (
                                  <div key={booking.id} className="driver-trip-card p-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="icon-badge icon-badge-sm bg-primary-light text-primary">
                                          <Users className="h-3 w-3" />
                                        </div>
                                        <div>
                                          <p className="font-medium text-light-primary dark:text-dark-primary">
                                            {booking.passenger?.firstName} {booking.passenger?.lastName}
                                          </p>
                                          <div className="flex items-center gap-2 text-xs text-light-secondary dark:text-dark-secondary">
                                            <span>Seat {formatSeatInfo(booking)}</span>
                                            {hasDoorstepPickup(booking) && (
                                              <span className="driver-status-badge busy">
                                                Doorstep Pickup
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      <div>
                                        {booking.status === 'confirmed' ? (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleCheckInPassenger(booking.id);
                                            }}
                                            className="btn btn-secondary btn-sm flex items-center gap-2"
                                          >
                                            <CheckCircle className="h-3 w-3" />
                                            Check In
                                          </button>
                                        ) : booking.status === 'checked-in' ? (
                                          <div className="driver-status-badge online">
                                            <CheckCircle className="h-3 w-3" />
                                            Checked In
                                          </div>
                                        ) : (
                                          <div className={`driver-status-badge ${
                                            booking.status === 'pending' ? 'busy' : 'offline'
                                          }`}>
                                            {booking.status}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="driver-loading-card">
                                <div className="icon-badge icon-badge-lg bg-light-secondary text-light-tertiary dark:bg-dark-secondary dark:text-dark-tertiary mx-auto mb-4">
                                  <Users className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-2">
                                  No Passengers Yet
                                </h3>
                                <p className="text-light-secondary dark:text-dark-secondary">
                                  This trip doesn't have any bookings yet.
                                </p>
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                ) : (
                  <div className="driver-loading-card py-16">
                    <div className="icon-badge icon-badge-xl bg-light-secondary text-light-tertiary dark:bg-dark-secondary dark:text-dark-tertiary mx-auto mb-6">
                      <Calendar className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-light-primary dark:text-dark-primary mb-3">
                      No Upcoming Trips
                    </h3>
                    <p className="text-light-secondary dark:text-dark-secondary mb-6 max-w-md mx-auto">
                      You don't have any scheduled trips. Create a new trip to start accepting passengers.
                    </p>
                    <button
                      onClick={openCreateModal}
                      className="btn btn-primary flex items-center gap-2 mx-auto shadow-primary"
                    >
                      <Plus className="h-4 w-4" />
                      Create Your First Trip
                    </button>
                  </div>
                )}
              </div>
            </div>
        </section>
      </main>

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
  );
};

export default DriverDashboard;

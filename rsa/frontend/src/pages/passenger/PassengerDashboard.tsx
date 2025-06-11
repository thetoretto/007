import '../../index.css';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Search,
  TrendingUp,
  BarChart2,
  Ticket,
  Star,
  CreditCard,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  XCircle,
  Zap,
  Activity,
  RefreshCw,
  Filter,
  Bell
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { useBookingStore, BookingWithDetails } from '../../store/bookingStore';
import { getRandomRoutes, getRandomBookings } from '../../utils/mockData';
import ToastContainer from '../../components/common/ToastContainer';

// Types for better type safety
interface TripStats {
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
}

interface PopularRoute {
  id: string;
  origin: string;
  destination: string;
  count: number;
  price: number;
  duration?: string;
  nextDeparture?: string;
}

interface RecentActivity {
  id: string;
  type: 'booking' | 'payment' | 'trip' | 'review';
  description: string;
  date: string;
  status: 'completed' | 'cancelled' | 'pending';
  amount?: number;
  rating?: number;
}

// Enhanced dummy data with better structure
const dummyTripStats: TripStats = {
  total: 24,
  upcoming: 3,
  completed: 18,
  cancelled: 3,
};

// Enhanced popular routes with more details
const popularRoutes: PopularRoute[] = [
  {
    id: 'r1',
    origin: 'New York',
    destination: 'Boston',
    count: 5,
    price: 45,
    duration: '4h 30m',
    nextDeparture: '2:30 PM'
  },
  {
    id: 'r2',
    origin: 'Los Angeles',
    destination: 'San Francisco',
    count: 4,
    price: 55,
    duration: '6h 15m',
    nextDeparture: '3:45 PM'
  },
  {
    id: 'r3',
    origin: 'Chicago',
    destination: 'Detroit',
    count: 3,
    price: 35,
    duration: '5h 20m',
    nextDeparture: '1:15 PM'
  },
  {
    id: 'r4',
    origin: 'Miami',
    destination: 'Orlando',
    count: 6,
    price: 28,
    duration: '3h 45m',
    nextDeparture: '4:00 PM'
  },
];

// Enhanced recent activities with better data
const recentActivities: RecentActivity[] = [
  {
    id: 'a1',
    type: 'booking',
    description: 'Booked trip from New York to Boston',
    date: '2024-01-15',
    status: 'completed'
  },
  {
    id: 'a2',
    type: 'payment',
    description: 'Payment confirmed for San Francisco trip',
    date: '2024-01-12',
    amount: 55,
    status: 'completed'
  },
  {
    id: 'a3',
    type: 'trip',
    description: 'Trip to Chicago was cancelled due to weather',
    date: '2024-01-10',
    status: 'cancelled'
  },
  {
    id: 'a4',
    type: 'review',
    description: 'Left 5-star review for excellent service',
    date: '2024-01-08',
    rating: 5,
    status: 'completed'
  },
  {
    id: 'a5',
    type: 'booking',
    description: 'New booking for Miami to Orlando',
    date: '2024-01-05',
    status: 'pending'
  },
];

const PassengerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { bookings, fetchBookingsByUserId, isLoading, error } = useBookingStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filteredRoutes, setFilteredRoutes] = useState<PopularRoute[]>(popularRoutes);

  // Enhanced data fetching with error handling
  const fetchData = useCallback(async () => {
    if (user?.id) {
      setIsRefreshing(true);
      try {
        await fetchBookingsByUserId(user.id);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      } finally {
        setIsRefreshing(false);
      }
    }
  }, [user?.id, fetchBookingsByUserId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filter routes based on search term
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = popularRoutes.filter(route =>
        route.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.destination.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRoutes(filtered);
    } else {
      setFilteredRoutes(popularRoutes);
    }
  }, [searchTerm]);

  // Enhanced booking calculations with better logic
  const upcomingBookings: BookingWithDetails[] = useMemo(() => {
    if (bookings.length === 0) {
      // If no bookings in store, generate some dummy ones
      return getRandomBookings(3).filter(b =>
        ['pending', 'confirmed', 'booked'].includes(b.status as string)
      ) as BookingWithDetails[];
    }

    return bookings
      .filter(b => ['pending', 'confirmed', 'booked'].includes(b.status as string))
      .sort((a, b) => {
        // Sort by date, earliest first
        const dateA = new Date(a.trip?.date || '').getTime();
        const dateB = new Date(b.trip?.date || '').getTime();
        return dateA - dateB;
      })
      .slice(0, 3);
  }, [bookings]);

  const pastBookings: BookingWithDetails[] = useMemo(() => {
    if (bookings.length === 0) {
      // If no bookings in store, generate some dummy ones
      return getRandomBookings(6).filter(b =>
        ['completed', 'cancelled'].includes(b.status as string)
      ) as BookingWithDetails[];
    }

    return bookings
      .filter(b => ['completed', 'cancelled'].includes(b.status as string))
      .sort((a, b) => {
        // Sort by date, most recent first
        const dateA = new Date(a.trip?.date || '').getTime();
        const dateB = new Date(b.trip?.date || '').getTime();
        return dateB - dateA;
      })
      .slice(0, 6);
  }, [bookings]);

  // Calculate real-time stats from actual bookings
  const tripStats: TripStats = useMemo(() => {
    if (bookings.length === 0) {
      return dummyTripStats;
    }

    const stats = bookings.reduce((acc, booking) => {
      acc.total++;
      switch (booking.status) {
        case 'pending':
        case 'confirmed':
        case 'booked':
          acc.upcoming++;
          break;
        case 'completed':
          acc.completed++;
          break;
        case 'cancelled':
          acc.cancelled++;
          break;
      }
      return acc;
    }, { total: 0, upcoming: 0, completed: 0, cancelled: 0 });

    return stats;
  }, [bookings]);

  // Enhanced date formatting with better error handling
  const formatDate = useCallback((dateString: string, timeString: string = '') => {
    try {
      if (!dateString) return 'Date TBD';

      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';

      const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      return timeString ? `${formattedDate} at ${timeString}` : formattedDate;
    } catch (e) {
      console.error('Date formatting error:', e);
      return 'Date Error';
    }
  }, []);

  // Enhanced refresh handler
  const handleRefresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="badge badge-warning badge-sm">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'confirmed':
        return (
          <span className="badge badge-primary badge-sm">
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmed
          </span>
        );
      case 'completed':
        return (
          <span className="badge badge-success badge-sm">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="badge badge-error badge-sm">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </span>
        );
      case 'booked':
        return (
          <span className="badge badge-info badge-sm">
            <Ticket className="h-3 w-3 mr-1" />
            Booked
          </span>
        );
      default:
        return <span className="badge badge-ghost badge-sm">{status}</span>;
    }
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
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-light-primary dark:text-dark-primary">
                    Passenger Dashboard
                  </h1>
                  <p className="text-sm text-light-secondary dark:text-dark-secondary">
                    {user && `Welcome back, ${user.firstName} ${user.lastName}`}
                  </p>
                </div>
              </div>
              <div className="driver-status-badge online">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                Travel Ready
              </div>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-light-tertiary dark:text-dark-tertiary" />
                </div>
                <input
                  type="text"
                  placeholder="Search routes..."
                  className="form-input block w-full pl-10 pr-4 py-2"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search routes"
                />
              </div>

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="btn btn-outline flex items-center gap-2 px-3 py-2"
                aria-label="Refresh data"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>

              <Link to="/book" className="btn btn-primary flex items-center gap-2 px-4 py-3 shadow-primary">
                <Ticket className="h-5 w-5" />
                Book a Trip
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-app py-8">

        {/* Enhanced Quick Stats with Error Handling */}
        {error ? (
          <div className="driver-loading-card mb-8">
            <div className="icon-badge icon-badge-lg bg-error-light text-error mx-auto mb-4">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-2">
              Error Loading Dashboard
            </h3>
            <p className="text-light-secondary dark:text-dark-secondary mb-4">
              {error}
            </p>
            <button onClick={handleRefresh} className="btn btn-primary">
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="driver-metric-card group hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-light-secondary dark:text-dark-secondary">Total Trips</p>
                  <p className="text-3xl font-bold text-light-primary dark:text-dark-primary">
                    {isLoading ? '...' : tripStats.total}
                  </p>
                  <p className="text-xs text-light-tertiary dark:text-dark-tertiary mt-1">Lifetime trips</p>
                </div>
                <div className="icon-badge icon-badge-lg bg-primary-light text-primary group-hover:scale-110 transition-transform duration-300">
                  <BarChart2 className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="driver-metric-card group hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-light-secondary dark:text-dark-secondary">Upcoming</p>
                  <p className="text-3xl font-bold text-light-primary dark:text-dark-primary">
                    {isLoading ? '...' : tripStats.upcoming}
                  </p>
                  <p className="text-xs text-light-tertiary dark:text-dark-tertiary mt-1">Scheduled trips</p>
                </div>
                <div className="icon-badge icon-badge-lg bg-info-light text-info group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="driver-metric-card group hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-light-secondary dark:text-dark-secondary">Completed</p>
                  <p className="text-3xl font-bold text-light-primary dark:text-dark-primary">
                    {isLoading ? '...' : tripStats.completed}
                  </p>
                  <p className="text-xs text-light-tertiary dark:text-dark-tertiary mt-1">Successfully completed</p>
                </div>
                <div className="icon-badge icon-badge-lg bg-success-light text-success group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="driver-metric-card group hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-light-secondary dark:text-dark-secondary">Cancelled</p>
                  <p className="text-3xl font-bold text-light-primary dark:text-dark-primary">
                    {isLoading ? '...' : tripStats.cancelled}
                  </p>
                  <p className="text-xs text-light-tertiary dark:text-dark-tertiary mt-1">Cancelled trips</p>
                </div>
                <div className="icon-badge icon-badge-lg bg-error-light text-error group-hover:scale-110 transition-transform duration-300">
                  <XCircle className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions - Prominent Position */}
        <div className="driver-metric-card mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="icon-badge icon-badge-md bg-secondary-light text-secondary">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-light-primary dark:text-dark-primary">
                Quick Actions
              </h2>
              <p className="text-sm text-light-secondary dark:text-dark-secondary">
                Start your journey with these common tasks
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/book" className="btn btn-primary flex items-center justify-center gap-2 py-4">
              <Ticket className="h-5 w-5" />
              Book New Trip
            </Link>
            <Link to="/passenger/trips" className="btn btn-secondary flex items-center justify-center gap-2 py-4">
              <Calendar className="h-5 w-5" />
              View All Trips
            </Link>
            <Link to="/passenger/settings" className="btn btn-outline flex items-center justify-center gap-2 py-4">
              <User className="h-5 w-5" />
              Profile Settings
            </Link>
          </div>
        </div>

        {/* Main Content Grid - Symmetric Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upcoming Trips */}
          <div>
            <div className="driver-metric-card mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="icon-badge icon-badge-md bg-primary-light text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-light-primary dark:text-dark-primary">
                    Upcoming Trips
                  </h2>
                  <p className="text-sm text-light-secondary dark:text-dark-secondary">
                    Your scheduled travel plans
                  </p>
                </div>
                <Link to="/passenger/trips" className="btn btn-secondary btn-sm flex items-center gap-2">
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {isLoading ? (
                  <div className="driver-loading-card">
                    <div className="icon-badge icon-badge-lg bg-primary-light text-primary mx-auto mb-4">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <p className="text-light-secondary dark:text-dark-secondary">Loading your trips...</p>
                  </div>
                ) : upcomingBookings.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => (
                      <Link
                        key={booking.id}
                        to={`/passenger/trips/${booking.id}`}
                        className="driver-trip-card group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-base font-medium text-light-primary dark:text-dark-primary group-hover:text-primary">
                              {booking.route?.origin?.name || 'Origin'} to {booking.route?.destination?.name || 'Destination'}
                            </h3>
                            <div className="mt-2 flex items-center text-sm text-light-secondary dark:text-dark-secondary">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{booking.trip?.date && booking.trip?.time ? formatDate(booking.trip.date, booking.trip.time) : 'Date TBD'}</span>
                            </div>
                            <div className="mt-2 flex items-center gap-3">
                              {getStatusBadge(booking.status)}
                              <span className="text-xs text-light-tertiary dark:text-dark-tertiary">
                                {booking.trip?.vehicle?.model ? `${booking.trip.vehicle.model}` : 'Vehicle TBD'}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end">
                            <span className="text-xl font-bold text-primary">
                              ${booking.trip?.price?.toFixed(2) || '0.00'}
                            </span>
                            <div className="flex items-center text-xs text-light-secondary dark:text-dark-secondary mt-1">
                              <span>Seat{(booking.seats && booking.seats.length > 1) ? 's' : ''} {booking.seats && booking.seats.length > 0 ? booking.seats.length : 'TBD'}</span>
                              <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="driver-loading-card">
                    <div className="icon-badge icon-badge-lg bg-primary-light text-primary mx-auto mb-4">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-2">
                      No upcoming trips
                    </h3>
                    <p className="text-light-secondary dark:text-dark-secondary mb-6">
                      You don't have any upcoming trips scheduled.
                    </p>
                    <Link to="/book" className="btn btn-primary">
                      Book a Trip
                    </Link>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column - Popular Routes & Activities */}
          <div>
            {/* Popular Routes */}
            <div className="driver-metric-card mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="icon-badge icon-badge-md bg-primary-light text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-light-primary dark:text-dark-primary">
                    Popular Routes
                  </h2>
                  <p className="text-sm text-light-secondary dark:text-dark-secondary">
                    Most traveled destinations
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {filteredRoutes.slice(0, 4).map(route => (
                  <Link
                    key={route.id}
                    to={`/book?from=${encodeURIComponent(route.origin)}&to=${encodeURIComponent(route.destination)}`}
                    className="driver-trip-card group"
                    aria-label={`Book trip from ${route.origin} to ${route.destination}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-light-primary dark:text-dark-primary group-hover:text-primary transition-colors duration-200">
                          {route.origin} to {route.destination}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-xs text-light-secondary dark:text-dark-secondary">
                            {route.count} trips this month
                          </p>
                          {route.duration && (
                            <p className="text-xs text-light-tertiary dark:text-dark-tertiary">
                              {route.duration}
                            </p>
                          )}
                        </div>
                        {route.nextDeparture && (
                          <p className="text-xs text-info mt-1">
                            Next: {route.nextDeparture}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-primary">
                          ${route.price}
                        </span>
                        <div className="flex items-center justify-end text-primary text-xs mt-1">
                          <span>Book now</span>
                          <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}

                {filteredRoutes.length === 0 && searchTerm && (
                  <div className="driver-loading-card">
                    <div className="icon-badge icon-badge-md bg-warning-light text-warning mx-auto mb-2">
                      <Search className="h-5 w-5" />
                    </div>
                    <p className="text-sm text-light-secondary dark:text-dark-secondary">
                      No routes found for "{searchTerm}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="driver-metric-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="icon-badge icon-badge-md bg-info-light text-info">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-light-primary dark:text-dark-primary">
                    Recent Activities
                  </h2>
                  <p className="text-sm text-light-secondary dark:text-dark-secondary">
                    Your latest travel activities
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {recentActivities.slice(0, 5).map(activity => (
                  <div key={activity.id} className="driver-trip-card group hover:shadow-md transition-all duration-200">
                    <div className="flex items-start gap-3">
                      <div className={`icon-badge icon-badge-sm transition-transform duration-200 group-hover:scale-110 ${
                        activity.type === 'booking' ? 'bg-info-light text-info' :
                        activity.type === 'payment' ? 'bg-success-light text-success' :
                        activity.type === 'review' ? 'bg-warning-light text-warning' :
                        'bg-error-light text-error'
                      }`}>
                        {activity.type === 'booking' ? <Ticket className="h-4 w-4" /> :
                         activity.type === 'payment' ? <CreditCard className="h-4 w-4" /> :
                         activity.type === 'review' ? <Star className="h-4 w-4" /> :
                         <XCircle className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-light-primary dark:text-dark-primary group-hover:text-primary transition-colors duration-200">
                          {activity.description}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-light-secondary dark:text-dark-secondary">
                            {formatDate(activity.date)}
                          </p>
                          <div className="flex items-center gap-2">
                            {activity.amount && (
                              <span className="text-xs font-medium text-success">
                                ${activity.amount}
                              </span>
                            )}
                            {activity.rating && (
                              <div className="flex items-center">
                                {[...Array(activity.rating)].map((_, i) => (
                                  <Star key={i} className="h-3 w-3 text-warning fill-current" />
                                ))}
                              </div>
                            )}
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              activity.status === 'completed' ? 'bg-success-light text-success' :
                              activity.status === 'cancelled' ? 'bg-error-light text-error' :
                              'bg-warning-light text-warning'
                            }`}>
                              {activity.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {recentActivities.length === 0 && (
                  <div className="driver-loading-card">
                    <div className="icon-badge icon-badge-md bg-info-light text-info mx-auto mb-2">
                      <Activity className="h-5 w-5" />
                    </div>
                    <p className="text-sm text-light-secondary dark:text-dark-secondary">
                      No recent activities to display
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Travel History - Full Width Section */}
        <div className="driver-metric-card mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="icon-badge icon-badge-md bg-secondary-light text-secondary">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-light-primary dark:text-dark-primary">
                Recent Travel History
              </h2>
              <p className="text-sm text-light-secondary dark:text-dark-secondary">
                Your completed and cancelled trips
              </p>
            </div>
            <Link to="/passenger/trips" className="btn btn-secondary btn-sm flex items-center gap-2">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {pastBookings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastBookings.slice(0, 6).map((booking) => (
                  <Link
                    key={booking.id}
                    to={`/passenger/trips/${booking.id}`}
                    className="driver-trip-card group"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-base font-medium text-light-primary dark:text-dark-primary group-hover:text-primary">
                            {booking.route?.origin?.name || 'Origin'} to {booking.route?.destination?.name || 'Destination'}
                          </h3>
                          <div className="mt-1 flex items-center text-sm text-light-secondary dark:text-dark-secondary">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{booking.trip?.date && booking.trip?.time ? formatDate(booking.trip.date, booking.trip.time) : 'Date N/A'}</span>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-primary">
                          ${booking.trip?.price?.toFixed(2) || '0.00'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusBadge(booking.status)}
                          {booking.status === 'completed' && (
                            <div className="flex items-center text-xs text-warning">
                              <Star className="h-3 w-3 mr-1 fill-current" />
                              <Star className="h-3 w-3 mr-1 fill-current" />
                              <Star className="h-3 w-3 mr-1 fill-current" />
                              <Star className="h-3 w-3 mr-1 fill-current" />
                              <Star className="h-3 w-3 mr-1" />
                            </div>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-light-secondary dark:text-dark-secondary group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="driver-loading-card">
                <div className="icon-badge icon-badge-lg bg-secondary-light text-secondary mx-auto mb-4">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-2">
                  No Travel History
                </h3>
                <p className="text-light-secondary dark:text-dark-secondary mb-6">
                  You haven't completed any trips yet. Your travel history will appear here once you start traveling.
                </p>
                <Link to="/book" className="btn btn-primary">
                  Book Your First Trip
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <ToastContainer />
    </div>
  );
};

export default PassengerDashboard;
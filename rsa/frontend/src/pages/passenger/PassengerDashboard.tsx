import '../../index.css';
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, Search, TrendingUp, BarChart2, Ticket, Star, CreditCard, ChevronRight, AlertCircle, CheckCircle, ArrowRight, XCircle, Zap, Activity } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { useBookingStore, BookingWithDetails } from '../../store/bookingStore';
import { getRandomRoutes, getRandomBookings } from '../../utils/mockData';
import Navbar from '../../components/common/Navbar';
import ToastContainer from '../../components/common/ToastContainer';

// Dummy upcoming trips data
const dummyTripStats = {
  total: 24,
  upcoming: 3,
  completed: 18,
  cancelled: 3,
};

// Dummy popular routes
const popularRoutes = [
  { id: 'r1', origin: 'New York', destination: 'Boston', count: 5, price: 45 },
  { id: 'r2', origin: 'Los Angeles', destination: 'San Francisco', count: 4, price: 55 },
  { id: 'r3', origin: 'Chicago', destination: 'Detroit', count: 3, price: 35 },
];

// Dummy recent activities
const recentActivities = [
  { id: 'a1', type: 'booking', description: 'Booked trip from New York to Boston', date: '2023-05-15', status: 'completed' },
  { id: 'a2', type: 'payment', description: 'Made payment for trip to San Francisco', date: '2023-05-10', amount: 55, status: 'completed' },
  { id: 'a3', type: 'trip', description: 'Trip to Chicago was cancelled', date: '2023-05-05', status: 'cancelled' },
  { id: 'a4', type: 'review', description: 'Left 5-star review for driver', date: '2023-05-01', rating: 5, status: 'completed' },
];

const PassengerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { bookings, fetchBookingsByUserId, isLoading } = useBookingStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('all');
  
  useEffect(() => {
    if (user?.id) {
      fetchBookingsByUserId(user.id);
    }
  }, [user?.id, fetchBookingsByUserId]);

  // Get upcoming and past bookings
  const upcomingBookings: BookingWithDetails[] = useMemo(() => {
    if (bookings.length === 0) {
      // If no bookings in store, generate some dummy ones
      return getRandomBookings(3).filter(b => 
        ['pending', 'confirmed', 'booked'].includes(b.status as string)
      ) as BookingWithDetails[]; // Cast to store's BookingWithDetails
    }
    
    return bookings
      .filter(b => ['pending', 'confirmed', 'booked'].includes(b.status as string))
      .slice(0, 3);
  }, [bookings]);

  const pastBookings: BookingWithDetails[] = useMemo(() => {
    if (bookings.length === 0) {
      // If no bookings in store, generate some dummy ones
      return getRandomBookings(3).filter(b => 
        ['completed', 'cancelled'].includes(b.status as string)
      ) as BookingWithDetails[]; // Cast to store's BookingWithDetails
    }
    
    return bookings
      .filter(b => ['completed', 'cancelled'].includes(b.status as string))
      .slice(0, 3);
  }, [bookings]);

  const formatDate = (dateString: string, timeString: string = '') => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }) + (timeString ? ` at ${timeString}` : '');
    } catch (e) {
      return dateString;
    }
  };

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
    <div className="bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary transition-colors duration-300">
      {/* Navbar is fixed, so main content needs top padding */}
      <ToastContainer />
      <main className="container-app pt-navbar pb-8 md:pb-12">
        {/* Header with greeting and search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0 mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold text-text-light-primary dark:text-text-dark-primary transition-colors duration-300">Passenger Dashboard</h1>
            <p className="mt-1 text-sm text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-300">
              {user && `Welcome back, ${user.firstName} ${user.lastName}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex ">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-text-light-tertiary dark:text-text-dark-tertiary transition-colors duration-300" />
              </div>
              <input
                type="text"
                placeholder="Search routes..."
                className="form-input block w-full pr-4 py-2 transition-colors duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Link to="/book" className="btn btn-primary py-3 px-4 flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Book a Trip
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 card-interactive hover:shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary transition-colors duration-300">Total Trips</p>
              <div className="icon-badge icon-badge-md bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-700">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
            <p className="text-3xl font-semibold text-text-light-primary dark:text-text-dark-primary transition-colors duration-300">{dummyTripStats.total}</p>
            <p className="text-xs text-text-light-tertiary dark:text-text-dark-tertiary mt-1 transition-colors duration-300">Lifetime trips</p>
          </div>

          <div className="card p-6 card-interactive hover:shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors duration-300">Upcoming</p>
              <div className="icon-badge icon-badge-md bg-info-light text-info dark:bg-info-dark dark:text-info-light">
                <Clock className="h-6 w-6" />
              </div>
            </div>
            <p className="text-3xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">{dummyTripStats.upcoming}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">Scheduled trips</p>
          </div>
          
          <div className="card p-6 card-interactive hover:shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors duration-300">Completed</p>
              <div className="icon-badge icon-badge-md bg-success-light text-success dark:bg-success-dark dark:text-success-light">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
            <p className="text-3xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">{dummyTripStats.completed}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">Successfully completed</p>
          </div>
          
          <div className="card p-6 card-interactive hover:shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors duration-300">Cancelled</p>
              <div className="icon-badge icon-badge-md bg-error-light text-error dark:bg-error-dark dark:text-error-light">
                <XCircle className="h-6 w-6" />
              </div>
            </div>
            <p className="text-3xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">{dummyTripStats.cancelled}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">Cancelled trips</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Trips */}
          <div className="lg:col-span-2">
            <div className="card overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-text-light-primary dark:text-text-dark-primary transition-colors duration-300 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary-700 transition-colors duration-300" />
                  Upcoming Trips
                </h2>
                <Link to="/passenger/trips" className="btn btn-ghost btn-sm text-primary-700 flex items-center gap-2 transition-colors duration-300">
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="overflow-hidden">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Loading your trips...</p>
                  </div>
                ) : upcomingBookings.length > 0 ? (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
                    {upcomingBookings.map((booking) => (
                      <Link
                        key={booking.id}
                        to={`/passenger/trips/${booking.id}`}
                        className="block p-6 card-interactive hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-base font-medium text-gray-900 dark:text-white transition-colors duration-300">
                              {booking.route?.origin?.name || 'Origin'} to {booking.route?.destination?.name || 'Destination'}
                            </h3>
                            <div className="mt-1 flex items-center text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{booking.trip?.date && booking.trip?.time ? formatDate(booking.trip.date, booking.trip.time) : 'Date TBD'}</span>
                            </div>
                            <div className="mt-1 flex items-center">
                              {getStatusBadge(booking.status)}
                              
                              <span className="ml-3 text-xs text-gray-600 dark:text-gray-300 transition-colors duration-300">
                                {booking.trip?.vehicle?.model ? `${booking.trip.vehicle.model}` : 'Vehicle TBD'}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end">
                            <span className="text-lg font-semibold text-primary-600 dark:text-primary-400 transition-colors duration-300">
                              ${booking.trip?.price?.toFixed(2) || '0.00'}
                            </span>
                            <div className="flex items-center text-xs text-gray-600 dark:text-gray-300 mt-1 transition-colors duration-300">
                              <span>Seat{(booking.seats && booking.seats.length > 1) ? 's' : ''} {booking.seats && booking.seats.length > 0 ? booking.seats.length : 'TBD'}</span>
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 card">
                    <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 transition-colors duration-300">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">No upcoming trips</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                      You don't have any upcoming trips scheduled.
                    </p>
                    <Link to="/book" className="btn btn-accentmt-4">
                      Book a Trip
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Travel History */}
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400 transition-colors duration-300" />
                  Recent Travel History
                </h2>
                <Link to="/passenger/trips" className="btn btn-ghost btn-sm text-primary-600 dark:text-primary-400 flex items-center gap-2 transition-colors duration-300">
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="overflow-hidden">
                {pastBookings.length > 0 ? (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
                    {pastBookings.map((booking) => (
                      <Link
                        key={booking.id}
                        to={`/passenger/trips/${booking.id}`}
                        className="block p-6 card-interactive hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-base font-medium text-gray-900 dark:text-white transition-colors duration-300">
                              {booking.route?.origin?.name || 'Origin'} to {booking.route?.destination?.name || 'Destination'}
                            </h3>
                            <div className="mt-1 flex items-center text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{booking.trip?.date && booking.trip?.time ? formatDate(booking.trip.date, booking.trip.time) : 'Date N/A'}</span>
                            </div>
                            <div className="mt-1 flex items-center">
                              {getStatusBadge(booking.status)}
                            </div>
                          </div>

                          <div className="flex flex-col items-end">
                            <span className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                              ${booking.trip?.price?.toFixed(2) || '0.00'}
                            </span>
                            {booking.status === 'completed' && (
                              <div className="flex items-center text-xs text-warning-600 dark:text-warning-400 mt-1 transition-colors duration-300">
                                <Star className="h-4 w-4 mr-1 fill-current" />
                                <Star className="h-4 w-4 mr-1 fill-current" />
                                <Star className="h-4 w-4 mr-1 fill-current" />
                                <Star className="h-4 w-4 mr-1 fill-current" />
                                <Star className="h-4 w-4 mr-1" />
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 card">
                    <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">No travel history found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div>
            {/* Popular Routes */}
            <div className="card overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400 transition-colors duration-300" />
                  Popular Routes
                </h2>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {popularRoutes.map(route => (
                    <Link
                      key={route.id}
                      to={`/passenger/booking?from=${route.origin}&to=${route.destination}`}
                      className="block p-3 card-interactive hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{route.origin} to {route.destination}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 transition-colors duration-300">
                            {route.count} trips this month
                          </p>
                        </div>
                        <span className="text-lg font-semibold text-primary-600 dark:text-primary-400 transition-colors duration-300">
                          ${route.price}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-end text-primary-600 dark:text-primary-400 text-xs transition-colors duration-300">
                        <span>Book now</span>
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="card overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400 transition-colors duration-300" />
                  Recent Activities
                </h2>
              </div>
              <div className="px-4 py-2 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="py-3">
                    <div className="flex items-start">
                      <div className={`icon-badge icon-badge-sm ${activity.type === 'booking' ? 'bg-info-light text-info dark:bg-info-dark dark:text-info-light' : activity.type === 'payment' ? 'bg-success-light text-success dark:bg-success-dark dark:text-success-light' : activity.type === 'review' ? 'bg-warning-light text-warning dark:bg-warning-dark dark:text-warning-light' : 'bg-error-light text-error dark:bg-error-dark dark:text-error-light'} mr-3 transition-colors duration-300`}>
                        {activity.type === 'booking' ? <Ticket className="h-4 w-4" /> :
                         activity.type === 'payment' ? <CreditCard className="h-4 w-4" /> :
                         activity.type === 'review' ? <Star className="h-4 w-4" /> :
                         <XCircle className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white transition-colors duration-300">{activity.description}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 transition-colors duration-300">
                          {new Date(activity.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300 flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400 transition-colors duration-300" />
                  Quick Actions
                </h2>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <Link to="/book" className="btn btn-accentw-full flex items-center justify-center gap-2">
                    <Ticket className="h-5 w-5" />
                    Book New Trip
                  </Link>
                  <Link to="/passenger/trips" className="btn btn-secondary w-full flex items-center justify-center gap-2">
                    <Calendar className="h-5 w-5" />
                    View All Trips
                  </Link>
                  <Link to="/profile" className="btn btn-outline w-full flex items-center justify-center gap-2">
                    <User className="h-5 w-5" />
                    Edit Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PassengerDashboard;
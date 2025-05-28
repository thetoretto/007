import '../../index.css';
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, Search, TrendingUp, BarChart2, Ticket, Star, CreditCard, ChevronRight, AlertCircle, CheckCircle, ArrowRight, XCircle, Zap, Activity } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { useBookingStore, BookingWithDetails } from '../../store/bookingStore';
import { getRandomRoutes, getRandomBookings } from '../../utils/mockData';
import Navbar from '../../components/common/Navbar';

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
  const upcomingBookings = useMemo(() => {
    if (bookings.length === 0) {
      // If no bookings in store, generate some dummy ones
      return getRandomBookings(3).filter(b => 
        ['pending', 'confirmed', 'booked'].includes(b.status as string)
      );
    }
    
    return bookings
      .filter(b => ['pending', 'confirmed', 'booked'].includes(b.status as string))
      .slice(0, 3);
  }, [bookings]);

  const pastBookings = useMemo(() => {
    if (bookings.length === 0) {
      // If no bookings in store, generate some dummy ones
      return getRandomBookings(3).filter(b => 
        ['completed', 'cancelled'].includes(b.status as string)
      );
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
    <div className="min-h-screen bg-background-light dark:bg-section-dark">
      <Navbar />
      
      <div className="container-app mx-auto px-4 py-8">
        {/* Header with greeting and search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0 mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold text-text-base dark:text-text-inverse">Passenger Dashboard</h1>
            <p className="mt-1 text-sm text-text-muted dark:text-text-muted-dark">
              {user && `Welcome back, ${user.firstName} ${user.lastName}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-text-muted dark:text-text-muted-dark" />
              </div>
              <input
                type="text"
                placeholder="Search routes..."
                className="input input-bordered pl-10 pr-4 py-2 w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Link to="/book" className="btn btn-primary flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Book a Trip
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-base-100 dark:bg-section-dark p-6 rounded-lg shadow-sm border border-primary-100 dark:border-primary-800 transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-text-muted dark:text-text-muted-dark">Total Trips</p>
              <div className="p-2 rounded-full bg-primary-50 dark:bg-primary-900">
                <Calendar className="h-6 w-6 text-primary dark:text-primary-200" />
              </div>
            </div>
            <p className="text-3xl font-semibold text-text-base dark:text-text-inverse">{dummyTripStats.total}</p>
            <p className="text-xs text-text-muted dark:text-text-muted-dark mt-1">Lifetime trips</p>
          </div>

          <div className="card bg-base-100 dark:bg-section-dark p-6 rounded-lg shadow-sm border border-primary-100 dark:border-primary-800 transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-text-muted dark:text-text-muted-dark">Upcoming</p>
              <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900">
                <Clock className="h-6 w-6 text-blue-500 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-3xl font-semibold text-text-base dark:text-text-inverse">{dummyTripStats.upcoming}</p>
            <p className="text-xs text-text-muted dark:text-text-muted-dark mt-1">Scheduled trips</p>
          </div>
          
          <div className="card bg-base-100 dark:bg-section-dark p-6 rounded-lg shadow-sm border border-primary-100 dark:border-primary-800 transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-text-muted dark:text-text-muted-dark">Completed</p>
              <div className="p-2 rounded-full bg-green-50 dark:bg-green-900">
                <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400" />
              </div>
            </div>
            <p className="text-3xl font-semibold text-text-base dark:text-text-inverse">{dummyTripStats.completed}</p>
            <p className="text-xs text-text-muted dark:text-text-muted-dark mt-1">Successfully completed</p>
          </div>
          
          <div className="card bg-base-100 dark:bg-section-dark p-6 rounded-lg shadow-sm border border-primary-100 dark:border-primary-800 transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-text-muted dark:text-text-muted-dark">Cancelled</p>
              <div className="p-2 rounded-full bg-red-50 dark:bg-red-900">
                <XCircle className="h-6 w-6 text-red-500 dark:text-red-400" />
              </div>
            </div>
            <p className="text-3xl font-semibold text-text-base dark:text-text-inverse">{dummyTripStats.cancelled}</p>
            <p className="text-xs text-text-muted dark:text-text-muted-dark mt-1">Cancelled trips</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Trips */}
          <div className="lg:col-span-2">
            <div className="card bg-base-100 dark:bg-section-dark rounded-lg shadow-sm border border-primary-100 dark:border-primary-800 overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-primary-100 dark:border-primary-800 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-text-base dark:text-text-inverse flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary dark:text-primary-200" />
                  Upcoming Trips
                </h2>
                <Link to="/passenger/trips" className="btn btn-ghost btn-sm text-primary dark:text-primary-200 flex items-center gap-2">
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="overflow-hidden">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <p className="text-text-muted dark:text-text-muted-dark">Loading your trips...</p>
                  </div>
                ) : upcomingBookings.length > 0 ? (
                  <div className="divide-y divide-primary-100 dark:divide-primary-800">
                    {upcomingBookings.map((booking) => (
                      <Link
                        key={booking.id}
                        to={`/passenger/trips/${booking.id}`}
                        className="block p-6 hover:bg-section-light dark:hover:bg-section-medium transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-base font-medium text-text-base dark:text-text-inverse">
                              {booking.route?.origin?.name || 'Origin'} to {booking.route?.destination?.name || 'Destination'}
                            </h3>
                            <div className="mt-1 flex items-center text-sm text-text-muted dark:text-text-muted-dark">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{booking.trip?.date ? formatDate(booking.trip.date, booking.trip.time) : 'Date TBD'}</span>
                            </div>
                            <div className="mt-1 flex items-center">
                              {getStatusBadge(booking.status)}
                              
                              <span className="ml-3 text-xs text-text-muted dark:text-text-muted-dark">
                                {booking.trip?.vehicle?.model ? `${booking.trip.vehicle.model}` : 'Vehicle TBD'}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end">
                            <span className="text-lg font-semibold text-primary dark:text-primary-200">
                              ${booking.trip?.price?.toFixed(2) || '0.00'}
                            </span>
                            <div className="flex items-center text-xs text-text-muted dark:text-text-muted-dark mt-1">
                              <span>Seat {booking.seat || 'TBD'}</span>
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto h-12 w-12 bg-section-light dark:bg-section-medium rounded-full flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-text-muted dark:text-text-muted-dark" />
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-text-base dark:text-text-inverse">No upcoming trips</h3>
                    <p className="mt-1 text-sm text-text-muted dark:text-text-muted-dark">
                      You don't have any upcoming trips scheduled.
                    </p>
                    <Link to="/book" className="btn btn-primary mt-4">
                      Book a Trip
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Travel History */}
            <div className="card bg-base-100 dark:bg-section-dark rounded-lg shadow-sm border border-primary-100 dark:border-primary-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-primary-100 dark:border-primary-800 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-text-base dark:text-text-inverse flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary dark:text-primary-200" />
                  Recent Travel History
                </h2>
                <Link to="/passenger/trips" className="btn btn-ghost btn-sm text-primary dark:text-primary-200 flex items-center gap-2">
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="overflow-hidden">
                {pastBookings.length > 0 ? (
                  <div className="divide-y divide-primary-100 dark:divide-primary-800">
                    {pastBookings.map((booking) => (
                      <Link
                        key={booking.id}
                        to={`/passenger/trips/${booking.id}`}
                        className="block p-6 hover:bg-section-light dark:hover:bg-section-medium transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-base font-medium text-text-base dark:text-text-inverse">
                              {booking.route?.origin?.name || 'Origin'} to {booking.route?.destination?.name || 'Destination'}
                            </h3>
                            <div className="mt-1 flex items-center text-sm text-text-muted dark:text-text-muted-dark">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{booking.trip?.date ? formatDate(booking.trip.date, booking.trip.time) : 'Date N/A'}</span>
                            </div>
                            <div className="mt-1 flex items-center">
                              {getStatusBadge(booking.status)}
                            </div>
                          </div>

                          <div className="flex flex-col items-end">
                            <span className="text-lg font-semibold text-text-base dark:text-text-inverse">
                              ${booking.trip?.price?.toFixed(2) || '0.00'}
                            </span>
                            {booking.status === 'completed' && (
                              <div className="flex items-center text-xs text-yellow-500 mt-1">
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
                  <div className="text-center py-8">
                    <p className="text-text-muted dark:text-text-muted-dark">No travel history found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div>
            {/* Popular Routes */}
            <div className="card bg-base-100 dark:bg-section-dark rounded-lg shadow-sm border border-primary-100 dark:border-primary-800 overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-primary-100 dark:border-primary-800">
                <h2 className="text-lg font-semibold text-text-base dark:text-text-inverse flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary dark:text-primary-200" />
                  Popular Routes
                </h2>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {popularRoutes.map(route => (
                    <Link
                      key={route.id}
                      to={`/passenger/booking?from=${route.origin}&to=${route.destination}`}
                      className="block p-3 bg-section-light dark:bg-section-medium rounded-lg hover:bg-section-medium dark:hover:bg-section-dark transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-text-base dark:text-text-inverse">{route.origin} to {route.destination}</p>
                          <p className="text-xs text-text-muted dark:text-text-muted-dark mt-1">
                            {route.count} trips this month
                          </p>
                        </div>
                        <span className="text-lg font-semibold text-primary dark:text-primary-200">
                          ${route.price}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-end text-xs text-primary dark:text-primary-200">
                        <span>Book now</span>
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="card bg-base-100 dark:bg-section-dark rounded-lg shadow-sm border border-primary-100 dark:border-primary-800 overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-primary-100 dark:border-primary-800">
                <h2 className="text-lg font-semibold text-text-base dark:text-text-inverse flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-primary dark:text-primary-200" />
                  Recent Activities
                </h2>
              </div>
              <div className="px-4 py-2 divide-y divide-primary-100 dark:divide-primary-800">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="py-3">
                    <div className="flex items-start">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'booking' ? 'bg-blue-50 text-blue-500 dark:bg-blue-900 dark:text-blue-300' :
                        activity.type === 'payment' ? 'bg-green-50 text-green-500 dark:bg-green-900 dark:text-green-300' :
                        activity.type === 'review' ? 'bg-yellow-50 text-yellow-500 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-red-50 text-red-500 dark:bg-red-900 dark:text-red-300'
                      } mr-3`}>
                        {activity.type === 'booking' ? <Ticket className="h-4 w-4" /> :
                         activity.type === 'payment' ? <CreditCard className="h-4 w-4" /> :
                         activity.type === 'review' ? <Star className="h-4 w-4" /> :
                         <XCircle className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm text-text-base dark:text-text-inverse">{activity.description}</p>
                        <p className="text-xs text-text-muted dark:text-text-muted-dark mt-1">
                          {new Date(activity.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card bg-base-100 dark:bg-section-dark rounded-lg shadow-sm border border-primary-100 dark:border-primary-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-primary-100 dark:border-primary-800">
                <h2 className="text-lg font-semibold text-text-base dark:text-text-inverse flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-primary dark:text-primary-200" />
                  Quick Actions
                </h2>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <Link to="/book" className="btn btn-primary w-full flex items-center justify-center gap-2">
                    <Ticket className="h-5 w-5" />
                    Book New Trip
                  </Link>
                  <Link to="/passenger/trips" className="btn btn-secondary w-full flex items-center justify-center gap-2">
                    <Calendar className="h-5 w-5" />
                    View All Trips
                  </Link>
                  <Link to="/profile" className="btn btn-outline btn-secondary w-full flex items-center justify-center gap-2">
                    <User className="h-5 w-5" />
                    Edit Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerDashboard; 
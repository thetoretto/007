import '../../index.css';
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useBookingStore, type BookingWithDetails } from '../../store/bookingStore';
import { Calendar, Clock, MapPin, Users, Tag, Inbox, AlertCircle, CheckCircle, XCircle, Search, ArrowLeft, Filter, Ticket } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const TripsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { bookings, fetchBookingsByUserId, isLoading, error } = useBookingStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('dateDesc');

  useEffect(() => {
    if (user?.id) {
      fetchBookingsByUserId(user.id);
    }
  }, [user?.id, fetchBookingsByUserId]);

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

  const filteredAndSortedBookings = useMemo(() => {
    let filtered = bookings;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.route?.origin?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.route?.destination?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(booking => booking.status === filterStatus);
    }

    // Sort bookings
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dateAsc':
          return new Date(a.trip?.date || '').getTime() - new Date(b.trip?.date || '').getTime();
        case 'dateDesc':
          return new Date(b.trip?.date || '').getTime() - new Date(a.trip?.date || '').getTime();
        case 'routeAsc':
          return (a.route?.origin?.name || '').localeCompare(b.route?.origin?.name || '');
        case 'routeDesc':
          return (b.route?.origin?.name || '').localeCompare(a.route?.origin?.name || '');
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [bookings, searchTerm, filterStatus, sortBy]);

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

  return (
    <div className="driver-dashboard">
      {/* Modern Header */}
      <header className="driver-header mb-8">
        <div className="container-app">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Link to="/passenger/dashboard" className="btn btn-ghost btn-sm flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Link>
                <div className="icon-badge icon-badge-lg bg-primary text-on-primary">
                  <Ticket className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-light-primary dark:text-dark-primary">
                    My Trips
                  </h1>
                  <p className="text-sm text-light-secondary dark:text-dark-secondary">
                    View and manage your travel bookings
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-app py-8">
        {/* Filter and Search Controls */}
        <div className="driver-metric-card mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="icon-badge icon-badge-md bg-secondary-light text-secondary">
              <Filter className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-light-primary dark:text-dark-primary">
                Filter & Search
              </h2>
              <p className="text-sm text-light-secondary dark:text-dark-secondary">
                Find specific trips quickly
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Search Trips</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-light-tertiary dark:text-dark-tertiary" />
                </div>
                <input
                  type="text"
                  placeholder="Search by ID, route, destination..."
                  className="form-input pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="form-label">Filter by Status</label>
              <select 
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="booked">Booked</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">Sort By</label>
              <select 
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="dateDesc">Date (Newest First)</option>
                <option value="dateAsc">Date (Oldest First)</option>
                <option value="routeAsc">Route (A-Z)</option>
                <option value="routeDesc">Route (Z-A)</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="driver-loading-card">
            <div className="icon-badge icon-badge-lg bg-error-light text-error mx-auto mb-4">
              <XCircle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-2">
              Error Loading Trips
            </h3>
            <p className="text-light-secondary dark:text-dark-secondary">
              {error}
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="driver-metric-card animate-pulse">
                <div className="h-4 bg-light dark:bg-dark rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-light dark:bg-dark rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-light dark:bg-dark rounded w-2/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredAndSortedBookings.length === 0 && (
          <div className="driver-loading-card">
            <div className="icon-badge icon-badge-lg bg-primary-light text-primary mx-auto mb-4">
              <Inbox className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-2">
              No Trips Found
            </h3>
            <p className="text-light-secondary dark:text-dark-secondary mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'No trips match your current filters. Try adjusting your search criteria.'
                : 'You haven\'t booked any trips yet. Start planning your next journey!'
              }
            </p>
            <Link to="/book" className="btn btn-primary">
              Book a Trip
            </Link>
          </div>
        )}

        {/* Trips Grid */}
        {!isLoading && !error && filteredAndSortedBookings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedBookings.map((booking) => (
              <Link
                key={booking.id}
                to={`/passenger/trips/${booking.id}`}
                className="driver-trip-card group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary group-hover:text-primary mb-2">
                      {booking.route?.origin?.name || 'Origin'} to {booking.route?.destination?.name || 'Destination'}
                    </h3>
                    <div className="flex items-center text-sm text-light-secondary dark:text-dark-secondary mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {booking.trip?.date && booking.trip?.time 
                          ? formatDate(booking.trip.date, booking.trip.time)
                          : 'Date TBD'
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(booking.status)}
                      <span className="text-xs text-light-tertiary dark:text-dark-tertiary">
                        ID: {booking.id.slice(0, 8)}...
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-primary">
                      ${booking.trip?.price?.toFixed(2) || '0.00'}
                    </span>
                    {booking.seats && booking.seats.length > 0 && (
                      <div className="text-xs text-light-secondary dark:text-dark-secondary mt-1">
                        {booking.seats.length} seat{booking.seats.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
                
                {booking.trip?.vehicle && (
                  <div className="flex items-center text-sm text-light-secondary dark:text-dark-secondary">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{booking.trip.vehicle.model || 'Vehicle TBD'}</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default TripsPage;

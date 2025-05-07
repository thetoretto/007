import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useBookingStore, { BookingWithDetails } from '../../store/bookingStore';
import Navbar from '../../components/common/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, Filter, CalendarDays, Clock, MapPin, Users, Tag, Inbox, AlertCircle, CheckCircle, XCircle, Info, ListFilter, Search } from 'lucide-react'; // Added Users, Tag, Inbox
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useAuthStore from '../../store/authStore';

enum TripFilter {
  ALL = 'all',
  UPCOMING = 'upcoming',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

enum SortKey {
  DATE = 'date',
  ROUTE = 'route',
  STATUS = 'status',
}

enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

const TripsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { bookings, fetchBookingsByUserId, isLoading, error } = useBookingStore(); // Use booking store
  const [activeFilter, setActiveFilter] = useState<TripFilter>(TripFilter.ALL);
  const [sortKey, setSortKey] = useState<SortKey>(SortKey.DATE);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.DESC);
  const [filterStatus, setFilterStatus] = useState<string>('all'); // Added state
  const [searchTerm, setSearchTerm] = useState<string>(''); // Added state

  useEffect(() => {
    if (user?.id) {
      fetchBookingsByUserId(user.id);
    }
  }, [user?.id, fetchBookingsByUserId]);

  const getCurrentSortValue = (): string => {
    if (sortKey === SortKey.STATUS) {
      return 'status';
    }
    return `${sortKey}${sortOrder.charAt(0).toUpperCase() + sortOrder.slice(1)}`;
  };

  const handleSortChange = (value: string) => {
    if (value === 'status') {
      setSortKey(SortKey.STATUS);
      // Optionally set a default order or maintain current for status
      // setSortOrder(SortOrder.ASC); 
    } else if (value.endsWith('Asc')) {
      setSortKey(value.replace('Asc', '') as SortKey);
      setSortOrder(SortOrder.ASC);
    } else if (value.endsWith('Desc')) {
      setSortKey(value.replace('Desc', '') as SortKey);
      setSortOrder(SortOrder.DESC);
    }
  };
  
  // Filter the bookings based on the active filter
  const filteredBookings = bookings.filter(booking => {
    if (activeFilter === TripFilter.ALL) return true;
    if (activeFilter === TripFilter.UPCOMING && ['pending', 'confirmed', 'booked', 'checked-in', 'validated'].includes(booking.status as string)) return true; // Added new statuses for upcoming
    if (activeFilter === TripFilter.COMPLETED && booking.status === 'completed') return true;
    if (activeFilter === TripFilter.CANCELLED && booking.status === 'cancelled') return true;
    return false;
  });

  // Bookings are already filtered by userId in the store hook, so userBookings is directly filteredBookings
  const userBookings = filteredBookings;

  // Helper function to get sortable value
  const getValueForSortKey = (booking: BookingWithDetails, key: SortKey): string | number | Date => {
    switch (key) {
      case SortKey.DATE:
        // Ensure timeSlot and its properties exist
        if (booking.timeSlot?.date && booking.timeSlot?.time) {
          return new Date(`${booking.timeSlot.date}T${booking.timeSlot.time}`);
        }
        return new Date(0); // Fallback for invalid date
      case SortKey.ROUTE:
        return `${booking.route?.origin?.name || ''} - ${booking.route?.destination?.name || ''}`;
      case SortKey.STATUS:
        return booking.status;
      default:
        // Exhaustive check for unhandled SortKey cases
        const _exhaustiveCheck: never = key;
        return ''; 
    }
  };

  // Sort the bookings
  const sortedUserBookings = useMemo(() => {
    let filtered = userBookings;
    if (filterStatus !== 'all') {
      filtered = filtered.filter(booking => booking.status === filterStatus);
    }
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.route.origin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.route.destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return [...filtered].sort((a, b) => {
      let comparison = 0;
      const valA = getValueForSortKey(a, sortKey);
      const valB = getValueForSortKey(b, sortKey);

      if (typeof valA === 'string' && typeof valB === 'string') {
        comparison = valA.localeCompare(valB);
      } else if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      } else if (valA instanceof Date && valB instanceof Date) {
        comparison = valA.getTime() - valB.getTime();
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [userBookings, filterStatus, searchTerm, sortKey, sortOrder]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="badge badge-warning flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'confirmed':
        return (
          <span className="badge badge-primary flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmed
          </span>
        );
      case 'completed':
        return (
          <span className="badge badge-success flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="badge badge-error flex items-center">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </span>
        );
      case 'checked-in':
        return (
          <span className="badge bg-indigo-100 text-indigo-700 flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            Checked In
          </span>
        );
      case 'validated': // Added validated status
        return (
          <span className="badge bg-teal-100 text-teal-700 flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            Validated
          </span>
        );
      case 'booked': // Added booked status
        return (
          <span className="badge bg-blue-100 text-blue-700 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" /> {/* Or Info icon */}
            Booked
          </span>
        );
      default:
        return <span className="badge badge-gray">{status}</span>;
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    const bookingToCancel = sortedUserBookings.find(b => b.id === bookingId);

    if (!bookingToCancel || !bookingToCancel.timeSlot?.date || !bookingToCancel.timeSlot?.time) {
      alert("Error: Booking details or time slot not found. Cannot proceed with cancellation.");
      return;
    }

    const tripDateTimeStr = bookingToCancel.timeSlot?.date && bookingToCancel.timeSlot?.time ? `${bookingToCancel.timeSlot.date} ${bookingToCancel.timeSlot.time}` : '';
    if (!tripDateTimeStr) {
        alert("Error: Booking time slot details are missing. Cannot proceed with cancellation.");
        return;
    }
    let tripDateTime;
    try {
      // Attempt to parse the date and time
      // Assuming date is YYYY-MM-DD and time is HH:MM (24-hour format)
      const [year, month, day] = bookingToCancel.timeSlot.date.split('-').map(Number);
      const [hours, minutes] = bookingToCancel.timeSlot.time.split(':').map(Number);
      tripDateTime = new Date(year, month - 1, day, hours, minutes); // month is 0-indexed

      if (isNaN(tripDateTime.getTime())) {
        throw new Error('Invalid date/time format from timeslot');
      }
    } catch (error) {
      console.error("Error parsing trip date/time:", error);
      alert("Error: Could not determine the trip's departure time. Please check the booking details.");
      return;
    }
    
    const now = new Date();

    const diffInMilliseconds = tripDateTime.getTime() - now.getTime();
    const diffInMinutes = diffInMilliseconds / (1000 * 60);

    if (diffInMinutes <= 30 && diffInMinutes > 0) { // also check if it's not in the past already for cancellation logic
      alert("Cancellation is not allowed as the trip is within 30 minutes of departure.");
      return;
    }

    if (tripDateTime.getTime() <= now.getTime()) {
      alert("This trip has already departed or is in the past. Cancellation is not possible.");
      return;
    }

    if (window.confirm("Are you sure you want to cancel this booking?")) {
      // In a real app, you would call an API to cancel the booking
      // and then update the local state or refetch bookings.
      // TODO: Implement cancellation with bookingStore
      console.log(`Booking ${bookingId} cancellation confirmed by user.`);
      alert(`Booking ${bookingId} cancellation needs to be implemented with the booking store.`);
    }
  };

  return (
    
    
    <div className="min-h-screen bg-gray-50">
      {/* Navbar is already part of the layout, ensure it's not duplicated if App.tsx handles global layout */}
      {/* <Navbar/> */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Loading and error states from bookingStore */}
      {isLoading && <p className="text-center py-10">Loading your trips...</p>}
      {error && <p className="text-center py-10 text-red-500">Error loading trips: {error}</p>}
      {!isLoading && !error && (
      <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Trips</h1>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Filters */}
          <div className="flex overflow-x-auto space-x-2 sm:space-x-4">
            <button
              className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap ${
                activeFilter === TripFilter.ALL
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveFilter(TripFilter.ALL)}
            >
              All Trips
            </button>
            <button
              className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap ${
                activeFilter === TripFilter.UPCOMING
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveFilter(TripFilter.UPCOMING)}
            >
              Upcoming
            </button>
            <button
              className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap ${
                activeFilter === TripFilter.COMPLETED
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveFilter(TripFilter.COMPLETED)}
            >
              Completed
            </button>
            <button
              className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap ${
                activeFilter === TripFilter.CANCELLED
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveFilter(TripFilter.CANCELLED)}
            >
              Cancelled
            </button>
          </div>

          {/* Sort By - Simple for now, can be expanded */}
          <div className="flex items-center space-x-2">
            <ListFilter className="h-4 w-4 text-gray-400" />
            <select 
              value={getCurrentSortValue()}
              onChange={(e) => handleSortChange(e.target.value)}
              className="select select-bordered select-xs focus:ring-primary-500 focus:border-primary-500 text-xs"
            >
              <option value="dateDesc">Newest First</option>
              <option value="dateAsc">Oldest First</option>
              <option value="status">By Status</option>
            </select>
          </div>
        </div>

        {/* Trips List or Empty State */}
        {sortedUserBookings.length > 0 ? (
          <ul role="list" className="divide-y divide-gray-200">
            {sortedUserBookings.map((booking) => (
              <li key={booking.id} className="hover:bg-gray-50 transition-colors">
                <Link to={`/passenger/trips/${booking.id}`} className="block">
                  <div className="px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-md font-semibold text-primary-600">
                        {booking.route?.origin.name} to {booking.route?.destination.name}
                      </p>
                      <div className="ml-2 flex flex-shrink-0">
                        {getStatusBadge(booking.status)}
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <CalendarDays className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          {booking.timeSlot?.date && booking.timeSlot?.time ? 
                            new Date(booking.timeSlot.date + 'T' + booking.timeSlot.time).toLocaleDateString([], {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }) : 'Date N/A'} at {booking.timeSlot?.time || 'Time N/A'}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-4">
                          <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          {booking.passenger?.firstName} {booking.passenger?.lastName}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <Tag className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        Booking ID: {booking.id}
                      </div>
                    </div>
                    {/* Action buttons for upcoming trips */}
                    {(booking.status === 'confirmed' || booking.status === 'booked') && (
                        <div className="mt-3 flex space-x-3">
                            <button 
                                onClick={(e) => { 
                                    e.preventDefault(); 
                                    e.stopPropagation(); 
                                    handleCancelBooking(booking.id); 
                                }}
                                className="btn btn-error btn-xs"
                            >
                                <XCircle className="h-4 w-4 mr-1" /> Cancel Booking
                            </button>
                            {/* Add more actions if needed, e.g., Reschedule */}
                        </div>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12 px-4 sm:px-6 lg:px-8">
            <Inbox className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No trips found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeFilter === TripFilter.ALL
                ? 'You have no trips scheduled yet.'
                : `You have no ${activeFilter.toLowerCase()} trips.`}
            </p>
            {activeFilter !== TripFilter.ALL && (
              <button 
                onClick={() => setActiveFilter(TripFilter.ALL)}
                className="mt-4 btn btn-sm btn-outline-primary"
              >
                Show All Trips
              </button>
            )}
          </div>
        )}
      </div>
      </>
      )}
      </div>
    </div>
  );
};

export default TripsPage;
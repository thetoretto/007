import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, CreditCard, CheckCircle, XCircle, AlertCircle, QrCode, ArrowUpDown } from 'lucide-react';
import { getBookingsWithDetails } from '../../utils/mockData';
import useAuthStore from '../../store/authStore';
import Navbar from '../../components/common/Navbar';

enum TripFilter {
  ALL = 'all',
  UPCOMING = 'upcoming',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

enum SortKey {
  DATE = 'date',
  PRICE = 'price',
}

enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

const TripsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeFilter, setActiveFilter] = useState<TripFilter>(TripFilter.ALL);
  const [sortKey, setSortKey] = useState<SortKey>(SortKey.DATE);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.DESC);
  
  // In a real app, we would fetch the bookings from the API
  const bookingsWithDetails = getBookingsWithDetails();
  
  // Filter the bookings based on the active filter
  const filteredBookings = bookingsWithDetails.filter(booking => {
    if (activeFilter === TripFilter.ALL) return true;
    if (activeFilter === TripFilter.UPCOMING && ['pending', 'confirmed'].includes(booking.status)) return true;
    if (activeFilter === TripFilter.COMPLETED && booking.status === 'completed') return true;
    if (activeFilter === TripFilter.CANCELLED && booking.status === 'cancelled') return true;
    return false;
  });

  // Only show bookings for the current user
  const userBookings = user ? filteredBookings.filter(booking => booking.passengerId === user.id) : [];

  // Sort the bookings
  const sortedUserBookings = useMemo(() => {
    return [...userBookings].sort((a, b) => {
      let comparison = 0;
      if (sortKey === SortKey.DATE) {
        const dateA = new Date(`${a.timeSlot?.date} ${a.timeSlot?.time}`);
        const dateB = new Date(`${b.timeSlot?.date} ${b.timeSlot?.time}`);
        comparison = dateA.getTime() - dateB.getTime();
      } else if (sortKey === SortKey.PRICE) {
        comparison = a.fare.total - b.fare.total;
      }

      return sortOrder === SortOrder.ASC ? comparison : -comparison;
    });
  }, [userBookings, sortKey, sortOrder]);

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
          <span className="badge badge-primary flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            Checked In
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

    const tripDateTimeStr = `${bookingToCancel.timeSlot.date} ${bookingToCancel.timeSlot.time}`;
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
      // For this demo, we'll simulate it with an alert and log.
      console.log(`Booking ${bookingId} cancellation confirmed by user.`);
      alert(`Booking ${bookingId} would be cancelled here. (This is a demo - state not updated yet)`);
      // To actually update the UI, you'd need to modify the bookings array and trigger a re-render.
      // This might involve lifting state up, using a global state manager (like Zustand here), 
      // or passing a callback to update the bookings list.
      // For now, the change won't persist visually after the alert.
    }
  };

  return (
    
    
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className='mb-6' >
      <Navbar/>
      </div>
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

          {/* Sorting */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="text-sm border-gray-300 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
            >
              <option value={SortKey.DATE}>Date</option>
              <option value={SortKey.PRICE}>Price</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC)}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <ArrowUpDown className="h-4 w-4" />
              <span className="sr-only">Toggle Sort Order ({sortOrder === SortOrder.ASC ? 'Ascending' : 'Descending'})</span>
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-4">
          {sortedUserBookings.length > 0 ? (
            <div className="space-y-4"> {/* Reduced space-y */} 
              {sortedUserBookings.map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex flex-col sm:flex-row">
                    {/* Main Content Area - More Compact */}
                    <div className="p-4 flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-base font-semibold text-gray-900 leading-tight">
                            {booking.route?.origin.name} to {booking.route?.destination.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">Route: {booking.route?.name}</p>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                        {/* Date & Time */}
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400 mr-1.5 flex-shrink-0" />
                          <span>{booking.timeSlot?.date}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 text-gray-400 mr-1.5 flex-shrink-0" />
                          <span>{booking.timeSlot?.time}</span>
                        </div>
                        
                        {/* Payment */}
                        <div className="flex items-center text-gray-600">
                          <CreditCard className="h-4 w-4 text-gray-400 mr-1.5 flex-shrink-0" />
                          <span>${booking.fare.total.toFixed(2)}</span>
                          <span className={`ml-1.5 text-xs ${booking.paymentStatus === 'paid' ? 'text-success-600' : 'text-warning-600'}`}>
                            ({booking.paymentStatus === 'paid' ? 'Paid' : 'Pending'})
                          </span>
                        </div>

                        {/* Seat */}
                        <div className="flex items-center text-gray-600 col-span-2 sm:col-span-1">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-gray-400 mr-1.5 flex-shrink-0 lucide lucide-armchair">
                            <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/><path d="M3 11v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H7v-2a2 2 0 0 0-4 0Z"/><path d="M5 18v2"/><path d="M19 18v2"/>
                          </svg>
                          <span>{booking.vehicle?.model} - Seat {booking.seatId.split('s')[1].split('v')[0]}</span>
                        </div>

                        {/* Pickup Address (if applicable) */}
                        {booking.hasDoorstepPickup && (
                          <div className="flex items-start text-gray-600 col-span-2 sm:col-span-3">
                            <MapPin className="h-4 w-4 text-gray-400 mr-1.5 mt-0.5 flex-shrink-0" />
                            <span className="text-xs">Pickup: {booking.pickupAddress}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Area - More Compact */}
                    <div className="bg-gray-50 p-3 sm:border-l border-gray-200 flex flex-col items-center justify-center sm:w-48">
                      {['pending', 'confirmed'].includes(booking.status) ? (
                        <>
                          <div className="mb-2 flex flex-col items-center">
                            <QrCode className="h-20 w-20 text-gray-800 mb-1" /> {/* Smaller QR */} 
                            <p className="text-xs text-gray-500">Ref: {booking.id}</p>
                          </div>
                          <div className="flex flex-col w-full space-y-1.5">
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="btn btn-danger btn-xs py-1 px-2 text-xs" /* Smaller button */
                            >
                              Cancel Booking
                            </button>
                            <Link to={`/trip/${booking.id}`} className="btn btn-primary btn-xs py-1 px-2 text-center text-xs"> {/* Smaller button */} 
                              View Details
                            </Link>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="mb-2 text-center">
                            {booking.status === 'cancelled' ? (
                              <XCircle className="h-10 w-10 text-error-500 mx-auto mb-1" /> /* Smaller icon */
                            ) : (
                              <CheckCircle className="h-10 w-10 text-success-500 mx-auto mb-1" /> /* Smaller icon */
                            )}
                            <p className="text-sm font-medium">
                              {booking.status === 'cancelled' ? 'Cancelled' : 'Completed'}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {booking.status === 'cancelled'
                                ? 'This booking was cancelled'
                                : booking.checkedInAt
                                  ? `Checked in: ${new Date(booking.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                  : 'Trip finished'}
                            </p>
                          </div>
                          <Link to={`/trip/${booking.id}`} className="btn btn-primary btn-xs py-1 px-2 text-center text-xs"> {/* Smaller button */} 
                            View Details
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                <MapPin className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No trips found</h3>
              <p className="mt-2 text-sm text-gray-500">
                {!user
                  ? "You need to be logged in to view your trips"
                  : `You don't have any ${
                      activeFilter !== TripFilter.ALL ? activeFilter.toLowerCase() : ''
                    } trips yet.`}
              </p>
              <div className="mt-6">
                <Link to="/book" className="btn btn-primary">
                  Book a Trip
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripsPage;
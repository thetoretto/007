import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, CreditCard, CheckCircle, XCircle, AlertCircle, QrCode } from 'lucide-react';
import { getBookingsWithDetails } from '../../utils/mockData';
import useAuthStore from '../../store/authStore';

enum TripFilter {
  ALL = 'all',
  UPCOMING = 'upcoming',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

const TripsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeFilter, setActiveFilter] = useState<TripFilter>(TripFilter.ALL);
  
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
    alert(`Booking ${bookingId} would be cancelled here. This is just a demo.`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Trips</h1>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 flex overflow-x-auto py-3 space-x-4">
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeFilter === TripFilter.ALL
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveFilter(TripFilter.ALL)}
            >
              All Trips
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeFilter === TripFilter.UPCOMING
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveFilter(TripFilter.UPCOMING)}
            >
              Upcoming
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeFilter === TripFilter.COMPLETED
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveFilter(TripFilter.COMPLETED)}
            >
              Completed
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeFilter === TripFilter.CANCELLED
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveFilter(TripFilter.CANCELLED)}
            >
              Cancelled
            </button>
          </div>
        </div>
        
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          {userBookings.length > 0 ? (
            <div className="space-y-6">
              {userBookings.map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-4 md:p-6 flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {booking.route?.name}
                        </h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-start">
                            <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                            <div>
                              <p className="text-sm text-gray-500">Route</p>
                              <p className="font-medium">
                                {booking.route?.origin.name} to {booking.route?.destination.name}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                            <div>
                              <p className="text-sm text-gray-500">Date</p>
                              <p className="font-medium">{booking.timeSlot?.date}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <Clock className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                            <div>
                              <p className="text-sm text-gray-500">Time</p>
                              <p className="font-medium">{booking.timeSlot?.time}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-start">
                            <CreditCard className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                            <div>
                              <p className="text-sm text-gray-500">Payment</p>
                              <p className="font-medium">${booking.fare.total.toFixed(2)}</p>
                              <p className="text-xs text-gray-500">
                                {booking.paymentStatus === 'paid' ? 'Paid' : 'Payment pending'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="h-5 w-5 flex items-center justify-center text-gray-400 mr-2">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-armchair">
                                <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/>
                                <path d="M3 11v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H7v-2a2 2 0 0 0-4 0Z"/>
                                <path d="M5 18v2"/>
                                <path d="M19 18v2"/>
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Seat</p>
                              <p className="font-medium">
                                {booking.vehicle?.model} - Seat {booking.seatId.split('s')[1].split('v')[0]}
                              </p>
                            </div>
                          </div>
                          
                          {booking.hasDoorstepPickup && (
                            <div className="flex items-start">
                              <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                              <div>
                                <p className="text-sm text-gray-500">Pickup Address</p>
                                <p className="font-medium">{booking.pickupAddress}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 md:p-6 md:border-l border-gray-200 flex flex-col items-center justify-center md:w-64">
                      {['pending', 'confirmed'].includes(booking.status) ? (
                        <>
                          <div className="mb-4 flex flex-col items-center">
                            <QrCode className="h-32 w-32 text-gray-900 mb-2" />
                            <p className="text-sm text-gray-500">Booking Reference</p>
                            <p className="font-medium">{booking.id}</p>
                          </div>
                          
                          <div className="flex flex-col w-full space-y-2">
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="btn btn-danger py-2 px-4 text-sm"
                            >
                              Cancel Booking
                            </button>
                            <Link to={`/trip/${booking.id}`} className="btn btn-primary py-2 px-4 text-sm">
                              View Details
                            </Link>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="mb-4 text-center">
                            {booking.status === 'cancelled' ? (
                              <XCircle className="h-16 w-16 text-error-500 mx-auto mb-2" />
                            ) : (
                              <CheckCircle className="h-16 w-16 text-success-500 mx-auto mb-2" />
                            )}
                            <p className="font-medium">
                              {booking.status === 'cancelled'
                                ? 'Booking Cancelled'
                                : 'Trip Completed'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {booking.status === 'cancelled'
                                ? 'This booking has been cancelled'
                                : booking.checkedInAt
                                  ? `Checked in at ${new Date(booking.checkedInAt).toLocaleTimeString()}`
                                  : 'Thank you for traveling with us'}
                            </p>
                          </div>
                          
                          <Link to={`/trip/${booking.id}`} className="btn btn-primary py-2 px-4 text-sm">
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
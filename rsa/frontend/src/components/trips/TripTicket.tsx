import '../../index.css';
import React from 'react';
import { BookingWithDetails } from '../../store/bookingStore'; // Updated import path
import { MapPin, Calendar, CreditCard, Users, QrCode, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

interface TripTicketProps {
  booking: BookingWithDetails;
}

const TripTicket: React.FC<TripTicketProps> = ({ booking }) => {
  const {
    route,
    trip,
    status,
    passenger,
    id: bookingId,
    seats,
    checkedInAt
  } = booking;

  // Default payment status since it might not be in the booking object
  const paymentStatus = 'paid'; // You can modify this based on your booking structure

  const getStatusInfo = () => {
    switch (status) {
      case 'pending':
        return { icon: <AlertTriangle className="h-5 w-5 text-primary" />, text: 'Pending Confirmation', color: 'text-primary bg-primary-100' };
      case 'confirmed':
        return { icon: <CheckCircle className="h-5 w-5 text-primary" />, text: 'Confirmed', color: 'text-primary bg-primary-100' };
      case 'completed':
        return { icon: <CheckCircle className="h-5 w-5 text-secondary" />, text: 'Completed', color: 'text-secondary bg-secondary/10' };
      case 'cancelled':
        return { icon: <XCircle className="h-5 w-5 text-accent" />, text: 'Cancelled', color: 'text-accent bg-accent/10' };
      case 'checked-in':
        return { icon: <CheckCircle className="h-5 w-5 text-purple" />, text: 'Checked In', color: 'text-purple bg-purple/10' };
      case 'validated': // Added validated status
        return { icon: <CheckCircle className="h-5 w-5 text-secondary" />, text: 'Validated', color: 'text-secondary bg-secondary/10' };
      case 'booked': // Added booked status
        return { icon: <Info className="h-5 w-5 text-purple" />, text: 'Booked', color: 'text-purple bg-purple/10' };
      default:
        return { icon: <Info className="h-5 w-5 text-gray-500" />, text: status, color: 'text-gray-700 bg-gray-100' };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="relative border border-light dark:border-dark rounded-lg overflow-hidden">
      {/* Header with QR Code and Booking ID */}
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6 pb-6 border-b border-dashed border-light dark:border-dark">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-2xl font-bold text-light-primary dark:text-dark-primary">Boarding Pass</h2>
          <p className="text-sm text-light-secondary dark:text-dark-secondary">Booking ID: {bookingId}</p>
        </div>
        <div className="text-center">
          <QrCode className="h-24 w-24 text-light-primary dark:text-dark-primary mx-auto" />
          <p className="text-xs text-light-secondary dark:text-dark-secondary mt-1">Scan for check-in</p>
        </div>
      </div>

      {/* Passenger and Status */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-light-secondary dark:text-dark-secondary">Passenger</h3>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center ${statusInfo.color}`}>
            {React.cloneElement(statusInfo.icon, { className: 'h-4 w-4 mr-1.5' })}
            {statusInfo.text}
          </span>
        </div>
        <p className="text-xl font-medium text-light-primary dark:text-dark-primary">{passenger?.firstName} {passenger?.lastName}</p>
        {passenger?.email && <p className="text-sm text-light-secondary dark:text-dark-secondary">{passenger.email}</p>}
      </div>

      {/* Trip Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
        <div>
          <p className="text-xs text-light-tertiary dark:text-dark-tertiary uppercase tracking-wider mb-0.5">From</p>
          <p className="text-lg font-medium text-light-primary dark:text-dark-primary flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
            {route?.origin?.name || 'Origin'}
          </p>
          <p className="text-sm text-light-secondary dark:text-dark-secondary ml-7">
            {route?.origin?.address ? `${route.origin.address}, ${route.origin.city}` : 'Address not available'}
          </p>
        </div>
        <div>
          <p className="text-xs text-light-tertiary dark:text-dark-tertiary uppercase tracking-wider mb-0.5">To</p>
          <p className="text-lg font-medium text-light-primary dark:text-dark-primary flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
            {route?.destination?.name || 'Destination'}
          </p>
          <p className="text-sm text-light-secondary dark:text-dark-secondary ml-7">
            {route?.destination?.address ? `${route.destination.address}, ${route.destination.city}` : 'Address not available'}
          </p>
        </div>
        <div>
          <p className="text-xs text-light-tertiary dark:text-dark-tertiary uppercase tracking-wider mb-0.5">Date & Time</p>
          <p className="text-md text-light-secondary dark:text-dark-secondary flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-light-tertiary dark:text-dark-tertiary flex-shrink-0" />
            {trip?.date && trip?.time ? `${trip.date} at ${trip.time}` : 'Date & time TBD'}
          </p>
        </div>
        <div>
          <p className="text-xs text-light-tertiary dark:text-dark-tertiary uppercase tracking-wider mb-0.5">Vehicle & Seat</p>
          <p className="text-md text-light-secondary dark:text-dark-secondary flex items-center">
            <Users className="h-4 w-4 mr-2 text-light-tertiary dark:text-dark-tertiary flex-shrink-0" />
            {trip?.vehicle?.model || 'Vehicle TBD'} - {seats && seats.length > 0 ? `${seats.length} seat${seats.length > 1 ? 's' : ''}` : 'Seat TBD'}
          </p>
        </div>
      </div>

      {/* Fare and Payment */}
      <div className="border-t border-dashed border-light dark:border-dark pt-6">
        <div className="flex justify-between items-center mb-1">
          <p className="text-md text-light-secondary dark:text-dark-secondary">Trip Fare:</p>
          <p className="text-md text-light-primary dark:text-dark-primary">${trip?.price?.toFixed(2) ?? 'N/A'}</p>
        </div>
        <div className="flex justify-between items-center font-bold text-lg mb-2">
          <p className="text-light-primary dark:text-dark-primary">Total Amount:</p>
          <p className="text-primary">${trip?.price?.toFixed(2) ?? 'N/A'}</p>
        </div>
        <div className="flex items-center text-sm">
          <CreditCard className="h-4 w-4 mr-2 text-light-tertiary dark:text-dark-tertiary" />
          <span className="text-light-secondary dark:text-dark-secondary">Payment Status: </span>
          <span className={`ml-1 font-medium ${paymentStatus === 'paid' ? 'text-success' : 'text-warning'}`}>
            {paymentStatus === 'paid' ? 'Paid' : 'Pending'}
          </span>
        </div>
      </div>

      {/* Footer Notes */}
      {checkedInAt && (
        <p className="mt-6 text-center text-sm text-success font-medium">
          Checked in at: {new Date(checkedInAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
        </p>
      )}
      <p className="mt-4 text-center text-xs text-light-tertiary dark:text-dark-tertiary">
        Please arrive at the pickup point at least 15 minutes before departure. Have a safe trip!
      </p>

      {/* Decorative elements */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-background-light dark:bg-background-dark rounded-full border border-light dark:border-dark"></div>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-8 h-8 bg-background-light dark:bg-background-dark rounded-full border border-light dark:border-dark"></div>
    </div>
  );
};

export default TripTicket;
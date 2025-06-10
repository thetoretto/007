import '../../index.css';
import React from 'react';
import { BookingWithDetails } from '../../store/bookingStore'; // Updated import path
import { MapPin, Calendar, Clock, CreditCard, Users, Tag, QrCode, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

interface TripTicketProps {
  booking: BookingWithDetails;
}

const TripTicket: React.FC<TripTicketProps> = ({ booking }) => {
  const { route, timeSlot, vehicle, fare, status, passenger, id: bookingId, seatId, paymentStatus, hasDoorstepPickup, pickupAddress, checkedInAt } = booking;

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
    <div className="card rounded-lg shadow-lg p-6 md:p-8 relative border border-gray-200">
      {/* Header with QR Code and Booking ID */}
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6 pb-6 border-b border-dashed border-gray-300">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-2xl font-bold text-gray-800">Boarding Pass</h2>
          <p className="text-sm text-gray-500">Booking ID: {bookingId}</p>
        </div>
        <div className="text-center">
          <QrCode className="h-24 w-24 text-gray-700 mx-auto" />
          <p className="text-xs text-gray-500 mt-1">Scan for check-in</p>
        </div>
      </div>

      {/* Passenger and Status */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-700">Passenger</h3>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center ${statusInfo.color}`}>
            {React.cloneElement(statusInfo.icon, { className: 'h-4 w-4 mr-1.5' })}
            {statusInfo.text}
          </span>
        </div>
        <p className="text-xl font-medium text-gray-900">{passenger?.firstName} {passenger?.lastName}</p>
        {passenger?.email && <p className="text-sm text-gray-500">{passenger.email}</p>}
      </div>

      {/* Trip Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">From</p>
          <p className="text-lg font-medium text-gray-800 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
            {route?.origin.name}
          </p>
          <p className="text-sm text-gray-500 ml-7">{route?.origin.address}, {route?.origin.city}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">To</p>
          <p className="text-lg font-medium text-gray-800 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
            {route?.destination.name}
          </p>
          <p className="text-sm text-gray-500 ml-7">{route?.destination.address}, {route?.destination.city}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Date & Time</p>
          <p className="text-md text-gray-700 flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" /> {timeSlot?.date} at {timeSlot?.time}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Vehicle & Seat</p>
          <p className="text-md text-gray-700 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0 lucide lucide-armchair">
                <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/><path d="M3 11v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H7v-2a2 2 0 0 0-4 0Z"/><path d="M5 18v2"/><path d="M19 18v2"/>
            </svg>
            {vehicle?.model} - Seat {seatId?.split('s')[1]?.split('v')[0] || 'N/A'}
          </p>
        </div>
        {hasDoorstepPickup && pickupAddress && (
          <div className="md:col-span-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Doorstep Pickup</p>
            <p className="text-md text-gray-700 flex items-start">
              <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" /> {pickupAddress}
            </p>
          </div>
        )}
      </div>

      {/* Fare and Payment */}
      <div className="border-t border-dashed border-gray-300 pt-6">
        <div className="flex justify-between items-center mb-1">
          <p className="text-md text-gray-600">Base Fare:</p>
          <p className="text-md text-gray-800">${fare?.base?.toFixed(2) ?? 'N/A'}</p>
        </div>
        {fare?.extras && fare.extras.length > 0 && (
          <div className="mb-1">
            {fare.extras.map(extra => (
              <div key={extra.name} className="flex justify-between items-center text-sm text-gray-500">
                <p>{extra.name}:</p>
                <p>${extra.amount?.toFixed(2) ?? 'N/A'}</p>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-between items-center font-bold text-lg mb-2">
          <p className="text-gray-800">Total Paid:</p>
          <p className="text-primary">${fare?.total?.toFixed(2) ?? 'N/A'}</p>
        </div>
        <div className="flex items-center text-sm">
          <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
          <span className="text-gray-600">Payment Status: </span>
          <span className={`ml-1 font-medium ${paymentStatus === 'paid' ? 'text-secondary' : 'text-primary'}`}>
            {paymentStatus === 'paid' ? 'Paid' : 'Pending'}
          </span>
        </div>
      </div>

      {/* Footer Notes */}
      {checkedInAt && (
        <p className="mt-6 text-center text-sm text-green-600 font-medium">
          Checked in at: {new Date(checkedInAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
        </p>
      )}
      <p className="mt-4 text-center text-xs text-gray-500">
        Please arrive at the pickup point at least 15 minutes before departure. Have a safe trip!
      </p>

      {/* Decorative elements */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gray-50 rounded-full border border-gray-200"></div>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-8 h-8 bg-gray-50 rounded-full border border-gray-200"></div>
    </div>
  );
};

export default TripTicket;
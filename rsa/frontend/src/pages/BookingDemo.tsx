import React, { useState } from 'react';
import SinglePageBooking from '../components/booking/SinglePageBooking';
import { Check, ArrowLeft } from 'lucide-react';

interface BookingDetails {
  id: string;
  confirmationCode: string;
  fromLocation: string;
  toLocation: string;
  date: string;
  time: string;
  passengerName: string;
  seatNumber: string;
  seatType: string;
  paymentMethod: string;
  totalAmount: number;
  pickupPoint?: string;
}

const BookingDemo: React.FC = () => {
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);

  const handleBookingComplete = (details: BookingDetails) => {
    setBookingDetails(details);
    setBookingComplete(true);
  };

  const handleNewBooking = () => {
    setBookingComplete(false);
    setBookingDetails(null);
  };

  if (bookingComplete && bookingDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Booking Confirmed!
              </h1>
              <p className="text-white/90">
                Your journey is all set
              </p>
            </div>

            {/* Booking Details */}
            <div className="p-6 space-y-6">
              {/* Confirmation Code */}
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Confirmation Code
                </p>
                <p className="text-3xl font-bold text-accent-kente-gold tracking-wider">
                  {bookingDetails.confirmationCode}
                </p>
              </div>

              {/* Trip Details */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Trip Details
                </h3>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">From</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      {bookingDetails.fromLocation}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">To</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      {bookingDetails.toLocation}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Date</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      {new Date(bookingDetails.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Time</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      {bookingDetails.time}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Passenger</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      {bookingDetails.passengerName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Seat</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      {bookingDetails.seatNumber} ({bookingDetails.seatType})
                    </p>
                  </div>
                  {bookingDetails.pickupPoint && (
                    <div className="col-span-2">
                      <p className="text-gray-600 dark:text-gray-400">Pickup Point</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {bookingDetails.pickupPoint}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-accent-kente-gold/10 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    Total Paid
                  </span>
                  <span className="text-xl font-bold text-accent-kente-gold">
                    ${bookingDetails.totalAmount.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Paid via {bookingDetails.paymentMethod}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleNewBooking}
                  className="flex-1 px-6 py-3 bg-accent-kente-gold hover:bg-accent-kente-gold-dark text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Book Another Trip</span>
                </button>
                <button className="flex-1 px-6 py-3 border-2 border-accent-kente-gold text-accent-kente-gold hover:bg-accent-kente-gold hover:text-white rounded-lg font-semibold transition-colors">
                  View My Bookings
                </button>
              </div>

              {/* Important Notes */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Important Information
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Please arrive at the departure point 15 minutes early</li>
                  <li>• Keep your confirmation code ready for boarding</li>
                  <li>• Contact support if you need to make changes</li>
                  <li>• Cancellations must be made 2 hours before departure</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Single Page Booking Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete your entire booking process on one page - no scrolling required!
          </p>
        </div>
        
        <SinglePageBooking 
          onBookingComplete={handleBookingComplete}
          className="max-w-4xl mx-auto"
        />
      </div>
    </div>
  );
};

export default BookingDemo;
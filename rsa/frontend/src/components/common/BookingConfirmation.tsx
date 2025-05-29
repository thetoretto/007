import React, { useRef } from 'react';
import { CheckCircle, Calendar, MapPin, User, Info, CreditCard, Printer, Share2, Download } from 'lucide-react';
import QRCode from 'react-qr-code';
import { downloadQRCodeAsImage, createShareableBookingURL, downloadCompleteTicket } from '../../utils/qrCodeUtils';

export interface BookingDetails {
  id: string;
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
  confirmationCode?: string;
}

export interface BookingConfirmationProps {
  bookingDetails: BookingDetails;
  onClose?: () => void;
  onBookAnother?: () => void;
  onViewBookings?: () => void;
  className?: string;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  bookingDetails,
  onClose,
  onBookAnother,
  onViewBookings,
  className = ''
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  // Generate QR code value with booking details
  const qrValue = JSON.stringify({
    confirmationCode: bookingDetails.confirmationCode || bookingDetails.id,
    passenger: bookingDetails.passengerName,
    from: bookingDetails.fromLocation,
    to: bookingDetails.toLocation,
    date: bookingDetails.date,
    time: bookingDetails.time,
    seat: bookingDetails.seatNumber
  });

  // Handle print functionality
  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const originalContents = document.body.innerHTML;
    const printContents = printContent.innerHTML;
    
    document.body.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="margin-bottom: 5px; color: #000;">Booking Confirmation</h1>
          <p style="margin-top: 0; color: #666;">Please keep this ticket for your records</p>
        </div>
        ${printContents}
        <div style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
          <p>Thank you for choosing our service.</p>
          <p>For assistance, contact our support at support@transport.com</p>
        </div>
      </div>
    `;
    
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  // Update share handler to use the utility
  const handleShare = async () => {
    if (navigator.share) {
      try {
        // Create shareable URL with booking details
        const shareUrl = createShareableBookingURL({
          id: bookingDetails.id,
          confirmationCode: bookingDetails.confirmationCode,
          passengerName: bookingDetails.passengerName,
          fromLocation: bookingDetails.fromLocation,
          toLocation: bookingDetails.toLocation,
          date: bookingDetails.date,
          time: bookingDetails.time
        });
        
        await navigator.share({
          title: 'My Booking Confirmation',
          text: `Booking from ${bookingDetails.fromLocation} to ${bookingDetails.toLocation} on ${bookingDetails.date} at ${bookingDetails.time}`,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        alert('Could not share the booking details. Please try again.');
      }
    } else {
      alert('Web Share API is not supported in your browser. Please use the print option instead.');
    }
  };

  // Update download handler to use the complete ticket utility
  const handleDownload = () => {
    downloadCompleteTicket(
      bookingDetails,
      qrCodeRef.current,
      `booking-${bookingDetails.confirmationCode || bookingDetails.id}.png`
    );
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 dark:border-gray-700 flex flex-col max-h-[85vh] overflow-hidden ${className}`}>
      <div className="text-center mb-3 sm:mb-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-green-500 dark:text-green-400" />
        </div>
        
        <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 text-sm sm:text-base max-w-md mx-auto">
          Your trip has been successfully booked. Please keep your confirmation details for reference.
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-1 pb-1">
        {/* Booking details card - printable area */}
        <div ref={printRef} className="mb-5 sm:mb-6 p-4 sm:p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-left shadow-sm border border-gray-200 dark:border-gray-600 max-w-md mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-base sm:text-lg text-accent-kente-gold">Trip Details</h3>
            <div className="text-xs sm:text-sm bg-accent-kente-gold/10 text-accent-kente-gold px-2 py-1 rounded-full font-medium">
              #{bookingDetails.confirmationCode || 'N/A'}
            </div>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-start">
              <div className="bg-accent-kente-gold/10 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-accent-kente-gold" />
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">From</div>
                <div className="font-medium text-sm sm:text-base">{bookingDetails.fromLocation}</div>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-accent-kente-gold/10 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-accent-kente-gold" />
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">To</div>
                <div className="font-medium text-sm sm:text-base">{bookingDetails.toLocation}</div>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-accent-kente-gold/10 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-accent-kente-gold" />
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Date & Time</div>
                <div className="font-medium text-sm sm:text-base">
                  {bookingDetails.date} • {bookingDetails.time}
                </div>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-accent-kente-gold/10 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-accent-kente-gold" />
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Passenger</div>
                <div className="font-medium text-sm sm:text-base">{bookingDetails.passengerName}</div>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-accent-kente-gold/10 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
                <Info className="h-4 w-4 sm:h-5 sm:w-5 text-accent-kente-gold" />
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Seat</div>
                <div className="font-medium text-sm sm:text-base">
                  #{bookingDetails.seatNumber} ({bookingDetails.seatType})
                </div>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-accent-kente-gold/10 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-accent-kente-gold" />
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Payment Method</div>
                <div className="capitalize font-medium text-sm sm:text-base">{bookingDetails.paymentMethod}</div>
              </div>
            </div>
            
            {bookingDetails.pickupPoint && (
              <div className="flex items-start">
                <div className="bg-accent-kente-gold/10 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-accent-kente-gold" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Pickup Point</div>
                  <div className="font-medium text-sm sm:text-base">{bookingDetails.pickupPoint}</div>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="font-medium text-sm sm:text-base">Total Paid</div>
              <div className="text-lg sm:text-xl font-bold text-accent-kente-gold">
                ${bookingDetails.totalAmount.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
        
        {/* QR Code Section */}
        <div className="text-center mb-5">
          <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Your Ticket QR Code</h4>
          <div 
            ref={qrCodeRef} 
            className="bg-white p-2 sm:p-3 inline-block rounded-lg mx-auto mb-1.5 border border-gray-200 shadow-sm"
          >
            <QRCode value={qrValue} size={112} className="w-28 h-28 sm:w-32 sm:h-32" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto px-2">
            Present this QR code to the driver when boarding the vehicle
          </p>
        </div>
      </div>
      
      {/* Action Buttons - Sticky at the bottom */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-1 sticky bottom-0 bg-white dark:bg-gray-800">
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-3">
          <button
            onClick={handlePrint}
            className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-xs sm:text-sm transition-colors leading-tight"
          >
            <Printer className="h-3.5 w-3.5 mr-1.5" />
            Print Ticket
          </button>
          
          <button
            onClick={handleShare}
            className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-xs sm:text-sm transition-colors leading-tight"
          >
            <Share2 className="h-3.5 w-3.5 mr-1.5" />
            Share Details
          </button>
          
          <button
            onClick={handleDownload}
            className="flex items-center px-3 py-2 bg-accent-kente-gold hover:bg-accent-kente-gold-dark text-white rounded-lg text-xs sm:text-sm transition-colors leading-tight"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Download Ticket
          </button>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <button
            onClick={onBookAnother}
            className="w-full py-2.5 sm:py-3 bg-accent-kente-gold hover:bg-accent-kente-gold-dark text-white rounded-lg transition-all text-sm sm:text-base font-medium"
          >
            Book Another Trip
          </button>
          
          <button
            onClick={onViewBookings}
            className="w-full py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base"
          >
            View My Bookings
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation; 
import '../../../index.css';
// d:\007\rsa\frontend\src\components\booking\steps\ReceiptStep.tsx
import React from 'react';
import { BookingDetails } from '../types';
// Remove CSS module import
// import styles from '../BookingWidget.module.css'; 
import { CheckCircle, Printer, Download, RotateCcw, X } from 'lucide-react';
// Consider adding a QR code library (e.g., qrcode.react) if needed

interface ReceiptStepProps {
  details: BookingDetails | null;
  onBookAnother: () => void; // Action to reset the widget for a new booking
  onClose: () => void; // Action to close the widget
}

const ReceiptStep: React.FC<ReceiptStepProps> = ({ details, onBookAnother, onClose }) => {
  if (!details) {
    return (
      <div className="text-center p-6 bg-yellow-50 border border-yellow-300 rounded-lg">
        <p className="text-yellow-700 mb-4">Booking details are not available. Please try again.</p>
        <button 
          onClick={onClose} 
          className="btn bg-gray-500 hover:bg-gray-600 text-white focus:ring-gray-500 flex items-center justify-center mx-auto"
        >
          <X size={16} className="mr-1" /> Close
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print(); // Basic print functionality
  };

  const handleDownload = () => {
    // Implement PDF generation/download logic here
    alert('Download PDF functionality not implemented yet.');
  };

  return (
    <div className="space-y-6 text-center">
      <div className="flex flex-col items-center">
        <CheckCircle size={48} className="text-green-500 mb-3" />
        <h3 className="text-xl font-semibold text-gray-800">Booking Confirmed!</h3>
        <p className="text-sm text-gray-600 mt-1">Booking ID: <strong className="text-gray-900">{details.bookingId}</strong></p>
      </div>

      {/* QR Code Placeholder */}
      <div className="bg-gray-100 border border-dashed border-gray-300 rounded-lg p-6 h-32 flex items-center justify-center text-gray-500">
        {/* <QRCode value={`BookingID:${details.bookingId}`} size={128} /> */}
        <p>[QR Code Area]</p>
      </div>

      {/* Booking Details Summary */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 text-left space-y-2 text-sm">
        <h4 className="text-base font-semibold text-gray-700 mb-2 pb-2 border-b">Trip Details</h4>
        <p><strong className="font-medium text-gray-600 w-20 inline-block">Route:</strong> {details.route.origin.name} to {details.route.destination.name}</p>
        <p><strong className="font-medium text-gray-600 w-20 inline-block">Vehicle:</strong> {details.vehicle.model}</p>
        <p><strong className="font-medium text-gray-600 w-20 inline-block">Seats:</strong> {details.seats.map(s => s.number).join(', ')}</p>
        {details.pickupPoint && (
          <p><strong className="font-medium text-gray-600 w-20 inline-block">Pickup:</strong> {details.pickupPoint.name} ({details.pickupPoint.address})</p>
        )}
        <p><strong className="font-medium text-gray-600 w-20 inline-block">Total Paid:</strong> <span className="font-semibold text-green-700">${details.totalPrice.toFixed(2)}</span></p>
        <p><strong className="font-medium text-gray-600 w-20 inline-block">Date:</strong> {new Date(details.bookingTime).toLocaleString()}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-3 pt-4 border-t mt-6">
        <button onClick={handlePrint} className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-300">
          <Printer size={16} className="mr-1.5" /> Print Receipt
        </button>
        <button onClick={handleDownload} className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-300">
          <Download size={16} className="mr-1.5" /> Download PDF
        </button>
        <button onClick={onBookAnother} className="btn bg-blue-100 hover:bg-blue-200 text-blue-700 focus:ring-blue-300 font-medium">
          <RotateCcw size={16} className="mr-1.5" /> Book Another
        </button>
      </div>

      {/* Close button is separate and might be styled differently or placed elsewhere by parent */}
      {/* <button onClick={onClose} className="mt-6 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors flex items-center justify-center mx-auto">
        <X size={16} className="mr-1" /> Close
      </button> */}
    </div>
  );
};

export default ReceiptStep;
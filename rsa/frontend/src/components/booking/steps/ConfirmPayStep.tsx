import '../../../index.css';
// d:\007\rsa\frontend\src\components\booking\steps\ConfirmPayStep.tsx
import React, { useState } from 'react';
import { Route, Vehicle, Seat, BookingPickupPoint, BookingState } from '../types'; // Changed PickupPoint to BookingPickupPoint
// Remove CSS module import
// import styles from '../BookingWidget.module.css'; 
import { MapPin, Calendar, Clock, Users, Truck, CreditCard, CheckCircle, AlertCircle, Map } from 'lucide-react'; // Added Map icon

interface ConfirmPayStepProps {
  state: BookingState;
  availableHotPoints: BookingPickupPoint[]; // Added to receive filtered hot points for the current trip
  onTogglePickup: (needsPickup: boolean) => void;
  onSelectPickupPoint: (pointId: string | null) => void;
  onConfirmBooking: () => Promise<void>; // Async action
  onPrev: () => void;
}

const ConfirmPayStep: React.FC<ConfirmPayStepProps> = ({
  state,
  availableHotPoints, // Use this prop for displaying pickup points
  onTogglePickup,
  onSelectPickupPoint,
  onConfirmBooking,
  onPrev,
}) => {
  // Use availableHotPoints passed from BookingWidget, which are already filtered for the current trip
  const { selectedTrip, selectedVehicle, selectedSeats, needsPickup, selectedPickupPoint, loading, error } = state; // Changed selectedRoute to selectedTrip
  const [showPickupSelector, setShowPickupSelector] = useState(needsPickup);

  // Basic validation - ensure required data exists
  if (!selectedTrip || !selectedVehicle || selectedSeats.length === 0) { // Changed selectedRoute to selectedTrip
    return (
      <div className="text-center text-red-600 bg-red-100 p-4 rounded-lg border border-red-300">
        <AlertCircle className="inline-block mr-2" size={18} />
        Booking details incomplete. Please go back and complete the previous steps.
      </div>
    );
  }

  const calculateTotal = () => {
    const seatTotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    const pickupFee = needsPickup ? 5.00 : 0; // Example fee
    // Add other fees/taxes later
    return seatTotal + pickupFee;
  };

  const handlePickupToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    onTogglePickup(checked);
    setShowPickupSelector(checked);
    if (!checked) {
      onSelectPickupPoint(null); // Clear selection if pickup is disabled
    }
  };

  const handlePay = async () => {
    // Add payment processing logic here if needed
    // For now, just trigger the booking confirmation
    await onConfirmBooking();
    // The main widget reducer will handle moving to the Receipt step on success
  };

  const total = calculateTotal();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">Confirm & Pay</h3>

      {/* Booking Summary */}
      <div className="card-base p-4 space-y-2">
        <h4 className="text-base font-semibold text-text-base dark:text-text-inverse mb-2 pb-2 border-b border-border-light dark:border-border-dark">Booking Summary</h4>
        <div className="flex items-center text-sm text-text-muted dark:text-text-muted-inverse"><MapPin size={16} className="mr-2 text-primary dark:text-primary-200" /> Route: {selectedTrip.fromLocation} to {selectedTrip.toLocation}</div>
        <div className="flex items-center text-sm text-text-muted dark:text-text-muted-inverse"><Users size={16} className="mr-2 text-primary dark:text-primary-200" /> Vehicle: {selectedVehicle.model}</div>
        <div className="flex items-center text-sm text-text-muted dark:text-text-muted-inverse"><CheckCircle size={16} className="mr-2 text-success dark:text-success-200" /> Seats: {selectedSeats.map(s => s.number).join(', ')}</div>
      </div>

      {/* Pickup Option */}
      <div className="card-base p-4 space-y-3">
        <label className="flex items-center space-x-3 cursor-pointer font-medium text-text-base dark:text-text-inverse">
          <input type="checkbox" className="form-checkbox text-primary focus:ring-primary dark:focus:ring-primary-200" />
          <Truck size={18} className="text-accent dark:text-accent-200" />
          <span>I need pickup at a designated point (<span className="font-semibold text-text-primary dark:text-text-primary-inverse">$5.00</span> extra)</span>
        </label>

        {showPickupSelector && selectedTrip?.offersPickup && (
          <div className="pl-7 space-y-2 pt-2 border-t border-border-light dark:border-border-dark mt-3">
            <h5 className="text-sm font-semibold text-text-muted dark:text-text-muted-inverse mb-1">Choose Pickup Point:</h5>
            {availableHotPoints.length > 0 ? (
              availableHotPoints.map(point => (
                <label key={point.id} className={`card-base flex items-center space-x-2 p-2 cursor-pointer transition-colors ${selectedPickupPoint?.id === point.id ? 'ring-2 ring-primary dark:ring-primary-200' : ''}`}>
                  <input
                    type="radio"
                    name="pickupPoint"
                    className="form-radio text-primary focus:ring-primary dark:focus:ring-primary-200"
                  />
                  <Map size={18} className="mr-2 text-text-muted dark:text-text-muted-inverse flex-shrink-0" />
                  <div className="text-sm">
                    <span className="font-medium text-text-base dark:text-text-inverse block">{point.name}</span>
                    <span className="text-xs text-text-muted dark:text-text-muted-inverse">{point.address}</span>
                  </div>
                </label>
              ))
            ) : (
              <p className="text-sm text-text-muted dark:text-text-muted-inverse">No pickup points available for this trip or they are all inactive.</p>
            )}
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="card-base p-4 space-y-1 text-sm">
        <h4 className="text-base font-semibold text-text-base dark:text-text-inverse mb-2 pb-2 border-b border-border-light dark:border-border-dark">Price</h4>
        <div className="flex justify-between text-text-muted dark:text-text-muted-inverse">
          <span>Seats ({selectedSeats.length}):</span>
          <span>${selectedSeats.reduce((sum, seat) => sum + seat.price, 0).toFixed(2)}</span>
        </div>
        {needsPickup && (
          <div className="flex justify-between text-text-muted dark:text-text-muted-inverse">
            <span>Pickup Fee:</span>
            <span>$5.00</span>
          </div>
        )}
        <div className="flex justify-between font-semibold text-text-primary dark:text-text-primary-inverse pt-2 border-t border-border-light dark:border-border-dark mt-2">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Section (Placeholder) */}
      <div className="card p-4 rounded-lg border border-gray-200">
        <h4 className="text-base font-semibold text-gray-700 mb-3">Payment</h4>
        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-dashed border-blue-300 rounded-md text-blue-700">
          <CreditCard size={18} />
          <div>
            <p className="font-medium text-sm">Secure Payment (Demo)</p>
            <p className="text-xs">Payment processing simulation. Click below to confirm.</p>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded border border-red-300 flex items-center"><AlertCircle size={16} className="mr-2"/>{error}</p>}

      {/* Navigation is handled by the parent BookingWidget */}
      {/* This component provides the final action button */}
      <div className="flex justify-end pt-4 border-t mt-6">
         {/* Back button is rendered by parent */}
         <button
           onClick={handlePay}
           disabled={loading || (needsPickup && !selectedPickupPoint)}
           className={`btn bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 px-6 py-2.5 min-w-[150px] ${loading ? 'animate-pulse' : ''}`}
         >
           {loading ? (
             <>
               <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
               Processing...
             </>
           ) : (
             `Pay & Book $${total.toFixed(2)}`
           )}
         </button>
      </div>
    </div>
  );
};

export default ConfirmPayStep;
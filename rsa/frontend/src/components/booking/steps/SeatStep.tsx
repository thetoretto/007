import '../../../index.css';
// d:\007\rsa\frontend\src\components\booking\steps\SeatStep.tsx
import React from 'react';
import { Seat, Vehicle } from '../types';
// Remove CSS module import
// import styles from '../BookingWidget.module.css'; 

interface SeatStepProps {
  vehicle: Vehicle | null;
  seats: Seat[]; // Seats available for the selected vehicle
  selectedSeats: Seat[];
  onSelectSeat: (seatId: string) => void;
  onDeselectSeat: (seatId: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

const SeatStep: React.FC<SeatStepProps> = ({
  vehicle,
  seats,
  selectedSeats,
  onSelectSeat,
  onDeselectSeat,
  onNext,
  onPrev,
}) => {
  if (!vehicle) {
    return <p className="text-center text-gray-500">Please select a vehicle first.</p>; // Or handle appropriately
  }

  const handleSeatClick = (seat: Seat) => {
    if (!seat.available) return; // Ignore unavailable seats

    const isSelected = selectedSeats.some(s => s.id === seat.id);
    const maxCapacity = vehicle.capacity;

    if (isSelected) {
      onDeselectSeat(seat.id);
    } else {
      if (selectedSeats.length < maxCapacity) {
        onSelectSeat(seat.id);
      } else {
        // Optional: Show a message that capacity is reached
        console.warn('Maximum seat capacity reached.');
      }
    }
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seat) => total + seat.price, 0);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Select Your Seat(s)</h3>
      <p className="text-sm text-gray-600 mb-4">Vehicle: {vehicle.model} (Max {vehicle.capacity} seats)</p>

      {/* Basic Seat Map Representation */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 p-4 border rounded-lg bg-gray-50 max-h-60 overflow-y-auto">
        {seats.map(seat => {
          const isSelected = selectedSeats.some(s => s.id === seat.id);
          return (
            <button
              key={seat.id}
              onClick={() => handleSeatClick(seat)}
              disabled={!seat.available}
              className={`
                w-10 h-10 border rounded text-xs font-medium flex items-center justify-center transition-colors duration-150 
                ${!seat.available 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed line-through' 
                  : isSelected 
                    ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-300' 
                    : 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200 hover:border-green-400 cursor-pointer'
                }
              `}
            >
              {seat.number}
            </button>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-gray-100 rounded-md text-sm text-gray-700">
        {selectedSeats.length > 0 ? (
          <p>
            Selected: <span className="font-semibold">{selectedSeats.map(s => s.number).join(', ')}</span>
            <span className="ml-2">({selectedSeats.length} x ${selectedSeats[0]?.price.toFixed(2) || '0.00'} = <span className="font-semibold">${calculateTotal().toFixed(2)}</span>)</span>
          </p>
        ) : (
          <p className="text-gray-500">Select available seats from the map above.</p>
        )}
      </div>

      {/* Navigation buttons live in BookingWidget */}
    </div>
  );
};

export default SeatStep;
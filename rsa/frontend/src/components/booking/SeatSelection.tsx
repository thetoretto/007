import React, { useEffect } from 'react';
import { Armchair, Check } from 'lucide-react';
import useBookingStore from '../../store/bookingStore';
import LoadingSpinner from '../common/LoadingSpinner';

const SeatSelection: React.FC = () => {
  const {
    selectedVehicle,
    availableSeats,
    selectedSeat,
    fetchSeats, // Assuming a fetchSeats function exists or will be added
    selectSeat,
    loading,
    error,
  } = useBookingStore();

  useEffect(() => {
    if (selectedVehicle) {
      // Assuming fetchSeats takes vehicleId
      // fetchSeats(selectedVehicle.id);
      console.log('Need to implement fetchSeats in store'); // Placeholder
    }
  }, [selectedVehicle]); // Removed fetchSeats dependency until implemented

  if (!selectedVehicle) {
    return (
      <div className="p-4 bg-warning-50 text-warning-700 rounded-md">
        <p>Please select a vehicle first.</p>
      </div>
    );
  }

  // Placeholder for loading and error states related to seats
  // if (loading && availableSeats.length === 0) { ... }
  // if (error) { ... }

  // Mock available seats for now until fetchSeats is implemented
  const mockSeats = Array.from({ length: selectedVehicle.capacity }, (_, i) => ({
    id: `seat-${i + 1}`,
    number: `${String.fromCharCode(65 + Math.floor(i / 4))}${ (i % 4) + 1 }`,
    isAvailable: Math.random() > 0.3, // Random availability
  }));

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-semibold mb-4">Select Your Seat</h2>

      <div className="p-4 border rounded-lg bg-gray-50 mb-6">
        <h3 className="font-medium mb-2">Vehicle Layout (Example)</h3>
        <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
          {mockSeats.map((seat) => (
            <button
              key={seat.id}
              onClick={() => seat.isAvailable && selectSeat(seat.id)}
              disabled={!seat.isAvailable}
              className={`
                p-2 rounded border flex flex-col items-center justify-center aspect-square
                ${
                  selectedSeat === seat.id
                    ? 'bg-primary-500 text-white border-primary-600'
                    : seat.isAvailable
                    ? 'bg-white hover:bg-primary-50 border-gray-300 cursor-pointer'
                    : 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                }
              `}
            >
              <Armchair className="h-4 w-4 mb-1" />
              <span className="text-xs font-medium">{seat.number}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">Seats marked in gray are unavailable.</p>
      </div>

      {selectedSeat && (
         <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
           <p className="text-success-700 font-medium">
             Selected Seat: {mockSeats.find(s => s.id === selectedSeat)?.number}
           </p>
         </div>
      )}

      {/* Add error handling display if needed */}
    </div>
  );
};

export default SeatSelection;
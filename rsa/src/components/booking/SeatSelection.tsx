import React from 'react';
import useBookingStore from '../../store/bookingStore';
import { Seat } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';

const SeatSelection: React.FC = () => {
  const {
    availableSeats,
    selectedSeat,
    selectedVehicle,
    loading,
    error,
    selectSeat,
    fetchSeats
  } = useBookingStore();

  React.useEffect(() => {
    if (selectedVehicle?.id) {
      fetchSeats(selectedVehicle.id);
    }
  }, [selectedVehicle, fetchSeats]);

  if (!selectedVehicle) {
    return (
      <div className="p-4 bg-warning-50 text-warning-700 rounded-md">
        <p>Please select a vehicle first.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-error-50 text-error-700 rounded-md">
        <p>Error: {error}</p>
        <button
          onClick={() => selectedVehicle?.id && fetchSeats(selectedVehicle.id)}
          className="mt-2 btn btn-primary text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!availableSeats || availableSeats.length === 0) {
    return (
      <div className="p-4 bg-warning-50 text-warning-700 rounded-md">
        <p>No seats available for this vehicle.</p>
      </div>
    );
  }

  const getSeatStatus = (seat: Seat) => {
    if (!seat.isAvailable) return 'booked';
    if (selectedSeat?.id === seat.id) return 'selected';
    return 'available';
  };

  const getSeatClasses = (status: string) => {
    const baseClasses = 'w-12 h-12 rounded-md flex items-center justify-center transition-all duration-200 ease-in-out';
    
    switch (status) {
      case 'booked':
        return `${baseClasses} bg-gray-200 text-gray-500 cursor-not-allowed`;
      case 'selected':
        return `${baseClasses} bg-primary-500 text-white ring-2 ring-primary-300`;
      default:
        return `${baseClasses} bg-white border border-gray-300 hover:border-primary-500 hover:shadow-sm cursor-pointer`;
    }
  };

  // Static seat configuration
  const staticSeats = [
    { id: 'seat-1', number: 1, isAvailable: true, position: { row: 1, column: 1 }, type: 'standard', price: 0 },
    { id: 'seat-2', number: 2, isAvailable: true, position: { row: 1, column: 2 }, type: 'standard', price: 0 },
    { id: 'seat-3', number: 3, isAvailable: false, position: { row: 1, column: 3 }, type: 'standard', price: 0 },
    { id: 'seat-4', number: 4, isAvailable: true, position: { row: 2, column: 1 }, type: 'premium', price: 0 },
    { id: 'seat-5', number: 5, isAvailable: true, position: { row: 2, column: 2 }, type: 'premium', price: 0 },
    { id: 'seat-6', number: 6, isAvailable: true, position: { row: 2, column: 3 }, type: 'standard', price: 0 },
    { id: 'seat-7', number: 7, isAvailable: true, position: { row: 3, column: 1 }, type: 'standard', price: 0 },
    { id: 'seat-8', number: 8, isAvailable: true, position: { row: 3, column: 2 }, type: 'disabled', price: 0 },
    { id: 'seat-9', number: 9, isAvailable: false, position: { row: 3, column: 3 }, type: 'standard', price: 0 },
  ]

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-semibold mb-4">Select Your Seat</h2>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          Selected Vehicle: <span className="font-medium">{selectedVehicle.model}</span>
        </p>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4 p-3 bg-white rounded-md shadow-sm text-center text-gray-500">
            <p>Front of Vehicle</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {staticSeats.map((seat) => {
              const status = seat.isAvailable ? 
                (selectedSeat?.id === seat.id ? 'selected' : 'available') : 'booked';
              const seatTypeClasses = {
                standard: 'border-gray-300 hover:border-primary-500',
                premium: 'border-accent-300 hover:border-accent-500 bg-accent-50',
                disabled: 'border-info-300 hover:border-info-500 bg-info-50'
              }[seat.type];
              
              return (
                <button
                  key={seat.id}
                  disabled={!seat.isAvailable}
                  onClick={() => seat.isAvailable && selectSeat(seat.id)}
                  className={`
                    w-full aspect-square rounded-md flex items-center justify-center
                    transition-all duration-200 ease-in-out relative
                    ${status === 'booked' ? 'bg-gray-200 text-gray-500 cursor-not-allowed' :
                      status === 'selected' ? 'bg-primary-500 text-white ring-2 ring-primary-300' :
                      `border ${seatTypeClasses} cursor-pointer`}
                  `}
                  title={`Seat ${seat.number} - ${seat.type.charAt(0).toUpperCase() + seat.type.slice(1)} - ${status.charAt(0).toUpperCase() + status.slice(1)}`}
                >
                  <span className="text-lg font-medium">{seat.number}</span>
                  {seat.type !== 'standard' && (
                    <span className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3">
                      <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-xs
                        ${seat.type === 'premium' ? 'bg-accent-500 text-white' : 'bg-info-500 text-white'}`}>
                        {seat.type === 'premium' ? 'P' : 'D'}
                      </span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

        <div className="mt-8 flex items-center justify-center space-x-8">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-white border border-gray-300 rounded-md mr-2" />
            <span className="text-sm text-gray-600">Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-primary-500 rounded-md mr-2" />
            <span className="text-sm text-gray-600">Selected</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-gray-200 rounded-md mr-2" />
            <span className="text-sm text-gray-600">Booked</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default SeatSelection;
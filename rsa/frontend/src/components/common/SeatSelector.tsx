import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Check, X, AlertTriangle, Info, Users, Accessibility } from 'lucide-react';
import { showNotification } from '../../utils/notifications'; // Assuming this path is correct

interface Seat {
  id: string;
  number: string;
  price: number;
  type: 'standard' | 'premium' | 'vip' | 'accessible';
  status: 'available' | 'selected' | 'booked' | 'reserved';
  position: {
    row: number; // 0: front, 1: middle, 2: back
    col: number; // Index within the row
    aisle?: boolean; // Indicates if there's an aisle next to this seat in its drawn position
  };
  notes?: string;
}

interface SeatSelectorProps {
  initialSeats: Seat[];
  initialSelectedSeats?: Seat[];
  onSeatSelect?: (seats: Seat[]) => void;
  maxSelectableSeats?: number;
  vehicleName?: string; // Added to replace vehicleConfig.name
}

// vehicleConfig and generateSeats are removed as seats will be passed via props.

const SeatComponent: React.FC<{
  seat: Seat;
  onClick: () => void;
  isSelected: boolean;
  isDisabled: boolean;
}> = ({ seat, onClick, isSelected, isDisabled }) => {
  const getSeatStyles = () => {
    let baseStyle = 'w-10 h-10 sm:w-12 sm:h-12 rounded-md border-2 flex items-center justify-center font-semibold text-sm transition-all duration-150 ease-in-out relative';
    if (isDisabled && seat.status !== 'selected') {
      return `${baseStyle} bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed`;
    }
    if (isSelected) {
      return `${baseStyle} bg-blue-500 border-blue-700 text-white shadow-lg transform scale-105`;
    }
    switch (seat.type) {
      case 'premium': return `${baseStyle} bg-indigo-100 border-indigo-300 hover:bg-indigo-200 text-indigo-800`;
      case 'vip': return `${baseStyle} bg-purple-100 border-purple-300 hover:bg-purple-200 text-purple-800`;
      case 'accessible': return `${baseStyle} bg-yellow-100 border-yellow-300 hover:bg-yellow-200 text-yellow-800`;
      case 'standard':
      default:
        return `${baseStyle} bg-green-100 border-green-300 hover:bg-green-200 text-green-800`;
    }
  };

  return (
    <button
      type="button"
      aria-label={`Seat ${seat.number}, Type: ${seat.type}, Price: $${seat.price.toFixed(2)}, Status: ${isDisabled && !isSelected ? 'Booked/Reserved' : isSelected ? 'Selected' : 'Available'}`}
      aria-pressed={isSelected}
      disabled={isDisabled && !isSelected}
      onClick={onClick}
      className={getSeatStyles()}
      title={seat.notes || `Seat ${seat.number} - ${seat.type}`}
    >
      {seat.number}
      {isSelected && <Check size={16} className="absolute top-1 right-1 text-white" />}
      {seat.type === 'accessible' && !isSelected && <Accessibility size={16} className="absolute bottom-1 right-1 opacity-70" />}
      {seat.status === 'reserved' && <Info size={16} className="absolute top-1 left-1 opacity-70" title="Driver"/>}
    </button>
  );
};

const SeatSelector: React.FC<SeatSelectorProps> = ({ initialSeats, initialSelectedSeats = [], onSeatSelect, maxSelectableSeats, vehicleName = 'Vehicle' }) => {
  const [seatsData, setSeatsData] = useState<Seat[]>(initialSeats);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>(initialSelectedSeats);

  // Update seatsData if initialSeats prop changes
  useEffect(() => {
    setSeatsData(initialSeats);
  }, [initialSeats]);

  // Update selectedSeats if initialSelectedSeats prop changes
  useEffect(() => {
    setSelectedSeats(initialSelectedSeats);
  }, [initialSelectedSeats]);

  const handleSeatClick = useCallback((seatId: string) => {
    const clickedSeat = seatsData.find(s => s.id === seatId);
    if (!clickedSeat || clickedSeat.status === 'booked' || clickedSeat.status === 'reserved') return;

    const isCurrentlySelected = selectedSeats.some(s => s.id === seatId);

    let newSelectedSeats;
    if (isCurrentlySelected) {
      newSelectedSeats = selectedSeats.filter(s => s.id !== seatId);
      showNotification('Seat Deselected', { body: `Seat ${clickedSeat.number} removed from selection.` });
    } else {
      if (maxSelectableSeats && selectedSeats.length >= maxSelectableSeats) {
        showNotification('Selection Limit Reached', { body: `You can select a maximum of ${maxSelectableSeats} seats.`, type: 'warning' });
        return;
      }
      newSelectedSeats = [...selectedSeats, clickedSeat];
      showNotification('Seat Selected', { body: `Seat ${clickedSeat.number} (${clickedSeat.type}) added for $${clickedSeat.price.toFixed(2)}` });
    }
    setSelectedSeats(newSelectedSeats);
    if (onSeatSelect) {
      onSeatSelect(newSelectedSeats);
    }
  }, [seatsData, selectedSeats, onSeatSelect, maxSelectableSeats]);

  const totalAmount = useMemo(() => {
    return selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  }, [selectedSeats]);

  const renderSeats = () => {
    const seatGrid: (Seat | null)[][] = [];
    if (!seatsData || seatsData.length === 0) return <p>No seat data available.</p>;

    // Determine rows and columns from the seatsData itself
    const rows = Math.max(...seatsData.map(s => s.position.row)) + 1;
    const cols = Math.max(...seatsData.map(s => s.position.col)) + 1;

    for (let i = 0; i < rows; i++) {
      seatGrid.push(new Array(cols).fill(null));
    }

    seatsData.forEach(seat => {
      if (seat.position.row < rows && seat.position.col < cols) {
        seatGrid[seat.position.row][seat.position.col] = seat;
      }
    });

    // Steering wheel logic might need adjustment if 'driver' seat ID or specific position isn't guaranteed.
    // For now, let's assume the first seat in the first row, first col could be a driver or needs special handling if ID is 'driver'.
    const hasDriverSeat = seatsData.some(s => s.id === 'driver' && s.position.row === 0 && s.position.col === 0);


    return (
      <div className="space-y-3 p-2 sm:p-4 bg-gray-200 rounded-lg relative overflow-hidden">
        {/* Steering wheel for front row */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 -translate-y-full text-xs text-gray-500 font-medium">FRONT</div>
        {hasDriverSeat && seatGrid[0] && seatGrid[0][0] && seatGrid[0][0].id === 'driver' && (
            <div className="absolute"
                 style={{ top: 'calc(2rem + 0.375rem)', left: 'calc(1.5rem + 0.375rem)' }} // Approximate position relative to driver seat
            >
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-gray-600 bg-gray-500 transform -rotate-45" title="Steering Wheel"></div>
            </div>
        )}

        {seatGrid.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className={`flex justify-center items-center gap-2 sm:gap-3 ${rowIndex > 0 ? 'mt-3 sm:mt-4' : ''}`}>
            {row.map((seat, colIndex) => (
              <div key={`seat-${rowIndex}-${colIndex}`} className="flex-shrink-0">
                {seat ? (
                  <SeatComponent
                    seat={seat}
                    onClick={() => handleSeatClick(seat.id)}
                    isSelected={selectedSeats.some(s => s.id === seat.id)}
                    isDisabled={seat.status === 'booked' || seat.status === 'reserved'}
                  />
                ) : (
                  <div className="w-10 h-10 sm:w-12 sm:h-12" /> // Spacer for aisles
                )}
              </div>
            ))}
          </div>
        ))}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 font-medium">REAR</div>
      </div>
    );
  };

  const legendItems = [
    { label: 'Available (Standard)', color: 'bg-green-100 border-green-300', type: 'standard' },
    { label: 'Available (Premium)', color: 'bg-indigo-100 border-indigo-300', type: 'premium' },
    { label: 'Available (VIP)', color: 'bg-purple-100 border-purple-300', type: 'vip' },
    { label: 'Available (Accessible)', color: 'bg-yellow-100 border-yellow-300', icon: <Accessibility size={14}/>, type: 'accessible' },
    { label: 'Selected', color: 'bg-blue-500 border-blue-700 text-white', icon: <Check size={14}/> },
    { label: 'Booked/Reserved', color: 'bg-gray-300 border-gray-400 text-gray-500', icon: <X size={14}/> },
    { label: 'Driver', color: 'bg-gray-300 border-gray-400 text-gray-500', icon: <Info size={14}/>, notes: 'Driver Seat' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">{vehicleName} Seat Selection</h2>

      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
        {/* Left Side: Seat Map */}
        <div className="flex-grow lg:w-2/3">
          {renderSeats()}
        </div>

        {/* Right Side: Legend & Summary */}
        <div className="lg:w-1/3 space-y-6">
          {/* Legend */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Seat Legend</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
              {legendItems.map(item => (
                <div key={item.label} className="flex items-center space-x-2">
                  <div className={`w-5 h-5 rounded-sm border ${item.color} flex items-center justify-center`}>
                    {item.icon}
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selection Summary */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Your Selection</h3>
            {selectedSeats.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No seats selected yet.</p>
            ) : (
              <div className="space-y-2 mb-4">
                {selectedSeats.map(seat => (
                  <div key={seat.id} className="flex justify-between items-center text-sm text-gray-700">
                    <span>Seat {seat.number} <span className="text-xs">({seat.type})</span></span>
                    <span className="font-medium">${seat.price.toFixed(2)}</span>
                  </div>
                ))}
                <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between items-center font-bold text-gray-800">
                  <span>Total:</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                if (selectedSeats.length > 0) {
                  showNotification('Booking Confirmed!', { body: `You have booked ${selectedSeats.length} seat(s) for $${totalAmount.toFixed(2)}.` });
                  // Here you would typically proceed to payment or next step
                  // For demo, let's mark selected seats as booked and clear selection
                  const newSeatsData = seatsData.map(s => 
                    selectedSeats.find(ss => ss.id === s.id) ? { ...s, status: 'booked' as Seat['status'] } : s
                  );
                  setSeatsData(newSeatsData);
                  setSelectedSeats([]);
                  if(onSeatSelect) onSeatSelect([]);
                } else {
                  showNotification('No Seats Selected', { body: 'Please select at least one seat to confirm.', type: 'info' });
                }
              }}
              disabled={selectedSeats.length === 0}
              className="w-full mt-4 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-150 ease-in-out disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Check size={20} />
              <span>Confirm Selection ({selectedSeats.length})</span>
            </button>
          </div>
        </div>
      </div>

      {maxSelectableSeats && (
        <p className="text-center text-sm text-gray-500 mt-6">
          <Info size={14} className="inline mr-1" /> You can select a maximum of {maxSelectableSeats} seats.
        </p>
      )}
    </div>
  );
};

export default SeatSelector;
import React, { useState } from 'react';
import { User, Check, X } from 'lucide-react';

export interface Seat {
  id: string;
  number: string;
  row: number;
  position: 'window' | 'aisle' | 'middle';
  isAvailable: boolean;
  isSelected: boolean;
  price?: number;
  type: 'standard' | 'premium' | 'economy';
}

interface SeatSelectorProps {
  vehicleType: 'sedan' | 'van' | 'bus' | 'minibus';
  capacity: number;
  selectedSeats: string[];
  onSeatSelect: (seatId: string) => void;
  maxSeats?: number;
  className?: string;
}

const SeatSelector: React.FC<SeatSelectorProps> = ({
  vehicleType,
  capacity,
  selectedSeats,
  onSeatSelect,
  maxSeats = 1,
  className = ''
}) => {
  const generateSeats = (): Seat[] => {
    const seats: Seat[] = [];
    
    switch (vehicleType) {
      case 'sedan':
        // 2+2 layout for sedan (4 seats)
        for (let row = 1; row <= 2; row++) {
          for (let pos = 1; pos <= 2; pos++) {
            const seatNumber = `${row}${pos === 1 ? 'A' : 'B'}`;
            seats.push({
              id: `seat-${seatNumber}`,
              number: seatNumber,
              row,
              position: pos === 1 ? 'window' : 'window',
              isAvailable: Math.random() > 0.2, // 80% availability
              isSelected: selectedSeats.includes(`seat-${seatNumber}`),
              type: 'standard'
            });
          }
        }
        break;
        
      case 'van':
        // 2+2+2 layout for van (up to 14 seats)
        const vanRows = Math.ceil(capacity / 2);
        for (let row = 1; row <= vanRows; row++) {
          for (let pos = 1; pos <= 2; pos++) {
            const seatNumber = `${row}${pos === 1 ? 'A' : 'B'}`;
            seats.push({
              id: `seat-${seatNumber}`,
              number: seatNumber,
              row,
              position: pos === 1 ? 'window' : 'window',
              isAvailable: Math.random() > 0.15,
              isSelected: selectedSeats.includes(`seat-${seatNumber}`),
              type: row <= 2 ? 'premium' : 'standard'
            });
          }
        }
        break;
        
      case 'bus':
      case 'minibus':
        // 2+2 layout for bus (up to 20+ seats)
        const busRows = Math.ceil(capacity / 4);
        for (let row = 1; row <= busRows; row++) {
          for (let pos = 1; pos <= 4; pos++) {
            const seatLetter = pos === 1 ? 'A' : pos === 2 ? 'B' : pos === 3 ? 'C' : 'D';
            const seatNumber = `${row}${seatLetter}`;
            seats.push({
              id: `seat-${seatNumber}`,
              number: seatNumber,
              row,
              position: pos === 1 || pos === 4 ? 'window' : pos === 2 || pos === 3 ? 'aisle' : 'middle',
              isAvailable: Math.random() > 0.1,
              isSelected: selectedSeats.includes(`seat-${seatNumber}`),
              type: row <= 3 ? 'premium' : 'standard'
            });
          }
        }
        break;
    }
    
    return seats.slice(0, capacity);
  };

  const seats = generateSeats();
  const availableSeats = seats.filter(seat => seat.isAvailable);
  const selectedCount = selectedSeats.length;

  const getSeatIcon = (seat: Seat) => {
    if (!seat.isAvailable) {
      return <X className="h-3 w-3 text-accent" />;
    }
    if (seat.isSelected) {
      return <Check className="h-3 w-3 text-white" />;
    }
    return <User className="h-3 w-3" />;
  };

  const getSeatClasses = (seat: Seat) => {
    const baseClasses = "w-8 h-8 sm:w-10 sm:h-10 rounded-lg border-2 flex items-center justify-center transition-all duration-200 cursor-pointer transform hover:scale-105";
    
    if (!seat.isAvailable) {
      return `${baseClasses} bg-accent/20 border-accent text-accent cursor-not-allowed hover:scale-100`;
    }
    
    if (seat.isSelected) {
      return `${baseClasses} bg-primary border-primary text-black shadow-primary`;
    }
    
    const typeClasses = {
      premium: "border-secondary bg-secondary/10 text-secondary hover:bg-secondary/20",
      standard: "border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light-primary dark:text-text-dark-primary hover:bg-primary/10",
      economy: "border-purple bg-purple/10 text-purple hover:bg-purple/20"
    };
    
    return `${baseClasses} ${typeClasses[seat.type]}`;
  };

  const handleSeatClick = (seat: Seat) => {
    if (!seat.isAvailable) return;
    
    if (seat.isSelected) {
      onSeatSelect(seat.id);
    } else if (selectedCount < maxSeats) {
      onSeatSelect(seat.id);
    }
  };

  const renderSeatLayout = () => {
    const rows = Math.max(...seats.map(seat => seat.row));
    const seatsPerRow = vehicleType === 'sedan' ? 2 : vehicleType === 'van' ? 2 : 4;
    
    return (
      <div className="space-y-2">
        {Array.from({ length: rows }, (_, rowIndex) => {
          const rowNumber = rowIndex + 1;
          const rowSeats = seats.filter(seat => seat.row === rowNumber);
          
          return (
            <div key={rowNumber} className="flex justify-center items-center space-x-1 sm:space-x-2">
              <span className="text-xs text-text-light-tertiary dark:text-text-dark-tertiary w-6 text-center">
                {rowNumber}
              </span>
              <div className={`flex ${seatsPerRow === 4 ? 'space-x-1 sm:space-x-2' : 'space-x-2 sm:space-x-4'}`}>
                {rowSeats.map((seat, index) => (
                  <React.Fragment key={seat.id}>
                    <button
                      onClick={() => handleSeatClick(seat)}
                      className={getSeatClasses(seat)}
                      disabled={!seat.isAvailable}
                      title={`Seat ${seat.number} - ${seat.type} (${seat.position})`}
                    >
                      {getSeatIcon(seat)}
                    </button>
                    {/* Add aisle space for bus layout */}
                    {seatsPerRow === 4 && index === 1 && (
                      <div className="w-4 sm:w-6" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`p-4 sm:p-6 ${className}`}>
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-text-light-primary dark:text-text-dark-primary mb-2">
          Select Your Seat
        </h3>
        <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
          {availableSeats.length} of {capacity} seats available
        </p>
      </div>

      {/* Vehicle Front Indicator */}
      <div className="text-center mb-4">
        <div className="inline-block bg-border-light dark:bg-border-dark rounded-full px-4 py-1">
          <span className="text-xs text-text-light-tertiary dark:text-text-dark-tertiary">FRONT</span>
        </div>
      </div>

      {/* Seat Layout */}
      <div className="mb-6">
        {renderSeatLayout()}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded flex items-center justify-center">
            <User className="h-2 w-2" />
          </div>
          <span className="text-text-light-secondary dark:text-text-dark-secondary">Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-primary border border-primary rounded flex items-center justify-center">
            <Check className="h-2 w-2 text-black" />
          </div>
          <span className="text-text-light-secondary dark:text-text-dark-secondary">Selected</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-accent/20 border border-accent rounded flex items-center justify-center">
            <X className="h-2 w-2 text-accent" />
          </div>
          <span className="text-text-light-secondary dark:text-text-dark-secondary">Occupied</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-secondary/10 border border-secondary rounded flex items-center justify-center">
            <User className="h-2 w-2 text-secondary" />
          </div>
          <span className="text-text-light-secondary dark:text-text-dark-secondary">Premium</span>
        </div>
      </div>

      {/* Selection Summary */}
      {selectedCount > 0 && (
        <div className="mt-4 p-3 bg-primary/10 dark:bg-primary/20 rounded-lg">
          <p className="text-sm font-medium text-text-light-primary dark:text-text-dark-primary">
            Selected: {selectedSeats.map(id => {
              const seat = seats.find(s => s.id === id);
              return seat?.number;
            }).join(', ')}
          </p>
          <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary">
            {maxSeats - selectedCount} more seat{maxSeats - selectedCount !== 1 ? 's' : ''} can be selected
          </p>
        </div>
      )}
    </div>
  );
};

export default SeatSelector;

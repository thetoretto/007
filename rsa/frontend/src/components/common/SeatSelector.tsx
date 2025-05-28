import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { X, Check, User } from 'lucide-react';
import { showNotification } from '../../utils/notifications';
import { motion } from 'framer-motion';

interface Seat {
  id: string;
  number: string;
  price: number;
  type: 'standard' | 'premium' | 'vip' | 'accessible';
  status: 'available' | 'selected' | 'booked' | 'reserved';
  position: {
    row: number; // 0: front, 1: middle, 2: back
    col: number; // Index within the row
    aisle?: boolean;
  };
  notes?: string;
}

interface SeatSelectorProps {
  initialSeats: Seat[];
  initialSelectedSeats?: Seat[];
  onSeatSelect?: (seats: Seat[]) => void;
  maxSelectableSeats?: number;
  vehicleName?: string;
}

const SeatSelector: React.FC<SeatSelectorProps> = ({ 
  initialSeats, 
  initialSelectedSeats = [], 
  onSeatSelect, 
  maxSelectableSeats = 1, 
  vehicleName = 'Vehicle' 
}) => {
  const [seatsData, setSeatsData] = useState<Seat[]>(initialSeats);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>(initialSelectedSeats);
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);

  // Update seatsData if initialSeats prop changes
  useEffect(() => {
    setSeatsData(initialSeats);
  }, [initialSeats]);

  // Update selectedSeats if initialSelectedSeats prop changes
  useEffect(() => {
    setSelectedSeats(initialSelectedSeats);
  }, [initialSelectedSeats]);

  // Handle seat selection
  const handleSeatClick = useCallback((seatId: string) => {
    const clickedSeat = seatsData.find(s => s.id === seatId);
    if (!clickedSeat || clickedSeat.status === 'booked' || clickedSeat.status === 'reserved') return;

    const isCurrentlySelected = selectedSeats.some(s => s.id === seatId);

    let newSelectedSeats;
    if (isCurrentlySelected) {
      newSelectedSeats = selectedSeats.filter(s => s.id !== seatId);
      showNotification('Seat Deselected', { 
        body: `Seat ${clickedSeat.number} removed from your selection.` 
      });
    } else {
      if (maxSelectableSeats && selectedSeats.length >= maxSelectableSeats) {
        if (maxSelectableSeats === 1) {
          newSelectedSeats = [clickedSeat];
          showNotification('Seat Changed', { 
            body: `Your seat selection has been updated to Seat ${clickedSeat.number}.` 
          });
        } else {
          showNotification('Selection Limit Reached', { 
            body: `You can select a maximum of ${maxSelectableSeats} seats.`
          });
        return;
        }
      } else {
        newSelectedSeats = [...selectedSeats, clickedSeat];
        showNotification('Seat Selected', { 
          body: `Seat ${clickedSeat.number} (${clickedSeat.type}) added for $${clickedSeat.price.toFixed(2)}` 
        });
      }
    }
    
    setSelectedSeats(newSelectedSeats);
    if (onSeatSelect) {
      onSeatSelect(newSelectedSeats);
    }
  }, [seatsData, selectedSeats, onSeatSelect, maxSelectableSeats]);

  // Calculate total price
  const totalAmount = useMemo(() => {
    return selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  }, [selectedSeats]);

  // Organize seats into a grid for rendering
  const seatGrid = useMemo(() => {
    const grid: (Seat | null)[][] = [];
    if (!seatsData || seatsData.length === 0) return grid;

    // Find dimensions
    const rows = Math.max(...seatsData.map(s => s.position.row)) + 1;
    const cols = Math.max(...seatsData.map(s => s.position.col)) + 1;

    // Initialize grid with nulls
    for (let i = 0; i < rows; i++) {
      grid.push(Array(cols).fill(null));
    }

    // Place seats in grid
    seatsData.forEach(seat => {
      if (seat.position.row < rows && seat.position.col < cols) {
        grid[seat.position.row][seat.position.col] = seat;
      }
    });

    return grid;
  }, [seatsData]);

  // Get seat color based on type and status
  const getSeatStyles = (seat: Seat, isSelected: boolean, isHovered: boolean) => {
    // Default styles
    let bgColor = 'bg-gray-100';
    let borderColor = 'border-gray-300';
    let textColor = 'text-gray-800';
    
    if (seat.status === 'reserved') {
      bgColor = 'bg-gray-300';
      borderColor = 'border-gray-400';
      textColor = 'text-gray-500';
      return { bgColor, borderColor, textColor };
    }

    if (seat.status === 'booked') {
      bgColor = 'bg-gray-200';
      borderColor = 'border-gray-300';
      textColor = 'text-gray-500';
      return { bgColor, borderColor, textColor };
    }

    if (isSelected) {
      bgColor = 'bg-accent-kente-gold';
      borderColor = 'border-yellow-600';
      textColor = 'text-white';
      return { bgColor, borderColor, textColor };
    }

    switch (seat.type) {
      case 'premium':
        bgColor = isHovered ? 'bg-blue-200' : 'bg-blue-100';
        borderColor = 'border-blue-300';
        textColor = 'text-blue-800';
        break;
      case 'vip':
        bgColor = isHovered ? 'bg-purple-200' : 'bg-purple-100';
        borderColor = 'border-purple-300';
        textColor = 'text-purple-800';
        break;
      case 'accessible':
        bgColor = isHovered ? 'bg-yellow-200' : 'bg-yellow-100';
        borderColor = 'border-yellow-300';
        textColor = 'text-yellow-800';
        break;
      default:
        bgColor = isHovered ? 'bg-green-200' : 'bg-green-100';
        borderColor = 'border-green-300';
        textColor = 'text-green-800';
    }

    return { bgColor, borderColor, textColor };
  };

  // Render a single seat
  const renderSeat = (seat: Seat | null, rowIndex: number, colIndex: number) => {
    if (!seat) return <div key={`empty-${rowIndex}-${colIndex}`} className="w-9 h-8" />;

    const isSelected = selectedSeats.some(s => s.id === seat.id);
    const isDisabled = seat.status === 'booked' || seat.status === 'reserved';
    const isHovered = hoveredSeat === seat.id;
    
    const { bgColor, borderColor, textColor } = getSeatStyles(seat, isSelected, isHovered);

    return (
      <motion.div
        key={`seat-${rowIndex}-${colIndex}`}
        className={`
          flex items-center justify-center
          w-9 h-8 m-0.5
          ${bgColor} ${textColor}
          border ${borderColor}
          rounded-sm
          select-none
          transition-colors duration-150
          ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
          ${isSelected ? 'shadow-sm' : ''}
        `}
        whileHover={!isDisabled ? { scale: 1.05 } : {}}
        whileTap={!isDisabled ? { scale: 0.95 } : {}}
        onClick={() => !isDisabled && handleSeatClick(seat.id)}
        onMouseEnter={() => setHoveredSeat(seat.id)}
        onMouseLeave={() => setHoveredSeat(null)}
        title={`${seat.number} - ${seat.type} - $${seat.price.toFixed(2)}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {/* Seat number */}
        <div className="font-medium text-sm">
          {seat.number}
        </div>
        
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="text-white" size={8} />
            </div>
        )}

        {/* Price tooltip on hover */}
        {isHovered && !isDisabled && (
          <motion.div
            className="absolute -top-6 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded z-10"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ${seat.price}
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Heading with minimalist design */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2 mb-3">
        <h3 className="text-sm font-medium">{vehicleName} Seating</h3>
        <span className="text-xs text-gray-500">
          {selectedSeats.length}/{maxSelectableSeats} selected
        </span>
      </div>
      
      {/* Enhanced seat grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-3">
          {/* Vehicle outline with minimal design */}
          <div className="relative pb-2 pt-4">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-gray-200 dark:bg-gray-700 text-xs px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-300">
              FRONT
        </div>

            {/* Seat map with improved grid */}
            <div className="flex flex-col items-center">
              {seatGrid.map((row, rowIndex) => (
                <div key={`row-${rowIndex}`} className="flex my-0.5">
                  {row.map((seat, colIndex) => renderSeat(seat, rowIndex, colIndex))}
                </div>
              ))}
            </div>
            
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-gray-200 dark:bg-gray-700 text-xs px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-300">
              REAR
            </div>
          </div>
        </div>
      </div>
      
      {/* Selected seats summary with clean design */}
      {selectedSeats.length > 0 && (
        <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium">Selected Seats</span>
            <span className="text-accent-kente-gold font-medium">${totalAmount.toFixed(2)}</span>
          </div>

          <div className="space-y-1.5">
            {selectedSeats.map((seat) => (
              <div key={seat.id} className="flex justify-between items-center text-sm px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="flex items-center">
                  <div className={`
                    w-5 h-5 flex items-center justify-center rounded mr-2 text-xs font-medium
                    ${seat.type === 'premium' ? 'bg-blue-100 text-blue-800' : 
                      seat.type === 'vip' ? 'bg-purple-100 text-purple-800' : 
                      seat.type === 'accessible' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'}
                  `}>
                    {seat.number}
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">${seat.price.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => handleSeatClick(seat.id)}
                  className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Legend with minimal design */}
      <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 pt-2">
        <div className="flex items-center">
          <div className="w-2.5 h-2.5 bg-green-100 border border-green-300 rounded-sm mr-1"></div>
          <span>Standard</span>
        </div>
        <div className="flex items-center">
          <div className="w-2.5 h-2.5 bg-blue-100 border border-blue-300 rounded-sm mr-1"></div>
          <span>Premium</span>
        </div>
        <div className="flex items-center">
          <div className="w-2.5 h-2.5 bg-purple-100 border border-purple-300 rounded-sm mr-1"></div>
          <span>VIP</span>
        </div>
        <div className="flex items-center">
          <div className="w-2.5 h-2.5 bg-yellow-100 border border-yellow-300 rounded-sm mr-1"></div>
          <span>Accessible</span>
        </div>
      </div>
    </div>
  );
};

export default SeatSelector;
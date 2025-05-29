import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { X, Check, User, Info } from 'lucide-react';
import { showNotification } from '../../utils/notifications';
import { motion, AnimatePresence } from 'framer-motion';

export interface Seat {
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

export interface SeatSelectorProps {
  initialSeats: Seat[];
  initialSelectedSeats?: Seat[];
  onSeatSelect?: (seats: Seat[]) => void;
  maxSelectableSeats?: number;
  vehicleName?: string;
  compact?: boolean;
  hideHeader?: boolean;
  hideLegend?: boolean;
  hideSummary?: boolean;
  customColors?: {
    standard?: string;
    premium?: string;
    vip?: string;
    accessible?: string;
    selected?: string;
    indicator?: string;
  };
  className?: string;
}

const SeatSelector: React.FC<SeatSelectorProps> = ({ 
  initialSeats, 
  initialSelectedSeats = [], 
  onSeatSelect, 
  maxSelectableSeats = 1, 
  vehicleName = 'Vehicle',
  compact = false,
  hideHeader = false,
  hideLegend = false,
  hideSummary = false,
  customColors,
  className = ''
}) => {
  const [seatsData, setSeatsData] = useState<Seat[]>(initialSeats);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>(initialSelectedSeats);
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);

  // Define default colors that can be overridden with customColors
  const colors = useMemo(() => {
    const defaultColorsDeep = {
      standard: { bg: 'bg-green-100', hover: 'bg-green-200', border: 'border-green-300', text: 'text-green-800' },
      premium: { bg: 'bg-blue-100', hover: 'bg-blue-200', border: 'border-blue-300', text: 'text-blue-800' },
      vip: { bg: 'bg-purple-100', hover: 'bg-purple-200', border: 'border-purple-300', text: 'text-purple-800' },
      accessible: { bg: 'bg-yellow-100', hover: 'bg-yellow-200', border: 'border-yellow-300', text: 'text-yellow-800' },
      selected: { bg: 'bg-accent-kente-gold', hover: 'bg-accent-kente-gold', border: 'border-yellow-600', text: 'text-white' },
      indicator: 'bg-green-500',
    };

    if (!customColors) {
      return defaultColorsDeep;
    }

    const newColors = { ...defaultColorsDeep };

    if (customColors.standard && typeof customColors.standard === 'string') {
      newColors.standard = { ...defaultColorsDeep.standard, bg: customColors.standard, hover: customColors.standard };
    } else if (customColors.standard) { // Assume it's an object if not a string, though type says string
      newColors.standard = { ...defaultColorsDeep.standard, ...(customColors.standard as any) };
    }

    if (customColors.premium && typeof customColors.premium === 'string') {
      newColors.premium = { ...defaultColorsDeep.premium, bg: customColors.premium, hover: customColors.premium };
    } else if (customColors.premium) {
      newColors.premium = { ...defaultColorsDeep.premium, ...(customColors.premium as any) };
    }

    if (customColors.vip && typeof customColors.vip === 'string') {
      newColors.vip = { ...defaultColorsDeep.vip, bg: customColors.vip, hover: customColors.vip };
    } else if (customColors.vip) {
      newColors.vip = { ...defaultColorsDeep.vip, ...(customColors.vip as any) };
    }

    if (customColors.accessible && typeof customColors.accessible === 'string') {
      newColors.accessible = { ...defaultColorsDeep.accessible, bg: customColors.accessible, hover: customColors.accessible };
    } else if (customColors.accessible) {
      newColors.accessible = { ...defaultColorsDeep.accessible, ...(customColors.accessible as any) };
    }
    
    if (customColors.selected && typeof customColors.selected === 'string') {
      newColors.selected = { ...defaultColorsDeep.selected, bg: customColors.selected, hover: customColors.selected };
    } else if (customColors.selected) {
      newColors.selected = { ...defaultColorsDeep.selected, ...(customColors.selected as any) };
    }

    if (customColors.indicator) {
      newColors.indicator = customColors.indicator;
    }

    return newColors;
  }, [customColors]);

  // Update seatsData if initialSeats prop changes
  useEffect(() => {
    // Only update if the actual data has changed, not just the reference
    if (JSON.stringify(initialSeats) !== JSON.stringify(seatsData)) {
      setSeatsData(initialSeats);
    }
  }, [initialSeats, seatsData]); // Added seatsData to dependency to avoid stale closure

  // Update selectedSeats if initialSelectedSeats prop changes
  useEffect(() => {
    // Only update if the actual data has changed
    if (JSON.stringify(initialSelectedSeats) !== JSON.stringify(selectedSeats)) {
      setSelectedSeats(initialSelectedSeats);
    }
  }, [initialSelectedSeats, selectedSeats]); // Added selectedSeats to dependency

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
    let bgColor = colors.standard.bg;
    let borderColor = colors.standard.border;
    let textColor = colors.standard.text;
    
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
      bgColor = colors.selected.bg;
      borderColor = colors.selected.border;
      textColor = colors.selected.text;
      return { bgColor, borderColor, textColor };
    }

    switch (seat.type) {
      case 'premium':
        bgColor = isHovered ? colors.premium.hover : colors.premium.bg;
        borderColor = colors.premium.border;
        textColor = colors.premium.text;
        break;
      case 'vip':
        bgColor = isHovered ? colors.vip.hover : colors.vip.bg;
        borderColor = colors.vip.border;
        textColor = colors.vip.text;
        break;
      case 'accessible':
        bgColor = isHovered ? colors.accessible.hover : colors.accessible.bg;
        borderColor = colors.accessible.border;
        textColor = colors.accessible.text;
        break;
      default:
        bgColor = isHovered ? colors.standard.hover : colors.standard.bg;
        borderColor = colors.standard.border;
        textColor = colors.standard.text;
    }

    return { bgColor, borderColor, textColor };
  };

  // Render a single seat
  const renderSeat = (seat: Seat | null, rowIndex: number, colIndex: number) => {
    if (!seat) return <div key={`empty-${rowIndex}-${colIndex}`} className="w-5 h-4 sm:w-6 sm:h-5 md:w-7 md:h-6" />;

    const isSelected = selectedSeats.some(s => s.id === seat.id);
    const isDisabled = seat.status === 'booked' || seat.status === 'reserved';
    const isHovered = hoveredSeat === seat.id;
    
    const { bgColor, borderColor, textColor } = getSeatStyles(seat, isSelected, isHovered);

    return (
      <motion.div
        key={`seat-${rowIndex}-${colIndex}`}
        className={`
          relative flex items-center justify-center
          w-5 h-4 m-0.5 sm:w-6 sm:h-5 md:w-7 md:h-6
          ${bgColor} ${textColor}
          border ${borderColor}
          rounded-md
          select-none
          transition-all duration-150
          ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
          ${isSelected ? 'shadow-md ring-2 ring-accent-kente-gold' : ''}
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
        <div className="font-medium text-xs">
          {seat.number}
        </div>
        
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 rounded-full flex items-center justify-center shadow-sm"
               style={{ backgroundColor: typeof colors.indicator === 'string' ? colors.indicator : 'rgb(34, 197, 94)' }}>
            <Check className="text-white" size={8} />
          </div>
        )}

        {/* Price tooltip on hover */}
        {isHovered && !isDisabled && (
          <motion.div
            className="absolute -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded-md z-10 shadow-md"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="font-bold">${seat.price.toFixed(2)}</div>
            <div className="text-xs text-gray-300">{seat.type}</div>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
          </motion.div>
        )}
      </motion.div>
    );
  };

  // Empty state
  if (seatsData.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center ${className}`}>
        <User className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-gray-500 dark:text-gray-400">No seat data available</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Please try again later</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Heading with minimalist design - optional */}
      {!hideHeader && (
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2 mb-3">
          <h3 className="text-sm font-medium">{vehicleName} Seating</h3>
          <span className="text-xs text-gray-500">
            {selectedSeats.length}/{maxSelectableSeats} selected
          </span>
        </div>
      )}
      
      {/* Enhanced seat grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-2 sm:p-3">
          {/* Vehicle outline with minimal design */}
          <div className="relative pb-2 pt-4">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-gray-200 dark:bg-gray-700 text-xs px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-300">
              FRONT
            </div>

            {/* Seat map with improved grid - add horizontal scrolling for small screens */}
            <div className="flex flex-col items-center overflow-x-auto touch-action-manipulation pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <style>
                {`
                .touch-action-manipulation { touch-action: manipulation; }
                .overflow-x-auto::-webkit-scrollbar { display: none; }
                `}
              </style>
              {seatGrid.map((row, rowIndex) => (
                <div key={`row-${rowIndex}`} className="flex my-0.5 min-w-max">
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
      
      {/* Selected seats summary with clean design - optional */}
      {!hideSummary && selectedSeats.length > 0 && (
        <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium">Selected Seats</span>
            <span className="text-accent-kente-gold font-medium">${totalAmount.toFixed(2)}</span>
          </div>

          <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
            {selectedSeats.map((seat) => (
              <div key={seat.id} className="flex justify-between items-center text-sm px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="flex items-center">
                  <div className={`
                    w-5 h-5 flex items-center justify-center rounded mr-2 text-xs font-medium
                    ${seat.type === 'premium' ? `${colors.premium.bg} ${colors.premium.text}` : 
                      seat.type === 'vip' ? `${colors.vip.bg} ${colors.vip.text}` : 
                      seat.type === 'accessible' ? `${colors.accessible.bg} ${colors.accessible.text}` : 
                      `${colors.standard.bg} ${colors.standard.text}`}
                  `}>
                    {seat.number}
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">${seat.price.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => handleSeatClick(seat.id)}
                  className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label={`Remove seat ${seat.number}`}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Legend with minimal design - optional */}
      {!hideLegend && (
        <div className="flex flex-wrap justify-center gap-x-2 sm:gap-x-3 gap-y-1 text-xs text-gray-500 pt-2">
          <div className="flex items-center px-1.5 py-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 ${colors.standard.bg} ${colors.standard.border} rounded-sm mr-1`}></div>
            <span>Standard</span>
          </div>
          <div className="flex items-center px-1.5 py-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 ${colors.premium.bg} ${colors.premium.border} rounded-sm mr-1`}></div>
            <span>Premium</span>
          </div>
          <div className="flex items-center px-1.5 py-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 ${colors.vip.bg} ${colors.vip.border} rounded-sm mr-1`}></div>
            <span>VIP</span>
          </div>
          <div className="flex items-center px-1.5 py-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 ${colors.accessible.bg} ${colors.accessible.border} rounded-sm mr-1`}></div>
            <span>Accessible</span>
          </div>
          <div className="flex items-center px-1.5 py-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gray-300 border border-gray-400 rounded-sm mr-1`}></div>
            <span>Unavailable</span>
          </div>
        </div>
      )}

      {/* Optional help text */}
      {selectedSeats.length === 0 && !hideSummary && !compact && (
        <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 gap-1">
          <Info size={12} />
          <span>
            {maxSelectableSeats > 1 
              ? `Select up to ${maxSelectableSeats} seats` 
              : 'Select a seat'}
          </span>
      </div>
      )}
    </div>
  );
};

export default SeatSelector;
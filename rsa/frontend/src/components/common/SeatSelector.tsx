import React, { useState, useRef, useEffect } from 'react';
import { Check, ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { showNotification } from '../../utils/notifications';

interface Seat {
  id: string;
  number: string;
  price: number;
  type: 'standard' | 'premium' | 'vip' | 'accessible';
  status: 'available' | 'selected' | 'booked' | 'reserved';
  position: {
    row: number;
    col: number;
  };
}

interface SeatSelectorProps {
  onSeatSelect?: (seats: Seat[]) => void;
}

const SeatSelector: React.FC<SeatSelectorProps> = ({ onSeatSelect }) => {
  // Generate seats for a Toyota Avensis Verso (7-seater MPV)
  const generateSeats = (): Seat[] => {
    const seats: Seat[] = [];
    
    // Front row - 2 seats (driver & passenger)
    seats.push({
      id: 'driver',
      number: 'Driver',
      price: 0,
      type: 'standard',
      status: 'reserved',
      position: { row: 0, col: 0 }
    });
    
    seats.push({
      id: 'front-passenger',
      number: '1',
      price: 29.99,
      type: 'premium',
      status: 'available',
      position: { row: 0, col: 2 }
    });
    
    // Middle row - 3 seats
    for (let col = 0; col < 3; col++) {
      const seatNumber = (col + 2).toString();
      seats.push({
        id: `middle-${col}`,
        number: seatNumber,
        price: 25.99,
        type: 'standard',
        status: Math.random() > 0.7 ? 'booked' : 'available',
        position: { row: 1, col: col }
      });
    }
    
    // Back row - 2 seats
    for (let col = 0; col < 2; col++) {
      const seatNumber = (col + 5).toString();
      const seatType = col === 1 ? 'accessible' : 'vip';
      const price = seatType === 'vip' ? 32.99 : 25.99;
      
      seats.push({
        id: `back-${col}`,
        number: seatNumber,
        price,
        type: seatType,
        status: 'available',
        position: { row: 2, col: col === 0 ? 0 : 2 }
      });
    }
    
    return seats;
  };
  
  const [seats, setSeats] = useState<Seat[]>(generateSeats());
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Adjust scaling based on container width
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        // Base design is for 500px width, scale accordingly
        const newScale = Math.min(1, containerWidth / 500);
        setScale(newScale);
      }
    };
    
    handleResize(); // Initial calculation
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleSeatClick = (seatId: string) => {
    const newSeats = [...seats];
    const seatIndex = newSeats.findIndex(s => s.id === seatId);
    
    if (seatIndex === -1 || newSeats[seatIndex].status === 'booked' || newSeats[seatIndex].status === 'reserved') {
      return;
    }
    
    const newStatus = newSeats[seatIndex].status === 'available' ? 'selected' : 'available';
    newSeats[seatIndex] = { ...newSeats[seatIndex], status: newStatus };
    
    setSeats(newSeats);
    
    // Update selected seats
    const updatedSelectedSeats = newSeats.filter(s => s.status === 'selected');
    setSelectedSeats(updatedSelectedSeats);
    
    if (onSeatSelect) {
      onSeatSelect(updatedSelectedSeats);
    }
    
    // Show notification
    const seat = newSeats[seatIndex];
    if (newStatus === 'selected') {
      showNotification(
        'Seat Selected',
        { body: `Seat ${seat.number} (${seat.type}) added for $${seat.price.toFixed(2)}` }
      );
    } else {
      showNotification(
        'Seat Removed',
        { body: `Seat ${seat.number} has been removed from selection` }
      );
    }
  };
  
  const getSeatColor = (seat: Seat) => {
    if (seat.status === 'booked' || seat.status === 'reserved') {
      return 'bg-gray-300 text-gray-500 cursor-not-allowed';
    }
    
    if (seat.status === 'selected') {
      return 'bg-blue-500 text-white border-blue-700';
    }
    
    switch (seat.type) {
      case 'standard':
        return 'bg-green-100 hover:bg-green-200 border-green-300';
      case 'premium':
        return 'bg-blue-100 hover:bg-blue-200 border-blue-300';
      case 'vip':
        return 'bg-purple-100 hover:bg-purple-200 border-purple-300';
      case 'accessible':
        return 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300';
      default:
        return 'bg-gray-100 hover:bg-gray-200 border-gray-300';
    }
  };
  
  const getSeatIcon = (seat: Seat) => {
    if (seat.status === 'selected') {
      return <Check className="h-4 w-4 absolute top-1 right-1" />;
    }
    
    if (seat.type === 'accessible') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute top-1 right-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="5" />
          <path d="M20 21v-2a5 5 0 0 0-10 0v2" />
          <line x1="8" y1="21" x2="8" y2="13" />
          <line x1="16" y1="21" x2="16" y2="13" />
        </svg>
      );
    }
    
    return null;
  };
  
  const calculateTotal = () => {
    return selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-xl font-semibold mb-4 sm:mb-6">Toyota Avensis Verso Seat Selection</h2>
      
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        <div className="flex-1" ref={containerRef}>
          {/* Car outline - responsively sized container */}
          <div className="relative mx-auto bg-gray-100 rounded-lg p-4 overflow-hidden" style={{ 
            width: '100%', 
            maxWidth: '450px',
            height: `${400 * scale}px`, 
            minHeight: '300px'
          }}>
            {/* Car body shape */}
            <div className="absolute inset-x-12 top-0 bottom-0 bg-white rounded-t-[120px] rounded-b-lg border-2 border-gray-400"></div>
            
            {/* Steering wheel */}
            <div className="absolute top-12 left-16 w-10 h-10 rounded-full border-4 border-gray-500 flex items-center justify-center" style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
              <div className="w-6 h-6 rounded-full bg-gray-500"></div>
            </div>
            
            {/* Dashboard */}
            <div className="absolute top-20 left-8 right-8 h-2 bg-gray-400 rounded"></div>
            
            {/* Windows */}
            <div className="absolute top-0 left-24 right-24 h-1 bg-blue-200 rounded opacity-50"></div>
            <div className="absolute top-0 bottom-0 left-8 w-1 bg-blue-200 rounded opacity-50"></div>
            <div className="absolute top-0 bottom-0 right-8 w-1 bg-blue-200 rounded opacity-50"></div>
            
            {/* Seats */}
            <div className="relative h-full">
              {seats.map(seat => {
                // Determine position based on row/col
                let top, left;
                
                if (seat.position.row === 0) { // Front row
                  top = '60px';
                  left = seat.position.col === 0 ? '70px' : '280px';
                } else if (seat.position.row === 1) { // Middle row
                  top = '160px';
                  left = seat.position.col === 0 ? '70px' : 
                        seat.position.col === 1 ? '175px' : '280px';
                } else { // Back row
                  top = '260px';
                  left = seat.position.col === 0 ? '105px' : '245px';
                }
                
                // Apply scaling to seat position
                const scaledStyle = {
                  top: `calc(${top} * ${scale})`,
                  left: `calc(${left} * ${scale})`,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left'
                };
                
                return (
                  <div
                    key={seat.id}
                    style={scaledStyle}
                    className={`absolute w-20 h-16 border-2 rounded-t-lg ${getSeatColor(seat)}`}
                    onClick={() => handleSeatClick(seat.id)}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-sm font-medium">{seat.number}</span>
                      
                      {/* Price tag */}
                      {seat.price > 0 && (
                        <span className="text-xs">
                          ${seat.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    
                    {/* Seat status icons */}
                    {getSeatIcon(seat)}
                    
                    {/* Headrest */}
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-10 h-2 bg-gray-300 rounded"></div>
                    
                    {/* Seat shape - backrest */}
                    <div className="absolute bottom-0 left-0 right-0 h-3 bg-gray-200 border-t border-gray-300"></div>
                  </div>
                );
              })}
            </div>
            
            {/* Car outline indicators */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-gray-500 text-sm font-medium">
              REAR
            </div>
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-gray-500 text-sm font-medium">
              FRONT
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-64 mt-4 lg:mt-0">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium mb-4">Seat Legend</h3>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded bg-green-100 border border-green-300 mr-2"></div>
                <span>Standard ($25.99)</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded bg-blue-100 border border-blue-300 mr-2"></div>
                <span>Premium ($29.99)</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded bg-purple-100 border border-purple-300 mr-2"></div>
                <span>VIP ($32.99)</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded bg-yellow-100 border border-yellow-300 mr-2"></div>
                <span>Wheelchair Accessible</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded bg-gray-300 border border-gray-400 mr-2"></div>
                <span>Unavailable</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded bg-blue-500 border border-blue-700 mr-2"></div>
                <span className="text-black">Selected</span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="font-medium mb-2">Your Selection</h3>
              
              {selectedSeats.length === 0 ? (
                <p className="text-gray-500 text-sm">No seats selected</p>
              ) : (
                <div>
                  <div className="mb-2 space-y-1">
                    {selectedSeats.map(seat => (
                      <div key={seat.id} className="flex justify-between text-sm">
                        <span>Seat {seat.number} ({seat.type})</span>
                        <span>${seat.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between font-medium pt-2 border-t border-gray-200">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                  
                  <button
                    className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded font-medium hover:bg-blue-600"
                    onClick={() => {
                      if (selectedSeats.length > 0) {
                        showNotification(
                          'Booking Confirmed!',
                          { body: `You have booked ${selectedSeats.length} seats for a total of $${calculateTotal().toFixed(2)}` }
                        );
                      }
                    }}
                  >
                    Confirm Selection
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelector; 
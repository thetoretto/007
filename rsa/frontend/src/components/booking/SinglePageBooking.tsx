import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, ChevronDown, Search, X, Clock, User, CreditCard, Check, Car, Shield } from 'lucide-react';
import SeatSelector from '../common/SeatSelector';
import PaymentForm from '../common/PaymentForm';
import type { PaymentMethod as FormPaymentMethod } from '../common/PaymentForm';
import { useBookingStore } from '../../store/bookingStore';
import useTripStore, { Trip } from '../../store/tripStore';
import useHotPointStore, { HotPoint as BaseHotPoint } from '../../store/hotPointStore';
import { mockRoutes, mockVehicles } from '../../utils/mockData';

interface Seat {
  id: string;
  number: string;
  price: number;
  type: 'standard' | 'premium' | 'vip' | 'accessible';
  status: 'available' | 'selected' | 'booked' | 'reserved';
  position: {
    row: number;
    col: number;
    aisle?: boolean;
  };
  notes?: string;
}

interface ExtendedHotPoint extends BaseHotPoint {
  fee: number;
}

interface TicketHolder {
  seatId: string;
  name: string;
}

interface SinglePageBookingProps {
  onBookingComplete?: (bookingDetails: any) => void;
  className?: string;
}

const SinglePageBooking: React.FC<SinglePageBookingProps> = ({ 
  onBookingComplete,
  className = ''
}) => {
  // State management
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [selectedHotpoint, setSelectedHotpoint] = useState<ExtendedHotPoint | null>(null);
  const [isHotpointNeeded, setIsHotpointNeeded] = useState(false);
  const [availableTrips, setAvailableTrips] = useState<Trip[]>([]);
  const [availableSeats, setAvailableSeats] = useState<Seat[]>([]);
  const [isOriginDropdownOpen, setIsOriginDropdownOpen] = useState(false);
  const [isDestinationDropdownOpen, setIsDestinationDropdownOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<FormPaymentMethod>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Store hooks
  const { getAvailableTripsForBooking } = useBookingStore();
  const tripStore = useTripStore();
  const { hotPoints: baseHotPoints, fetchHotPoints } = useHotPointStore();
  const [hotPoints, setHotPoints] = useState<ExtendedHotPoint[]>([]);

  // Mock data
  const availableDestinations = useMemo(() => {
    const destinations = mockRoutes.map(route => route.destination.name);
    return [...new Set(destinations)];
  }, []);

  const availableOrigins = useMemo(() => {
    const origins = mockRoutes.map(route => route.origin.name);
    return [...new Set(origins)];
  }, []);

  const popularOrigins = availableOrigins.slice(0, 4);
  const popularDestinations = availableDestinations.slice(0, 4);

  // Effects
  useEffect(() => {
    const extendedHotPoints = baseHotPoints.map(hp => ({
      ...hp,
      fee: 5.00
    }));
    setHotPoints(extendedHotPoints);
  }, [baseHotPoints]);

  useEffect(() => {
    tripStore.fetchTrips();
    fetchHotPoints();
  }, []);

  // Handlers
  const searchTrips = () => {
    if (origin && destination) {
      const trips = getAvailableTripsForBooking({
        originName: origin,
        destinationName: destination
      });
      
      let tripsToUse = trips;
      if (trips.length === 0) {
        const matchedRoute = mockRoutes.find(route =>
          route.origin.name.toLowerCase() === origin.toLowerCase() &&
          route.destination.name.toLowerCase() === destination.toLowerCase()
        );
        if (matchedRoute) {
          const vehicle = mockVehicles[0];
          tripsToUse = Array(3).fill(0).map((_, idx) => {
            const hours = 8 + idx * 2;
            const time = `${hours.toString().padStart(2, '0')}:00`;
            return {
              id: `generated-trip-${idx}`,
              driverId: '3',
              date: new Date().toISOString().split('T')[0],
              time,
              fromLocation: matchedRoute.origin.name,
              toLocation: matchedRoute.destination.name,
              routeId: matchedRoute.id,
              vehicleId: vehicle.id,
              status: 'scheduled' as any,
              availableSeats: 15 - idx * 3,
              price: 25 + idx * 2.5,
              vehicle,
              route: matchedRoute
            };
          });
        }
      }
      setAvailableTrips(tripsToUse);
    }
  };

  const selectTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    if (trip.vehicle && trip.vehicle.capacity) {
      const seats: Seat[] = [];
      const seatsPerRow = 4;
      const numRows = Math.ceil(trip.vehicle.capacity / seatsPerRow);
      
      for (let i = 0; i < trip.vehicle.capacity; i++) {
        const row = Math.floor(i / seatsPerRow);
        let col = i % seatsPerRow;
        if (col >= 2) col += 1;
        
        let seatType: 'standard' | 'premium' | 'vip' | 'accessible' = 'standard';
        if (row === 1) seatType = 'premium';
        else if (row === numRows - 1 && (col === 0 || col === seatsPerRow + 1)) seatType = 'accessible';
        else if (row > 1 && row < numRows - 1 && i % 7 === 0) seatType = 'vip';
        
        seats.push({
          id: `${trip.vehicle.id}-s${i + 1}`,
          number: `${i + 1}`,
          price: (trip.price || 10) * (seatType === 'standard' ? 1 : seatType === 'premium' ? 1.25 : seatType === 'vip' ? 1.5 : 0.9),
          type: seatType,
          status: Math.random() > 0.2 ? 'available' : 'booked',
          position: { row: row + 1, col }
        });
      }
      setAvailableSeats(seats);
    }
  };

  const handleSeatSelect = (seats: Seat[]) => {
    setSelectedSeat(seats.length > 0 ? seats[0] : null);
  };

  const handleBooking = async (paymentData: { method: FormPaymentMethod; details: any; }) => {
    setIsProcessing(true);
    setSelectedPaymentMethod(paymentData.method);
    
    // Simulate processing
    setTimeout(() => {
      const bookingDetails = {
        id: `BK${Date.now()}`,
        confirmationCode: generateConfirmationCode(),
        fromLocation: origin,
        toLocation: destination,
        date: selectedTrip?.date || new Date().toISOString().split('T')[0],
        time: selectedTrip?.time || '08:00',
        passengerName: userName,
        seatNumber: selectedSeat?.number || '1',
        seatType: selectedSeat?.type || 'standard',
        paymentMethod: paymentData.method || 'card',
        totalAmount: calculateTotal(),
        pickupPoint: selectedHotpoint?.name
      };
      
      setIsProcessing(false);
      onBookingComplete?.(bookingDetails);
    }, 2000);
  };

  const generateConfirmationCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const calculateTotal = () => {
    let total = selectedSeat?.price || 0;
    if (isHotpointNeeded && selectedHotpoint) {
      total += selectedHotpoint.fee;
    }
    return total;
  };

  const canProceedToPayment = () => {
    return origin && destination && selectedTrip && selectedSeat && userName.trim() && 
           (!isHotpointNeeded || selectedHotpoint);
  };

  return (
    <div className={`card card-interactive overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-600 p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-text-light-primary text-center">
          Book Your Journey
        </h1>
        <p className="text-text-light-primary/90 text-center text-sm mt-1">
          Complete your booking in one simple form
        </p>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Route Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Origin */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-text-light-primary dark:text-text-dark-primary flex items-center">
              <div className="icon-badge icon-badge-sm bg-accent-red/10 text-accent-red mr-2">
                <MapPin className="h-3 w-3" />
              </div>
              From
            </label>
            <div className="relative">
              <button
                type="button"
                className="w-full flex justify-between items-center px-3 py-2.5 text-sm border-2 border-border-light dark:border-border-dark rounded-lg bg-surface-light dark:bg-surface-dark text-text-light-primary dark:text-text-dark-primary hover:border-primary-700 focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 focus:outline-none transition-all duration-300"
                onClick={() => setIsOriginDropdownOpen(!isOriginDropdownOpen)}
              >
                <span className={origin ? 'text-text-light-primary dark:text-text-dark-primary' : 'text-text-light-tertiary dark:text-text-dark-tertiary'}>
                  {origin || 'Select origin'}
                </span>
                <ChevronDown className={`h-4 w-4 text-text-light-tertiary dark:text-text-dark-tertiary transition-transform duration-300 ${isOriginDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOriginDropdownOpen && (
                <div className="absolute z-50 mt-2 w-full bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md border-2 border-border-light dark:border-border-dark rounded-xl shadow-2xl max-h-48 overflow-auto">
                  <div className="p-3">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {popularOrigins.map((city, i) => (
                        <button
                          key={i}
                          className="px-3 py-1.5 text-xs bg-background-light hover:bg-primary-700/20 dark:bg-background-dark dark:hover:bg-primary-700/30 rounded-full text-text-light-secondary dark:text-text-dark-secondary hover:text-text-light-primary dark:hover:text-text-dark-primary transition-all duration-300 border border-border-light dark:border-border-dark"
                          onClick={() => {
                            setOrigin(city);
                            setIsOriginDropdownOpen(false);
                          }}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-border-light dark:border-border-dark">
                    {availableOrigins.map((location, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-4 py-3 text-sm text-text-light-primary dark:text-text-dark-primary hover:bg-primary-700/10 dark:hover:bg-primary-700/20 focus:bg-primary-700/10 dark:focus:bg-primary-700/20 focus:outline-none transition-all duration-300 border-b border-border-light/50 dark:border-border-dark/50 last:border-b-0"
                        onClick={() => {
                          setOrigin(location);
                          setIsOriginDropdownOpen(false);
                        }}
                      >
                        <div className="flex items-center">
                          <div className="icon-badge icon-badge-xs bg-accent-red/10 text-accent-red mr-2">
                            <MapPin className="h-3 w-3" />
                          </div>
                          {location}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Destination */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-text-light-primary dark:text-text-dark-primary flex items-center">
              <div className="icon-badge icon-badge-sm bg-primary-700/10 text-primary-700 mr-2">
                <MapPin className="h-3 w-3" />
              </div>
              To
            </label>
            <div className="relative">
              <button
                type="button"
                className="w-full flex justify-between items-center px-3 py-2.5 text-sm border-2 border-border-light dark:border-border-dark rounded-lg bg-surface-light dark:bg-surface-dark text-text-light-primary dark:text-text-dark-primary hover:border-primary-700 focus:border-primary-700 focus:ring-2 focus:ring-primary-700/20 focus:outline-none transition-all duration-300"
                onClick={() => setIsDestinationDropdownOpen(!isDestinationDropdownOpen)}
              >
                <span className={destination ? 'text-text-light-primary dark:text-text-dark-primary' : 'text-text-light-tertiary dark:text-text-dark-tertiary'}>
                  {destination || 'Select destination'}
                </span>
                <ChevronDown className={`h-4 w-4 text-text-light-tertiary dark:text-text-dark-tertiary transition-transform duration-300 ${isDestinationDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isDestinationDropdownOpen && (
                <div className="absolute z-50 mt-2 w-full bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md border-2 border-border-light dark:border-border-dark rounded-xl shadow-2xl max-h-48 overflow-auto">
                  <div className="p-3">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {popularDestinations.map((city, i) => (
                        <button
                          key={i}
                          className="px-3 py-1.5 text-xs bg-background-light hover:bg-primary-700/20 dark:bg-background-dark dark:hover:bg-primary-700/30 rounded-full text-text-light-secondary dark:text-text-dark-secondary hover:text-text-light-primary dark:hover:text-text-dark-primary transition-all duration-300 border border-border-light dark:border-border-dark"
                          onClick={() => {
                            setDestination(city);
                            setIsDestinationDropdownOpen(false);
                          }}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-border-light dark:border-border-dark">
                    {availableDestinations.map((location, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-4 py-3 text-sm text-text-light-primary dark:text-text-dark-primary hover:bg-primary-700/10 dark:hover:bg-primary-700/20 focus:bg-primary-700/10 dark:focus:bg-primary-700/20 focus:outline-none transition-all duration-300 border-b border-border-light/50 dark:border-border-dark/50 last:border-b-0"
                        onClick={() => {
                          setDestination(location);
                          setIsDestinationDropdownOpen(false);
                        }}
                      >
                        <div className="flex items-center">
                          <div className="icon-badge icon-badge-xs bg-primary-700/10 text-primary-700 mr-2">
                            <MapPin className="h-3 w-3" />
                          </div>
                          {location}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Button */}
        <div className="flex justify-center">
          <button
            onClick={searchTrips}
            disabled={!origin || !destination}
            className="btn btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Search className="h-4 w-4" />
            <span>Find Trips</span>
          </button>
        </div>

        {/* Available Trips */}
        {availableTrips.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-light-primary dark:text-text-dark-primary flex items-center">
              <div className="icon-badge icon-badge-md bg-primary-700/10 text-primary-700 mr-3">
                <Clock className="h-4 w-4" />
              </div>
              Available Trips
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableTrips.map((trip) => (
                <button
                  key={trip.id}
                  onClick={() => selectTrip(trip)}
                  className={`card card-interactive p-4 text-left transition-all duration-300 ${
                    selectedTrip?.id === trip.id
                      ? 'border-primary-700 bg-primary-700/5 shadow-lg ring-2 ring-primary-700/20'
                      : 'hover:border-primary-700/50 hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-semibold text-text-light-primary dark:text-text-dark-primary text-lg">{trip.time}</span>
                    <span className="text-sm text-primary-700 font-bold bg-primary-700/10 px-2 py-1 rounded-full">${trip.price}</span>
                  </div>
                  <div className="text-xs text-text-light-secondary dark:text-text-dark-secondary flex items-center">
                    <div className="icon-badge icon-badge-xs bg-info/10 text-info mr-2">
                      <User className="h-3 w-3" />
                    </div>
                    {trip.availableSeats} seats available
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Seat Selection */}
        {selectedTrip && availableSeats.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-light-primary dark:text-text-dark-primary flex items-center">
              <div className="icon-badge icon-badge-md bg-primary-700/10 text-primary-700 mr-3">
                <Car className="h-4 w-4" />
              </div>
              Choose Your Seat
            </h3>
            <div className="card p-4">
              <SeatSelector
                seats={availableSeats}
                onSeatSelect={handleSeatSelect}
                maxSelection={1}
                compact={true}
                hideLegend={false}
                customColors={{ selected: 'bg-primary-700' }}
              />
            </div>
            {selectedSeat && (
              <div className="card bg-primary-700/5 border-primary-700/20 p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="icon-badge icon-badge-md bg-primary-700 text-text-light-primary mr-3">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-text-light-primary dark:text-text-dark-primary">
                      Seat {selectedSeat.number} ({selectedSeat.type})
                    </span>
                  </div>
                  <span className="font-bold text-primary-700 text-lg">
                    ${selectedSeat.price.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Passenger Details */}
        {selectedSeat && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-light-primary dark:text-text-dark-primary flex items-center">
              <div className="icon-badge icon-badge-md bg-primary-700/10 text-primary-700 mr-3">
                <User className="h-4 w-4" />
              </div>
              Passenger Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-light-primary dark:text-text-dark-primary mb-2">
                  Passenger Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter full name"
                  className="input-field"
                />
              </div>
              <div>
                <label className="flex items-center space-x-3 p-3 card rounded-lg cursor-pointer hover:bg-primary-700/5 transition-colors duration-300">
                  <input
                    type="checkbox"
                    checked={isHotpointNeeded}
                    onChange={(e) => setIsHotpointNeeded(e.target.checked)}
                    className="rounded border-border-light dark:border-border-dark text-primary-700 focus:ring-primary-700 focus:ring-offset-0"
                  />
                  <span className="text-sm font-medium text-text-light-primary dark:text-text-dark-primary">
                    Add doorstep pickup (+$5.00)
                  </span>
                </label>
                {isHotpointNeeded && (
                  <select
                    value={selectedHotpoint?.id || ''}
                    onChange={(e) => {
                      const hotpoint = hotPoints.find(hp => hp.id === e.target.value);
                      setSelectedHotpoint(hotpoint || null);
                    }}
                    className="input-field mt-3"
                  >
                    <option value="">Select pickup point</option>
                    {hotPoints.map((hotpoint) => (
                      <option key={hotpoint.id} value={hotpoint.id}>
                        {hotpoint.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payment Section */}
        {canProceedToPayment() && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-light-primary dark:text-text-dark-primary flex items-center">
              <div className="icon-badge icon-badge-md bg-primary-700/10 text-primary-700 mr-3">
                <CreditCard className="h-4 w-4" />
              </div>
              Payment Details
            </h3>

            {/* Booking Summary */}
            <div className="card p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-light-secondary dark:text-text-dark-secondary">Trip: {origin} → {destination}</span>
                <span className="font-medium text-text-light-primary dark:text-text-dark-primary">${selectedSeat?.price.toFixed(2)}</span>
              </div>
              {isHotpointNeeded && selectedHotpoint && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-light-secondary dark:text-text-dark-secondary">Pickup: {selectedHotpoint.name}</span>
                  <span className="font-medium text-text-light-primary dark:text-text-dark-primary">${selectedHotpoint.fee.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-border-light dark:border-border-dark pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span className="text-text-light-primary dark:text-text-dark-primary">Total</span>
                  <span className="text-primary-700">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            <PaymentForm
              amount={calculateTotal()}
              onPaymentSubmit={handleBooking}
              isProcessing={isProcessing}
              className=""
            />
          </div>
        )}
      </div>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
          <div className="card p-8 flex flex-col items-center max-w-sm mx-4">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-primary-700/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary-700 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-text-light-primary dark:text-text-dark-primary font-semibold text-center mb-2">Processing your booking...</p>
            <p className="text-text-light-secondary dark:text-text-dark-secondary text-sm text-center">Please wait while we confirm your reservation</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SinglePageBooking;
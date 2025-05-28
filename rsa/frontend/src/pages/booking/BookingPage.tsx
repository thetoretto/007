import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import { MapPin, ChevronRight, Shield, Clock, CalendarCheck, CheckCircle } from 'lucide-react';
import SeatSelector from '../../components/common/SeatSelector';
import { useBookingStore } from '../../store/bookingStore';
import useTripStore, { Trip } from '../../store/tripStore';
import useHotPointStore, { HotPoint } from '../../store/hotPointStore';
import '../../index.css';

// Define our Seat interface - ensure it's compatible with what SeatSelector expects
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

const BookingPage: React.FC = () => {
  // Booking process state
  const [step, setStep] = useState(1);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [selectedHotpoint, setSelectedHotpoint] = useState<HotPoint | null>(null);
  const [isHotpointNeeded, setIsHotpointNeeded] = useState(false);
  const [availableTrips, setAvailableTrips] = useState<Trip[]>([]);
  const [availableSeats, setAvailableSeats] = useState<Seat[]>([]);
  const [bookingComplete, setBookingComplete] = useState(false);
  
  // Stores
  const { getAvailableTripsForBooking } = useBookingStore();
  const { hotPoints, fetchHotPoints } = useHotPointStore();
  
  // Popular destinations data
  const popularOrigins = ['Accra', 'Lagos', 'Nairobi', 'Cape Town', 'Johannesburg'];
  const popularDestinations = ['Kumasi', 'Port Harcourt', 'Mombasa', 'Durban', 'Pretoria'];
  
  // Fetch hotpoints on component mount
  useEffect(() => {
    fetchHotPoints();
  }, [fetchHotPoints]);
  
  // Step 1: Search for available trips
  const searchTrips = () => {
    if (origin && destination) {
      const trips = getAvailableTripsForBooking({
        originName: origin,
        destinationName: destination
      });
      setAvailableTrips(trips);
      setStep(2);
    }
  };
  
  // Step 2: Select trip and proceed to seat selection
  const selectTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    
    // Generate available seats based on the vehicle
    if (trip.vehicle && trip.vehicle.capacity) {
      const seats: Seat[] = [];
      const seatsPerRow = 4;
      const numRows = Math.ceil(trip.vehicle.capacity / seatsPerRow);
      
      // Add driver seat - now handle as 'reserved' standard seat for compatibility
      seats.push({
        id: `${trip.vehicle.id}-driver`,
        number: 'D',
        price: 0,
        type: 'standard', // Use 'standard' instead of 'driver' for compatibility
        status: 'reserved',
        position: { row: 0, col: 0 }
      });
      
      // Add passenger seats
      for (let i = 0; i < trip.vehicle.capacity; i++) {
        const row = Math.floor(i / seatsPerRow);
        let col = i % seatsPerRow;
        
        // Add aisle gap
        if (col >= 2) col += 1;
        
        seats.push({
          id: `${trip.vehicle.id}-s${i+1}`,
          number: `${i+1}`,
          price: trip.price || 10,
          type: 'standard',
          status: Math.random() > 0.2 ? 'available' : 'booked',
          position: { row: row + 1, col }
        });
      }
      
      setAvailableSeats(seats);
    }
    
    setStep(3);
  };
  
  // Step 3: Handle seat selection - updated to match SeatSelector interface
  const handleSeatSelect = (seats: Seat[]) => {
    if (seats.length > 0) {
      setSelectedSeat(seats[0]);
    } else {
      setSelectedSeat(null);
    }
  };
  
  // Step 4: Handle hotpoint selection
  const toggleHotpoint = () => {
    setIsHotpointNeeded(!isHotpointNeeded);
    if (!isHotpointNeeded) {
      setSelectedHotpoint(null);
    }
  };
  
  const selectHotpoint = (hotpoint: HotPoint) => {
    setSelectedHotpoint(hotpoint);
  };
  
  // Final step: Complete booking
  const completeBooking = () => {
    // In a real implementation, this would call the API to create a booking
    setBookingComplete(true);
    setStep(5);
  };
  
  // Reset booking process
  const resetBooking = () => {
    setStep(1);
    setSelectedTrip(null);
    setSelectedSeat(null);
    setSelectedHotpoint(null);
    setIsHotpointNeeded(false);
    setBookingComplete(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-accent-kente-gold-dark to-accent-kente-gold text-black">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold">Book Your African Journey</h1>
        </div>
      </div>
      
      {/* Booking Process Container */}
      <div className="max-w-xl mx-auto px-4 py-6">
        {/* Progress Indicator */}
        <div className="flex justify-between mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`flex flex-col items-center`}>
              <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${step >= s ? 'bg-accent-kente-gold text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                {s}
              </div>
              <span className="text-xs mt-1 hidden sm:block">
                {s === 1 ? 'Route' : s === 2 ? 'Trip' : s === 3 ? 'Seat' : 'Confirm'}
              </span>
            </div>
          ))}
        </div>
        
        {/* Step 1: Route Selection */}
        {step === 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Select Route</h2>
            
            {/* Origin Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Where from?
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="w-2 h-2 rounded-full bg-accent-red"></div>
                </div>
                <input
                  type="text"
                  placeholder="Enter your starting point"
                  className="block w-full pl-8 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-accent-kente-gold focus:border-accent-kente-gold bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                />
                <button 
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-accent-kente-gold"
                  onClick={() => navigator.geolocation?.getCurrentPosition(
                    () => setOrigin("Current Location")
                  )}
                >
                  <MapPin className="h-5 w-5" />
                </button>
              </div>
              
              {/* Popular Origins */}
              <div className="mt-2 flex flex-wrap gap-2">
                {popularOrigins.map((city, i) => (
                  <button 
                    key={i} 
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-accent-kente-gold/20 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full text-gray-700 dark:text-gray-300"
                    onClick={() => setOrigin(city)}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Destination Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Where to?
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="w-2 h-2 rounded-full bg-accent-kente-gold"></div>
                </div>
                <input
                  type="text"
                  placeholder="Enter your destination"
                  className="block w-full pl-8 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-accent-kente-gold focus:border-accent-kente-gold bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
              
              {/* Popular Destinations */}
              <div className="mt-2 flex flex-wrap gap-2">
                {popularDestinations.map((city, i) => (
                  <button 
                    key={i} 
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-accent-kente-gold/20 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full text-gray-700 dark:text-gray-300"
                    onClick={() => setDestination(city)}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Find Trips Button */}
            <button
              onClick={searchTrips}
              disabled={!origin || !destination}
              className={`w-full rounded-lg py-4 px-4 text-center text-white font-bold text-lg flex items-center justify-center transition-all
                ${(origin && destination) 
                  ? 'bg-accent-kente-gold hover:bg-accent-kente-gold-dark active:transform active:scale-95 cursor-pointer shadow-md' 
                  : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'}`}
            >
              Find Trips <ChevronRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        )}
        
        {/* Step 2: Trip Selection */}
        {step === 2 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Select Trip</h2>
            
            {availableTrips.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No trips available for this route.</p>
                <button 
                  onClick={() => setStep(1)}
                  className="mt-4 text-accent-kente-gold hover:text-accent-kente-gold-dark"
                >
                  Try a different route
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Trip list with better mobile layout */}
                {availableTrips.map((trip) => (
                  <div 
                    key={trip.id} 
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 hover:border-accent-kente-gold dark:hover:border-accent-kente-gold cursor-pointer transition-all"
                    onClick={() => selectTrip(trip)}
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                      <div>
                        <p className="font-medium text-base sm:text-lg">{trip.fromLocation} → {trip.toLocation}</p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          {trip.date} at {trip.time} • {trip.availableSeats} seats available
                        </p>
                      </div>
                      <div className="mt-2 sm:mt-0 sm:text-right">
                        <p className="font-bold text-base sm:text-lg">${trip.price}</p>
                        <p className="text-xs text-accent-kente-gold">{trip.vehicle?.type}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={() => setStep(1)}
                  className="w-full py-2 text-accent-kente-gold hover:text-accent-kente-gold-dark text-center"
                >
                  Back to Route Selection
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Step 3: Seat Selection */}
        {step === 3 && selectedTrip && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Select Your Seat</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Trip: {selectedTrip.fromLocation} → {selectedTrip.toLocation}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedTrip.date} at {selectedTrip.time}
              </p>
            </div>
            
            <div className="mb-6">
              <SeatSelector 
                initialSeats={availableSeats}
                initialSelectedSeats={selectedSeat ? [selectedSeat] : []}
                onSeatSelect={handleSeatSelect}
                maxSelectableSeats={1}
                vehicleName={selectedTrip.vehicle?.type || 'Vehicle'}
              />
              
              <div className="flex justify-between mt-4 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded-sm mr-2"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-accent-kente-gold rounded-sm mr-2"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-400 dark:bg-gray-500 rounded-sm mr-2"></div>
                  <span>Booked</span>
                </div>
              </div>
            </div>
            
            {/* Buttons with better spacing on mobile */}
            <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0">
              <button 
                onClick={() => setStep(2)}
                className="w-full sm:w-auto px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
              >
                Back
              </button>
              
              <button 
                onClick={() => setStep(4)}
                disabled={!selectedSeat}
                className={`w-full sm:w-auto px-6 py-2 rounded-lg text-white ${selectedSeat ? 'bg-accent-kente-gold hover:bg-accent-kente-gold-dark' : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'}`}
              >
                Continue
              </button>
            </div>
          </div>
        )}
        
        {/* Step 4: Hotpoint and Confirmation */}
        {step === 4 && selectedTrip && selectedSeat && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Confirm Booking</h2>
            
            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-medium">Trip Details</h3>
                <p className="text-sm">{selectedTrip.fromLocation} → {selectedTrip.toLocation}</p>
                <p className="text-sm">{selectedTrip.date} at {selectedTrip.time}</p>
                <p className="text-sm">Vehicle: {selectedTrip.vehicle?.type}</p>
                <p className="text-sm">Seat: {selectedSeat.number}</p>
              </div>
              
              {/* Hotpoint selection (optional) */}
              <div>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="needHotpoint"
                    checked={isHotpointNeeded}
                    onChange={toggleHotpoint}
                    className="w-4 h-4 text-accent-kente-gold focus:ring-accent-kente-gold border-gray-300 rounded"
                  />
                  <label htmlFor="needHotpoint" className="ml-2 text-sm font-medium">
                    I need pickup/dropoff at a hotpoint
                  </label>
                </div>
                
                {isHotpointNeeded && (
                  <div className="ml-6 mt-2">
                    <label className="block text-sm font-medium mb-1">Select Hotpoint</label>
                    <select
                      value={selectedHotpoint?.id || ''}
                      onChange={(e) => {
                        const hotpoint = hotPoints.find(h => h.id === e.target.value);
                        if (hotpoint) setSelectedHotpoint(hotpoint);
                      }}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    >
                      <option value="">Select a hotpoint...</option>
                      {hotPoints
                        .filter(h => h.status === 'active')
                        .map(hotpoint => (
                          <option key={hotpoint.id} value={hotpoint.id}>
                            {hotpoint.name} - {hotpoint.address}
                          </option>
                        ))
                      }
                    </select>
                  </div>
                )}
              </div>
              
              {/* Price summary */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span>Ticket Price</span>
                  <span>${selectedTrip.price}</span>
                </div>
                {isHotpointNeeded && selectedHotpoint && (
                  <div className="flex justify-between">
                    <span>Hotpoint Fee</span>
                    <span>$2.00</span>
                  </div>
                )}
                <div className="border-t border-gray-200 dark:border-gray-600 my-2 pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span>${(selectedTrip.price || 0) + (isHotpointNeeded && selectedHotpoint ? 2 : 0)}</span>
                </div>
              </div>
            </div>
            
            {/* Better button layout for mobile */}
            <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0">
              <button 
                onClick={() => setStep(3)}
                className="w-full sm:w-auto px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
              >
                Back
              </button>
              
              <button 
                onClick={completeBooking}
                disabled={isHotpointNeeded && !selectedHotpoint}
                className={`w-full sm:w-auto px-6 py-2 rounded-lg text-white 
                  ${(!isHotpointNeeded || (isHotpointNeeded && selectedHotpoint)) 
                    ? 'bg-accent-kente-gold hover:bg-accent-kente-gold-dark' 
                    : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'}`}
              >
                Complete Booking
              </button>
            </div>
          </div>
        )}
        
        {/* Step 5: Booking Confirmation */}
        {step === 5 && bookingComplete && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 border border-gray-100 dark:border-gray-700 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Booking Complete!</h2>
            <p className="mb-6">Your ticket has been booked successfully.</p>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-left mb-6">
              <h3 className="font-medium mb-2">Booking Summary</h3>
              <p>Trip: {selectedTrip?.fromLocation} → {selectedTrip?.toLocation}</p>
              <p>Date: {selectedTrip?.date} at {selectedTrip?.time}</p>
              <p>Seat: {selectedSeat?.number}</p>
              {isHotpointNeeded && selectedHotpoint && (
                <p>Hotpoint: {selectedHotpoint.name}</p>
              )}
              <p className="font-bold mt-2">Total Paid: ${(selectedTrip?.price || 0) + (isHotpointNeeded && selectedHotpoint ? 2 : 0)}</p>
            </div>
            
            <button 
              onClick={resetBooking}
              className="w-full py-3 bg-accent-kente-gold hover:bg-accent-kente-gold-dark text-white font-medium rounded-lg"
            >
              Book Another Trip
            </button>
          </div>
        )}
      </div>
      
      {/* Core Benefits */}
      {step === 1 && (
        <div className="max-w-xl mx-auto px-4 mt-8 mb-12">
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                icon: Shield,
                title: "Safe & Secure",
              },
              {
                icon: Clock,
                title: "Quick Booking",
              },
              {
                icon: CalendarCheck,
                title: "Flexible Options",
              }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-2 text-accent-kente-gold">
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="mt-1 text-center">
                  <p className="text-xs font-medium text-gray-900 dark:text-white">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
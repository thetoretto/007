import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import { MapPin, ChevronRight, Shield, Clock, CalendarCheck, CheckCircle, ChevronDown, Calendar, Info, CreditCard, Smartphone, User, Wallet } from 'lucide-react';
import SeatSelector from '../../components/common/SeatSelector';
import PaymentForm, { PaymentMethod } from '../../components/common/PaymentForm';
import { useBookingStore } from '../../store/bookingStore';
import useTripStore, { Trip } from '../../store/tripStore';
import useHotPointStore, { HotPoint } from '../../store/hotPointStore';
import { mockRoutes } from '../../utils/mockData';
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

// Define payment method types
type PaymentMethod = 'airtel' | 'momo' | 'card' | null;

interface TicketHolder {
  seatId: string;
  name: string;
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
  const [isDestinationDropdownOpen, setIsDestinationDropdownOpen] = useState(false);
  const [isOriginDropdownOpen, setIsOriginDropdownOpen] = useState(false);
  
  // Payment and user info state
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(null);
  const [ticketHolders, setTicketHolders] = useState<TicketHolder[]>([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Get unique destinations from mockRoutes
  const availableDestinations = React.useMemo(() => {
    const destinations = mockRoutes.map(route => route.destination.name);
    return [...new Set(destinations)];
  }, []);
  
  // Get unique origins from mockRoutes
  const availableOrigins = React.useMemo(() => {
    const origins = mockRoutes.map(route => route.origin.name);
    return [...new Set(origins)];
  }, []);
  
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
  
  // Initialize ticket holders when seats are selected
  useEffect(() => {
    if (selectedSeat) {
      setTicketHolders([
        { seatId: selectedSeat.id, name: userName || 'Passenger' }
      ]);
    } else {
      setTicketHolders([]);
    }
  }, [selectedSeat, userName]);
  
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
  
  // Step 5: Handle payment method selection
  const selectPaymentMethod = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
  };
  
  // Step 5: Update ticket holder name
  const updateTicketHolderName = (seatId: string, name: string) => {
    setTicketHolders(prev => 
      prev.map(holder => 
        holder.seatId === seatId ? { ...holder, name } : holder
      )
    );
  };
  
  // Step 5: Process payment
  const processPayment = (paymentData: {
    method: PaymentMethod;
    details: any;
  }) => {
    setSelectedPaymentMethod(paymentData.method);
    setIsProcessingPayment(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessingPayment(false);
      setBookingComplete(true);
      setStep(6); // Move to confirmation
    }, 1500);
  };
  
  // Final step: Complete booking
  const completeBooking = () => {
    // In a real implementation, this would call the API to create a booking
    setStep(5); // Go to payment step
  };
  
  // Reset booking process
  const resetBooking = () => {
    setStep(1);
    setSelectedTrip(null);
    setSelectedSeat(null);
    setSelectedHotpoint(null);
    setIsHotpointNeeded(false);
    setBookingComplete(false);
    setSelectedPaymentMethod(null);
    setTicketHolders([]);
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
      
      {/* Booking Process Container - improved symmetry */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Indicator - evenly spaced - updated for 5 steps */}
        <div className="flex justify-between mb-8 max-w-md mx-auto">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex flex-col items-center">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center 
                ${step >= s ? 'bg-accent-kente-gold text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                {s}
              </div>
              <span className="text-xs mt-2 hidden sm:block text-center">
                {s === 1 ? 'Route' : 
                 s === 2 ? 'Trip' : 
                 s === 3 ? 'Seat' : 
                 s === 4 ? 'Details' : 
                 s === 5 ? 'Payment' : 'Confirm'}
              </span>
            </div>
          ))}
        </div>
        
        {/* Content container with consistent width and centering */}
        <div className="max-w-xl mx-auto">
          {/* Step 1: Route Selection */}
          {step === 1 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-6 text-center sm:text-left">Select Route</h2>
              
            {/* Origin Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Where from?
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="w-2 h-2 rounded-full bg-accent-red"></div>
                </div>
                  
                  {/* Dropdown for origin */}
                  <div className="relative">
                    <button
                      type="button"
                      className="flex w-full justify-between items-center pl-8 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      onClick={() => setIsOriginDropdownOpen(!isOriginDropdownOpen)}
                    >
                      {origin || 'Select your starting point'}
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-accent-kente-gold" />
                        <ChevronDown className={`h-4 w-4 transition-transform ${isOriginDropdownOpen ? 'transform rotate-180' : ''}`} />
                      </div>
                    </button>
                    
                    {isOriginDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                <input
                  type="text"
                          placeholder="Search pickup locations..."
                          className="w-full p-2 border-b border-gray-300 dark:border-gray-600"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                />
                        <ul>
                          {availableOrigins
                            .filter(org => org.toLowerCase().includes(origin.toLowerCase()))
                            .map((org, index) => (
                              <li 
                                key={index}
                                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                                onClick={() => {
                                  setOrigin(org);
                                  setIsOriginDropdownOpen(false);
                                }}
                              >
                                {org}
                              </li>
                            ))}
                        </ul>
                        
                        <div className="p-2 border-t border-gray-300 dark:border-gray-600">
                <button 
                            className="w-full flex items-center justify-center text-accent-kente-gold hover:text-accent-kente-gold-dark text-sm p-1"
                            onClick={() => {
                              navigator.geolocation?.getCurrentPosition(
                                () => {
                                  setOrigin("Current Location");
                                  setIsOriginDropdownOpen(false);
                                }
                              );
                            }}
                          >
                            <MapPin className="h-4 w-4 mr-1" /> Use Current Location
                </button>
                        </div>
                      </div>
                    )}
                  </div>
              </div>
              
                {/* Popular Origins - centered grid */}
                <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                {popularOrigins.map((city, i) => (
                  <button 
                    key={i} 
                      className="px-3 py-1 text-xs bg-gray-100 hover:bg-accent-kente-gold/20 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full text-gray-700 dark:text-gray-300"
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
            
            {/* Destination Input */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Where to?
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="w-2 h-2 rounded-full bg-accent-kente-gold"></div>
                </div>
                  
                  {/* Dropdown for destination */}
                  <div className="relative">
                    <button
                      type="button"
                      className="flex w-full justify-between items-center pl-8 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      onClick={() => setIsDestinationDropdownOpen(!isDestinationDropdownOpen)}
                    >
                      {destination || 'Select your destination'}
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-accent-kente-gold" />
                        <ChevronDown className={`h-4 w-4 transition-transform ${isDestinationDropdownOpen ? 'transform rotate-180' : ''}`} />
                      </div>
                    </button>
                    
                    {isDestinationDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                <input
                  type="text"
                          placeholder="Search destinations..."
                          className="w-full p-2 border-b border-gray-300 dark:border-gray-600"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
                        <ul>
                          {availableDestinations
                            .filter(dest => dest.toLowerCase().includes(destination.toLowerCase()))
                            .map((dest, index) => (
                              <li 
                                key={index}
                                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                                onClick={() => {
                                  setDestination(dest);
                                  setIsDestinationDropdownOpen(false);
                                }}
                              >
                                {dest}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
              </div>
              
                {/* Popular Destinations - centered grid matching origins */}
                <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                {popularDestinations.map((city, i) => (
                  <button 
                    key={i} 
                      className="px-3 py-1 text-xs bg-gray-100 hover:bg-accent-kente-gold/20 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full text-gray-700 dark:text-gray-300"
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-6 text-center sm:text-left">Select Trip</h2>
              
              {availableTrips.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No trips available for this route.</p>
                  <button 
                    onClick={() => setStep(1)}
                    className="px-6 py-2 border border-accent-kente-gold text-accent-kente-gold hover:bg-accent-kente-gold/10 rounded-lg"
                  >
                    Try a different route
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Trip list with better grid layout */}
                  <div className="grid gap-3">
                    {availableTrips.map((trip) => (
                      <div 
                        key={trip.id} 
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-accent-kente-gold dark:hover:border-accent-kente-gold cursor-pointer transition-all hover:shadow-md"
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
                  </div>
                  
                  <button 
                    onClick={() => setStep(1)}
                    className="w-full py-3 mt-4 text-accent-kente-gold hover:text-accent-kente-gold-dark text-center border border-accent-kente-gold/50 rounded-lg hover:bg-accent-kente-gold/5"
                  >
                    Back to Route Selection
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Seat Selection */}
          {step === 3 && selectedTrip && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              {/* Header with trip info */}
              <div className="bg-gray-50 dark:bg-gray-850 p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-2">Select Your Seat</h2>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-1 text-accent-kente-gold" />
                    <span className="font-medium">{selectedTrip.fromLocation} → {selectedTrip.toLocation}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-1 text-accent-kente-gold" />
                    <span>{selectedTrip.date} at {selectedTrip.time}</span>
                  </div>
                </div>
              </div>
              
              {/* Main content */}
              <div className="p-4">
                {/* User instructions */}
                <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg mb-4 border border-blue-100 dark:border-blue-800 flex items-start">
                  <Info className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Tap a seat to select it. The SeatSelector shows all seats, with pricing and availability.
                    You can zoom in/out for better visibility on mobile devices.
                  </p>
                </div>
                
                {/* The SeatSelector component */}
                <SeatSelector 
                  initialSeats={availableSeats}
                  initialSelectedSeats={selectedSeat ? [selectedSeat] : []}
                  onSeatSelect={handleSeatSelect}
                  maxSelectableSeats={1}
                  vehicleName={selectedTrip.vehicle?.type || 'Vehicle'}
                />
                
                {/* Selection confirmation banner - fixed to bottom on mobile */}
                <div className={`fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg sm:relative sm:bottom-auto sm:left-auto sm:right-auto sm:mt-6 sm:rounded-lg sm:border ${selectedSeat ? 'block' : 'hidden'}`}>
                  <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-accent-kente-gold text-white flex items-center justify-center rounded-md font-medium mr-3">
                        {selectedSeat?.number}
                      </div>
                      <div>
                        <p className="font-medium">Seat {selectedSeat?.number}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">${selectedSeat?.price.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button 
                        onClick={() => setStep(2)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                      >
                        Back
                      </button>
                      <button 
                        onClick={() => setStep(4)}
                        className="flex-1 sm:flex-none px-6 py-2 bg-accent-kente-gold hover:bg-accent-kente-gold-dark text-white rounded-lg flex items-center justify-center"
                      >
                        Continue <ChevronRight className="ml-1 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Button row - only visible when no seat is selected */}
                {!selectedSeat && (
                  <div className="flex justify-between mt-6">
                    <button 
                      onClick={() => setStep(2)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                    >
                      Back
                    </button>
                    
                    <button 
                      disabled
                      className="px-6 py-2 bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed"
                    >
                      Select a seat to continue
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Hotpoint and Confirmation */}
          {step === 4 && selectedTrip && selectedSeat && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-6 text-center sm:text-left">Confirm Booking</h2>
              
              <div className="space-y-5 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg">
                  <h3 className="font-medium mb-3">Trip Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <p><span className="text-gray-500 dark:text-gray-400">From:</span> {selectedTrip.fromLocation}</p>
                    <p><span className="text-gray-500 dark:text-gray-400">To:</span> {selectedTrip.toLocation}</p>
                    <p><span className="text-gray-500 dark:text-gray-400">Date:</span> {selectedTrip.date}</p>
                    <p><span className="text-gray-500 dark:text-gray-400">Time:</span> {selectedTrip.time}</p>
                    <p><span className="text-gray-500 dark:text-gray-400">Vehicle:</span> {selectedTrip.vehicle?.type}</p>
                    <p><span className="text-gray-500 dark:text-gray-400">Seat:</span> {selectedSeat.number}</p>
                  </div>
                </div>
                
                {/* Hotpoint selection (optional) */}
                <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg">
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      id="needHotpoint"
                      checked={isHotpointNeeded}
                      onChange={toggleHotpoint}
                      className="w-5 h-5 text-accent-kente-gold focus:ring-accent-kente-gold border-gray-300 rounded"
                    />
                    <label htmlFor="needHotpoint" className="ml-2 text-sm font-medium">
                      I need pickup/dropoff at a hotpoint
                    </label>
                  </div>
                  
                  {isHotpointNeeded && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium mb-2">Select Hotpoint</label>
                      <select
                        value={selectedHotpoint?.id || ''}
                        onChange={(e) => {
                          const hotpoint = hotPoints.find(h => h.id === e.target.value);
                          if (hotpoint) setSelectedHotpoint(hotpoint);
                        }}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
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
                <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span>Ticket Price</span>
                    <span>${selectedTrip.price}</span>
                  </div>
                  {isHotpointNeeded && selectedHotpoint && (
                    <div className="flex justify-between mb-2">
                      <span>Hotpoint Fee</span>
                      <span>$2.00</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 dark:border-gray-600 my-3 pt-3 flex justify-between font-bold">
                    <span>Total</span>
                    <span>${(selectedTrip.price || 0) + (isHotpointNeeded && selectedHotpoint ? 2 : 0)}</span>
                  </div>
                </div>
              </div>
              
              {/* Better button layout for all viewports */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button 
                  onClick={() => setStep(3)}
                  className="w-full px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  Back
                </button>
                
                <button 
                  onClick={completeBooking}
                  disabled={isHotpointNeeded && !selectedHotpoint}
                  className={`w-full px-6 py-3 rounded-lg text-white 
                    ${(!isHotpointNeeded || (isHotpointNeeded && selectedHotpoint)) 
                      ? 'bg-accent-kente-gold hover:bg-accent-kente-gold-dark' 
                      : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'}`}
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Payment */}
          {step === 5 && selectedTrip && selectedSeat && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-6 text-center sm:text-left">Payment</h2>
              
              {/* User authentication check - only show if not logged in */}
              {!isUserLoggedIn && !userName && (
                <div className="mb-6 bg-gray-50 dark:bg-gray-700 p-5 rounded-lg">
                  <h3 className="font-medium mb-3 flex items-center">
                    <User className="h-5 w-5 mr-2 text-accent-kente-gold" />
                    Your Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Your Name</label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Passenger Information */}
              {userName && (
                <div className="mb-6 bg-gray-50 dark:bg-gray-700 p-5 rounded-lg">
                  <h3 className="font-medium mb-3">Passenger Information</h3>
                  <div className="space-y-4">
                    {ticketHolders.map((holder, index) => (
                      <div key={holder.seatId} className="space-y-2">
                        <label className="block text-sm font-medium">
                          Name on Ticket {ticketHolders.length > 1 ? `(Seat ${selectedSeat.number})` : ''}
                        </label>
                        <input
                          type="text"
                          value={holder.name}
                          onChange={(e) => updateTicketHolderName(holder.seatId, e.target.value)}
                          placeholder="Enter passenger name"
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Payment Form Component */}
              {userName && (
                <PaymentForm
                  amount={(selectedTrip.price || 0) + (isHotpointNeeded && selectedHotpoint ? 2 : 0)}
                  isProcessing={isProcessingPayment}
                  onComplete={processPayment}
                  onCancel={() => setStep(4)}
                />
              )}
              
              {/* Show button to go back if no name entered */}
              {!userName && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button 
                    onClick={() => setStep(4)}
                    className="w-full px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg"
                  >
                    Back
                  </button>
                  
                  <button 
                    disabled={!userName}
                    className="w-full px-6 py-3 rounded-lg text-white bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                  >
                    Enter your name to continue
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 6: Booking Confirmation */}
          {step === 6 && bookingComplete && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-100 dark:border-gray-700 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-2">Booking Complete!</h2>
              <p className="mb-6">Your ticket has been booked successfully.</p>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg text-left mb-8">
                <h3 className="font-medium mb-3 border-b border-gray-200 dark:border-gray-600 pb-2">Booking Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <p><span className="text-gray-500 dark:text-gray-400">Trip:</span> {selectedTrip?.fromLocation} → {selectedTrip?.toLocation}</p>
                  <p><span className="text-gray-500 dark:text-gray-400">Date:</span> {selectedTrip?.date}</p>
                  <p><span className="text-gray-500 dark:text-gray-400">Time:</span> {selectedTrip?.time}</p>
                  <p><span className="text-gray-500 dark:text-gray-400">Seat:</span> {selectedSeat?.number}</p>
                  <p><span className="text-gray-500 dark:text-gray-400">Passenger:</span> {ticketHolders[0]?.name}</p>
                  <p><span className="text-gray-500 dark:text-gray-400">Payment:</span> {
                    selectedPaymentMethod === 'airtel' ? 'Airtel Money' :
                    selectedPaymentMethod === 'momo' ? 'MoMo' :
                    selectedPaymentMethod === 'card' ? 'Card' : 'Unknown'
                  }</p>
                  {isHotpointNeeded && selectedHotpoint && (
                    <p className="col-span-2"><span className="text-gray-500 dark:text-gray-400">Hotpoint:</span> {selectedHotpoint.name}</p>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <p className="font-bold">Total Paid: ${(selectedTrip?.price || 0) + (isHotpointNeeded && selectedHotpoint ? 2 : 0)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full py-3 border border-accent-kente-gold text-accent-kente-gold hover:bg-accent-kente-gold/10 font-medium rounded-lg"
                >
                  Go to Dashboard
                </button>
                <button 
                  onClick={resetBooking}
                  className="w-full py-3 bg-accent-kente-gold hover:bg-accent-kente-gold-dark text-white font-medium rounded-lg"
                >
                  Book Another Trip
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Core Benefits */}
      {step === 1 && (
        <div className="max-w-xl mx-auto px-4 mt-8 mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: Shield,
              title: "Safe & Secure",
                desc: "Vetted drivers and vehicles"
            },
            {
              icon: Clock,
              title: "Quick Booking",
                desc: "Book in minutes"
            },
            {
              icon: CalendarCheck,
              title: "Flexible Options",
                desc: "Multiple routes daily"
            }
          ].map((item, i) => (
              <div key={i} className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
                <div className="p-3 bg-accent-kente-gold/10 text-accent-kente-gold rounded-full mb-2">
                  <item.icon className="h-6 w-6" />
                </div>
                <div className="mt-1">
                  <p className="font-medium text-gray-900 dark:text-white mb-1">{item.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
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
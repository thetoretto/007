import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, ChevronRight, Shield, Clock, CalendarCheck, CheckCircle, ChevronDown, Calendar, Info, User, Home, ArrowLeft, Check, Search, X, Car, CreditCard } from 'lucide-react';
import SeatSelector from '../../components/common/SeatSelector';
import TripViewer, { Trip as ViewerTrip } from '../../components/common/TripViewer';
import PaymentForm from '../../components/common/PaymentForm';
import type { PaymentMethod as FormPaymentMethod } from '../../components/common/PaymentForm';
import BookingConfirmation, { BookingDetails } from '../../components/common/BookingConfirmation';
import { useBookingStore } from '../../store/bookingStore';
import useTripStore, { Trip } from '../../store/tripStore';
import useHotPointStore, { HotPoint as BaseHotPoint } from '../../store/hotPointStore';
import { mockRoutes, mockVehicles, mockTimeSlots } from '../../utils/mockData';
import '../../index.css';

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

type BookingPaymentMethod = FormPaymentMethod;

interface TicketHolder {
  seatId: string;
  name: string;
}

interface ExtendedHotPoint extends BaseHotPoint {
  fee: number;
}

const BookingPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [selectedHotpoint, setSelectedHotpoint] = useState<ExtendedHotPoint | null>(null);
  const [isHotpointNeeded, setIsHotpointNeeded] = useState(false);
  const [availableTrips, setAvailableTrips] = useState<Trip[]>([]);
  const [availableSeats, setAvailableSeats] = useState<Seat[]>([]);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [isDestinationDropdownOpen, setIsDestinationDropdownOpen] = useState(false);
  const [isOriginDropdownOpen, setIsOriginDropdownOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<BookingPaymentMethod>(null);
  const [ticketHolders, setTicketHolders] = useState<TicketHolder[]>([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Determine initial values for SeatSelector responsive props
  const initialCompact = useMemo(() => window.innerWidth < 640, []);
  const initialHideLegend = useMemo(() => window.innerWidth < 480, []);

  const availableDestinations = React.useMemo(() => {
    const destinations = mockRoutes.map(route => route.destination.name);
    return [...new Set(destinations)];
  }, []);

  const availableOrigins = React.useMemo(() => {
    const origins = mockRoutes.map(route => route.origin.name);
    return [...new Set(origins)];
  }, []);

  const { getAvailableTripsForBooking } = useBookingStore();
  const tripStore = useTripStore();
  const { hotPoints: baseHotPoints, fetchHotPoints } = useHotPointStore();
  const [hotPoints, setHotPoints] = useState<ExtendedHotPoint[]>([]);

  useEffect(() => {
    const extendedHotPoints = baseHotPoints.map(hp => ({
      ...hp,
      fee: 5.00
    }));
    setHotPoints(extendedHotPoints);
  }, [baseHotPoints]);

  useEffect(() => {
    tripStore.fetchTrips();
  }, []);

  const popularOrigins = availableOrigins.slice(0, 5);
  const popularDestinations = availableDestinations.slice(0, 5);

  useEffect(() => {
    fetchHotPoints();
  }, [fetchHotPoints]);

  useEffect(() => {
    // This is a mock. In a real app, you'd fetch user data.
    const loggedInUser = { name: "Jane Traveler" }; // Simulate a logged-in user
    if (loggedInUser) { // Set to true to simulate logged in, or based on auth state
      setIsUserLoggedIn(true);
      setUserName(loggedInUser.name);
    } else {
      setIsUserLoggedIn(false);
      setUserName('');
    }
  }, []);

  useEffect(() => {
    if (selectedSeat) {
      setTicketHolders([
        { seatId: selectedSeat.id, name: userName || '' } // Pre-fill with userName if available
      ]);
    } else {
      setTicketHolders([]);
    }
  }, [selectedSeat, userName]);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<number | null>(null);

  const moveToNextStep = (nextStep: number) => {
    setLoadingStep(nextStep);
    setIsLoading(true);
    setTimeout(() => {
      setStep(nextStep);
      setIsLoading(false);
      setLoadingStep(null);
      if (window.innerWidth < 768) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 500);
  };

  const searchTrips = () => {
    if (origin && destination) {
      setIsSearching(true);
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
      setIsSearching(false);
      moveToNextStep(2);
    }
  };

  const selectTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    if (trip.vehicle && trip.vehicle.capacity) {
      const seats: Seat[] = [];
      const seatsPerRow = 4;
      const numRows = Math.ceil(trip.vehicle.capacity / seatsPerRow);
      seats.push({
        id: `${trip.vehicle.id}-driver`,
        number: 'D',
        price: 0,
        type: 'standard',
        status: 'reserved',
        position: { row: 0, col: 0 }
      });
      for (let i = 0; i < trip.vehicle.capacity; i++) {
        const row = Math.floor(i / seatsPerRow);
        let col = i % seatsPerRow;
        if (col >= 2) col += 1;
        let seatType: 'standard' | 'premium' | 'vip' | 'accessible' = 'standard';
        if (row === 1) seatType = 'premium';
        else if (row === numRows - 1 && (col === 0 || col === seatsPerRow + 1)) seatType = 'accessible';
        else if (row > 1 && row < numRows - 1 && i % 7 === 0) seatType = 'vip';
        seats.push({
          id: `${trip.vehicle.id}-s${i+1}`,
          number: `${i+1}`,
          price: (trip.price || 10) * (seatType === 'standard' ? 1 : seatType === 'premium' ? 1.25 : seatType === 'vip' ? 1.5 : 0.9),
          type: seatType,
          status: Math.random() > 0.2 ? 'available' : 'booked',
          position: { row: row + 1, col }
        });
      }
      setAvailableSeats(seats);
    }
    moveToNextStep(3);
  };

  const convertToViewerTrip = (storeTrip: Trip): ViewerTrip => ({
    id: storeTrip.id,
    fromLocation: storeTrip.fromLocation || '',
    toLocation: storeTrip.toLocation || '',
    date: storeTrip.date,
    time: storeTrip.time,
    price: storeTrip.price || 0,
    status: storeTrip.status,
    driver: { id: storeTrip.driverId, name: "Driver", rating: 4.8 },
    vehicle: {
      id: storeTrip.vehicle?.id || 'default-vehicle',
      type: storeTrip.vehicle?.type || 'Shuttle',
      model: storeTrip.vehicle?.model || 'Standard Vehicle',
      capacity: storeTrip.vehicle?.capacity || 20,
      features: storeTrip.vehicle?.features || ['Air Conditioning']
    },
    availableSeats: storeTrip.availableSeats || 0,
    duration: storeTrip.route?.duration || 30,
    distance: storeTrip.route?.distance || 15,
    startCoords: { latitude: storeTrip.route?.origin.latitude || 0, longitude: storeTrip.route?.origin.longitude || 0 },
    endCoords: { latitude: storeTrip.route?.destination.latitude || 0, longitude: storeTrip.route?.destination.longitude || 0 }
  });

  const handleTripSelect = (viewerTrip: ViewerTrip) => {
    const storeTrip = availableTrips.find(t => t.id === viewerTrip.id);
    if (storeTrip) setSelectedTrip(storeTrip);
  };

  const handleTripBook = (viewerTrip: ViewerTrip) => {
    const storeTrip = availableTrips.find(t => t.id === viewerTrip.id);
    if (storeTrip) selectTrip(storeTrip);
  };

  const handleSeatSelect = React.useCallback((seats: Seat[]) => {
    setSelectedSeat(seats.length > 0 ? seats[0] : null);
  }, []);

  const toggleHotpoint = () => {
    setIsHotpointNeeded(!isHotpointNeeded);
    if (isHotpointNeeded) setSelectedHotpoint(null);
  };

  const selectHotpoint = (hotpoint: ExtendedHotPoint | null) => {
    setSelectedHotpoint(hotpoint);
  };
  
  const selectPaymentMethod = (method: BookingPaymentMethod) => {
    setSelectedPaymentMethod(method);
  };

  const updateTicketHolderName = (seatId: string, name: string) => {
    setTicketHolders(prev => prev.map(holder => holder.seatId === seatId ? { ...holder, name } : holder));
  };

  const completeBooking = () => {
    moveToNextStep(5);
  };

  const processPayment = (paymentData: { method: FormPaymentMethod; details: any; }) => {
    setSelectedPaymentMethod(paymentData.method);
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setBookingComplete(true);
      moveToNextStep(6);
    }, 1500);
  };

  const generateConfirmationCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
  };

  const resetBooking = () => {
    setStep(1);
    setOrigin('');
    setDestination('');
    setSelectedTrip(null);
    setSelectedSeat(null);
    setAvailableTrips([]);
    setSelectedHotpoint(null);
    setIsHotpointNeeded(false);
    setBookingComplete(false);
    setSelectedPaymentMethod(null);
    setTicketHolders([]);
  };

  const navigateBack = () => {
    if (step === 6) resetBooking();
    else if (step > 1) moveToNextStep(step - 1);
    else window.location.href = '/';
  };

  const noScrollbarClass = "scrollbar-hide";

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .scrollbar-hide::-webkit-scrollbar { display: none; }
      .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      .touch-action-manipulation { touch-action: manipulation; }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;
    const handleTouchStart = (e: TouchEvent) => { touchStartX = e.changedTouches[0].screenX; };
    const handleTouchEnd = (e: TouchEvent) => { touchEndX = e.changedTouches[0].screenX; handleSwipe(); };
    const handleSwipe = () => {
      if (touchEndX - touchStartX > 75 && step > 1 && step < 6) navigateBack();
      if (touchStartX - touchEndX > 75 && step < 5) {
        if (step === 1 && origin && destination) searchTrips();
        else if (step === 2 && selectedTrip) moveToNextStep(3);
        else if (step === 3 && selectedSeat) moveToNextStep(4);
        else if (step === 4) {
          if (isHotpointNeeded && !selectedHotpoint) {
            alert("Please select a pickup point or uncheck the 'Add doorstep pickup service' option."); return;
          }
          if (!ticketHolders[0]?.name?.trim()) {
            alert("Please enter the passenger's name."); return;
          }
          completeBooking();
        }
      }
    };
    if (step < 6 && !isLoading) {
      document.addEventListener('touchstart', handleTouchStart, { passive: true });
      document.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [step, origin, destination, selectedTrip, selectedSeat, isLoading, isHotpointNeeded, selectedHotpoint, ticketHolders, navigateBack, searchTrips, moveToNextStep, completeBooking]);

  const dropdownRefs = {
    origin: React.useRef<HTMLDivElement>(null),
    destination: React.useRef<HTMLDivElement>(null)
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOriginDropdownOpen && dropdownRefs.origin.current && !dropdownRefs.origin.current.contains(event.target as Node)) {
        setIsOriginDropdownOpen(false);
      }
      if (isDestinationDropdownOpen && dropdownRefs.destination.current && !dropdownRefs.destination.current.contains(event.target as Node)) {
        setIsDestinationDropdownOpen(false);
      }
    };
    if (isOriginDropdownOpen || isDestinationDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, [isOriginDropdownOpen, isDestinationDropdownOpen, dropdownRefs]);

  const seatSelectorCustomColors = React.useMemo(() => ({
    selected: 'bg-accent-kente-gold'
  }), []);

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-gray-100 to-blue-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl flex flex-col items-center max-w-xs mx-auto">
            <div className="relative mb-4">
              <div className="w-16 h-16 border-4 border-accent-kente-gold/30 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-accent-kente-gold border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-center font-medium mb-1 text-sm sm:text-base">
              {loadingStep === 2 ? 'Finding trips...' : loadingStep === 3 ? 'Preparing seats...' : loadingStep === 4 ? 'Saving details...' : loadingStep === 5 ? 'Processing payment...' : loadingStep === 6 ? 'Confirming booking...' : 'Loading...'}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-xs text-center">Just a moment...</p>
          </div>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-2 sm:py-3 flex items-center">
          <button 
            onClick={navigateBack}
            className="mr-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
            aria-label={step > 1 && step < 6 ? 'Go back' : 'Go home'}
          >
            {(step > 1 && step < 6) ? <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" /> : <Home className="h-5 w-5 sm:h-6 sm:w-6" />}
          </button>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
            {step === 1 ? 'Plan Your Trip' : step === 2 ? 'Select Your Ride' : step === 3 ? 'Choose Your Seat' : step === 4 ? 'Confirm Details' : step === 5 ? 'Secure Payment' : 'Booking Confirmed'}
          </h1>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 max-w-4xl w-full mx-auto px-2 sm:px-4 py-2 sm:py-3 flex flex-col">
          {step < 6 && (
            <div className={`flex justify-between mb-3 sm:mb-4 px-1 sm:px-2 overflow-x-auto ${noScrollbarClass}`}>
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="flex flex-col items-center min-w-[60px] sm:min-w-[70px] flex-1">
                  <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${step > s ? 'bg-accent-kente-gold-dark text-white border-accent-kente-gold-dark' : step === s ? 'bg-accent-kente-gold text-white ring-4 ring-accent-kente-gold/30 border-accent-kente-gold' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600'}`}>
                    {step > s ? <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <span className="text-xs sm:text-sm font-medium">{s}</span>}
                  </div>
                  <div className="mt-1.5 flex flex-col items-center">
                    <span className={`text-xs text-center whitespace-nowrap font-medium ${step === s ? 'text-accent-kente-gold dark:text-accent-kente-gold' : 'text-gray-600 dark:text-gray-400'}`}>
                      {s === 1 ? 'Route' : s === 2 ? 'Trip' : s === 3 ? 'Seat' : s === 4 ? 'Details' : 'Payment'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className={`flex-1 overflow-y-auto ${noScrollbarClass}`}>
            <div className="max-w-xl w-full mx-auto pb-4 sm:pb-6">
              {step === 1 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg sm:text-xl font-semibold mb-5 sm:mb-6 text-center text-gray-800 dark:text-white">Where are you traveling?</h2>
                  <div className="mb-4 sm:mb-5">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-accent-red" /> Starting Point
                    </label>
                    <div className="relative">
                      <div className="relative origin-dropdown-container" ref={dropdownRefs.origin}>
                        <button type="button" className="flex w-full justify-between items-center pl-3 pr-3 py-2.5 sm:pl-4 sm:pr-3 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700/80 text-gray-900 dark:text-white hover:border-accent-kente-gold focus:border-accent-kente-gold focus:ring-2 focus:ring-accent-kente-gold/20 focus:outline-none transition-all" onClick={(e) => { e.stopPropagation(); setIsOriginDropdownOpen(!isOriginDropdownOpen); }} aria-expanded={isOriginDropdownOpen} aria-haspopup="listbox">
                          <span className={origin ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>{origin || 'Select starting point'}</span>
                          <ChevronDown className={`h-4 w-4 flex-shrink-0 text-gray-500 dark:text-gray-400 ${isOriginDropdownOpen ? 'transform rotate-180' : ''}`} />
                        </button>
                        {isOriginDropdownOpen && (
                          <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-auto" onMouseDown={(e) => e.stopPropagation()}>
                            <div className="sticky top-0 bg-white dark:bg-gray-800 z-10">
                              <div className="flex items-center p-2.5 sm:p-3 border-b border-gray-200 dark:border-gray-700">
                                <Search className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                                <input type="text" placeholder="Search locations..." className="w-full bg-transparent border-none p-0 text-sm sm:text-base focus:ring-0 focus:outline-none" value={origin} onChange={(e) => setOrigin(e.target.value)} onClick={(e) => e.stopPropagation()} autoFocus />
                                {origin && <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-2 p-1 rounded-full" onClick={() => setOrigin('')}><X className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></button>}
                              </div>
                            </div>
                            {availableOrigins.length > 0 ? (
                              <ul role="listbox" className="py-1">
                                {availableOrigins.filter(org => org.toLowerCase().includes(origin.toLowerCase())).map((org, index) => (
                                  <li key={index} role="option" aria-selected={origin === org} className={`px-3 py-2 sm:px-4 sm:py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm sm:text-base flex items-center ${origin === org ? 'bg-gray-50 dark:bg-gray-700 font-medium' : ''}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOrigin(org); setIsOriginDropdownOpen(false); }}>
                                    <MapPin className="h-4 w-4 mr-2.5 text-accent-red opacity-70" /> {org}
                                  </li>
                                ))}
                              </ul>
                            ) : <div className="p-4 text-gray-500 dark:text-gray-400 text-center text-sm">No locations found</div>}
                            <div className="p-2 border-t border-gray-200 dark:border-gray-600">
                              <button className="w-full flex items-center justify-center text-accent-kente-gold hover:text-accent-kente-gold-dark text-sm sm:text-base p-2 rounded-md hover:bg-accent-kente-gold/10 transition-colors" onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigator.geolocation?.getCurrentPosition(() => { setOrigin("Current Location"); setIsOriginDropdownOpen(false); }, (error) => { console.error("Error getting location:", error); alert("Could not access your location. Please select manually."); }); }}>
                                <MapPin className="h-4 w-4 mr-2" /> Use Current Location
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 mb-5">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center">
                      <Clock className="h-3 w-3 mr-1" /> Popular starting points
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {popularOrigins.map((city, i) => (
                        <button key={i} className="px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm bg-gray-100 hover:bg-accent-kente-gold/20 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full text-gray-700 dark:text-gray-300 flex items-center transition-colors" onClick={() => { setOrigin(city); setIsOriginDropdownOpen(false); }}>
                          <MapPin className="h-3 w-3 mr-1 text-accent-red opacity-70" /> {city}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-5 sm:mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-accent-kente-gold" /> Destination
                    </label>
                    <div className="relative">
                      <div className="relative destination-dropdown-container" ref={dropdownRefs.destination}>
                        <button type="button" className="flex w-full justify-between items-center pl-3 pr-3 py-2.5 sm:pl-4 sm:pr-3 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700/80 text-gray-900 dark:text-white hover:border-accent-kente-gold focus:border-accent-kente-gold focus:ring-2 focus:ring-accent-kente-gold/20 focus:outline-none transition-all" onClick={(e) => { e.stopPropagation(); setIsDestinationDropdownOpen(!isDestinationDropdownOpen); }} aria-expanded={isDestinationDropdownOpen} aria-haspopup="listbox">
                          <span className={destination ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>{destination || 'Where would you like to go?'}</span>
                          <ChevronDown className={`h-4 w-4 flex-shrink-0 text-gray-500 dark:text-gray-400 ${isDestinationDropdownOpen ? 'transform rotate-180' : ''}`} />
                        </button>
                        {isDestinationDropdownOpen && (
                          <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-auto" onMouseDown={(e) => e.stopPropagation()}>
                            <div className="sticky top-0 bg-white dark:bg-gray-800 z-10">
                              <div className="flex items-center p-2.5 sm:p-3 border-b border-gray-200 dark:border-gray-700">
                                <Search className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                                <input type="text" placeholder="Search destinations..." className="w-full bg-transparent border-none p-0 text-sm sm:text-base focus:ring-0 focus:outline-none" value={destination} onChange={(e) => setDestination(e.target.value)} onClick={(e) => e.stopPropagation()} autoFocus />
                                {destination && <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-2 p-1 rounded-full" onClick={() => setDestination('')}><X className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></button>}
                              </div>
                            </div>
                            {availableDestinations.length > 0 ? (
                              <ul role="listbox" className="py-1">
                                {availableDestinations.filter(dest => dest.toLowerCase().includes(destination.toLowerCase())).map((dest, index) => (
                                  <li key={index} role="option" aria-selected={destination === dest} className={`px-3 py-2 sm:px-4 sm:py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm sm:text-base flex items-center ${destination === dest ? 'bg-gray-50 dark:bg-gray-700 font-medium' : ''}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDestination(dest); setIsDestinationDropdownOpen(false); }}>
                                    <MapPin className="h-4 w-4 mr-2.5 text-accent-kente-gold opacity-70" /> {dest}
                                  </li>
                                ))}
                              </ul>
                            ) : <div className="p-4 text-gray-500 dark:text-gray-400 text-center text-sm">No destinations found</div>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 mb-6 sm:mb-8">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center">
                      <Clock className="h-3 w-3 mr-1" /> Popular destinations
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {popularDestinations.map((city, i) => (
                        <button key={i} className="px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm bg-gray-100 hover:bg-accent-kente-gold/20 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full text-gray-700 dark:text-gray-300 flex items-center transition-colors" onClick={() => { setDestination(city); setIsDestinationDropdownOpen(false); }}>
                          <MapPin className="h-3 w-3 mr-1 text-accent-kente-gold opacity-70" /> {city}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={searchTrips} disabled={!origin || !destination || isSearching} className={`w-full rounded-lg py-3 sm:py-3.5 px-4 text-center text-white font-semibold text-base flex items-center justify-center transition-all duration-150 ${(origin && destination && !isSearching) ? 'bg-accent-kente-gold hover:bg-accent-kente-gold-dark active:scale-95 shadow-md hover:shadow-lg' : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-70'}`}>
                    {isSearching ? (<><div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2.5"></div>Searching...</>) : (<>Find Available Trips <ChevronRight className="ml-1.5 h-5 w-5" /></>)}
                  </button>
                </div>
              )}
              {step === 1 && (
                <div className="mt-6 sm:mt-8 p-4 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow border border-gray-200 dark:border-gray-700/50">
                  <div className="max-w-xl mx-auto">
                    <div className="text-center mb-3 sm:mb-4">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Why Book With Us?</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      {[{ icon: Shield, title: "Safe & Secure", desc: "Vetted drivers & payments" },{ icon: Clock, title: "Quick Booking", desc: "Book in minutes" },{ icon: CalendarCheck, title: "Flexible Travel", desc: "Many routes & times" }].map((item, i) => (
                        <div key={i} className="flex flex-col items-center p-2 sm:p-3 text-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/70 transition-colors">
                          <div className="p-2 bg-accent-kente-gold/10 text-accent-kente-gold rounded-full mb-1.5 sm:mb-2">
                            <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-xs sm:text-sm text-gray-800 dark:text-white mb-0.5">{item.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {step === 2 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4 md:p-5 border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-3 sm:mb-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">Select Your Trip</h2>
                    <button onClick={() => moveToNextStep(1)} className="text-xs sm:text-sm text-accent-kente-gold hover:underline">Change Route</button>
                  </div>
                  {availableTrips.length === 0 && !isSearching ? (
                    <div className="text-center py-10 sm:py-12">
                      <div className="bg-gray-100 dark:bg-gray-700/50 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <Search className="h-7 w-7 sm:h-8 sm:w-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm sm:text-base">No trips found for this route.</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Try adjusting your origin or destination.</p>
                      <button onClick={() => moveToNextStep(1)} className="px-4 py-2 text-sm bg-accent-kente-gold text-white rounded-lg hover:bg-accent-kente-gold-dark transition-colors">Try Another Route</button>
                    </div>
                  ) : (
                    <div className={`max-h-[calc(100vh-280px)] sm:max-h-[calc(100vh-300px)] md:max-h-[65vh] overflow-y-auto pr-1 ${noScrollbarClass}`}>
                      <div className="mb-3 p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-700/60 rounded-lg border border-gray-200 dark:border-gray-600 sticky top-0 z-10 backdrop-blur-sm">
                        <div className="flex items-center text-xs sm:text-sm">
                          <MapPin className="h-3.5 w-3.5 text-accent-red mr-1.5 flex-shrink-0" />
                          <span className="font-medium truncate" title={origin}>{origin}</span>
                          <ChevronRight className="h-4 w-4 mx-1 text-gray-400 flex-shrink-0" />
                          <MapPin className="h-3.5 w-3.5 text-accent-kente-gold mr-1.5 flex-shrink-0" />
                          <span className="font-medium truncate" title={destination}>{destination}</span>
                        </div>
                      </div>
                      <TripViewer trips={availableTrips.map(convertToViewerTrip)} onTripSelect={handleTripSelect} onTripBook={handleTripBook} showFilters={true} compact={window.innerWidth < 768} mapHeight="150px" isLoading={isSearching} className="space-y-3 sm:space-y-4" />
                    </div>
                  )}
                </div>
              )}
              {step === 3 && selectedTrip && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden p-3 sm:p-4 md:p-5">
                  <div className="mb-4 sm:mb-5">
                    <h2 className="text-lg sm:text-xl font-semibold mb-1 text-gray-800 dark:text-white">Choose Your Seat</h2>
                    <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center"><MapPin className="h-3.5 w-3.5 text-accent-red mr-1" /><span className="truncate" title={selectedTrip.fromLocation}>{selectedTrip.fromLocation}</span></div>
                      <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                      <div className="flex items-center"><MapPin className="h-3.5 w-3.5 text-accent-kente-gold mr-1" /><span className="truncate" title={selectedTrip.toLocation}>{selectedTrip.toLocation}</span></div>
                      <span className="hidden sm:inline mx-1">•</span>
                      <div className="flex items-center basis-full sm:basis-auto mt-0.5 sm:mt-0">
                        <Calendar className="h-3.5 w-3.5 mr-1" /><span>{new Date(selectedTrip.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        <span className="mx-1">•</span> <Clock className="h-3.5 w-3.5 mr-1" /> <span>{selectedTrip.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 mb-4 sm:mb-5 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center mb-2 sm:mb-3">
                      <Car className="h-4 w-4 sm:h-5 sm:w-5 text-accent-kente-gold mr-2" />
                      <h3 className="font-medium text-sm sm:text-base text-gray-800 dark:text-white">{selectedTrip.vehicle?.model || 'Vehicle'} ({selectedTrip.vehicle?.type || 'Standard'})</h3>
                    </div>
                    <SeatSelector 
                        initialSeats={availableSeats} 
                        onSeatSelect={handleSeatSelect} 
                        maxSelectableSeats={1} 
                        vehicleName={selectedTrip.vehicle?.model || 'Vehicle'} 
                        compact={initialCompact} 
                        hideLegend={initialHideLegend} 
                        hideHeader={true} 
                        customColors={seatSelectorCustomColors} 
                        className="w-full overflow-x-auto" 
                    />
                  </div>
                  {selectedSeat && (
                    <div className="p-3 sm:p-4 mb-4 sm:mb-5 bg-accent-kente-gold/10 border border-accent-kente-gold/30 rounded-lg">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <div className="flex items-center">
                          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${selectedSeat.type === 'vip' ? 'bg-purple-500' : selectedSeat.type === 'premium' ? 'bg-blue-500' : 'bg-accent-kente-gold'} text-white flex items-center justify-center font-medium text-xs sm:text-sm mr-2 sm:mr-3`}>{selectedSeat.number}</div>
                          <div>
                            <div className="font-medium text-sm sm:text-base text-gray-800 dark:text-white">{selectedSeat.type.charAt(0).toUpperCase() + selectedSeat.type.slice(1)} Seat</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Selected seat</div>
                          </div>
                        </div>
                        <div className="text-lg sm:text-xl font-bold text-accent-kente-gold text-right sm:text-left">${selectedSeat.price.toFixed(2)}</div>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row justify-between gap-3">
                    <button onClick={() => moveToNextStep(2)} className="px-4 py-2.5 sm:px-5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center text-sm sm:text-base order-2 sm:order-1 w-full sm:w-auto">
                      <ArrowLeft className="h-4 w-4 mr-2" /> Back to Trips
                    </button>
                    <button onClick={() => moveToNextStep(4)} disabled={!selectedSeat} className={`px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg flex items-center justify-center font-semibold text-sm sm:text-base order-1 sm:order-2 w-full sm:w-auto transition-all ${selectedSeat ? 'bg-accent-kente-gold hover:bg-accent-kente-gold-dark text-white shadow-md hover:shadow-lg active:scale-95' : 'bg-gray-400 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed opacity-70'}`}>
                      Continue <ChevronRight className="h-4 w-4 ml-2" />
                    </button>
                  </div>
                </div>
              )}
              {step === 4 && selectedTrip && selectedSeat && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-5 md:p-6 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-5 text-gray-800 dark:text-white">Passenger & Pickup</h2>
                  <div className="mb-4 sm:mb-5 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/60 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center mb-3">
                      <div className="h-7 w-7 sm:h-8 sm:h-8 bg-accent-kente-gold/10 text-accent-kente-gold rounded-full flex items-center justify-center mr-2.5 sm:mr-3 flex-shrink-0"><Info className="h-4 w-4" /></div>
                      <h3 className="font-medium text-sm sm:text-base text-gray-800 dark:text-white">Trip Summary</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 text-xs sm:text-sm">
                      {[{ label: "From", value: selectedTrip.fromLocation, icon: <MapPin className="h-4 w-4 text-accent-red mt-0.5" /> },{ label: "To", value: selectedTrip.toLocation, icon: <MapPin className="h-4 w-4 text-accent-kente-gold mt-0.5" /> },{ label: "Date & Time", value: `${new Date(selectedTrip.date).toLocaleDateString(undefined, {day: 'numeric', month: 'short', year: 'numeric'})} • ${selectedTrip.time}`, icon: <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5" /> },{ label: "Seat", value: `#${selectedSeat.number} (${selectedSeat.type.charAt(0).toUpperCase() + selectedSeat.type.slice(1)})`, icon: <User className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5" /> }].map(detail => (
                        <div className="flex items-start" key={detail.label}>
                          <div className="w-5 sm:w-6 flex-shrink-0">{detail.icon}</div>
                          <div>
                            <div className="text-gray-500 dark:text-gray-400">{detail.label}</div>
                            <div className="font-medium text-gray-800 dark:text-white text-sm sm:text-base break-words">{detail.value}</div>
                          </div>
                        </div>
                      ))}
                      <div className="col-span-1 md:col-span-2 mt-2 pt-3 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center">
                        <div className="text-gray-600 dark:text-gray-300 font-medium text-sm sm:text-base">Ticket Price:</div>
                        <div className="text-base sm:text-lg font-bold text-accent-kente-gold">${selectedSeat.price.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                  <div className="mb-4 sm:mb-5">
                    <label htmlFor="passengerName" className="block text-sm sm:text-base font-medium mb-1.5 text-gray-700 dark:text-gray-300 flex items-center">
                      <User className="h-4 w-4 mr-2 text-accent-kente-gold" /> Passenger Name <span className="text-accent-red ml-1">*</span>
                    </label>
                    <input id="passengerName" type="text" value={ticketHolders[0]?.name || ''} onChange={(e) => updateTicketHolderName(selectedSeat.id, e.target.value)} placeholder="Enter full name" className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700/80 focus:border-accent-kente-gold focus:ring-1 focus:ring-accent-kente-gold/30 outline-none transition-colors" required />
                    {!ticketHolders[0]?.name?.trim() && <p className="text-xs text-red-500 dark:text-red-400 mt-1">Passenger name is required.</p>}
                  </div>
                  {hotPoints.length > 0 && (
                    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/60 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center mb-2 sm:mb-3">
                        <input type="checkbox" id="hotpoint-toggle" checked={isHotpointNeeded} onChange={toggleHotpoint} className="mr-2.5 h-4 w-4 sm:h-4 sm:w-4 text-accent-kente-gold focus:ring-accent-kente-gold rounded border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700" />
                        <label htmlFor="hotpoint-toggle" className="font-medium text-sm sm:text-base text-gray-800 dark:text-white">Add doorstep pickup service?</label>
                      </div>
                      {isHotpointNeeded && (
                        <div className="mt-2.5 sm:mt-3 space-y-2">
                          <label htmlFor="pickupPointSelect" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Select Pickup Point</label>
                          <select id="pickupPointSelect" value={selectedHotpoint?.id || ''} onChange={(e) => { const hotpoint = hotPoints.find(hp => hp.id === e.target.value); selectHotpoint(hotpoint || null);}} className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700/80 focus:border-accent-kente-gold focus:ring-1 focus:ring-accent-kente-gold/30 outline-none transition-colors" required={isHotpointNeeded}>
                            <option value="">Select a pickup point...</option>
                            {hotPoints.map(hp => <option key={hp.id} value={hp.id}>{hp.name} (+${hp.fee.toFixed(2)})</option>)}
                          </select>
                          {selectedHotpoint && (
                            <div className="mt-2 p-2.5 bg-accent-kente-gold/10 rounded-md flex justify-between items-center text-sm">
                              <div className="flex items-center"><MapPin className="h-4 w-4 text-accent-kente-gold mr-2" /><span className="font-medium text-gray-700 dark:text-gray-200">{selectedHotpoint.name}</span></div>
                              <div className="font-medium text-accent-kente-gold">+${selectedHotpoint.fee.toFixed(2)}</div>
                            </div>
                          )}
                          {!selectedHotpoint && isHotpointNeeded && <p className="text-xs text-red-500 dark:text-red-400">Please select a pickup point.</p>}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row justify-between gap-3 mt-5 sm:mt-6">
                    <button onClick={() => moveToNextStep(3)} className="px-4 py-2.5 sm:px-5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center text-sm sm:text-base order-2 sm:order-1 w-full sm:w-auto">
                      <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </button>
                    <button onClick={() => { if (isHotpointNeeded && !selectedHotpoint) { alert("Please select a pickup point or uncheck the 'Add doorstep pickup service' option."); return; } if (!ticketHolders[0]?.name?.trim()) { alert("Please enter the passenger's name."); return; } completeBooking(); }} className="px-5 py-2.5 sm:px-6 sm:py-3 bg-accent-kente-gold hover:bg-accent-kente-gold-dark text-white rounded-lg transition-all flex items-center justify-center font-semibold text-sm sm:text-base order-1 sm:order-2 w-full sm:w-auto shadow-md hover:shadow-lg active:scale-95">
                      Continue to Payment <ChevronRight className="h-4 w-4 ml-2" />
                    </button>
                  </div>
                </div>
              )}
              {step === 5 && selectedTrip && selectedSeat && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-5 md:p-6 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-5 text-gray-800 dark:text-white">Complete Your Payment</h2>
                  <div className="mb-4 sm:mb-5 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/60 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200 dark:border-gray-500">
                      <div className="flex items-center">
                        <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center mr-2.5 sm:mr-3 flex-shrink-0"><CheckCircle className="h-4 w-4" /></div>
                        <div>
                          <div className="font-medium text-sm sm:text-base text-gray-800 dark:text-white">Trip Summary</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate" title={`${selectedTrip.fromLocation} to ${selectedTrip.toLocation}`}>{selectedTrip.fromLocation} → {selectedTrip.toLocation}</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 text-right">{new Date(selectedTrip.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} • {selectedTrip.time}</div>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Passenger:</span><span className="font-medium text-gray-800 dark:text-white">{ticketHolders[0]?.name || 'N/A'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Seat:</span><span className="font-medium text-gray-800 dark:text-white">#{selectedSeat.number} ({selectedSeat.type})</span></div>
                      {selectedHotpoint && <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Pickup Service:</span><span className="font-medium text-gray-800 dark:text-white">${selectedHotpoint.fee.toFixed(2)}</span></div>}
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-500">
                      <div className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white">Total Amount:</div>
                      <div className="text-lg sm:text-xl font-bold text-accent-kente-gold">${(selectedSeat.price + (selectedHotpoint?.fee || 0)).toFixed(2)}</div>
                    </div>
                  </div>
                  <PaymentForm onComplete={processPayment} amount={selectedSeat.price + (selectedHotpoint?.fee || 0)} isProcessing={isProcessingPayment} onCancel={() => moveToNextStep(4)} showProcessingIndicator={true} showTotalAmount={false} availableMethods={['airtel', 'momo', 'card']} className="border-0 p-0 shadow-none bg-transparent dark:bg-transparent" />
                </div>
              )}
              {step === 6 && bookingComplete && selectedTrip && selectedSeat && (
                <div className="overflow-y-auto">
                  <BookingConfirmation
                    bookingDetails={{
                      id: selectedTrip.id || '',
                      fromLocation: selectedTrip.fromLocation || '',
                      toLocation: selectedTrip.toLocation || '',
                      date: new Date(selectedTrip.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }),
                      time: selectedTrip.time || '',
                      passengerName: ticketHolders[0]?.name || 'Passenger',
                      seatNumber: selectedSeat.number,
                      seatType: selectedSeat.type.charAt(0).toUpperCase() + selectedSeat.type.slice(1),
                      paymentMethod: selectedPaymentMethod || 'Card',
                      totalAmount: selectedSeat.price + (selectedHotpoint?.fee || 0),
                      pickupPoint: selectedHotpoint?.name,
                      confirmationCode: generateConfirmationCode()
                    }}
                    onBookAnother={resetBooking}
                    onViewBookings={() => window.location.href = '/dashboard'}
                    className="w-full pb-4 sm:pb-6"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, ChevronRight, Shield, Clock, CalendarCheck, CheckCircle, ChevronDown, Calendar, Info, User, Home, ArrowLeft, Check, Search, X, Car, CreditCard, Plane, Users, Star, Zap } from 'lucide-react';
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
    selected: 'bg-primary'
  }), []);

  return (
    <div className="min-h-screen bg-light dark:bg-dark flex flex-col overflow-hidden">
      {isLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="card p-6 sm:p-8 flex flex-col items-center max-w-sm mx-auto">
            <div className="relative mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-primary/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 sm:w-20 sm:h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-black dark:text-white text-center font-semibold mb-2 text-base sm:text-lg">
              {loadingStep === 2 ? 'Finding trips...' : loadingStep === 3 ? 'Preparing seats...' : loadingStep === 4 ? 'Saving details...' : loadingStep === 5 ? 'Processing payment...' : loadingStep === 6 ? 'Confirming booking...' : 'Loading...'}
            </p>
            <p className="text-dark dark:text-light text-sm text-center">Just a moment...</p>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden pt-4 sm:pt-6 lg:pt-8">
        <div className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6 flex flex-col">
          {step < 6 && (
            <div className="mb-6 sm:mb-8 lg:mb-10">
              <div className={`flex justify-between px-2 sm:px-4 overflow-x-auto ${noScrollbarClass}`}>
                {[1, 2, 3, 4, 5].map((s, index) => (
                  <div key={s} className="flex flex-col items-center min-w-[70px] sm:min-w-[80px] lg:min-w-[90px] flex-1 relative">
                    {/* Connection line */}
                    {index < 4 && (
                      <div className={`absolute top-4 sm:top-5 left-1/2 w-full h-0.5 ${step > s ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'} transition-colors duration-300 hidden sm:block`} style={{ transform: 'translateX(50%)', zIndex: 0 }} />
                    )}
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center transition-all duration-500 border-2 relative z-10 ${step > s ? 'bg-primary text-black border-primary shadow-lg scale-110' : step === s ? 'bg-primary text-black ring-4 ring-primary/30 border-primary shadow-xl scale-110' : 'bg-white dark:bg-dark text-secondary border-secondary/20 dark:border-secondary/40 shadow-md hover:shadow-lg'}`}>
                      {step > s ? <Check className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" /> : <span className="text-sm sm:text-base lg:text-lg font-semibold">{s}</span>}
                    </div>
                    <div className="mt-2 sm:mt-3 flex flex-col items-center">
                      <span className={`text-xs sm:text-sm lg:text-base text-center whitespace-nowrap font-semibold transition-colors duration-300 ${step === s ? 'text-primary' : step > s ? 'text-primary' : 'text-secondary'}`}>
                        {s === 1 ? 'Route' : s === 2 ? 'Trip' : s === 3 ? 'Seat' : s === 4 ? 'Details' : 'Payment'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={`flex-1 overflow-y-auto ${noScrollbarClass}`}>
            <div className="max-w-2xl w-full mx-auto pb-6 sm:pb-8 lg:pb-10">
              {step === 1 && (
                <div className="card card-interactive p-6 sm:p-8 lg:p-10">
                  <div className="text-center mb-8 sm:mb-10">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-gradient-primary">Where are you traveling?</h2>
                    <p className="text-dark dark:text-light text-sm sm:text-base lg:text-lg">Choose your departure and destination points</p>
                  </div>
                  <div className="mb-6 sm:mb-8">
                    <label className="block text-base sm:text-lg font-semibold text-black dark:text-white mb-3 flex items-center">
                      <div className="icon-badge icon-badge-lg bg-accent/10 text-accent mr-3">
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      Starting Point
                    </label>
                    <div className="relative">
                      <div className="relative origin-dropdown-container" ref={dropdownRefs.origin}>
                        <button type="button" className="input-field flex w-full justify-between items-center pl-4 pr-4 py-4 sm:pl-6 sm:pr-4 sm:py-5 text-base sm:text-lg" onClick={(e) => { e.stopPropagation(); setIsOriginDropdownOpen(!isOriginDropdownOpen); }} aria-expanded={isOriginDropdownOpen} aria-haspopup="listbox">
                          <span className={`font-medium ${origin ? 'text-light-primary dark:text-dark-primary' : 'text-light-tertiary dark:text-dark-tertiary'}`}>{origin || 'Select starting point'}</span>
                          <ChevronDown className={`h-5 w-5 flex-shrink-0 text-light-tertiary dark:text-dark-tertiary transition-transform duration-300 ${isOriginDropdownOpen ? 'transform rotate-180' : ''}`} />
                        </button>
                        {isOriginDropdownOpen && (
                          <div className="absolute z-50 mt-2 w-full bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md border-2 border-light dark:border-dark rounded-xl shadow-2xl max-h-72 overflow-hidden" onMouseDown={(e) => e.stopPropagation()}>
                            <div className="sticky top-0 bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md z-10">
                              <div className="flex items-center p-4 border-b-2 border-light dark:border-dark">
                                <Search className="h-5 w-5 text-light-tertiary dark:text-dark-tertiary mr-3" />
                                <input type="text" placeholder="Search locations..." className="w-full bg-transparent border-none p-0 text-base sm:text-lg focus:ring-0 focus:outline-none font-medium text-light-primary dark:text-dark-primary placeholder-light-tertiary dark:placeholder-dark-tertiary" value={origin} onChange={(e) => setOrigin(e.target.value)} onClick={(e) => e.stopPropagation()} autoFocus />
                                {origin && <button className="text-light-tertiary hover:text-light-primary dark:hover:text-dark-primary ml-3 p-2 rounded-full hover:bg-light dark:hover:bg-dark transition-all duration-200" onClick={() => setOrigin('')}><X className="h-4 w-4 sm:h-5 sm:w-5" /></button>}
                              </div>
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                              {availableOrigins.length > 0 ? (
                                <ul role="listbox" className="py-2">
                                  {availableOrigins.filter(org => org.toLowerCase().includes(origin.toLowerCase())).map((org, index) => (
                                    <li key={index} role="option" aria-selected={origin === org} className={`px-4 py-3 sm:px-6 sm:py-4 hover:bg-primary/10 dark:hover:bg-primary/20 cursor-pointer text-base sm:text-lg flex items-center transition-all duration-200 border-b border-light/50 dark:border-dark/50 last:border-b-0 ${origin === org ? 'bg-primary/10 dark:bg-primary/20 font-semibold' : 'font-medium'}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOrigin(org); setIsOriginDropdownOpen(false); }}>
                                      <div className="icon-badge icon-badge-sm bg-accent/10 text-accent mr-3">
                                        <MapPin className="h-4 w-4" />
                                      </div>
                                      {org}
                                    </li>
                                  ))}
                                </ul>
                              ) : <div className="p-6 text-gray-500 dark:text-gray-400 text-center text-base">No locations found</div>}
                            </div>
                            <div className="p-4 border-t-2 border-light dark:border-dark bg-light/50 dark:bg-dark/50">
                              <button className="w-full flex items-center justify-center text-primary hover:text-primary-dark text-base sm:text-lg p-3 rounded-lg hover:bg-primary/10 transition-all duration-200 font-semibold" onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigator.geolocation?.getCurrentPosition(() => { setOrigin("Current Location"); setIsOriginDropdownOpen(false); }, (error) => { console.error("Error getting location:", error); alert("Could not access your location. Please select manually."); }); }}>
                                <div className="icon-badge icon-badge-sm bg-primary/10 text-primary mr-3">
                                  <MapPin className="h-4 w-4" />
                                </div>
                                Use Current Location
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 mb-8">
                    <div className="text-sm sm:text-base text-light-secondary dark:text-dark-secondary mb-4 flex items-center font-medium">
                      <div className="icon-badge icon-badge-sm bg-primary/10 text-primary mr-2">
                        <Clock className="h-3 w-3" />
                      </div>
                      Popular starting points
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {popularOrigins.map((city, i) => (
                        <button key={i} className="px-4 py-2 sm:px-5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-light to-surface-light hover:from-primary/10 hover:to-primary/20 dark:from-dark dark:to-surface-dark dark:hover:from-primary/10 dark:hover:to-primary/20 rounded-xl text-light-primary dark:text-dark-primary flex items-center transition-all duration-300 shadow-sm hover:shadow-md border border-light dark:border-dark font-medium" onClick={() => { setOrigin(city); setIsOriginDropdownOpen(false); }}>
                          <div className="icon-badge icon-badge-xs bg-accent/10 text-accent mr-2">
                            <MapPin className="h-3 w-3" />
                          </div>
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-6 sm:mb-8">
                    <label className="block text-base sm:text-lg font-semibold text-light-primary dark:text-dark-primary mb-3 flex items-center">
                      <div className="icon-badge icon-badge-lg bg-primary/10 text-primary mr-3">
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      Destination
                    </label>
                    <div className="relative">
                      <div className="relative destination-dropdown-container" ref={dropdownRefs.destination}>
                        <button type="button" className="input-field flex w-full justify-between items-center pl-4 pr-4 py-4 sm:pl-6 sm:pr-4 sm:py-5 text-base sm:text-lg" onClick={(e) => { e.stopPropagation(); setIsDestinationDropdownOpen(!isDestinationDropdownOpen); }} aria-expanded={isDestinationDropdownOpen} aria-haspopup="listbox">
                          <span className={`font-medium ${destination ? 'text-light-primary dark:text-dark-primary' : 'text-light-tertiary dark:text-dark-tertiary'}`}>{destination || 'Where would you like to go?'}</span>
                          <ChevronDown className={`h-5 w-5 flex-shrink-0 text-light-tertiary dark:text-dark-tertiary transition-transform duration-300 ${isDestinationDropdownOpen ? 'transform rotate-180' : ''}`} />
                        </button>
                        {isDestinationDropdownOpen && (
                          <div className="absolute z-50 mt-2 w-full bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md border-2 border-light dark:border-dark rounded-xl shadow-2xl max-h-60 overflow-auto" onMouseDown={(e) => e.stopPropagation()}>
                            <div className="sticky top-0 bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md z-10">
                              <div className="flex items-center p-3 border-b-2 border-light dark:border-dark">
                                <Search className="h-4 w-4 text-light-tertiary dark:text-dark-tertiary mr-3" />
                                <input type="text" placeholder="Search destinations..." className="w-full bg-transparent border-none p-0 text-sm sm:text-base focus:ring-0 focus:outline-none text-light-primary dark:text-dark-primary placeholder-light-tertiary dark:placeholder-dark-tertiary" value={destination} onChange={(e) => setDestination(e.target.value)} onClick={(e) => e.stopPropagation()} autoFocus />
                                {destination && <button className="text-light-tertiary hover:text-light-primary dark:hover:text-dark-primary ml-2 p-2 rounded-full hover:bg-light dark:hover:bg-dark transition-all duration-200" onClick={() => setDestination('')}><X className="h-4 w-4" /></button>}
                              </div>
                            </div>
                            {availableDestinations.length > 0 ? (
                              <ul role="listbox" className="py-2">
                                {availableDestinations.filter(dest => dest.toLowerCase().includes(destination.toLowerCase())).map((dest, index) => (
                                  <li key={index} role="option" aria-selected={destination === dest} className={`px-4 py-3 hover:bg-primary-700/10 dark:hover:bg-primary-700/20 cursor-pointer text-sm sm:text-base flex items-center transition-all duration-200 border-b border-border-light/50 dark:border-border-dark/50 last:border-b-0 ${destination === dest ? 'bg-primary-700/10 dark:bg-primary-700/20 font-medium' : ''}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDestination(dest); setIsDestinationDropdownOpen(false); }}>
                                    <div className="icon-badge icon-badge-xs bg-primary-700/10 text-primary-700 mr-3">
                                      <MapPin className="h-3 w-3" />
                                    </div>
                                    {dest}
                                  </li>
                                ))}
                              </ul>
                            ) : <div className="p-4 text-text-light-tertiary dark:text-text-dark-tertiary text-center text-sm">No destinations found</div>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 mb-6 sm:mb-8">
                    <div className="text-xs text-text-light-tertiary dark:text-text-dark-tertiary mb-2 flex items-center">
                      <div className="icon-badge icon-badge-xs bg-primary-700/10 text-primary-700 mr-2">
                        <Clock className="h-3 w-3" />
                      </div>
                      Popular destinations
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {popularDestinations.map((city, i) => (
                        <button key={i} className="px-3 py-1.5 text-xs sm:text-sm bg-background-light hover:bg-primary-700/20 dark:bg-background-dark dark:hover:bg-primary-700/30 rounded-full text-text-light-secondary dark:text-text-dark-secondary hover:text-text-light-primary dark:hover:text-text-dark-primary flex items-center transition-all duration-300 border border-border-light dark:border-border-dark" onClick={() => { setDestination(city); setIsDestinationDropdownOpen(false); }}>
                          <div className="icon-badge icon-badge-xs bg-primary-700/10 text-primary-700 mr-1">
                            <MapPin className="h-3 w-3" />
                          </div>
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={searchTrips}
                    disabled={!origin || !destination || isSearching}
                    className={`w-full btn btn-accent flex items-center py-3 px-4 justify-center ${origin && destination && !isSearching ? '' : 'opacity-70 cursor-not-allowed'}`}
                  >
                    {isSearching ? (
                      <>
                        <div className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4 mr-2"></div>
                        Searching... </>) : (<>
                          Find Available Trips <ChevronRight className="ml-2" /> </>)}
                  </button>
                </div>
              )}
              {step === 1 && (
                <div className="mt-6 sm:mt-8 p-4 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow border border-gray-200 dark:border-gray-700/50">
                  <div className="max-w-xl mx-auto">
                    <div className="text-center mb-3 sm:mb-4">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Why Book With Us?</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      {[{ icon: Shield, title: "Safe & Secure", desc: "Vetted drivers & payments" }, { icon: Clock, title: "Quick Booking", desc: "Book in minutes" }, { icon: CalendarCheck, title: "Flexible Travel", desc: "Many routes & times" }].map((item, i) => (
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
                <div className="card p-3 sm:p-4 md:p-5">
                  <div className="flex justify-between items-center mb-3 sm:mb-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Select Your Trip</h2>
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
                <div className="card overflow-hidden p-3 sm:p-4 md:p-5">
                  <div className="mb-4 sm:mb-5">
                    <h2 className="text-lg sm:text-xl font-semibold mb-1 text-gray-900 dark:text-white">Choose Your Seat</h2>
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
                    <div className="p-3 sm:p-4 mb-4 sm:mb-5 bg-primary-100 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-lg">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <div className="flex items-center">
                          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${selectedSeat.type === 'vip' ? 'bg-darkBlue-600' : selectedSeat.type === 'premium' ? 'bg-darkBlue-500' : 'bg-primary-600'} text-white flex items-center justify-center font-medium text-xs sm:text-sm mr-2 sm:mr-3`}>{selectedSeat.number}</div>
                          <div>
                            <div className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">{selectedSeat.type.charAt(0).toUpperCase() + selectedSeat.type.slice(1)} Seat</div>
                            <div className="text-xs text-gray-600 dark:text-gray-300">Selected seat</div>
                          </div>
                        </div>
                        <div className="text-lg sm:text-xl font-bold text-primary-600 dark:text-primary-400 text-right sm:text-left">${selectedSeat.price.toFixed(2)}</div>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row justify-between gap-3">
                    <button onClick={() => moveToNextStep(2)} className="px-4 py-2.5 sm:px-5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center text-sm sm:text-base order-2 sm:order-1 w-full sm:w-auto">
                      <ArrowLeft className="h-4 w-4 mr-2" /> Back to Trips
                    </button>
                    <button onClick={() => moveToNextStep(4)} disabled={!selectedSeat} className={`btn btn-accent flex items-center py-3 px-4 justify-center ${(selectedSeat) ? '' : 'opacity-70 cursor-not-allowed'}`}>
                      Continue <ChevronRight className="h-4 w-4 ml-2" />
                    </button>
                  </div>
                </div>
              )}
              {step === 4 && selectedTrip && selectedSeat && (
                <div className="card p-4 sm:p-5 md:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-5 text-gray-800 dark:text-white">Passenger & Pickup</h2>
                  <div className="mb-4 sm:mb-5 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/60 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center mb-3">
                      <div className="icon-badge icon-badge-md bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 mr-2.5 sm:mr-3 flex-shrink-0"><Info className="h-4 w-4" /></div>
                      <h3 className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">Trip Summary</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 text-xs sm:text-sm">
                      {[{ label: "From", value: selectedTrip.fromLocation, icon: <MapPin className="h-4 w-4 text-accent-red mt-0.5" /> }, { label: "To", value: selectedTrip.toLocation, icon: <MapPin className="h-4 w-4 text-accent-kente-gold mt-0.5" /> }, { label: "Date & Time", value: `${new Date(selectedTrip.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })} • ${selectedTrip.time}`, icon: <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5" /> }, { label: "Seat", value: `#${selectedSeat.number} (${selectedSeat.type.charAt(0).toUpperCase() + selectedSeat.type.slice(1)})`, icon: <User className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5" /> }].map(detail => (
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
                        <div className="text-base sm:text-lg font-bold text-primary-600 dark:text-primary-400">${selectedSeat.price.toFixed(2)}</div>
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
                        <input type="checkbox" id="hotpoint-toggle" checked={isHotpointNeeded} onChange={toggleHotpoint} className="mr-2.5 h-4 w-4 sm:h-4 sm:w-4 text-primary-600 focus:ring-primary-500 rounded border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700" />
                        <label htmlFor="hotpoint-toggle" className="font-medium text-sm sm:text-base text-gray-800 dark:text-white">Add doorstep pickup service?</label>
                      </div>
                      {isHotpointNeeded && (
                        <div className="mt-2.5 sm:mt-3 space-y-2">
                          <label htmlFor="pickupPointSelect" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Select Pickup Point</label>
                          <select id="pickupPointSelect" value={selectedHotpoint?.id || ''} onChange={(e) => { const hotpoint = hotPoints.find(hp => hp.id === e.target.value); selectHotpoint(hotpoint || null); }} className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700/80 focus:border-accent-kente-gold focus:ring-1 focus:ring-accent-kente-gold/30 outline-none transition-colors" required={isHotpointNeeded}>
                            <option value="">Select a pickup point...</option>
                            {hotPoints.map(hp => <option key={hp.id} value={hp.id}>{hp.name} (+${hp.fee.toFixed(2)})</option>)}
                          </select>
                          {selectedHotpoint && (
                            <div className="mt-2 p-2.5 bg-primary-100 dark:bg-primary-900/30 rounded-md flex justify-between items-center text-sm">
                              <div className="flex items-center"><MapPin className="h-4 w-4 text-primary-600 dark:text-primary-400 mr-2" /><span className="font-medium text-gray-900 dark:text-white">{selectedHotpoint.name}</span></div>
                              <div className="font-medium text-primary-600 dark:text-primary-400">+${selectedHotpoint.fee.toFixed(2)}</div>
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
                    <button onClick={() => { if (isHotpointNeeded && !selectedHotpoint) { alert("Please select a pickup point or uncheck the 'Add doorstep pickup service' option."); return; } if (!ticketHolders[0]?.name?.trim()) { alert("Please enter the passenger's name."); return; } completeBooking(); }} className="btn btn-accent py-3 px-4 flex items-center justify-center order-1 sm:order-2 w-full sm:w-auto">
                      Continue to Payment <ChevronRight className="h-4 w-4 ml-2" />
                    </button>
                  </div>
                </div>
              )}
              {step === 5 && selectedTrip && selectedSeat && (
                <div className="card p-4 sm:p-5 md:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-5 text-gray-800 dark:text-white">Complete Your Payment</h2>
                  <div className="mb-4 sm:mb-5 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/60 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200 dark:border-gray-500">
                      <div className="flex items-center icon-badge icon-badge-md bg-success-light text-success dark:bg-success-dark dark:text-success-light mr-2.5 sm:mr-3 flex-shrink-0">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">Trip Summary</div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 truncate" title={`${selectedTrip.fromLocation} to ${selectedTrip.toLocation}`}>{selectedTrip.fromLocation} → {selectedTrip.toLocation}</div>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Passenger:</span><span className="font-medium text-gray-800 dark:text-white">{ticketHolders[0]?.name || 'N/A'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Seat:</span><span className="font-medium text-gray-800 dark:text-white">#{selectedSeat.number} ({selectedSeat.type})</span></div>
                      {selectedHotpoint && <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Pickup Service:</span><span className="font-medium text-gray-800 dark:text-white">${selectedHotpoint.fee.toFixed(2)}</span></div>}
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-500">
                      <div className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white">Total Amount:</div>
                      <div className="text-lg sm:text-xl font-bold text-primary-600 dark:text-primary-400">${(selectedSeat.price + (selectedHotpoint?.fee || 0)).toFixed(2)}</div>
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
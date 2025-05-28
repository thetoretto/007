import React, { useState, useEffect } from 'react';
import { MapPin, ChevronRight, Shield, Clock, CalendarCheck, CheckCircle, ChevronDown, Calendar, Info, User, Home, ArrowLeft, Check, Search, X, Car, CreditCard } from 'lucide-react';
import SeatSelector from '../../components/common/SeatSelector';
import TripViewer, { Trip as ViewerTrip } from '../../components/common/TripViewer';
import PaymentForm from '../../components/common/PaymentForm';
// Import PaymentMethod as a specific named import
import type { PaymentMethod as FormPaymentMethod } from '../../components/common/PaymentForm';
import { useBookingStore } from '../../store/bookingStore';
import useTripStore, { Trip } from '../../store/tripStore';
import useHotPointStore, { HotPoint as BaseHotPoint } from '../../store/hotPointStore';
import { mockRoutes, mockVehicles, mockTimeSlots } from '../../utils/mockData';
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

// Define our own type alias using the imported type
type BookingPaymentMethod = FormPaymentMethod;

interface TicketHolder {
  seatId: string;
  name: string;
}

// Extended HotPoint interface with fee property
interface ExtendedHotPoint extends BaseHotPoint {
  fee: number;
}

const BookingPage: React.FC = () => {
  // Booking process state
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
  
  // Payment and user info state
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<BookingPaymentMethod>(null);
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
  const tripStore = useTripStore();
  const { hotPoints: baseHotPoints, fetchHotPoints } = useHotPointStore();

  // Transform hotPoints to include fee property
  const [hotPoints, setHotPoints] = useState<ExtendedHotPoint[]>([]);

  // Update hotPoints when baseHotPoints changes
  useEffect(() => {
    // Add a fee property to each hotpoint
    const extendedHotPoints = baseHotPoints.map(hp => ({
      ...hp,
      fee: 5.00 // Default fee for each hotpoint
    }));
    setHotPoints(extendedHotPoints);
  }, [baseHotPoints]);

  // Fetch trips on component mount
  useEffect(() => {
    tripStore.fetchTrips();
  }, []);

  // Popular destinations data
  const popularOrigins = availableOrigins.slice(0, 5);
  const popularDestinations = availableDestinations.slice(0, 5);

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
  
  // Add loading states and transition animations for a smoother experience
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<number | null>(null);

  // Update the navigation to show loading state
  const moveToNextStep = (nextStep: number) => {
    setLoadingStep(nextStep);
    setIsLoading(true);
    
    // Simulate loading time for a smoother transition
    setTimeout(() => {
      setStep(nextStep);
      setIsLoading(false);
      setLoadingStep(null);
      
      // Scroll to top when changing steps on mobile
      if (window.innerWidth < 768) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 500);
  };

  // Update search trips function to use the loading state
  const searchTrips = () => {
    if (origin && destination) {
      setIsSearching(true);
      
      // Get available trips from bookingStore
      const trips = getAvailableTripsForBooking({
        originName: origin,
        destinationName: destination
      });

      // If no trips are found through the store, create some mock trips
      let tripsToUse = trips;
      
      if (trips.length === 0) {
        // Find the matching route
        const matchedRoute = mockRoutes.find(route => 
          route.origin.name.toLowerCase() === origin.toLowerCase() && 
          route.destination.name.toLowerCase() === destination.toLowerCase()
        );

        if (matchedRoute) {
          const vehicle = mockVehicles[0]; // Use first vehicle as default
          
          // Create some mock time slots if none exist
          tripsToUse = Array(3).fill(0).map((_, idx) => {
            const hours = 8 + idx * 2; // 8am, 10am, 12pm
            const time = `${hours.toString().padStart(2, '0')}:00`;
            
            return {
              id: `generated-trip-${idx}`,
              driverId: '3', // Example driver ID
              date: new Date().toISOString().split('T')[0], // Today
              time,
              fromLocation: matchedRoute.origin.name,
              toLocation: matchedRoute.destination.name,
              routeId: matchedRoute.id,
              vehicleId: vehicle.id,
              status: 'scheduled' as any,
              availableSeats: 15 - idx * 3, // Decrease available seats for later trips
              price: 25 + idx * 2.5, // Increase price for later trips
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
  
  // Update selectTrip to use loading state
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
      
      // Add passenger seats with more variety
      for (let i = 0; i < trip.vehicle.capacity; i++) {
        const row = Math.floor(i / seatsPerRow);
        let col = i % seatsPerRow;
        
        // Add aisle gap
        if (col >= 2) col += 1;
        
        // Determine seat type with more logic for better distribution
        let seatType: 'standard' | 'premium' | 'vip' | 'accessible' = 'standard';
        
        // First row after driver is premium
        if (row === 1) {
          seatType = 'premium';
        } 
        // Last row has some accessible seats
        else if (row === numRows - 1 && (col === 0 || col === seatsPerRow + 1)) {
          seatType = 'accessible';
        }
        // Some VIP seats in the middle
        else if (row > 1 && row < numRows - 1 && i % 7 === 0) {
          seatType = 'vip';
        }
        
        seats.push({
          id: `${trip.vehicle.id}-s${i+1}`,
          number: `${i+1}`,
          price: (trip.price || 10) * (seatType === 'standard' ? 1 : 
                              seatType === 'premium' ? 1.25 : 
                              seatType === 'vip' ? 1.5 : 0.9),
          type: seatType,
          status: Math.random() > 0.2 ? 'available' : 'booked',
          position: { row: row + 1, col }
        });
      }
      
      setAvailableSeats(seats);
    }
    
    moveToNextStep(3);
  };
  
  // Update the converter function with proper typing
  const convertToViewerTrip = (storeTrip: Trip): ViewerTrip => {
    return {
      id: storeTrip.id,
      fromLocation: storeTrip.fromLocation || '',
      toLocation: storeTrip.toLocation || '',
      date: storeTrip.date,
      time: storeTrip.time,
      price: storeTrip.price || 0,
      status: storeTrip.status,
      driver: {
        id: storeTrip.driverId,
        name: "Driver",
        rating: 4.8
      },
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
      startCoords: {
        latitude: storeTrip.route?.origin.latitude || 0,
        longitude: storeTrip.route?.origin.longitude || 0
      },
      endCoords: {
        latitude: storeTrip.route?.destination.latitude || 0,
        longitude: storeTrip.route?.destination.longitude || 0
      }
    };
  };

  // Update the handler functions with ViewerTrip type
  const handleTripSelect = (viewerTrip: ViewerTrip) => {
    // Find the original store trip that matches this viewer trip
    const storeTrip = availableTrips.find(t => t.id === viewerTrip.id);
    if (storeTrip) {
      setSelectedTrip(storeTrip);
    }
  };

  const handleTripBook = (viewerTrip: ViewerTrip) => {
    // Find the original store trip that matches this viewer trip
    const storeTrip = availableTrips.find(t => t.id === viewerTrip.id);
    if (storeTrip) {
      selectTrip(storeTrip);
    }
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
  
  const selectHotpoint = (hotpoint: ExtendedHotPoint) => {
    setSelectedHotpoint(hotpoint);
  };
  
  // Step 5: Handle payment method selection
  const selectPaymentMethod = (method: BookingPaymentMethod) => {
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
  
  // Update completeBooking to use loading state
  const completeBooking = () => {
    moveToNextStep(5); // Go to payment step
  };
  
  // Update processPayment with improved loading state
  const processPayment = (paymentData: {
    method: FormPaymentMethod;
    details: any;
  }) => {
    setSelectedPaymentMethod(paymentData.method);
    setIsProcessingPayment(true);
    
    // Simulate payment processing with a realistic delay
    setTimeout(() => {
      setIsProcessingPayment(false);
      setBookingComplete(true);
      moveToNextStep(6); // Move to confirmation
    }, 1500);
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

  // Update the navigateBack function
  const navigateBack = () => {
    if (step > 1) {
      moveToNextStep(step - 1);
    } else {
      window.location.href = '/'; // Go to homepage
    }
  };

  // Add CSS class for mobile optimization
  const noScrollbarClass = "scrollbar-hide";

  // Remove animation styles from the component
  useEffect(() => {
    // Add the CSS for hiding scrollbars and improving touch response
    const style = document.createElement('style');
    style.innerHTML = `
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .touch-action-manipulation {
        touch-action: manipulation;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Add swipe navigation for mobile
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    };
    
    const handleSwipe = () => {
      // Right swipe (go back)
      if (touchEndX - touchStartX > 100 && step > 1) {
        navigateBack();
      }
      // Left swipe (go forward if possible)
      if (touchStartX - touchEndX > 100) {
        if (step === 1 && origin && destination) {
          searchTrips();
        } else if (step === 2 && selectedTrip) {
          moveToNextStep(3);
        } else if (step === 3 && selectedSeat) {
          moveToNextStep(4);
        } else if (step === 4) {
          completeBooking();
        }
      }
    };
    
    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchend', handleTouchEnd, false);
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [step, origin, destination, selectedTrip, selectedSeat]);

  // Fix the remaining linter errors by using a completely different approach
  const [dropdownRefs] = useState({
    origin: React.createRef<HTMLDivElement>(),
    destination: React.createRef<HTMLDivElement>()
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Safe approach that avoids TypeScript errors with event.target
      const originElement = dropdownRefs.origin.current;
      const destinationElement = dropdownRefs.destination.current;
      
      // Check if the click is outside the origin dropdown
      if (isOriginDropdownOpen && originElement && !originElement.contains(event.target as Node)) {
        setIsOriginDropdownOpen(false);
      }
      
      // Check if the click is outside the destination dropdown
      if (isDestinationDropdownOpen && destinationElement && !destinationElement.contains(event.target as Node)) {
        setIsDestinationDropdownOpen(false);
      }
    };

    // Only add the listener when dropdowns are open
    if (isOriginDropdownOpen || isDestinationDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOriginDropdownOpen, isDestinationDropdownOpen, dropdownRefs]);

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Loading indicator */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl flex flex-col items-center max-w-xs mx-auto">
            <div className="relative mb-4">
              <div className="w-16 h-16 border-4 border-accent-kente-gold/30 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-accent-kente-gold border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-center font-medium mb-1">
              {loadingStep === 2 ? 'Finding the best trips for you...' :
               loadingStep === 3 ? 'Preparing comfortable seats...' :
               loadingStep === 4 ? 'Saving your journey details...' :
               loadingStep === 5 ? 'Setting up secure payment...' :
               loadingStep === 6 ? 'Confirming your booking...' :
               'Loading...'}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center">This will just take a moment</p>
          </div>
        </div>
      )}
      
      {/* App-like header with back/home button */}
      <div className="bg-gradient-to-r from-accent-kente-gold-dark to-accent-kente-gold text-black sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
          <button 
            onClick={navigateBack}
            className="mr-3 p-2 rounded-full hover:bg-black/10 transition-colors"
            aria-label={step > 1 ? 'Go back' : 'Go home'}
          >
            {step > 1 ? <ArrowLeft className="h-6 w-6" /> : <Home className="h-6 w-6" />}
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">Book Your Journey</h1>
        </div>
      </div>
      
      {/* Main content with fixed height and scroll */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Booking Process Container - full height with scroll */}
        <div className="flex-1 max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex flex-col">
          {/* Progress Indicator - evenly spaced - updated for 5 steps */}
          <div className={`flex justify-between mb-4 sm:mb-6 px-1 sm:px-2 overflow-x-auto ${noScrollbarClass}`}>
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex flex-col items-center min-w-[50px] sm:min-w-[60px]">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300
                  ${step > s ? 'bg-accent-kente-gold-dark text-white' : 
                    step === s ? 'bg-accent-kente-gold text-white ring-4 ring-accent-kente-gold/30' : 
                    'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                  {step > s ? (
                    <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <span>{s}</span>
                  )}
                </div>
                <div className="mt-1 flex flex-col items-center">
                  <span className="text-xs font-medium text-center whitespace-nowrap">
                    {s === 1 ? 'Route' : 
                     s === 2 ? 'Trip' : 
                     s === 3 ? 'Seat' : 
                     s === 4 ? 'Details' : 
                     'Payment'}
                  </span>
                  {step === s && (
                    <div className="h-1 w-6 sm:w-8 bg-accent-kente-gold rounded-full mt-1"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Content container with overflow scroll */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-xl mx-auto pb-4">
              {/* Step 1: Route Selection */}
              {step === 1 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-center sm:text-left">Where would you like to travel?</h2>
                  
                  {/* Origin Input */}
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 flex items-center">
                      <div className="w-3 h-3 rounded-full bg-accent-red mr-2"></div>
                      Starting Point
                    </label>
                    <div className="relative">
                      <div className="relative origin-dropdown-container" ref={dropdownRefs.origin}>
                        <button
                          type="button"
                          className="flex w-full justify-between items-center pl-3 sm:pl-4 pr-3 sm:pr-4 py-3 sm:py-4 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-accent-kente-gold focus:border-accent-kente-gold focus:ring-2 focus:ring-accent-kente-gold/20 focus:outline-none transition-all"
                          onClick={(e) => {
                            e.stopPropagation(); // Stop event from propagating
                            setIsOriginDropdownOpen(!isOriginDropdownOpen);
                          }}
                          aria-expanded={isOriginDropdownOpen}
                          aria-haspopup="listbox"
                        >
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-accent-red" />
                            <span className={origin ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
                              {origin || 'Select your starting point'}
                            </span>
                          </div>
                          <ChevronDown className={`h-4 w-4 flex-shrink-0 ${isOriginDropdownOpen ? 'transform rotate-180' : ''}`} />
                        </button>
                        
                        {/* Origin dropdown with a separate mouseDown handler */}
                        {isOriginDropdownOpen && (
                          <div 
                            className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-auto"
                            onMouseDown={(e) => e.stopPropagation()} // Critical: prevent mouseDown from closing dropdown
                          >
                            <div className="sticky top-0 bg-white dark:bg-gray-800 z-10">
                              <div className="flex items-center p-3 border-b border-gray-200 dark:border-gray-700">
                                <Search className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                                <input
                                  type="text"
                                  placeholder="Search locations..."
                                  className="w-full bg-transparent border-none p-0 text-base focus:ring-0 focus:outline-none"
                                  value={origin}
                                  onChange={(e) => setOrigin(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  autoFocus
                                />
                                {origin && (
                                  <button 
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                    onClick={() => setOrigin('')}
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            {availableOrigins.length > 0 ? (
                              <ul role="listbox" className="py-2">
                                {availableOrigins
                                  .filter(org => org.toLowerCase().includes(origin.toLowerCase()))
                                  .map((org, index) => (
                                    <li 
                                      key={index}
                                      role="option"
                                      aria-selected={origin === org}
                                      className={`px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-base flex items-center ${origin === org ? 'bg-gray-50 dark:bg-gray-700' : ''}`}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setOrigin(org);
                                        setIsOriginDropdownOpen(false);
                                      }}
                                    >
                                      <MapPin className="h-4 w-4 mr-3 text-accent-red" />
                                      {org}
                                    </li>
                                  ))}
                              </ul>
                            ) : (
                              <div className="p-4 text-gray-500 text-center">No locations found</div>
                            )}
                            
                            <div className="p-3 border-t border-gray-300 dark:border-gray-600">
                              <button 
                                className="w-full flex items-center justify-center text-accent-kente-gold hover:text-accent-kente-gold-dark text-base p-2 rounded-lg hover:bg-accent-kente-gold/10"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  navigator.geolocation?.getCurrentPosition(
                                    () => {
                                      setOrigin("Current Location");
                                      setIsOriginDropdownOpen(false);
                                    },
                                    (error) => {
                                      console.error("Error getting location:", error);
                                      alert("Could not access your location. Please select manually.");
                                    }
                                  );
                                }}
                              >
                                <MapPin className="h-4 w-4 mr-2" /> Use Current Location
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Popular Origins */}
                  <div className="mt-2 mb-6">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center">
                      <Clock className="h-3 w-3 mr-1" /> Popular starting points
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {popularOrigins.slice(0, 5).map((city, i) => (
                        <button 
                          key={i} 
                          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-accent-kente-gold/20 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full text-gray-700 dark:text-gray-300 flex items-center"
                          onClick={() => {
                            setOrigin(city);
                            setIsOriginDropdownOpen(false);
                          }}
                        >
                          <MapPin className="h-3 w-3 mr-1 text-accent-red" />
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Destination Input - MOVED INSIDE step 1 container */}
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 flex items-center">
                      <div className="w-3 h-3 rounded-full bg-accent-kente-gold mr-2"></div>
                      Destination
                    </label>
                    <div className="relative">
                      <div className="relative destination-dropdown-container" ref={dropdownRefs.destination}>
                        <button
                          type="button"
                          className="flex w-full justify-between items-center pl-3 sm:pl-4 pr-3 sm:pr-4 py-3 sm:py-4 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-accent-kente-gold focus:border-accent-kente-gold focus:ring-2 focus:ring-accent-kente-gold/20 focus:outline-none transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsDestinationDropdownOpen(!isDestinationDropdownOpen);
                          }}
                          aria-expanded={isDestinationDropdownOpen}
                          aria-haspopup="listbox"
                        >
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-accent-kente-gold" />
                            <span className={destination ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
                              {destination || 'Where would you like to go?'}
                            </span>
                          </div>
                          <ChevronDown className={`h-4 w-4 flex-shrink-0 ${isDestinationDropdownOpen ? 'transform rotate-180' : ''}`} />
                        </button>
                        
                        {/* Destination dropdown */}
                        {isDestinationDropdownOpen && (
                          <div 
                            className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-auto"
                            onMouseDown={(e) => e.stopPropagation()} // Critical: prevent mouseDown from closing dropdown
                          >
                            <div className="sticky top-0 bg-white dark:bg-gray-800 z-10">
                              <div className="flex items-center p-3 border-b border-gray-200 dark:border-gray-700">
                                <Search className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                                <input
                                  type="text"
                                  placeholder="Search destinations..."
                                  className="w-full bg-transparent border-none p-0 text-base focus:ring-0 focus:outline-none"
                                  value={destination}
                                  onChange={(e) => setDestination(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  autoFocus
                                />
                                {destination && (
                                  <button 
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                    onClick={() => setDestination('')}
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            {availableDestinations.length > 0 ? (
                              <ul role="listbox" className="py-2">
                                {availableDestinations
                                  .filter(dest => dest.toLowerCase().includes(destination.toLowerCase()))
                                  .map((dest, index) => (
                                    <li 
                                      key={index}
                                      role="option"
                                      aria-selected={destination === dest}
                                      className={`px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-base flex items-center ${destination === dest ? 'bg-gray-50 dark:bg-gray-700' : ''}`}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setDestination(dest);
                                        setIsDestinationDropdownOpen(false);
                                      }}
                                    >
                                      <MapPin className="h-4 w-4 mr-3 text-accent-kente-gold" />
                                      {dest}
                                    </li>
                                  ))}
                              </ul>
                            ) : (
                              <div className="p-4 text-gray-500 text-center">No destinations found</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Popular Destinations */}
                  <div className="mt-2 mb-6 sm:mb-8">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center">
                      <Clock className="h-3 w-3 mr-1" /> Popular destinations
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {popularDestinations.slice(0, 5).map((city, i) => (
                        <button 
                          key={i} 
                          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-accent-kente-gold/20 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full text-gray-700 dark:text-gray-300 flex items-center"
                          onClick={() => {
                            setDestination(city);
                            setIsDestinationDropdownOpen(false);
                          }}
                        >
                          <MapPin className="h-3 w-3 mr-1 text-accent-kente-gold" />
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Find Trips Button */}
                  <button
                    onClick={searchTrips}
                    disabled={!origin || !destination || isSearching}
                    className={`w-full rounded-xl py-3 sm:py-4 px-4 text-center text-white font-bold text-base sm:text-lg flex items-center justify-center transition-all
                      ${(origin && destination && !isSearching) 
                        ? 'bg-accent-kente-gold hover:bg-accent-kente-gold-dark active:transform active:scale-95 cursor-pointer shadow-md' 
                        : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'}`}
                  >
                    {isSearching ? (
                      <>
                        <span className="mr-2">Searching for trips</span>
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      </>
                    ) : (
                      <>Find Available Trips <ChevronRight className="ml-2 h-5 w-5" /></>
                    )}
                  </button>
                </div>
              )}

              {/* Core Benefits - Only show on step 1 and moved to bottom */}
              {step === 1 && (
                <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                  <div className="max-w-xl mx-auto">
                    <div className="text-center mb-3">
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Why Book With Us</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        {
                          icon: Shield,
                          title: "Safe & Secure",
                          desc: "Vetted drivers & secure payments"
                        },
                        {
                          icon: Clock,
                          title: "Quick Booking",
                          desc: "Book in minutes, travel with ease"
                        },
                        {
                          icon: CalendarCheck,
                          title: "Flexible Travel",
                          desc: "Multiple routes & schedules daily"
                        }
                      ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center p-3 text-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <div className="p-2.5 bg-accent-kente-gold/10 text-accent-kente-gold rounded-full mb-2">
                            <item.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-900 dark:text-white mb-1">{item.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Step 2: Trip selection */}
      {step === 2 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Select Your Trip</h2>
          
          {availableTrips.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">No trips found for this route.</p>
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2 bg-accent-kente-gold text-white rounded-lg hover:bg-accent-kente-gold-dark transition-colors"
              >
                Try another route
              </button>
            </div>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto pr-1">
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/80 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-accent-red mr-2" />
                  <span className="text-sm font-medium">{origin}</span>
                  <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
                  <MapPin className="h-4 w-4 text-accent-kente-gold mr-2" />
                  <span className="text-sm font-medium">{destination}</span>
                </div>
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  <span>{selectedTrip ? new Date(selectedTrip.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : ''}</span>
                </div>
              </div>

              <TripViewer 
                trips={availableTrips.map(convertToViewerTrip)}
                onTripSelect={handleTripSelect}
                onTripBook={handleTripBook}
                showFilters={true}
                compact={window.innerWidth < 768}
                mapHeight="180px"
                isLoading={isSearching}
              />
            </div>
          )}
        </div>
      )}

      {/* Step 3: Seat selection */}
      {step === 3 && selectedTrip && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold mb-1">Choose Your Seat</h2>
            <div className="flex items-center flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-accent-red mr-1.5" />
                <span>{selectedTrip.fromLocation}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-accent-kente-gold mr-1.5" />
                <span>{selectedTrip.toLocation}</span>
              </div>
              <span className="mx-1">•</span>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1.5" />
                <span>{new Date(selectedTrip.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </div>
              <span className="mx-1">•</span>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1.5" />
                <span>{selectedTrip.time}</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 mb-5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center mb-3">
              <Car className="h-5 w-5 text-accent-kente-gold mr-2" />
              <h3 className="font-medium">{selectedTrip.vehicle?.model || 'Vehicle'}</h3>
            </div>
            
            <SeatSelector
              initialSeats={availableSeats}
              onSeatSelect={handleSeatSelect}
              maxSelectableSeats={1}
              vehicleName={selectedTrip.vehicle?.model || 'Vehicle'}
              compact={window.innerWidth < 768}
              hideLegend={window.innerWidth < 480}
              hideHeader={true}
              customColors={{
                selected: 'bg-accent-kente-gold'
              }}
            />
          </div>
          
          {selectedSeat && (
            <div className="p-4 mb-5 bg-accent-kente-gold/10 border border-accent-kente-gold/30 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-accent-kente-gold text-white flex items-center justify-center font-medium mr-3">
                    {selectedSeat.number}
                  </div>
                  <div>
                    <div className="font-medium">{selectedSeat.type.charAt(0).toUpperCase() + selectedSeat.type.slice(1)} Seat</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Window seat with extra legroom</div>
                  </div>
                </div>
                <div className="text-xl font-bold text-accent-kente-gold">${selectedSeat.price.toFixed(2)}</div>
              </div>
            </div>
          )}
          
          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Trips
            </button>
            
            <button
              onClick={() => setStep(4)}
              disabled={!selectedSeat}
              className={`px-6 py-3 rounded-lg flex items-center ${
                selectedSeat
                  ? 'bg-accent-kente-gold hover:bg-accent-kente-gold-dark text-white'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              Continue
              <ChevronRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Details confirmation */}
      {step === 4 && selectedTrip && selectedSeat && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-5">Passenger Details</h2>
          
          <div className="mb-4 sm:mb-6 p-4 sm:p-5 bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow-sm">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="h-7 w-7 sm:h-8 sm:w-8 bg-accent-kente-gold/20 text-accent-kente-gold rounded-full flex items-center justify-center mr-3">
                <Info className="h-4 w-4" />
              </div>
              <h3 className="font-medium text-sm sm:text-base">Trip Summary</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 text-sm sm:text-base">
              <div className="flex flex-col space-y-3">
                <div className="flex items-start">
                  <div className="w-6 flex-shrink-0">
                    <MapPin className="h-4 w-4 text-accent-red mt-0.5" />
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">From</div>
                    <div className="font-medium">{selectedTrip.fromLocation}</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 flex-shrink-0">
                    <MapPin className="h-4 w-4 text-accent-kente-gold mt-0.5" />
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">To</div>
                    <div className="font-medium">{selectedTrip.toLocation}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-3">
                <div className="flex items-start">
                  <div className="w-6 flex-shrink-0">
                    <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Date & Time</div>
                    <div className="font-medium">{new Date(selectedTrip.date).toLocaleDateString()} • {selectedTrip.time}</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 flex-shrink-0">
                    <User className="h-4 w-4 text-gray-500 mt-0.5" />
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Seat</div>
                    <div className="font-medium">#{selectedSeat.number} ({selectedSeat.type.charAt(0).toUpperCase() + selectedSeat.type.slice(1)})</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center col-span-full mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                <div className="text-gray-500 dark:text-gray-400">Price:</div>
                <div className="ml-auto text-base sm:text-lg font-bold text-accent-kente-gold">${selectedSeat.price.toFixed(2)}</div>
              </div>
            </div>
          </div>
          
          <div className="mb-4 sm:mb-6">
            <label className="block text-sm sm:text-base font-medium mb-2 sm:mb-3 flex items-center">
              <User className="h-4 w-4 mr-2 text-accent-kente-gold" />
              Passenger Name
            </label>
            <input
              type="text"
              value={ticketHolders[0]?.name || ''}
              onChange={(e) => updateTicketHolderName(selectedSeat.id, e.target.value)}
              placeholder="Enter passenger name"
              className="w-full p-3 sm:p-4 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:border-accent-kente-gold focus:ring focus:ring-accent-kente-gold/20"
            />
          </div>
          
          {hotPoints.length > 0 && (
            <div className="mb-4 sm:mb-6 p-4 sm:p-5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="hotpoint-toggle"
                    checked={isHotpointNeeded}
                    onChange={toggleHotpoint}
                    className="mr-3 h-4 w-4 sm:h-5 sm:w-5 text-accent-kente-gold focus:ring-accent-kente-gold rounded"
                  />
                  <label htmlFor="hotpoint-toggle" className="font-medium text-sm sm:text-base">
                    Add doorstep pickup service
                  </label>
                </div>
              </div>
              
              {isHotpointNeeded && (
                <div className="mt-3">
                  <label className="block text-xs sm:text-sm font-medium mb-2">
                    Select Pickup Point
                  </label>
                  <select
                    value={selectedHotpoint?.id || ''}
                    onChange={(e) => {
                      const hotpoint = hotPoints.find(hp => hp.id === e.target.value);
                      if (hotpoint) selectHotpoint(hotpoint);
                    }}
                    className="w-full p-3 sm:p-4 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:border-accent-kente-gold focus:ring focus:ring-accent-kente-gold/20"
                  >
                    <option value="">Select a pickup point</option>
                    {hotPoints.map(hp => (
                      <option key={hp.id} value={hp.id}>
                        {hp.name} - ${hp.fee.toFixed(2)}
                      </option>
                    ))}
                  </select>
                  
                  {selectedHotpoint && (
                    <div className="mt-3 p-3 bg-accent-kente-gold/10 rounded-lg flex justify-between items-center">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-accent-kente-gold mr-2" />
                        <span className="font-medium text-sm sm:text-base">{selectedHotpoint.name}</span>
                      </div>
                      <div className="font-medium text-sm sm:text-base">+${selectedHotpoint.fee.toFixed(2)}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-between mt-4 sm:mt-6">
            <button
              onClick={() => setStep(3)}
              className="px-3 sm:px-5 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center text-sm sm:text-base"
            >
              <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
              Back
            </button>
            
            <button
              onClick={completeBooking}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-accent-kente-gold hover:bg-accent-kente-gold-dark text-white rounded-lg transition-all flex items-center font-medium text-sm sm:text-base"
            >
              Continue to Payment
              <ChevronRight className="h-4 w-4 ml-1 sm:ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Payment */}
      {step === 5 && selectedTrip && selectedSeat && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-5">Payment</h2>
          
          <div className="mb-4 sm:mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center">
                <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center mr-3">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium text-sm sm:text-base">Trip details confirmed</div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {selectedTrip.fromLocation} to {selectedTrip.toLocation}
                  </div>
                </div>
              </div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {new Date(selectedTrip.date).toLocaleDateString()} • {selectedTrip.time}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-sm sm:text-base font-medium">Total Amount:</div>
              <div className="text-lg sm:text-xl font-bold text-accent-kente-gold">
                ${(selectedSeat.price + (selectedHotpoint?.fee || 0)).toFixed(2)}
              </div>
            </div>
          </div>
          
          <PaymentForm
            onComplete={processPayment}
            amount={selectedSeat.price + (selectedHotpoint?.fee || 0)}
            isProcessing={isProcessingPayment}
            onCancel={() => setStep(4)}
            showProcessingIndicator={true}
            showTotalAmount={false}
            availableMethods={['airtel', 'momo', 'card']}
            className="border-0 p-0 shadow-none"
          />
        </div>
      )}

      {/* Step 6: Booking complete */}
      {step === 6 && bookingComplete && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 dark:border-gray-700 text-center">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5">
            <CheckCircle className="h-10 w-10 sm:h-14 sm:w-14 text-green-500 dark:text-green-400" />
          </div>
          
          <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Booking Confirmed!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 text-sm sm:text-base max-w-md mx-auto">
            Your trip has been successfully booked. You'll receive a confirmation email shortly.
          </p>
          
          <div className="mb-6 sm:mb-8 p-4 sm:p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-left shadow-sm border border-gray-200 dark:border-gray-600 max-w-md mx-auto">
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 text-accent-kente-gold">Trip Details</h3>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start">
                <div className="bg-accent-kente-gold/10 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-accent-kente-gold" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">From</div>
                  <div className="font-medium text-sm sm:text-base">{selectedTrip?.fromLocation}</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-accent-kente-gold/10 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-accent-kente-gold" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">To</div>
                  <div className="font-medium text-sm sm:text-base">{selectedTrip?.toLocation}</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-accent-kente-gold/10 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-accent-kente-gold" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Date & Time</div>
                  <div className="font-medium text-sm sm:text-base">
                    {selectedTrip?.date ? new Date(selectedTrip.date).toLocaleDateString(undefined, {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    }) : ''} • {selectedTrip?.time}
                  </div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-accent-kente-gold/10 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-accent-kente-gold" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Passenger</div>
                  <div className="font-medium text-sm sm:text-base">{ticketHolders[0]?.name || 'Passenger'}</div>
                </div>
              </div>
              
              {selectedSeat && (
                <div className="flex items-start">
                  <div className="bg-accent-kente-gold/10 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
                    <Info className="h-4 w-4 sm:h-5 sm:w-5 text-accent-kente-gold" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Seat</div>
                    <div className="font-medium text-sm sm:text-base">
                      #{selectedSeat.number} ({selectedSeat.type.charAt(0).toUpperCase() + selectedSeat.type.slice(1)})
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-start">
                <div className="bg-accent-kente-gold/10 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-accent-kente-gold" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Payment Method</div>
                  <div className="capitalize font-medium text-sm sm:text-base">{selectedPaymentMethod || 'Card'}</div>
                </div>
              </div>
              
              {selectedHotpoint && (
                <div className="flex items-start">
                  <div className="bg-accent-kente-gold/10 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-accent-kente-gold" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Pickup Point</div>
                    <div className="font-medium text-sm sm:text-base">{selectedHotpoint.name}</div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="font-medium text-sm sm:text-base">Total Paid</div>
                <div className="text-lg sm:text-xl font-bold text-accent-kente-gold">
                  ${selectedSeat ? (selectedSeat.price + (selectedHotpoint?.fee || 0)).toFixed(2) : '0.00'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <button
              onClick={resetBooking}
              className="w-full py-3 sm:py-4 bg-accent-kente-gold hover:bg-accent-kente-gold-dark text-white rounded-lg transition-all text-sm sm:text-base font-medium"
            >
              Book Another Trip
            </button>
            
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full py-3 sm:py-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base"
            >
              Go to My Bookings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
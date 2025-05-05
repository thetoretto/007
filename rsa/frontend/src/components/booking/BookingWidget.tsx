import React, { useReducer, useCallback } from 'react';
import { Route, Vehicle, Seat, PickupPoint, BookingState, BookingAction, BookingDetails } from './types';
import RouteStep from './steps/RouteStep';
import VehicleStep from './steps/VehicleStep';
import SeatStep from './steps/SeatStep';
import ConfirmPayStep from './steps/ConfirmPayStep';
import ReceiptStep from './steps/ReceiptStep';

// --- Mock Data (Replace with props/API calls) ---
const mockRoutes: Route[] = [
  { id: 'route1', name: 'Downtown Express', origin: { id: 'st1', name: 'Central Station', city: 'Metroville', state: 'MV' }, destination: { id: 'st2', name: 'Uptown Hub', city: 'Metroville', state: 'MV' }, distance: 15, duration: 30 },
  { id: 'route2', name: 'Suburb Shuttle', origin: { id: 'st3', name: 'West Suburb', city: 'Metroville', state: 'MV' }, destination: { id: 'st1', name: 'Central Station', city: 'Metroville', state: 'MV' }, distance: 25, duration: 45 },
];

const mockVehicles: Vehicle[] = [
  { id: 'v1', routeId: 'route1', model: 'Sprinter Van', type: 'Van', capacity: 12, description: 'Comfortable seating, AC.', amenities: ['AC', 'WiFi'], basePrice: 20.00 },
  { id: 'v2', routeId: 'route1', model: 'Mini Bus', type: 'Bus', capacity: 25, description: 'Spacious and reliable.', amenities: ['AC', 'Luggage Rack'], basePrice: 18.00 },
  { id: 'v3', routeId: 'route2', model: 'Sedan', type: 'Car', capacity: 4, description: 'Quick and private.', amenities: ['AC'], basePrice: 35.00 },
];

// Generate seats based on vehicle capacity - Example for v1 (12 seats)
const generateSeats = (vehicleId: string, capacity: number, price: number): Seat[] => {
  return Array.from({ length: capacity }, (_, i) => ({
    id: `${vehicleId}-s${i + 1}`,
    number: `${i + 1}`,
    available: Math.random() > 0.3, // Random availability for demo
    price: price, // Use a base price or vehicle-specific price
  }));
};

// Mock seats will now be generated dynamically when a vehicle is selected.

const mockPickupPoints: PickupPoint[] = [
  { id: 'p1', name: 'City Hall', address: '123 Main St, Metroville', icon: '🏛️', mapImageUrl: '/placeholder-map.png' },
  { id: 'p2', name: 'Grand Library', address: '456 Book Rd, Metroville', icon: '📚', mapImageUrl: '/placeholder-map.png' },
];
// --- End Mock Data ---

const initialState: BookingState = {
  currentStep: 1,
  selectedRoute: null,
  selectedVehicle: null,
  selectedSeats: [],
  needsPickup: false,
  selectedPickupPoint: null,
  bookingDetails: null, // For receipt
  routes: mockRoutes, // Use mock data for now
  vehicles: [], // Will be filtered based on route
  seats: [], // Will be fetched based on vehicle
  pickupPoints: mockPickupPoints, // Use mock data
  error: null,
  loading: false,
};

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'NEXT_STEP':
      // Add validation logic here if needed before proceeding
      return { ...state, currentStep: Math.min(state.currentStep + 1, 5) };
    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(state.currentStep - 1, 1), error: null }; // Clear error on going back
    case 'GO_TO_STEP':
      // Allow jumping back, but maybe restrict jumping forward?
      if (action.payload < state.currentStep) {
        return { ...state, currentStep: action.payload, error: null };
      }
      // For now, prevent jumping forward past the current point
      return state;
    case 'SELECT_ROUTE': {
      const route = state.routes.find(r => r.id === action.payload) || null;
      const vehiclesForRoute = route ? mockVehicles.filter(v => v.routeId === route.id) : [];
      return {
        ...state,
        selectedRoute: route,
        vehicles: vehiclesForRoute,
        selectedVehicle: null, // Reset vehicle
        seats: [], // Reset seats
        selectedSeats: [], // Reset selected seats
        error: null,
        // currentStep: route ? state.currentStep + 1 : state.currentStep // Move to next step automatically
      };
    }
    case 'SELECT_VEHICLE': {
      const vehicle = state.vehicles.find(v => v.id === action.payload) || null;
      const seatsForVehicle = vehicle ? generateSeats(vehicle.id, vehicle.capacity, vehicle.basePrice / 2) : []; // Example seat price logic
      return {
        ...state,
        selectedVehicle: vehicle,
        seats: seatsForVehicle,
        selectedSeats: [], // Reset selected seats
        error: null,
        // currentStep: vehicle ? state.currentStep + 1 : state.currentStep // Move to next step automatically
      };
    }
    case 'SELECT_SEAT': {
      const seat = state.seats.find(s => s.id === action.payload);
      if (!seat || !seat.available || !state.selectedVehicle) return state; // Ignore if seat invalid or no vehicle
      const isSelected = state.selectedSeats.some(s => s.id === seat.id);
      if (isSelected) return state; // Already selected
      if (state.selectedSeats.length >= state.selectedVehicle.capacity) return state; // Max capacity reached

      return {
        ...state,
        selectedSeats: [...state.selectedSeats, seat],
        error: null,
      };
    }
    case 'DESELECT_SEAT': {
      return {
        ...state,
        selectedSeats: state.selectedSeats.filter(s => s.id !== action.payload),
        error: null,
      };
    }
    case 'TOGGLE_PICKUP':
      return {
        ...state,
        needsPickup: action.payload,
        selectedPickupPoint: action.payload ? state.selectedPickupPoint : null, // Reset point if pickup disabled
        error: null,
      };
    case 'SELECT_PICKUP_POINT': {
      const point = state.pickupPoints.find(p => p.id === action.payload) || null;
      return {
        ...state,
        selectedPickupPoint: point,
        error: null,
      };
    }
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CONFIRM_BOOKING_SUCCESS':
      return {
        ...state,
        bookingDetails: action.payload,
        loading: false,
        error: null,
        currentStep: 5, // Move to receipt step
      };
    case 'RESET':
      return {
        ...initialState, // Reset to initial state
        routes: state.routes, // Keep fetched routes
        pickupPoints: state.pickupPoints, // Keep fetched pickup points
      };
    default:
      return state;
  }
}

interface BookingWidgetProps {
  onComplete?: (bookingDetails: any) => void;
  onCancel?: () => void;
  // Add props for injecting real data later
}

const BookingWidget: React.FC<BookingWidgetProps> = ({ onComplete, onCancel }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  const handleNext = useCallback(() => dispatch({ type: 'NEXT_STEP' }), []);
  const handlePrev = useCallback(() => dispatch({ type: 'PREV_STEP' }), []);
  const handleGoToStep = useCallback((step: number) => dispatch({ type: 'GO_TO_STEP', payload: step }), []);
  const handleSelectRoute = useCallback((routeId: string) => dispatch({ type: 'SELECT_ROUTE', payload: routeId }), []);
  const handleSelectVehicle = useCallback((vehicleId: string) => dispatch({ type: 'SELECT_VEHICLE', payload: vehicleId }), []);
  const handleSelectSeat = useCallback((seatId: string) => dispatch({ type: 'SELECT_SEAT', payload: seatId }), []);
  const handleDeselectSeat = useCallback((seatId: string) => dispatch({ type: 'DESELECT_SEAT', payload: seatId }), []);
  const handleTogglePickup = useCallback((needsPickup: boolean) => dispatch({ type: 'TOGGLE_PICKUP', payload: needsPickup }), []);
  const handleSelectPickupPoint = useCallback((pointId: string | null) => dispatch({ type: 'SELECT_PICKUP_POINT', payload: pointId }), []);
  const handleReset = useCallback(() => dispatch({ type: 'RESET' }), []);

  // Simulate API call for booking confirmation
  const handleConfirmBooking = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate potential error
      // if (Math.random() > 0.8) {
      //   throw new Error('Failed to confirm booking. Please try again.');
      // }

      if (!state.selectedRoute || !state.selectedVehicle || state.selectedSeats.length === 0) {
        throw new Error('Incomplete booking details.');
      }

      // Calculate final price (example)
      const seatTotal = state.selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
      const pickupFee = state.needsPickup ? 5.00 : 0;
      const finalTotal = seatTotal + pickupFee;

      const bookingDetails: BookingDetails = {
        bookingId: `BK-${Date.now().toString().slice(-6)}`,
        route: state.selectedRoute,
        vehicle: state.selectedVehicle,
        seats: state.selectedSeats,
        pickupPoint: state.selectedPickupPoint,
        totalPrice: finalTotal,
        bookingTime: new Date(),
      };

      dispatch({ type: 'CONFIRM_BOOKING_SUCCESS', payload: bookingDetails });
      onComplete?.(bookingDetails); // Call external callback

    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message || 'An unknown error occurred.' });
    }
  }, [state.selectedRoute, state.selectedVehicle, state.selectedSeats, state.needsPickup, state.selectedPickupPoint, onComplete]);


  const canProceed = useCallback(() => {
    switch (state.currentStep) {
      case 1: return !!state.selectedRoute;
      case 2: return !!state.selectedVehicle;
      case 3: return state.selectedSeats.length > 0;
      case 4: return !state.needsPickup || (state.needsPickup && !!state.selectedPickupPoint);
      default: return false; // Cannot proceed from receipt step
    }
  }, [state.currentStep, state.selectedRoute, state.selectedVehicle, state.selectedSeats, state.needsPickup, state.selectedPickupPoint]);

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return <RouteStep routes={state.routes} selectedRouteId={state.selectedRoute?.id} onSelectRoute={handleSelectRoute} onNext={handleNext} />;
      case 2:
        return <VehicleStep vehicles={state.vehicles} selectedVehicleId={state.selectedVehicle?.id} onSelectVehicle={handleSelectVehicle} onNext={handleNext} onPrev={handlePrev} />;
      case 3:
        return <SeatStep vehicle={state.selectedVehicle} seats={state.seats} selectedSeats={state.selectedSeats} onSelectSeat={handleSelectSeat} onDeselectSeat={handleDeselectSeat} onNext={handleNext} onPrev={handlePrev} />;
      case 4:
        return <ConfirmPayStep state={state} onTogglePickup={handleTogglePickup} onSelectPickupPoint={handleSelectPickupPoint} onConfirmBooking={handleConfirmBooking} onPrev={handlePrev} />;
      case 5:
        return <ReceiptStep details={state.bookingDetails} onBookAnother={handleReset} onClose={onCancel || (() => {})} />;
      default:
        return <RouteStep routes={state.routes} selectedRouteId={state.selectedRoute?.id} onSelectRoute={handleSelectRoute} onNext={handleNext} />;
    }
  };

  const steps = ['Route', 'Vehicle', 'Seats', 'Confirm', 'Receipt'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 relative w-full max-w-3xl mx-auto my-8 overflow-y-auto max-h-[90vh]">
        <button onClick={onCancel} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
        {/* Stepper */}
        <div className="flex justify-between items-start mb-6 border-b pb-4">
          {steps.map((label, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === state.currentStep;
            const isCompleted = stepNumber < state.currentStep;
            return (
              <div
                key={label}
                className={`flex flex-col items-center text-center w-1/5 relative text-sm 
                  ${isActive ? 'text-blue-600 font-semibold' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mb-1 
                    ${isActive ? 'border-blue-600 bg-blue-100' : isCompleted ? 'bg-green-600 text-white border-green-600' : 'border-gray-300 bg-white'}`}
                >
                  {isCompleted ? '✓' : stepNumber}
                </div>
                <div className="mt-1">{label}</div>
                {/* Connector line (optional) */}
                {index < steps.length - 1 && (
                  <div className={`absolute top-4 left-1/2 w-full h-0.5 
                    ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}
                    ${index === steps.length - 2 ? 'w-1/2' : ''} // Adjust last connector
                    `} style={{ transform: 'translateX(50%)', zIndex: -1 }}></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="mt-6 mb-6 min-h-[300px]">
          {renderStep()}
        </div>

        {/* Navigation Buttons - Rendered here for central control */}
        {state.currentStep < 5 && ( // Don't show nav on receipt step
          <div className="flex justify-between items-center pt-4 border-t mt-6">
            {state.currentStep > 1 ? (
              <button
                onClick={handlePrev}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 transition-colors"
                disabled={state.loading}
              >
                Back
              </button>
            ) : (
              <div /> // Placeholder to keep alignment
            )}

            {state.currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={!canProceed() || state.loading}
              >
                Continue
              </button>
            ) : null}

            {/* Pay button is handled within ConfirmPayStep */}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingWidget;
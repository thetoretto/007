import '../../index.css';
import React, { useReducer, useCallback, useEffect, useMemo } from 'react';
import { Route, Vehicle, Seat, /* PickupPoint, */ BookingState, BookingAction, BookingDetails } from './types'; // Keep local types for widget's internal structure
import { useBookingStore } from '@/store/bookingStore'; // Import bookingStore
import { Trip as StoreTrip } from '@/store/tripStore'; // Import StoreTrip
import useHotPointStore, { HotPoint } from '@/store/hotPointStore'; // Import HotPoint store and type

// Replacing local PickupPoint with HotPoint from store
export type { HotPoint as PickupPoint };
import RouteStep from './steps/RouteStep';
import VehicleStep from './steps/VehicleStep';
import SeatStep from './steps/SeatStep';
import ConfirmPayStep from './steps/ConfirmPayStep';
import ReceiptStep from './steps/ReceiptStep';

// Mock data for pickup points can remain if not fetched from a store
// const mockRoutes and mockVehicles will be replaced by data from stores

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

// mockPickupPoints is removed, will use hotPoints from store
// --- End Mock Data ---

const initialState: BookingState = {
  currentStep: 1,
  selectedTrip: null, // Changed from selectedRoute to selectedTrip (StoreTrip)
  selectedVehicle: null, // This will be derived from selectedTrip
  selectedSeats: [],
  needsPickup: false,
  selectedPickupPoint: null, // Will be HotPoint | null
  bookingDetails: null, // For receipt
  availableTrips: [], // Holds StoreTrip[] from bookingStore
  // vehicles: [], // No longer needed here, derived from selectedTrip
  seats: [], // Will be fetched/generated based on selectedTrip.vehicle
  pickupPoints: [], // Will be HotPoint[] relevant to the selected trip
  allHotPoints: [], // To store all fetched hot points
  error: null,
  loading: false,
};

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  const getHotPointsByIds = (ids: string[], allHotPoints: HotPoint[]): HotPoint[] => {
    if (!ids || ids.length === 0) return [];
    return allHotPoints.filter(hp => ids.includes(hp.id) && hp.status === 'active');
  };
  switch (action.type) {
    case 'SET_AVAILABLE_TRIPS':
      return { ...state, availableTrips: action.payload };
    case 'SET_ALL_HOT_POINTS':
      return { ...state, allHotPoints: action.payload };
    case 'NEXT_STEP':
      // Add validation logic here if needed before proceeding
      return { ...state, currentStep: Math.min(state.currentStep + 1, 5) };
    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(state.currentStep - 1, 1), error: null }; // Clear error on going back
    case 'GO_TO_STEP':
      if (action.payload < state.currentStep) {
        return { ...state, currentStep: action.payload, error: null };
      }
      return state;
    case 'SELECT_TRIP': { // Renamed from SELECT_ROUTE
      const trip = state.availableTrips.find(t => t.id === action.payload) || null;
      let seatsForVehicle: Seat[] = [];
      if (trip && trip.vehicle) {
        // Assuming price per seat is on the trip or vehicle object
        const seatPrice = trip.price || (trip.vehicle as any).basePrice || 10; // Fallback price, cast vehicle to any if basePrice is not on GlobalVehicle
        seatsForVehicle = trip.vehicle.capacity ? generateSeats(trip.vehicle.id, trip.vehicle.capacity, seatPrice / 2) : [];
      }
      return {
        ...state,
        selectedTrip: trip,
        selectedVehicle: trip?.vehicle || null, // Vehicle is part of the trip
        seats: seatsForVehicle,
        selectedSeats: [],
        // If trip offers pickup, populate relevant hot points
        pickupPoints: (trip?.offersPickup && trip.pickupHotPointIds) 
                      ? getHotPointsByIds(trip.pickupHotPointIds, state.allHotPoints)
                      : [],
        needsPickup: false, // Reset pickup choice
        selectedPickupPoint: null, // Reset selected point
        error: null,
      };
    }
    // SELECT_VEHICLE might not be needed if vehicle is directly tied to a trip and not selectable independently
    case 'SELECT_VEHICLE': { 
      const vehicle = state.selectedTrip?.vehicle;
      if (!vehicle) return state;

      const seatsForVehicle = vehicle.capacity ? generateSeats(vehicle.id, vehicle.capacity, ((vehicle as any).basePrice || 20) / 2) : [];
      return {
        ...state,
        selectedVehicle: vehicle, 
        seats: seatsForVehicle,
        selectedSeats: [], 
        error: null,
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
      // action.payload is the ID of the HotPoint
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
        ...initialState,
        availableTrips: state.availableTrips, // Keep fetched trips
        allHotPoints: state.allHotPoints, // Keep all fetched hot points
        // pickupPoints will be repopulated on trip selection
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
  const { getAvailableTripsForBooking } = useBookingStore();
  const { hotPoints: allGlobalHotPoints, fetchHotPoints } = useHotPointStore(); // Get all hot points

  useEffect(() => {
    const trips = getAvailableTripsForBooking(); 
    dispatch({ type: 'SET_AVAILABLE_TRIPS', payload: trips });
  }, [getAvailableTripsForBooking]);

  useEffect(() => {
    fetchHotPoints(); // Fetch all hot points once
  }, [fetchHotPoints]);

  useEffect(() => {
    // Update local state when global hot points are fetched/updated
    dispatch({ type: 'SET_ALL_HOT_POINTS', payload: allGlobalHotPoints });
  }, [allGlobalHotPoints]);

  const handleNext = useCallback(() => dispatch({ type: 'NEXT_STEP' }), []);
  const handlePrev = useCallback(() => dispatch({ type: 'PREV_STEP' }), []);
  const handleGoToStep = useCallback((step: number) => dispatch({ type: 'GO_TO_STEP', payload: step }), []);
  const handleSelectTrip = useCallback((tripId: string) => dispatch({ type: 'SELECT_TRIP', payload: tripId }), []);
  const handleSelectVehicle = useCallback((vehicleId: string) => {
    dispatch({ type: 'SELECT_VEHICLE', payload: vehicleId })
  }, []);
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

      if (!state.selectedTrip || !state.selectedTrip.vehicle || state.selectedSeats.length === 0) {
        throw new Error('Incomplete booking details. Please select a trip, vehicle, and seats.');
      }

      // Calculate final price (example)
      const seatTotal = state.selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);
      const pickupFee = state.needsPickup ? 5.00 : 0;
      const finalTotal = seatTotal + pickupFee;

      // Adapt BookingDetails to use StoreTrip structure or map it
      const bookingDetails: BookingDetails = {
        bookingId: `BK-${Date.now().toString().slice(-6)}`,
        route: {
          id: state.selectedTrip.route?.id || state.selectedTrip.id, 
          name: `${state.selectedTrip.fromLocation} to ${state.selectedTrip.toLocation}`,
          // These need to be HotPoint compatible or mapped if types differ significantly
          origin: { id: state.selectedTrip.route?.origin.id || 'origin-unknown', name: state.selectedTrip.fromLocation || 'Unknown Origin', address: state.selectedTrip.route?.origin.address || '', city: state.selectedTrip.route?.origin.city || '', state: state.selectedTrip.route?.origin.state || '', zipCode: state.selectedTrip.route?.origin.zipCode || '' },
          destination: { id: state.selectedTrip.route?.destination.id || 'dest-unknown', name: state.selectedTrip.toLocation || 'Unknown Destination', address: state.selectedTrip.route?.destination.address || '', city: state.selectedTrip.route?.destination.city || '', state: state.selectedTrip.route?.destination.state || '', zipCode: state.selectedTrip.route?.destination.zipCode || '' },
          distance: state.selectedTrip.route?.distance || 0,
          duration: state.selectedTrip.route?.duration || 0,
        },
        vehicle: {
          id: state.selectedTrip.vehicle.id,
          model: state.selectedTrip.vehicle.model,
          type: state.selectedTrip.vehicle.type,
          capacity: state.selectedTrip.vehicle.capacity,
          routeId: state.selectedTrip.routeId || '', 
          description: '', 
          amenities: state.selectedTrip.vehicle.features || [], 
          basePrice: state.selectedTrip.price || (state.selectedTrip.vehicle as any).basePrice || 0, 
        },
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
      case 1: return !!state.selectedTrip;
      case 2: return !!state.selectedTrip?.vehicle; // Vehicle is part of trip
      case 3: return state.selectedSeats.length > 0;
      case 4: return !state.needsPickup || (state.needsPickup && !!state.selectedPickupPoint);
      default: return false; // Cannot proceed from receipt step
    }
  }, [state.currentStep, state.selectedRoute, state.selectedVehicle, state.selectedSeats, state.needsPickup, state.selectedPickupPoint]);

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return <RouteStep trips={state.availableTrips} selectedTripId={state.selectedTrip?.id} onSelectTrip={handleSelectTrip} onNext={handleNext} />;
      case 2:
        // Vehicle is part of the trip, so this step might be redundant if vehicle is not selectable independently
        // Or it could be a confirmation of the vehicle details from selectedTrip.vehicle
        return <VehicleStep vehicles={state.selectedTrip?.vehicle ? [state.selectedTrip.vehicle] : []} selectedVehicleId={state.selectedTrip?.vehicle?.id} onSelectVehicle={handleSelectVehicle} onNext={handleNext} onPrev={handlePrev} />;
      case 3:
        return <SeatStep vehicle={state.selectedTrip?.vehicle} seats={state.seats} selectedSeats={state.selectedSeats} onSelectSeat={handleSelectSeat} onDeselectSeat={handleDeselectSeat} onNext={handleNext} onPrev={handlePrev} />;
      case 4:
        // Pass selectedTrip and availableHotPoints (which are state.pickupPoints) to ConfirmPayStep
        return <ConfirmPayStep 
                  state={state} // Includes selectedTrip, needsPickup, selectedPickupPoint
                  availableHotPoints={state.pickupPoints} // These are the filtered hot points for the current trip
                  onTogglePickup={handleTogglePickup} 
                  onSelectPickupPoint={handleSelectPickupPoint} 
                  onConfirmBooking={handleConfirmBooking} 
                  onPrev={handlePrev} 
               />;
      case 5:
        return <ReceiptStep details={state.bookingDetails} onBookAnother={handleReset} onClose={onCancel || (() => {})} />;
      default:
        return <RouteStep trips={state.availableTrips} selectedTripId={state.selectedTrip?.id} onSelectTrip={handleSelectTrip} onNext={handleNext} />;
    }
  };

  const steps = ['Route', 'Vehicle', 'Seats', 'Confirm', 'Receipt'];
  const totalSteps = steps.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 relative w-full max-w-3xl mx-auto my-8 overflow-y-auto max-h-[90vh]">
        <button onClick={onCancel} className="btn btn-secondary absolute top-3 right-3 p-2 leading-none text-2xl z-10">&times;</button>
        
        {/* Progress Bar */} 
        <div className="mb-8 px-2 pt-2">
          <div className="flex mb-1">
            {steps.map((label, index) => (
              <div key={label} className="text-xs text-center w-1/5">
                <span className={`${state.currentStep === index + 1 ? 'font-bold text-base' : state.currentStep > index + 1 ? 'text-green-600' : 'text-gray-500'}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-medium h-1 ">
            <div 
              className="bg-primary-600 h-1 rounded-medium transition-all duration-500 ease-out" /* Progress bar color is fine */
              style={{ width: `${(state.currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Stepper - Old one removed, new progress bar above */}
 

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
                className="btn btn-secondary"
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
                className="btn btn-primary"
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
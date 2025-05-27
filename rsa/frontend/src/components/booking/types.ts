// d:\007\rsa\frontend\src\components\booking\types.ts
import { HotPoint } from '../../store/hotPointStore'; // Import the global HotPoint type
import { Trip as StoreTrip } from '../../store/tripStore'; // Import StoreTrip

export interface Station {
  id: string;
  name: string;
  city: string;
  state: string;
}

export interface Route {
  id: string;
  name: string;
  origin: Station;
  destination: Station;
  distance: number;
  duration: number; // in minutes
}

export interface Vehicle {
  id: string;
  routeId: string; // To link vehicles to routes
  model: string;
  type: string;
  capacity: number;
  description: string;
  amenities: string[];
  basePrice: number;
}

export interface Seat {
  id: string;
  number: string;
  // available: boolean; // Replaced by status
  price: number; // Price might vary per seat or be based on vehicle base price
  type: 'standard' | 'premium' | 'vip' | 'accessible';
  status: 'available' | 'selected' | 'booked' | 'reserved';
  position: {
    row: number; // 0-indexed
    col: number; // 0-indexed
    aisle?: boolean; // Optional: Indicates if there's an aisle next to this seat
  };
  notes?: string; // Optional notes for the seat
}

export interface PickupPoint {
  id: string;
  name: string;
  address: string;
  icon: string; // Emoji or path to icon
  mapImageUrl: string; // Path to static map image
}

// Use global HotPoint for pickup points within the booking component context
export type BookingPickupPoint = HotPoint;

export interface BookingDetails {
  bookingId: string;
  route: Route;
  vehicle: Vehicle;
  seats: Seat[];
  pickupPoint: BookingPickupPoint | null; // Use the aliased/imported HotPoint
  totalPrice: number;
  bookingTime: Date;
  // Add other relevant details like QR code data
}

// State for the Booking Widget reducer
export interface BookingState {
  currentStep: number;
  selectedTrip: StoreTrip | null; // Changed from selectedRoute
  selectedVehicle: Vehicle | null; // This is derived from selectedTrip in the widget
  selectedSeats: Seat[];
  needsPickup: boolean;
  selectedPickupPoint: BookingPickupPoint | null; // Use the aliased/imported HotPoint
  bookingDetails: BookingDetails | null;
  // Data fetched or passed as props
  availableTrips: StoreTrip[]; // Changed from routes: Route[]
  // vehicles: Vehicle[]; // This was already commented out or managed via selectedTrip
  seats: Seat[]; // Fetched based on selectedVehicle (from selectedTrip)
  pickupPoints: BookingPickupPoint[]; // Filtered HotPoints for the selectedTrip
  allHotPoints: HotPoint[]; // All available hot points, used to filter pickupPoints
  // UI State
  error: string | null;
  loading: boolean;
}

// Actions for the Booking Widget reducer
export type BookingAction =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP'; payload: number }
  | { type: 'SELECT_TRIP'; payload: string } // Changed from SELECT_ROUTE
  | { type: 'SELECT_VEHICLE'; payload: string } // This might be implicitly handled by SELECT_TRIP
  | { type: 'SELECT_SEAT'; payload: string }
  | { type: 'DESELECT_SEAT'; payload: string }
  | { type: 'TOGGLE_PICKUP'; payload: boolean }
  | { type: 'SELECT_PICKUP_POINT'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CONFIRM_BOOKING_SUCCESS'; payload: BookingDetails }
  | { type: 'RESET' }
  | { type: 'SET_AVAILABLE_TRIPS', payload: StoreTrip[] } // Added to match BookingWidget
  | { type: 'SET_ALL_HOT_POINTS', payload: HotPoint[] }; // Added to match BookingWidget
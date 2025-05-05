// d:\007\rsa\frontend\src\components\booking\types.ts

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
  available: boolean;
  price: number; // Price might vary per seat or be based on vehicle base price
}

export interface PickupPoint {
  id: string;
  name: string;
  address: string;
  icon: string; // Emoji or path to icon
  mapImageUrl: string; // Path to static map image
}

export interface BookingDetails {
  bookingId: string;
  route: Route;
  vehicle: Vehicle;
  seats: Seat[];
  pickupPoint: PickupPoint | null;
  totalPrice: number;
  bookingTime: Date;
  // Add other relevant details like QR code data
}

// State for the Booking Widget reducer
export interface BookingState {
  currentStep: number;
  selectedRoute: Route | null;
  selectedVehicle: Vehicle | null;
  selectedSeats: Seat[];
  needsPickup: boolean;
  selectedPickupPoint: PickupPoint | null;
  bookingDetails: BookingDetails | null;
  // Data fetched or passed as props
  routes: Route[];
  vehicles: Vehicle[]; // Filtered based on selectedRoute
  seats: Seat[]; // Fetched based on selectedVehicle
  pickupPoints: PickupPoint[];
  // UI State
  error: string | null;
  loading: boolean;
}

// Actions for the Booking Widget reducer
export type BookingAction =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP'; payload: number }
  | { type: 'SELECT_ROUTE'; payload: string }
  | { type: 'SELECT_VEHICLE'; payload: string }
  | { type: 'SELECT_SEAT'; payload: string }
  | { type: 'DESELECT_SEAT'; payload: string }
  | { type: 'TOGGLE_PICKUP'; payload: boolean }
  | { type: 'SELECT_PICKUP_POINT'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CONFIRM_BOOKING_SUCCESS'; payload: BookingDetails }
  | { type: 'RESET' };
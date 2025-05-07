// d:\007\rsa\frontend\src\types.ts
export type UserRole = 'passenger' | 'driver' | 'admin';
export type UserStatus = 'active' | 'pending' | 'suspended' | 'banned' | 'inactive' | 'deactivated'; // Added inactive/deactivated

export interface User {
  id: string;
  email: string;
  password?: string; // Added for mock password change, not for production security
  firstName: string;
  lastName: string;
  phoneNumber?: string; // Optional phone number
  role: UserRole;
  status: UserStatus;
  createdAt?: string; 
  updatedAt?: string;
  // Add other common user fields here
}

export interface Passenger extends User {
  role: 'passenger';
  phoneNumber?: string;
  address?: string;
  paymentMethods?: PaymentMethod[];
}

export interface Driver extends User {
  role: 'driver';
  licenseNumber?: string;
  // vehicleId?: string; // A driver can have multiple vehicles, manage in vehicleStore or a join table
  rating?: number;
  isActive?: boolean; // Driver's operational status (e.g., available for rides)
}

export interface Admin extends User {
  role: 'admin';
  department?: string;
  permissions?: string[];
}

export interface LoginCredentials {
  emailOrPhone: string; // Can be email or phone number
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  phoneNumber: string; // Changed from phone to phoneNumber
  password?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null; // Could be Passenger, Driver, or Admin
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
}

export interface Route {
  id: string;
  name: string;
  origin: Location; // Or Location ID
  destination: Location; // Or Location ID
  distance: number; // in km or miles
  duration: number; // in minutes
  isActive?: boolean;
  departureTimes?: string[]; // For the general route template
}

// Vehicle type from vehicleStore.ts and mockData.ts merged
export interface Vehicle {
  id: string;
  driverId?: string; // Link vehicle to a driver
  type: 'Car' | 'Van' | 'Bus' | 'Minibus' | 'shuttle' | 'sedan' | string; // Allow more types
  brand: string;
  model: string;
  licensePlate: string;
  capacity: number;
  features?: string[];
  isActive?: boolean; // Operational status of the vehicle
}

export interface Seat {
  id: string;
  number: string;
  isAvailable: boolean;
  price?: number;
}

export interface Trip {
  id: string;
  driverId: string;
  vehicleId: string;
  routeId: string; // Or full Route object
  departureTime: string; // ISO DateTime string for a specific trip instance
  arrivalTime: string;   // ISO DateTime string (estimated)
  availableSeats: number;
  pricePerSeat: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled' | 'pending_approval';
  offersPickup?: boolean; // New field for hot point pickup
  pickupHotPointIds?: string[]; // New field for selected hot point IDs
  createdAt: string;
  updatedAt: string;
  passengers?: string[]; // list of passenger IDs booked on this trip
}

export type BookingStatus = 'booked' | 'pending' | 'confirmed' | 'checked-in' | 'validated' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  userId: string; // Passenger ID
  tripId: string;
  seats: Seat[]; // Array of selected Seat objects or IDs
  bookingDate: string; // ISO date string
  totalPrice: number;
  status: BookingStatus;
  departureTime: string; // Copied from Trip for convenience
  qrCode?: string; // Data for QR code
  checkedInAt?: string; // Timestamp for when the ticket was checked in
}

export interface PaymentMethod {
  id: string;
  type: 'credit' | 'debit' | 'paypal' | string;
  last4?: string;
  expiryDate?: string;
  isDefault?: boolean;
}

// From mockData.ts imports, if still needed elsewhere
export interface TimeSlot {
  id: string;
  startTime: string; // ISO date string
  endTime: string;   // ISO date string
  isBooked: boolean;
}

export interface BookingExtra {
  id: string;
  name: string;
  price: number;
  description?: string;
}
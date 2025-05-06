// User types
export type UserRole = 'passenger' | 'driver' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Passenger extends User {
  role: 'passenger';
  phoneNumber?: string;
  address?: string;
  paymentMethods?: PaymentMethod[];
}

export interface Driver extends User {
  role: 'driver';
  licenseNumber: string;
  vehicleId: string;
  rating: number;
  isActive: boolean;
  vehicle?: Vehicle;
}

export interface Admin extends User {
  role: 'admin';
  department: string;
  permissions: string[];
}

// Auth types
export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

// Trip and booking types
export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
}
// Removed the incorrect Trip interface definition here

export interface Route {
  id: string;
  name: string;
  origin: Location;
  destination: Location;
  distance: number;
  duration: number;
  isActive: boolean;
}

export interface Vehicle {
  id: string;
  model: string;
  licensePlate: string;
  capacity: number;
  type: string;
  features: string[];
  isActive: boolean;
}

export interface Seat {
  id: string;
  number: string;
  vehicleId: string;
  isAvailable: boolean;
  isHandicapAccessible: boolean;
  position: {
    row: number;
    column: number;
  };
}

// Define the correct Trip interface here, based on tripStore.ts
export interface Trip {
  id: string;
  fromLocation: string; // Added
  toLocation: string;   // Added
  vehicleId?: string;
  driverId: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled' | 'in-progress';
  passengers?: number;
  availableSeats?: number;
  price?: number;
  vehicle?: Vehicle; // Keep related vehicle object
  // Add bookings array if needed elsewhere, but keep interface clean based on store
  // bookings?: Booking[];
  // pendingBookings?: number;
  // confirmedBookings?: number;
  // totalBookings?: number;
  notes?: string; // Added notes field
}

export interface TimeSlot {
  id: string;
  date: string;
  time: string;
  routeId: string;
  vehicleId: string;
  driverId: string;
  availableSeats: number;
  price: number;
  isActive: boolean;
}

export interface BookingExtra {
  id: string;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'credit' | 'debit' | 'paypal';
  last4: string;
  expiryDate?: string;
  isDefault: boolean;
}

export interface Trip {
  id: string;
  // routeId?: string; // Removed
  fromLocation: string; // Added
  toLocation: string;   // Added
  vehicleId?: string;
  driverId: string;
  timeSlotId: string;
  seatId: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'checked-in';
  hasDoorstepPickup: boolean;
  pickupAddress?: string;
  extras: {
    extraId: string;
    quantity: number;
  }[];
  fare: {
    baseFare: number;
    fees: number;
    extras: number;
    discount: number;
    total: number;
  };
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod?: PaymentMethod;
  createdAt: string;
  updatedAt: string;
  checkedInAt?: string;
  // route?: Route; // Removed
  vehicle?: Vehicle;
  timeSlot?: TimeSlot;
  passenger?: Passenger;
  availableSeats?: number;
  price?: number;
  vehicle?: Vehicle;
  // route?: Route; // Removed
  bookings: Booking[]; // Added bookings array
  pendingBookings: number; // Added for convenience
  confirmedBookings: number; // Added for convenience
  totalBookings: number; // Added for convenience
  notes?: string; // Added notes field
}

export interface Booking {
  id: string;
  passengerId: string;
  routeId: string;
  vehicleId: string;
  timeSlotId: string;
  seatId: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'checked-in';
  hasDoorstepPickup: boolean;
  pickupAddress?: string;
  extras: {
    extraId: string;
    quantity: number;
  }[];
  fare: {
    baseFare: number;
    fees: number;
    extras: number;
    discount: number;
    total: number;
  };
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod?: PaymentMethod;
  createdAt: string;
  updatedAt: string;
  checkedInAt?: string;
  route?: Route;
  vehicle?: Vehicle;
  timeSlot?: TimeSlot;
  passenger?: Passenger;
}

// Dashboard and analytics types
export interface DashboardStats {
  totalUsers: number;
  activeDrivers: number;
  upcomingTrips: number;
  totalBookings: number;
  totalRevenue: number;
}

export interface BookingStat {
  date: string;
  bookings: number;
  revenue: number;
}

export interface RoutePopularity {
  routeId: string;
  routeName: string;
  bookings: number;
  percentage: number;
}
import create from 'zustand';
import { devtools } from 'zustand/middleware';
import { Trip, Vehicle as GlobalVehicle, Route as GlobalRoute, SeatStatus } from './tripStore'; // Assuming tripStore exports these
import useTripStore from './tripStore'; // To get available trips
import useAuthStore from './authStore'; // To get current user

// --- Enums & Interfaces ---
export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed', // After the trip is done
  CHECKED_IN = 'checked-in',
}

export interface Passenger {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface SeatReservation {
  seatId: string;
  seatNumber: string;
  price: number;
  status?: SeatStatus; // e.g., 'available', 'booked', 'reserved'
}

export interface Booking {
  id: string;
  userId: string;
  tripId: string;
  trip?: Trip; // Denormalized trip details for convenience
  passengers: Passenger[];
  seats: SeatReservation[];
  totalPrice: number;
  bookingTime: Date;
  status: BookingStatus;
  paymentId?: string;
  pickupPointId?: string; // Optional: if a pickup service is used
  notes?: string;
  qrCodeUrl?: string; // For check-in
  createdAt: Date;
  updatedAt: Date;
}

interface BookingState {
  bookings: Booking[];
  userBookings: Booking[]; // Bookings specific to the logged-in user
  isLoading: boolean;
  error: string | null;
  getAvailableTripsForBooking: () => Trip[];
  fetchUserBookings: () => Promise<void>;
  createBooking: (bookingDetails: Omit<Booking, 'id' | 'userId' | 'bookingTime' | 'status' | 'createdAt' | 'updatedAt' | 'qrCodeUrl'>) => Promise<Booking | null>;
  cancelBooking: (bookingId: string) => Promise<boolean>;
  checkInPassenger: (bookingId: string, passengerId: string, seatId: string) => Promise<boolean>; // More granular check-in
  getBookingById: (bookingId: string) => Booking | undefined;
}

// --- Mock Data ---
const mockBookings: Booking[] = [
  {
    id: 'B001',
    userId: 'U001', // Corresponds to a user ID from authStore or mockUsers
    tripId: 'T001', // Corresponds to a trip ID from tripStore
    passengers: [{ id: 'P001', name: 'Alice Smith' }],
    seats: [{ seatId: 'T001-V001-S1', seatNumber: 'A1', price: 25 }],
    totalPrice: 25,
    bookingTime: new Date('2024-07-28T10:00:00Z'),
    status: BookingStatus.CONFIRMED,
    qrCodeUrl: '/qr-codes/B001.png',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'B002',
    userId: 'U002',
    tripId: 'T002',
    passengers: [{ id: 'P002', name: 'Bob Johnson' }],
    seats: [{ seatId: 'T002-V002-S5', seatNumber: 'B2', price: 30 }],
    totalPrice: 30,
    bookingTime: new Date('2024-07-29T14:30:00Z'),
    status: BookingStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const useBookingStore = create<BookingState>()(
  devtools(
    (set, get) => ({
      bookings: mockBookings, // Initialize with mock data
      userBookings: [],
      isLoading: false,
      error: null,

      getAvailableTripsForBooking: () => {
        const { trips } = useTripStore.getState();
        // Filter for trips that are upcoming and have available seats
        // This logic might be more complex in a real app (e.g., checking vehicle capacity vs. booked seats)
        return trips.filter(trip => trip.status === 'upcoming' /* && trip.availableSeats > 0 */);
      },

      fetchUserBookings: async () => {
        const { user } = useAuthStore.getState();
        if (!user) {
          set({ userBookings: [], error: 'User not authenticated.', isLoading: false });
          return;
        }
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          const currentUserBookings = get().bookings.filter(b => b.userId === user.id);
          set({ userBookings: currentUserBookings, isLoading: false });
        } catch (err: any) {
          set({ error: err.message || 'Failed to fetch user bookings.', isLoading: false });
        }
      },

      createBooking: async (bookingDetails) => {
        const { user } = useAuthStore.getState();
        if (!user) {
          set({ error: 'User not authenticated to create booking.', isLoading: false });
          return null;
        }
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500));
          const newBooking: Booking = {
            ...bookingDetails,
            id: `B${String(Date.now()).slice(-4)}${Math.random().toString(36).substring(2, 5)}`,
            userId: user.id,
            bookingTime: new Date(),
            status: BookingStatus.PENDING, // Or CONFIRMED if payment is instant
            qrCodeUrl: '', // Generate QR code upon confirmation
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Simulate QR code generation
          newBooking.qrCodeUrl = `/qr-codes/${newBooking.id}.png`;

          set(state => ({
            bookings: [...state.bookings, newBooking],
            userBookings: user.id === newBooking.userId ? [...state.userBookings, newBooking] : state.userBookings,
            isLoading: false,
          }));
          return newBooking;
        } catch (err: any) {
          set({ error: err.message || 'Failed to create booking.', isLoading: false });
          return null;
        }
      },

      cancelBooking: async (bookingId: string) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          let success = false;
          set(state => {
            const bookingToCancel = state.bookings.find(b => b.id === bookingId);
            if (bookingToCancel && (bookingToCancel.status === BookingStatus.PENDING || bookingToCancel.status === BookingStatus.CONFIRMED)) {
              success = true;
              return {
                bookings: state.bookings.map(b => b.id === bookingId ? { ...b, status: BookingStatus.CANCELLED, updatedAt: new Date() } : b),
                userBookings: state.userBookings.map(b => b.id === bookingId ? { ...b, status: BookingStatus.CANCELLED, updatedAt: new Date() } : b),
              };
            }
            return state; // No change if booking not found or not cancellable
          });
          set({ isLoading: false });
          if (!success) throw new Error('Booking not found or cannot be cancelled.');
          return true;
        } catch (err: any) {
          set({ error: err.message || 'Failed to cancel booking.', isLoading: false });
          return false;
        }
      },

      checkInPassenger: async (bookingId: string, passengerId: string, seatId: string) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 700));
          let success = false;
          set(state => {
            const booking = state.bookings.find(b => b.id === bookingId);
            if (booking && booking.status === BookingStatus.CONFIRMED) {
              // In a real app, you might update specific passenger/seat status within the booking
              // For simplicity, we'll mark the whole booking as CHECKED_IN if one passenger checks in.
              // Or, you might have a more granular status on SeatReservation.
              success = true;
              return {
                bookings: state.bookings.map(b => b.id === bookingId ? { ...b, status: BookingStatus.CHECKED_IN, updatedAt: new Date() } : b),
                userBookings: state.userBookings.map(b => b.id === bookingId ? { ...b, status: BookingStatus.CHECKED_IN, updatedAt: new Date() } : b),
              };
            }
            return state;
          });
          set({ isLoading: false });
          if (!success) throw new Error('Booking not found, not confirmed, or passenger/seat mismatch.');
          return true;
        } catch (err: any) {
          set({ error: err.message || 'Failed to check in passenger.', isLoading: false });
          return false;
        }
      },

      getBookingById: (bookingId: string) => {
        return get().bookings.find(b => b.id === bookingId);
      },
    }),
    { name: 'bookingStore', getStorage: () => localStorage } // Optional: persist store to localStorage
  )
);

export default useBookingStore;
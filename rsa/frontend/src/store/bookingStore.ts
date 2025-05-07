// d:\007\rsa\frontend\src\store\bookingStore.ts
import { create } from 'zustand';
import { Booking, BookingStatus } from '../types';
import { mockBookings, mockUsers, mockTrips, mockVehicles, mockRoutes, mockTimeSlots } from '../utils/mockData'; // Assuming mockBookings is available

export interface BookingWithDetails extends Booking {
  passenger?: typeof mockUsers[0];
  trip?: typeof mockTrips[0];
  vehicle?: typeof mockVehicles[0];
  route?: typeof mockRoutes[0];
  timeSlot?: typeof mockTimeSlots[0]; // Assuming mockTimeSlots is the correct type for timeSlot
  // Add other details as needed
}

interface BookingState {
  bookings: BookingWithDetails[];
  isLoading: boolean;
  error: string | null;
  fetchBookingsByUserId: (userId: string) => Promise<void>;
  fetchBookingById: (bookingId: string) => Promise<BookingWithDetails | undefined>;
  checkInBooking: (bookingId: string) => Promise<{ success: boolean; message?: string; booking?: BookingWithDetails }>;
  // Add other actions like cancelBooking, updateBookingStatus, etc.
}

// Helper to enrich booking data (simulates backend joins)
const enrichBookingDetails = (booking: Booking): BookingWithDetails => {
  const passenger = mockUsers.find(u => u.id === booking.userId);
  const trip = mockTrips.find(t => t.id === booking.tripId);
  const vehicle = trip ? mockVehicles.find(v => v.id === trip.vehicleId) : undefined;
  const route = trip ? mockRoutes.find(r => r.id === trip.routeId) : undefined;
  // Assuming timeSlot is part of the trip or booking, adjust as necessary
  // For now, let's assume timeSlot might be directly on booking or trip, or needs a different lookup
  // This part might need refinement based on actual data structure for time slots
  const timeSlot = mockTimeSlots.find(ts => ts.id === (trip as any)?.timeSlotId || (booking as any)?.timeSlotId); 

  return {
    ...booking,
    passenger,
    trip,
    vehicle,
    route,
    timeSlot,
  };
};

const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],
  isLoading: false,
  error: null,

  fetchBookingsByUserId: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const userBookings = mockBookings
        .filter(b => b.userId === userId)
        .map(enrichBookingDetails);
      set({ bookings: userBookings, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  fetchBookingById: async (bookingId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      const booking = mockBookings.find(b => b.id === bookingId);
      if (booking) {
        const detailedBooking = enrichBookingDetails(booking);
        set({ isLoading: false });
        return detailedBooking;
      }
      set({ isLoading: false, error: 'Booking not found' });
      return undefined;
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      return undefined;
    }
  },

  checkInBooking: async (bookingId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 700));
      const bookingIndex = mockBookings.findIndex(b => b.id === bookingId);

      if (bookingIndex === -1) {
        set({ isLoading: false, error: 'Booking not found' });
        return { success: false, message: 'Booking not found' };
      }

      const booking = mockBookings[bookingIndex];

      if (booking.status === 'cancelled') {
        set({ isLoading: false, error: 'Cannot check-in a cancelled booking.' });
        return { success: false, message: 'This ticket has been cancelled.' };
      }
      
      if (booking.status === 'checked-in' || booking.status === 'validated') {
        set({ isLoading: false });
        return { success: true, message: 'This ticket has already been validated.', booking: enrichBookingDetails(booking) };
      }
      
      // Update booking status
      const updatedBooking: Booking = {
        ...booking,
        status: 'checked-in' as BookingStatus, // Use the new status
        checkedInAt: new Date().toISOString(),
      };
      mockBookings[bookingIndex] = updatedBooking;

      // Update the local store state if this booking is already loaded
      const currentBookings = get().bookings;
      const updatedBookings = currentBookings.map(b => 
        b.id === bookingId ? enrichBookingDetails(updatedBooking) : b
      );

      set({ bookings: updatedBookings, isLoading: false });
      return { success: true, message: `Booking ${bookingId} checked in successfully.`, booking: enrichBookingDetails(updatedBooking) };

    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      return { success: false, message: (err as Error).message };
    }
  },
}));

export default useBookingStore;
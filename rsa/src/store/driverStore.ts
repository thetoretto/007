import { create } from 'zustand';
import { Trip, Passenger, DailySummary } from '../types';
import { getBookingsWithDetails, mockRoutes, mockTimeSlots } from '../utils/mockData';
import { v4 as uuidv4 } from 'uuid';

interface DriverState {
  // Trip Management
  upcomingTrips: Trip[];
  selectedTripId: string | null;
  
  // Daily Summary
  dailySummary: DailySummary;
  
  // UI States
  loading: boolean;
  error: string | null;
  showCancelModal: boolean;
  showPassengerListModal: boolean;
  showCheckInModal: boolean;
  
  // Preferences (stored in localStorage)
  preferences: {
    defaultVehicleId: string | null;
    notificationsEnabled: boolean;
    theme: 'light' | 'dark';
  };
}

interface DriverActions {
  // Trip Management
  fetchUpcomingTrips: () => Promise<void>;
  selectTrip: (tripId: string | null) => void;
  cancelTrip: (tripId: string) => Promise<void>;
  checkInPassenger: (bookingId: string) => Promise<void>;
  createTrip: (tripData: any) => Promise<void>;
  validateTicket: (ticketId: string) => Promise<boolean>;
  
  // Modal Management
  openCancelModal: () => void;
  closeCancelModal: () => void;
  openPassengerListModal: () => void;
  closePassengerListModal: () => void;
  openCheckInModal: () => void;
  closeCheckInModal: () => void;
  
  // Preferences Management
  updatePreferences: (preferences: Partial<DriverState['preferences']>) => void;
  loadPreferences: () => void;
}

const PREFERENCES_KEY = 'driver_preferences';

const initialState: DriverState = {
  upcomingTrips: [],
  selectedTripId: null,
  dailySummary: {
    totalTrips: 0,
    totalPassengers: 0,
    completedTrips: 0,
    upcomingTrips: 0,
  },
  loading: false,
  error: null,
  showCancelModal: false,
  showPassengerListModal: false,
  showCheckInModal: false,
  preferences: {
    defaultVehicleId: null,
    notificationsEnabled: true,
    theme: 'light',
  },
};

const useDriverStore = create<DriverState & DriverActions>((set, get) => ({
  ...initialState,
  
  // Trip Management
  fetchUpcomingTrips: async () => {
    set({ loading: true, error: null });
    try {
      const allBookings = getBookingsWithDetails();
      
      // Group bookings by trip
      const tripGroups = allBookings.reduce((groups: { [key: string]: typeof allBookings }, booking) => {
        const key = booking.timeSlotId;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(booking);
        return groups;
      }, {});
      
      // Get trip details
      const trips = mockTimeSlots.map(timeSlot => {
        const route = mockRoutes.find(r => r.id === timeSlot.routeId);
        const bookingsForTrip = tripGroups[timeSlot.id] || [];
        
        return {
          ...timeSlot,
          route,
          bookings: bookingsForTrip,
          pendingBookings: bookingsForTrip.filter(b => b.status === 'pending').length,
          confirmedBookings: bookingsForTrip.filter(b => b.status === 'confirmed').length,
          totalBookings: bookingsForTrip.length,
        };
      });
      
      // Filter and sort upcoming trips
      const upcomingTrips = trips
        .filter(trip => {
          const tripDate = new Date(trip.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return tripDate >= today;
        })
        .sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateA.getTime() - dateB.getTime();
        });
      
      set({ upcomingTrips, loading: false });
      
      // Update daily summary
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTrips = upcomingTrips.filter(trip => {
        const tripDate = new Date(trip.date);
        return tripDate.getTime() === today.getTime();
      });
      
      set({
        dailySummary: {
          totalTrips: todayTrips.length,
          totalPassengers: todayTrips.reduce((sum, trip) => sum + trip.confirmedBookings, 0),
          completedTrips: todayTrips.filter(trip => {
            const tripTime = new Date(`${trip.date}T${trip.time}`);
            return tripTime < new Date();
          }).length,
          upcomingTrips: todayTrips.filter(trip => {
            const tripTime = new Date(`${trip.date}T${trip.time}`);
            return tripTime >= new Date();
          }).length,
        },
      });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
    }
  },
  
  selectTrip: (tripId) => set({ selectedTripId: tripId }),
  
  cancelTrip: async (tripId) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Remove trip from state
      set(state => ({
        upcomingTrips: state.upcomingTrips.filter(trip => trip.id !== tripId),
        selectedTripId: null,
        showCancelModal: false,
        loading: false,
      }));
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
    }
  },
  
  checkInPassenger: async (bookingId) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update booking status
      set(state => ({
        upcomingTrips: state.upcomingTrips.map(trip => ({
          ...trip,
          bookings: trip.bookings.map(booking =>
            booking.id === bookingId
              ? { ...booking, status: 'checked-in' }
              : booking
          ),
        })),
        showCheckInModal: false,
        loading: false,
      }));
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
    }
  },
  
  // Modal Management
  openCancelModal: () => set({ showCancelModal: true }),
  closeCancelModal: () => set({ showCancelModal: false }),
  openPassengerListModal: () => set({ showPassengerListModal: true }),
  closePassengerListModal: () => set({ showPassengerListModal: false }),
  openCheckInModal: () => set({ showCheckInModal: true }),
  closeCheckInModal: () => set({ showCheckInModal: false }),
  
  // Preferences Management
  updatePreferences: (newPreferences) => {
    set(state => {
      const updatedPreferences = { ...state.preferences, ...newPreferences };
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updatedPreferences));
      return { preferences: updatedPreferences };
    });
  },
  
  loadPreferences: () => {
    const savedPreferences = localStorage.getItem(PREFERENCES_KEY);
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        set({ preferences });
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    }
  },

  // Create a new trip
  createTrip: async (tripData) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Create a new trip with the provided data
      const newTrip = {
        id: uuidv4(),
        routeId: `${tripData.originCity}-${tripData.destinationCity}`,
        date: tripData.date,
        time: tripData.time,
        vehicleId: tripData.vehicle,
        availableSeats: tripData.availableSeats,
        totalSeats: tripData.availableSeats,
        status: 'scheduled',
        departureStop: tripData.departureStop,
        pickAvailable: tripData.pickAvailable,
        notes: tripData.notes,
        bookings: [],
        pendingBookings: 0,
        confirmedBookings: 0,
        totalBookings: 0,
        route: {
          id: `${tripData.originCity}-${tripData.destinationCity}`,
          name: `${tripData.originCity} to ${tripData.destinationCity}`,
          origin: { name: tripData.departureStop, city: tripData.originCity, state: 'Rwanda' },
          destination: { name: 'Main Terminal', city: tripData.destinationCity, state: 'Rwanda' },
          distance: Math.floor(Math.random() * 100) + 20, // Random distance for demo
          duration: Math.floor(Math.random() * 120) + 30, // Random duration for demo
        }
      };
      
      // Add the new trip to the state
      set(state => ({
        upcomingTrips: [...state.upcomingTrips, newTrip],
        loading: false
      }));
      
      return newTrip;
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
      throw error;
    }
  },
  
  // Validate a ticket
  validateTicket: async (ticketId) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demo purposes, consider tickets with specific format as valid
      const isValid = ticketId.startsWith('TICKET-') && ticketId.length > 10;
      
      set({ loading: false });
      return isValid;
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
      return false;
    }
  },
}));

export default useDriverStore;
import { create } from 'zustand';
import { Route, Vehicle, Seat, TimeSlot, BookingExtra } from '../types';
import { mockRoutes, mockVehicles, mockSeats, mockTimeSlots, mockExtras } from '../utils/mockData';

interface BookingState {
  // Step 1: Route Selection
  selectedRoute: Route | null;
  routes: Route[];
  
  // Step 2: Vehicle & Seat
  selectedVehicle: Vehicle | null;
  selectedSeat: Seat | null;
  vehicles: Vehicle[];
  availableSeats: Seat[];
  
  // Step 3: Schedule
  selectedDate: string | null;
  selectedTimeSlot: TimeSlot | null;
  availableTimeSlots: TimeSlot[];
  
  // Step 4: Pickup & Extras
  doorstepPickup: boolean;
  pickupAddress: string;
  selectedExtras: { extra: BookingExtra; quantity: number }[];
  availableExtras: BookingExtra[];
  
  // Step 5: Review & Payment
  baseFare: number;
  fees: number;
  extrasTotal: number;
  discount: number;
  total: number;
  
  // Booking progress
  currentStep: number;
  isComplete: boolean;
  bookingId: string | null;
  
  // Loading state
  loading: boolean;
  error: string | null;
}

interface BookingActions {
  // Step navigation
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  
  // Step 1: Route Selection
  fetchRoutes: () => Promise<void>;
  selectRoute: (routeId: string) => void;
  
  // Step 2: Vehicle & Seat
  fetchVehicles: (routeId: string) => Promise<void>;
  selectVehicle: (vehicleId: string) => void;
  fetchSeats: (vehicleId: string) => Promise<void>;
  selectSeat: (seatId: string) => void;
  
  // Step 3: Schedule
  selectDate: (date: string) => void;
  fetchTimeSlots: (routeId: string, date: string) => Promise<void>;
  selectTimeSlot: (timeSlotId: string) => void;
  
  // Step 4: Pickup & Extras
  toggleDoorstepPickup: () => void;
  setPickupAddress: (address: string) => void;
  fetchExtras: () => Promise<void>;
  addExtra: (extraId: string) => void;
  removeExtra: (extraId: string) => void;
  
  // Step 5: Review & Payment
  calculateFare: () => void;
  applyDiscount: (code: string) => Promise<void>;
  completeBooking: () => Promise<void>;
  
  // Reset
  resetBooking: () => void;
}

const initialState: BookingState = {
  // Step 1: Route Selection
  selectedRoute: null,
  routes: [],
  
  // Step 2: Vehicle & Seat
  selectedVehicle: null,
  selectedSeat: null,
  vehicles: [],
  availableSeats: [],
  
  // Step 3: Schedule
  selectedDate: null,
  selectedTimeSlot: null,
  availableTimeSlots: [],
  
  // Step 4: Pickup & Extras
  doorstepPickup: false,
  pickupAddress: '',
  selectedExtras: [],
  availableExtras: [],
  
  // Step 5: Review & Payment
  baseFare: 0,
  fees: 0,
  extrasTotal: 0,
  discount: 0,
  total: 0,
  
  // Booking progress
  currentStep: 1,
  isComplete: false,
  bookingId: null,
  
  // Loading state
  loading: false,
  error: null,
};

const useBookingStore = create<BookingState & BookingActions>((set, get) => ({
  ...initialState,
  
  // Step navigation
  nextStep: () => {
    const { currentStep } = get();
    // Update total steps to 6
    if (currentStep < 6) {
      set({ currentStep: currentStep + 1 });
    }
  },
  
  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 1) {
      set({ currentStep: currentStep - 1 });
    }
  },
  
  goToStep: (step) => {
    // Update total steps to 6
    if (step >= 1 && step <= 6) {
      set({ currentStep: step });
    }
  },
  
  // Step 1: Route Selection
  fetchRoutes: async () => {
    set({ loading: true, error: null });
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In a real app, this would be an API call
      set({ routes: mockRoutes, loading: false });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
    }
  },
  
  selectRoute: (routeId) => {
    const route = get().routes.find(r => r.id === routeId) || null;
    set({ 
      selectedRoute: route,
      // Reset dependent selections
      selectedVehicle: null,
      selectedSeat: null,
      selectedDate: null,
      selectedTimeSlot: null,
    });
  },
  
  // Step 2: Vehicle & Seat
  fetchVehicles: async (routeId) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In a real app, this would filter vehicles by route
      set({ vehicles: mockVehicles, loading: false });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
    }
  },
  
  selectVehicle: (vehicleId) => {
    const vehicle = get().vehicles.find(v => v.id === vehicleId) || null;
    set({ 
      selectedVehicle: vehicle,
      // Reset seat selection
      selectedSeat: null,
    });
    
    // Fetch seats for this vehicle
    if (vehicle) {
      get().fetchSeats(vehicle.id);
    }
  },
  
  fetchSeats: async (vehicleId) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Filter seats by vehicle ID
      const seats = mockSeats.filter(seat => seat.vehicleId === vehicleId);
      set({ availableSeats: seats, loading: false });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
    }
  },
  
  selectSeat: (seatId) => {
    const seat = get().availableSeats.find(s => s.id === seatId) || null;
    if (seat && !seat.isAvailable) {
      set({ error: 'This seat is not available' });
      return;
    }
    set({ selectedSeat: seat, error: null });
  },
  
  // Step 3: Schedule
  selectDate: (date) => {
    set({ selectedDate: date });
    
    // Fetch time slots for this route and date
    if (get().selectedRoute) {
      get().fetchTimeSlots(get().selectedRoute.id, date);
    }
  },
  
  fetchTimeSlots: async (routeId, date) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Filter time slots by route ID and date
      const slots = mockTimeSlots.filter(
        slot => slot.routeId === routeId && slot.date === date
      );
      set({ availableTimeSlots: slots, loading: false });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
    }
  },
  
  selectTimeSlot: (timeSlotId) => {
    const timeSlot = get().availableTimeSlots.find(ts => ts.id === timeSlotId) || null;
    set({ selectedTimeSlot: timeSlot });
    
    // Update base fare if time slot is selected
    if (timeSlot) {
      set({ baseFare: timeSlot.price });
      get().calculateFare();
    }
  },
  
  // Step 4: Pickup & Extras
  toggleDoorstepPickup: () => {
    const doorstepPickup = !get().doorstepPickup;
    set({ doorstepPickup });
    get().calculateFare();
  },
  
  setPickupAddress: (address) => {
    set({ pickupAddress: address });
  },
  
  fetchExtras: async () => {
    set({ loading: true, error: null });
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      set({ availableExtras: mockExtras, loading: false });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
    }
  },
  
  addExtra: (extraId) => {
    const { selectedExtras, availableExtras } = get();
    const extra = availableExtras.find(e => e.id === extraId);
    
    if (!extra) return;
    
    const existingIndex = selectedExtras.findIndex(item => item.extra.id === extraId);
    
    if (existingIndex >= 0) {
      // Increment quantity if already selected
      const updatedExtras = [...selectedExtras];
      updatedExtras[existingIndex] = {
        ...updatedExtras[existingIndex],
        quantity: updatedExtras[existingIndex].quantity + 1,
      };
      set({ selectedExtras: updatedExtras });
    } else {
      // Add new extra
      set({
        selectedExtras: [...selectedExtras, { extra, quantity: 1 }],
      });
    }
    
    get().calculateFare();
  },
  
  removeExtra: (extraId) => {
    const { selectedExtras } = get();
    const existingIndex = selectedExtras.findIndex(item => item.extra.id === extraId);
    
    if (existingIndex >= 0) {
      const updatedExtras = [...selectedExtras];
      
      if (updatedExtras[existingIndex].quantity > 1) {
        // Decrement quantity
        updatedExtras[existingIndex] = {
          ...updatedExtras[existingIndex],
          quantity: updatedExtras[existingIndex].quantity - 1,
        };
      } else {
        // Remove item entirely
        updatedExtras.splice(existingIndex, 1);
      }
      
      set({ selectedExtras: updatedExtras });
      get().calculateFare();
    }
  },
  
  // Step 5: Review & Payment
  calculateFare: () => {
    const { baseFare, doorstepPickup, selectedExtras } = get();
    
    // Calculate service fee (10% of base fare)
    const fees = baseFare * 0.1;
    
    // Calculate extras total
    const extrasTotal = selectedExtras.reduce(
      (total, item) => total + (item.extra.price * item.quantity),
      0
    );
    
    // Add doorstep pickup fee if selected (flat $5)
    const pickupFee = doorstepPickup ? 5 : 0;
    
    // Calculate total
    const total = baseFare + fees + extrasTotal + pickupFee - get().discount;
    
    set({ fees, extrasTotal, total });
  },
  
  applyDiscount: async (code) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simple discount code validation
      if (code === 'FIRST10') {
        set({ discount: 10 });
      } else if (code === 'SUMMER25') {
        set({ discount: 25 });
      } else {
        set({ error: 'Invalid discount code' });
      }
      
      set({ loading: false });
      get().calculateFare();
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
    }
  },
  
  completeBooking: async () => {
    set({ loading: true, error: null });
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a fake booking ID
      const bookingId = `BK${Math.floor(Math.random() * 10000)}`;
      
      set({ 
        bookingId,
        isComplete: true,
        loading: false,
      });
      
      return Promise.resolve();
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
      return Promise.reject(error);
    }
  },
  
  // Reset
  resetBooking: () => {
    set({
      ...initialState,
      routes: get().routes, // Keep fetched routes
      availableExtras: get().availableExtras, // Keep fetched extras
    });
  },
}));

export default useBookingStore;
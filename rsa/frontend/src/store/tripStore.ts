import create from 'zustand';
import { mockTimeSlots, mockVehicles as globalMockVehicles, mockRoutes as globalMockRoutes } from '../utils/mockData';
import type { Vehicle as GlobalVehicle, Route as GlobalRoute, TripStatus } from '../types'; // Import global types

// This Trip interface is specific to how tripStore consumes mockTimeSlots and serves the application
export interface Trip {
  id: string;
  routeId?: string; 
  vehicleId?: string;
  driverId: string;
  date: string; // e.g., "2025-06-15"
  time: string; // e.g., "08:00"
  status: TripStatus; // Use global TripStatus: 'scheduled' | 'active' | 'completed' | 'cancelled' | 'pending_approval'
  availableSeats?: number;
  price?: number;
  vehicle?: GlobalVehicle; 
  route?: GlobalRoute;
  notes?: string;
  // Derived/denormalized for convenience, if needed by UI directly from this trip object
  fromLocation?: string; 
  toLocation?: string;
  offersPickup?: boolean; // Added for hot point pickup
  pickupHotPointIds?: string[]; // Added for selected hot point IDs
}

interface TripState {
  trips: Trip[];
  getBookableTrips: () => Trip[];
  addTrip: (newTripData: Omit<Trip, 'id' | 'vehicle' | 'route' | 'availableSeats' | 'status' | 'fromLocation' | 'toLocation' | 'offersPickup' | 'pickupHotPointIds'> & { vehicleId: string; routeId: string; offersPickup?: boolean; pickupHotPointIds?: string[] }) => void;
  removeTrip: (tripId: string) => void;
  updateTrip: (tripId: string, updatedTripData: Partial<Omit<Trip, 'id' | 'vehicle' | 'route' | 'fromLocation' | 'toLocation'>>) => void;
  fetchTrips: () => void;
  decrementSeat: (tripId: string) => void; // For booking integration
  markTripAsCompleted: (tripId: string) => void;
}

const generateId = () => `trip-${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`;

// Helper to create a consistent Trip object
const createTripObject = (ts: any): Trip => {
  const vehicle = globalMockVehicles.find(v => v.id === ts.vehicleId);
  const route = globalMockRoutes.find(r => r.id === ts.routeId);
  return {
    ...ts,
    id: ts.id || generateId(),
    routeId: ts.routeId,
    vehicleId: ts.vehicleId,
    driverId: ts.driverId || 'driver-default',
    status: ts.status || 'scheduled', // Default to 'scheduled' if not provided
    availableSeats: ts.availableSeats !== undefined ? ts.availableSeats : (vehicle?.capacity || 0),
    price: ts.price,
    date: ts.date,
    time: ts.time,
    vehicle: vehicle,
    route: route,
    fromLocation: route?.origin.name,
    toLocation: route?.destination.name,
    notes: ts.notes,
    offersPickup: ts.offersPickup || false, // Default to false
    pickupHotPointIds: ts.pickupHotPointIds || [], // Default to empty array
  };
};

const initialTrips: Trip[] = mockTimeSlots.map(createTripObject);

const useTripStore = create<TripState>((set, get) => ({
  trips: initialTrips,

  fetchTrips: () => {
    console.log('Fetching trips (re-initializing from mockData)');
    const refreshedTrips = mockTimeSlots.map(createTripObject);
    set({ trips: refreshedTrips });
  },

  getBookableTrips: () => {
    const { trips } = get();
    return trips.filter(trip =>
      trip.vehicle &&
      trip.vehicle.isActive &&
      (trip.status === 'scheduled' || trip.status === 'active') && // Consider 'active' as also bookable
      (trip.availableSeats !== undefined && trip.availableSeats > 0)
    );
  },

  addTrip: (newTripData) => set((state) => {
    const vehicle = globalMockVehicles.find(v => v.id === newTripData.vehicleId);
    const route = globalMockRoutes.find(r => r.id === newTripData.routeId);
    const newTrip: Trip = {
      ...newTripData,
      id: generateId(),
      status: 'scheduled', // New trips are typically scheduled
      availableSeats: vehicle?.capacity || 0,
      vehicle: vehicle,
      route: route,
      fromLocation: route?.origin.name,
      toLocation: route?.destination.name,
      offersPickup: newTripData.offersPickup || false,
      pickupHotPointIds: newTripData.pickupHotPointIds || [],
    };
    console.log('Adding trip:', newTrip);
    return { trips: [...state.trips, newTrip] };
  }),

  removeTrip: (tripId) => set((state) => {
    console.log('Removing trip:', tripId);
    return { trips: state.trips.filter((trip) => trip.id !== tripId) };
  }),

  updateTrip: (tripId, updatedTripData) => set((state) => {
    console.log('Updating trip:', tripId, updatedTripData);
    return {
      trips: state.trips.map((trip) => {
        if (trip.id === tripId) {
          const mergedData = { ...trip, ...updatedTripData };
          
          const vehicle = updatedTripData.vehicleId
            ? globalMockVehicles.find(v => v.id === updatedTripData.vehicleId)
            : (mergedData.vehicleId ? globalMockVehicles.find(v => v.id === mergedData.vehicleId) : trip.vehicle);
            
          const route = updatedTripData.routeId
            ? globalMockRoutes.find(r => r.id === updatedTripData.routeId)
            : (mergedData.routeId ? globalMockRoutes.find(r => r.id === mergedData.routeId) : trip.route);

          const updatedTripInstance: Trip = {
            ...mergedData,
            vehicle: vehicle,
            route: route,
            fromLocation: route?.origin.name,
            toLocation: route?.destination.name,
          };

          // If vehicleId changed and vehicle exists, update availableSeats if not explicitly set
          if (updatedTripData.vehicleId && vehicle && updatedTripData.availableSeats === undefined) {
            updatedTripInstance.availableSeats = vehicle.capacity;
          }
          // If status is provided in update, use it, otherwise keep existing
          if (updatedTripData.status) {
            updatedTripInstance.status = updatedTripData.status;
          }

          return updatedTripInstance;
        }
        return trip;
      }),
    };
  }),

  decrementSeat: (tripId: string) => set((state) => {
    return {
      trips: state.trips.map(trip => {
        if (trip.id === tripId && trip.availableSeats && trip.availableSeats > 0) {
          return { ...trip, availableSeats: trip.availableSeats - 1 };
        }
        return trip;
      })
    };
  }),

  markTripAsCompleted: (tripId) => set((state) => {
    console.log('Marking trip as completed:', tripId);
    return {
      trips: state.trips.map((trip) =>
        trip.id === tripId ? { ...trip, status: 'completed' as TripStatus, updatedAt: new Date() } : trip
      ),
    };
  }),

}));

export default useTripStore;
import create from 'zustand';
import { mockTimeSlots, mockVehicles, mockRoutes } from '../utils/mockData';

// Define the Trip type based on existing usage and mock data structure
interface Vehicle {
  id: string;
  name: string;
  capacity: number;
  type: string;
}

interface Route {
  id: string;
  name: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  estimatedDuration: number;
}

export interface Trip {
  id: string;
  // routeId?: string; // Removed routeId
  fromLocation: string; // Added fromLocation
  toLocation: string;   // Added toLocation
  vehicleId?: string; // Optional: ID of the assigned vehicle
  driverId: string; // Added driver ID
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled' | 'in-progress'; // Kept original status options
  passengers?: number; // Optional based on usage
  availableSeats?: number; // Calculated or stored
  price?: number; // Optional: Price of the trip
  vehicle?: Vehicle; // Kept detailed vehicle object
  // route?: Route; // Removed route object
  // Add other relevant fields as needed from mockTimeSlots or future API
  notes?: string; // Added notes field
}

interface TripState {
  trips: Trip[];
  addTrip: (newTripData: Omit<Trip, 'id' | 'vehicle' | 'availableSeats' | 'status'>) => void; // Adjusted Omit
  removeTrip: (tripId: string) => void;
  updateTrip: (tripId: string, updatedTripData: Partial<Omit<Trip, 'id' | 'vehicle' | 'availableSeats' | 'status'>>) => void; // Adjusted Partial<Omit>
  fetchTrips: () => void; // Placeholder for API call
}

// Function to generate a unique ID (replace with a more robust solution if needed)
const generateId = () => `trip-${Math.random().toString(36).substr(2, 9)}`;

// Initialize trips with details from mock data
const initialTrips: Trip[] = mockTimeSlots.map(ts => {
  const vehicle = mockVehicles.find(v => v.id === (ts.vehicleId || 'v1'));
  // const route = mockRoutes.find(r => r.id === ts.routeId); // Removed route lookup
  return {
    ...ts,
    id: ts.id || generateId(),
    fromLocation: ts.fromLocation || 'Default Start', // Added fromLocation (use mock or default)
    toLocation: ts.toLocation || 'Default End',     // Added toLocation (use mock or default)
    vehicleId: ts.vehicleId || 'v1',
    driverId: ts.driverId || 'driver-default', // Ensure driverId is present
    status: 'upcoming', // Default status
    availableSeats: vehicle?.capacity || 16,
    vehicle: vehicle,
    // route: route, // Removed route
  };
});

const useTripStore = create<TripState>((set) => ({
  trips: initialTrips,

  fetchTrips: () => {
    // In a real app, fetch trips from the API here
    // For now, we just use the initial mock data
    console.log('Fetching trips (using mock data)');
    set({ trips: initialTrips });
  },

  addTrip: (newTripData) => set((state) => {
    const vehicle = mockVehicles.find(v => v.id === newTripData.vehicleId);
    // const route = mockRoutes.find(r => r.id === newTripData.routeId); // Removed route lookup
    const newTrip: Trip = {
      ...newTripData,
      id: generateId(),
      status: 'upcoming',
      availableSeats: vehicle?.capacity,
      vehicle: vehicle,
      // route: route, // Removed route
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
    // Find the vehicle if vehicleId is updated
    const vehicle = updatedTripData.vehicleId
      ? mockVehicles.find(v => v.id === updatedTripData.vehicleId)
      : undefined; // Keep existing vehicle if vehicleId not changed

    return {
      trips: state.trips.map((trip) => {
        if (trip.id === tripId) {
          const updatedTrip = { ...trip, ...updatedTripData };
          // Update vehicle object and availableSeats if vehicleId changed
          if (vehicle !== undefined) {
            updatedTrip.vehicle = vehicle;
            updatedTrip.availableSeats = vehicle?.capacity;
          }
          return updatedTrip;
        }
        return trip;
      }),
    };
  }),
}));

export default useTripStore;
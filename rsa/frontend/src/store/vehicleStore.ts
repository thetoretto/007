import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

import { Vehicle } from '../types'; // Import Vehicle type
import { mockVehicles as allMockVehicles } from '../utils/mockData'; // Import mockVehicles

// Define the store state and actions
interface VehicleState {
  vehicles: Vehicle[];
  fetchVehicles: (driverId: string) => void; // Fetch vehicles for a specific driver
  addVehicle: (vehicleData: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (vehicleId: string, vehicleData: Partial<Omit<Vehicle, 'id' | 'driverId'>>) => void;
  removeVehicle: (vehicleId: string) => void;
}

const useVehicleStore = create<VehicleState>((set, get) => ({
  vehicles: [],

  fetchVehicles: (driverId) => {
    // Simulate fetching vehicles for the logged-in driver
    // Ensure that the Vehicle type from '../types' has 'driverId'. If not, this filter might need adjustment
    // or the global mockVehicles need to include driverId if this store is meant to filter by it.
    // For now, assuming global mockVehicles might not have driverId directly in the same way.
    // This part might need further review based on the actual structure of global mockVehicles and requirements.
    // If global mockVehicles don't have driverId, this store might be for *all* vehicles of a certain type, or driver-specific vehicles added via addVehicle.
    // Let's assume for now the intent is to filter the global list if possible, or manage a local list if not.
    // Given the original code filtered a local mockVehicles by driverId, we'll try to replicate that with allMockVehicles.
    // This requires `allMockVehicles` items to potentially have a `driverId` field.
    // The `Vehicle` type from `types.ts` has an optional `driverId`. The `mockVehicles` in `mockData.ts` does not show `driverId` in the snippet.
    // For the purpose of this refactoring, we will assume `allMockVehicles` can be filtered by `driverId` if the field exists on items.
    const driverVehicles = allMockVehicles.filter(v => v.driverId === driverId);
    console.log(`Fetching vehicles for driver: ${driverId}`, driverVehicles);
    set({ vehicles: driverVehicles });
    // In a real app: fetch(`/api/drivers/${driverId}/vehicles`).then(res => res.json()).then(data => set({ vehicles: data }));
  },

  addVehicle: (vehicleData) => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: uuidv4(),
    };
    console.log('Adding vehicle:', newVehicle);
    set((state) => ({ vehicles: [...state.vehicles, newVehicle] }));
    // In a real app: fetch('/api/vehicles', { method: 'POST', body: JSON.stringify(newVehicle) }).then(() => get().fetchVehicles(vehicleData.driverId));
  },

  updateVehicle: (vehicleId, vehicleData) => {
    console.log(`Updating vehicle ${vehicleId}:`, vehicleData);
    set((state) => ({
      vehicles: state.vehicles.map((vehicle) =>
        vehicle.id === vehicleId ? { ...vehicle, ...vehicleData } : vehicle
      ),
    }));
    // In a real app: fetch(`/api/vehicles/${vehicleId}`, { method: 'PUT', body: JSON.stringify(vehicleData) }).then(() => get().fetchVehicles(get().vehicles.find(v => v.id === vehicleId)?.driverId || ''));
  },

  removeVehicle: (vehicleId) => {
    const driverId = get().vehicles.find(v => v.id === vehicleId)?.driverId;
    console.log(`Removing vehicle ${vehicleId}`);
    set((state) => ({
      vehicles: state.vehicles.filter((vehicle) => vehicle.id !== vehicleId),
    }));
    // In a real app: fetch(`/api/vehicles/${vehicleId}`, { method: 'DELETE' }).then(() => get().fetchVehicles(driverId || ''));
  },
}));

export default useVehicleStore;
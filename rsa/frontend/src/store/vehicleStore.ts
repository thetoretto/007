import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

// Define the Vehicle interface
export interface Vehicle {
  id: string;
  driverId: string; // Assuming vehicles are linked to drivers
  type: 'Car' | 'Van' | 'Bus' | 'Minibus';
  brand: string;
  model: string; // Added model for more detail
  licensePlate: string; // Added license plate
  capacity: number;
}

// Define the store state and actions
interface VehicleState {
  vehicles: Vehicle[];
  fetchVehicles: (driverId: string) => void; // Fetch vehicles for a specific driver
  addVehicle: (vehicleData: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (vehicleId: string, vehicleData: Partial<Omit<Vehicle, 'id' | 'driverId'>>) => void;
  removeVehicle: (vehicleId: string) => void;
}

// Mock vehicle data (replace with API calls later)
const mockVehicles: Vehicle[] = [
  {
    id: 'v1', driverId: 'user-driver-123', type: 'Car', brand: 'Toyota', model: 'Camry', licensePlate: 'ABC-123', capacity: 4
  },
  {
    id: 'v2', driverId: 'user-driver-123', type: 'Van', brand: 'Ford', model: 'Transit', licensePlate: 'XYZ-789', capacity: 8
  },
  {
    id: 'v3', driverId: 'user-other-456', type: 'Minibus', brand: 'Mercedes', model: 'Sprinter', licensePlate: 'MERC-01', capacity: 12
  },
];

const useVehicleStore = create<VehicleState>((set, get) => ({
  vehicles: [],

  fetchVehicles: (driverId) => {
    // Simulate fetching vehicles for the logged-in driver
    const driverVehicles = mockVehicles.filter(v => v.driverId === driverId);
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
import create from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface HotPoint {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt?: string;
}

interface HotPointState {
  hotPoints: HotPoint[];
  addHotPoint: (hotPointData: Omit<HotPoint, 'id' | 'createdAt' | 'status'>) => Promise<HotPoint>;
  updateHotPoint: (id: string, updates: Partial<Omit<HotPoint, 'id' | 'createdAt'>>) => Promise<HotPoint | undefined>;
  deleteHotPoint: (id: string) => Promise<void>;
  toggleHotPointStatus: (id: string) => Promise<HotPoint | undefined>;
  fetchHotPoints: () => Promise<void>; // Placeholder for API call
}

// Mock data for now
const mockHotPoints: HotPoint[] = [
  {
    id: uuidv4(),
    name: 'Central Bus Station',
    address: '123 Main St, Cityville',
    latitude: 34.0522,
    longitude: -118.2437,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Downtown Square',
    address: '456 Oak Ave, Cityville',
    latitude: 34.0500,
    longitude: -118.2500,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'North Mall Entrance',
    address: '789 Pine Rd, Cityville',
    latitude: 34.0550,
    longitude: -118.2400,
    status: 'inactive',
    createdAt: new Date().toISOString(),
  },
];

const useHotPointStore = create<HotPointState>((set, get) => ({
  hotPoints: [],
  fetchHotPoints: async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ hotPoints: [...mockHotPoints] });
  },
  addHotPoint: async (hotPointData) => {
    const newHotPoint: HotPoint = {
      ...hotPointData,
      id: uuidv4(),
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    mockHotPoints.push(newHotPoint); // Update mock data source
    set(state => ({ hotPoints: [...state.hotPoints, newHotPoint] }));
    return newHotPoint;
  },
  updateHotPoint: async (id, updates) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    let updatedHotPoint: HotPoint | undefined;
    const updatedMockHotPoints = mockHotPoints.map(hp => {
      if (hp.id === id) {
        updatedHotPoint = { ...hp, ...updates, updatedAt: new Date().toISOString() };
        return updatedHotPoint;
      }
      return hp;
    });
    mockHotPoints.length = 0; // Clear and repopulate
    mockHotPoints.push(...updatedMockHotPoints);

    if (updatedHotPoint) {
      set(state => ({
        hotPoints: state.hotPoints.map(hp => (hp.id === id ? updatedHotPoint! : hp)),
      }));
    }
    return updatedHotPoint;
  },
  deleteHotPoint: async (id) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockHotPoints.findIndex(hp => hp.id === id);
    if (index !== -1) {
      mockHotPoints.splice(index, 1);
    }
    set(state => ({ hotPoints: state.hotPoints.filter(hp => hp.id !== id) }));
  },
  toggleHotPointStatus: async (id) => {
    const hotPoint = get().hotPoints.find(hp => hp.id === id);
    if (hotPoint) {
      const newStatus = hotPoint.status === 'active' ? 'inactive' : 'active';
      return get().updateHotPoint(id, { status: newStatus });
    }
    return undefined;
  },
}));

export default useHotPointStore;
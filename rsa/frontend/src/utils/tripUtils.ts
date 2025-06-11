import { mockTrips, mockRoutes, mockVehicles, mockDrivers } from './mockData';

// Enhanced trip utility functions for booking system

export const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'scheduled': 'Scheduled',
    'active': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'pending_approval': 'Pending Approval'
  };
  return statusMap[status] || status;
};

export const parseActivityDate = (dateString: string): Date => {
  return new Date(dateString);
};

// Convert mock data to enhanced trip format for booking
export const getEnhancedTripsFromMockData = () => {
  return mockTrips.map(trip => {
    const route = mockRoutes.find(r => r.id === trip.routeId);
    const vehicle = mockVehicles.find(v => v.id === trip.vehicleId);
    const driver = mockDrivers.find(d => d.id === trip.driverId);

    return {
      id: trip.id,
      fromLocation: route?.origin.name || 'Unknown Origin',
      toLocation: route?.destination.name || 'Unknown Destination',
      date: new Date(trip.departureTime).toISOString().split('T')[0],
      time: new Date(trip.departureTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }),
      price: trip.pricePerSeat,
      vehicle: {
        type: vehicle?.type === 'sedan' ? 'sedan' as const :
              vehicle?.type === 'minivan' ? 'van' as const :
              vehicle?.type === 'minimpv' ? 'van' as const :
              vehicle?.capacity && vehicle.capacity > 15 ? 'bus' as const : 'minibus' as const,
        model: vehicle?.model || 'Unknown Vehicle',
        capacity: vehicle?.capacity || 4,
        features: vehicle?.features || []
      },
      driver: {
        name: driver?.firstName && driver?.lastName ?
              `${driver.firstName} ${driver.lastName}` : 'Unknown Driver',
        rating: Math.random() * 1 + 4 // Random rating between 4-5
      },
      availableSeats: trip.availableSeats,
      status: trip.status,
      duration: route?.duration || 120,
      distance: route?.distance || 100,
      startCoords: {
        latitude: route?.origin.latitude || 0,
        longitude: route?.origin.longitude || 0
      },
      endCoords: {
        latitude: route?.destination.latitude || 0,
        longitude: route?.destination.longitude || 0
      }
    };
  });
};

// Get available routes for search
export const getAvailableRoutes = () => {
  return mockRoutes.filter(route => route.isActive).map(route => ({
    id: route.id,
    name: route.name,
    origin: route.origin.name,
    destination: route.destination.name,
    distance: route.distance,
    duration: route.duration
  }));
};

// Get vehicle types for seat layout
export const getVehicleTypeFromCapacity = (capacity: number): 'sedan' | 'van' | 'bus' | 'minibus' => {
  if (capacity <= 5) return 'sedan';
  if (capacity <= 14) return 'van';
  if (capacity <= 20) return 'minibus';
  return 'bus';
};

// Format duration for display
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}min`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}min`;
  }
};

// Format distance for display
export const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  } else {
    return `${km.toFixed(1)}km`;
  }
};

// Generate seat layout based on vehicle type
export const generateSeatLayout = (vehicleType: 'sedan' | 'van' | 'bus' | 'minibus', capacity: number) => {
  const seats = [];

  switch (vehicleType) {
    case 'sedan':
      // 2+2 layout
      for (let row = 1; row <= Math.ceil(capacity / 2); row++) {
        for (let pos = 1; pos <= 2; pos++) {
          const seatNumber = `${row}${pos === 1 ? 'A' : 'B'}`;
          seats.push({
            id: `seat-${seatNumber}`,
            number: seatNumber,
            row,
            position: pos === 1 ? 'window' : 'window',
            isAvailable: Math.random() > 0.2,
            isSelected: false,
            type: 'standard'
          });
        }
      }
      break;

    case 'van':
      // 2+2 layout for van
      for (let row = 1; row <= Math.ceil(capacity / 2); row++) {
        for (let pos = 1; pos <= 2; pos++) {
          const seatNumber = `${row}${pos === 1 ? 'A' : 'B'}`;
          seats.push({
            id: `seat-${seatNumber}`,
            number: seatNumber,
            row,
            position: pos === 1 ? 'window' : 'window',
            isAvailable: Math.random() > 0.15,
            isSelected: false,
            type: row <= 2 ? 'premium' : 'standard'
          });
        }
      }
      break;

    case 'bus':
    case 'minibus':
      // 2+2 layout for bus
      for (let row = 1; row <= Math.ceil(capacity / 4); row++) {
        for (let pos = 1; pos <= 4; pos++) {
          const seatLetter = pos === 1 ? 'A' : pos === 2 ? 'B' : pos === 3 ? 'C' : 'D';
          const seatNumber = `${row}${seatLetter}`;
          seats.push({
            id: `seat-${seatNumber}`,
            number: seatNumber,
            row,
            position: pos === 1 || pos === 4 ? 'window' : 'aisle',
            isAvailable: Math.random() > 0.1,
            isSelected: false,
            type: row <= 3 ? 'premium' : 'standard'
          });
        }
      }
      break;
  }

  return seats.slice(0, capacity);
};
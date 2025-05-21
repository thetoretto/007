import React, { useState, useEffect, useRef } from 'react';
import { sendWebSocketMessage } from '../../utils/websocket';

interface Location {
  latitude: number;
  longitude: number;
  name?: string;
}

interface MapDisplayProps {
  routeCoordinates?: Location[];
  pickupLocation?: Location;
  dropoffLocation?: Location;
  vehicleId?: string;
  tripId?: string;
  height?: string;
  width?: string;
  enableLiveTracking?: boolean;
}

const MapDisplay: React.FC<MapDisplayProps> = ({
  height = '400px',
  width = '100%',
  routeCoordinates = [],
  pickupLocation,
  dropoffLocation,
  vehicleId,
  tripId,
  enableLiveTracking = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [vehiclePosition, setVehiclePosition] = useState<Location | null>(null);
  const [isTracking, setIsTracking] = useState(enableLiveTracking);
  
  // Simulate vehicle movement along route
  useEffect(() => {
    if (!isTracking || !tripId || !vehicleId || routeCoordinates.length < 2) return;
    
    // Start with first coordinate
    setVehiclePosition(routeCoordinates[0]);
    
    // Create a route path to follow
    let currentPointIndex = 0;
    const maxPoints = routeCoordinates.length;
    
    // Move vehicle along the route every 2 seconds
    const interval = setInterval(() => {
      currentPointIndex = (currentPointIndex + 1) % maxPoints;
      setVehiclePosition(routeCoordinates[currentPointIndex]);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isTracking, tripId, vehicleId, routeCoordinates]);
  
  // Draw map on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get canvas dimensions
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background
    ctx.fillStyle = '#e5e7eb'; // Light gray
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid lines
    ctx.strokeStyle = '#d1d5db'; // Lighter gray
    ctx.lineWidth = 1;
    
    // Draw grid
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Only continue if we have coordinates
    if (routeCoordinates.length === 0) {
      // Draw placeholder text
      ctx.fillStyle = '#6b7280'; // Gray
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Map data would be displayed here', width / 2, height / 2);
      return;
    }
    
    // Determine map bounds
    const bounds = calculateBounds([
      ...routeCoordinates,
      ...(pickupLocation ? [pickupLocation] : []),
      ...(dropoffLocation ? [dropoffLocation] : []),
      ...(vehiclePosition ? [vehiclePosition] : [])
    ]);
    
    // Draw route
    if (routeCoordinates.length > 1) {
      ctx.strokeStyle = '#3b82f6'; // Blue
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      routeCoordinates.forEach((coord, index) => {
        const point = projectToCanvas(coord, bounds, width, height);
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      
      ctx.stroke();
    }
    
    // Draw pickup location
    if (pickupLocation) {
      const point = projectToCanvas(pickupLocation, bounds, width, height);
      ctx.fillStyle = '#10b981'; // Green
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
      ctx.fill();
      
      // Label
      ctx.fillStyle = '#000000';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Pickup', point.x, point.y - 12);
    }
    
    // Draw dropoff location
    if (dropoffLocation) {
      const point = projectToCanvas(dropoffLocation, bounds, width, height);
      ctx.fillStyle = '#ef4444'; // Red
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
      ctx.fill();
      
      // Label
      ctx.fillStyle = '#000000';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Dropoff', point.x, point.y - 12);
    }
    
    // Draw vehicle
    if (vehiclePosition) {
      const point = projectToCanvas(vehiclePosition, bounds, width, height);
      ctx.fillStyle = '#f59e0b'; // Amber
      
      // Draw car shape
      ctx.beginPath();
      ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
      ctx.fill();
      
      // Label
      ctx.fillStyle = '#000000';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Vehicle', point.x, point.y - 12);
    }
  }, [routeCoordinates, pickupLocation, dropoffLocation, vehiclePosition]);
  
  // Request vehicle location data
  const requestVehicleLocation = () => {
    if (!tripId || !vehicleId) return;
    
    sendWebSocketMessage({
      type: 'REQUEST_VEHICLE_LOCATION',
      tripId,
      vehicleId
    });
  };
  
  const toggleTracking = () => {
    setIsTracking(!isTracking);
  };
  
  return (
    <div style={{ width, height }} className="relative border border-gray-300 rounded-lg overflow-hidden">
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={600}
        className="w-full h-full object-cover"
      />
      
      {(tripId && vehicleId) && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button 
            onClick={requestVehicleLocation}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Update Location
          </button>
          
          <button 
            onClick={toggleTracking}
            className={`px-3 py-1 rounded text-sm focus:outline-none focus:ring-2 ${
              isTracking 
                ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-300' 
                : 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-300'
            }`}
          >
            {isTracking ? 'Stop Tracking' : 'Start Tracking'}
          </button>
        </div>
      )}
    </div>
  );
};

// Helper function to calculate map bounds
function calculateBounds(coordinates: Location[]) {
  if (coordinates.length === 0) {
    return { minLat: 0, maxLat: 1, minLng: 0, maxLng: 1 };
  }
  
  let minLat = coordinates[0].latitude;
  let maxLat = coordinates[0].latitude;
  let minLng = coordinates[0].longitude;
  let maxLng = coordinates[0].longitude;
  
  coordinates.forEach(coord => {
    minLat = Math.min(minLat, coord.latitude);
    maxLat = Math.max(maxLat, coord.latitude);
    minLng = Math.min(minLng, coord.longitude);
    maxLng = Math.max(maxLng, coord.longitude);
  });
  
  // Add some padding
  const latPadding = (maxLat - minLat) * 0.1;
  const lngPadding = (maxLng - minLng) * 0.1;
  
  return {
    minLat: minLat - latPadding,
    maxLat: maxLat + latPadding,
    minLng: minLng - lngPadding,
    maxLng: maxLng + lngPadding
  };
}

// Helper function to project coordinates to canvas
function projectToCanvas(
  coord: Location, 
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }, 
  width: number, 
  height: number
) {
  const x = ((coord.longitude - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * width;
  // Y is inverted (0 is at the top in canvas)
  const y = (1 - (coord.latitude - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * height;
  
  return { x, y };
}

// Generate mock route between two points
export function generateMockRoute(
  start: Location, 
  end: Location, 
  pointCount: number = 10
): Location[] {
  const route: Location[] = [];
  
  // Add start point
  route.push(start);
  
  // Generate intermediate points
  for (let i = 1; i < pointCount - 1; i++) {
    const ratio = i / (pointCount - 1);
    
    // Linear interpolation with some random variation
    const lat = start.latitude + (end.latitude - start.latitude) * ratio + (Math.random() - 0.5) * 0.01;
    const lng = start.longitude + (end.longitude - start.longitude) * ratio + (Math.random() - 0.5) * 0.01;
    
    route.push({ latitude: lat, longitude: lng });
  }
  
  // Add end point
  route.push(end);
  
  return route;
}

export default MapDisplay; 
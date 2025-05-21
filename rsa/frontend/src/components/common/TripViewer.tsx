import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, User, Car, Filter, ArrowUpDown, Info, ChevronDown, ChevronUp, X, Sliders, Search } from 'lucide-react';
import MapDisplay, { generateMockRoute } from './MapDisplay';
import { showNotification } from '../../utils/notifications';
import ConfirmationModal from './ConfirmationModal';

// Mock trip data for demonstration
const mockTrips = [
  {
    id: 'trip-1',
    fromLocation: 'Downtown Station',
    toLocation: 'Airport Terminal',
    date: '2025-06-15',
    time: '08:00',
    price: 25.99,
    vehicle: {
      type: 'Shuttle',
      model: 'Mercedes Sprinter',
      capacity: 20,
      features: ['Air Conditioning', 'WiFi', 'USB Charging']
    },
    driver: {
      name: 'Robert Johnson',
      rating: 4.8
    },
    availableSeats: 12,
    status: 'scheduled',
    duration: 25,
    distance: 15.2,
    startCoords: { latitude: 40.7128, longitude: -74.0060 },
    endCoords: { latitude: 40.6413, longitude: -73.7781 }
  },
  {
    id: 'trip-2',
    fromLocation: 'Airport Terminal',
    toLocation: 'Downtown Station',
    date: '2025-06-15',
    time: '10:30',
    price: 27.99,
    vehicle: {
      type: 'Minibus',
      model: 'Ford Transit',
      capacity: 15,
      features: ['Air Conditioning', 'Wheelchair Accessible']
    },
    driver: {
      name: 'Robert Johnson',
      rating: 4.8
    },
    availableSeats: 5,
    status: 'scheduled',
    duration: 30,
    distance: 15.2,
    startCoords: { latitude: 40.6413, longitude: -73.7781 },
    endCoords: { latitude: 40.7128, longitude: -74.0060 }
  },
  {
    id: 'trip-3',
    fromLocation: 'Downtown Station',
    toLocation: 'Central Mall',
    date: '2025-06-15',
    time: '13:00',
    price: 18.50,
    vehicle: {
      type: 'Shuttle',
      model: 'Mercedes Sprinter',
      capacity: 20,
      features: ['Air Conditioning', 'WiFi', 'USB Charging']
    },
    driver: {
      name: 'Robert Johnson',
      rating: 4.8
    },
    availableSeats: 8,
    status: 'scheduled',
    duration: 15,
    distance: 8.5,
    startCoords: { latitude: 40.7128, longitude: -74.0060 },
    endCoords: { latitude: 40.7421, longitude: -73.9914 }
  },
  {
    id: 'trip-4',
    fromLocation: 'Central Mall',
    toLocation: 'University Campus',
    date: '2025-06-15',
    time: '15:30',
    price: 14.99,
    vehicle: {
      type: 'Shuttle',
      model: 'Toyota Coaster',
      capacity: 25,
      features: ['Air Conditioning', 'WiFi', 'Entertainment', 'Restroom']
    },
    driver: {
      name: 'Robert Johnson',
      rating: 4.8
    },
    availableSeats: 20,
    status: 'scheduled',
    duration: 20,
    distance: 7.3,
    startCoords: { latitude: 40.7421, longitude: -73.9914 },
    endCoords: { latitude: 40.7291, longitude: -73.9965 }
  },
  {
    id: 'trip-5',
    fromLocation: 'University Campus',
    toLocation: 'Airport Terminal',
    date: '2025-06-16',
    time: '09:00',
    price: 29.99,
    vehicle: {
      type: 'Minibus',
      model: 'Ford Transit',
      capacity: 15,
      features: ['Air Conditioning', 'Wheelchair Accessible']
    },
    driver: {
      name: 'Robert Johnson',
      rating: 4.8
    },
    availableSeats: 15,
    status: 'scheduled',
    duration: 35,
    distance: 20.1,
    startCoords: { latitude: 40.7291, longitude: -73.9965 },
    endCoords: { latitude: 40.6413, longitude: -73.7781 }
  }
];

interface TripViewerProps {
  onTripSelect?: (trip: any) => void;
}

const TripViewer: React.FC<TripViewerProps> = ({ onTripSelect }) => {
  const [trips, setTrips] = useState(mockTrips);
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null);
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>('time');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterDate, setFilterDate] = useState<string>(mockTrips[0].date);
  const [filterVehicleType, setFilterVehicleType] = useState<string>('');
  const [filterRoute, setFilterRoute] = useState<string>('');
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState({
    title: '',
    message: '',
    type: 'info' as 'success' | 'warning' | 'error' | 'info',
    onConfirm: () => {}
  });

  // Filter options derived from mock data
  const availableDates = [...new Set(mockTrips.map(trip => trip.date))];
  const availableRoutes = [...new Set(mockTrips.map(trip => `${trip.fromLocation} to ${trip.toLocation}`))];
  const availableVehicleTypes = [...new Set(mockTrips.map(trip => trip.vehicle.type))];

  useEffect(() => {
    // Apply filters
    let filteredTrips = [...mockTrips];
    
    if (filterDate) {
      filteredTrips = filteredTrips.filter(trip => trip.date === filterDate);
    }
    
    if (filterVehicleType) {
      filteredTrips = filteredTrips.filter(trip => trip.vehicle.type === filterVehicleType);
    }
    
    if (filterRoute) {
      const [from, to] = filterRoute.split(' to ');
      filteredTrips = filteredTrips.filter(trip => 
        trip.fromLocation === from && trip.toLocation === to
      );
    }
    
    // Apply sorting
    filteredTrips.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortField) {
        case 'price':
          valueA = a.price;
          valueB = b.price;
          break;
        case 'time':
          valueA = a.time;
          valueB = b.time;
          break;
        case 'duration':
          valueA = a.duration;
          valueB = b.duration;
          break;
        case 'availableSeats':
          valueA = a.availableSeats;
          valueB = b.availableSeats;
          break;
        default:
          valueA = a.time;
          valueB = b.time;
      }
      
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setTrips(filteredTrips);
  }, [filterDate, filterVehicleType, filterRoute, sortField, sortDirection]);

  const handleTripClick = (trip: any) => {
    setSelectedTrip(trip);
    setExpandedTripId(trip.id === expandedTripId ? null : trip.id);
    
    if (expandedTripId !== trip.id) {
      // Generate a route for the map
      const route = generateMockRoute(
        { latitude: trip.startCoords.latitude, longitude: trip.startCoords.longitude, name: trip.fromLocation },
        { latitude: trip.endCoords.latitude, longitude: trip.endCoords.longitude, name: trip.toLocation },
        10
      );
      setRouteCoordinates(route);
    }
    
    if (onTripSelect && expandedTripId !== trip.id) {
      onTripSelect(trip);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleBookTrip = (trip: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent expanding the trip card
    
    setShowConfirmation(true);
    setConfirmationData({
      title: 'Confirm Booking',
      message: `Would you like to book the ${trip.time} trip from ${trip.fromLocation} to ${trip.toLocation} for $${trip.price.toFixed(2)}?`,
      type: 'success',
      onConfirm: () => {
        showNotification(
          'Trip Booking Confirmed',
          { body: `You've booked the ${trip.time} trip from ${trip.fromLocation} to ${trip.toLocation}` }
        );
        
        // Update available seats in the UI
        setTrips(trips.map(t => 
          t.id === trip.id 
            ? {...t, availableSeats: t.availableSeats - 1} 
            : t
        ));
      }
    });
  };

  const clearAllFilters = () => {
    setFilterDate(mockTrips[0].date);
    setFilterVehicleType('');
    setFilterRoute('');
    setShowFilters(false);
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-1" />;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={confirmationData.onConfirm}
        title={confirmationData.title}
        message={confirmationData.message}
        type={confirmationData.type}
      />
      
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Available Trips</h2>
        
        {/* Mobile filter toggle */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 rounded-md border"
            aria-expanded={showFilters}
            aria-controls="filters-panel"
          >
            <div className="flex items-center">
              <Sliders className="h-4 w-4 mr-2" />
              <span>Filters & Sorting</span>
            </div>
            <ChevronDown className={`h-5 w-5 transition-transform ${showFilters ? 'transform rotate-180' : ''}`} />
          </button>
        </div>
        
        {/* Filters section - toggleable on mobile */}
        <div id="filters-panel" className={`${showFilters ? 'block' : 'hidden'} md:block`}>
          <div className="bg-gray-50 p-3 rounded-lg mb-4 border">
            <div className="flex flex-col md:flex-row gap-3 mb-3">
              <div className="flex-1">
                <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <select
                  id="date-filter"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                >
                  {availableDates.map((date) => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex-1">
                <label htmlFor="route-filter" className="block text-sm font-medium text-gray-700 mb-1">Route</label>
                <select
                  id="route-filter"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={filterRoute}
                  onChange={(e) => setFilterRoute(e.target.value)}
                >
                  <option value="">All Routes</option>
                  {availableRoutes.map((route) => (
                    <option key={route} value={route}>{route}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex-1">
                <label htmlFor="vehicle-filter" className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                <select
                  id="vehicle-filter"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={filterVehicleType}
                  onChange={(e) => setFilterVehicleType(e.target.value)}
                >
                  <option value="">All Types</option>
                  {availableVehicleTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-2">
              <button
                onClick={() => handleSort('time')}
                className={`flex items-center px-3 py-1.5 text-sm rounded border 
                  ${sortField === 'time' ? 'bg-blue-50 border-blue-300 text-blue-800' : 'bg-white border-gray-300'}`}
              >
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">Departure</span> Time
                {getSortIcon('time')}
              </button>
              
              <button
                onClick={() => handleSort('price')}
                className={`flex items-center px-3 py-1.5 text-sm rounded border 
                  ${sortField === 'price' ? 'bg-blue-50 border-blue-300 text-blue-800' : 'bg-white border-gray-300'}`}
              >
                Price
                {getSortIcon('price')}
              </button>
              
              <button
                onClick={() => handleSort('duration')}
                className={`flex items-center px-3 py-1.5 text-sm rounded border 
                  ${sortField === 'duration' ? 'bg-blue-50 border-blue-300 text-blue-800' : 'bg-white border-gray-300'}`}
              >
                Duration
                {getSortIcon('duration')}
              </button>
              
              <button
                onClick={() => handleSort('availableSeats')}
                className={`flex items-center px-3 py-1.5 text-sm rounded border 
                  ${sortField === 'availableSeats' ? 'bg-blue-50 border-blue-300 text-blue-800' : 'bg-white border-gray-300'}`}
              >
                <span className="hidden sm:inline">Available</span> Seats
                {getSortIcon('availableSeats')}
              </button>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={clearAllFilters}
                className="flex items-center px-2 py-1 text-xs text-gray-700 hover:text-gray-900"
              >
                <X className="h-3 w-3 mr-1" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>
        
        {/* Trip list */}
        <div className="space-y-3">
          {trips.length === 0 ? (
            <div className="text-center py-8">
              <Search className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No trips match your filters.</p>
              <button
                onClick={clearAllFilters}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            trips.map((trip) => (
              <div 
                key={trip.id}
                className={`border rounded-lg overflow-hidden transition-shadow hover:shadow-md ${
                  expandedTripId === trip.id ? 'border-blue-500 shadow-md' : 'hover:border-gray-300'
                }`}
              >
                <div 
                  className="p-3 cursor-pointer"
                  onClick={() => handleTripClick(trip)}
                >
                  {/* Trip header */}
                  <div className="flex flex-wrap justify-between items-start">
                    <div className="mb-2 sm:mb-0">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-500 mr-1.5" />
                        <span className="font-medium">{trip.time}</span>
                        <span className="mx-2 text-gray-400">•</span>
                        <span className="text-sm text-gray-600">{trip.duration} min</span>
                      </div>
                      
                      <div className="flex flex-col mt-1">
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 text-green-500 mt-0.5 mr-1.5" />
                          <span className="text-sm">{trip.fromLocation}</span>
                        </div>
                        <div className="flex items-start mt-1">
                          <MapPin className="h-4 w-4 text-red-500 mt-0.5 mr-1.5" />
                          <span className="text-sm">{trip.toLocation}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <div className="text-lg font-semibold text-blue-600">${trip.price.toFixed(2)}</div>
                      <div className="text-sm text-gray-500 mt-1">{trip.availableSeats} seats left</div>
                      <button 
                        onClick={(e) => handleBookTrip(trip, e)}
                        className="mt-2 px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded shadow-sm"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                  
                  {/* Vehicle info preview */}
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <Car className="h-3.5 w-3.5 mr-1" />
                    <span>{trip.vehicle.type} • {trip.vehicle.model}</span>
                  </div>
                  
                  {expandedTripId !== trip.id && (
                    <div className="mt-2 text-xs text-blue-600 flex items-center">
                      <Info className="h-3.5 w-3.5 mr-1" />
                      Click for details
                    </div>
                  )}
                </div>
                
                {/* Expanded details */}
                {expandedTripId === trip.id && (
                  <div className="border-t bg-gray-50 p-3">
                    <div className="lg:flex gap-4">
                      {/* Map */}
                      <div className="lg:w-1/2 rounded overflow-hidden border mb-3 lg:mb-0">
                        <MapDisplay 
                          height="200px"
                          pickupLocation={{ 
                            latitude: trip.startCoords.latitude, 
                            longitude: trip.startCoords.longitude,
                            name: trip.fromLocation 
                          }}
                          dropoffLocation={{ 
                            latitude: trip.endCoords.latitude, 
                            longitude: trip.endCoords.longitude,
                            name: trip.toLocation
                          }}
                          routeCoordinates={routeCoordinates}
                        />
                      </div>
                      
                      {/* Details */}
                      <div className="lg:w-1/2">
                        <h4 className="font-medium text-sm mb-2">Trip Details</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <div className="text-gray-600">Date:</div>
                            <div className="font-medium">{new Date(trip.date).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Distance:</div>
                            <div className="font-medium">{trip.distance} miles</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Vehicle:</div>
                            <div className="font-medium">{trip.vehicle.model}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Capacity:</div>
                            <div className="font-medium">{trip.vehicle.capacity} passengers</div>
                          </div>
                        </div>
                        
                        <h4 className="font-medium text-sm mt-3 mb-1">Features</h4>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {trip.vehicle.features.map((feature: string) => (
                            <span 
                              key={feature} 
                              className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex justify-between items-center mt-3 pt-3 border-t">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-1.5" />
                            <span className="text-sm">{trip.driver.name}</span>
                            <div className="ml-2 px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                              {trip.driver.rating} ★
                            </div>
                          </div>
                          <button 
                            onClick={(e) => handleBookTrip(trip, e)}
                            className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm rounded shadow-sm"
                          >
                            Book Trip
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TripViewer; 
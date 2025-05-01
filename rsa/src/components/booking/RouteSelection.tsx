import React, { useEffect, useState } from 'react';
import { ArrowRight, MapPin, Search, Check } from 'lucide-react';
import useBookingStore from '../../store/bookingStore';
import LoadingSpinner from '../common/LoadingSpinner'; 
import { Route } from '../../types';

// Rwanda cities for dropdowns
const rwandaCities = [
  'Kigali',
  'Butare',
  'Gitarama',
  'Ruhengeri',
  'Gisenyi',
  'Byumba',
  'Cyangugu',
  'Gikongoro',
  'Kibungo',
  'Kibuye',
  'Nyanza',
  'Ruhango',
  'Rwamagana'
];

// Popular bus stops in Rwanda
const popularBusStops = [
  'Nyabugogo Bus Terminal',
  'Remera Bus Stop',
  'Kimironko Bus Station',
  'Downtown Kigali Station',
  'Huye Bus Terminal',
  'Musanze Bus Station',
  'Rubavu Terminal',
  'Rusizi Bus Stop',
  'Nyagatare Station',
  'Karongi Bus Terminal'
];

const RouteSelection: React.FC = () => {
  const { 
    routes, 
    selectedRoute, 
    fetchRoutes, 
    selectRoute,
    loading, 
    error 
  } = useBookingStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [originCity, setOriginCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [pickAvailable, setPickAvailable] = useState(false);
  const [departureStop, setDepartureStop] = useState('');
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  useEffect(() => {
    if (routes.length > 0) {
      if (searchTerm) {
        const lowerCaseSearch = searchTerm.toLowerCase();
        setFilteredRoutes(
          routes.filter(
            route =>
              route.name.toLowerCase().includes(lowerCaseSearch) ||
              route.origin.name.toLowerCase().includes(lowerCaseSearch) ||
              route.destination.name.toLowerCase().includes(lowerCaseSearch) ||
              route.origin.city.toLowerCase().includes(lowerCaseSearch) ||
              route.destination.city.toLowerCase().includes(lowerCaseSearch)
          )
        );
      } else {
        setFilteredRoutes(routes);
      }
    }
  }, [routes, searchTerm]);

  const handleRouteSelect = (routeId: string) => {
    selectRoute(routeId);
  };

  if (loading && routes.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-error-50 text-error-700 rounded-md">
        <p>Error: {error}</p>
        <button
          onClick={() => fetchRoutes()}
          className="mt-2 btn btn-primary text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-semibold mb-4">Select Your Route</h2>
      
      {/* Rwanda City Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-1">
            Origin City
          </label>
          <select
            id="origin"
            value={originCity}
            onChange={(e) => setOriginCity(e.target.value)}
            className="form-select block w-full"
          >
            <option value="">Select origin city</option>
            {rwandaCities.map(city => (
              <option key={`origin-${city}`} value={city}>{city}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
            Destination City
          </label>
          <select
            id="destination"
            value={destinationCity}
            onChange={(e) => setDestinationCity(e.target.value)}
            className="form-select block w-full"
          >
            <option value="">Select destination city</option>
            {rwandaCities.map(city => (
              <option key={`dest-${city}`} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Departure Bus Stop Selection */}
      <div className="mb-6">
        <label htmlFor="departure-stop" className="block text-sm font-medium text-gray-700 mb-1">
          Departure Bus Stop
        </label>
        <select
          id="departure-stop"
          value={departureStop}
          onChange={(e) => setDepartureStop(e.target.value)}
          className="form-select block w-full"
        >
          <option value="">Select departure bus stop</option>
          {popularBusStops.map(stop => (
            <option key={stop} value={stop}>{stop}</option>
          ))}
        </select>
      </div>
      
      {/* Pick Available Checkbox */}
      <div className="mb-6">
        <label className="inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={pickAvailable}
            onChange={() => setPickAvailable(!pickAvailable)}
          />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
          <span className="ms-3 text-sm font-medium text-gray-700">Show only available routes</span>
        </label>
      </div>
      
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search for routes, cities, or stations"
          className="form-input pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="space-y-4">
        {filteredRoutes.length > 0 ? (
          filteredRoutes.map(route => (
            <div
              key={route.id}
              className={`
                p-4 rounded-lg cursor-pointer border transition-all duration-200 ease-in-out 
                transform hover:scale-[1.01] hover:shadow-md
                ${
                  selectedRoute?.id === route.id
                    ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200 shadow-lg scale-[1.01]' // Enhanced selected state
                    : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300' // Added hover effect
                }
              `}
              onClick={() => handleRouteSelect(route.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-primary-500 mr-1 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{route.origin.name}</p>
                      <p className="text-sm text-gray-500">
                        {route.origin.city}, {route.origin.state}
                      </p>
                    </div>
                  </div>
                </div>
                
                <ArrowRight className="h-5 w-5 text-gray-400 mx-2" />
                
                <div className="flex-1 text-right">
                  <div className="flex items-start justify-end">
                    <div>
                      <p className="font-medium">{route.destination.name}</p>
                      <p className="text-sm text-gray-500">
                        {route.destination.city}, {route.destination.state}
                      </p>
                    </div>
                    <MapPin className="h-5 w-5 text-accent-500 ml-1 mt-1 flex-shrink-0" />
                  </div>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
                <div>
                  <span className="text-gray-500">Distance:</span>{' '}
                  <span className="font-medium">{route.distance} miles</span>
                </div>
                <div>
                  <span className="text-gray-500">Duration:</span>{' '}
                  <span className="font-medium">~{route.duration} mins</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No routes found matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteSelection;
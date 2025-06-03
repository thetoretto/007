import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Calendar, Clock, User, Car, Filter, ArrowUpDown, Info, ChevronDown, ChevronUp, X, Sliders, Search, ArrowRight } from 'lucide-react';
import MapDisplay, { generateMockRoute } from './MapDisplay';
import { showNotification } from '../../utils/notifications';
import ConfirmationModal from './ConfirmationModal';

// Define types for reusability
export interface TripVehicle {
  id?: string;
  type: string;
  model: string;
  capacity: number;
  features: string[];
}

export interface TripDriver {
  id?: string;
  name: string;
  rating: number;
  profileImage?: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Trip {
  id: string;
  fromLocation: string;
  toLocation: string;
  date: string;
  time: string;
  price: number;
  vehicle: TripVehicle;
  driver: TripDriver;
  availableSeats: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  duration: number;
  distance: number;
  startCoords: Coordinates;
  endCoords: Coordinates;
}

export interface TripViewerProps {
  trips: Trip[];
  onTripSelect?: (trip: Trip) => void;
  onTripBook?: (trip: Trip) => void;
  initialDate?: string;
  showFilters?: boolean;
  compact?: boolean;
  className?: string;
  mapHeight?: string;
  isLoading?: boolean;
}

const TripViewer: React.FC<TripViewerProps> = ({ 
  trips,
  onTripSelect,
  onTripBook,
  initialDate,
  showFilters = true,
  compact = false,
  className = '',
  mapHeight = '200px',
  isLoading = false
}) => {
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>(trips);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>('time');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterDate, setFilterDate] = useState<string>(initialDate || (trips[0]?.date || ''));
  const [filterVehicleType, setFilterVehicleType] = useState<string>('');
  const [filterRoute, setFilterRoute] = useState<string>('');
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState({
    title: '',
    message: '',
    type: 'info' as 'success' | 'warning' | 'error' | 'info',
    onConfirm: () => {}
  });

  // Filter options derived from available data
  const availableDates = useMemo(() => [...new Set(trips.map(trip => trip.date))], [trips]);
  const availableRoutes = useMemo(() => [...new Set(trips.map(trip => `${trip.fromLocation} to ${trip.toLocation}`))], [trips]);
  const availableVehicleTypes = useMemo(() => [...new Set(trips.map(trip => trip.vehicle.type))], [trips]);

  // Update trips when props change
  useEffect(() => {
    setFilteredTrips(trips);
  }, [trips]);

  useEffect(() => {
    // Apply filters
    let result = [...trips];
    
    if (filterDate) {
      result = result.filter(trip => trip.date === filterDate);
    }
    
    if (filterVehicleType) {
      result = result.filter(trip => trip.vehicle.type === filterVehicleType);
    }
    
    if (filterRoute) {
      const [from, to] = filterRoute.split(' to ');
      result = result.filter(trip => 
        trip.fromLocation === from && trip.toLocation === to
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
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
    
    setFilteredTrips(result);
  }, [trips, filterDate, filterVehicleType, filterRoute, sortField, sortDirection]);

  const handleTripClick = (trip: Trip) => {
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

  const handleBookTrip = (trip: Trip, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent expanding the trip card
    
    if (onTripBook) {
      onTripBook(trip);
      return;
    }
    
    // Default booking behavior if no callback provided
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
        setFilteredTrips(filteredTrips.map(t => 
          t.id === trip.id 
            ? {...t, availableSeats: t.availableSeats - 1} 
            : t
        ));
      }
    });
  };

  const clearAllFilters = () => {
    setFilterDate(initialDate || (trips[0]?.date || ''));
    setFilterVehicleType('');
    setFilterRoute('');
    setShowFiltersPanel(false);
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-1" />;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <div className="w-1/4 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="w-1/5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="flex justify-between items-end">
                  <div className="space-y-2">
                    <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="w-40 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md ${className}`}>
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
        <h2 className={`${compact ? 'text-lg' : 'text-xl'} font-semibold mb-4`}>Available Trips</h2>
        
        {/* Only show filters if enabled */}
        {showFilters && (
          <>
        {/* Mobile filter toggle */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-md border dark:border-gray-600"
            aria-expanded={showFiltersPanel}
            aria-controls="filters-panel"
          >
            <div className="flex items-center">
              <Sliders className="h-4 w-4 mr-2" />
              <span className="text-sm">Filters & Sorting</span>
            </div>
            <ChevronDown className={`h-5 w-5 transition-transform ${showFiltersPanel ? 'transform rotate-180' : ''}`} />
          </button>
        </div>
        
        {/* Filters section - toggleable on mobile */}
            <div id="filters-panel" className={`${showFiltersPanel ? 'block' : 'hidden'} md:block`}>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg mb-4 border dark:border-gray-600">
            <div className="flex flex-col md:flex-row gap-3 mb-3">
                  {availableDates.length > 0 && (
              <div className="flex-1">
                      <label htmlFor="date-filter" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <select
                  id="date-filter"
                        className="w-full h-9 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:border-accent-kente-gold focus:ring-accent-kente-gold bg-white dark:bg-gray-800 text-sm"
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
                  )}
              
                  {availableRoutes.length > 0 && (
              <div className="flex-1">
                      <label htmlFor="route-filter" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Route</label>
                <select
                  id="route-filter"
                        className="w-full h-9 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:border-accent-kente-gold focus:ring-accent-kente-gold bg-white dark:bg-gray-800 text-sm"
                  value={filterRoute}
                  onChange={(e) => setFilterRoute(e.target.value)}
                >
                  <option value="">All Routes</option>
                  {availableRoutes.map((route) => (
                    <option key={route} value={route}>{route}</option>
                  ))}
                </select>
              </div>
                  )}
              
                  {availableVehicleTypes.length > 0 && (
              <div className="flex-1">
                      <label htmlFor="vehicle-filter" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vehicle Type</label>
                <select
                  id="vehicle-filter"
                        className="w-full h-9 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:border-accent-kente-gold focus:ring-accent-kente-gold bg-white dark:bg-gray-800 text-sm"
                  value={filterVehicleType}
                  onChange={(e) => setFilterVehicleType(e.target.value)}
                >
                  <option value="">All Types</option>
                  {availableVehicleTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
                  )}
            </div>
            
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2">
              <button
                onClick={() => handleSort('time')}
                className={`flex items-center px-2 py-1 text-xs sm:text-sm rounded border 
                      ${sortField === 'time' ? 'bg-accent-kente-gold/10 border-accent-kente-gold text-accent-kente-gold-dark' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'}`}
              >
                <Clock className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Departure</span> Time
                {getSortIcon('time')}
              </button>
              
              <button
                onClick={() => handleSort('price')}
                className={`flex items-center px-2 py-1 text-xs sm:text-sm rounded border 
                      ${sortField === 'price' ? 'bg-accent-kente-gold/10 border-accent-kente-gold text-accent-kente-gold-dark' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'}`}
              >
                Price
                {getSortIcon('price')}
              </button>
              
              <button
                onClick={() => handleSort('duration')}
                className={`flex items-center px-2 py-1 text-xs sm:text-sm rounded border 
                      ${sortField === 'duration' ? 'bg-accent-kente-gold/10 border-accent-kente-gold text-accent-kente-gold-dark' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'}`}
              >
                Duration
                {getSortIcon('duration')}
              </button>
              
              <button
                onClick={() => handleSort('availableSeats')}
                className={`flex items-center px-2 py-1 text-xs sm:text-sm rounded border 
                      ${sortField === 'availableSeats' ? 'bg-accent-kente-gold/10 border-accent-kente-gold text-accent-kente-gold-dark' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'}`}
              >
                <span className="hidden sm:inline">Available</span> Seats
                {getSortIcon('availableSeats')}
              </button>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={clearAllFilters}
                    className="flex items-center px-2 py-1 text-xs text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="h-3 w-3 mr-1" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>
          </>
        )}
        
        {/* Trip list */}
        <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-1 pb-1" style={{ scrollbarWidth: 'thin' }}>
          {filteredTrips.length === 0 ? (
            <div className="text-center py-8">
              <Search className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No trips match your filters.</p>
              {showFilters && (
              <button
                onClick={clearAllFilters}
                  className="mt-2 text-accent-kente-gold hover:text-accent-kente-gold-dark text-sm"
              >
                Clear all filters
              </button>
              )}
            </div>
          ) : (
            filteredTrips.map((trip) => (
              <div 
                key={trip.id}
                className={`border rounded-lg overflow-hidden transition-shadow hover:shadow-md ${
                  expandedTripId === trip.id ? 'border-accent-kente-gold shadow-md' : 'hover:border-gray-300 dark:border-gray-700'
                }`}
              >
                <div 
                  className="p-3 sm:p-4 cursor-pointer"
                  onClick={() => handleTripClick(trip)}
                >
                  {/* Trip header */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-3">
                    <div className="mb-2 sm:mb-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full px-2 py-0.5 text-xs sm:text-sm font-medium flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {trip.time}
                        </div>
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{trip.duration} min journey</span>
                      </div>
                      
                      <div className="flex flex-col mt-2 sm:mt-3">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-accent-red/10 flex items-center justify-center mr-2">
                            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent-red" />
                          </div>
                          <span className="font-medium text-sm sm:text-base">{trip.fromLocation}</span>
                        </div>
                        <div className="w-7 sm:w-8 flex justify-center">
                          <div className="h-5 sm:h-6 border-l-2 border-dashed border-gray-300 dark:border-gray-600 my-0.5 sm:my-1"></div>
                        </div>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-accent-kente-gold/10 flex items-center justify-center mr-2">
                            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent-kente-gold" />
                          </div>
                          <span className="font-medium text-sm sm:text-base">{trip.toLocation}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-row sm:flex-col justify-between sm:items-end items-center">
                      <div>
                        <div className="text-lg sm:text-xl font-bold text-accent-kente-gold">${trip.price.toFixed(2)}</div>
                        <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                          <span>{trip.availableSeats} seats left</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={(e) => handleBookTrip(trip, e)}
                        className="btn btn-accent btn-sm sm:btn-md sm:btn-wide sm:btn-block sm:mt-2"
                      >
                        Book Now
                        <ArrowRight className="ml-1 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Vehicle info preview */}
                  <div className="mt-2 sm:mt-3 flex items-center justify-between">
                    <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      <Car className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                      <span>{trip.vehicle.type} • {trip.vehicle.model}</span>
                    </div>
                    
                    {expandedTripId !== trip.id && (
                      <div className="text-xs text-accent-kente-gold flex items-center">
                        <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                        <span>View details</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Expanded details */}
                {expandedTripId === trip.id && (
                  <div className="border-t bg-gray-50 dark:bg-gray-800/50 p-4">
                    <div className="lg:flex gap-6">
                      {/* Map */}
                      {!compact && (
                        <div className="lg:w-1/2 rounded-lg overflow-hidden border dark:border-gray-700 shadow-sm mb-4 lg:mb-0">
                          <MapDisplay 
                            height={mapHeight}
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
                      )}
                      
                      {/* Details */}
                      <div className={compact ? 'w-full' : 'lg:w-1/2'}>
                        <div className="flex justify-between items-center mb-3 sm:mb-4">
                          <h4 className="font-medium text-sm sm:text-base">Trip Details</h4>
                          <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                            {trip.status === 'scheduled' ? 'Scheduled' : 
                             trip.status === 'in-progress' ? 'In Progress' : 
                             trip.status === 'completed' ? 'Completed' : 'Cancelled'}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                          <div className="bg-white dark:bg-gray-700/50 p-2.5 sm:p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">Date</div>
                            <div className="font-medium text-sm flex items-center">
                              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent-kente-gold mr-1.5" />
                              {new Date(trip.date).toLocaleDateString(undefined, {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                          
                          <div className="bg-white dark:bg-gray-700/50 p-2.5 sm:p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">Distance</div>
                            <div className="font-medium text-sm flex items-center">
                              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent-kente-gold mr-1.5" />
                              {trip.distance} miles
                            </div>
                          </div>
                          
                          <div className="bg-white dark:bg-gray-700/50 p-2.5 sm:p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">Vehicle</div>
                            <div className="font-medium text-sm flex items-center">
                              <Car className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent-kente-gold mr-1.5" />
                              {trip.vehicle.model}
                            </div>
                          </div>
                          
                          <div className="bg-white dark:bg-gray-700/50 p-2.5 sm:p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">Capacity</div>
                            <div className="font-medium text-sm flex items-center">
                              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent-kente-gold mr-1.5" />
                              {trip.vehicle.capacity} passengers
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="font-medium mb-2 text-sm">Vehicle Features</h4>
                          <div className="flex flex-wrap gap-2">
                            {trip.vehicle.features.map((feature: string) => (
                              <span 
                                key={feature} 
                                className="px-3 py-1 bg-accent-kente-gold/10 text-accent-kente-gold-dark dark:text-accent-kente-gold rounded-full text-xs font-medium"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 mt-4 bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mr-3">
                              <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            </div>
                            <div>
                              <div className="font-medium">{trip.driver.name}</div>
                              <div className="flex items-center">
                                <div className="text-yellow-500">★</div>
                                <div className="text-sm ml-1">{trip.driver.rating.toFixed(1)}</div>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => handleBookTrip(trip, e)}
                            className="px-4 py-2 bg-accent-kente-gold hover:bg-accent-kente-gold-dark text-white text-sm rounded-lg flex items-center transition-colors"
                          >
                            Book Trip
                            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
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
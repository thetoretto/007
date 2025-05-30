import '../../index.css';
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useBookingStore, type BookingWithDetails } from '../../store/bookingStore';
import Navbar from '../../components/common/Navbar';
import { ChevronDown, Filter, CalendarDays, Clock, MapPin, Users, Tag, Inbox, AlertCircle, CheckCircle, XCircle, Info, ListFilter, Search, ArrowLeft } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import SkeletonCard from '../../components/common/SkeletonCard';
// Using a local card component since the UI library import is causing issues
// import { Card } from '@/components/ui/card';

// Define a simple Card component to use until UI library issues are resolved
const Card: React.FC<React.PropsWithChildren<{className?: string, key?: string}>> = ({ children, className = '', key }) => {
  return (
    <div key={key} className={`card overflow-hidden ${className}`}>
      {children}
    </div>
  );

  // Modal Content
  const renderModalContent = () => {
    if (!selectedTrip) return null;

    // Placeholder for trip details and actions
    return (
      <div>
        <p className="text-gray-700 dark:text-gray-300 mb-2">
          <strong>Route:</strong> {selectedTrip.route?.origin?.name} to {selectedTrip.route?.destination?.name}
        </p>
        <p className="text-gray-700 dark:text-gray-300 mb-2">
          <strong>Date:</strong> {selectedTrip.trip?.date} at {selectedTrip.trip?.time}
        </p>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          <strong>Status:</strong> {getStatusBadge(selectedTrip.status)}
        </p>
        
        {/* Action Buttons Placeholder */}
        <div className="mt-6 flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-2 sm:space-y-0">
          <button 
            onClick={closeTripModal} 
            className="btn btn-outline w-full sm:w-auto"
          >
            Close
          </button>
          {/* Conditional Cancel Button - logic to be refined */}
          {(selectedTrip.status === 'confirmed' || selectedTrip.status === 'booked') && (
            <button 
              onClick={() => alert('Two-step cancellation to be implemented!')} 
              className="btn btn-error w-full sm:w-auto"
            >
              Cancel Trip
            </button>
          )}
          <button 
            onClick={() => alert('Share functionality to be implemented!')} 
            className="btn btn-secondary w-full sm:w-auto"
          >
            Share
          </button>
          {/* Conditional Delete Button - logic to be refined */}
          {selectedTrip.status === 'cancelled' && (
             <button 
              onClick={() => alert('Delete functionality to be implemented!')} 
              className="btn btn-danger-outline w-full sm:w-auto"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-50 transition-colors duration-300">
      {/* Navbar is handled by the main layout, spacing is managed by .glass-navbar-dashboard margins */}
      {/* <Navbar /> Ensure Navbar is part of a layout component or add it here if needed */}
      <div className="container-app py-8 md:py-12">
        {/* Header with back button and title - This is duplicated, ensure it's correctly placed or remove if Navbar handles it */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/passenger/dashboard" className="btn btn-ghost btn-sm flex items-center">
            <ArrowLeft size={18} className="mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white flex-grow">My Trips</h1>
          <div className="w-auto"></div> 
        </div>

        {/* Filter and Sort Controls - Existing UI */}
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label htmlFor="search-trip" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search-trip"
                  placeholder="ID, Origin, Destination..."
                  className="form-input w-full pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select 
                id="filter-status" 
                className="form-select w-full"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="booked">Booked</option> 
                <option value="checked-in">Checked In</option>
                <option value="validated">Validated</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label htmlFor="sort-trip" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
              <select 
                id="sort-trip" 
                className="form-select w-full"
                value={getCurrentSortValue()}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="dateDesc">Date (Newest First)</option>
                <option value="dateAsc">Date (Oldest First)</option>
                <option value="routeAsc">Route (A-Z)</option>
                <option value="routeDesc">Route (Z-A)</option>
                <option value="status">Status</option>
              </select>
            </div>
            {/* Placeholder for Advanced Filters Button */}
            <button className="btn btn-outline flex items-center justify-center lg:mt-7" onClick={() => alert('Advanced Filters UI to be implemented here.')}>
              <ListFilter size={18} className="mr-2" /> Advanced Filters
            </button>
          </div>
        </div>

        {error && <p className="text-center py-10 text-red-500">Error loading trips: {error}</p>}

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => <SkeletonCard key={n} />)}
          </div>
        )}

        {!isLoading && !error && sortedUserBookings.length === 0 && (
          <div className="text-center py-10">
            <Inbox className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No Trips Found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No trips match your current filters or you have no bookings yet. Try adjusting your search or check back later.</p>
          </div>
        )}

        {!isLoading && !error && sortedUserBookings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedUserBookings.map((booking) => (
              <Card 
                key={booking.id} 
                className="flex flex-col justify-between bg-white dark:bg-card-dark shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => openTripModal(booking)}
              >
                <div className="px-4 py-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-md font-semibold text-primary-600">
                      {booking.route?.origin?.name} to {booking.route?.destination?.name}
                    </p>
                    <div className="ml-2 flex flex-shrink-0">
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <CalendarDays className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {booking.trip?.date && booking.trip?.time ? 
                          new Date(booking.trip.date + 'T' + booking.trip.time).toLocaleDateString([], {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }) : 'Date N/A'} at {booking.trip?.time || 'Time N/A'}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-4">
                        <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {booking.passenger?.firstName} {booking.passenger?.lastName}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <Tag className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      Booking ID: {booking.id}
                    </div>
                  </div>
                  {/* Direct cancel button removed from card, will be in modal */}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Trip Details Modal */}
      <Modal isOpen={isModalOpen} onClose={closeTripModal} title="Trip Details">
        {renderModalContent()}
      </Modal>
    </div>
  );
};

enum TripFilter {
  ALL = 'all',
  UPCOMING = 'upcoming',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

enum SortKey {
  DATE = 'date',
  ROUTE = 'route',
  STATUS = 'status',
}

enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

// Define interfaces for new filter types
interface PriceRange {
  min: number | null;
  max: number | null;
}

// Assuming you have a list of vehicle types and amenities
// These could also be fetched from an API
const ALL_VEHICLE_TYPES = ['Sedan', 'SUV', 'Van', 'Minibus', 'Bus', 'Other'] as const;
type VehicleType = typeof ALL_VEHICLE_TYPES[number];

const ALL_AMENITIES = ['WiFi', 'Air Conditioning', 'Pet Friendly', 'Wheelchair Accessible', 'Extra Luggage'] as const;
type Amenity = typeof ALL_AMENITIES[number];

// Basic Modal Component (can be moved to a separate file later)
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto transition-transform duration-300 ease-in-out scale-95 hover:scale-100" onClick={(e) => e.stopPropagation()}>
        {title && <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{title}</h2>}
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <XCircle size={24} />
        </button>
        {children}
      </div>
    </div>
  );

  // Modal Content
  const renderModalContent = () => {
    if (!selectedTrip) return null;

    // Placeholder for trip details and actions
    return (
      <div>
        <p className="text-gray-700 dark:text-gray-300 mb-2">
          <strong>Route:</strong> {selectedTrip.route?.origin?.name} to {selectedTrip.route?.destination?.name}
        </p>
        <p className="text-gray-700 dark:text-gray-300 mb-2">
          <strong>Date:</strong> {selectedTrip.trip?.date} at {selectedTrip.trip?.time}
        </p>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          <strong>Status:</strong> {getStatusBadge(selectedTrip.status)}
        </p>
        
        {/* Action Buttons Placeholder */}
        <div className="mt-6 flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-2 sm:space-y-0">
          <button 
            onClick={closeTripModal} 
            className="btn btn-outline w-full sm:w-auto"
          >
            Close
          </button>
          {/* Conditional Cancel Button - logic to be refined */}
          {(selectedTrip.status === 'confirmed' || selectedTrip.status === 'booked') && (
            <button 
              onClick={() => alert('Two-step cancellation to be implemented!')} 
              className="btn btn-error w-full sm:w-auto"
            >
              Cancel Trip
            </button>
          )}
          <button 
            onClick={() => alert('Share functionality to be implemented!')} 
            className="btn btn-secondary w-full sm:w-auto"
          >
            Share
          </button>
          {/* Conditional Delete Button - logic to be refined */}
          {selectedTrip.status === 'cancelled' && (
             <button 
              onClick={() => alert('Delete functionality to be implemented!')} 
              className="btn btn-danger-outline w-full sm:w-auto"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-50 transition-colors duration-300">
      {/* Navbar is handled by the main layout, spacing is managed by .glass-navbar-dashboard margins */}
      {/* <Navbar /> Ensure Navbar is part of a layout component or add it here if needed */}
      <div className="container-app py-8 md:py-12">
        {/* Header with back button and title - This is duplicated, ensure it's correctly placed or remove if Navbar handles it */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/passenger/dashboard" className="btn btn-ghost btn-sm flex items-center">
            <ArrowLeft size={18} className="mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white flex-grow">My Trips</h1>
          <div className="w-auto"></div> 
        </div>

        {/* Filter and Sort Controls - Existing UI */}
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label htmlFor="search-trip" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search-trip"
                  placeholder="ID, Origin, Destination..."
                  className="form-input w-full pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select 
                id="filter-status" 
                className="form-select w-full"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="booked">Booked</option>
                <option value="checked-in">Checked In</option>
                <option value="validated">Validated</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label htmlFor="sort-trip" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
              <select 
                id="sort-trip" 
                className="form-select w-full"
                value={getCurrentSortValue()}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="dateDesc">Date (Newest First)</option>
                <option value="dateAsc">Date (Oldest First)</option>
                <option value="routeAsc">Route (A-Z)</option>
                <option value="routeDesc">Route (Z-A)</option>
                <option value="status">Status</option>
              </select>
            </div>
            {/* Placeholder for Advanced Filters Button */}
            <button className="btn btn-outline flex items-center justify-center lg:mt-7" onClick={() => alert('Advanced Filters UI to be implemented here.')}>
              <ListFilter size={18} className="mr-2" /> Advanced Filters
            </button>
          </div>
        </div>

        {error && <p className="text-center py-10 text-red-500">Error loading trips: {error}</p>}

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => <SkeletonCard key={n} />)}
          </div>
        )}

        {!isLoading && !error && sortedUserBookings.length === 0 && (
          <div className="text-center py-10">
            <Inbox className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No Trips Found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No trips match your current filters or you have no bookings yet. Try adjusting your search or check back later.</p>
          </div>
        )}

        {!isLoading && !error && sortedUserBookings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedUserBookings.map((booking) => (
              <Card 
                key={booking.id} 
                className="flex flex-col justify-between bg-white dark:bg-card-dark shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => openTripModal(booking)}
              >
                <div className="px-4 py-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-md font-semibold text-primary-600">
                      {booking.route?.origin?.name} to {booking.route?.destination?.name}
                    </p>
                    <div className="ml-2 flex flex-shrink-0">
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <CalendarDays className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {booking.trip?.date && booking.trip?.time ? 
                          new Date(booking.trip.date + 'T' + booking.trip.time).toLocaleDateString([], {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }) : 'Date N/A'} at {booking.trip?.time || 'Time N/A'}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-4">
                        <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {booking.passenger?.firstName} {booking.passenger?.lastName}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <Tag className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      Booking ID: {booking.id}
                    </div>
                  </div>
                  {/* Direct cancel button removed from card, will be in modal */}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Trip Details Modal */}
      <Modal isOpen={isModalOpen} onClose={closeTripModal} title="Trip Details">
        {renderModalContent()}
      </Modal>
    </div>
  );
};

const TripsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<BookingWithDetails | null>(null);

  const openTripModal = (trip: BookingWithDetails) => {
    setSelectedTrip(trip);
    setIsModalOpen(true);
  };

  const closeTripModal = () => {
    setIsModalOpen(false);
    setSelectedTrip(null);
  };
  const { user } = useAuthStore();
  const { bookings, fetchBookingsByUserId, isLoading, error } = useBookingStore(); // Use booking store
  const [activeFilter, setActiveFilter] = useState<TripFilter>(TripFilter.ALL);
  const [sortKey, setSortKey] = useState<SortKey>(SortKey.DATE);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.DESC);
  const [filterStatus, setFilterStatus] = useState<string>('all'); // Added state
  const [searchTerm, setSearchTerm] = useState<string>(''); // Added state

  // New state variables for advanced filters
  const [priceRange, setPriceRange] = useState<PriceRange>({ min: null, max: null });
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<VehicleType[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<Amenity[]>([]);
  const [departureTime, setDepartureTime] = useState<string>(''); // e.g., "HH:MM"
  const [arrivalTime, setArrivalTime] = useState<string>('');   // e.g., "HH:MM"
  const [minDriverRating, setMinDriverRating] = useState<number | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchBookingsByUserId(user.id);
    }
  }, [user?.id, fetchBookingsByUserId]);

  const getCurrentSortValue = (): string => {
    if (sortKey === SortKey.STATUS) {
      return 'status';
    }
    return `${sortKey}${sortOrder.charAt(0).toUpperCase() + sortOrder.slice(1)}`;
  };

  const handleSortChange = (value: string) => {
    if (value === 'status') {
      setSortKey(SortKey.STATUS);
      // Optionally set a default order or maintain current for status
      // setSortOrder(SortOrder.ASC); 
    } else if (value.endsWith('Asc')) {
      setSortKey(value.replace('Asc', '') as SortKey);
      setSortOrder(SortOrder.ASC);
    } else if (value.endsWith('Desc')) {
      setSortKey(value.replace('Desc', '') as SortKey);
      setSortOrder(SortOrder.DESC);
    }
  };
  
  // Filter the bookings based on the active filter
  const filteredBookings = bookings.filter(booking => {
    if (activeFilter === TripFilter.ALL) return true;
    if (activeFilter === TripFilter.UPCOMING && ['pending', 'confirmed', 'booked', 'checked-in', 'validated'].includes(booking.status as string)) return true; // Added new statuses for upcoming
    if (activeFilter === TripFilter.COMPLETED && booking.status === 'completed') return true;
    if (activeFilter === TripFilter.CANCELLED && booking.status === 'cancelled') return true;
    return false;
  });

  // Further apply advanced filters
  const advancedFilteredBookings = useMemo(() => {
    return filteredBookings.filter(booking => {
      // Price Range Filter
      if (priceRange.min !== null && (booking.trip?.price ?? 0) < priceRange.min) return false;
      if (priceRange.max !== null && (booking.trip?.price ?? 0) > priceRange.max) return false;

      // Vehicle Type Filter
      if (selectedVehicleTypes.length > 0 && booking.trip?.vehicle && !selectedVehicleTypes.includes(booking.trip.vehicle.type as VehicleType)) return false;

      // Amenities Filter (using vehicle.features)
      if (selectedAmenities.length > 0 && booking.trip?.vehicle) {
        const tripFeatures = booking.trip.vehicle.features as Amenity[] || [];
        if (!selectedAmenities.every(amenity => tripFeatures.includes(amenity))) return false;
      }

      // Departure Time Filter
      if (departureTime && booking.trip?.time) {
        if (booking.trip.time < departureTime) return false;
      }

      // Arrival Time Filter - Remains commented out
      
      // Driver Rating Filter - Fixed driver rating check to avoid the type issue
      if (minDriverRating !== null && booking.trip?.driverId) {
        // Instead of checking role, we would find the driver rating from a lookup
        // This is placeholder logic - in a real app, you'd fetch the driver rating
        const driverRating = 4.5; // Replace with actual driver rating lookup
        if (driverRating < minDriverRating) return false;
      }

      return true;
    });
  }, [filteredBookings, priceRange, selectedVehicleTypes, selectedAmenities, departureTime, minDriverRating]);

  const userBookings = advancedFilteredBookings;

  // Helper function to get sortable value
  const getValueForSortKey = (booking: BookingWithDetails, key: SortKey): string | number | Date => {
    switch (key) {
      case SortKey.DATE:
        if (booking.trip?.date && booking.trip?.time) {
          try {
            const [year, month, day] = booking.trip.date.split('-').map(Number);
            const [hours, minutes] = booking.trip.time.split(':').map(Number);
            if (year && month && day && !isNaN(hours) && !isNaN(minutes)) {
                return new Date(year, month - 1, day, hours, minutes);
            }
             console.warn("Invalid date/time format for sorting:", booking.trip.date, booking.trip.time);
             return new Date(0);
          } catch (e) {
            console.error("Error parsing date/time for sorting:", e);
            return new Date(0);
          }
        }
        return new Date(0);
      case SortKey.ROUTE:
        // Handle potentially undefined route
        return `${booking.route?.origin?.name || 'N/A'} - ${booking.route?.destination?.name || 'N/A'}`;
      case SortKey.STATUS:
        return booking.status;
      default:
        const _exhaustiveCheck: never = key;
        return ''; 
    }
  };

  // Sort the bookings
  const sortedUserBookings = useMemo(() => {
    let filtered = userBookings;
    if (filterStatus !== 'all') {
      filtered = filtered.filter(booking => booking.status === filterStatus);
    }
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        (booking.route?.origin?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (booking.route?.destination?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        booking.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return [...filtered].sort((a, b) => {
      let comparison = 0;
      const valA = getValueForSortKey(a, sortKey);
      const valB = getValueForSortKey(b, sortKey);

      if (typeof valA === 'string' && typeof valB === 'string') {
        comparison = valA.localeCompare(valB);
      } else if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      } else if (valA instanceof Date && valB instanceof Date) {
        comparison = valA.getTime() - valB.getTime();
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [userBookings, filterStatus, searchTerm, sortKey, sortOrder]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="badge badge-warning flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'confirmed':
        return (
          <span className="badge badge-primary flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmed
          </span>
        );
      case 'completed':
        return (
          <span className="badge badge-success flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="badge badge-error flex items-center">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </span>
        );
      case 'checked-in':
        return (
          <span className="badge bg-indigo-100 text-indigo-700 flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            Checked In
          </span>
        );
      case 'validated': // Added validated status
        return (
          <span className="badge bg-teal-100 text-teal-700 flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            Validated
          </span>
        );
      case 'booked': // Added booked status
        return (
          <span className="badge bg-blue-100 text-blue-700 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            Booked
          </span>
        );
      default:
        return <span className="badge badge-gray">{status}</span>;
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    const bookingToCancel = sortedUserBookings.find(b => b.id === bookingId);

    // Use booking.trip.date and booking.trip.time instead of booking.timeSlot
    if (!bookingToCancel || !bookingToCancel.trip?.date || !bookingToCancel.trip?.time) {
      alert("Error: Booking details or trip date/time not found. Cannot proceed with cancellation.");
      return;
    }

    let tripDateTime;
    try {
      const [year, month, day] = bookingToCancel.trip.date.split('-').map(Number);
      const [hours, minutes] = bookingToCancel.trip.time.split(':').map(Number);
      tripDateTime = new Date(year, month - 1, day, hours, minutes);

      if (isNaN(tripDateTime.getTime())) {
        throw new Error('Invalid date/time format from trip data');
      }
    } catch (error) {
      console.error("Error parsing trip date/time for cancellation:", error);
      alert("Error: Could not determine the trip's departure time. Please check the booking details.");
      return;
    }
    
    const now = new Date();

    const diffInMilliseconds = tripDateTime.getTime() - now.getTime();
    const diffInMinutes = diffInMilliseconds / (1000 * 60);

    if (diffInMinutes <= 30 && diffInMinutes > 0) { // also check if it's not in the past already for cancellation logic
      alert("Cancellation is not allowed as the trip is within 30 minutes of departure.");
      return;
    }

    if (tripDateTime.getTime() <= now.getTime()) {
      alert("This trip has already departed or is in the past. Cancellation is not possible.");
      return;
    }

    if (window.confirm("Are you sure you want to cancel this booking?")) {
      // In a real app, you would call an API to cancel the booking
      // and then update the local state or refetch bookings.
      // TODO: Implement cancellation with bookingStore
      console.log(`Booking ${bookingId} cancellation confirmed by user.`);
      alert(`Booking ${bookingId} cancellation needs to be implemented with the booking store.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-50 transition-colors duration-300">
      {/* Navbar is handled by the main layout, spacing is managed by .glass-navbar-dashboard margins */}
      {/* <Navbar /> Ensure Navbar is part of a layout component or add it here if needed */}
      <div className="container-app py-8 md:py-12">
        {/* Header with back button and title */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/passenger/dashboard" className="btn btn-ghost btn-sm flex items-center">
            <ArrowLeft size={18} className="mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white flex-grow">My Trips</h1>
          {/* Placeholder for potential right-aligned actions */}
          <div className="w-auto"></div> 
        </div>
        {/* Header with back button */}
    

        {/* Advanced Filter UI elements would go here. Example: */}
        {/* <div className="mb-6 p-4 bg-white rounded shadow dark:bg-gray-800"> */}
        {/*   <h3 className="text-lg font-semibold mb-2">Filter Trips</h3> */}
        {/*   Controls for priceRange, selectedVehicleTypes, selectedAmenities, etc. */}
        {/*   Each control should have appropriate labels and ARIA attributes. */}
        {/* </div> */}

        {error && <p className="text-center py-10 text-red-500">Error loading trips: {error}</p>}

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => <SkeletonCard key={n} />)}
          </div>
        )}

        {!isLoading && !error && sortedUserBookings.length === 0 && (
          <div className="text-center py-10">
            <Inbox className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No Trips Found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No trips match your current filters or you have no bookings yet. Try adjusting your search or check back later.</p>
            {/* Optionally, a button to clear filters 
            <button className="mt-4" onClick={() => { clearFilters() }}>Clear Filters</button>
            */}
          </div>
        )}

        {!isLoading && !error && sortedUserBookings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedUserBookings.map((booking) => (
              <Card 
                key={booking.id} 
                className="flex flex-col justify-between bg-white dark:bg-card-dark shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => openTripModal(booking)}
              >
                <div className="px-4 py-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-md font-semibold text-primary-600">
                      {booking.route?.origin?.name} to {booking.route?.destination?.name}
                    </p>
                    <div className="ml-2 flex flex-shrink-0">
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <CalendarDays className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {booking.trip?.date && booking.trip?.time ? 
                          new Date(booking.trip.date + 'T' + booking.trip.time).toLocaleDateString([], {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }) : 'Date N/A'} at {booking.trip?.time || 'Time N/A'}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-4">
                        <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {booking.passenger?.firstName} {booking.passenger?.lastName}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <Tag className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      Booking ID: {booking.id}
                    </div>
                  </div>
                  {/* Direct cancel button removed from card, will be in modal */}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Modal Content
  const renderModalContent = () => {
    if (!selectedTrip) return null;

    // Placeholder for trip details and actions
    return (
      <div>
        <p className="text-gray-700 dark:text-gray-300 mb-2">
          <strong>Route:</strong> {selectedTrip.route?.origin?.name} to {selectedTrip.route?.destination?.name}
        </p>
        <p className="text-gray-700 dark:text-gray-300 mb-2">
          <strong>Date:</strong> {selectedTrip.trip?.date} at {selectedTrip.trip?.time}
        </p>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          <strong>Status:</strong> {getStatusBadge(selectedTrip.status)}
        </p>
        
        {/* Action Buttons Placeholder */}
        <div className="mt-6 flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-2 sm:space-y-0">
          <button 
            onClick={closeTripModal} 
            className="btn btn-outline w-full sm:w-auto"
          >
            Close
          </button>
          {/* Conditional Cancel Button - logic to be refined */}
          {(selectedTrip.status === 'confirmed' || selectedTrip.status === 'booked') && (
            <button 
              onClick={() => alert('Two-step cancellation to be implemented!')} 
              className="btn btn-error w-full sm:w-auto"
            >
              Cancel Trip
            </button>
          )}
          <button 
            onClick={() => alert('Share functionality to be implemented!')} 
            className="btn btn-secondary w-full sm:w-auto"
          >
            Share
          </button>
          {/* Conditional Delete Button - logic to be refined */}
          {selectedTrip.status === 'cancelled' && (
             <button 
              onClick={() => alert('Delete functionality to be implemented!')} 
              className="btn btn-danger-outline w-full sm:w-auto"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-50 transition-colors duration-300">
      {/* Navbar is handled by the main layout, spacing is managed by .glass-navbar-dashboard margins */}
      {/* <Navbar /> Ensure Navbar is part of a layout component or add it here if needed */}
      <div className="container-app py-8 md:py-12">
        {/* Header with back button and title - This is duplicated, ensure it's correctly placed or remove if Navbar handles it */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/passenger/dashboard" className="btn btn-ghost btn-sm flex items-center">
            <ArrowLeft size={18} className="mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white flex-grow">My Trips</h1>
          <div className="w-auto"></div> 
        </div>

        {/* Filter and Sort Controls - Existing UI */}
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label htmlFor="search-trip" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search-trip"
                  placeholder="ID, Origin, Destination..."
                  className="form-input w-full pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select 
                id="filter-status" 
                className="form-select w-full"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="booked">Booked</option>
                <option value="checked-in">Checked In</option>
                <option value="validated">Validated</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label htmlFor="sort-trip" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
              <select 
                id="sort-trip" 
                className="form-select w-full"
                value={getCurrentSortValue()}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="dateDesc">Date (Newest First)</option>
                <option value="dateAsc">Date (Oldest First)</option>
                <option value="routeAsc">Route (A-Z)</option>
                <option value="routeDesc">Route (Z-A)</option>
                <option value="status">Status</option>
              </select>
            </div>
            {/* Placeholder for Advanced Filters Button */}
            <button className="btn btn-outline flex items-center justify-center lg:mt-7" onClick={() => alert('Advanced Filters UI to be implemented here.')}>
              <ListFilter size={18} className="mr-2" /> Advanced Filters
            </button>
          </div>
        </div>

        {error && <p className="text-center py-10 text-red-500">Error loading trips: {error}</p>}

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => <SkeletonCard key={n} />)}
          </div>
        )}

        {!isLoading && !error && sortedUserBookings.length === 0 && (
          <div className="text-center py-10">
            <Inbox className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No Trips Found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No trips match your current filters or you have no bookings yet. Try adjusting your search or check back later.</p>
          </div>
        )}

        {!isLoading && !error && sortedUserBookings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedUserBookings.map((booking) => (
              <Card 
                key={booking.id} 
                className="flex flex-col justify-between bg-white dark:bg-card-dark shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => openTripModal(booking)}
              >
                <div className="px-4 py-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-md font-semibold text-primary-600">
                      {booking.route?.origin?.name} to {booking.route?.destination?.name}
                    </p>
                    <div className="ml-2 flex flex-shrink-0">
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <CalendarDays className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {booking.trip?.date && booking.trip?.time ? 
                          new Date(booking.trip.date + 'T' + booking.trip.time).toLocaleDateString([], {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }) : 'Date N/A'} at {booking.trip?.time || 'Time N/A'}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-4">
                        <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {booking.passenger?.firstName} {booking.passenger?.lastName}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <Tag className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      Booking ID: {booking.id}
                    </div>
                  </div>
                  {/* Direct cancel button removed from card, will be in modal */}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Trip Details Modal */}
      <Modal isOpen={isModalOpen} onClose={closeTripModal} title="Trip Details">
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default TripsPage;
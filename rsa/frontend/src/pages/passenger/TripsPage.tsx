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
    <div key={key} className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
      {children}
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

const TripsPage: React.FC = () => {
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
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-background-dark">
      <Navbar/> 
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with back button */}
        <div className="mb-6 flex items-center">
          <Link 
            to="/passenger/dashboard" 
            className="btn btn-ghost btn-sm gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

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
              <Card key={booking.id} className="flex flex-col justify-between bg-white dark:bg-card-dark shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden">
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
                  {(booking.status === 'confirmed' || booking.status === 'booked') && (
                      <div className="mt-3 flex space-x-3">
                          <button 
                              onClick={(e) => { 
                                  e.preventDefault(); 
                                  e.stopPropagation(); 
                                  handleCancelBooking(booking.id); 
                              }}
                              className="btn btn-error btn-xs"
                              aria-label={`Cancel booking ${booking.id}`}
                          >
                              <XCircle className="h-4 w-4 mr-1" /> Cancel Booking
                          </button>
                      </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripsPage;
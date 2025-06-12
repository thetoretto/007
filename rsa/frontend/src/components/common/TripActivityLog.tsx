import '../../index.css';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Filter, Calendar, ChevronLeft, ChevronRight, MapPin, CalendarRange } from 'lucide-react';
import useTripStore, { Trip } from '../../store/tripStore';
import { mockTripActivities } from '../../utils/mockTripActivities';
import TripActivityItem from './TripActivityItem';

// Define trip status types specific to this log's display needs
export type LogTripStatus = 'completed' | 'in-progress' | 'cancelled' | 'scheduled' | 'delayed' | 'active' | 'pending_approval';
export type LogDateFilter = 'all' | 'today' | 'week' | 'month';

// Trip activity interface that extends the Trip from store
export interface LogTripActivity extends Omit<Trip, 'status'> {
  status: LogTripStatus;
  passengers: number;
  driver?: {
    name: string;
    rating: number;
    vehicleInfo: string;
  };
  lastUpdated: string;
  estimatedArrival?: string;
  paymentMethod?: string;
  progressPercentage?: number;
}

interface TripActivityLogProps {
  activities?: LogTripActivity[];
  driverId?: string; // Optional driver ID to filter trips
  showDriverInfo?: boolean; // Whether to show driver information
}

const TripActivityLog: React.FC<TripActivityLogProps> = ({
  activities = [],
  driverId,
  showDriverInfo = true
}) => {
  const { trips, fetchTrips } = useTripStore();
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<LogTripStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<LogDateFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch trips on component mount
  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  // Convert trips from store to LogTripActivity format
  const convertTripsToActivities = useCallback((trips: Trip[]): LogTripActivity[] => {
    return trips.map(trip => ({
      ...trip,
      status: trip.status as LogTripStatus,
      passengers: trip.availableSeats ? (trip.vehicle?.capacity || 0) - trip.availableSeats : 1,
      lastUpdated: new Date().toISOString(),
      estimatedArrival: trip.time ?
        new Date(new Date(`${trip.date}T${trip.time}`).getTime() + (trip.route?.duration || 30) * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : undefined,
      paymentMethod: 'Credit Card',
      progressPercentage: trip.status === 'completed' ? 100 :
                         trip.status === 'active' ? Math.floor(Math.random() * 80) + 10 : 0,
      driver: showDriverInfo ? {
        name: 'Driver Name',
        rating: 4.5 + Math.random() * 0.5,
        vehicleInfo: trip.vehicle ? `${trip.vehicle.model} (${trip.vehicle.licensePlate})` : 'Vehicle Info'
      } : undefined
    }));
  }, [showDriverInfo]);

  // Get activities from store or props, filtered by driverId if provided
  const tripActivities = useMemo(() => {
    if (activities.length > 0) {
      return activities;
    }

    let filteredTrips = trips;
    if (driverId) {
      filteredTrips = trips.filter(trip => trip.driverId === driverId);
    }

    const convertedActivities = convertTripsToActivities(filteredTrips);

    // If no real trips, fallback to mock data
    return convertedActivities.length > 0 ? convertedActivities : mockTripActivities;
  }, [activities, trips, driverId, convertTripsToActivities]);

  // Helper function to convert string date to Date object with time set to midnight
  const parseLogActivityDate = useCallback((dateStr: string): Date => {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  // Get status text based on trip status
  const getLogStatusText = useCallback((status: LogTripStatus) => { // Renamed and used useCallback
    switch(status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'cancelled':
        return 'Cancelled';
      case 'scheduled':
        return 'Scheduled';
      case 'delayed':
        return 'Delayed';
      default:
        return 'Unknown';
    }
  }, []);

  // Memoized filtered activities for better performance
  const filteredActivities = useMemo(() => {
    let result = tripActivities;

    // Apply search filter
    if (searchQuery.trim()) {
      const normalizedQuery = searchQuery.toLowerCase().trim();
      result = result.filter(activity =>
        activity.fromLocation.toLowerCase().includes(normalizedQuery) ||
        activity.toLocation.toLowerCase().includes(normalizedQuery) ||
        (activity.driver?.name.toLowerCase().includes(normalizedQuery) || false) ||
        activity.paymentMethod?.toLowerCase().includes(normalizedQuery) ||
        activity.notes?.toLowerCase().includes(normalizedQuery) ||
        getLogStatusText(activity.status).toLowerCase().includes(normalizedQuery) // Use renamed getLogStatusText
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(activity => activity.status === statusFilter);
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize today's date to start of day

      switch (dateFilter) {
        case 'today':
          result = result.filter(activity => {
            const date = parseLogActivityDate(activity.date); // Use renamed parseLogActivityDate
            return date.getTime() === today.getTime();
          });
          break;

        case 'week': {
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          result = result.filter(activity => {
            const date = parseLogActivityDate(activity.date); // Use renamed parseLogActivityDate
            return date >= weekAgo && date <= today;
          });
          break;
        }

        case 'month': {
          const monthAgo = new Date(today);
          monthAgo.setMonth(today.getMonth() - 1);
          result = result.filter(activity => {
            const date = parseLogActivityDate(activity.date); // Use renamed parseLogActivityDate
            return date >= monthAgo && date <= today;
          });
          break;
        }
      }
    }

    return result;
  }, [tripActivities, searchQuery, statusFilter, dateFilter, parseLogActivityDate, getLogStatusText]); // Updated dependencies

  // Calculate pagination
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const paginatedActivities = filteredActivities.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, dateFilter, searchQuery]);

  // Toggle expanded view for a trip
  const toggleExpand = (tripId: string) => {
    if (expandedTrip === tripId) {
      setExpandedTrip(null);
    } else {
      setExpandedTrip(tripId);
    }
  };

  // Mapping for status badge classes
  const statusBadgeClasses: Record<LogTripStatus, string> = {
    'completed': 'badge badge-success',
    'in-progress': 'badge badge-info',
    'cancelled': 'badge badge-error',
    'scheduled': 'badge badge-secondary',
    'delayed': 'badge badge-warning',
    'active': 'badge badge-primary',
    'pending_approval': 'badge badge-warning',
  };

  // Function to get status badge class
  const getLogStatusBadgeClass = useCallback((status: LogTripStatus): string => { // Renamed
    return statusBadgeClasses[status] || 'badge badge-ghost'; // Default to ghost if status is not found
  }, []);

  // Share trip details with improved error handling
  const handleShareTrip = useCallback(async (activity: LogTripActivity) => { // Use LogTripActivity
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Trip from ${activity.fromLocation} to ${activity.toLocation}`,
          text: `My trip on ${new Date(activity.date).toLocaleDateString()} at ${activity.time} with status: ${getLogStatusText(activity.status)}`, // Use getLogStatusText
          url: window.location.href
        });
      } else {
        const tripDetails = `Trip from ${activity.fromLocation} to ${activity.toLocation} on ${new Date(activity.date).toLocaleDateString()} at ${activity.time}. Status: ${getLogStatusText(activity.status)}`; // Use getLogStatusText
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(tripDetails);
          alert("Trip details copied to clipboard!");
        } else {
          alert("Sharing is not supported in your browser. You can copy these trip details manually:\n\n" + tripDetails);
        }
      }
    } catch (error) {
      console.error('Error sharing trip details:', error);
      alert("There was an error sharing the trip details. Please try again.");
    }
  }, [getLogStatusText]); // Updated dependency

  // Mock download receipt with improved feedback
  const handleDownloadReceipt = useCallback((tripId: string, tripDate: string) => {
    try {
      console.log(`Downloading receipt for trip ${tripId} from ${tripDate}`);
      // In a real app, this would trigger an API call to get the receipt
      // For demo purposes, we'll just show an alert
      alert(`Receipt for Trip #${tripId} from ${new Date(tripDate).toLocaleDateString()} would be downloaded in a real app.`);
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('There was an error downloading the receipt. Please try again.');
    }
  }, []);

  // Mock view on map with improved feedback
  const handleViewOnMap = useCallback((activity: LogTripActivity) => { // Use LogTripActivity
    try {
      console.log(`Viewing trip ${activity.id} on map`);
      alert(`In a real app, this would show the trip route from ${activity.fromLocation} to ${activity.toLocation} on a map.\n\nTrip date: ${new Date(activity.date).toLocaleDateString()}\nDeparture time: ${activity.time}${activity.estimatedArrival ? `\nEstimated arrival: ${activity.estimatedArrival}` : ''}`);
    } catch (error) {
      console.error('Error viewing trip on map:', error);
      alert('There was an error loading the map view. Please try again.');
    }
  }, []);

  return (
    <div className="driver-dashboard">
      <>
        <div className="driver-metric-card">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="icon-badge icon-badge-lg bg-primary-light text-primary">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-light-primary dark:text-dark-primary">
                    Trip Activity Log
                  </h2>
                  <p className="text-sm text-light-secondary dark:text-dark-secondary">
                    Track and manage your trip activities
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-outline btn-sm flex items-center gap-2"
              aria-expanded={showFilters}
              aria-controls="filter-panel"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-light-tertiary dark:text-dark-tertiary" />
            </div>
            <input
              type="search"
              className="form-input pl-10"
              placeholder="Search trips (location, driver, status...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search trips"
            />
          </div>

          {showFilters && (
            <div
              id="filter-panel"
              className="mt-6 p-4 bg-light dark:bg-dark rounded-lg space-y-4 border border-light dark:border-dark"
              role="region"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date-filter-select" className="form-label flex items-center">
                    <CalendarRange className="h-4 w-4 mr-2 text-primary" />
                    Date Range
                  </label>
                  <select
                    id="date-filter-select"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value as LogDateFilter)}
                    className="form-select"
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="status-filter-select" className="form-label flex items-center">
                    <Filter className="h-4 w-4 mr-2 text-primary" />
                    Trip Status
                  </label>
                  <select
                    id="status-filter-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as LogTripStatus | 'all')}
                    className="form-select"
                  >
                    <option value="all">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="in-progress">In Progress</option>
                    <option value="active">Active</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="delayed">Delayed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="pending_approval">Pending Approval</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="space-y-4 mt-6" role="list">
            {paginatedActivities.length === 0 ? (
              <div className="driver-loading-card" role="status">
                <div className="icon-badge icon-badge-lg bg-primary-light text-primary mx-auto mb-4">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-2">
                  No Trip Activities Found
                </h3>
                <p className="text-light-secondary dark:text-dark-secondary">
                  {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
                    ? "Try adjusting your search or filters to find more results."
                    : "There are no trip activities to display yet. Start by creating your first trip."}
                </p>
              </div>
            ) : (
              paginatedActivities.map(activity => (
                <TripActivityItem
                  key={activity.id}
                  activity={activity}
                  isExpanded={expandedTrip === activity.id}
                  onToggleExpand={toggleExpand}
                  onShareTrip={handleShareTrip}
                  onDownloadReceipt={handleDownloadReceipt}
                  onViewOnMap={handleViewOnMap}
                  getStatusBadgeClass={getLogStatusBadgeClass}
                />
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="pt-6 mt-6 border-t border-light dark:border-dark flex flex-col sm:flex-row items-center justify-between gap-4" role="navigation">
              <div className="text-sm text-light-secondary dark:text-dark-secondary">
                Page <span className="font-semibold text-light-primary dark:text-dark-primary">{page}</span> of <span className="font-semibold text-light-primary dark:text-dark-primary">{totalPages}</span>
                <span className="hidden sm:inline"> • {filteredActivities.length} total results</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-outline btn-sm flex items-center gap-1"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                <div className="px-3 py-2 text-sm font-medium text-light-primary dark:text-dark-primary bg-primary-light text-primary rounded-md min-w-[2.5rem] text-center">
                  {page}
                </div>

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn btn-outline btn-sm flex items-center gap-1"
                  aria-label="Next page"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </>
    </div>
  );
};

export default TripActivityLog;
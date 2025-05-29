import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Filter, Calendar, ChevronDown, ChevronUp, CheckCircle, RefreshCw, XCircle, Clock, AlertCircle, Star, MapIcon, Download, Share2, ChevronLeft, ChevronRight, MapPin, DollarSign, Clock3, CalendarRange, Users, ExternalLink } from 'lucide-react';
import { mockTripActivities } from '../../utils/mockTripActivities'; // Keep if activities prop can be empty
import TripActivityItem from './TripActivityItem';

// Define trip status types specific to this log's display needs
export type LogTripStatus = 'completed' | 'in-progress' | 'cancelled' | 'scheduled' | 'delayed';
export type LogDateFilter = 'all' | 'today' | 'week' | 'month';

// Trip activity interface specific to this log
export interface LogTripActivity {
  id: string;
  fromLocation: string;
  toLocation:string;
  date: string;
  time: string;
  price: number;
  status: LogTripStatus; // Use local LogTripStatus
  passengers: number;
  driver?: {
    name: string;
    rating: number;
    vehicleInfo: string;
  };
  lastUpdated: string;
  estimatedArrival?: string;
  paymentMethod?: string;
  notes?: string;
  progressPercentage?: number;
}

interface TripActivityLogProps {
  activities?: LogTripActivity[]; // Use local LogTripActivity
}

const TripActivityLog: React.FC<TripActivityLogProps> = ({
  activities = []
}) => {
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<LogTripStatus | 'all'>('all'); // Use local LogTripStatus
  const [dateFilter, setDateFilter] = useState<LogDateFilter>('all'); // Use local LogDateFilter
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  // Use provided activities or fallback to mock data
  const tripActivities = activities.length > 0 ? activities : mockTripActivities;

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

  // Get status icon based on trip status
  const getLogStatusIcon = useCallback((status: LogTripStatus) => { // Renamed
    switch(status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'in-progress':
        return <RefreshCw className="h-5 w-5 text-info animate-spin" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-error" />;
      case 'scheduled':
        return <Clock className="h-5 w-5 text-secondary" />;
      case 'delayed':
        return <AlertCircle className="h-5 w-5 text-warning" />;
      default:
        return <Clock className="h-5 w-5 text-text-muted dark:text-text-muted-dark" />;
    }
  }, []);

  // Mapping for status badge classes
  const statusBadgeClasses: Record<LogTripStatus, string> = { // Use LogTripStatus
    'completed': 'badge badge-success-soft',
    'in-progress': 'badge badge-info-soft',
    'cancelled': 'badge badge-error-soft',
    'scheduled': 'badge badge-secondary-soft',
    'delayed': 'badge badge-warning-soft',
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
    <div className="card bg-base-100 dark:bg-section-dark shadow-xl rounded-xl p-4 sm:p-6">
      <div className="border-b border-border dark:border-border-dark pb-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 sm:gap-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-text-base dark:text-text-inverse">Trip Activity Log</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline btn-secondary flex items-center text-sm"
            aria-expanded={showFilters}
            aria-controls="filter-panel"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Filters'}
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted dark:text-text-muted-dark pointer-events-none" />
          <input
            type="search"
            className="input input-bordered w-full pl-10 pr-4 py-2.5 bg-background-light dark:bg-background-dark text-text-base dark:text-text-inverse placeholder-text-muted dark:placeholder-text-muted-dark focus:ring-primary focus:border-primary"
            placeholder="Search trips (e.g., Kigali, Driver John, Completed)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search trips"
          />
        </div>

        {showFilters && (
          <div
            id="filter-panel"
            className="mt-4 p-4 bg-base-200 dark:bg-section-medium rounded-lg space-y-4 animate-fadeIn"
            role="region"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date-filter-select" className="form-label flex items-center mb-1.5 text-text-base dark:text-text-inverse font-medium">
                  <CalendarRange className="h-5 w-5 mr-2 text-primary dark:text-primary-300" />
                  Date Range
                </label>
                <select
                  id="date-filter-select"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as LogDateFilter)}
                  className="select select-bordered w-full bg-background-light dark:bg-background-dark text-text-base dark:text-text-inverse focus:ring-primary focus:border-primary"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>

              <div>
                <label htmlFor="status-filter-select" className="form-label flex items-center mb-1.5 text-text-base dark:text-text-inverse font-medium">
                  <Filter className="h-5 w-5 mr-2 text-primary dark:text-primary-300" />
                  Trip Status
                </label>
                <select
                  id="status-filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as LogTripStatus | 'all')}
                  className="select select-bordered w-full bg-background-light dark:bg-background-dark text-text-base dark:text-text-inverse focus:ring-primary focus:border-primary"
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="delayed">Delayed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 sm:space-y-4" role="list">
        {paginatedActivities.length === 0 ? (
          <div className="p-6 sm:p-8 text-center rounded-lg bg-base-200 dark:bg-section-medium" role="status">
            <MapPin className="h-12 w-12 mx-auto text-text-muted dark:text-text-muted-dark mb-3" />
            <p className="text-lg font-medium text-text-base dark:text-text-inverse">No Trip Activities Found</p>
            <p className="text-sm text-text-muted dark:text-text-muted-dark mt-1">
              {searchQuery || statusFilter !== 'all' || dateFilter !== 'all' 
                ? "Try adjusting your search or filters." 
                : "There are no trip activities to display yet."}
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
              getStatusBadgeClass={getLogStatusBadgeClass} // Use renamed
              // Pass renamed getLogStatusIcon and getLogStatusText if TripActivityItem needs them directly
              // For now, TripActivityItem defines its own getStatusIcon. getStatusText is passed from here via onShareTrip.
            />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-border dark:border-border-dark flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4" role="navigation">
          <div className="text-sm text-text-muted dark:text-text-muted-dark">
            Page <span className="font-semibold text-text-base dark:text-text-inverse">{page}</span> of <span className="font-semibold text-text-base dark:text-text-inverse">{totalPages}</span>
            <span className="hidden sm:inline"> ({filteredActivities.length} results)</span>
          </div>
          <div className="join shadow-sm rounded-lg">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="join-item btn btn-outline btn-secondary btn-sm sm:btn-md disabled:opacity-60"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline ml-1">Prev</span>
            </button>
            
            {/* Simplified Pagination: Prev, Current Page Indicator, Next */}
            <button className="join-item btn btn-outline btn-secondary btn-sm sm:btn-md pointer-events-none">
              {page}
            </button>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="join-item btn btn-outline btn-secondary btn-sm sm:btn-md disabled:opacity-60"
              aria-label="Next page"
            >
               <span className="hidden sm:inline mr-1">Next</span>
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripActivityLog;
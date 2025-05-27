import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Filter, Calendar, ChevronDown, ChevronUp, CheckCircle, RefreshCw, XCircle, Clock, AlertCircle, Star, MapIcon, Download, Share2, ChevronLeft, ChevronRight, MapPin, DollarSign, Clock3, CalendarRange, Users } from 'lucide-react';
import { TripActivity, TripStatus, DateFilter } from '../../types'; // Assuming types are defined here or adjust path
import { mockTripActivities } from '../../utils/mockTripActivities'; // Import mock activities from utils
import { parseActivityDate } from '../../utils/dateUtils'; // Assuming a utility file for date parsing
import { getStatusText } from '../../utils/tripUtils'; // Assuming a utility file for status text
import TripActivityItem from './TripActivityItem'; // Import the new component

// Define trip status types
type TripStatus = 'completed' | 'in-progress' | 'cancelled' | 'scheduled' | 'delayed';
type DateFilter = 'all' | 'today' | 'week' | 'month';

// Trip activity interface
interface TripActivity {
  id: string;
  fromLocation: string;
  toLocation: string;
  date: string;
  time: string;
  price: number;
  status: TripStatus;
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
  activities?: TripActivity[];
}

const TripActivityLog: React.FC<TripActivityLogProps> = ({
  activities = []
}) => {
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<TripStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  // Use provided activities or fallback to mock data
  const tripActivities = activities.length > 0 ? activities : mockTripActivities;

  // Helper function to convert string date to Date object with time set to midnight
  const parseActivityDate = useCallback((dateStr: string): Date => {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  // Memoized filter functions for better performance







  // Get status text based on trip status
  const getStatusText = (status: TripStatus) => {
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
  };

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
        getStatusText(activity.status).toLowerCase().includes(normalizedQuery)
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
            const date = parseActivityDate(activity.date);
            return date.getTime() === today.getTime();
          });
          break;

        case 'week': {
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          result = result.filter(activity => {
            const date = parseActivityDate(activity.date);
            return date >= weekAgo && date <= today;
          });
          break;
        }

        case 'month': {
          const monthAgo = new Date(today);
          monthAgo.setMonth(today.getMonth() - 1);
          result = result.filter(activity => {
            const date = parseActivityDate(activity.date);
            return date >= monthAgo && date <= today;
          });
          break;
        }
      }
    }

    return result;
  }, [tripActivities, searchQuery, statusFilter, dateFilter, parseActivityDate, getStatusText]);

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
  const getStatusIcon = (status: TripStatus) => {
    switch(status) {
      case 'completed':
        return <CheckCircle className="icon-sm text-success" />;
      case 'in-progress':
        return <RefreshCw className="icon-sm text-info animate-spin" />;
      case 'cancelled':
        return <XCircle className="icon-sm text-error" />;
      case 'scheduled':
        return <Clock className="icon-sm text-secondary" />;
      case 'delayed':
        return <AlertCircle className="icon-sm text-warning" />;
      default:
        return <Clock className="icon-sm text-text-muted" />;
    }
  };

  // Mapping for status badge classes
  const statusBadgeClasses: Record<TripStatus, string> = {
    'completed': 'badge status-completed',
    'in-progress': 'badge status-in-progress',
    'cancelled': 'badge status-cancelled',
    'scheduled': 'badge status-scheduled',
    'delayed': 'badge status-delayed',
  };

  // Function to get status badge class
  const getStatusBadgeClass = useCallback((status: TripStatus): string => {
    return statusBadgeClasses[status] || 'badge badge-gray'; // Default to gray if status is not found
  }, []);

  // Share trip details with improved error handling
  const handleShareTrip = useCallback(async (activity: TripActivity) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Trip from ${activity.fromLocation} to ${activity.toLocation}`,
          text: `My trip on ${new Date(activity.date).toLocaleDateString()} at ${activity.time} with status: ${getStatusText(activity.status)}`,
          url: window.location.href // Include current URL if applicable
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        const tripDetails = `Trip from ${activity.fromLocation} to ${activity.toLocation} on ${new Date(activity.date).toLocaleDateString()} at ${activity.time}. Status: ${getStatusText(activity.status)}`;

        // Try to use clipboard API as fallback
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
  }, [getStatusText]);

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
  const handleViewOnMap = useCallback((activity: TripActivity) => {
    try {
      console.log(`Viewing trip ${activity.id} on map`);
      // In a real app, this would open a map view with the route
      // For demo purposes, we'll just show an alert
      alert(`In a real app, this would show the trip route from ${activity.fromLocation} to ${activity.toLocation} on a map.\n\nTrip date: ${new Date(activity.date).toLocaleDateString()}\nDeparture time: ${activity.time}${activity.estimatedArrival ? `\nEstimated arrival: ${activity.estimatedArrival}` : ''}`);
    } catch (error) {
      console.error('Error viewing trip on map:', error);
      alert('There was an error loading the map view. Please try again.');
    }
  }, []);

  return (
    <div className="bg-card dark:bg-card-dark rounded-lg shadow-lg p-6 space-y-6">
      <div className="border-b border-border-light dark:border-border-dark pb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h2 className="text-2xl font-semibold text-text-primary dark:text-text-primary-dark">Trip Activity Log</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary-outline flex items-center text-sm"
            aria-expanded={showFilters}
            aria-controls="filter-panel"
            aria-label={showFilters ? "Hide filters" : "Show filters"}
          >
            <Filter className="icon-sm mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Search bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="icon-base text-text-muted" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="input w-full pl-10 pr-4 py-2 border border-border-light dark:border-border-dark rounded-md bg-background-light dark:bg-background-dark text-text-primary dark:text-text-primary-dark placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Search by location, driver, status or payment method..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search trips"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div
            id="filter-panel"
            className="mt-4 p-4 bg-background-alternate dark:bg-background-darkAlternate rounded-md space-y-4 animate-fadeIn"
            role="region"
            aria-label="Trip filters"
          >
            <div>
              <p className="form-label flex items-center mb-2 text-text-secondary dark:text-text-secondary-dark font-medium">
                <Calendar className="icon-sm mr-2 text-primary" aria-hidden="true" />
                Date Filter
              </p>
              <div className="flex flex-wrap gap-3" role="group" aria-label="Date filter options">
                <button
                  onClick={() => setDateFilter('all')}
                  className={dateFilter === 'all' ? 'badge badge-primary-filled' : 'badge badge-secondary-outline'}
                  aria-pressed={dateFilter === 'all'}
                  aria-label="Show all dates"
                >
                  All Dates
                </button>
                <button
                  onClick={() => setDateFilter('today')}
                  className={dateFilter === 'today' ? 'badge badge-primary-filled' : 'badge badge-secondary-outline'}
                  aria-pressed={dateFilter === 'today'}
                  aria-label="Show today's trips"
                >
                  Today
                </button>
                <button
                  onClick={() => setDateFilter('week')}
                  className={dateFilter === 'week' ? 'badge badge-primary-filled' : 'badge badge-secondary-outline'}
                  aria-pressed={dateFilter === 'week'}
                  aria-label="Show this week's trips"
                >
                  This Week
                </button>
                <button
                  onClick={() => setDateFilter('month')}
                  className={dateFilter === 'month' ? 'badge badge-primary-filled' : 'badge badge-secondary-outline'}
                  aria-pressed={dateFilter === 'month'}
                  aria-label="Show this month's trips"
                >
                  This Month
                </button>
              </div>
            </div>

            <div>
              <p className="form-label flex items-center mb-2 text-text-secondary dark:text-text-secondary-dark font-medium">
                <Filter className="icon-sm mr-2 text-primary" aria-hidden="true" />
                Status Filter
              </p>
              <div className="flex flex-wrap gap-3" role="group" aria-label="Status filter options">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={statusFilter === 'all' ? 'badge badge-primary-filled' : 'badge badge-secondary-outline'}
                  aria-pressed={statusFilter === 'all'}
                  aria-label="Show all statuses"
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('in-progress')}
                  className={statusFilter === 'in-progress' ? 'badge status-in-progress-filled' : 'badge badge-secondary-outline'}
                  aria-pressed={statusFilter === 'in-progress'}
                  aria-label="Show in-progress trips"
                >
                  In Progress
                </button>
                <button
                  onClick={() => setStatusFilter('completed')}
                  className={statusFilter === 'completed' ? 'badge status-completed-filled' : 'badge badge-secondary-outline'}
                  aria-pressed={statusFilter === 'completed'}
                  aria-label="Show completed trips"
                >
                  Completed
                </button>
                <button
                  onClick={() => setStatusFilter('scheduled')}
                  className={statusFilter === 'scheduled' ? 'badge status-scheduled-filled' : 'badge badge-secondary-outline'}
                  aria-pressed={statusFilter === 'scheduled'}
                  aria-label="Show scheduled trips"
                >
                  Scheduled
                </button>
                <button
                  onClick={() => setStatusFilter('delayed')}
                  className={statusFilter === 'delayed' ? 'badge status-delayed-filled' : 'badge badge-secondary-outline'}
                  aria-pressed={statusFilter === 'delayed'}
                  aria-label="Show delayed trips"
                >
                  Delayed
                </button>
                <button
                  onClick={() => setStatusFilter('cancelled')}
                  className={statusFilter === 'cancelled' ? 'badge status-cancelled-filled' : 'badge badge-secondary-outline'}
                  aria-pressed={statusFilter === 'cancelled'}
                  aria-label="Show cancelled trips"
                >
                  Cancelled
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Activity list */}
      <div className="divide-y divide-border-light dark:divide-border-dark" role="list" aria-label="Trip activities">
        {paginatedActivities.length === 0 ? (
          <div className="p-8 text-center text-text-muted italic" role="status">
            No trip activities match the selected filters.
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
              getStatusBadgeClass={getStatusBadgeClass}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="panel-footer flex flex-col sm:flex-row items-center justify-between gap-4 pt-4" role="navigation" aria-label="Pagination navigation">
          <div className="text-sm text-text-secondary dark:text-text-secondary-dark">
            Showing <span className="font-semibold">{(page - 1) * itemsPerPage + 1}</span>-<span className="font-semibold">{Math.min(page * itemsPerPage, filteredActivities.length)}</span> of <span className="font-semibold">{filteredActivities.length}</span> results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-secondary-outline p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft className="icon-base" aria-hidden="true" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show pages around current page
              const pageNum = Math.max(1, Math.min(page - 2 + i, totalPages));
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`btn ${page === pageNum ? 'btn-primary-filled' : 'btn-secondary-outline'} p-2 rounded-md min-w-[36px]`}
                  aria-label={`Page ${pageNum}`}
                  aria-current={page === pageNum ? 'page' : undefined}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn btn-secondary-outline p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <ChevronRight className="icon-base" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripActivityLog;
import React, { useState, useEffect } from 'react';
import { 
  Clock, CheckCircle, AlertCircle, XCircle, RefreshCw, 
  ChevronDown, ChevronUp, Calendar, MapPin, DollarSign,
  Clock3, Filter, Search, Download, Share2, MapIcon, 
  ChevronLeft, ChevronRight, CalendarRange, Users
} from 'lucide-react';

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
  
  // If no activities provided, use these mocks
  const mockActivities: TripActivity[] = [
    {
      id: 'trip-1',
      fromLocation: 'Downtown Station',
      toLocation: 'Airport Terminal 2',
      date: '2023-09-12',
      time: '14:30',
      price: 32.50,
      status: 'in-progress',
      passengers: 1,
      driver: {
        name: 'Michael Chen',
        rating: 4.8,
        vehicleInfo: 'Tesla Model Y (White) • ABC123'
      },
      lastUpdated: '2 minutes ago',
      estimatedArrival: '15:05',
      paymentMethod: 'Visa •••• 4242',
      notes: 'Driver is taking the express route due to traffic',
      progressPercentage: 65
    },
    {
      id: 'trip-2',
      fromLocation: 'Central Mall',
      toLocation: 'Riverside Apartments',
      date: new Date().toISOString().split('T')[0], // Today
      time: '18:45',
      price: 18.75,
      status: 'completed',
      passengers: 2,
      driver: {
        name: 'Sarah Johnson',
        rating: 4.9,
        vehicleInfo: 'Honda Civic (Blue) • XYZ789'
      },
      lastUpdated: '2 days ago',
      paymentMethod: 'Mastercard •••• 8888',
      progressPercentage: 100
    },
    {
      id: 'trip-3',
      fromLocation: 'Conference Center',
      toLocation: 'Hilton Hotel',
      date: '2023-09-15',
      time: '09:15',
      price: 12.25,
      status: 'scheduled',
      passengers: 1,
      lastUpdated: 'Just now',
      paymentMethod: 'PayPal',
      progressPercentage: 0
    },
    {
      id: 'trip-4',
      fromLocation: 'University Campus',
      toLocation: 'Tech District',
      date: '2023-09-08',
      time: '10:30',
      price: 24.00,
      status: 'cancelled',
      passengers: 3,
      lastUpdated: '4 days ago',
      notes: 'Cancelled due to unexpected delay',
      progressPercentage: 0
    },
    {
      id: 'trip-5',
      fromLocation: 'Sunset Beach',
      toLocation: 'Downtown Hotels',
      date: new Date().toISOString().split('T')[0], // Today
      time: '16:20',
      price: 27.50,
      status: 'delayed',
      passengers: 2,
      driver: {
        name: 'David Wilson',
        rating: 4.7,
        vehicleInfo: 'Toyota Camry (Silver) • LMN456'
      },
      lastUpdated: '20 minutes ago',
      estimatedArrival: '17:05',
      paymentMethod: 'Apple Pay',
      notes: 'Delayed due to road construction',
      progressPercentage: 40
    },
    {
      id: 'trip-6',
      fromLocation: 'Green Park',
      toLocation: 'City Hospital',
      date: (() => {
        const date = new Date();
        date.setDate(date.getDate() - 3); // 3 days ago
        return date.toISOString().split('T')[0];
      })(),
      time: '08:15',
      price: 15.50,
      status: 'completed',
      passengers: 1,
      driver: {
        name: 'Emma Roberts',
        rating: 4.5,
        vehicleInfo: 'Hyundai Sonata (Gray) • DEF456'
      },
      lastUpdated: '3 days ago',
      paymentMethod: 'Apple Pay',
      progressPercentage: 100
    },
    {
      id: 'trip-7',
      fromLocation: 'Public Library',
      toLocation: 'Science Museum',
      date: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 2); // 2 days in future
        return date.toISOString().split('T')[0];
      })(),
      time: '13:00',
      price: 22.75,
      status: 'scheduled',
      passengers: 4,
      lastUpdated: '1 hour ago',
      paymentMethod: 'PayPal',
      progressPercentage: 0
    }
  ];
  
  // Use provided activities or fallback to mock data
  const tripActivities = activities.length > 0 ? activities : mockActivities;
  
  // Filter activities based on search, status and date
  const filterActivities = () => {
    let filtered = tripActivities;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(activity => 
        activity.fromLocation.toLowerCase().includes(query) ||
        activity.toLocation.toLowerCase().includes(query) ||
        (activity.driver?.name.toLowerCase().includes(query) || false)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(activity => activity.status === statusFilter);
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const activityDate = (dateStr: string) => {
        const date = new Date(dateStr);
        date.setHours(0, 0, 0, 0);
        return date;
      };
      
      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(activity => {
            const date = activityDate(activity.date);
            return date.getTime() === today.getTime();
          });
          break;
          
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          
          filtered = filtered.filter(activity => {
            const date = activityDate(activity.date);
            return date >= weekAgo && date <= today;
          });
          break;
          
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(today.getMonth() - 1);
          
          filtered = filtered.filter(activity => {
            const date = activityDate(activity.date);
            return date >= monthAgo && date <= today;
          });
          break;
      }
    }
    
    return filtered;
  };
  
  const filteredActivities = filterActivities();
  
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
  
  // Get status badge class based on trip status
  const getStatusBadgeClass = (status: TripStatus) => {
    switch(status) {
      case 'completed':
        return 'status-completed';
      case 'in-progress':
        return 'status-in-progress';
      case 'cancelled':
        return 'status-cancelled';
      case 'scheduled':
        return 'status-scheduled';
      case 'delayed':
        return 'status-delayed';
      default:
        return 'badge-gray';
    }
  };
  
  // Share trip details
  const handleShareTrip = (activity: TripActivity) => {
    if (navigator.share) {
      navigator.share({
        title: `Trip from ${activity.fromLocation} to ${activity.toLocation}`,
        text: `My trip on ${new Date(activity.date).toLocaleDateString()} at ${activity.time} with status: ${getStatusText(activity.status)}`
      }).catch((error) => console.log('Error sharing', error));
    } else {
      alert("Sharing is not supported in your browser. You can copy the trip details manually.");
    }
  };
  
  // Mock download receipt
  const handleDownloadReceipt = (tripId: string) => {
    console.log(`Downloading receipt for trip ${tripId}`);
    alert(`Receipt for Trip #${tripId} would be downloaded in a real app.`);
  };
  
  // Mock view on map
  const handleViewOnMap = (activity: TripActivity) => {
    console.log(`Viewing trip ${activity.id} on map`);
    alert(`In a real app, this would show the trip route from ${activity.fromLocation} to ${activity.toLocation} on a map.`);
  };
  
  return (
    <div className="bg-white ">
      <div className="panel-header">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-card-title">Trip Activity</h2>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="btn-primary-ghost flex items-center text-sm"
          >
            <Filter className="icon-sm mr-1" />
            Filter
          </button>
        </div>
        
        {/* Search bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="icon-sm text-text-muted" />
          </div>
          <input
            type="text"
            className="input pl-10"
            placeholder="Search by location or driver name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Filters */}
        {showFilters && (
          <div className="mb-4 p-3 bg-background-alternate dark:bg-background-darkAlternate rounded-md space-y-3">
            <div>
              <p className="form-label flex items-center">
                <Calendar className="icon-sm mr-1 text-primary" />
                Date Filter
              </p>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setDateFilter('all')}
                  className={dateFilter === 'all' ? 'badge badge-primary' : 'badge badge-gray'}
                >
                  All Dates
                </button>
                <button 
                  onClick={() => setDateFilter('today')}
                  className={dateFilter === 'today' ? 'badge badge-primary' : 'badge badge-gray'}
                >
                  Today
                </button>
                <button 
                  onClick={() => setDateFilter('week')}
                  className={dateFilter === 'week' ? 'badge badge-primary' : 'badge badge-gray'}
                >
                  This Week
                </button>
                <button 
                  onClick={() => setDateFilter('month')}
                  className={dateFilter === 'month' ? 'badge badge-primary' : 'badge badge-gray'}
                >
                  This Month
                </button>
              </div>
            </div>
            
            <div>
              <p className="form-label flex items-center">
                <Filter className="icon-sm mr-1 text-primary" />
                Status Filter
              </p>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setStatusFilter('all')}
                  className={statusFilter === 'all' ? 'badge badge-primary' : 'badge badge-gray'}
                >
                  All
                </button>
                <button 
                  onClick={() => setStatusFilter('in-progress')}
                  className={statusFilter === 'in-progress' ? 'status-in-progress' : 'badge badge-gray'}
                >
                  In Progress
                </button>
                <button 
                  onClick={() => setStatusFilter('completed')}
                  className={statusFilter === 'completed' ? 'status-completed' : 'badge badge-gray'}
                >
                  Completed
                </button>
                <button 
                  onClick={() => setStatusFilter('scheduled')}
                  className={statusFilter === 'scheduled' ? 'status-scheduled' : 'badge badge-gray'}
                >
                  Scheduled
                </button>
                <button 
                  onClick={() => setStatusFilter('delayed')}
                  className={statusFilter === 'delayed' ? 'status-delayed' : 'badge badge-gray'}
                >
                  Delayed
                </button>
                <button 
                  onClick={() => setStatusFilter('cancelled')}
                  className={statusFilter === 'cancelled' ? 'status-cancelled' : 'badge badge-gray'}
                >
                  Cancelled
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Activity list */}
      <div className="divide-y divide-primary-100 dark:divide-primary-800">
        {paginatedActivities.length === 0 ? (
          <div className="p-8 text-center text-text-muted">
            No trip activities match the selected filters
          </div>
        ) : (
          paginatedActivities.map(activity => (
            <div key={activity.id} className="trip-card hover:bg-primary-50 dark:hover:bg-primary-900/10 p-4">
              {/* Trip summary - always visible */}
              <div 
                className="expandable-header border-0 p-0 cursor-pointer" 
                onClick={() => toggleExpand(activity.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`icon-background-${activity.status === 'completed' ? 'primary' : 'secondary'} p-2 rounded-full mb-0`}>
                    {getStatusIcon(activity.status)}
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {activity.fromLocation} to {activity.toLocation}
                    </h3>
                    <p className="text-sm text-text-muted">
                      {new Date(activity.date).toLocaleDateString()} at {activity.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-right mr-3">
                    <span className={`${getStatusBadgeClass(activity.status)}`}>
                      {getStatusText(activity.status)}
                    </span>
                    <p className="text-sm font-medium mt-1">${activity.price.toFixed(2)}</p>
                  </div>
                  {expandedTrip === activity.id ? (
                    <ChevronUp className="icon-sm text-text-muted" />
                  ) : (
                    <ChevronDown className="icon-sm text-text-muted" />
                  )}
                </div>
              </div>
              
              {/* Progress indicator for in-progress trips */}
              {activity.status === 'in-progress' && (
                <div className="mt-2 px-3">
                  <div className="flex justify-between text-xs text-text-muted mb-1">
                    <span>{activity.fromLocation}</span>
                    <span>{activity.toLocation}</span>
                  </div>
                  <div className="trip-status-indicator">
                    <div 
                      className="trip-progress-bar" 
                      style={{ width: `${activity.progressPercentage || 0}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Expanded details */}
              {expandedTrip === activity.id && (
                <div className="mt-4 pt-4 border-t border-primary-100 dark:border-primary-800 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Trip Details</h4>
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <MapPin className="icon-sm text-text-muted mt-0.5 mr-2" />
                          <div>
                            <p className="font-medium">From: {activity.fromLocation}</p>
                            <p className="font-medium">To: {activity.toLocation}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="icon-sm text-text-muted mr-2" />
                          <p>{new Date(activity.date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center">
                          <Clock className="icon-sm text-text-muted mr-2" />
                          <p>Departure: {activity.time}</p>
                        </div>
                        {activity.estimatedArrival && (
                          <div className="flex items-center">
                            <Clock3 className="icon-sm text-text-muted mr-2" />
                            <p>Arrival: {activity.estimatedArrival}</p>
                          </div>
                        )}
                        <div className="flex items-center">
                          <Users className="icon-sm text-text-muted mr-2" />
                          <p>Passengers: {activity.passengers}</p>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="icon-sm text-text-muted mr-2" />
                          <p>
                            Price: ${activity.price.toFixed(2)} • 
                            {activity.paymentMethod && <span> Paid with {activity.paymentMethod}</span>}
                          </p>
                        </div>
                      </div>
                      
                      {/* Trip timeline visualization */}
                      <div className="mt-4 mb-2">
                        <h4 className="font-medium mb-2">Trip Timeline</h4>
                        <div className="relative">
                          <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-primary-100 dark:bg-primary-800"></div>
                          
                          <div className="relative flex items-center mb-3">
                            <div className="flex-shrink-0 z-10 h-8 w-8 rounded-full icon-background-primary mb-0">
                              <Clock className="icon-sm" />
                            </div>
                            <div className="ml-4">
                              <div className="font-medium">Booking Confirmed</div>
                              <div className="text-xs text-text-muted">
                                {activity.status !== 'scheduled' ? 'Completed' : 'Pending'}
                              </div>
                            </div>
                          </div>
                          
                          <div className={`relative flex items-center mb-3 ${
                            ['cancelled', 'scheduled'].includes(activity.status) ? 'opacity-50' : ''
                          }`}>
                            <div className={`flex-shrink-0 z-10 h-8 w-8 rounded-full flex items-center justify-center 
                              ${activity.status === 'in-progress' || activity.status === 'delayed' || activity.status === 'completed'
                                ? 'icon-background-primary mb-0'
                                : 'bg-background-alternate dark:bg-background-darkAlternate text-text-muted'
                              }`}>
                              <MapPin className="icon-sm" />
                            </div>
                            <div className="ml-4">
                              <div className="font-medium">Trip Started</div>
                              <div className="text-xs text-text-muted">
                                {activity.status === 'in-progress' || activity.status === 'delayed' || activity.status === 'completed'
                                  ? activity.time
                                  : 'Not started yet'
                                }
                              </div>
                            </div>
                          </div>
                          
                          <div className={`relative flex items-center ${
                            ['cancelled', 'scheduled', 'in-progress', 'delayed'].includes(activity.status) ? 'opacity-50' : ''
                          }`}>
                            <div className={`flex-shrink-0 z-10 h-8 w-8 rounded-full flex items-center justify-center 
                              ${activity.status === 'completed'
                                ? 'icon-background icon-background-primary mb-0'
                                : 'bg-background-alternate dark:bg-background-darkAlternate text-text-muted'
                              }`}>
                              <CheckCircle className="icon-sm" />
                            </div>
                            <div className="ml-4">
                              <div className="font-medium">Trip Completed</div>
                              <div className="text-xs text-text-muted">
                                {activity.status === 'completed'
                                  ? activity.estimatedArrival || 'Arrived'
                                  : 'Not completed yet'
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      {activity.driver && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Driver Information</h4>
                          <p>{activity.driver.name}</p>
                          <div className="flex items-center">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg 
                                  key={i} 
                                  className={`h-4 w-4 ${i < Math.floor(activity.driver!.rating) ? 'text-accent-yellow' : 'text-text-muted'}`} 
                                  fill="currentColor" 
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                              <span className="ml-1 text-sm text-text-muted">{activity.driver.rating}</span>
                            </div>
                          </div>
                          <p className="text-text-muted mt-1">{activity.driver.vehicleInfo}</p>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-medium mb-2">Trip Status</h4>
                        <div className="flex items-center mb-2">
                          {getStatusIcon(activity.status)}
                          <span className="ml-2 font-medium">{getStatusText(activity.status)}</span>
                        </div>
                        <p className="text-text-muted text-xs">Last updated: {activity.lastUpdated}</p>
                        
                        {activity.notes && (
                          <div className="mt-2 p-2 bg-background-alternate dark:bg-background-darkAlternate rounded text-sm">
                            <p className="italic">{activity.notes}</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Mock map preview */}
                      <div className="mt-4 map-container h-32">
                        <div className="h-full relative flex items-center justify-center bg-accent-green/10">
                          <div className="absolute inset-0 opacity-20 bg-accent-kente-gold"></div>
                          <button 
                            onClick={() => handleViewOnMap(activity)}
                            className="z-10 btn btn-primary-outline"
                          >
                            <MapIcon className="icon-sm mr-1" />
                            View on Map
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action buttons based on status */}
                  <div className="mt-4 pt-4 border-t border-primary-100 dark:border-primary-800 flex flex-wrap gap-2">
                    {activity.status === 'in-progress' && (
                      <>
                        <button className="btn btn-info">
                          Track Live
                        </button>
                        <button className="btn btn-outline border-error text-error dark:border-error dark:text-error">
                          Report Issue
                        </button>
                      </>
                    )}
                    
                    {activity.status === 'scheduled' && (
                      <>
                        <button className="btn btn-error">
                          Cancel Trip
                        </button>
                        <button className="btn btn-outline border-secondary text-secondary dark:border-secondary dark:text-secondary">
                          Modify Trip
                        </button>
                      </>
                    )}
                    
                    {activity.status === 'completed' && (
                      <button className="btn btn-success">
                        Leave Feedback
                      </button>
                    )}
                    
                    {activity.status === 'delayed' && (
                      <button className="btn btn-warning">
                        Get Updates
                      </button>
                    )}
                    
                    <button 
                      onClick={() => handleDownloadReceipt(activity.id)}
                      className="btn btn-outline border-text-muted text-text-muted flex items-center"
                    >
                      <Download className="icon-sm mr-1" />
                      Get Receipt
                    </button>
                    
                    <button 
                      onClick={() => handleShareTrip(activity)}
                      className="btn btn-outline border-text-muted text-text-muted flex items-center"
                    >
                      <Share2 className="icon-sm mr-1" />
                      Share
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="panel-footer flex items-center justify-between">
          <div className="text-sm text-text-muted">
            Showing {(page - 1) * itemsPerPage + 1}-{Math.min(page * itemsPerPage, filteredActivities.length)} of {filteredActivities.length}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-primary-ghost p-1"
              aria-label="Previous page"
            >
              <ChevronLeft className="icon-sm" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn btn-primary-ghost p-1"
              aria-label="Next page"
            >
              <ChevronRight className="icon-sm" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripActivityLog; 
import React from 'react';
import { LogTripActivity, LogTripStatus } from './TripActivityLog'; // Import shared types from TripActivityLog
import { ChevronDown, ChevronUp, CheckCircle, RefreshCw, XCircle, Clock, AlertCircle, Star, MapIcon, Download, Share2, Edit3, MessageSquare, Phone, MapPin as LocationPin, CalendarDays, Users, CreditCard } from 'lucide-react';

interface TripActivityItemProps {
  activity: LogTripActivity;
  isExpanded: boolean;
  onToggleExpand: (tripId: string) => void;
  onShareTrip: (activity: LogTripActivity) => void;
  onDownloadReceipt: (tripId: string, tripDate: string) => void;
  onViewOnMap: (activity: LogTripActivity) => void;
  getStatusBadgeClass: (status: LogTripStatus) => string;
  // Add props for new actions if needed, e.g., onModifyTrip, onCancelTrip
}

const TripActivityItem: React.FC<TripActivityItemProps> = ({
  activity,
  isExpanded,
  onToggleExpand,
  onShareTrip,
  onDownloadReceipt,
  onViewOnMap,
  getStatusBadgeClass,
}) => {

  const getLogStatusIcon = (status: LogTripStatus) => {
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
  };
  
  const getLogStatusText = (status: LogTripStatus) => {
    switch(status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      case 'cancelled': return 'Cancelled';
      case 'scheduled': return 'Scheduled';
      case 'delayed': return 'Delayed';
      default: return 'Unknown';
    }
  };

  const constActionButtonClass = "btn btn-sm btn-outline flex items-center gap-2 transition-all duration-200";
  const primaryActionButtonClass = "btn btn-sm btn-primary flex items-center gap-2 transition-all duration-200";


  return (
    <div className="card bg-base-100 dark:bg-section-medium shadow-md rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg">
      <div
        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 cursor-pointer hover:bg-base-200 dark:hover:bg-section-dark transition-colors duration-200 ${isExpanded ? 'border-b border-border dark:border-border-dark' : ''}`}
        onClick={() => onToggleExpand(activity.id)}
        role="button"
        aria-expanded={isExpanded}
        aria-controls={`trip-details-${activity.id}`}
      >
        <div className="flex items-center mb-2 sm:mb-0">
          <div className="mr-3 flex-shrink-0">
            {getLogStatusIcon(activity.status)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-base text-text-base dark:text-text-inverse truncate" title={`${activity.fromLocation} to ${activity.toLocation}`}>
              {activity.fromLocation} <span className="text-text-muted dark:text-text-muted-dark mx-1 text-sm">→</span> {activity.toLocation}
            </p>
            <p className="text-xs text-text-muted dark:text-text-muted-dark">
              {new Date(activity.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} at {activity.time}
            </p>
          </div>
        </div>
        <div className="flex items-center mt-2 sm:mt-0 ml-0 sm:ml-auto">
          <span className={`${getStatusBadgeClass(activity.status)} text-xs py-0.5 px-2`}>{getLogStatusText(activity.status)}</span>
          <span className="ml-2 text-text-muted dark:text-text-muted-dark">
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div id={`trip-details-${activity.id}`} className="p-4 bg-base-200 dark:bg-section-dark animate-fadeIn space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <h4 className="font-medium text-text-base dark:text-text-inverse flex items-center"><LocationPin className="h-4 w-4 mr-1.5 text-primary dark:text-primary-300"/>Route</h4>
              <p className="text-text-muted dark:text-text-muted-dark">From: {activity.fromLocation}</p>
              <p className="text-text-muted dark:text-text-muted-dark">To: {activity.toLocation}</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-text-base dark:text-text-inverse flex items-center"><CalendarDays className="h-4 w-4 mr-1.5 text-primary dark:text-primary-300"/>Schedule</h4>
              <p className="text-text-muted dark:text-text-muted-dark">Date: {new Date(activity.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p className="text-text-muted dark:text-text-muted-dark">Departure: {activity.time}</p>
              {activity.estimatedArrival && <p className="text-text-muted dark:text-text-muted-dark">Est. Arrival: {activity.estimatedArrival}</p>}
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-text-base dark:text-text-inverse flex items-center"><Users className="h-4 w-4 mr-1.5 text-primary dark:text-primary-300"/>Passengers</h4>
              <p className="text-text-muted dark:text-text-muted-dark">{activity.passengers} Passenger{activity.passengers !== 1 ? 's' : ''}</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-text-base dark:text-text-inverse flex items-center"><CreditCard className="h-4 w-4 mr-1.5 text-primary dark:text-primary-300"/>Payment</h4>
              <p className="text-text-muted dark:text-text-muted-dark">Price: ${activity.price.toFixed(2)}</p>
              <p className="text-text-muted dark:text-text-muted-dark">Method: {activity.paymentMethod || 'N/A'}</p>
            </div>
             {activity.driver && (
              <div className="lg:col-span-2 space-y-1">
                <h4 className="font-medium text-text-base dark:text-text-inverse flex items-center"><Users className="h-4 w-4 mr-1.5 text-primary dark:text-primary-300"/>Driver Information</h4>
                <div className="flex items-center">
                  <p className="text-text-muted dark:text-text-muted-dark">{activity.driver.name}</p>
                  <div className="flex items-center ml-2 text-accent-warning dark:text-yellow-400">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1 text-xs text-text-muted dark:text-text-muted-dark">{activity.driver.rating}/5</span>
                  </div>
                </div>
                <p className="text-text-muted dark:text-text-muted-dark text-xs">{activity.driver.vehicleInfo}</p>
              </div>
            )}
          </div>
          
          {activity.progressPercentage !== undefined && activity.status === 'in-progress' && (
            <div>
              <h4 className="font-medium text-sm text-text-base dark:text-text-inverse mb-1">Trip Progress</h4>
              <div className="w-full bg-base-300 dark:bg-section-medium rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${activity.progressPercentage}%` }}
                  role="progressbar"
                  aria-valuenow={activity.progressPercentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Trip progress ${activity.progressPercentage}%`}
                ></div>
              </div>
            </div>
          )}

          {activity.notes && (
            <div className="mt-2 p-3 bg-base-100 dark:bg-section-dark rounded-md border border-border dark:border-border-dark">
              <h4 className="font-medium text-sm text-text-base dark:text-text-inverse mb-1">Notes:</h4>
              <p className="text-xs text-text-muted dark:text-text-muted-dark italic">{activity.notes}</p>
            </div>
          )}

          <div className="pt-3 border-t border-border dark:border-border-dark flex flex-wrap items-center gap-2">
            {/* Status-specific actions */}
            {activity.status === 'in-progress' && (
              <>
                <button className={`${primaryActionButtonClass} btn-info`}><MapIcon className="h-4 w-4"/>Track Live</button>
                <button className={`${constActionButtonClass} text-error hover:bg-error hover:text-white dark:text-error dark:hover:bg-error dark:hover:text-white`}><AlertCircle className="h-4 w-4"/>Report Issue</button>
              </>
            )}
            {activity.status === 'scheduled' && (
              <>
                <button className={`${constActionButtonClass} text-error hover:bg-error hover:text-white dark:text-error dark:hover:bg-error dark:hover:text-white`}><XCircle className="h-4 w-4"/>Cancel Trip</button>
                <button className={`${constActionButtonClass} text-secondary hover:bg-secondary hover:text-white dark:text-secondary dark:hover:bg-secondary dark:hover:text-white`}><Edit3 className="h-4 w-4"/>Modify Details</button>
              </>
            )}
            {activity.status === 'completed' && (
              <button className={`${primaryActionButtonClass} btn-success`}><Star className="h-4 w-4"/>Leave Feedback</button>
            )}
             {activity.status === 'delayed' && (
              <button className={`${constActionButtonClass} text-warning hover:bg-warning hover:text-white dark:text-warning dark:hover:bg-warning dark:hover:text-white`}><MessageSquare className="h-4 w-4"/>Get Updates</button>
            )}

            {/* Common actions */}
            <button onClick={() => onViewOnMap(activity)} className={`${constActionButtonClass} text-primary hover:bg-primary hover:text-white dark:text-primary-300 dark:hover:bg-primary-300 dark:hover:text-black`}>
              <MapIcon className="h-4 w-4"/>View Map
            </button>
            <button onClick={() => onDownloadReceipt(activity.id, activity.date)} className={constActionButtonClass}>
              <Download className="h-4 w-4"/>Receipt
            </button>
            <button onClick={() => onShareTrip(activity)} className={constActionButtonClass}>
              <Share2 className="h-4 w-4"/>Share
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripActivityItem;
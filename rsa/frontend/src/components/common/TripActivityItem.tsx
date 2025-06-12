import '../../index.css';
import React from 'react';
import { LogTripActivity, LogTripStatus } from './TripActivityLog';
import { ChevronDown, ChevronUp, CheckCircle, RefreshCw, XCircle, Clock, AlertCircle, Star, MapIcon, Download, Share2, Edit3, MessageSquare, MapPin as LocationPin, CalendarDays, Users, CreditCard } from 'lucide-react';

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




  return (
    <div className="driver-trip-card group">
      <div
        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between cursor-pointer transition-colors duration-200 ${isExpanded ? 'border-b border-light dark:border-dark pb-4 mb-4' : ''}`}
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
            <p className="font-semibold text-base text-light-primary dark:text-dark-primary group-hover:text-primary transition-colors duration-200 truncate" title={`${activity.fromLocation} to ${activity.toLocation}`}>
              {activity.fromLocation} <span className="text-light-secondary dark:text-dark-secondary mx-1 text-sm">→</span> {activity.toLocation}
            </p>
            <p className="text-xs text-light-secondary dark:text-dark-secondary">
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
            <div className="space-y-2">
              <h4 className="font-medium text-light-primary dark:text-dark-primary flex items-center">
                <LocationPin className="h-4 w-4 mr-2 text-primary"/>
                Route
              </h4>
              <div className="space-y-1">
                <p className="text-light-secondary dark:text-dark-secondary">From: {activity.fromLocation}</p>
                <p className="text-light-secondary dark:text-dark-secondary">To: {activity.toLocation}</p>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-light-primary dark:text-dark-primary flex items-center">
                <CalendarDays className="h-4 w-4 mr-2 text-primary"/>
                Schedule
              </h4>
              <div className="space-y-1">
                <p className="text-light-secondary dark:text-dark-secondary">Date: {new Date(activity.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-light-secondary dark:text-dark-secondary">Departure: {activity.time}</p>
                {activity.estimatedArrival && <p className="text-light-secondary dark:text-dark-secondary">Est. Arrival: {activity.estimatedArrival}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-light-primary dark:text-dark-primary flex items-center">
                <Users className="h-4 w-4 mr-2 text-primary"/>
                Passengers
              </h4>
              <div className="space-y-1">
                <p className="text-light-secondary dark:text-dark-secondary">{activity.passengers} Passenger{activity.passengers !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-light-primary dark:text-dark-primary flex items-center">
                <CreditCard className="h-4 w-4 mr-2 text-primary"/>
                Payment
              </h4>
              <div className="space-y-1">
                <p className="text-light-secondary dark:text-dark-secondary">Price: ${activity.price?.toFixed(2) || 'N/A'}</p>
                <p className="text-light-secondary dark:text-dark-secondary">Method: {activity.paymentMethod || 'N/A'}</p>
              </div>
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

          <div className="pt-4 mt-4 border-t border-light dark:border-dark flex flex-wrap items-center gap-3">
            {/* Status-specific actions */}
            {activity.status === 'in-progress' && (
              <>
                <button className="btn btn-info btn-sm flex items-center gap-2">
                  <MapIcon className="h-4 w-4"/>
                  Track Live
                </button>
                <button className="btn btn-error btn-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4"/>
                  Report Issue
                </button>
              </>
            )}
            {activity.status === 'scheduled' && (
              <>
                <button className="btn btn-error btn-sm flex items-center gap-2">
                  <XCircle className="h-4 w-4"/>
                  Cancel Trip
                </button>
                <button className="btn btn-secondary btn-sm flex items-center gap-2">
                  <Edit3 className="h-4 w-4"/>
                  Modify Details
                </button>
              </>
            )}
            {activity.status === 'completed' && (
              <button className="btn btn-success btn-sm flex items-center gap-2">
                <Star className="h-4 w-4"/>
                Leave Feedback
              </button>
            )}
            {activity.status === 'delayed' && (
              <button className="btn btn-warning btn-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4"/>
                Get Updates
              </button>
            )}

            {/* Common actions */}
            <button
              onClick={() => onViewOnMap(activity)}
              className="btn btn-outline btn-sm flex items-center gap-2"
            >
              <MapIcon className="h-4 w-4"/>
              View Map
            </button>
            <button
              onClick={() => onDownloadReceipt(activity.id, activity.date)}
              className="btn btn-outline btn-sm flex items-center gap-2"
            >
              <Download className="h-4 w-4"/>
              Receipt
            </button>
            <button
              onClick={() => onShareTrip(activity)}
              className="btn btn-outline btn-sm flex items-center gap-2"
            >
              <Share2 className="h-4 w-4"/>
              Share
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripActivityItem;
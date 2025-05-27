import React, { useCallback } from 'react';
import { TripActivity, TripStatus } from '../../types'; // Assuming types are defined here or adjust path
import { ChevronDown, ChevronUp, CheckCircle, RefreshCw, XCircle, Clock, AlertCircle, Star, MapIcon, Download, Share2 } from 'lucide-react'; // Assuming lucide-react for icons
import { getStatusText } from '../../utils/tripUtils'; // Assuming utility function for status text

interface TripActivityItemProps {
  activity: TripActivity;
  isExpanded: boolean;
  onToggleExpand: (tripId: string) => void;
  onShareTrip: (activity: TripActivity) => void;
  onDownloadReceipt: (tripId: string, tripDate: string) => void;
  onViewOnMap: (activity: TripActivity) => void;
  getStatusBadgeClass: (status: TripStatus) => string;
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

  return (
    <div key={activity.id} className="border-b border-primary-100 dark:border-primary-800 last:border-b-0">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-background-alternate dark:hover:bg-background-darkAlternate transition-colors duration-200"
        onClick={() => onToggleExpand(activity.id)}
        role="button"
        aria-expanded={isExpanded}
        aria-controls={`trip-details-${activity.id}`}
        aria-label={`Toggle details for trip ${activity.id}`}
      >
        <div className="flex items-center">
          <div className="mr-3">
            {getStatusIcon(activity.status)}
          </div>
          <div>
            <p className="font-medium text-text-primary dark:text-text-primary-dark">{activity.fromLocation} to {activity.toLocation}</p>
            <p className="text-sm text-text-muted">{new Date(activity.date).toLocaleDateString()} at {activity.time}</p>
          </div>
        </div>
        <div className="flex items-center">
          <span className={getStatusBadgeClass(activity.status)}>{getStatusText(activity.status)}</span>
          {isExpanded ? <ChevronUp className="icon-sm ml-2" /> : <ChevronDown className="icon-sm ml-2" />}
        </div>
      </div>

      {isExpanded && (
        <div id={`trip-details-${activity.id}`} className="p-4 bg-background-alternate dark:bg-background-darkAlternate animate-fadeIn">
          {/* Expanded trip details content */} 
          {/* This section will contain the details previously rendered inline */} 
          {/* Locations and Dates/Times */} 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-medium mb-2">Locations</h4>
              <p className="text-text-muted">From: {activity.fromLocation}</p>
              <p className="text-text-muted">To: {activity.toLocation}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Dates & Times</h4>
              <p className="text-text-muted">Date: {new Date(activity.date).toLocaleDateString()}</p>
              <p className="text-text-muted">Departure: {activity.time}</p>
              {activity.estimatedArrival && <p className="text-text-muted">Estimated Arrival: {activity.estimatedArrival}</p>}
            </div>
          </div>

          {/* Passengers and Price/Payment */} 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-medium mb-2">Passengers</h4>
              <p className="text-text-muted">{activity.passengers} Passenger{activity.passengers > 1 ? 's' : ''}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Price & Payment</h4>
              <p className="text-text-muted">Price: {activity.price}</p>
              <p className="text-text-muted">Payment Method: {activity.paymentMethod}</p>
            </div>
          </div>

          {/* Trip Timeline (Placeholder) */} 
          <div className="mb-4">
            <h4 className="font-medium mb-2">Trip Timeline</h4>
            {/* Placeholder for a timeline visualization */} 
            <div className="bg-primary-100 dark:bg-primary-800 h-4 rounded-full overflow-hidden">
              {/* Example progress bar - replace with actual timeline component */} 
              {activity.status === 'in-progress' && (
                <div
                  className="bg-primary-500 h-full"
                  style={{ width: '50%' }} // Example progress
                  role="progressbar"
                  aria-valuenow={50} // Example value
                  aria-valuemin={0}
                  aria-valuemax={100}
                ></div>
              )}
            </div>
          </div>

          {/* Driver Info */} 
          {activity.driver && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Driver</h4>
              <div className="flex items-center">
                <p className="text-text-muted">{activity.driver.name}</p>
                <div className="flex items-center ml-2 text-accent-kente-gold">
                  <Star className="icon-sm fill-current" />
                  <span className="ml-1 text-sm text-text-muted">{activity.driver.rating}</span>
                </div>
              </div>
              <p className="text-text-muted mt-1">{activity.driver.vehicleInfo}</p>
            </div>
          )}

          {/* Trip Status Details */} 
          <div>
            <h4 className="font-medium mb-2">Trip Status</h4>
            <div className="flex items-center mb-2" role="status">
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
              <div className="absolute inset-0 opacity-20 bg-accent-kente-gold" aria-hidden="true"></div>
              <button
                onClick={() => onViewOnMap(activity)}
                className="z-10 btn btn-primary-outline"
                aria-label="View trip route on map"
              >
                <MapIcon className="icon-sm mr-1" aria-hidden="true" />
                View on Map
              </button>
            </div>
          </div>

          {/* Action buttons based on status */} 
          <div className="mt-4 pt-4 border-t border-primary-100 dark:border-primary-800 flex flex-wrap gap-2">
            {activity.status === 'in-progress' && (
              <>
                <button className="btn btn-info" aria-label="Track trip in real-time">
                  Track Live
                </button>
                <button className="btn btn-outline border-error text-error dark:border-error dark:text-error" aria-label="Report an issue with this trip">
                  Report Issue
                </button>
              </>
            )}

            {activity.status === 'scheduled' && (
              <>
                <button className="btn btn-error" aria-label="Cancel this scheduled trip">
                  Cancel Trip
                </button>
                <button className="btn btn-outline border-secondary text-secondary dark:border-secondary dark:text-secondary" aria-label="Modify trip details">
                  Modify Trip
                </button>
              </>
            )}

            {activity.status === 'completed' && (
              <button className="btn btn-success" aria-label="Leave feedback for this trip">
                Leave Feedback
              </button>
            )}

            {activity.status === 'delayed' && (
              <button className="btn btn-warning" aria-label="Get status updates for delayed trip">
                Get Updates
              </button>
            )}

            <button
              onClick={() => onDownloadReceipt(activity.id, activity.date)}
              className="btn btn-outline border-text-muted text-text-muted flex items-center"
              aria-label="Download trip receipt"
            >
              <Download className="icon-sm mr-1" aria-hidden="true" />
              Get Receipt
            </button>

            <button
              onClick={() => onShareTrip(activity)}
              className="btn btn-outline border-text-muted text-text-muted flex items-center"
              aria-label="Share trip details"
            >
              <Share2 className="icon-sm mr-1" aria-hidden="true" />
              Share
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripActivityItem;
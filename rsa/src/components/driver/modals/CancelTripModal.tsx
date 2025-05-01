import React from 'react';
import { AlertTriangle } from 'lucide-react';
import useDriverStore from '../../../store/driverStore';

const CancelTripModal: React.FC = () => {
  const { 
    showCancelModal, 
    closeCancelModal, 
    selectedTripId, 
    cancelTrip,
    loading,
    upcomingTrips 
  } = useDriverStore();

  if (!showCancelModal || !selectedTripId) return null;

  const trip = upcomingTrips.find(t => t.id === selectedTripId);
  if (!trip) return null;

  const handleCancel = async () => {
    await cancelTrip(selectedTripId);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={closeCancelModal}
      role="dialog"
      aria-labelledby="cancel-trip-title"
      aria-describedby="cancel-trip-description"
    >
      <div
        className="bg-white rounded-lg max-w-md w-full p-6 transform transition-all animate-modal-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-error-100 mx-auto mb-4">
          <AlertTriangle className="h-6 w-6 text-error-600" />
        </div>

        <h2
          id="cancel-trip-title"
          className="text-xl font-semibold text-center mb-2"
        >
          Cancel Trip
        </h2>

        <p
          id="cancel-trip-description"
          className="text-gray-600 text-center mb-6"
        >
          Are you sure you want to cancel the trip to {trip.route?.name} on {trip.date} at {trip.time}?
          This action cannot be undone.
        </p>

        <div className="flex space-x-3 justify-end">
          <button
            onClick={closeCancelModal}
            className="btn btn-secondary"
            disabled={loading}
          >
            Keep Trip
          </button>
          <button
            onClick={handleCancel}
            className="btn btn-danger"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Cancelling...
              </>
            ) : (
              'Cancel Trip'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelTripModal;
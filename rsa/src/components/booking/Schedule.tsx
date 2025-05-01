import React, { useEffect } from 'react';
import { Clock } from 'lucide-react';
import useBookingStore from '../../store/bookingStore';
import LoadingSpinner from '../common/LoadingSpinner';

const Schedule: React.FC = () => {
  const {
    selectedRoute,
    selectedTimeSlot,
    availableTimeSlots,
    loading,
    error,
    fetchTimeSlots,
    selectTimeSlot
  } = useBookingStore();

  useEffect(() => {
    if (selectedRoute?.id) {
      fetchTimeSlots(selectedRoute.id);
    }
  }, [selectedRoute, fetchTimeSlots]);

  if (!selectedRoute) {
    return (
      <div className="p-4 bg-warning-50 text-warning-700 rounded-md">
        <p>Please select a route first.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-error-50 text-error-700 rounded-md">
        <p>Error: {error}</p>
        <button
          onClick={() => selectedRoute?.id && fetchTimeSlots(selectedRoute.id)}
          className="mt-2 btn btn-primary text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-semibold mb-6">Select Time</h2>

      <div className="max-w-md mx-auto">
          <div className="mb-4 flex items-center">
            <Clock className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="font-medium">Available Times</h3>
          </div>
          
          {availableTimeSlots.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {availableTimeSlots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => selectTimeSlot(slot.id)}
                  className={`
                    p-3 rounded-lg border text-center transition-all duration-200
                    ${
                      selectedTimeSlot?.id === slot.id
                        ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <span className="block font-medium">{slot.time}</span>
                  <span className="text-sm text-gray-500">
                    {slot.availableSeats} seats left
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No available time slots for selected date.</p>
              <p className="text-sm text-gray-400 mt-2">Please try another date.</p>
            </div>
          )}
        </div>
      </div>

  );
};

export default Schedule;
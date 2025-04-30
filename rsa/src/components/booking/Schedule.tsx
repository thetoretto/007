import React, { useEffect, useState } from 'react';
import { format, addDays } from 'date-fns';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import useBookingStore from '../../store/bookingStore';
import LoadingSpinner from '../common/LoadingSpinner';
import { Clock, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const Schedule: React.FC = () => {
  const {
    selectedRoute,
    selectedDate,
    selectedTimeSlot,
    availableTimeSlots,
    selectDate,
    selectTimeSlot,
    fetchTimeSlots,
    loading,
    error,
  } = useBookingStore();

  const [calendarDate, setCalendarDate] = useState<Value>(
    selectedDate ? new Date(selectedDate) : new Date()
  );

  useEffect(() => {
    if (selectedRoute && calendarDate instanceof Date) {
      const formattedDate = format(calendarDate, 'yyyy-MM-dd');
      selectDate(formattedDate);
    }
  }, [selectedRoute, calendarDate, selectDate]);

  if (!selectedRoute) {
    return (
      <div className="p-4 bg-warning-50 text-warning-700 rounded-md">
        <p>Please select a route first.</p>
      </div>
    );
  }

  const handleDateChange = (value: Value) => {
    if (value instanceof Date) {
      setCalendarDate(value);
    }
  };

  const handleTimeSlotSelect = (timeSlotId: string) => {
    selectTimeSlot(timeSlotId);
  };

  // Function to render time slots grouped by time
  const renderTimeSlots = () => {
    if (loading) {
      return (
        <div className="flex justify-center my-8">
          <LoadingSpinner />
        </div>
      );
    }

    if (availableTimeSlots.length === 0) {
      return (
        <div className="p-4 bg-gray-50 rounded-md text-center">
          <p className="text-gray-500">No time slots available for this date.</p>
          <p className="text-sm text-gray-400 mt-1">Please select another date.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableTimeSlots.map((slot) => (
          <div
            key={slot.id}
            className={`
              p-4 rounded-lg cursor-pointer border transition-all
              ${
                selectedTimeSlot?.id === slot.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }
            `}
            onClick={() => handleTimeSlotSelect(slot.id)}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <span className="font-medium text-lg">{slot.time}</span>
              </div>
              <span className="font-medium text-primary-600">
                ${slot.price.toFixed(2)}
              </span>
            </div>
            
            <div className="mt-2 flex items-center">
              <div
                className={`h-2 w-2 rounded-full mr-2 ${
                  slot.availableSeats < 5
                    ? 'bg-error-500'
                    : slot.availableSeats < 10
                    ? 'bg-warning-500'
                    : 'bg-success-500'
                }`}
              ></div>
              {slot.availableSeats < 5 ? (
                <span className="text-sm text-error-700 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Only {slot.availableSeats} seats left
                </span>
              ) : (
                <span className="text-sm text-gray-500">
                  {slot.availableSeats} seats available
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-semibold mb-4">Choose Your Travel Date and Time</h2>

      <div className="mb-6">
        <div className="flex items-center mb-2">
          <CalendarIcon className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-medium">Select Date</h3>
        </div>
        
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="custom-calendar-wrapper">
            <Calendar
              onChange={handleDateChange}
              value={calendarDate}
              minDate={new Date()}
              maxDate={addDays(new Date(), 60)}
              className="custom-calendar"
            />
          </div>
        </div>
      </div>

      {selectedDate && (
        <div className="mt-8">
          <div className="flex items-center mb-4">
            <Clock className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-medium">
              Available Times for {format(new Date(selectedDate), 'MMMM d, yyyy')}
            </h3>
          </div>
          
          {error ? (
            <div className="p-4 bg-error-50 text-error-700 rounded-md">
              <p>Error: {error}</p>
              <button
                onClick={() => selectedRoute && fetchTimeSlots(selectedRoute.id, selectedDate)}
                className="mt-2 btn btn-primary text-sm"
              >
                Try Again
              </button>
            </div>
          ) : (
            renderTimeSlots()
          )}
        </div>
      )}

      <style jsx>{`
        /* Custom Calendar Styles */
        .custom-calendar-wrapper {
          margin: 0 auto;
          max-width: 100%;
          overflow: auto;
        }
        
        :global(.react-calendar) {
          width: 100%;
          border: none;
          font-family: inherit;
        }
        
        :global(.react-calendar__navigation) {
          margin-bottom: 1rem;
        }
        
        :global(.react-calendar__navigation button:enabled:hover),
        :global(.react-calendar__navigation button:enabled:focus) {
          background-color: #f3f4f6;
        }
        
        :global(.react-calendar__tile--now) {
          background: #eff6ff;
        }
        
        :global(.react-calendar__tile--now:enabled:hover),
        :global(.react-calendar__tile--now:enabled:focus) {
          background: #dbeafe;
        }
        
        :global(.react-calendar__tile--active) {
          background: #2563eb;
          color: white;
        }
        
        :global(.react-calendar__tile--active:enabled:hover),
        :global(.react-calendar__tile--active:enabled:focus) {
          background: #1d4ed8;
        }
        
        :global(.react-calendar__tile:enabled:hover),
        :global(.react-calendar__tile:enabled:focus) {
          background-color: #f3f4f6;
        }
      `}</style>
    </div>
  );
};

export default Schedule;
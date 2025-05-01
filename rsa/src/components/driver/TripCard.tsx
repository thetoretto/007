import React from 'react';
import { Calendar, Clock, Users, AlertCircle, CheckCircle } from 'lucide-react';
import useDriverStore from '../../store/driverStore';
import { Trip } from '../../types';

interface TripCardProps {
  trip: Trip;
  expanded: boolean;
}

const TripCard: React.FC<TripCardProps> = ({ trip, expanded }) => {
  const { 
    selectTrip,
    openCancelModal,
    openPassengerListModal,
    checkInPassenger,
    loading 
  } = useDriverStore();

  const handleCardClick = () => {
    selectTrip(expanded ? null : trip.id);
  };

  const handleCancelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openCancelModal();
  };

  const handleCheckInClick = async (e: React.MouseEvent, bookingId: string) => {
    e.stopPropagation();
    await checkInPassenger(bookingId);
  };

  return (
    <div
      className={`
        bg-white rounded-lg shadow-sm overflow-hidden
        transition-all duration-300 ease-in-out
        hover:shadow-md cursor-pointer
        ${expanded ? 'ring-2 ring-primary-500' : ''}
      `}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {trip.route?.name}
            </h3>
            <div className="mt-1 flex items-center text-sm text-gray-500 space-x-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{trip.date}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{trip.time}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="flex items-center text-gray-700">
              <Users className="h-4 w-4 mr-1" />
              <span>
                {trip.confirmedBookings} / {trip.availableSeats}
              </span>
            </div>
            {trip.pendingBookings > 0 && (
              <div className="mt-1 flex items-center text-warning-600 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>{trip.pendingBookings} pending</span>
              </div>
            )}
          </div>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-gray-900">Passenger List</h4>
              <div className="flex space-x-2">
                <button
                  onClick={handleCancelClick}
                  className="btn btn-danger btn-sm"
                  disabled={loading}
                >
                  Cancel Trip
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openPassengerListModal();
                  }}
                  className="btn btn-primary btn-sm"
                  disabled={loading}
                >
                  View Details
                </button>
              </div>
            </div>

            {trip.bookings.length > 0 ? (
              <div className="space-y-2">
                {trip.bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {booking.passenger?.firstName} {booking.passenger?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Seat {booking.seatId}
                        {booking.hasDoorstepPickup && ' • Doorstep Pickup'}
                      </p>
                    </div>
                    <div>
                      {booking.status === 'confirmed' ? (
                        <button
                          onClick={(e) => handleCheckInClick(e, booking.id)}
                          className="btn btn-success btn-sm"
                          disabled={loading}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Check In
                        </button>
                      ) : (
                        <span className={`badge badge-${booking.status}`}>
                          {booking.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">
                No bookings for this trip yet.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripCard;
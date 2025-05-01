import React from 'react';
import { Users, CheckCircle, MapPin, Phone, Mail } from 'lucide-react';
import useDriverStore from '../../../store/driverStore';

const PassengerListModal: React.FC = () => {
  const {
    showPassengerListModal,
    closePassengerListModal,
    selectedTripId,
    upcomingTrips,
    checkInPassenger,
    loading
  } = useDriverStore();

  if (!showPassengerListModal || !selectedTripId) return null;

  const trip = upcomingTrips.find(t => t.id === selectedTripId);
  if (!trip) return null;

  const handleCheckIn = async (bookingId: string) => {
    await checkInPassenger(bookingId);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={closePassengerListModal}
      role="dialog"
      aria-labelledby="passenger-list-title"
    >
      <div
        className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto transform transition-all animate-modal-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              id="passenger-list-title"
              className="text-xl font-semibold"
            >
              Passenger List
            </h2>
            <p className="text-gray-500 mt-1">
              {trip.route?.name} • {trip.date} at {trip.time}
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="font-medium">
              {trip.confirmedBookings} / {trip.availableSeats}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {trip.bookings.map((booking) => (
            <div
              key={booking.id}
              className="border rounded-lg p-4 hover:border-primary-200 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {booking.passenger?.firstName} {booking.passenger?.lastName}
                  </h3>
                  <div className="mt-2 space-y-1 text-sm text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{booking.passenger?.address}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{booking.passenger?.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>{booking.passenger?.email}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center space-x-3 text-sm">
                    <span className="text-gray-500">Seat {booking.seatId}</span>
                    {booking.hasDoorstepPickup && (
                      <span className="badge badge-info">Doorstep Pickup</span>
                    )}
                  </div>
                </div>

                <div>
                  {booking.status === 'confirmed' ? (
                    <button
                      onClick={() => handleCheckIn(booking.id)}
                      className="btn btn-success btn-sm"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Check In
                        </>
                      )}
                    </button>
                  ) : (
                    <span
                      className={`badge badge-${booking.status} capitalize`}
                    >
                      {booking.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={closePassengerListModal}
            className="btn btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PassengerListModal;
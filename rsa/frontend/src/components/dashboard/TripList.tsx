import { useState } from 'react';
import { Calendar, Clock, Users, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Trip } from '../../types';

type TripListProps = {
  trips: Trip[];
  selectedTrip: string | null;
  onTripSelect: (tripId: string) => void;
  onCancel: (tripId: string) => void;
  onCheckIn: (bookingId: string) => void;
  detailLinkBase: string;
  showPassengerActions?: boolean;
  vehicles: Array<{ id: string; type: string; model: string }>;
};

export const TripList = ({
  trips,
  selectedTrip,
  onTripSelect,
  onCancel,
  onCheckIn,
  detailLinkBase,
  showPassengerActions = true,
  vehicles
}: TripListProps) => {
  const [localSelectedTrip, setLocalSelectedTrip] = useState<string | null>(null);

  const handleTripSelect = (tripId: string) => {
    setLocalSelectedTrip(tripId === localSelectedTrip ? null : tripId);
    onTripSelect(tripId);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Trip Schedule</h2>
      </div>
      
      <div className="overflow-hidden">
        {trips.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className={`hover:bg-gray-50 cursor-pointer p-4 sm:px-6 lg:px-8 transition-colors ${
                  localSelectedTrip === trip.id ? 'bg-primary-50' : ''
                }`}
                onClick={() => handleTripSelect(trip.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">
                      {/* {trip.route?.name} */} {/* Removed route name */}
                      {trip.fromLocation} to {trip.toLocation} {/* Added from/to location */}
                      <span className="text-sm text-gray-500 ml-2">
                        ({vehicles.find(v => v.id === trip.vehicleId)?.type})
                      </span>
                    </h3>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{trip.date}</span>
                      <span className="mx-2">•</span>
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{trip.time}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm">
                        {trip.confirmedBookings} / {trip.availableSeats}
                      </span>
                    </div>
                    {trip.pendingBookings > 0 && (
                      <div className="mt-1 flex items-center text-xs text-warning-600">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        <span>{trip.pendingBookings} pending bookings</span>
                      </div>
                    )}
                  </div>
                </div>

                {localSelectedTrip === trip.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
                    <div className="mb-4 flex justify-between items-center">
                      <h4 className="font-medium text-gray-900">Passenger List</h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCancel(trip.id);
                          }}
                          className="btn btn-danger py-1 px-3 text-xs"
                        >
                          Cancel Trip
                        </button>
                        <a
                          href={`${detailLinkBase}/${trip.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="btn btn-primary py-1 px-3 text-xs"
                        >
                          Trip Details
                        </a>
                      </div>
                    </div>

                    {trip.bookings.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {trip.bookings.map((booking) => (
                          <div key={booking.id} className="py-2 flex items-center justify-between">
                            <div>
                              <p className="font-medium">
                                {booking.passenger?.firstName} {booking.passenger?.lastName}
                              </p>
                              <p className="text-xs text-gray-500">
                                Seat {booking.seatId.split('s')[1].split('v')[0]}
                                {booking.hasDoorstepPickup && ' • Doorstep Pickup'}
                              </p>
                            </div>
                            {showPassengerActions && (
                              <div>
                                {booking.status === 'confirmed' ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onCheckIn(booking.id);
                                    }}
                                    className="btn bg-success-500 hover:bg-success-600 text-white py-1 px-3 text-xs"
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Check In
                                  </button>
                                ) : booking.status === 'checked-in' ? (
                                  <span className="badge badge-success text-xs">Checked In</span>
                                ) : (
                                  <span className="badge badge-warning text-xs">{booking.status}</span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No bookings for this trip yet.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No scheduled trips</h3>
            <p className="mt-1 text-sm text-gray-500">
              There are currently no trips in the schedule.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
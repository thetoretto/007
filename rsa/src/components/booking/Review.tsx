import React from 'react';
import { MapPin, Calendar, Clock, Users, TruckIcon } from 'lucide-react';
import useBookingStore from '../../store/bookingStore';

const Review: React.FC = () => {
  const {
    selectedRoute,
    selectedVehicle,
    selectedSeat,
    selectedTimeSlot,
    doorstepPickup,
    pickupAddress,
    selectedExtras,
    baseFare,
    fees,
    extrasTotal,
    total,
  } = useBookingStore();

  if (!selectedRoute || !selectedVehicle || !selectedSeat || !selectedTimeSlot) {
    return (
      <div className="p-4 bg-warning-50 text-warning-700 rounded-md">
        <p>Please complete all previous steps before proceeding to review.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-semibold mb-6">Review Your Booking</h2>
      
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="p-4 space-y-4">
          <div className="flex items-start">
            <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Route</p>
              <p className="font-medium">{selectedRoute.name}</p>
              <div className="text-sm text-gray-600 mt-1">
                <p>{selectedRoute.origin.name} to {selectedRoute.destination.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedRoute.distance} miles • ~{selectedRoute.duration} min
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-start">
            <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">{selectedTimeSlot.date}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Clock className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Time</p>
              <p className="font-medium">{selectedTimeSlot.time}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Users className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Vehicle & Seat</p>
              <p className="font-medium">{selectedVehicle.model}</p>
              <p className="text-sm text-gray-600">Seat {selectedSeat.number}</p>
            </div>
          </div>
          
          {doorstepPickup && (
            <div className="flex items-start">
              <TruckIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Doorstep Pickup</p>
                <p className="font-medium">{pickupAddress || 'Address not provided'}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4">
          <h3 className="font-medium mb-4">Price Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Base fare</span>
              <span className="font-medium">${baseFare.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Service fee</span>
              <span className="font-medium">${fees.toFixed(2)}</span>
            </div>
            {doorstepPickup && (
              <div className="flex justify-between">
                <span className="text-gray-600">Doorstep pickup</span>
                <span className="font-medium">$5.00</span>
              </div>
            )}
            {extrasTotal > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Extras</span>
                <span className="font-medium">${extrasTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="pt-3 mt-2 border-t border-gray-100 flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold text-lg">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;
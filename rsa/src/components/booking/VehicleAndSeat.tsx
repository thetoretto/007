import React, { useEffect } from 'react';
import { Info, Check } from 'lucide-react';
import useBookingStore from '../../store/bookingStore';
import LoadingSpinner from '../common/LoadingSpinner';

const VehicleAndSeat: React.FC = () => {
  const {
    selectedRoute,
    vehicles,
    selectedVehicle,
    availableSeats,
    selectedSeat,
    fetchVehicles,
    selectVehicle,
    selectSeat,
    loading,
    error,
  } = useBookingStore();

  useEffect(() => {
    if (selectedRoute) {
      fetchVehicles(selectedRoute.id);
    }
  }, [selectedRoute, fetchVehicles]);

  if (!selectedRoute) {
    return (
      <div className="p-4 bg-warning-50 text-warning-700 rounded-md">
        <p>Please select a route first.</p>
      </div>
    );
  }

  if (loading && vehicles.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-error-50 text-error-700 rounded-md">
        <p>Error: {error}</p>
        <button
          onClick={() => selectedRoute && fetchVehicles(selectedRoute.id)}
          className="mt-2 btn btn-primary text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-semibold mb-4">Choose Your Vehicle and Seat</h2>

      {vehicles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className={`
                  p-4 rounded-lg cursor-pointer border transition-all
                  ${
                    selectedVehicle?.id === vehicle.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }
                `}
                onClick={() => selectVehicle(vehicle.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{vehicle.model}</h3>
                    <p className="text-sm text-gray-500">
                      License Plate: {vehicle.licensePlate}
                    </p>
                    <p className="text-sm text-gray-500">
                      Capacity: {vehicle.capacity} seats
                    </p>
                  </div>
                  {selectedVehicle?.id === vehicle.id && (
                    <span className="h-6 w-6 bg-primary-500 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {vehicle.features.map((feature) => (
                    <span
                      key={feature}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {feature.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {selectedVehicle && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Select Your Seat</h3>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-400 rounded mr-2"></div>
                    <span>Taken</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-primary-500 rounded mr-2"></div>
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-success-100 border border-success-500 rounded mr-2"></div>
                    <span>Accessible</span>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center my-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="relative bg-white p-6 rounded-lg border border-gray-200">
                  <div className="absolute top-0 left-4 w-12 h-6 bg-gray-300 rounded-b-xl flex items-center justify-center text-xs font-medium">
                    Front
                  </div>
                  
                  <div className="mt-8 grid grid-cols-4 gap-3">
                    {availableSeats.map((seat) => (
                      <button
                        key={seat.id}
                        disabled={!seat.isAvailable}
                        onClick={() => seat.isAvailable && selectSeat(seat.id)}
                        className={`
                          relative h-14 w-full rounded-t-lg flex items-center justify-center border-2 border-b-4 focus:outline-none
                          ${
                            !seat.isAvailable
                              ? 'bg-gray-200 border-gray-300 cursor-not-allowed'
                              : selectedSeat?.id === seat.id
                              ? 'bg-primary-100 border-primary-500 text-primary-700'
                              : seat.isHandicapAccessible
                              ? 'bg-success-50 border-success-300 hover:bg-success-100'
                              : 'bg-white border-gray-300 hover:bg-gray-50'
                          }
                        `}
                      >
                        <span className="font-medium">{seat.number}</span>
                        {seat.isHandicapAccessible && (
                          <div className="absolute -top-1 -right-1 h-4 w-4 bg-success-500 rounded-full flex items-center justify-center text-white">
                            <span className="sr-only">Accessible seat</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                              <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  
                  <div className="absolute bottom-0 left-4 w-12 h-6 bg-gray-300 rounded-t-xl flex items-center justify-center text-xs font-medium">
                    Back
                  </div>
                </div>
              )}

              {selectedSeat && (
                <div className="mt-4 p-4 bg-primary-50 border border-primary-200 rounded-md">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-primary-500 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium">You selected seat {selectedSeat.number}</p>
                      <p className="text-sm text-gray-600">
                        {selectedSeat.isHandicapAccessible
                          ? 'This is a handicap-accessible seat with extra space.'
                          : 'Standard seat'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No vehicles available for this route.</p>
        </div>
      )}
    </div>
  );
};

export default VehicleAndSeat;
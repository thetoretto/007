import React, { useEffect } from 'react';
import { Info, Check } from 'lucide-react';
import useBookingStore from '../../store/bookingStore';
import LoadingSpinner from '../common/LoadingSpinner';

const VehicleSelection: React.FC = () => {
  const {
    selectedRoute,
    vehicles,
    selectedVehicle,
    fetchVehicles,
    selectVehicle,
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
      <h2 className="text-xl font-semibold mb-4">Choose Your Vehicle</h2>

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
                      {vehicle.type} - {vehicle.capacity} seats
                    </p>
                  </div>
                  {selectedVehicle?.id === vehicle.id && (
                    <Check className="h-5 w-5 text-primary-600" />
                  )}
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>{vehicle.description}</p>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
                  <div>
                    <span className="text-gray-500">Amenities:</span>{' '}
                    <span className="font-medium">
                      {vehicle.amenities.join(', ') || 'Standard'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Base Price:</span>{' '}
                    <span className="font-medium text-primary-600">
                      ${vehicle.basePrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedVehicle && (
            <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
              <p className="text-success-700 font-medium">
                Selected: {selectedVehicle.model}
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="p-4 bg-gray-50 rounded-md text-center">
          <p className="text-gray-500">No vehicles available for this route.</p>
        </div>
      )}
    </div>
  );
};

export default VehicleSelection;
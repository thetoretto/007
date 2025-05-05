import { useEffect } from 'react';
import { useBookingStore } from '../../../store/bookingStore';
import { Loader } from '../../../components/ui/Loader';

export const VehicleSelection = () => {
  const {
    vehicles,
    loading,
    error,
    selectedVehicle,
    selectVehicle,
    fetchVehicles,
    selectedRoute
  } = useBookingStore();

  useEffect(() => {
    if (selectedRoute?.id) {
      fetchVehicles(selectedRoute.id);
    }
  }, [selectedRoute?.id]);

  const handleSelectVehicle = (vehicleId: string) => {
    selectVehicle(vehicleId);
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Select Your Vehicle</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            onClick={() => handleSelectVehicle(vehicle.id)}
            className={`p-4 border rounded-lg cursor-pointer transition-colors
              ${selectedVehicle?.id === vehicle.id
                ? 'border-blue-500 bg-blue-50'
                : 'hover:border-gray-400'}`}
          >
            <div className="font-medium">{vehicle.name}</div>
            <div className="text-sm text-gray-600 mt-2">
              {vehicle.type} • {vehicle.capacity} seats
            </div>
            
            {/* Safe array access with default values */}
            {(vehicle.features || []).length > 0 && (
              <div className="mt-2 text-sm">
                Features: {(vehicle.features || []).join(', ')}
              </div>
            )}

            {(vehicle.amenities?.length || 0) > 0 && (
              <div className="mt-2 text-sm">
                Amenities: {(vehicle.amenities || []).join(', ')}
              </div>
            )}

            <div className="mt-2 font-medium">
              ${vehicle.basePrice?.toFixed(2) || '0.00'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
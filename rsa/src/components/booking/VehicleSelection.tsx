import React, { useState } from 'react';
import useBookingStore from '../../store/bookingStore';
import Vehicle from '../../types/index.ts';
import LoadingSpinner from '../common/LoadingSpinner';
import { ChevronDown } from 'lucide-react';

// Sample car images from the web
const carImages = [
  { id: 'car1', name: 'Toyota Hiace', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/2014_Toyota_HiAce_%28TRH201R%29_van_%282015-07-24%29_01.jpg/1200px-2014_Toyota_HiAce_%28TRH201R%29_van_%282015-07-24%29_01.jpg' },
  { id: 'car2', name: 'Toyota Coaster', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Toyota_Coaster_XZB50_502.jpg/1200px-Toyota_Coaster_XZB50_502.jpg' },
  { id: 'car3', name: 'Nissan Civilian', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Nissan_Civilian_W41_001.JPG/1200px-Nissan_Civilian_W41_001.JPG' },
  { id: 'car4', name: 'Mitsubishi Rosa', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Mitsubishi_Rosa_%28BE63DG%29.jpg/1200px-Mitsubishi_Rosa_%28BE63DG%29.jpg' },
  { id: 'car5', name: 'Toyota Land Cruiser', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/2021_Toyota_Land_Cruiser_300_3.5_ZX_%28GFZ%29_in_Indonesia.jpg/1200px-2021_Toyota_Land_Cruiser_300_3.5_ZX_%28GFZ%29_in_Indonesia.jpg' },
];

const VehicleSelection: React.FC = () => {
  const {
    vehicles,
    selectedVehicle,
    loading,
    error,
    selectVehicle,
    fetchVehicles
  } = useBookingStore();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  React.useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  if (loading && vehicles.length === 0) {
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
          onClick={() => fetchVehicles()}
          className="mt-2 btn btn-primary text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-semibold mb-4">Select Your Vehicle</h2>
      
      {/* Vehicle Dropdown Selection */}
      <div className="mb-6">
        <label htmlFor="vehicle-dropdown" className="block text-sm font-medium text-gray-700 mb-2">
          Choose a vehicle from Rwanda
        </label>
        <div className="relative">
          <button
            type="button"
            className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
          >
            <span className="flex items-center">
              {selectedVehicle ? (
                <>
                  <img 
                    src={selectedVehicle.imageUrl || carImages.find(car => car.name === selectedVehicle.model)?.image || carImages[0].image} 
                    alt={selectedVehicle.model} 
                    className="h-10 w-16 object-cover rounded mr-3" 
                  />
                  <span className="block truncate">{selectedVehicle.model}</span>
                </>
              ) : (
                <span className="block truncate">Select a vehicle</span>
              )}
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </button>

          {isDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              {carImages.map((car) => (
                <div
                  key={car.id}
                  className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-primary-50"
                  onClick={() => {
                    // Find or create a vehicle with this model
                    const vehicle = vehicles.find(v => v.model === car.name) || {
                      id: car.id,
                      model: car.name,
                      imageUrl: car.image,
                      capacity: 14,
                      luggageCapacity: 4,
                      comfortLevel: 'Standard',
                      pricePerMile: 1.5
                    };
                    selectVehicle(vehicle.id);
                    setIsDropdownOpen(false);
                  }}
                >
                  <div className="flex items-center">
                    <img src={car.image} alt={car.name} className="h-10 w-16 object-cover rounded mr-3" />
                    <span className="font-medium block truncate">{car.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Vehicle Cards Display */}
      {selectedVehicle && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="aspect-w-16 aspect-h-9 mb-4">
            <img
              src={selectedVehicle.imageUrl || carImages.find(car => car.name === selectedVehicle.model)?.image || carImages[0].image}
              alt={selectedVehicle.model}
              className="object-cover rounded-md w-full h-48"
            />
          </div>
          
          <h3 className="font-medium text-lg mb-2">{selectedVehicle.model}</h3>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Capacity:</span>
              <span className="font-medium">{selectedVehicle.capacity} passengers</span>
            </div>
            <div className="flex justify-between">
              <span>Luggage:</span>
              <span className="font-medium">{selectedVehicle.luggageCapacity} bags</span>
            </div>
            <div className="flex justify-between">
              <span>Comfort:</span>
              <span className="font-medium">{selectedVehicle.comfortLevel}</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-primary-600 font-medium">
                {selectedVehicle.pricePerMile ? `RWF ${Number(selectedVehicle.pricePerMile * 1000).toFixed(0)}/km` : 'Price unavailable'}
              </span>
              <span className="text-sm text-success-600 font-medium">
                Selected
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleSelection;
import '../../../index.css';
// d:\007\rsa\frontend\src\components\booking\steps\VehicleStep.tsx
import React from 'react';
import { Vehicle as GlobalVehicle } from '../../../types'; // Import GlobalVehicle from global types
import { Check, Truck, Info } from 'lucide-react'; 

interface VehicleStepProps {
  vehicles: GlobalVehicle[]; // Use GlobalVehicle
  selectedVehicleId: string | null | undefined;
  onSelectVehicle: (vehicleId: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

const VehicleStep: React.FC<VehicleStepProps> = ({ vehicles, selectedVehicleId, onSelectVehicle, onNext, onPrev }) => {

  const handleSelect = (vehicleId: string) => {
    onSelectVehicle(vehicleId);
    // Optionally move next automatically
    // onNext(); 
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Your Vehicle</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto pr-2">
        {vehicles.length > 0 ? (
          vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className={`
                p-4 border rounded-lg cursor-pointer transition-all duration-200 ease-in-out 
                flex justify-between items-center hover:shadow-md hover:border-blue-400
                ${selectedVehicleId === vehicle.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300' : 'border-gray-200 bg-white'}
              `}
              onClick={() => handleSelect(vehicle.id)}
            >
              <div className="flex items-center space-x-3">
                {/* Placeholder for vehicle icon based on type */} 
                <Truck size={24} className="text-primary-500 flex-shrink-0" /> 
                <div>
                  <span className="font-semibold text-gray-800 block">{vehicle.model}</span>
                  <span className="text-sm text-gray-600">{vehicle.type} - {vehicle.capacity} seats</span>
                  {vehicle.features && vehicle.features.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1 capitalize">
                      Features: {vehicle.features.join(', ').replace(/_/g, ' ')}
                    </p>
                  )}
                </div>
              </div>
              {/* Price is now associated with the Trip, not displayed per vehicle here */}
              {/* If needed, pass trip price or other info for display */}
              {selectedVehicleId === vehicle.id && (
                <Check size={20} className="text-blue-600 ml-3 flex-shrink-0 absolute top-2 right-2" />
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4 col-span-1 md:col-span-2">No vehicles available for this route.</p>
        )}
      </div>
      {/* Navigation buttons live in BookingWidget */}
    </div>
  );
};

export default VehicleStep;
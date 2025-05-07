import '../../../index.css';
// d:\007\rsa\frontend\src\components\booking\steps\RouteStep.tsx
import React from 'react';
import { Trip as StoreTrip } from '../../../store/tripStore'; // Import StoreTrip
import { MapPin, ArrowRight, Check, Calendar, Clock, DollarSign } from 'lucide-react';

interface RouteStepProps {
  trips: StoreTrip[]; // Changed from routes: Route[]
  selectedTripId: string | null | undefined; // Changed from selectedRouteId
  onSelectTrip: (tripId: string) => void; // Changed from onSelectRoute
  onNext: () => void;
}

const RouteStep: React.FC<RouteStepProps> = ({ trips, selectedTripId, onSelectTrip, onNext }) => {

  const handleSelect = (tripId: string) => {
    onSelectTrip(tripId);
    // onNext(); // Consider if auto-next is desired or if user clicks a separate button
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Your Trip</h3>
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {trips.length > 0 ? (
          trips.map(trip => (
            <div
              key={trip.id}
              className={`
                p-4 border rounded-lg cursor-pointer transition-all duration-200 ease-in-out 
                flex flex-col sm:flex-row justify-between items-start sm:items-center hover:shadow-lg hover:border-primary-400
                ${selectedTripId === trip.id ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-300' : 'border-gray-200 bg-white'}
              `}
              onClick={() => handleSelect(trip.id)}
            >
              <div className="flex-grow mb-3 sm:mb-0">
                <div className="flex items-center space-x-3 mb-2">
                  <MapPin size={20} className="text-primary-500 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-800 block text-md">{trip.fromLocation || trip.route?.origin.name}</span>
                    <span className="text-xs text-gray-500">{trip.route?.origin.city}</span>
                  </div>
                  <ArrowRight size={18} className="text-gray-400 flex-shrink-0 mx-1 sm:mx-2" />
                  <MapPin size={20} className="text-success-500 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-800 block text-md">{trip.toLocation || trip.route?.destination.name}</span>
                    <span className="text-xs text-gray-500">{trip.route?.destination.city}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                  <span className="flex items-center"><Calendar size={14} className="mr-1 text-gray-500" /> {trip.date}</span>
                  <span className="flex items-center"><Clock size={14} className="mr-1 text-gray-500" /> {trip.time}</span>
                  {trip.price !== undefined && (
                    <span className="flex items-center font-medium text-primary-600"><DollarSign size={14} className="mr-0.5" /> {trip.price.toFixed(2)}</span>
                  )}
                </div>
                 {trip.vehicle && (
                  <p className="text-xs text-gray-500 mt-1">Vehicle: {trip.vehicle.model} ({trip.vehicle.type}) - Seats: {trip.availableSeats}/{trip.vehicle.capacity}</p>
                )}
              </div>
              
              {selectedTripId === trip.id && (
                <div className="flex-shrink-0 sm:ml-4 mt-2 sm:mt-0">
                  <Check size={24} className="text-primary-600" />
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-6">No trips available for the selected criteria. Please try adjusting your search.</p>
        )}
      </div>
    </div>
  );
};

export default RouteStep;
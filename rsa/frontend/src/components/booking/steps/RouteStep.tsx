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
      <h3 className="text-lg font-semibold text-text-base dark:text-text-inverse mb-4">Select Your Trip</h3> {/* Adjusted for dark mode */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {trips.length > 0 ? (
          trips.map(trip => (
            <div
              key={trip.id}
              className={`
                card-base p-4 cursor-pointer transition-all duration-200 ease-in-out 
                flex flex-col sm:flex-row justify-between items-start sm:items-center 
                hover:border-primary dark:hover:border-primary-200
                ${selectedTripId === trip.id 
                  ? 'border-primary bg-primary-100/50 ring-2 ring-primary dark:border-primary-200 dark:bg-primary-900/30 dark:ring-primary-200' 
                  : 'border-gray-200 dark:border-gray-700 bg-background-light dark:bg-section-dark'}
              `}
              onClick={() => handleSelect(trip.id)}
            >
              <div className="flex-grow mb-3 sm:mb-0">
                <div className="flex items-center space-x-3 mb-2">
                  <MapPin size={20} className="text-primary dark:text-primary-200 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-text-base dark:text-text-inverse block text-md">{trip.fromLocation || trip.route?.origin.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{trip.route?.origin.city}</span>
                  </div>
                  <ArrowRight size={18} className="text-gray-400 dark:text-gray-500 flex-shrink-0 mx-1 sm:mx-2" />
                  <MapPin size={20} className="text-success dark:text-primary-200 flex-shrink-0" /> {/* Assuming success maps to a primary-like color in dark mode or use a specific success dark color */}
                  <div>
                    <span className="font-semibold text-text-base dark:text-text-inverse block text-md">{trip.toLocation || trip.route?.destination.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{trip.route?.destination.city}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <span className="flex items-center"><Calendar size={14} className="mr-1 text-gray-500 dark:text-gray-400" /> {trip.date}</span>
                  <span className="flex items-center"><Clock size={14} className="mr-1 text-gray-500 dark:text-gray-400" /> {trip.time}</span>
                  {trip.price !== undefined && (
                    <span className="flex items-center font-medium text-primary dark:text-primary-200"><DollarSign size={14} className="mr-0.5" /> {trip.price.toFixed(2)}</span>
                  )}
                </div>
                 {trip.vehicle && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Vehicle: {trip.vehicle.model} ({trip.vehicle.type}) - Seats: {trip.availableSeats}/{trip.vehicle.capacity}</p>
                )}
              </div>
              
              {selectedTripId === trip.id && (
                <div className="flex-shrink-0 sm:ml-4 mt-2 sm:mt-0">
                  <Check size={24} className="text-primary dark:text-primary-200" />
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-6">No trips available for the selected criteria. Please try adjusting your search.</p>
        )}
      </div>
    </div>
  );
};

export default RouteStep;
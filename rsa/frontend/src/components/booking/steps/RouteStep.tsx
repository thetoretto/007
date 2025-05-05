// d:\007\rsa\frontend\src\components\booking\steps\RouteStep.tsx
import React from 'react';
import { Route } from '../types';
// Remove CSS module import
// import styles from '../BookingWidget.module.css'; 
import { MapPin, ArrowRight, Check } from 'lucide-react';

interface RouteStepProps {
  routes: Route[];
  selectedRouteId: string | null | undefined;
  onSelectRoute: (routeId: string) => void;
  onNext: () => void; // To proceed to the next step
}

const RouteStep: React.FC<RouteStepProps> = ({ routes, selectedRouteId, onSelectRoute, onNext }) => {

  const handleSelect = (routeId: string) => {
    onSelectRoute(routeId);
    // Optionally call onNext() immediately after selection, or rely on a separate 'Continue' button
    // For now, let's assume selection implies moving next if a separate button isn't added in the main widget
    // onNext();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Your Route</h3>
      {/* Add Search/Filter later if needed */}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {routes.length > 0 ? (
          routes.map(route => (
            <div
              key={route.id}
              className={`
                p-4 border rounded-lg cursor-pointer transition-all duration-200 ease-in-out 
                flex justify-between items-center hover:shadow-md hover:border-blue-400
                ${selectedRouteId === route.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300' : 'border-gray-200 bg-white'}
              `}
              onClick={() => handleSelect(route.id)}
            >
              <div className="flex-grow flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin size={18} className="text-blue-500 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-gray-800 block">{route.origin.name}</span>
                    <span className="text-xs text-gray-500">{route.origin.city}</span>
                  </div>
                </div>
                <ArrowRight size={16} className="text-gray-400 flex-shrink-0" />
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin size={18} className="text-green-500 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-gray-800 block">{route.destination.name}</span>
                    <span className="text-xs text-gray-500">{route.destination.city}</span>
                  </div>
                </div>
              </div>
              <div className="text-right text-sm text-gray-500 ml-4 flex-shrink-0 space-x-2">
                <span>{route.distance} mi</span>
                <span>~{route.duration} min</span>
              </div>
              {selectedRouteId === route.id && (
                <Check size={20} className="text-blue-600 ml-3 flex-shrink-0" />
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">No routes available.</p>
        )}
      </div>
      {/* The 'Continue' button lives in the main BookingWidget component */}
    </div>
  );
};

export default RouteStep;
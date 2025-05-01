import React, { useEffect } from 'react';
import { MapPin, Plus, Minus, Package, Award, Shield } from 'lucide-react';
import useBookingStore from '../../store/bookingStore';
import LoadingSpinner from '../common/LoadingSpinner';

const PickupAndExtras: React.FC = () => {
  const {
    selectedRoute,
    doorstepPickup,
    pickupAddress,
    selectedExtras,
    availableExtras,
    toggleDoorstepPickup,
    setPickupAddress,
    fetchExtras,
    addExtra,
    removeExtra,
    loading,
    error,
  } = useBookingStore();

  useEffect(() => {
    fetchExtras();
  }, [fetchExtras]);

  if (!selectedRoute) {
    return (
      <div className="p-4 bg-warning-50 text-warning-700 rounded-md">
        <p>Please select a route first.</p>
      </div>
    );
  }

  const getExtraQuantity = (extraId: string) => {
    const extra = selectedExtras.find(item => item.extra.id === extraId);
    return extra ? extra.quantity : 0;
  };

  const getExtraIcon = (name: string) => {
    if (name.toLowerCase().includes('luggage')) return <Package className="h-5 w-5" />;
    if (name.toLowerCase().includes('priority')) return <Award className="h-5 w-5" />;
    if (name.toLowerCase().includes('insurance')) return <Shield className="h-5 w-5" />;
    return null;
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-semibold mb-4">Pickup Options & Extras</h2>
      
      <div className="mb-8">
        <div className="flex items-start">
          <div className="flex h-5 items-center">
            <input
              id="doorstepPickup"
              name="doorstepPickup"
              type="checkbox"
              checked={doorstepPickup}
              onChange={toggleDoorstepPickup}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="doorstepPickup" className="font-medium text-gray-700">
              Doorstep Pickup (+$5.00)
            </label>
            <p className="text-gray-500">
              We'll pick you up directly from your location instead of the standard station.
            </p>
          </div>
        </div>
        
        {doorstepPickup && (
          <div className="mt-4">
            <label htmlFor="pickupAddress" className="block text-sm font-medium text-gray-700">
              Pickup Address
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="pickupAddress"
                name="pickupAddress"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="Enter your pickup address"
                className="form-input pl-10"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Please provide your full address including city and zip code.
            </p>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Add Travel Extras</h3>
        
        {loading && availableExtras.length === 0 ? (
          <div className="flex justify-center my-8">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="p-4 bg-error-50 text-error-700 rounded-md">
            <p>Error: {error}</p>
            <button
              onClick={() => fetchExtras()}
              className="mt-2 btn btn-primary text-sm"
            >
              Try Again
            </button>
          </div> 
        ) : (
          <div className="space-y-4">
            {availableExtras.map(extra => {
              const quantity = getExtraQuantity(extra.id);
              
              return (
                <div 
                  key={extra.id}
                  className="p-4 border border-gray-200 rounded-lg bg-white"
                >
                  <div className="flex justify-between">
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
                        {getExtraIcon(extra.name)}
                      </div>
                      <div>
                        <h4 className="font-medium">{extra.name}</h4>
                        <p className="text-sm text-gray-500">{extra.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-primary-600">${extra.price.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex justify-end">
                    <div className="flex items-center">
                      <button
                        type="button"
                        disabled={quantity === 0}
                        onClick={() => removeExtra(extra.id)}
                        className={`
                          p-1 rounded-full focus:outline-none
                          ${
                            quantity === 0
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:bg-gray-100'
                          }
                        `}
                      >
                        <Minus className="h-5 w-5" />
                      </button>
                      <span className="mx-2 w-6 text-center">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => addExtra(extra.id)}
                        className="p-1 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {availableExtras.length === 0 && !loading && !error && (
          <div className="p-4 bg-gray-50 rounded-md text-center">
            <p className="text-gray-500">No extras available for this trip.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PickupAndExtras;
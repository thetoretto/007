import '../../index.css';
import React, { useState, useEffect } from 'react';
import useTripStore, { Trip } from '../../store/tripStore';
import useVehicleStore from '../../store/vehicleStore'; // Import vehicle store
import useAuthStore from '../../store/authStore'; // Import auth store
import useHotPointStore, { HotPoint } from '../../store/hotPointStore'; // Import hot point store and type
import { mockRoutes, Route as AppRoute } from '../../utils/mockData'; // Assuming Route type is exported or define here
import { X, Save, MapPin, Calendar, Clock, DollarSign, FileText, CheckSquare, Square, Truck } from 'lucide-react'; // Added CheckSquare, Square, Truck

interface TripFormProps {
  isOpen: boolean; // Kept for modal usage, CreateTripPage will always pass true or handle visibility differently
  onClose: () => void; // Kept for modal usage
  tripToEdit?: Trip | null;
  onSubmit?: (data: Trip | Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  isCreatePageContext?: boolean; // To indicate if it's used in CreateTripPage for specific layout/logic
}

const TripForm: React.FC<TripFormProps> = ({ isOpen, onClose, tripToEdit, onSubmit, isCreatePageContext }) => {
  const { addTrip, updateTrip } = useTripStore();
  const { user } = useAuthStore();
  const { vehicles, fetchVehicles } = useVehicleStore();
  const { hotPoints, fetchHotPoints } = useHotPointStore(); // Get hot points

  const [formData, setFormData] = useState({
    routeId: '', // Added from CreateTripPage
    // fromLocation: '', // Will be derived from routeId
    // toLocation: '',   // Will be derived from routeId
    vehicleId: '',
    date: '',
    time: '',
    price: '',
    notes: '',
    offersPickup: false, // Added from CreateTripPage
    pickupHotPointIds: [] as string[], // Added from CreateTripPage
  });

  const [availableRoutes, setAvailableRoutes] = useState<AppRoute[]>(mockRoutes);

  // Effect for fetching vehicles, hotpoints and setting routes
  useEffect(() => {
    if (user?.id) {
      // Fetch vehicles if user is logged in (and form is open, or if it's create page context)
      if (isOpen || isCreatePageContext) {
        console.log(`TripForm: Fetching vehicles for user ${user.id}`);
        fetchVehicles(user.id);
      }
    }
    // For now, using mockRoutes directly. In a real app, these might be fetched.
    setAvailableRoutes(mockRoutes);
    if (isOpen || isCreatePageContext) {
        fetchHotPoints(); // Fetch hot points
    }
  }, [isOpen, isCreatePageContext, user?.id, fetchVehicles, fetchHotPoints]);

  // Effect for setting/resetting form data
  useEffect(() => {
    if (isOpen || isCreatePageContext) {
        if (tripToEdit) {
          console.log('TripForm: Pre-filling form for editing trip:', tripToEdit.id);
          // Find routeId if fromLocation and toLocation match a route
          const matchedRoute = availableRoutes.find(r => r.origin.name === tripToEdit.fromLocation && r.destination.name === tripToEdit.toLocation);
          setFormData({
            routeId: matchedRoute?.id || '', // Try to match existing from/to with a route
            vehicleId: tripToEdit.vehicleId || '',
            date: tripToEdit.date,
            time: tripToEdit.time,
            price: tripToEdit.price?.toString() || '',
            notes: tripToEdit.notes || '',
            offersPickup: tripToEdit.offersPickup || false,
            pickupHotPointIds: tripToEdit.pickupHotPointIds || [],
          });
        } else {
          console.log('TripForm: Resetting form for new trip.');
          setFormData({
            routeId: '',
            vehicleId: '',
            date: '',
            time: '',
            price: '',
            notes: '',
            offersPickup: false,
            pickupHotPointIds: [],
          });
        }
    } 
    // Optional: Reset form when modal closes if not in create page context
    // else if (!isCreatePageContext) {
    //    setFormData({ routeId: '', vehicleId: '', date: '', time: '', price: '', notes: '', offersPickup: false, pickupHotPointIds: [] });
    // }
  }, [tripToEdit, isOpen, isCreatePageContext, availableRoutes]); // Add availableRoutes to dependencies

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (name === 'offersPickup') {
      setFormData(prev => ({
        ...prev,
        offersPickup: (e.target as HTMLInputElement).checked,
        pickupHotPointIds: (e.target as HTMLInputElement).checked ? prev.pickupHotPointIds : [] // Clear selected hot points if pickup is disabled
      }));
    } else if (name === 'pickupHotPointIds') {
      const selectedOptions = Array.from((e.target as HTMLSelectElement).selectedOptions).map(option => option.value);
      setFormData(prev => ({ ...prev, pickupHotPointIds: selectedOptions }));
    } else {
      // Ensure price is handled as a string in state but converted to number on submit
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id && !tripToEdit?.driverId) { // Allow admin to edit trips without setting user.id as driverId
        alert('User not authenticated or driverId missing for edit.');
        return;
    }
    if (!formData.routeId) {
      alert('Please select a route.');
      return;
    }
    if (!formData.vehicleId) {
      alert('Please select a vehicle.');
      return;
    }
    if (!formData.date || !formData.time) {
      alert('Please select date and time.');
      return;
    }
    const priceValue = parseFloat(formData.price);
    if (isNaN(priceValue) || priceValue <= 0) {
        alert('Please enter a valid positive price.');
        return;
    }

    const selectedRoute = availableRoutes.find(route => route.id === formData.routeId);
    if (!selectedRoute) {
      alert('Selected route not found. Please select a valid route.');
      return;
    }

    const fromLocation = selectedRoute.origin.name;
    const toLocation = selectedRoute.destination.name;

    const tripDataPayload = {
      fromLocation,
      toLocation,
      vehicleId: formData.vehicleId,
      date: formData.date,
      time: formData.time,
      price: priceValue,
      notes: formData.notes,
      offersPickup: formData.offersPickup,
      pickupHotPointIds: formData.offersPickup ? formData.pickupHotPointIds : [],
      // driverId will be handled below based on context
    };

    if (onSubmit) { // Primarily for Admin page or CreateTripPage that provides its own submit logic
        let dataToSubmit: Trip | Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'status'>;
        if (tripToEdit) {
            dataToSubmit = {
                ...tripToEdit, // existing trip data
                ...tripDataPayload, // form data
                driverId: tripToEdit.driverId, // Preserve original driverId when admin edits
            };
        } else {
            dataToSubmit = {
                ...tripDataPayload,
                driverId: user?.id || '', // For new trips, current user is the driver
            };
        }
        onSubmit(dataToSubmit as Trip | Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'status'>);
        // onClose might be handled by the parent in this case, or not needed if embedded
    } else { // Default behavior (e.g., for DriverDashboard modal)
        const finalTripData = {
            ...tripDataPayload,
            driverId: tripToEdit ? tripToEdit.driverId : (user?.id || ''), // Preserve driverId on edit, else current user
        };

        if (tripToEdit) {
            updateTrip(tripToEdit.id, finalTripData);
            console.log('Updating trip (internal):', tripToEdit.id, finalTripData);
        } else {
            addTrip(finalTripData as Omit<Trip, 'id' | 'status' | 'createdAt' | 'updatedAt'>); // Cast for addTrip
            console.log('Adding new trip (internal):', finalTripData);
        }
        onClose(); // Close modal after submission
    }
  };

  if (!isOpen && !isCreatePageContext) return null; // Don't render if not open and not in create page context

  // Log vehicles right before rendering the form
  console.log('TripForm Render: Vehicles from store:', vehicles);
  console.log('TripForm Render: HotPoints from store:', hotPoints);

  const formContent = (
    <form onSubmit={handleSubmit} className={`space-y-4 ${isCreatePageContext ? '' : 'p-6'}`}> {/* Remove padding if embedded */} 
      {/* Route Selection */}
      <div>
        <label htmlFor="routeId" className="block text-sm font-medium text-gray-700 mb-1">Route</label>
        <select
          id="routeId"
          name="routeId"
          value={formData.routeId}
          onChange={handleChange}
          required
          className="form-select w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
        >
          <option value="" disabled>Select a route</option>
          {availableRoutes.map(route => (
            <option key={route.id} value={route.id}>
              {route.origin.name} to {route.destination.name}
            </option>
          ))}
        </select>
      </div>

      {/* Vehicle Selection */}
      <div>
        <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Truck className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <select
            id="vehicleId"
            name="vehicleId"
            value={formData.vehicleId}
            onChange={handleChange}
            required
            className="form-select w-full pl-10 border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
            >
            <option value="" disabled>Select a vehicle</option>
            {vehicles.length === 0 && <option disabled>{user?.id ? 'No vehicles found or loading...' : 'Please log in to see vehicles'}</option>} 
            {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                {vehicle.brand} {vehicle.model} ({vehicle.licensePlate}) - {vehicle.capacity} seats
                </option>
            ))}
            </select>
        </div>
      </div>

      {/* Date/Time/Price Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="form-input w-full pl-10"
            />
          </div>
        </div>
        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">Time</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Clock className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              className="form-input w-full pl-10"
            />
          </div>
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="number" // Keep as number for native validation, state handles string
              id="price"
              name="price"
              value={formData.price} // formData.price is string, input type number handles conversion
              onChange={handleChange}
              required
              min="0.01"
              step="0.01"
              className="form-input w-full pl-10"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Notes Textarea */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
        <div className="relative">
          <div className="absolute top-3 left-0 pl-3 flex items-center pointer-events-none">
             <FileText className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            className="form-input w-full pl-10"
            placeholder="Any additional details for the trip..."
          ></textarea>
        </div>
      </div>

      {/* Hot Point Pickup Options */}
      <div className="space-y-2 pt-2">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input 
            type="checkbox" 
            name="offersPickup"
            checked={formData.offersPickup}
            onChange={handleChange}
            className="form-checkbox h-5 w-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-gray-700">Offer Hot Point Pickup</span>
        </label>

        {formData.offersPickup && (
          <div>
            <label htmlFor="pickupHotPointIds" className="block text-sm font-medium text-gray-700 mb-1">Select Pickup Hot Points</label>
            <select
              multiple
              id="pickupHotPointIds"
              name="pickupHotPointIds"
              value={formData.pickupHotPointIds}
              onChange={handleChange}
              className="form-multiselect w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 h-32"
            >
              {hotPoints.filter(hp => hp.status === 'active').length === 0 && <option value="" disabled>No active hot points available</option>}
              {hotPoints.filter(hp => hp.status === 'active').map(hp => (
                <option key={hp.id} value={hp.id}>
                  {hp.name} - {hp.address}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">Hold Ctrl (or Cmd on Mac) to select multiple hot points.</p>
          </div>
        )}
      </div>

      {/* Submit/Cancel Buttons */}
      <div className={`flex ${isCreatePageContext ? 'justify-start' : 'justify-end'} space-x-3 pt-4 ${isCreatePageContext ? '' : 'border-t border-gray-200 mt-6'}`}> 
        {!isCreatePageContext && (
            <button 
            type="button" 
            onClick={onClose} 
            className="btn btn-secondary"
            >
            Cancel
            </button>
        )}
        <button 
          type="submit" 
          className={`btn btn-primary ${isCreatePageContext ? 'w-full flex justify-center items-center' : ''}`}
        >
          <Save className="h-4 w-4 mr-2" />
          {tripToEdit ? 'Update Trip' : 'Create Trip'}
        </button>
      </div>
    </form>
  );

  if (isCreatePageContext) {
    return formContent; // Render form directly if in create page context
  }

  return (
    // Modal overlay and container for non-embedded use
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative mx-auto p-6 border w-full max-w-lg shadow-xl rounded-lg card">
        <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-5">
          <h3 className="text-lg font-semibold text-gray-900">
            {tripToEdit ? 'Edit Trip Details' : 'Create New Trip'}
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        {formContent}
      </div>
    </div>
  );
};

export default TripForm;
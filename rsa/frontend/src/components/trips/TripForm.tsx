import React, { useState, useEffect } from 'react';
import useTripStore, { Trip } from '../../store/tripStore';
import useVehicleStore from '../../store/vehicleStore'; // Import vehicle store
import useAuthStore from '../../store/authStore'; // Import auth store
import { mockRoutes } from '../../utils/mockData'; // Keep mock routes for now
import { X, Save, MapPin } from 'lucide-react';

interface TripFormProps {
  isOpen: boolean;
  onClose: () => void;
  tripToEdit?: Trip | null; // Optional prop for editing existing trips
}

const TripForm: React.FC<TripFormProps> = ({ isOpen, onClose, tripToEdit }) => {
  const { addTrip, updateTrip } = useTripStore();
  const { user } = useAuthStore(); // Get user for driverId
  const { vehicles, fetchVehicles } = useVehicleStore(); // Get vehicles and fetch action
  const [formData, setFormData] = useState({
    fromLocation: '', // Changed from routeId
    toLocation: '',   // Added toLocation
    vehicleId: '',
    date: '',
    time: '',
    price: '', // Add price to form data
    notes: '', // Added notes field
  });

  // Effect for fetching vehicles based on user and modal state
  useEffect(() => {
    if (user?.id && isOpen) {
      console.log(`TripForm: Fetching vehicles for user ${user.id} because modal is open.`);
      fetchVehicles(user.id);
    }
    // We don't reset vehicles here; the store manages its state.
    // Fetching depends on the modal being open and the user ID being available.
  }, [isOpen, user?.id, fetchVehicles]); // Depend on user.id directly for clarity

  // Effect for setting/resetting form data based on editing state and modal visibility
  useEffect(() => {
    if (isOpen) {
        if (tripToEdit) {
          // Pre-fill form if editing
          console.log('TripForm: Pre-filling form for editing trip:', tripToEdit.id);
          setFormData({
            fromLocation: tripToEdit.fromLocation || '', // Changed from routeId
            toLocation: tripToEdit.toLocation || '',   // Added toLocation
            vehicleId: tripToEdit.vehicleId || '', // Handle potentially undefined vehicleId
            date: tripToEdit.date,
            time: tripToEdit.time,
            price: tripToEdit.price?.toString() || '',
            notes: tripToEdit.notes || '', // Added notes field
          });
        } else {
          // Reset form if creating a new trip
          console.log('TripForm: Resetting form for new trip.');
          setFormData({
            fromLocation: '', // Changed from routeId
            toLocation: '',   // Added toLocation
            vehicleId: '', // Start with no vehicle selected
            date: '',
            time: '',
            price: '',
            notes: '', // Added notes field
          });
        }
    } else {
        // Optional: Reset form when modal closes, if desired
        // setFormData({ fromLocation: '', toLocation: '', vehicleId: '', date: '', time: '', price: '' });
    }
  }, [tripToEdit, isOpen]); // Run when modal opens/closes or the trip being edited changes

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { // Added HTMLTextAreaElement
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add price validation
    if (!formData.fromLocation || !formData.toLocation || !formData.vehicleId || !formData.date || !formData.time || !formData.price) {
      alert('Please fill in all fields, including From, To, and Price.'); // Simple validation
      return;
    }

    const priceValue = parseFloat(formData.price);
    if (isNaN(priceValue) || priceValue < 0) {
        alert('Please enter a valid positive price.');
        return;
    }

    const tripData = {
        fromLocation: formData.fromLocation, // Changed from routeId
        toLocation: formData.toLocation,   // Added toLocation
        vehicleId: formData.vehicleId,
        date: formData.date,
        time: formData.time,
        price: priceValue, // Add price to trip data
        driverId: user?.id || '', // Add driverId from logged-in user
        notes: formData.notes, // Added notes field
        // status will be set in the store
    };

    if (tripToEdit) {
      updateTrip(tripToEdit.id, tripData);
      console.log('Updating trip:', tripToEdit.id, tripData);
    } else {
      addTrip(tripData);
      console.log('Adding new trip:', tripData);
    }
    onClose(); // Close modal after submission
  };

  if (!isOpen) return null;

  // Log vehicles right before rendering the form
  console.log('TripForm Render: Vehicles from store:', vehicles);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative mx-auto p-6 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {tripToEdit ? 'Edit Trip' : 'Create New Trip'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fromLocation" className="block text-sm font-medium text-gray-700">From</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                id="fromLocation"
                name="fromLocation"
                value={formData.fromLocation}
                onChange={handleChange}
                required
                className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 px-3"
                placeholder="Enter starting location"
              />
            </div>
          </div>

          <div>
            <label htmlFor="toLocation" className="block text-sm font-medium text-gray-700">To</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                id="toLocation"
                name="toLocation"
                value={formData.toLocation}
                onChange={handleChange}
                required
                className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 px-3"
                placeholder="Enter destination location"
              />
            </div>
          </div>

          <div>
            <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-700">Vehicle</label>
            <select
              id="vehicleId"
              name="vehicleId"
              value={formData.vehicleId}
              onChange={handleChange}
              required
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="" disabled>Select a vehicle</option>
              {/* Use vehicles from the store */}
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.brand} {vehicle.model} ({vehicle.licensePlate}) - {vehicle.capacity} seats
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>

          {/* Add Notes Textarea */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Add any relevant notes for this trip..."
            />
          </div>

          {/* Add Price Input */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price ($)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="e.g., 25.50"
            />
          </div>

          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700">Time</label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex items-center"
            >
              <Save size={16} className="mr-2" />
              {tripToEdit ? 'Save Changes' : 'Create Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TripForm;
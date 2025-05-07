import React, { useState, useEffect } from 'react';
import useTripStore, { Trip } from '../../store/tripStore';
import useVehicleStore from '../../store/vehicleStore'; // Import vehicle store
import useAuthStore from '../../store/authStore'; // Import auth store
import { mockRoutes } from '../../utils/mockData'; // Keep mock routes for now
import { X, Save, MapPin, Calendar, Clock, DollarSign, FileText } from 'lucide-react'; // Added icons

interface TripFormProps {
  isOpen: boolean;
  onClose: () => void;
  tripToEdit?: Trip | null;
  onSubmit?: (data: Trip | Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void; // Added onSubmit prop
}

const TripForm: React.FC<TripFormProps> = ({ isOpen, onClose, tripToEdit, onSubmit }) => {
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
    if (!formData.fromLocation || !formData.toLocation || !formData.vehicleId || !formData.date || !formData.time || !formData.price) {
      alert('Please fill in all required fields, including From, To, and Price.');
      return;
    }

    const priceValue = parseFloat(formData.price);
    if (isNaN(priceValue) || priceValue < 0) {
        alert('Please enter a valid positive price.');
        return;
    }

    // Define baseTripData with a more precise type
    const baseTripData: Omit<Trip, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'driverId'> & { driverId?: string } = {
        fromLocation: formData.fromLocation,
        toLocation: formData.toLocation,
        vehicleId: formData.vehicleId,
        date: formData.date,
        time: formData.time,
        price: priceValue,
        notes: formData.notes,
        driverId: user?.role === 'driver' ? user.id : (tripToEdit?.driverId || undefined),
    };

    if (onSubmit) { // If onSubmit is provided (e.g., from AdminDashboard)
        let dataToSubmit: Trip | Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'status'>;
        if (tripToEdit) {
            // For editing, merge existing trip data with form data
            dataToSubmit = {
                ...tripToEdit,
                ...baseTripData,
                // Ensure driverId is correctly set if admin is editing and it was part of tripToEdit
                driverId: user?.role === 'admin' && tripToEdit.driverId ? tripToEdit.driverId : baseTripData.driverId,
            };
        } else {
            // For creating, use baseTripData. Admin might not set driverId here.
            dataToSubmit = {
                ...baseTripData,
                driverId: user?.role === 'driver' ? user.id : undefined, // Explicitly undefined if admin and new trip
            };
        }
        onSubmit(dataToSubmit as Trip | Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'status'>);
        // onClose is typically handled by the parent component that provided onSubmit
    } else {
        // Default behavior (e.g., for DriverDashboard or if onSubmit is not provided)
        const finalTripData = {
            ...baseTripData,
            driverId: user?.id || '', // Fallback for driverId if not set by role logic above
        };

        if (tripToEdit) {
            updateTrip(tripToEdit.id, finalTripData);
            console.log('Updating trip (internal):', tripToEdit.id, finalTripData);
        } else {
            addTrip(finalTripData);
            console.log('Adding new trip (internal):', finalTripData);
        }
        onClose(); // Close modal after submission
    }
  };

  if (!isOpen) return null;

  // Log vehicles right before rendering the form
  console.log('TripForm Render: Vehicles from store:', vehicles);

  return (
    // Updated: Modal overlay and centering
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      {/* Updated: Modal container styling */}
      <div className="relative mx-auto p-6 border w-full max-w-lg shadow-xl rounded-lg bg-white">
        {/* Updated: Header styling */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-5">
          <h3 className="text-lg font-semibold text-gray-900">
            {tripToEdit ? 'Edit Trip Details' : 'Create New Trip'}
          </h3>
          {/* Updated: Close button styling */}
          <button 
            onClick={onClose} 
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        {/* Updated: Form spacing */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Updated: Input group styling */}
          <div>
            <label htmlFor="fromLocation" className="block text-sm font-medium text-gray-700 mb-1">From Location</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              {/* Updated: Input styling */}
              <input
                type="text"
                id="fromLocation"
                name="fromLocation"
                value={formData.fromLocation}
                onChange={handleChange}
                required
                className="form-input w-full pl-10 border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
                placeholder="Enter starting point"
              />
            </div>
          </div>

          {/* Updated: Input group styling */}
          <div>
            <label htmlFor="toLocation" className="block text-sm font-medium text-gray-700 mb-1">To Location</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              {/* Updated: Input styling */}
              <input
                type="text"
                id="toLocation"
                name="toLocation"
                value={formData.toLocation}
                onChange={handleChange}
                required
                className="form-input w-full pl-10 border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
                placeholder="Enter destination point"
              />
            </div>
          </div>

          {/* Updated: Select styling */}
          <div>
            <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
            <select
              id="vehicleId"
              name="vehicleId"
              value={formData.vehicleId}
              onChange={handleChange}
              required
              className="form-select w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
            >
              <option value="" disabled>Select a vehicle</option>
              {vehicles.length === 0 && <option disabled>Loading vehicles...</option>} 
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.brand} {vehicle.model} ({vehicle.licensePlate}) - {vehicle.capacity} seats
                </option>
              ))}
            </select>
          </div>

          {/* Updated: Grid for Date/Time/Price */}
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
                  className="form-input w-full pl-10 border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
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
                  className="form-input w-full pl-10 border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
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
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="form-input w-full pl-10 border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Updated: Textarea styling */}
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
                className="form-textarea w-full pl-10 border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
                placeholder="Any additional details for the trip..."
              ></textarea>
            </div>
          </div>

          {/* Updated: Button group styling */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
            >
              <Save className="h-4 w-4 mr-2" />
              {tripToEdit ? 'Update Trip' : 'Create Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TripForm;
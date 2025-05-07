import '../../index.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import useVehicleStore, { Vehicle } from '../../store/vehicleStore';
import useTripStore from '../../store/tripStore';
import useHotPointStore, { HotPoint } from '../../store/hotPointStore'; // Import hot point store and type
import { mockRoutes, Route as AppRoute } from '../../utils/mockData'; // Assuming Route type is exported or define here
import DashboardNavbar from '../../components/dashboard/DashboardNavbar';
import Footer from '../../components/common/Footer';
import { Calendar, Clock, MapPinIcon, Truck, Save, CheckSquare, Square } from 'lucide-react'; // Added CheckSquare, Square
import '../../index.css';

const CreateTripPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { vehicles, fetchVehicles } = useVehicleStore();
  const { addTrip } = useTripStore();
  const { hotPoints, fetchHotPoints } = useHotPointStore(); // Get hot points

  const [formData, setFormData] = useState({
    routeId: '',
    vehicleId: '',
    date: '',
    time: '',
    // fromLocation: '', // Will be derived from route
    // toLocation: '', // Will be derived from route
    price: 0,
    notes: '',
    offersPickup: false, // New state for offering pickup
    pickupHotPointIds: [], // New state for selected hot point IDs
  });

  const [availableRoutes, setAvailableRoutes] = useState<AppRoute[]>(mockRoutes);

  useEffect(() => {
    if (user?.id) {
      fetchVehicles(user.id);
    }
    // For now, using mockRoutes directly. In a real app, these might be fetched.
    setAvailableRoutes(mockRoutes);
    fetchHotPoints(); // Fetch hot points on component mount
  }, [user, fetchVehicles, fetchHotPoints]);

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
      setFormData(prev => ({ ...prev, [name]: name === 'price' || type === 'number' ? parseFloat(value) : value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      alert('User not authenticated.');
      return;
    }
    if (!formData.vehicleId) {
      alert('Please select a vehicle.');
      return;
    }
    if (!formData.routeId) {
      alert('Please select a route.');
      return;
    }
    if (!formData.date || !formData.time) {
      alert('Please select date and time.');
      return;
    }

    const newTripData = {
      driverId: user.id,
      routeId: formData.routeId,
      vehicleId: formData.vehicleId,
      date: formData.date,
      time: formData.time,
      price: formData.price, // Ensure price is handled
      notes: formData.notes, // Ensure notes are handled
      offersPickup: formData.offersPickup,
      pickupHotPointIds: formData.offersPickup ? formData.pickupHotPointIds : [],
    };

    addTrip(newTripData);
    alert('Trip created successfully!');
    navigate('/driver/trips'); // Navigate back to trip management page
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <DashboardNavbar userRole="driver" />
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Trip</h1>
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg space-y-6">
          
          <div>
            <label htmlFor="routeId" className="block text-sm font-medium text-gray-700 mb-1">Route</label>
            <select
              id="routeId"
              name="routeId"
              value={formData.routeId}
              onChange={handleChange}
              required
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="" disabled>Select a route</option>
              {availableRoutes.map(route => (
                <option key={route.id} value={route.id}>
                  {route.origin.name} to {route.destination.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
            <select
              id="vehicleId"
              name="vehicleId"
              value={formData.vehicleId}
              onChange={handleChange}
              required
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="" disabled>Select your vehicle</option>
              {vehicles.length > 0 ? (
                vehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.brand} {vehicle.model} ({vehicle.licensePlate}) - Capacity: {vehicle.capacity}
                  </option>
                ))
              ) : (
                <option value="" disabled>No vehicles available. Add one first.</option>
              )}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full pl-10 py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full pl-10 py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price (per seat)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>

          {/* Hot Point Pickup Options */}
          <div className="space-y-2">
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
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm h-32"
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

          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 items-center"
            >
              <Save className="h-5 w-5 mr-2" />
              Create Trip
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default CreateTripPage;
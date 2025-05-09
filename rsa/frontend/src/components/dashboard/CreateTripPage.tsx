import '../../index.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import useVehicleStore, { Vehicle } from '../../store/vehicleStore';
import useTripStore, { Trip } from '../../store/tripStore';
import useHotPointStore, { HotPoint } from '../../store/hotPointStore'; // No longer needed here, TripForm handles it
import { mockRoutes, Route as AppRoute } from '../../utils/mockData'; // No longer needed here, TripForm handles it
import DashboardNavbar from './DashboardNavbar';
import Footer from '../common/Footer';
import { Calendar, Clock, MapPinIcon, Truck, Save, CheckSquare, Square } from 'lucide-react'; // Icons are in TripForm
import TripForm from '../trips/TripForm'; // Import the unified TripForm
import '../../index.css';

const CreateTripPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  // const { vehicles, fetchVehicles } = useVehicleStore(); // TripForm handles vehicle fetching
  const { addTrip } = useTripStore();
  // const { hotPoints, fetchHotPoints } = useHotPointStore(); // TripForm handles hot point fetching

  // Remove local form state and handleChange, as TripForm will manage this
  // const [formData, setFormData] = useState(...);
  // const [availableRoutes, setAvailableRoutes] = useState<AppRoute[]>(mockRoutes); // TripForm handles routes

  // useEffect for fetching data is now handled within TripForm
  // useEffect(() => { ... }, []);

  const handleCreateTripSubmit = (data: Trip | Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    // The 'data' from TripForm is already processed (e.g., fromLocation, toLocation derived from routeId)
    // It also includes driverId if the user is logged in.
    
    // Ensure data includes all necessary fields for addTrip, particularly driverId
    const tripDataForStore = {
        ...data,
        driverId: data.driverId || user?.id || '', // Ensure driverId is present
    } as Omit<Trip, 'id' | 'status' | 'createdAt' | 'updatedAt'>; // Cast to the type expected by addTrip

    addTrip(tripDataForStore);
    alert('Trip created successfully!');
    // Role-aware navigation
    if (user?.role === 'admin') {
      navigate('/admin/trips');
    } else if (user?.role === 'driver') {
      navigate('/driver/trips');
    } else {
      navigate('/'); // Fallback navigation
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <DashboardNavbar userRole={user?.role || ''} />
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Trip</h1>
        {/* Render the unified TripForm component */}
        {/* Pass isCreatePageContext={true} to indicate it's embedded */}
        {/* Pass the onSubmit handler */}
        {/* onClose is not strictly needed here as it's not a modal, but TripForm might expect it. 
            We can pass a dummy function or modify TripForm to not require it when isCreatePageContext is true.
            For now, let's assume TripForm handles onClose gracefully if not in modal mode or provide a no-op. */}
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <TripForm 
            isOpen={true} // Form is always 'open' in this context
            onClose={() => {}} // No-op for onClose as it's not a modal
            onSubmit={handleCreateTripSubmit}
            isCreatePageContext={true} // Key prop to tell TripForm it's embedded
            // tripToEdit will be undefined, so it's a create operation
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreateTripPage;
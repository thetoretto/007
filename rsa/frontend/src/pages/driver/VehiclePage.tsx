import React from 'react';
import VehicleManagement from '../../components/driver/VehicleManagement';
import Navbar from '../../components/common/Navbar'; // Assuming a Navbar for driver pages
import Footer from '../../components/common/Footer'; // Assuming a Footer
import DashboardNavbar from '../../components/dashboard/DashboardNavbar';
import useAuthStore from '../../store/authStore'; // Import useAuthStore

const VehiclePage: React.FC = () => { // Renamed component
  const { user } = useAuthStore(); // Get user from auth store
  // Determine userRole, default to 'driver' if not available or not admin
  const userRole = user?.role === 'admin' ? 'admin' : 'driver';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 "> {/* Added page wrapper */}
      <DashboardNavbar userRole={userRole} /> {/* Pass userRole to DashboardNavbar */}
      
      {/* Added main content container with padding and max-width */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full"> 
        {/* Optional: Add a page title if needed */}
        {/* <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Vehicles</h1> */}
        
        <VehicleManagement userRole={userRole} /> {/* Pass userRole to VehicleManagement */}
      </main>
      
       {/* Added Footer */}
    </div>
  );
};

export default VehiclePage; // Export renamed component
import React from 'react';
import VehicleManagement from '../../components/driver/VehicleManagement';
import Navbar from '../../components/common/Navbar'; // Assuming a Navbar for driver pages
import Footer from '../../components/common/Footer'; // Assuming a Footer
import  DashboardNavbar from '../../components/dashboard/DashboardNavbar';

const DriverVehiclePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50"> {/* Added page wrapper */}
      <DashboardNavbar/> {/* Added Navbar */}
      
      {/* Added main content container with padding and max-width */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full"> 
        {/* Optional: Add a page title if needed */}
        {/* <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Vehicles</h1> */}
        
        <VehicleManagement /> {/* The existing component */}
      </main>
      
      <Footer /> {/* Added Footer */}
    </div>
  );
};

export default DriverVehiclePage;
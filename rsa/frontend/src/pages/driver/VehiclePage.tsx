import React from 'react';
import VehicleManagement from '../../components/driver/VehicleManagement';
import DashboardNavbar from '../../components/dashboard/DashboardNavbar'; // Import the navbar

const VehiclePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Add the horizontal navigation bar */}
      <React.Suspense fallback={<div>Loading Navbar...</div>}>
        <DashboardNavbar userRole="driver" />
      </React.Suspense>

      <div className="py-8">
        <VehicleManagement />
      </div>
    </div>
  );
};

export default VehiclePage;
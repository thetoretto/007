import React from 'react';
import VehicleManagement from '../../components/driver/VehicleManagement';
import useAuthStore from '../../store/authStore';
import Navbar from '../../components/common/Navbar'; // Added Navbar import
import {
    UserRole
  } from '../../types';

const VehiclePage: React.FC = () => {
  const { user } = useAuthStore(); 
  // Determine userRole, default to 'driver' if not available or not admin/driver
  let userRoleForVehicle: "driver" | "admin" = 'driver';
  if (user?.role === 'admin') {
    userRoleForVehicle = 'admin';
  } else if (user?.role === 'driver') {
    userRoleForVehicle = 'driver';
  }
  // If user role is passenger or undefined, it defaults to 'driver' as per initial value.
  // This scenario should ideally be handled based on application logic, e.g. redirecting or showing an error.

  return (
    <div className="text-gray-900 dark:text-gray-50 transition-colors duration-300">
      <Navbar /> {/* Added Navbar component */}
      <main className="container-app py-8 md:py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">My Vehicle</h1>
        <VehicleManagement userRole={userRoleForVehicle} /> {/* Pass userRole to VehicleManagement */}
      </main>
    </div>
  );
};

export default VehiclePage;
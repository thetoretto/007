import React from 'react';
import Navbar from '../../components/common/Navbar';
import VehicleManagement from '../../components/driver/VehicleManagement';
import useAuthStore from '../../store/authStore';
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar /> {/* No need to pass userRole as the unified Navbar handles this internally */}
      <main className="container-app mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-16 md:pt-20">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">My Vehicle</h1>
        <VehicleManagement userRole={userRoleForVehicle} /> {/* Pass userRole to VehicleManagement */}
      </main>
    </div>
  );
};

export default VehiclePage;
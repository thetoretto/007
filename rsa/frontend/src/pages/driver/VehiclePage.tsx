import React, { useEffect } from 'react';
import VehicleManagement from '../../components/driver/VehicleManagement';
import useAuthStore from '../../store/authStore';
import {
    UserRole
  } from '../../types';

const VehiclePage: React.FC = () => {
  const { user } = useAuthStore();

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    <div className="bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary transition-colors duration-300">
      <main className="container-app py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl font-bold text-text-light-primary dark:text-text-dark-primary transition-colors duration-300 mb-8">My Vehicle</h1>
        <VehicleManagement userRole={userRoleForVehicle} /> {/* Pass userRole to VehicleManagement */}
      </main>
    </div>
  );
};

export default VehiclePage;
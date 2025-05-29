import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockTimeSlots, mockVehicles, mockRoutes, getBookingsWithDetails, mockUsers } from '../../utils/mockData';
import TripActivityLog, { LogTripActivity, LogTripStatus } from '../common/TripActivityLog';
import Navbar from '../common/Navbar';
import { Route as RouteType, Vehicle as VehicleType, User as UserType, Booking as BookingType } from '../../types';

const TripManagement: React.FC = () => {
  const { user } = useAuthStore();

  const logActivities: LogTripActivity[] = React.useMemo(() => {
    return mockTimeSlots.map((ts: any) => {
      const vehicle = mockVehicles.find(v => v.id === ts.vehicleId);
      const route = mockRoutes.find(r => r.id === ts.routeId);
      const driverUser = mockUsers.find(u => u.id === ts.driverId);
      const bookingsForSlot = getBookingsWithDetails().filter(b => b.timeSlot?.id === ts.id);

      let status: LogTripStatus = 'scheduled'; 
      if (ts.status && typeof ts.status === 'string') {
        const tsStatus = ts.status.toLowerCase();
        if (['completed', 'in-progress', 'cancelled', 'scheduled', 'delayed'].includes(tsStatus)) {
          status = tsStatus as LogTripStatus;
        }
      }
      
      const passengersCount = bookingsForSlot.reduce((acc, b) => acc + (b.seats?.length || 1), 0);

      let paymentMethod = 'N/A';
      if (bookingsForSlot.length > 0) {
        const firstBooking = bookingsForSlot[0];
        if ((firstBooking as any).paymentDetails?.method) {
            paymentMethod = (firstBooking as any).paymentDetails.method;
        } else if (firstBooking.passenger?.paymentMethods && firstBooking.passenger.paymentMethods.length > 0) {
            paymentMethod = firstBooking.passenger.paymentMethods[0].type;
        }
      }

      const isValidStartTime = ts.startTime && typeof ts.startTime === 'string' && ts.startTime.trim() !== '';
      const startDate = isValidStartTime ? new Date(ts.startTime) : new Date(); // Fallback to current date if startTime is invalid

      // Ensure date is valid before calling toISOString or toLocaleTimeString
      let dateString = 'N/A';
      let timeString = 'N/A';

      if (!isNaN(startDate.getTime())) { // Check if startDate is a valid date
        dateString = startDate.toISOString().split('T')[0];
        timeString = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      const isValidEndTime = ts.endTime && typeof ts.endTime === 'string' && ts.endTime.trim() !== '';
      const endDate = isValidEndTime ? new Date(ts.endTime) : null;
      let estimatedArrivalTimeString;
      if (endDate && !isNaN(endDate.getTime())){
        estimatedArrivalTimeString = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      return {
        id: ts.id || `trip-${Math.random().toString(36).substr(2, 9)}`,
        fromLocation: route?.origin.name || 'Unknown Origin',
        toLocation: route?.destination.name || 'Unknown Destination',
        date: dateString,
        time: timeString,
        price: ts.pricePerSeat || 50, 
        status: status,
        passengers: passengersCount,
        driver: driverUser ? {
          name: `${driverUser.firstName} ${driverUser.lastName}`,
          rating: (driverUser as any).rating || 4.5,
          vehicleInfo: vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})` : 'N/A',
        } : undefined,
        lastUpdated: new Date().toISOString(), 
        estimatedArrival: estimatedArrivalTimeString,
        paymentMethod: paymentMethod, 
        notes: ts.notes || (status === 'delayed' ? 'Traffic congestion reported.' : undefined),
        progressPercentage: status === 'in-progress' ? Math.floor(Math.random() * 80) + 10 : (status === 'completed' ? 100 : 0),
      };
    });
  }, []); 

  const filteredLogActivities = React.useMemo(() => {
    if (user?.role === 'admin') {
      return logActivities;
    } else if (user?.role === 'driver' && user.id) {
      return logActivities.filter(activity => {
        const originalTimeSlot = mockTimeSlots.find(ts => ts.id === activity.id);
        return (originalTimeSlot as any)?.driverId === user.id;
      });
    }
    return [];
  }, [logActivities, user]);

  const newTripRoute = user?.role === 'admin' ? '/admin/trips/new' : '/driver/trips/new';

  return (
    <div className="min-h-screen bg-base-200 dark:bg-base-300">
      <Navbar />
      <main className="container-app mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-16 md:pt-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-base dark:text-text-inverse">Trip Management</h1>
            <p className="mt-1 text-sm text-text-muted dark:text-text-muted-dark">
              {user?.role === 'admin' ? 'Oversee and manage all scheduled trips and activities.' : 'View and manage your assigned trips and activities.'}
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link to={newTripRoute} className="btn btn-primary flex items-center gap-2">
              <Plus className="h-5 w-5" />
              New Trip
            </Link>
          </div>
        </div>

        <TripActivityLog activities={filteredLogActivities} />
      </main>
    </div>
  );
};

export default TripManagement;
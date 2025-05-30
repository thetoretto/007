import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useTripStore, { Trip } from '../../store/tripStore';
import { useBookingStore } from '../../store/bookingStore';
import { BookingStatus } from '../../store/bookingStore';
import { mockUsers, mockRoutes as allMockRoutes, mockVehicles } from '../../utils/mockData';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, Calendar, TrendingUp, Settings, User, Map, Activity, Plus, Edit, Trash2, Clock, Filter, Star, MapPin, Navigation, ArrowRight, LayoutDashboard } from 'lucide-react'; // Added LayoutDashboard
import TripForm from '../../components/trips/TripForm';
import '../../index.css';
import Navbar from '../../components/common/Navbar'; // Ensured Navbar import

// Enhanced mock data generation for Admin Dashboard
const generateAdminMockData = (period: 'daily' | 'weekly' | 'monthly' | 'yearly', allTrips: Trip[]) => {
  const now = new Date();

  const filterTripsByTimePeriod = (tripsToFilter: Trip[], currentPeriod: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    return tripsToFilter.filter(trip => {
      const tripDate = new Date(trip.date);
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentDate = now.getDate();
      const currentDay = now.getDay(); // 0 (Sun) - 6 (Sat)

      if (currentPeriod === 'daily') {
        return tripDate.getFullYear() === currentYear && tripDate.getMonth() === currentMonth && tripDate.getDate() === currentDate;
      }
      if (currentPeriod === 'weekly') {
        const firstDayOfWeek = new Date(now);
        firstDayOfWeek.setDate(currentDate - currentDay + (currentDay === 0 ? -6 : 1)); // Adjust to Monday as start of week
        firstDayOfWeek.setHours(0, 0, 0, 0);
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
        lastDayOfWeek.setHours(23, 59, 59, 999);
        return tripDate >= firstDayOfWeek && tripDate <= lastDayOfWeek;
      }
      if (currentPeriod === 'monthly') {
        return tripDate.getFullYear() === currentYear && tripDate.getMonth() === currentMonth;
      }
      if (currentPeriod === 'yearly') {
        return tripDate.getFullYear() === currentYear;
      }
      return true;
    });
  };

  const tripsForPeriod = filterTripsByTimePeriod(allTrips, period);

  // Simulate passenger count: assume each completed trip has 10-20 passengers
  const totalPassengers = tripsForPeriod
    .filter(t => t.status === 'completed')
    .reduce((sum) => sum + (Math.floor(Math.random() * 11) + 10), 0);

  // Mock best performing drivers (needs more sophisticated logic with actual driver data)
  const mockDriversData = [
    { id: 'd1', name: 'Alice Wonderland', completedTrips: 0, rating: 4.9, avatar: 'https://ui-avatars.com/api/?name=Alice+Wonderland&background=random' },
    { id: 'd2', name: 'Bob The Builder', completedTrips: 0, rating: 4.7, avatar: 'https://ui-avatars.com/api/?name=Bob+Builder&background=random' },
    { id: 'd3', name: 'Charlie Chaplin', completedTrips: 0, rating: 4.6, avatar: 'https://ui-avatars.com/api/?name=Charlie+Chaplin&background=random' },
    { id: 'd4', name: 'Diana Prince', completedTrips: 0, rating: 4.8, avatar: 'https://ui-avatars.com/api/?name=Diana+Prince&background=random' },
  ];

  tripsForPeriod.forEach(trip => {
    if (trip.status === 'completed' && trip.driverId) {
      const driver = mockDriversData.find(d => d.id === trip.driverId); // This won't work well without actual driver IDs in trips
      // For demo, assign randomly
      const randomDriverIndex = Math.floor(Math.random() * mockDriversData.length);
      mockDriversData[randomDriverIndex].completedTrips++;
    }
  });

  const bestPerformingDrivers = [...mockDriversData]
    .sort((a, b) => b.completedTrips - a.completedTrips || b.rating - a.rating)
    .slice(0, 3);

  // Mock active routes
  const routeFrequency: { [key: string]: { name: string, count: number, origin: string, destination: string } } = {};
  tripsForPeriod.forEach(trip => {
    const fromLocation = trip.fromLocation || '';
    const toLocation = trip.toLocation || '';
    const routeKey = `${fromLocation}-${toLocation}`;
    if (!routeFrequency[routeKey]) {
      routeFrequency[routeKey] = { 
        name: `${fromLocation} to ${toLocation}`, 
        count: 0, 
        origin: fromLocation, 
        destination: toLocation 
      };
    }
    routeFrequency[routeKey].count++;
  });
  const activeRoutes = Object.values(routeFrequency)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalTrips: tripsForPeriod.length,
    totalPassengers,
    bestPerformingDrivers,
    activeRoutes,
  };
};

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { trips, fetchTrips: fetchTripStoreTrips, removeTrip, updateTrip, addTrip } = useTripStore();

  // Log the booking store instance to check its contents
  const bookingStoreInstance = useBookingStore();
  console.log('AdminDashboard: bookingStoreInstance:', bookingStoreInstance);
  const { bookings, fetchAllBookings } = bookingStoreInstance;
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [tripToEdit, setTripToEdit] = useState<Trip | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [timePeriod, setTimePeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [adminData, setAdminData] = useState(generateAdminMockData(timePeriod, trips));

  useEffect(() => {
    fetchTripStoreTrips();
    fetchAllBookings();
  }, [fetchTripStoreTrips, fetchAllBookings]);

  useEffect(() => {
    setAdminData(generateAdminMockData(timePeriod, trips));
  }, [timePeriod, trips]);

  const openEditModal = (trip: Trip) => {
    setTripToEdit(trip);
    setIsTripModalOpen(true);
  };

  const handleDeleteTrip = (tripId: string) => {
    if (window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      removeTrip(tripId);
      alert(`Trip ${tripId} deleted (simulated).`);
      setSelectedTrip(null);
    }
  };

  // Calculate upcoming trips count from the store
  const upcomingTripsCount = trips.filter(trip => {
    const tripDateTime = new Date(`${trip.date}T${trip.time}`);
    const now = new Date();
    return trip.status === 'upcoming' && tripDateTime >= now;
  }).length;

  // Augment trips with booking details for admin view
  const detailedTrips = useMemo(() => {
    return trips.map(trip => {
      const relevantBookings = bookings.filter((b: any) => b.tripId === trip.id);
      const confirmedBookingsCount = relevantBookings.filter(
        (b: any) => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.CHECKED_IN
      ).length;
      const checkedInCount = relevantBookings.filter((b: any) => b.status === BookingStatus.CHECKED_IN).length;
      return {
        ...trip,
        confirmedBookings: confirmedBookingsCount,
        checkedInCount: checkedInCount,
        totalBookingsForTrip: relevantBookings.length,
      };
    });
  }, [trips, bookings]);

  // Filter and sort trips for display (e.g., all trips sorted by date)
  const sortedTrips = [...detailedTrips].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateB.getTime() - dateA.getTime();
  });

  const handleTripFormSubmit = async (tripData: any) => {
    if ('id' in tripData) {
      await updateTrip(tripData.id, tripData);
    } else {
      await addTrip(tripData as any);
    }
    fetchTripStoreTrips();
    setIsTripModalOpen(false);
  };

  return (
    <div className="text-gray-900 dark:text-gray-50 transition-colors duration-300">
      <Navbar />
      <main className="container-app py-8 md:py-12"> {/* Adjusted padding and removed pt-navbar comment */} 
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300 flex items-center">
                <LayoutDashboard className="h-7 w-7 mr-2 text-primary-600 dark:text-primary-400 transition-colors duration-300" />
                Admin Dashboard
            </h1>
            {/* Add any top-level actions or filters here if needed */}
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors duration-300">Total Trips</p>
              <div className="icon-badge icon-badge-md icon-badge-primary">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">{adminData.totalTrips}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize transition-colors duration-300">For {timePeriod} Period</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors duration-300">Total Passengers</p>
              <div className="icon-badge icon-badge-md bg-secondary-100 text-secondary-600 dark:bg-secondary-900 dark:text-secondary-400">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">{adminData.totalPassengers}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize transition-colors duration-300">For {timePeriod} Period</p>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors duration-300">Upcoming Trips</p>
              <div className="icon-badge icon-badge-md bg-info-light text-info dark:bg-info-dark dark:text-info-light">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">{upcomingTripsCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">Scheduled for the future</p>
        </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors duration-300">Total Routes</p>
              <div className="icon-badge icon-badge-md bg-accent-gold-light text-accent-gold-dark dark:bg-accent-gold-darker dark:text-accent-gold-light">
                <Map className="h-5 w-5" />
              </div>
          </div>
            <p className="text-3xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">{adminData.activeRoutes.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">Active in this period</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Best Performing Drivers */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white transition-colors duration-300 flex items-center">
              <User className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400 transition-colors duration-300" />
              Top Drivers
            </h2>
          {adminData.bestPerformingDrivers.length > 0 ? (
            <ul className="space-y-4">
              {adminData.bestPerformingDrivers.map((driver, index) => (
                  <li key={driver.id} className="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="relative flex-shrink-0">
                      <img 
                        src={driver.avatar || `https://ui-avatars.com/api/?name=${driver.name.replace(' ', '+')}&background=random`} 
                        alt={driver.name} 
                        className="h-10 w-10 rounded-full object-cover border-2 border-primary-200 dark:border-primary-700 transition-colors duration-300"
                      />
                      {index < 3 && (
                        <div className={`absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white
                          ${index === 0 ? 'bg-accent-gold-medium' : index === 1 ? 'bg-gray-400' : 'bg-earth-clay'}`}>
                          {index + 1}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{driver.name}</p>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                      <Star className="h-4 w-4 text-accent-gold mr-1 transition-colors duration-300" /> {driver.rating.toFixed(1)}
                      <span className="mx-1.5 text-gray-400 dark:text-gray-500 transition-colors duration-300">•</span>
                      {driver.completedTrips} trips
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
              <div className="text-center py-8 bg-gray-100 dark:bg-gray-700 rounded-lg transition-colors duration-300">
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">No driver data for this period</p>
              </div>
          )}
            
            <Link to="/admin/drivers" className="mt-6 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center justify-end transition-colors duration-300">
              View all drivers <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
        </div>

        {/* Active Routes */}
          <div className="lg:col-span-2 card p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white transition-colors duration-300 flex items-center">
              <Map className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400 transition-colors duration-300" />
              Most Active Routes
            </h2>
          {adminData.activeRoutes.length > 0 ? (
            <div className="space-y-3">
              {adminData.activeRoutes.map(route => (
                  <div key={route.name} className="p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300 truncate max-w-[70%]">{route.name}</p>
                      <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 transition-colors duration-300 whitespace-nowrap">{route.count} trips</span>
                  </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 flex items-center transition-colors duration-300">
                      <MapPin size={12} className="inline mr-1 text-primary-500 dark:text-primary-400 transition-colors duration-300"/> {route.origin} 
                      <ArrowRight size={12} className="inline mx-2 text-gray-400 dark:text-gray-500 transition-colors duration-300"/> 
                      <MapPin size={12} className="inline mr-1 text-primary-500 dark:text-primary-400 transition-colors duration-300"/> {route.destination}
                  </div>
                </div>
              ))}
            </div>
          ) : (
              <div className="text-center py-8 bg-gray-100 dark:bg-gray-700 rounded-lg transition-colors duration-300">
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">No route data for this period</p>
              </div>
            )}
            
            <Link to="/admin/routes" className="mt-6 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center justify-end transition-colors duration-300">
              Manage routes <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>

        {/* Recent Trips List */}
        <div className="card overflow-hidden mb-12">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400 transition-colors duration-300" />
              Manage Trips
            </h2>
            <div className="flex items-center">
              <button 
                onClick={() => {
                  setTripToEdit(null);
                  setIsTripModalOpen(true);
                }}
                className="btn btn-primary btn-sm mr-4 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> New Trip
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                Showing {sortedTrips.slice(0,5).length} of {sortedTrips.length} trips
              </span>
        </div>
      </div>

          <div className="overflow-x-auto">
          {sortedTrips.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
                <thead className="bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Route</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Date & Time</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Onboarding</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Driver</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Vehicle</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
                {sortedTrips.slice(0, 10).map((trip) => (
                    <tr 
                      key={trip.id} 
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${selectedTrip?.id === trip.id ? 'bg-primary-50 dark:bg-gray-700' : ''}`} 
                      onClick={() => setSelectedTrip(trip.id === selectedTrip?.id ? null : trip)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">{trip.fromLocation} to {trip.toLocation}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">{trip.date} at {trip.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${
                          trip.status === 'completed' ? 'badge-success' :
                          trip.status === 'active' ? 'badge-info' :
                          trip.status === 'scheduled' ? 'badge-warning' :
                          trip.status === 'pending_approval' ? 'badge-warning' :
                          trip.status === 'cancelled' ? 'badge-error' :
                          'badge-gray'}`}>
                        {trip.status.charAt(0).toUpperCase() + trip.status.slice(1).replace('_', ' ')}
                      </span>
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1 text-primary-600 dark:text-primary-400 transition-colors duration-300" />
                      {`${trip.checkedInCount || 0} / ${trip.confirmedBookings || 0} (${trip.totalBookingsForTrip || 0} total)`}
                        </div>
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">{trip.driverId || 'Not assigned'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">{mockVehicles.find(v => v.id === trip.vehicleId)?.model || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); openEditModal(trip); }} 
                            className="btn btn-ghost btn-sm text-primary-600 dark:text-primary-400 p-1"
                          >
                            <Edit size={16}/>
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteTrip(trip.id); }} 
                            className="btn btn-ghost btn-sm text-error dark:text-error-light p-1"
                          >
                            <Trash2 size={16}/>
                          </button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 bg-gray-100 dark:bg-gray-700 rounded-lg transition-colors duration-300">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">No trips found</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">Create the first trip using the button above.</p>
                <button
                  onClick={() => {
                    setTripToEdit(null);
                    setIsTripModalOpen(true);
                  }}
                  className="mt-4 btn btn-primary inline-flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Create Trip
                </button>
            </div>
          )}
      </div>

          {sortedTrips.length > 10 && (
            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300 flex justify-center">
              <Link to="/admin/trips" className="btn btn-ghost btn-sm text-primary-600 dark:text-primary-400 flex items-center gap-2 transition-colors duration-300">
                View all trips <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
      </div>

        {/* Trip Form Modal */}
      <TripForm
        isOpen={isTripModalOpen}
        onClose={() => setIsTripModalOpen(false)}
          onSubmit={handleTripFormSubmit}
        tripToEdit={tripToEdit}
      />
      </main>
    </div>
  );
};

export default AdminDashboard;
import React, { useState, useEffect, useMemo } from 'react'; // Added useMemo
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useTripStore, { Trip } from '../../store/tripStore'; // Import trip store and Trip type
import { mockUsers, mockRoutes as allMockRoutes, mockVehicles } from '../../utils/mockData'; // Using more specific mock data
import {  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, Calendar, TrendingUp, Settings, User, Map, Activity, Plus, Edit, Trash2, Clock, Filter, Star, MapMarker } from 'lucide-react'; // Added MapMarker for Hotpoints, removed CreditCard, MapPin, Navigation
import TripForm from '../../components/trips/TripForm'; // Import TripForm
import '../../index.css';

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
    { id: 'd1', name: 'Alice Wonderland', completedTrips: 0, rating: 4.9, avatar: mockUsers[0]?.avatar },
    { id: 'd2', name: 'Bob The Builder', completedTrips: 0, rating: 4.7, avatar: mockUsers[1]?.avatar },
    { id: 'd3', name: 'Charlie Chaplin', completedTrips: 0, rating: 4.6, avatar: mockUsers[2]?.avatar },
    { id: 'd4', name: 'Diana Prince', completedTrips: 0, rating: 4.8, avatar: mockUsers[3]?.avatar },
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
    const routeKey = `${trip.fromLocation}-${trip.toLocation}`;
    if (!routeFrequency[routeKey]) {
      routeFrequency[routeKey] = { name: `${trip.fromLocation} to ${trip.toLocation}`, count: 0, origin: trip.fromLocation, destination: trip.toLocation };
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
    // Removed driverOriginData, destinationData, simulatedPayments
  };
};

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']; // Removed as Pie charts are moved

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { trips, fetchTrips, removeTrip, addTrip, updateTrip } = useTripStore(); // Use trip store, added add/update
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [tripToEdit, setTripToEdit] = useState<Trip | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null); // For displaying details
  const [timePeriod, setTimePeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [adminData, setAdminData] = useState(generateAdminMockData(timePeriod, trips));

  // Import the DashboardNavbar component
  const DashboardNavbar = React.lazy(() => import('../../components/dashboard/DashboardNavbar'));

  useEffect(() => {
    fetchTrips(); // Fetch trips on component mount
  }, [fetchTrips]);

  useEffect(() => {
    setAdminData(generateAdminMockData(timePeriod, trips));
  }, [timePeriod, trips]);

  const openCreateModal = () => {
    setTripToEdit(null);
    setIsTripModalOpen(true);
  };

  const openEditModal = (trip: Trip) => {
    setTripToEdit(trip);
    setIsTripModalOpen(true);
  };

  const handleDeleteTrip = (tripId: string) => {
    if (window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      removeTrip(tripId);
      alert(`Trip ${tripId} deleted (simulated).`);
      setSelectedTrip(null); // Close details view if open
    }
  };

  // Calculate upcoming trips count from the store
  const upcomingTripsCount = trips.filter(trip => {
    const tripDateTime = new Date(`${trip.date}T${trip.time}`);
    const now = new Date();
    return trip.status === 'upcoming' && tripDateTime >= now;
  }).length;

  // Filter and sort trips for display (e.g., all trips sorted by date)
  const sortedTrips = [...trips].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateB.getTime() - dateA.getTime(); // Sort descending (newest first)
  });

  const handleTripFormSubmit = async (tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'> | Trip) => {
    if ('id' in tripData) {
      await updateTrip(tripData.id, tripData);
    } else {
      await addTrip(tripData);
    }
    fetchTrips(); // Re-fetch to update list
    setIsTripModalOpen(false);
  };

  return (
    <div className="container-app py-8">
      {/* Add the horizontal navigation bar */}
      <React.Suspense fallback={<div>Loading...</div>}>
        <DashboardNavbar userRole="admin" />
      </React.Suspense>

      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            {user && `Welcome back, ${user.firstName} ${user.lastName}`}
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3 items-center">
          <button onClick={openCreateModal} className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            New Trip
          </button>
          {/* <Link to="/admin/reports" className="btn btn-secondary">
            <Activity className="h-4 w-4 mr-2" />
            Generate Reports
          </Link> */}
          <div className="flex items-center space-x-1">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly')}
              className="select select-bordered select-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards - Updated */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Total Trips</p>
            <Calendar className="h-6 w-6 text-primary-500" />
          </div>
          <p className="text-3xl font-semibold text-gray-900">{adminData.totalTrips}</p>
          <p className="text-xs text-gray-400 capitalize">For {timePeriod} Period</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Total Passengers</p>
            <Users className="h-6 w-6 text-green-500" />
          </div>
          <p className="text-3xl font-semibold text-gray-900">{adminData.totalPassengers}</p>
          <p className="text-xs text-gray-400 capitalize">For {timePeriod} Period</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Best Performing Drivers */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Drivers</h2>
          {adminData.bestPerformingDrivers.length > 0 ? (
            <ul className="space-y-4">
              {adminData.bestPerformingDrivers.map((driver, index) => (
                <li key={driver.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                  <img src={driver.avatar || `https://ui-avatars.com/api/?name=${driver.name.replace(' ', '+')}&background=random`} alt={driver.name} className="h-10 w-10 rounded-full object-cover"/>
                  <div>
                    <p className="font-medium text-gray-700 text-sm">{driver.name}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Star className="h-3 w-3 text-yellow-400 mr-1" /> {driver.rating.toFixed(1)}
                      <span className="mx-1.5">•</span>
                      {driver.completedTrips} trips
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No driver performance data for this period.</p>
          )}
        </div>

        {/* Active Routes */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Most Active Routes</h2>
          {adminData.activeRoutes.length > 0 ? (
            <div className="space-y-3">
              {adminData.activeRoutes.map(route => (
                <div key={route.name} className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-700 text-sm truncate max-w-[70%]">{route.name}</p>
                    <span className="text-sm font-semibold text-indigo-600 whitespace-nowrap">{route.count} trips</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    <Navigation size={12} className="inline mr-1"/> {route.origin} <TrendingUp size={12} className="inline mx-1"/> {route.destination}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No active route data for this period.</p>
          )}
        </div>
      </div>



      {/* Recent Trips List - (Existing, can be kept or modified) */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Manage Trips</h2>
          <span className="text-sm text-gray-500">Displaying {sortedTrips.slice(0,5).length} of {sortedTrips.length} trips</span>
        </div>
        <div className="overflow-x-auto">
          {sortedTrips.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedTrips.slice(0, 10).map((trip) => (
                  <tr key={trip.id} className={`hover:bg-gray-50 ${selectedTrip?.id === trip.id ? 'bg-primary-50' : ''}`} onClick={() => setSelectedTrip(trip.id === selectedTrip?.id ? null : trip)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{trip.fromLocation} to {trip.toLocation}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trip.date} at {trip.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${trip.status === 'completed' ? 'bg-green-100 text-green-800' : trip.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : trip.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                        {trip.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trip.driverId || 'N/A'}</td>{/* Replace with driver name later */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mockVehicles.find(v => v.id === trip.vehicleId)?.model || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button onClick={(e) => { e.stopPropagation(); openEditModal(trip); }} className="text-primary-600 hover:text-primary-900"><Edit size={16}/></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteTrip(trip.id); }} className="text-red-600 hover:text-red-900"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No trips found</h3>
              <p className="mt-1 text-sm text-gray-500">Create the first trip using the button above.</p>
            </div>
          )}
        </div>
      </div>

      {/* Simulated Payment Method Overview */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Simulated Payment Overview ({timePeriod})</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
                <p className="text-2xl font-bold text-blue-600">{adminData?.simulatedPayments?.totalTransactions}</p>
                <p className="text-sm text-gray-500">Total Transactions</p>
            </div>
            <div>
                <p className="text-2xl font-bold text-green-600">${adminData?.simulatedPayments?.totalValue}</p>
                <p className="text-sm text-gray-500">Total Value</p>
            </div>
            <div>
                <p className="text-2xl font-bold text-green-500">{adminData?.simulatedPayments?.successful}</p>
                <p className="text-sm text-gray-500">Successful</p>
            </div>
            <div>
                <p className="text-2xl font-bold text-red-500">{adminData?.simulatedPayments?.failed}</p>
                <p className="text-sm text-gray-500">Failed</p>
            </div>
        </div>
        <p className="text-xs text-gray-400 mt-4 text-center">This is a simulated overview of payment activities.</p>
      </div>

      {/* Trip Form Modal - Updated to use handleTripFormSubmit */}
      <TripForm
        isOpen={isTripModalOpen}
        onClose={() => setIsTripModalOpen(false)}
        onSubmit={handleTripFormSubmit} // Changed from onSave
        tripToEdit={tripToEdit}
      />
    </div>
  );
};

export default AdminDashboard;
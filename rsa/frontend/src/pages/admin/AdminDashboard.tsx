import React, { useState, useEffect } from 'react'; // Added useState, useEffect
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useTripStore, { Trip } from '../../store/tripStore'; // Import trip store and Trip type
import { mockDashboardStats, mockBookingStats, mockRoutePopularity } from '../../utils/mockData'; // Keep mock data for now
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, Calendar, TrendingUp, CreditCard, Settings, User, Map, Activity, Plus, Edit, Trash2, Clock } from 'lucide-react'; // Added Clock
import TripForm from '../../components/trips/TripForm'; // Import TripForm

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { trips, fetchTrips, removeTrip } = useTripStore(); // Use trip store
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [tripToEdit, setTripToEdit] = useState<Trip | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null); // For displaying details

  // Import the DashboardNavbar component
  const DashboardNavbar = React.lazy(() => import('../../components/dashboard/DashboardNavbar'));

  useEffect(() => {
    fetchTrips(); // Fetch trips on component mount
  }, [fetchTrips]);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          {/* Changed Generate Reports to Create New Trip */}
          <button onClick={openCreateModal} className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Create New Trip
          </button>
          <Link to="/admin/reports" className="btn btn-secondary">
            <Activity className="h-4 w-4 mr-2" />
            Generate Reports
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* ... (Total Users card) ... */}
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd>
                    {/* Keep mock data for now, replace with real data later */}
                    <div className="text-lg font-medium text-gray-900">{mockDashboardStats.totalUsers}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/users" className="font-medium text-primary-600 hover:text-primary-700">
                View all users
              </Link>
            </div>
          </div>
        </div>

        {/* ... (Active Drivers card) ... */}
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <User className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Drivers</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{mockDashboardStats.activeDrivers}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/drivers" className="font-medium text-primary-600 hover:text-primary-700">
                View all drivers
              </Link>
            </div>
          </div>
        </div>

        {/* Upcoming Trips Card - Updated */}
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Upcoming Trips</dt>
                  <dd>
                    {/* Use data from store */}
                    <div className="text-lg font-medium text-gray-900">{upcomingTripsCount}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/trips" className="font-medium text-primary-600 hover:text-primary-700">
                View all trips
              </Link>
            </div>
          </div>
        </div>

        {/* ... (Total Revenue card) ... */}
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <CreditCard className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">${mockDashboardStats.totalRevenue.toFixed(2)}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/finances" className="font-medium text-primary-600 hover:text-primary-700">
                View details
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Trip List Section - Added */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Recent Trips</h2>
          <Link to="/admin/trips" className="text-sm font-medium text-primary-600 hover:text-primary-700">
            View All
          </Link>
        </div>
        <div className="overflow-hidden">
          {sortedTrips.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {/* Displaying only the first 5 recent trips for brevity */}
              {sortedTrips.slice(0, 5).map((trip) => (
                <div
                  key={trip.id}
                  className={`hover:bg-gray-50 cursor-pointer p-4 sm:px-6 lg:px-8 transition-colors ${selectedTrip?.id === trip.id ? 'bg-primary-50' : ''}`}
                  onClick={() => setSelectedTrip(trip.id === selectedTrip?.id ? null : trip)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium text-gray-900">
                        {/* {trip.route?.name || 'Unknown Route'} */} {/* Removed route name */}
                        {trip.fromLocation} to {trip.toLocation} {/* Added from/to location */}
                      </h3>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{trip.date}</span>
                        <span className="mx-2">•</span>
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{trip.time}</span>
                        <span className="mx-2">•</span>
                        <span className={`capitalize badge badge-${trip.status === 'upcoming' ? 'info' : trip.status === 'completed' ? 'success' : 'secondary'} text-xs`}>{trip.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                       <button
                          onClick={(e) => { e.stopPropagation(); openEditModal(trip); }}
                          className="p-1 text-gray-400 hover:text-primary-600"
                          title="Edit Trip"
                       >
                          <Edit size={16} />
                       </button>
                       <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteTrip(trip.id); }}
                          className="p-1 text-gray-400 hover:text-danger-600"
                          title="Delete Trip"
                       >
                          <Trash2 size={16} />
                       </button>
                    </div>
                  </div>
                  {/* Optional: Add expandable details like in DriverDashboard if needed */}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No trips found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Create the first trip using the button above.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Charts Section - Kept as is for now */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Booking Trends</h2>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Last 15 days</span>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockBookingStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => value.split('-')[2]}
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} width={30} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Popular Routes</h2>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">By booking percentage</span>
              <Map className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockRoutePopularity} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis
                  dataKey="routeName"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  width={150}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Bar dataKey="percentage" fill="#3b82f6" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Trip Form Modal */}
      <TripForm
        isOpen={isTripModalOpen}
        onClose={() => setIsTripModalOpen(false)}
        tripToEdit={tripToEdit}
      />
    </div>
  );
};

export default AdminDashboard;
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useTripStore, { Trip } from '../../store/tripStore';
import { useBookingStore } from '../../store/bookingStore';
import { BookingStatus } from '../../store/bookingStore';
import { mockUsers, mockRoutes as allMockRoutes, mockVehicles } from '../../utils/mockData';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, Calendar, TrendingUp, Settings, User, Map, Activity, Plus, Edit, Trash2, Clock, Filter, Star, MapPin, Navigation, ArrowRight, LayoutDashboard } from 'lucide-react';
import TripForm from '../../components/trips/TripForm';
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

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    <div className="driver-dashboard">
      {/* Modern Header */}
      <header className="driver-header mb-8">
        <div className="container-app">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="icon-badge icon-badge-lg bg-primary text-on-primary">
                  <LayoutDashboard className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-light-primary dark:text-dark-primary">
                    Admin Dashboard
                  </h1>
                  <p className="text-sm text-light-secondary dark:text-dark-secondary">
                    {user && `Welcome back, ${user.firstName} ${user.lastName}`}
                  </p>
                </div>
              </div>
              <div className="driver-status-badge online">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                System Online & Active
              </div>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <button
                onClick={() => {
                  setTripToEdit(null);
                  setIsTripModalOpen(true);
                }}
                className="btn btn-primary flex items-center gap-2 px-4 py-3 shadow-primary"
              >
                <Plus className="h-5 w-5" />
                New Trip
              </button>
              <Link
                to="/admin/routes"
                className="btn btn-secondary flex items-center gap-2 px-4 py-3 shadow-secondary"
              >
                <Map className="h-5 w-5" />
                Manage Routes
              </Link>
              <Link
                to="/admin/settings"
                className="btn btn-ghost flex items-center gap-2 px-4 py-3"
                title="Admin Settings"
              >
                <Settings className="h-5 w-5" />
                Settings
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-app py-8">
        {/* Key Metrics Section */}
        <section className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="driver-metric-card">
              <div className="flex items-center justify-between mb-3">
                <div className="driver-metric-label">Total Trips</div>
                <div className="icon-badge icon-badge-md bg-primary-light text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>
              <div className="driver-metric-value">{adminData.totalTrips}</div>
              <div className="driver-metric-change positive">
                <ArrowRight className="h-3 w-3 rotate-[-45deg]" />
                For {timePeriod} period
              </div>
            </div>

            <div className="driver-metric-card">
              <div className="flex items-center justify-between mb-3">
                <div className="driver-metric-label">Total Passengers</div>
                <div className="icon-badge icon-badge-md bg-secondary-light text-secondary">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="driver-metric-value">{adminData.totalPassengers}</div>
              <div className="driver-metric-change positive">
                <ArrowRight className="h-3 w-3 rotate-[-45deg]" />
                For {timePeriod} period
              </div>
            </div>

            <div className="driver-metric-card">
              <div className="flex items-center justify-between mb-3">
                <div className="driver-metric-label">Upcoming Trips</div>
                <div className="icon-badge icon-badge-md bg-primary-light text-primary">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
              <div className="driver-metric-value">{upcomingTripsCount}</div>
              <div className="driver-metric-change positive">
                <ArrowRight className="h-3 w-3 rotate-[-45deg]" />
                Scheduled ahead
              </div>
            </div>

            <div className="driver-metric-card">
              <div className="flex items-center justify-between mb-3">
                <div className="driver-metric-label">Active Routes</div>
                <div className="icon-badge icon-badge-md bg-secondary-light text-secondary">
                  <Map className="h-5 w-5" />
                </div>
              </div>
              <div className="driver-metric-value">{adminData.activeRoutes.length}</div>
              <div className="driver-metric-change positive">
                <ArrowRight className="h-3 w-3 rotate-[-45deg]" />
                In this period
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Best Performing Drivers */}
          <div className="driver-metric-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="icon-badge icon-badge-md bg-primary-light text-primary">
                <User className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-light-primary dark:text-dark-primary">
                Top Drivers
              </h2>
            </div>
            {adminData.bestPerformingDrivers.length > 0 ? (
              <div className="space-y-3">
                {adminData.bestPerformingDrivers.map((driver, index) => (
                  <div key={driver.id} className="driver-trip-card group">
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <img
                          src={driver.avatar || `https://ui-avatars.com/api/?name=${driver.name.replace(' ', '+')}&background=random`}
                          alt={driver.name}
                          className="h-10 w-10 rounded-full object-cover border-2 border-primary-light"
                        />
                        {index < 3 && (
                          <div className={`absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white
                            ${index === 0 ? 'bg-secondary' : index === 1 ? 'bg-primary' : 'bg-accent'}`}>
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-light-primary dark:text-dark-primary">{driver.name}</p>
                        <div className="flex items-center text-sm text-light-secondary dark:text-dark-secondary">
                          <div className="driver-status-badge online mr-2">
                            <Star className="h-3 w-3" /> {driver.rating.toFixed(1)}
                          </div>
                          {driver.completedTrips} trips
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-light dark:bg-dark rounded-lg">
                <p className="text-light-secondary dark:text-dark-secondary">No driver data for this period</p>
              </div>
            )}

            <Link to="/admin/users" className="mt-4 btn btn-ghost btn-sm flex items-center gap-2 justify-center">
              View all drivers <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Active Routes */}
          <div className="lg:col-span-2 driver-metric-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="icon-badge icon-badge-md bg-secondary-light text-secondary">
                <Map className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-light-primary dark:text-dark-primary">
                Most Active Routes
              </h2>
            </div>
            {adminData.activeRoutes.length > 0 ? (
              <div className="space-y-3">
                {adminData.activeRoutes.map(route => (
                  <div key={route.name} className="driver-trip-card group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-light-primary dark:text-dark-primary mb-1 truncate">
                          {route.name}
                        </h3>
                        <div className="driver-status-badge online">
                          {route.count} trips
                        </div>
                      </div>
                      <div className="icon-badge icon-badge-sm bg-primary-light text-primary">
                        <Navigation className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="text-xs text-light-secondary dark:text-dark-secondary flex items-center">
                      <MapPin size={12} className="inline mr-1 text-primary"/> {route.origin}
                      <ArrowRight size={12} className="inline mx-2 text-light-tertiary dark:text-dark-tertiary"/>
                      <MapPin size={12} className="inline mr-1 text-primary"/> {route.destination}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-light dark:bg-dark rounded-lg">
                <p className="text-light-secondary dark:text-dark-secondary">No route data for this period</p>
              </div>
            )}

            <Link to="/admin/routes" className="mt-4 btn btn-ghost btn-sm flex items-center gap-2 justify-center">
              Manage routes <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Recent Trips List */}
        <section className="mb-8">
          <div className="driver-metric-card overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="icon-badge icon-badge-md bg-primary-light text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold text-light-primary dark:text-dark-primary">
                  Manage Trips
                </h2>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-light-secondary dark:text-dark-secondary">
                  Showing {sortedTrips.slice(0,10).length} of {sortedTrips.length} trips
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {sortedTrips.length > 0 ? (
                sortedTrips.slice(0, 10).map((trip) => (
                  <div
                    key={trip.id}
                    className={`driver-trip-card group cursor-pointer ${selectedTrip?.id === trip.id ? 'selected' : ''}`}
                    onClick={() => setSelectedTrip(trip.id === selectedTrip?.id ? null : trip)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-light-primary dark:text-dark-primary mb-1">
                          {trip.fromLocation} → {trip.toLocation}
                        </h3>
                        <div className={`driver-status-badge ${
                          trip.status === 'completed' ? 'online' :
                          trip.status === 'active' ? 'busy' :
                          'offline'
                        }`}>
                          {trip.status.replace('_', ' ')}
                        </div>
                      </div>
                      <div className="icon-badge icon-badge-sm bg-primary-light text-primary">
                        <Navigation className="h-4 w-4" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-light-secondary dark:text-dark-secondary mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {trip.date} at {trip.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {`${trip.checkedInCount || 0}/${trip.confirmedBookings || 0} passengers`}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-light-tertiary dark:text-dark-tertiary">
                        Driver: {trip.driverId || 'Not assigned'} • Vehicle: {mockVehicles.find(v => v.id === trip.vehicleId)?.model || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); openEditModal(trip); }}
                          className="btn btn-ghost btn-sm text-primary p-1"
                        >
                          <Edit size={14}/>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteTrip(trip.id); }}
                          className="btn btn-ghost btn-sm text-accent p-1"
                        >
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-light dark:bg-dark rounded-lg">
                  <Calendar className="mx-auto h-12 w-12 text-light-tertiary dark:text-dark-tertiary" />
                  <h3 className="mt-2 text-sm font-medium text-light-primary dark:text-dark-primary">No trips found</h3>
                  <p className="mt-1 text-sm text-light-secondary dark:text-dark-secondary">Create the first trip using the button above.</p>
                </div>
              )}
            </div>

            {sortedTrips.length > 10 && (
              <div className="mt-6 text-center">
                <Link to="/admin/trips" className="btn btn-ghost btn-sm flex items-center gap-2 justify-center">
                  View all trips <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </section>

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
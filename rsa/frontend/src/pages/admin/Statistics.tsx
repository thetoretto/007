import React, { useState, useEffect, useMemo } from 'react';
import useAuthStore from '../../store/authStore';
import useTripStore, { Trip } from '../../store/tripStore'; // Added
import { Activity, TrendingUp, BarChart2, Users, DollarSign, CreditCard, MapPin, Navigation, Filter as FilterIcon } from 'react-feather'; // react-feather for consistency, added new icons
import { mockTimeSlots, mockVehicles, mockRoutes, getBookingsWithDetails, mockDashboardStats, mockUsers } from '../../utils/mockData'; // Added mockUsers
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Import the DashboardNavbar component
const DashboardNavbar = React.lazy(() => import('../../components/dashboard/DashboardNavbar'));
import '../../index.css';

// Mock data for existing statistics (remains)
const mockTripStats = [
  { date: '2023-06-01', trips: 8, revenue: 640 },
  { date: '2023-06-02', trips: 10, revenue: 800 },
  { date: '2023-06-03', trips: 12, revenue: 960 },
  { date: '2023-06-04', trips: 9, revenue: 720 },
  { date: '2023-06-05', trips: 15, revenue: 1200 },
  { date: '2023-06-06', trips: 11, revenue: 880 },
  { date: '2023-06-07', trips: 14, revenue: 1120 },
];

const mockUserStats = [
  { name: 'Passengers', value: 350, color: '#3b82f6' },
  { name: 'Drivers', value: 50, color: '#10b981' },
  { name: 'Admins', value: 5, color: '#f59e0b' },
];

// Copied and adapted from AdminDashboard.tsx
const generateStatisticsPageData = (period: 'daily' | 'weekly' | 'monthly' | 'yearly', allTrips: Trip[]) => {
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
        firstDayOfWeek.setDate(currentDate - currentDay + (currentDay === 0 ? -6 : 1));
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

  const driverOrigins = { 'City A': 0, 'City B': 0, 'Suburb X': 0, 'Town Y': 0, 'Downtown': 0 };
  const popularDestinations = { 'Airport': 0, 'Downtown': 0, 'Mall': 0, 'Business Park': 0, 'University': 0 };

  tripsForPeriod.forEach(trip => {
    const origins = Object.keys(driverOrigins);
    const destinations = Object.keys(popularDestinations);
    // Ensure fromLocation and toLocation exist in our mock keys, or handle gracefully
    if (trip.fromLocation && origins.includes(trip.fromLocation)) {
        driverOrigins[trip.fromLocation as keyof typeof driverOrigins]++;
    } else {
        driverOrigins[origins[Math.floor(Math.random() * origins.length)]]++; // Fallback to random if not found
    }
    if (trip.toLocation && destinations.includes(trip.toLocation)) {
        popularDestinations[trip.toLocation as keyof typeof popularDestinations]++;
    } else {
        popularDestinations[destinations[Math.floor(Math.random() * destinations.length)]]++; // Fallback
    }
  });

  return {
    driverOriginData: Object.entries(driverOrigins).map(([name, value]) => ({ name, value })).filter(item => item.value > 0),
    destinationData: Object.entries(popularDestinations).map(([name, value]) => ({ name, value })).filter(item => item.value > 0),
    simulatedPayments: {
      totalTransactions: Math.floor(Math.random() * 100) + 50 + tripsForPeriod.length,
      totalValue: (Math.random() * 5000 + 1000 + tripsForPeriod.reduce((sum, t) => sum + (t.price || 0), 0)).toFixed(2),
      successful: Math.floor(Math.random() * 40) + 45 + Math.floor(tripsForPeriod.length * 0.9),
      failed: Math.floor(Math.random() * 10) + 5 + Math.ceil(tripsForPeriod.length * 0.1),
    }
  };
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Statistics: React.FC = () => {
  const { user } = useAuthStore();
  const { trips, fetchTrips } = useTripStore();
  const [timePeriod, setTimePeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [statsPageData, setStatsPageData] = useState(generateStatisticsPageData(timePeriod, trips));

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  useEffect(() => {
    setStatsPageData(generateStatisticsPageData(timePeriod, trips));
  }, [timePeriod, trips]);
  
  // Calculate some summary statistics (remains)
  const totalTrips = mockTripStats.reduce((sum, day) => sum + day.trips, 0);
  const totalRevenue = mockTripStats.reduce((sum, day) => sum + day.revenue, 0);
  const avgRevenuePerTrip = totalTrips > 0 ? (totalRevenue / totalTrips).toFixed(2) : '0';
  
  return (
    <div className="container-app py-8">
      <React.Suspense fallback={<div>Loading...</div>}>
        <DashboardNavbar userRole="admin" />
      </React.Suspense>
      
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-gray-900">Statistics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Platform-wide metrics and performance statistics
          </p>
        </div>
        {/* Time Period Filter */}
        <div className="mt-4 md:mt-0 md:ml-4">
          <div className="flex items-center">
            <FilterIcon className="h-5 w-5 text-gray-400 mr-2" />
            <select
              id="timePeriod"
              name="timePeriod"
              className="form-select pl-8 py-2 text-sm"
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly')}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards (remains) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 card rounded-md p-3">
                <Activity className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Trips</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{totalTrips}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 card rounded-md p-3">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{mockDashboardStats.totalUsers}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 card rounded-md p-3">
                <DollarSign className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">${totalRevenue.toFixed(2)}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 card rounded-md p-3">
                <TrendingUp className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg. Revenue Per Trip</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">${avgRevenuePerTrip}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts Section (existing charts remain) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="card rounded-lg shadow-sm p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Daily Trip & Revenue Statistics</h2>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Last 7 days</span>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockTripStats}>
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
                  dataKey="trips"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="card rounded-lg shadow-sm p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">User Distribution</h2>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">By user type</span>
              <Users className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockUserStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {mockUserStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* New Charts Section: Driver Origins, Popular Destinations, Payment Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Driver Origins */}
        <div className="card rounded-lg shadow-sm p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Driver Common Origins</h2>
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            {statsPageData.driverOriginData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsPageData.driverOriginData} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => [value, 'Trips from here']} />
                  <Bar dataKey="value" fill="#8884d8" barSize={15} radius={[0, 4, 4, 0]}>
                    {statsPageData.driverOriginData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 flex items-center justify-center h-full">No origin data for this period.</p>
            )}
          </div>
        </div>

        {/* Popular Destinations */}
        <div className="card rounded-lg shadow-sm p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Popular Destinations</h2>
            <Navigation className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            {statsPageData.destinationData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statsPageData.destinationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {statsPageData.destinationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 flex items-center justify-center h-full">No destination data for this period.</p>
            )}
          </div>
        </div>

        {/* Simulated Payment Overview */}
        <div className="card rounded-lg shadow-sm p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Payment Overview</h2>
            <CreditCard className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3 mt-2">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-gray-500">Total Transactions:</span>
              <span className="text-lg font-semibold text-gray-900">{statsPageData.simulatedPayments.totalTransactions}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-gray-500">Total Value:</span>
              <span className="text-lg font-semibold text-gray-900">${statsPageData.simulatedPayments.totalValue}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-green-500">Successful Payments:</span>
              <span className="text-lg font-semibold text-green-600">{statsPageData.simulatedPayments.successful}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-red-500">Failed Payments:</span>
              <span className="text-lg font-semibold text-red-600">{statsPageData.simulatedPayments.failed}</span>
            </div>
            <div className="pt-2">
                <ResponsiveContainer width="100%" height={60}>
                    <BarChart data={[{name: 'Payments', successful: statsPageData.simulatedPayments.successful, failed: statsPageData.simulatedPayments.failed }]}>
                        <XAxis dataKey="name" hide/>
                        <YAxis hide/>
                        <Tooltip />
                        <Bar dataKey="successful" stackId="a" fill="#10b981" radius={[4,0,0,4]}/>
                        <Bar dataKey="failed" stackId="a" fill="#ef4444" radius={[0,4,4,0]}/>
                    </BarChart>
                </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Statistics;
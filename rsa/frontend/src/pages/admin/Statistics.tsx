import React, { useState, useEffect, useMemo } from 'react';
import useAuthStore from '../../store/authStore';
import useTripStore, { Trip } from '../../store/tripStore';
import { 
  Activity, 
  TrendingUp, 
  BarChart2, 
  Users, 
  DollarSign, 
  CreditCard, 
  MapPin, 
  Navigation, 
  Filter as FilterIcon,
  Calendar,
  ChevronDown
} from 'react-feather';
import { mockTimeSlots, mockVehicles, mockRoutes, getBookingsWithDetails, mockDashboardStats, mockUsers } from '../../utils/mockData';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import ToastContainer from '../../components/common/ToastContainer';

// Mock data for existing statistics
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

// Generate statistics page data
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

const AdminStatistics: React.FC = () => {
  const { user } = useAuthStore();
  const { trips, fetchTrips } = useTripStore();
  const [timePeriod, setTimePeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [statsPageData, setStatsPageData] = useState(generateStatisticsPageData(timePeriod, trips));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchTrips();
      setIsLoading(false);
    };
    loadData();
  }, [fetchTrips]);

  useEffect(() => {
    setStatsPageData(generateStatisticsPageData(timePeriod, trips));
  }, [timePeriod, trips]);
  
  // Calculate summary statistics
  const totalTrips = mockTripStats.reduce((sum, day) => sum + day.trips, 0);
  const totalRevenue = mockTripStats.reduce((sum, day) => sum + day.revenue, 0);
  const avgRevenuePerTrip = totalTrips > 0 ? (totalRevenue / totalTrips).toFixed(2) : '0';

  // Get time period label
  const getTimePeriodLabel = () => {
    switch (timePeriod) {
      case 'daily': return 'Today';
      case 'weekly': return 'This Week';
      case 'monthly': return 'This Month';
      case 'yearly': return 'This Year';
      default: return 'This Month';
    }
  };
  
  return (
    <div className="text-gray-900 dark:text-gray-50 transition-colors duration-300">
  

      <main className="container-app pb-8 md:pt-28 md:pb-12">
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white transition-colors duration-300 flex items-center">
            <BarChart2 className="h-7 w-7 mr-3 text-primary-600 dark:text-primary-400 transition-colors duration-300" />
            Statistics
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
            Platform-wide metrics and performance statistics
          </p>
        </div>
        
        {/* Time Period Filter */}
        <div className="mb-8 md:mb-12">
          <label htmlFor="timePeriod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Select Period:</label>
          <div className="relative inline-block">
              <select
                id="timePeriod"
                name="timePeriod"
              className="form-select block w-full text-sm rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:focus:ring-primary-500 dark:focus:border-primary-500 pr-10 transition-colors duration-300"
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly')}
                aria-label="Time period"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300 transition-colors duration-300">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 dark:border-primary-400 transition-colors duration-300"></div>
          </div>
        )}

        {!isLoading && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="card p-6">
                  <div className="flex items-center">
                  <div className="flex-shrink-0 icon-badge icon-badge-md bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400 transition-colors duration-300">
                    <Activity className="h-5 w-5" />
                    </div>
                  <div className="ml-4 w-0 flex-1">
                      <dl>
                      <dt className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate transition-colors duration-300">Total Trips ({getTimePeriodLabel()})</dt>
                        <dd>
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">{totalTrips}</div>
                        </dd>
                      </dl>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                  <div className="flex items-center">
                  <div className="flex-shrink-0 icon-badge icon-badge-md bg-secondary-100 text-secondary-600 dark:bg-secondary-900 dark:text-secondary-400 transition-colors duration-300">
                    <Users className="h-5 w-5" />
                    </div>
                  <div className="ml-4 w-0 flex-1">
                      <dl>
                      <dt className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate transition-colors duration-300">Total Passengers ({getTimePeriodLabel()})</dt>
                        <dd>
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">{mockDashboardStats.totalUsers}</div>
                        </dd>
                      </dl>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                  <div className="flex items-center">
                  <div className="flex-shrink-0 icon-badge icon-badge-md bg-success-light text-success dark:bg-success-dark dark:text-success-light transition-colors duration-300">
                    <DollarSign className="h-5 w-5" />
                    </div>
                  <div className="ml-4 w-0 flex-1">
                      <dl>
                      <dt className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate transition-colors duration-300">Total Revenue ({getTimePeriodLabel()})</dt>
                        <dd>
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">${totalRevenue.toFixed(2)}</div>
                        </dd>
                      </dl>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                  <div className="flex items-center">
                  <div className="flex-shrink-0 icon-badge icon-badge-md bg-warning-light text-warning dark:bg-warning-dark dark:text-warning-light transition-colors duration-300">
                    <TrendingUp className="h-5 w-5" />
                    </div>
                  <div className="ml-4 w-0 flex-1">
                      <dl>
                      <dt className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate transition-colors duration-300">Avg. Revenue Per Trip</dt>
                        <dd>
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">${avgRevenuePerTrip}</div>
                        </dd>
                      </dl>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Charts Section (existing charts remain) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="card rounded-lg shadow-sm p-4 sm:p-6 bg-white dark:bg-gray-800">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">Daily Trip & Revenue Statistics</h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Last 7 days</span>
                    <TrendingUp className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </div>
                </div>
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockTripStats}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => value.split('-')[2]}
                        dy={10}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        width={30}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          borderRadius: '0.375rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          border: 'none'
                        }}
                        itemStyle={{ padding: '2px 0' }}
                        formatter={(value, name) => [value, name === 'trips' ? 'Trips' : 'Revenue ($)']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Line
                        name="trips"
                        type="monotone"
                        dataKey="trips"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        name="revenue"
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
              
              <div className="card rounded-lg shadow-sm p-4 sm:p-6 bg-white dark:bg-gray-800">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">User Distribution</h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">By user type</span>
                    <Users className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </div>
                </div>
                <div className="h-64 sm:h-80">
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
                      <Tooltip 
                        formatter={(value) => [`${value} users`, 'Count']}
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          borderRadius: '0.375rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          border: 'none'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* New Charts Section: Driver Origins, Popular Destinations, Payment Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Driver Origins */}
              <div className="card rounded-lg shadow-sm p-4 sm:p-6 bg-white dark:bg-gray-800">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">Driver Common Origins</h2>
                  <MapPin className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <div className="h-64 sm:h-80">
                  {statsPageData.driverOriginData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={statsPageData.driverOriginData} 
                        layout="vertical" 
                        margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                        <XAxis 
                          type="number" 
                          axisLine={false} 
                          tickLine={false}
                          tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          axisLine={false} 
                          tickLine={false} 
                          width={80} 
                          tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        <Tooltip 
                          formatter={(value) => [value, 'Trips from here']}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            borderRadius: '0.375rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            border: 'none'
                          }}
                        />
                        <Bar dataKey="value" fill="#8884d8" barSize={15} radius={[0, 4, 4, 0]}>
                          {statsPageData.driverOriginData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MapPin className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">No origin data for this period.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Popular Destinations */}
              <div className="card rounded-lg shadow-sm p-4 sm:p-6 bg-white dark:bg-gray-800">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">Popular Destinations</h2>
                  <Navigation className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <div className="h-64 sm:h-80">
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
                        <Tooltip 
                          formatter={(value, name) => [value, name]}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            borderRadius: '0.375rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            border: 'none'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Navigation className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">No destination data for this period.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Simulated Payment Overview */}
              <div className="card rounded-lg shadow-sm p-4 sm:p-6 bg-white dark:bg-gray-800">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">Payment Overview</h2>
                  <CreditCard className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <div className="space-y-3 mt-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Total Transactions:</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">{statsPageData.simulatedPayments.totalTransactions}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Total Value:</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">${statsPageData.simulatedPayments.totalValue}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-green-500 dark:text-green-400">Successful Payments:</span>
                    <span className="text-lg font-semibold text-green-600 dark:text-green-400">{statsPageData.simulatedPayments.successful}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-red-500 dark:text-red-400">Failed Payments:</span>
                    <span className="text-lg font-semibold text-red-600 dark:text-red-400">{statsPageData.simulatedPayments.failed}</span>
                  </div>
                  <div className="pt-2">
                    <ResponsiveContainer width="100%" height={60}>
                      <BarChart data={[{name: 'Payments', successful: statsPageData.simulatedPayments.successful, failed: statsPageData.simulatedPayments.failed }]}>
                        <XAxis dataKey="name" hide/>
                        <YAxis hide/>
                        <Tooltip 
                          formatter={(value, name) => [value, name === 'successful' ? 'Successful' : 'Failed']}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            borderRadius: '0.375rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            border: 'none'
                          }}
                        />
                        <Bar dataKey="successful" stackId="a" fill="#10b981" radius={[4,0,0,4]}/>
                        <Bar dataKey="failed" stackId="a" fill="#ef4444" radius={[0,4,4,0]}/>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminStatistics;
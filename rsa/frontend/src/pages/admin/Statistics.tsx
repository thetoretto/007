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

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
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
    <div className="driver-dashboard">
      <ToastContainer />

      {/* Modern Header */}
      <header className="driver-header mb-8">
        <div className="container-app">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="icon-badge icon-badge-lg bg-primary text-on-primary">
                  <BarChart2 className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-light-primary dark:text-dark-primary">
                    Statistics Dashboard
                  </h1>
                  <p className="text-sm text-light-secondary dark:text-dark-secondary">
                    View comprehensive analytics and insights
                  </p>
                </div>
              </div>
              <div className="driver-status-badge online">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                Analytics Active - {getTimePeriodLabel()}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative">
                <select
                  id="timePeriod"
                  name="timePeriod"
                  className="form-select text-sm rounded-lg pr-10"
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly')}
                  aria-label="Time period"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-app py-8">

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}

        {!isLoading && (
          <>
            {/* Key Metrics Section */}
            <section className="mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="driver-metric-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="driver-metric-label">Total Trips</div>
                    <div className="icon-badge icon-badge-md bg-primary-light text-primary">
                      <Activity className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="driver-metric-value">{totalTrips}</div>
                  <div className="driver-metric-change positive">
                    <TrendingUp className="h-3 w-3" />
                    {getTimePeriodLabel()}
                  </div>
                </div>

                <div className="driver-metric-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="driver-metric-label">Total Passengers</div>
                    <div className="icon-badge icon-badge-md bg-secondary-light text-secondary">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="driver-metric-value">{mockDashboardStats.totalUsers}</div>
                  <div className="driver-metric-change positive">
                    <TrendingUp className="h-3 w-3" />
                    {getTimePeriodLabel()}
                  </div>
                </div>

                <div className="driver-metric-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="driver-metric-label">Total Revenue</div>
                    <div className="icon-badge icon-badge-md bg-secondary-light text-secondary">
                      <DollarSign className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="driver-metric-value">${totalRevenue.toFixed(2)}</div>
                  <div className="driver-metric-change positive">
                    <TrendingUp className="h-3 w-3" />
                    {getTimePeriodLabel()}
                  </div>
                </div>

                <div className="driver-metric-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="driver-metric-label">Avg. Per Trip</div>
                    <div className="icon-badge icon-badge-md bg-primary-light text-primary">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="driver-metric-value">${avgRevenuePerTrip}</div>
                  <div className="driver-metric-change positive">
                    <TrendingUp className="h-3 w-3" />
                    Revenue efficiency
                  </div>
                </div>
              </div>
            </section>

            {/* Charts Section */}
            <section className="mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="driver-metric-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="icon-badge icon-badge-md bg-primary-light text-primary">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-light-primary dark:text-dark-primary">Daily Trip & Revenue</h2>
                      <p className="text-sm text-light-secondary dark:text-dark-secondary">Last 7 days</p>
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

                <div className="driver-metric-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="icon-badge icon-badge-md bg-secondary-light text-secondary">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-light-primary dark:text-dark-primary">User Distribution</h2>
                      <p className="text-sm text-light-secondary dark:text-dark-secondary">By user type</p>
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
            </section>

            {/* Additional Analytics Section */}
            <section className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Driver Origins */}
                <div className="driver-metric-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="icon-badge icon-badge-md bg-primary-light text-primary">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-light-primary dark:text-dark-primary">Driver Origins</h2>
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
                <div className="driver-metric-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="icon-badge icon-badge-md bg-secondary-light text-secondary">
                      <Navigation className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-light-primary dark:text-dark-primary">Popular Destinations</h2>
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

                {/* Payment Overview */}
                <div className="driver-metric-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="icon-badge icon-badge-md bg-primary-light text-primary">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-light-primary dark:text-dark-primary">Payment Overview</h2>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm text-light-secondary dark:text-dark-secondary">Total Transactions:</span>
                      <span className="text-lg font-semibold text-light-primary dark:text-dark-primary">{statsPageData.simulatedPayments.totalTransactions}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm text-light-secondary dark:text-dark-secondary">Total Value:</span>
                      <span className="text-lg font-semibold text-light-primary dark:text-dark-primary">${statsPageData.simulatedPayments.totalValue}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm text-secondary">Successful:</span>
                      <span className="text-lg font-semibold text-secondary">{statsPageData.simulatedPayments.successful}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm text-accent">Failed:</span>
                      <span className="text-lg font-semibold text-accent">{statsPageData.simulatedPayments.failed}</span>
                    </div>
                    <div className="driver-progress-bar mt-3">
                      <div
                        className="driver-progress-fill"
                        style={{ width: `${(statsPageData.simulatedPayments.successful / (statsPageData.simulatedPayments.successful + statsPageData.simulatedPayments.failed)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminStatistics;
import React from 'react';
import useAuthStore from '../../store/authStore';
import { Activity, TrendingUp, BarChart2, Users, DollarSign } from 'react-feather';
import { mockTimeSlots, mockVehicles, mockRoutes, getBookingsWithDetails, mockDashboardStats } from '../../utils/mockData';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Import the DashboardNavbar component
const DashboardNavbar = React.lazy(() => import('../../components/dashboard/DashboardNavbar'));

// Mock data for statistics
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

const Statistics: React.FC = () => {
  const { user } = useAuthStore();
  
  // Calculate some summary statistics
  const totalTrips = mockTripStats.reduce((sum, day) => sum + day.trips, 0);
  const totalRevenue = mockTripStats.reduce((sum, day) => sum + day.revenue, 0);
  const avgRevenuePerTrip = totalTrips > 0 ? (totalRevenue / totalTrips).toFixed(2) : '0';
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Add the horizontal navigation bar */}
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
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
                    <div className="text-lg font-medium text-gray-900">{mockDashboardStats.totalUsers}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
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

        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
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
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
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
        
        <div className="bg-white rounded-lg shadow-sm p-6">
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
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {mockUserStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}`, 'Users']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Additional Statistics */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="mb-4">
          <h2 className="text-lg font-medium text-gray-900">Platform Growth</h2>
          <p className="text-sm text-gray-500 mt-1">Monthly user and trip growth statistics</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-2">New Users This Month</h3>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">78</span>
              <span className="ml-2 flex items-center text-sm font-medium text-green-600">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                12%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Compared to last month</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-2">New Trips This Month</h3>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">156</span>
              <span className="ml-2 flex items-center text-sm font-medium text-green-600">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                8%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Compared to last month</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Revenue Growth</h3>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">$12,450</span>
              <span className="ml-2 flex items-center text-sm font-medium text-green-600">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                15%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Compared to last month</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
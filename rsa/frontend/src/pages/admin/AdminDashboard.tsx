import React from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { mockDashboardStats, mockBookingStats, mockRoutePopularity } from '../../utils/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, Calendar, TrendingUp, CreditCard, Settings, User, Map, Activity } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  
  // Import the DashboardNavbar component
  const DashboardNavbar = React.lazy(() => import('../../components/dashboard/DashboardNavbar'));
  
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
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link to="/admin/reports" className="btn btn-primary">
            <Activity className="h-4 w-4 mr-2" />
            Generate Reports
          </Link>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/users" className="font-medium text-primary-600 hover:text-primary-700">
                View all users
              </Link>
            </div>
          </div>
        </div>

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
                    <div className="text-lg font-medium text-gray-900">{mockDashboardStats.upcomingTrips}</div>
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
      
      {/* Charts Section */}
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
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                <Bar dataKey="percentage" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-3">
                <Link 
                  to="/admin/users/new"
                  className="btn btn-primary w-full flex items-center justify-center"
                >
                  <User className="h-4 w-4 mr-2" />
                  Add New User
                </Link>
                <Link 
                  to="/admin/trips/new"
                  className="btn btn-secondary w-full flex items-center justify-center"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Create New Trip
                </Link>
                <Link 
                  to="/admin/routes"
                  className="btn btn-secondary w-full flex items-center justify-center"
                >
                  <Map className="h-4 w-4 mr-2" />
                  Manage Routes
                </Link>
                <Link 
                  to="/admin/reports/generate"
                  className="btn btn-secondary w-full flex items-center justify-center"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Generate Reports
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
            </div>
            <div className="px-4 sm:px-6">
              <ul className="divide-y divide-gray-200">
                <li className="py-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                        <User className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">New user registered</p>
                      <p className="text-sm text-gray-500">
                        Jane Smith created a new account as a passenger.
                      </p>
                      <p className="mt-1 text-xs text-gray-400">15 minutes ago</p>
                    </div>
                  </div>
                </li>
                <li className="py-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-accent-100 flex items-center justify-center text-accent-600">
                        <CreditCard className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">New booking confirmed</p>
                      <p className="text-sm text-gray-500">
                        John Doe booked a trip from Downtown to Airport.
                      </p>
                      <p className="mt-1 text-xs text-gray-400">1 hour ago</p>
                    </div>
                  </div>
                </li>
                <li className="py-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-success-100 flex items-center justify-center text-success-600">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.4 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.6-1.2-.9-1.9-1.7H4c-.9 0-1.6.7-1.6 1.6v7.3c0 .9.7 1.7 1.6 1.7h2"/>
                          <circle cx="7" cy="17" r="2"/>
                          <path d="M9 17h6"/>
                          <circle cx="17" cy="17" r="2"/>
                        </svg>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">New vehicle added</p>
                      <p className="text-sm text-gray-500">
                        Robert Johnson added a new Toyota Coaster to the fleet.
                      </p>
                      <p className="mt-1 text-xs text-gray-400">3 hours ago</p>
                    </div>
                  </div>
                </li>
                <li className="py-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-warning-100 flex items-center justify-center text-warning-600">
                        <Calendar className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">Trip cancelled</p>
                      <p className="text-sm text-gray-500">
                        Trip #TS1089 from Airport to Downtown was cancelled.
                      </p>
                      <p className="mt-1 text-xs text-gray-400">5 hours ago</p>
                    </div>
                  </div>
                </li>
              </ul>
              <div className="py-4 text-center border-t border-gray-200">
                <Link to="/admin/activity" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                  View all activity
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
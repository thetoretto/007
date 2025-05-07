import React, { useState, useMemo } from 'react';
import useAuthStore from '../../store/authStore';
import { Activity, TrendingUp, BarChart2, Users } from 'react-feather';
import { mockTimeSlots, mockVehicles, mockRoutes, getBookingsWithDetails } from '../../utils/mockData';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';

// Import the DashboardNavbar component
const DashboardNavbar = React.lazy(() => import('../../components/dashboard/DashboardNavbar'));

// Mock data for statistics
const mockTripStats = [
  { date: '2023-06-01', trips: 3, passengers: 24 },
  { date: '2023-06-02', trips: 2, passengers: 18 },
  { date: '2023-06-03', trips: 4, passengers: 32 },
  { date: '2023-06-04', trips: 3, passengers: 26 },
  { date: '2023-06-05', trips: 5, passengers: 40 },
  { date: '2023-06-06', trips: 2, passengers: 16 },
  { date: '2023-06-07', trips: 3, passengers: 24 },
];

const mockRouteStats = [
  { routeName: 'Downtown to Airport', trips: 12, passengers: 96 },
  { routeName: 'Suburb to City Center', trips: 8, passengers: 64 },
  { routeName: 'North Campus to South Campus', trips: 10, passengers: 80 },
  { routeName: 'East Side to West Side', trips: 6, passengers: 48 },
];

type SortKey = 'routeName' | 'trips';
type SortDirection = 'asc' | 'desc';

const Statistics: React.FC = () => {
  const { user } = useAuthStore();
  
  // Calculate some summary statistics
  const totalTrips = mockTripStats.reduce((sum, day) => sum + day.trips, 0);
  const totalPassengers = mockTripStats.reduce((sum, day) => sum + day.passengers, 0);
  const avgPassengersPerTrip = totalTrips > 0 ? (totalPassengers / totalTrips).toFixed(1) : '0';

  // State for sorting route performance
  const [sortKey, setSortKey] = useState<SortKey>('trips');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Sort route data
  const sortedRouteStats = useMemo(() => {
    return [...mockRouteStats].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      let comparison = 0;
      if (valA > valB) {
        comparison = 1;
      } else if (valA < valB) {
        comparison = -1;
      }

      return sortDirection === 'desc' ? comparison * -1 : comparison;
    });
  }, [sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      // Toggle direction if same key is clicked
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new key and default to descending for trips, ascending for name
      setSortKey(key);
      setSortDirection(key === 'trips' ? 'desc' : 'asc');
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Add the horizontal navigation bar */}
      <React.Suspense fallback={<div>Loading...</div>}>
        <DashboardNavbar userRole="driver" />
      </React.Suspense>
      
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-gray-900">Statistics</h1>
          <p className="mt-1 text-sm text-gray-500">
            View your performance metrics and trip statistics
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Passengers</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{totalPassengers}</div>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg. Passengers Per Trip</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{avgPassengersPerTrip}</div>
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
          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Daily Trip Statistics</h2>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 mr-2">Sort by:</span>
              <button
                onClick={() => handleSort('routeName')}
                className={`btn btn-xs ${sortKey === 'routeName' ? 'btn-primary' : 'btn-ghost'}`}
              >
                Name {sortKey === 'routeName' && (sortDirection === 'asc' ? '▲' : '▼')}
              </button>
              <button
                onClick={() => handleSort('trips')}
                className={`btn btn-xs ${sortKey === 'trips' ? 'btn-primary' : 'btn-ghost'}`}
              >
                Trips {sortKey === 'trips' && (sortDirection === 'asc' ? '▲' : '▼')}
              </button>
              {/* <BarChart2 className="h-4 w-4 text-gray-400" /> */}
            </div>
              <span className="text-xs text-gray-500">Last 7 days</span>
              <TrendingUp className="h-4 w-4 text-gray-400" />
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
                  dataKey="passengers"
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
          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900 mb-2 sm:mb-0">Route Performance</h2>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 mr-2">Sort by:</span>
              <button
                onClick={() => handleSort('routeName')}
                className={`btn btn-xs ${sortKey === 'routeName' ? 'btn-primary' : 'btn-ghost'}`}
              >
                Name {sortKey === 'routeName' && (sortDirection === 'asc' ? '▲' : '▼')}
              </button>
              <button
                onClick={() => handleSort('trips')}
                className={`btn btn-xs ${sortKey === 'trips' ? 'btn-primary' : 'btn-ghost'}`}
              >
                Trips {sortKey === 'trips' && (sortDirection === 'asc' ? '▲' : '▼')}
              </button>
              {/* <BarChart2 className="h-4 w-4 text-gray-400" /> */}
            </div>
              <span className="text-xs text-gray-500">By number of trips</span>
              <BarChart2 className="h-4 w-4 text-gray-400" />
            </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedRouteStats} layout="vertical">
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
                <Bar dataKey="trips" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
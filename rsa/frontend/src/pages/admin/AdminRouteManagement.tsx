import React from 'react';
import DashboardNavbar from '../../components/dashboard/DashboardNavbar';
import Footer from '../../components/common/Footer';
import { useAuthStore } from '../../store/authStore';

// Placeholder for route data structure - adjust as per actual route definition
interface Route {
  id: string;
  name: string; // e.g., "City A - City B"
  origin: string;
  destination: string;
  distance?: string; // Optional
  // Add other relevant fields like checkpoints, estimated time, etc.
}

const AdminRouteManagement: React.FC = () => {
  const { user } = useAuthStore();
  // Placeholder state for routes - replace with actual store/API call
  const [routes, setRoutes] = React.useState<Route[]>([
    { id: '1', name: 'Route Alpha', origin: 'Start A', destination: 'End A' },
    { id: '2', name: 'Route Beta', origin: 'Start B', destination: 'End B' },
  ]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [currentRoute, setCurrentRoute] = React.useState<Route | null>(null);

  const handleCreate = () => {
    setCurrentRoute(null); // Reset for new route
    setIsModalOpen(true);
    console.log('Create new route');
  };

  const handleEdit = (route: Route) => {
    setCurrentRoute(route);
    setIsModalOpen(true);
    console.log('Edit route:', route.id);
  };

  const handleDelete = (routeId: string) => {
    // Placeholder for delete logic
    setRoutes(prevRoutes => prevRoutes.filter(route => route.id !== routeId));
    console.log('Delete route:', routeId);
    alert(`Route ${routeId} deleted (mock).`);
  };

  const handleSaveRoute = (routeData: Route) => {
    if (currentRoute) {
      // Update existing route
      setRoutes(prevRoutes => prevRoutes.map(r => r.id === routeData.id ? routeData : r));
      console.log('Route updated (mock):', routeData);
    } else {
      // Create new route
      const newRoute = { ...routeData, id: String(Date.now()) }; // Mock ID
      setRoutes(prevRoutes => [...prevRoutes, newRoute]);
      console.log('Route created (mock):', newRoute);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <DashboardNavbar userRole={user?.role || ''} />
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Route Management</h1>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out"
          >
            Create New Route
          </button>
        </div>

        {/* Route Table */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {routes.map((route) => (
                <tr key={route.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{route.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{route.origin}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{route.destination}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onClick={() => handleEdit(route)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                    <button onClick={() => handleDelete(route.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
              {routes.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No routes found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal for Create/Edit Route - Basic Placeholder */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
              <h2 className="text-2xl font-semibold mb-6">{currentRoute ? 'Edit Route' : 'Create New Route'}</h2>
              {/* Basic Form - Replace with a proper form component */}
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const name = (form.elements.namedItem('routeName') as HTMLInputElement).value;
                const origin = (form.elements.namedItem('routeOrigin') as HTMLInputElement).value;
                const destination = (form.elements.namedItem('routeDestination') as HTMLInputElement).value;
                if (!name || !origin || !destination) {
                  alert('Please fill all fields.');
                  return;
                }
                handleSaveRoute({ 
                  id: currentRoute?.id || '', 
                  name, 
                  origin, 
                  destination 
                });
              }}>
                <div className="mb-4">
                  <label htmlFor="routeName" className="block text-sm font-medium text-gray-700">Route Name</label>
                  <input type="text" name="routeName" id="routeName" defaultValue={currentRoute?.name || ''} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                </div>
                <div className="mb-4">
                  <label htmlFor="routeOrigin" className="block text-sm font-medium text-gray-700">Origin</label>
                  <input type="text" name="routeOrigin" id="routeOrigin" defaultValue={currentRoute?.origin || ''} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                </div>
                <div className="mb-6">
                  <label htmlFor="routeDestination" className="block text-sm font-medium text-gray-700">Destination</label>
                  <input type="text" name="routeDestination" id="routeDestination" defaultValue={currentRoute?.destination || ''} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                </div>
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm">
                    {currentRoute ? 'Save Changes' : 'Create Route'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminRouteManagement;
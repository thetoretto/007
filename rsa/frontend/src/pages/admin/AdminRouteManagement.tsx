import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { Route as RouteType } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { MapPin, Plus, Edit2, Trash, X, Save, ChevronRight } from 'lucide-react';
import ToastContainer from '../../components/common/ToastContainer';

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
  const [routes, setRoutes] = useState<Route[]>([
    { id: '1', name: 'Route Alpha', origin: 'Start A', destination: 'End A' },
    { id: '2', name: 'Route Beta', origin: 'Start B', destination: 'End B' },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = () => {
    setCurrentRoute(null); // Reset for new route
    setIsModalOpen(true);
  };

  const handleEdit = (route: Route) => {
    setCurrentRoute(route);
    setIsModalOpen(true);
  };

  const handleDelete = (routeId: string) => {
    // Placeholder for delete logic
    setIsLoading(true);
    setTimeout(() => {
      setRoutes(prevRoutes => prevRoutes.filter(route => route.id !== routeId));
      setIsLoading(false);
    }, 500); // Simulate API call
    console.log('Delete route:', routeId);
  };

  const handleSaveRoute = (routeData: Route) => {
    setIsLoading(true);
    setTimeout(() => {
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
      setIsLoading(false);
    }, 500); // Simulate API call
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <ToastContainer />

      <main className="container-app mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-16 md:pt-20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <div className="flex items-center">
                <MapPin className="h-7 w-7 mr-2 text-primary-600 hidden sm:inline" />
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Route Management</h1>
              </div>
              <button
                onClick={handleCreate}
                className="btn btn-primary w-full sm:w-auto flex items-center justify-center"
                disabled={isLoading}
              >
                <Plus size={18} className="mr-2" />
                Create New Route
              </button>
            </div>
          </div>
        </div>

        {/* Route Table */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 bg-gray-200 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-50 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">Origin</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">Destination</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {routes.map((route) => (
                  <tr key={route.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{route.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:hidden">
                        {route.origin} <ChevronRight size={12} className="inline mx-1" /> {route.destination}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 hidden sm:table-cell">{route.origin}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 hidden sm:table-cell">{route.destination}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(route)} 
                          className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                          aria-label={`Edit route ${route.name}`}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(route.id)} 
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                          aria-label={`Delete route ${route.name}`}
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {routes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center">
                        <MapPin className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No routes found.</p>
                        <button 
                          onClick={handleCreate}
                          className="mt-4 btn btn-primary btn-sm"
                        >
                          Create your first route
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Create/Edit Route */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-70 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md animate-fadeIn">
              <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {currentRoute ? 'Edit Route' : 'Create New Route'}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
              
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
              }} className="space-y-4">
                <div>
                  <label htmlFor="routeName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Route Name</label>
                  <input 
                    type="text" 
                    name="routeName" 
                    id="routeName" 
                    defaultValue={currentRoute?.name || ''} 
                    className="mt-1 form-input block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm" 
                    placeholder="e.g. Downtown - Airport"
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="routeOrigin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Origin</label>
                  <input 
                    type="text" 
                    name="routeOrigin" 
                    id="routeOrigin" 
                    defaultValue={currentRoute?.origin || ''} 
                    className="mt-1 form-input block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm" 
                    placeholder="Starting location"
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="routeDestination" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Destination</label>
                  <input 
                    type="text" 
                    name="routeDestination" 
                    id="routeDestination" 
                    defaultValue={currentRoute?.destination || ''} 
                    className="mt-1 form-input block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm" 
                    placeholder="Ending location"
                    required 
                  />
                </div>
                <div className="flex flex-col-reverse sm:flex-row justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="btn btn-ghost w-full sm:w-auto mt-3 sm:mt-0"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary w-full sm:w-auto flex items-center justify-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save size={16} className="mr-2" />
                    )}
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
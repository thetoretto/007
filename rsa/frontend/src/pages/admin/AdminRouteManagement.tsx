import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
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
    <div className=" text-gray-900 dark:text-gray-50 transition-colors duration-300">
      <Navbar /> {/* Ensured Navbar is included */}
      <ToastContainer />

      <main className="container-app py-8 md:py-12"> {/* Adjusted padding */}
        <div className="mb-8 md:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center">
                  <MapPin className="h-7 w-7 mr-3 text-primary-600 dark:text-primary-400 transition-colors duration-300" />
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Route Management</h1>
                </div>
                <button
                  onClick={handleCreate}
                  className="btn btn-accent w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-4"
                  disabled={isLoading}
                >
                  <Plus size={16} />
                  Create New Route
                </button>
              </div>
            </div>
          </div>

          {/* Route Table */}
          <div className="card rounded-lg shadow-sm overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 bg-opacity-50 dark:bg-opacity-50 flex items-center justify-center z-10 transition-colors duration-300">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 dark:border-primary-400 transition-colors duration-300"></div>
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
                <thead className="bg-gray-100 dark:bg-gray-800 transition-colors duration-300">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Name</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell transition-colors duration-300">Origin</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell transition-colors duration-300">Destination</th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
                  {routes.map((route) => (
                    <tr key={route.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">{route.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 sm:hidden transition-colors duration-300">
                          {route.origin} <ChevronRight size={12} className="inline mx-1 text-gray-400 dark:text-gray-500 transition-colors duration-300" /> {route.destination}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 hidden sm:table-cell transition-colors duration-300">{route.origin}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 hidden sm:table-cell transition-colors duration-300">{route.destination}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center space-x-2">
                          <button 
                            onClick={() => handleEdit(route)} 
                            className="btn btn-ghost btn-sm text-primary-600 dark:text-primary-400 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                            aria-label={`Edit route ${route.name}`}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(route.id)} 
                            className="btn btn-ghost btn-sm text-error dark:text-error-light p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
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
                      <td colSpan={4} className="px-6 py-8 text-center card">
                        <div className="flex flex-col items-center">
                          <MapPin className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-3 transition-colors duration-300" />
                          <p className="text-gray-600 dark:text-gray-300 mb-4 transition-colors duration-300">No routes found.</p>
                          <button 
                            onClick={handleCreate}
                            className="btn btn-accentbtn-sm inline-flex items-center gap-2"
                          >
                             <Plus size={16} /> Create your first route
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal for Create/Edit Route */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-70 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4 animate-fadeIn">
            <div className="card p-6 w-full max-w-md animate-fadeIn">
              <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-4 transition-colors duration-300">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                  {currentRoute ? 'Edit Route' : 'Create New Route'}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
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
              }} className="space-y-6">
                <div>
                  <label htmlFor="routeName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Route Name</label>
                  <input 
                    type="text" 
                    name="routeName" 
                    id="routeName" 
                    defaultValue={currentRoute?.name || ''} 
                    className="form-input block w-full rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors duration-300"
                    placeholder="e.g. Downtown - Airport"
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="routeOrigin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Origin</label>
                  <input 
                    type="text" 
                    name="routeOrigin" 
                    id="routeOrigin" 
                    defaultValue={currentRoute?.origin || ''} 
                    className="form-input block w-full rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors duration-300"
                    placeholder="Starting location"
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="routeDestination" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Destination</label>
                  <input 
                    type="text" 
                    name="routeDestination" 
                    id="routeDestination" 
                    defaultValue={currentRoute?.destination || ''} 
                    className="form-input block w-full rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors duration-300"
                    placeholder="Ending location"
                    required 
                  />
                </div>
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="btn btn-secondary w-full sm:w-auto mt-3 sm:mt-0 py-3 px-4"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-accent w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-4"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save size={16} />
                    )}
                    {currentRoute ? 'Save Changes' : 'Create Route'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

    </div>
  );
};

export default AdminRouteManagement;
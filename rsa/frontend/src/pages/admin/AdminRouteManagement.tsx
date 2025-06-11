import React, { useState, useEffect } from 'react';
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

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    <div className="driver-dashboard">
      <ToastContainer />

      {/* Modern Header */}
      <header className="driver-header mb-8">
        <div className="container-app">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="icon-badge icon-badge-lg bg-primary text-on-primary">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-light-primary dark:text-dark-primary">
                    Route Management
                  </h1>
                  <p className="text-sm text-light-secondary dark:text-dark-secondary">
                    Manage travel routes and destinations
                  </p>
                </div>
              </div>
              <div className="driver-status-badge online">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                {routes.length} Routes Active
              </div>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <button
                onClick={handleCreate}
                className="btn btn-primary flex items-center gap-2 px-4 py-3 shadow-primary"
                disabled={isLoading}
              >
                <Plus className="h-5 w-5" />
                Create New Route
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-app py-8">
        <section className="mb-8">

          <div className="driver-metric-card overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 bg-light dark:bg-dark bg-opacity-50 flex items-center justify-center z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            )}

            <div className="flex items-center gap-3 mb-6">
              <div className="icon-badge icon-badge-md bg-primary-light text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-light-primary dark:text-dark-primary">
                All Routes ({routes.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {routes.map((route) => (
                <div key={route.id} className="driver-trip-card group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-light-primary dark:text-dark-primary mb-1">
                        {route.name}
                      </h3>
                      <div className="driver-status-badge online">
                        Active Route
                      </div>
                    </div>
                    <div className="icon-badge icon-badge-sm bg-primary-light text-primary">
                      <MapPin className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-light-secondary dark:text-dark-secondary mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      {route.origin}
                    </div>
                    <ChevronRight className="h-4 w-4 text-light-tertiary dark:text-dark-tertiary" />
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-secondary" />
                      {route.destination}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(route)}
                      className="btn btn-ghost btn-sm text-primary p-1"
                      aria-label={`Edit route ${route.name}`}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(route.id)}
                      className="btn btn-ghost btn-sm text-accent p-1"
                      aria-label={`Delete route ${route.name}`}
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {routes.length === 0 && (
                <div className="text-center py-12 bg-light dark:bg-dark rounded-lg">
                  <MapPin className="mx-auto h-12 w-12 text-light-tertiary dark:text-dark-tertiary mb-3" />
                  <h3 className="text-sm font-medium text-light-primary dark:text-dark-primary mb-2">No routes found</h3>
                  <p className="text-light-secondary dark:text-dark-secondary mb-4">Create your first route to get started.</p>
                  <button
                    onClick={handleCreate}
                    className="btn btn-primary btn-sm inline-flex items-center gap-2"
                  >
                     <Plus size={16} /> Create your first route
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

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
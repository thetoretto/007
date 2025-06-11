import React, { useState, useEffect, useMemo } from 'react';
import useHotPointStore, { HotPoint } from '../../store/hotPointStore';
import { PlusCircle, Edit, Trash2, Search, Filter, X, Save, MapPin, ToggleLeft, ToggleRight } from 'lucide-react';
import '../../index.css';
import ToastContainer from '../../components/common/ToastContainer';

// Enhanced Modal Component with better mobile responsiveness
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      <div className="relative mx-auto p-4 sm:p-6 border w-full max-w-lg shadow-xl rounded-md card animate-fadeIn">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors rounded-full p-1 hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

// Define interface for component props
interface AdminHotPointManagementProps {
  mode?: 'view' | 'create' | 'edit';
}

const AdminHotPointManagement: React.FC<AdminHotPointManagementProps> = ({ mode = 'view' }) => {
  const {
    hotPoints,
    fetchHotPoints,
    addHotPoint,
    updateHotPoint,
    deleteHotPoint,
    toggleHotPointStatus,
  } = useHotPointStore();

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingHotPoint, setEditingHotPoint] = useState<HotPoint | null>(null);
  const [currentHotPointData, setCurrentHotPointData] = useState<Omit<HotPoint, 'id' | 'createdAt' | 'updatedAt' | 'status'>>({
    name: '',
    address: '',
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    const loadHotPoints = async () => {
      setIsLoading(true);
      await fetchHotPoints();
      setIsLoading(false);
    };
    loadHotPoints();
  }, [fetchHotPoints]);

  // Open create modal automatically if in create mode
  useEffect(() => {
    if (mode === 'create') {
      openAddModal();
    }
  }, [mode]);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredHotPoints = useMemo(() => {
    return hotPoints.filter(hp => {
      const matchesSearch = hp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            hp.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || hp.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [hotPoints, searchTerm, statusFilter]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setCurrentHotPointData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const openAddModal = () => {
    setCurrentHotPointData({ name: '', address: '', latitude: 0, longitude: 0 });
    setIsAddModalOpen(true);
  };

  const openEditModal = (hotPoint: HotPoint) => {
    setEditingHotPoint(hotPoint);
    setCurrentHotPointData({ 
      name: hotPoint.name,
      address: hotPoint.address,
      latitude: hotPoint.latitude,
      longitude: hotPoint.longitude 
    });
    setIsEditModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setEditingHotPoint(null);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentHotPointData.name || !currentHotPointData.address) {
      alert('Name and Address are required.');
      return;
    }
    try {
      await addHotPoint(currentHotPointData);
      alert('Hot Point added successfully!');
      closeModal();
    } catch (error) {
      alert(`Failed to add Hot Point: ${(error as Error).message}`);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHotPoint || !currentHotPointData.name || !currentHotPointData.address) {
      alert('Name and Address are required.');
      return;
    }
    try {
      await updateHotPoint(editingHotPoint.id, currentHotPointData);
      alert('Hot Point updated successfully!');
      closeModal();
    } catch (error) {
      alert(`Failed to update Hot Point: ${(error as Error).message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this hot point?')) {
      try {
        await deleteHotPoint(id);
        alert('Hot Point deleted successfully.');
      } catch (error) {
        alert(`Failed to delete Hot Point: ${(error as Error).message}`);
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleHotPointStatus(id);
      alert('Hot Point status updated.');
    } catch (error) {
      alert(`Failed to update status: ${(error as Error).message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="driver-dashboard">
        <main className="container-app py-8 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
            <p className="text-xl text-light-secondary dark:text-dark-secondary">Loading Hot Points...</p>
          </div>
        </main>
      </div>
    );
  }

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
                    Hot Point Management
                  </h1>
                  <p className="text-sm text-light-secondary dark:text-dark-secondary">
                    Manage pickup and drop-off locations
                  </p>
                </div>
              </div>
              <div className="driver-status-badge online">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                {filteredHotPoints.length} Hot Points Active
              </div>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <button
                onClick={openAddModal}
                className="btn btn-primary flex items-center gap-2 px-4 py-3 shadow-primary"
              >
                <PlusCircle className="h-5 w-5" />
                Add Hot Point
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-app py-8">

        {/* Filters and Search */}
        <section className="mb-8">
          <div className="driver-metric-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="icon-badge icon-badge-md bg-primary-light text-primary">
                <Search className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-light-primary dark:text-dark-primary">
                Search & Filter
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-light-tertiary dark:text-dark-tertiary" />
                  </div>
                  <input
                    type="text"
                    id="search"
                    placeholder="Search by name or address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input pl-10 w-full"
                  />
                </div>
              </div>
              <div>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                  className="form-input w-full"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Hot Points List */}
        <section className="mb-8">
          <div className="driver-metric-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="icon-badge icon-badge-md bg-secondary-light text-secondary">
                <MapPin className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-light-primary dark:text-dark-primary">
                Hot Points ({filteredHotPoints.length})
              </h2>
            </div>

            {filteredHotPoints.length === 0 ? (
              <div className="text-center py-12 bg-light dark:bg-dark rounded-lg">
                <MapPin className="mx-auto h-12 w-12 text-light-tertiary dark:text-dark-tertiary mb-3" />
                <h3 className="text-sm font-medium text-light-primary dark:text-dark-primary mb-2">No hot points found</h3>
                <p className="text-light-secondary dark:text-dark-secondary mb-4">Try adjusting your search or filters, or add a new hot point.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredHotPoints.map((hp) => (
                  <div key={hp.id} className="driver-trip-card group">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-light-primary dark:text-dark-primary mb-1">
                          {hp.name}
                        </h3>
                        <div className={`driver-status-badge ${hp.status === 'active' ? 'online' : 'offline'}`}>
                          {hp.status.charAt(0).toUpperCase() + hp.status.slice(1)}
                        </div>
                      </div>
                      <div className="icon-badge icon-badge-sm bg-primary-light text-primary">
                        <MapPin className="h-4 w-4" />
                      </div>
                    </div>

                    <div className="text-sm text-light-secondary dark:text-dark-secondary mb-3">
                      <p className="mb-1">{hp.address}</p>
                      <p className="text-xs text-light-tertiary dark:text-dark-tertiary">
                        Coordinates: {hp.latitude.toFixed(4)}, {hp.longitude.toFixed(4)}
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(hp.id)}
                        className={`btn btn-ghost btn-sm p-1 ${hp.status === 'active' ? 'text-primary' : 'text-secondary'}`}
                        title={hp.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {hp.status === 'active' ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      </button>
                      <button
                        onClick={() => openEditModal(hp)}
                        className="btn btn-ghost btn-sm text-primary p-1"
                        title="Edit Hot Point"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(hp.id)}
                        className="btn btn-ghost btn-sm text-accent p-1"
                        title="Delete Hot Point"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Mobile view for coordinates - shown on tap */}
        <div className="md:hidden mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            Tip: Tap on a hot point to view its coordinates
          </p>
        </div>
      </main>

      {/* Add/Edit Modal */} 
      <Modal 
        isOpen={isAddModalOpen || isEditModalOpen} 
        onClose={closeModal} 
        title={isEditModalOpen ? 'Edit Hot Point' : 'Add New Hot Point'}
      >
        <form onSubmit={isEditModalOpen ? handleEditSubmit : handleAddSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input 
              type="text" 
              name="name" 
              id="name" 
              value={currentHotPointData.name} 
              onChange={handleInputChange} 
              required 
              className="form-input mt-1 w-full"
              placeholder="Enter hot point name"
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
            <input 
              type="text" 
              name="address" 
              id="address" 
              value={currentHotPointData.address} 
              onChange={handleInputChange} 
              required 
              className="form-input mt-1 w-full"
              placeholder="Enter address"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Latitude</label>
              <input 
                type="number" 
                name="latitude" 
                id="latitude" 
                value={currentHotPointData.latitude} 
                onChange={handleInputChange} 
                step="any" 
                required 
                className="form-input mt-1 w-full"
                placeholder="e.g. 40.7128"
              />
            </div>
            <div>
              <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Longitude</label>
              <input 
                type="number" 
                name="longitude" 
                id="longitude" 
                value={currentHotPointData.longitude} 
                onChange={handleInputChange} 
                step="any" 
                required 
                className="form-input mt-1 w-full"
                placeholder="e.g. -74.0060"
              />
            </div>
          </div>
          <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:space-x-3">
            <button 
              type="button" 
              onClick={closeModal} 
              className="btn btn-secondary mt-3 sm:mt-0 w-full sm:w-auto py-3 px-4"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-accent w-full sm:w-auto py-3 px-4"
            >
              <Save size={18} className="mr-2" />
              {isEditModalOpen ? 'Save Changes' : 'Add Hot Point'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminHotPointManagement;
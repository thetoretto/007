import React, { useState, useEffect, useMemo } from 'react';
import useHotPointStore, { HotPoint } from '../../store/hotPointStore';
import DashboardNavbar from '../../components/dashboard/DashboardNavbar';
import { PlusCircle, Edit, Trash2, Search, Filter, X, Save, MapPin, ToggleLeft, ToggleRight } from 'lucide-react';

// Basic Modal Component (can be replaced with a more sophisticated one)
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      <div className="relative mx-auto p-6 border w-full max-w-lg shadow-xl rounded-md bg-white">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X size={24} />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

const AdminHotPointManagement: React.FC = () => {
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
      <div className="flex flex-col min-h-screen">
        <DashboardNavbar userRole="admin" />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-xl text-gray-600">Loading Hot Points...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <DashboardNavbar userRole="admin" />
      <main className="flex-grow container-app py-8 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <MapPin className="h-8 w-8 mr-3 text-primary-600" />
            Hot Point Management
          </h1>
          <button
            onClick={openAddModal}
            className="btn btn-primary inline-flex items-center"
          >
            <PlusCircle size={20} className="mr-2" />
            Add New Hot Point
          </button>
        </div>

        {/* Filters and Search */} 
        <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search Hot Points</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search"
                  placeholder="Search by name or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
            </div>
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
              <select 
                id="statusFilter" 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="form-input"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Hot Points Table */} 
        <div className="bg-white shadow-lg rounded-lg overflow-x-auto">
          {filteredHotPoints.length === 0 ? (
            <p className="p-6 text-center text-gray-500">No hot points found. Try adjusting your search or filters, or add a new hot point.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coordinates (Lat, Lng)</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHotPoints.map((hp) => (
                  <tr key={hp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{hp.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hp.address}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hp.latitude.toFixed(4)}, {hp.longitude.toFixed(4)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${hp.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {hp.status.charAt(0).toUpperCase() + hp.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button onClick={() => handleToggleStatus(hp.id)} className={`p-1 rounded-md hover:bg-gray-200 transition-colors ${hp.status === 'active' ? 'text-yellow-600 hover:text-yellow-700' : 'text-green-600 hover:text-green-700'}`} title={hp.status === 'active' ? 'Deactivate' : 'Activate'}>
                        {hp.status === 'active' ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>
                      <button onClick={() => openEditModal(hp)} className="text-primary-600 hover:text-primary-800 p-1 rounded-md hover:bg-gray-200 transition-colors" title="Edit Hot Point">
                        <Edit size={20} />
                      </button>
                      <button onClick={() => handleDelete(hp.id)} className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-gray-200 transition-colors" title="Delete Hot Point">
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input 
              type="text" 
              name="name" 
              id="name" 
              value={currentHotPointData.name} 
              onChange={handleInputChange} 
              required 
              className="form-input mt-1"
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
            <input 
              type="text" 
              name="address" 
              id="address" 
              value={currentHotPointData.address} 
              onChange={handleInputChange} 
              required 
              className="form-input mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">Latitude</label>
              <input 
                type="number" 
                name="latitude" 
                id="latitude" 
                value={currentHotPointData.latitude} 
                onChange={handleInputChange} 
                step="any" 
                required 
                className="form-input mt-1"
              />
            </div>
            <div>
              <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">Longitude</label>
              <input 
                type="number" 
                name="longitude" 
                id="longitude" 
                value={currentHotPointData.longitude} 
                onChange={handleInputChange} 
                step="any" 
                required 
                className="form-input mt-1"
              />
            </div>
          </div>
          <div className="pt-2 flex justify-end space-x-3">
            <button type="button" onClick={closeModal} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
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
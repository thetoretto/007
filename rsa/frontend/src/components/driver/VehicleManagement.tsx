import React, { useState, useEffect } from 'react';
import useVehicleStore, { Vehicle } from '../../store/vehicleStore';
import useAuthStore from '../../store/authStore';
import { Plus, Edit, Trash2, Save, X, Car, Users, Hash } from 'lucide-react'; // Added icons

const VehicleManagement: React.FC = () => {
  const { user } = useAuthStore();
  const { vehicles, fetchVehicles, addVehicle, updateVehicle, deleteVehicle } = useVehicleStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    licensePlate: '',
    capacity: '',
  });

  useEffect(() => {
    if (user?.id) {
      fetchVehicles(user.id);
    }
  }, [user?.id, fetchVehicles]);

  useEffect(() => {
    if (vehicleToEdit) {
      setFormData({
        brand: vehicleToEdit.brand,
        model: vehicleToEdit.model,
        licensePlate: vehicleToEdit.licensePlate,
        capacity: vehicleToEdit.capacity.toString(),
      });
    } else {
      setFormData({ brand: '', model: '', licensePlate: '', capacity: '' });
    }
  }, [vehicleToEdit]);

  const handleOpenModal = (vehicle: Vehicle | null = null) => {
    setVehicleToEdit(vehicle);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setVehicleToEdit(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return; // Ensure user ID is available

    const capacityValue = parseInt(formData.capacity, 10);
    if (isNaN(capacityValue) || capacityValue <= 0) {
      alert('Please enter a valid positive capacity.');
      return;
    }

    const vehicleData = {
      ...formData,
      capacity: capacityValue,
      driverId: user.id,
    };

    if (vehicleToEdit) {
      updateVehicle(vehicleToEdit.id, vehicleData);
    } else {
      addVehicle(vehicleData);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      deleteVehicle(id);
    }
  };

  return (
    // Updated: Container styling
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      {/* Updated: Header and button styling */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Manage Your Vehicles</h2>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary inline-flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Add Vehicle
        </button>
      </div>

      {/* Updated: Table styling */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Plate</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vehicles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">No vehicles added yet.</td>
              </tr>
            ) : (
              vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vehicle.brand}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{vehicle.model}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{vehicle.licensePlate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{vehicle.capacity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {/* Updated: Action button styling */}
                    <button
                      onClick={() => handleOpenModal(vehicle)}
                      className="text-primary-600 hover:text-primary-800 transition-colors duration-150 p-1 rounded hover:bg-primary-100"
                      title="Edit Vehicle"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      className="text-red-600 hover:text-red-800 transition-colors duration-150 p-1 rounded hover:bg-red-100"
                      title="Delete Vehicle"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal - Updated Styling */} 
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative mx-auto p-6 border w-full max-w-md shadow-xl rounded-lg bg-white">
            <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-5">
              <h3 className="text-lg font-semibold text-gray-900">
                {vehicleToEdit ? 'Edit Vehicle' : 'Add New Vehicle'}
              </h3>
              <button 
                onClick={handleCloseModal} 
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Car className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    required
                    className="form-input w-full pl-10 border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
                    placeholder="e.g., Toyota"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Car className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    required
                    className="form-input w-full pl-10 border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
                    placeholder="e.g., Camry"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    id="licensePlate"
                    name="licensePlate"
                    value={formData.licensePlate}
                    onChange={handleChange}
                    required
                    className="form-input w-full pl-10 border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
                    placeholder="e.g., ABC-123"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">Capacity (Seats)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    required
                    min="1"
                    className="form-input w-full pl-10 border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
                    placeholder="e.g., 4"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
                <button 
                  type="button" 
                  onClick={handleCloseModal} 
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {vehicleToEdit ? 'Update Vehicle' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleManagement;
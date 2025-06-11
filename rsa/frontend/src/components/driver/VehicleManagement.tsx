import '../../index.css';
import React, { useState, useEffect } from 'react';
import useVehicleStore from '../../store/vehicleStore';
import useAuthStore from '../../store/authStore';
import { Plus, Edit, Trash2, Save, X, Car, Users, Settings, AlertTriangle } from 'lucide-react';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  licensePlate: string;
  type: string;
  capacity: number;
  isActive?: boolean;
  driverId?: string;
  features?: string[];
}

interface VehicleManagementProps {
  userRole: 'driver' | 'admin';
}

const VehicleManagement: React.FC<VehicleManagementProps> = ({ userRole }) => {
  const { user } = useAuthStore();
  const { vehicles, fetchVehicles, addVehicle, updateVehicle, removeVehicle } = useVehicleStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);
  // Initialize capacity as string for form input, but it will be number in Vehicle type
  const [formData, setFormData] = useState<Omit<Vehicle, 'id' | 'capacity'> & { capacity: string }> ({
    brand: '',
    model: '',
    licensePlate: '',
    capacity: '', 
    type: 'sedan', // Default type, can be changed
    features: [],
    isActive: true,
    driverId: ''
  });

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        setLoading(true);
        setError(null);
        if (userRole === 'admin') {
          await fetchVehicles();
        } else if (user?.id && userRole === 'driver') {
          await fetchVehicles();
        }
      } catch (err) {
        setError('Failed to load vehicles');
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
  }, [user?.id, userRole, fetchVehicles]);

  useEffect(() => {
    if (vehicleToEdit) {
      setFormData({
        brand: vehicleToEdit.brand,
        model: vehicleToEdit.model,
        licensePlate: vehicleToEdit.licensePlate,
        capacity: vehicleToEdit.capacity.toString(),
        type: vehicleToEdit.type || 'sedan',
        features: vehicleToEdit.features || [],
        isActive: vehicleToEdit.isActive === undefined ? true : vehicleToEdit.isActive,
        driverId: vehicleToEdit.driverId || '' 
      });
    } else {
      // Reset form for new vehicle, ensuring driverId is cleared unless user is driver
      setFormData({
        brand: '',
        model: '',
        licensePlate: '',
        capacity: '',
        type: 'sedan',
        features: [],
        isActive: true,
        driverId: userRole === 'driver' && user?.id ? user.id : '' 
      });
    }
  }, [vehicleToEdit, userRole, user?.id]);

  const handleOpenModal = (vehicle: Vehicle | null = null) => {
    setVehicleToEdit(vehicle);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setVehicleToEdit(null);
    // Reset form with potentially pre-filled driverId if user is a driver
    setFormData({
        brand: '',
        model: '',
        licensePlate: '',
        capacity: '',
        type: 'sedan',
        features: [],
        isActive: true,
        driverId: userRole === 'driver' && user?.id ? user.id : '' 
      });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleFeatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const currentFeatures = prev.features || [];
      if (checked) {
        return { ...prev, features: [...currentFeatures, value] };
      } else {
        return { ...prev, features: currentFeatures.filter(f => f !== value) };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const capacityValue = parseInt(formData.capacity, 10);
    if (isNaN(capacityValue) || capacityValue <= 0) {
      alert('Please enter a valid positive capacity.'); // Replace with toast
      return;
    }

    const vehicleData: Partial<Vehicle> = {
      ...formData,
      capacity: capacityValue,
      // Ensure driverId is set for driver, and handled for admin
      driverId: userRole === 'driver' && user?.id ? user.id : formData.driverId,
    };
    
    // Remove empty string driverId before sending to backend, if it means unassigned
    if (vehicleData.driverId === '') {
        delete vehicleData.driverId;
    }

    if (vehicleToEdit) {
      await updateVehicle(vehicleToEdit.id, vehicleData as Vehicle); // Cast as Vehicle, assuming all required fields are present
    } else {
      await addVehicle(vehicleData as Omit<Vehicle, 'id'>); // Cast, assuming id is generated by backend
    }
    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        setLoading(true);
        await removeVehicle(id);
      } catch (err) {
        setError('Failed to delete vehicle');
      } finally {
        setLoading(false);
      }
    }
  };
  
  const vehicleTypes = ['Car', 'Van', 'Bus', 'Minibus', 'Sedan', 'SUV', 'Shuttle', 'Other'];
  const commonFeatures = ['Air Conditioning', 'GPS', 'Bluetooth', 'Sunroof', 'Leather Seats', 'Parking Sensors'];


  return (
    <div className="card p-6">
      <div className="driver-header mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="icon-badge icon-badge-lg bg-accent text-on-accent">
              <Car className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-light-primary dark:text-dark-primary">
                Vehicle Fleet
              </h2>
              <p className="text-light-secondary dark:text-dark-secondary mt-1">
                {userRole === 'admin' ? 'Manage all registered vehicles in the system.' : 'Manage your personal vehicle fleet.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="btn btn-primary flex items-center gap-2 shadow-primary"
          >
            <Plus className="h-5 w-5" />
            Add Vehicle
          </button>
        </div>
      </div>

      {loading && (
        <div className="driver-loading-card">
          <div className="driver-loading-spinner mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-2">
            Loading Vehicles
          </h3>
          <p className="text-light-secondary dark:text-dark-secondary">
            Please wait while we fetch your vehicle information...
          </p>
        </div>
      )}

      {error && (
        <div className="driver-notification urgent">
          <div className="flex items-start gap-3">
            <div className="icon-badge icon-badge-sm bg-accent-light text-accent mt-0.5">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium text-light-primary dark:text-dark-primary mb-1">
                Error Loading Vehicles
              </div>
              <div className="text-sm text-light-secondary dark:text-dark-secondary">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && vehicles.length === 0 && !error && (
        <div className="driver-loading-card py-16">
          <div className="icon-badge icon-badge-xl bg-accent-light text-accent mx-auto mb-6">
            <Car className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold text-light-primary dark:text-dark-primary mb-3">
            No Vehicles Found
          </h3>
          <p className="text-light-secondary dark:text-dark-secondary mb-6 max-w-md mx-auto">
            {userRole === 'driver'
              ? 'You haven\'t added any vehicles yet. Add your first vehicle to start managing your fleet.'
              : 'There are no vehicles in the system. Add the first vehicle to get started.'
            }
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="btn btn-primary flex items-center gap-2 mx-auto shadow-primary"
          >
            <Plus className="h-4 w-4" />
            Add Your First Vehicle
          </button>
        </div>
      )}

      {!loading && vehicles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary">
              Vehicle Fleet ({vehicles.length})
            </h3>
            <div className="driver-status-badge online">
              {vehicles.filter(v => v.isActive).length} Active
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="driver-vehicle-card">
                <div className={`driver-vehicle-status ${vehicle.isActive ? 'active' : 'inactive'}`}></div>

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="icon-badge icon-badge-md bg-accent-light text-accent">
                      <Car className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-light-primary dark:text-dark-primary">
                        {vehicle.brand} {vehicle.model}
                      </h4>
                      <p className="text-sm text-light-secondary dark:text-dark-secondary">
                        {vehicle.type}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-light-secondary dark:text-dark-secondary">License Plate</span>
                    <span className="font-mono text-light-primary dark:text-dark-primary">
                      {vehicle.licensePlate}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-light-secondary dark:text-dark-secondary">Capacity</span>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span className="text-light-primary dark:text-dark-primary">
                        {vehicle.capacity} seats
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-light-secondary dark:text-dark-secondary">Status</span>
                    <div className={`driver-status-badge ${vehicle.isActive ? 'online' : 'offline'}`}>
                      {vehicle.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>

                  {userRole === 'admin' && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-light-secondary dark:text-dark-secondary">Driver ID</span>
                      <span className="text-light-primary dark:text-dark-primary">
                        {vehicle.driverId || 'Unassigned'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-light dark:border-dark">
                  <button
                    onClick={() => handleOpenModal(vehicle)}
                    className="btn btn-ghost btn-sm flex items-center gap-2 flex-1"
                    title="Edit Vehicle"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(vehicle.id)}
                    className="btn btn-ghost btn-sm flex items-center gap-2 text-accent hover:bg-accent-light"
                    title="Delete Vehicle"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="driver-modal max-w-2xl w-full animate-scale-in">
            <div className="driver-modal-header">
              <div className="flex items-center gap-3">
                <div className="icon-badge icon-badge-md bg-accent-light text-accent">
                  <Car className="h-5 w-5" />
                </div>
                <div className="driver-modal-title">
                  {vehicleToEdit ? 'Edit Vehicle Details' : 'Register New Vehicle'}
                </div>
              </div>
              <button onClick={handleCloseModal} className="btn btn-ghost btn-sm p-2">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="driver-modal-body max-h-[70vh] overflow-y-auto">
              <div className="space-y-6">
                <div className="driver-form-section">
                  <div className="driver-form-title">
                    <Car className="h-5 w-5" />
                    Vehicle Information
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="brand" className="form-label">Brand</label>
                      <input
                        type="text"
                        id="brand"
                        name="brand"
                        value={formData.brand}
                        onChange={handleChange}
                        required
                        className="form-input"
                        placeholder="e.g., Toyota"
                      />
                    </div>
                    <div>
                      <label htmlFor="model" className="form-label">Model</label>
                      <input
                        type="text"
                        id="model"
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        required
                        className="form-input"
                        placeholder="e.g., Camry"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="type" className="form-label">Vehicle Type</label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                        className="form-select w-full"
                      >
                        {vehicleTypes.map(type => (
                          <option key={type} value={type.toLowerCase()}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="capacity" className="form-label">Capacity (Seats)</label>
                      <input
                        type="number"
                        id="capacity"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleChange}
                        required
                        min="1"
                        className="form-input"
                        placeholder="e.g., 4"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="licensePlate" className="form-label">License Plate</label>
                    <input
                      type="text"
                      id="licensePlate"
                      name="licensePlate"
                      value={formData.licensePlate}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="e.g., RAE 123 X"
                    />
                  </div>

                  {userRole === 'admin' && (
                    <div>
                      <label htmlFor="driverId" className="form-label">Driver ID (Optional)</label>
                      <input
                        type="text"
                        id="driverId"
                        name="driverId"
                        value={formData.driverId}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Assign Driver ID"
                      />
                    </div>
                  )}
                </div>

                <div className="driver-form-section">
                  <div className="driver-form-title">
                    <Settings className="h-5 w-5" />
                    Features & Settings
                  </div>

                  <div>
                    <label className="form-label">Vehicle Features (Optional)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {commonFeatures.map(feature => (
                        <label key={feature} className="driver-notification p-3 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              name="features"
                              value={feature}
                              checked={formData.features?.includes(feature)}
                              onChange={handleFeatureChange}
                              className="form-checkbox"
                            />
                            <span className="text-sm">{feature}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="driver-notification">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-light-primary dark:text-dark-primary mb-1">
                          Vehicle Active
                        </div>
                        <div className="text-sm text-light-secondary dark:text-dark-secondary">
                          Enable this vehicle for trip assignments
                        </div>
                      </div>
                      <label className="driver-toggle">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleChange}
                        />
                        <span className="driver-toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            <div className="driver-modal-footer">
              <button
                type="button"
                onClick={handleCloseModal}
                className="btn btn-ghost"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="vehicle-form"
                onClick={handleSubmit}
                className="btn btn-primary flex items-center gap-2 shadow-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="driver-loading-spinner w-4 h-4"></div>
                    {vehicleToEdit ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {vehicleToEdit ? 'Update Vehicle' : 'Add Vehicle'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleManagement;
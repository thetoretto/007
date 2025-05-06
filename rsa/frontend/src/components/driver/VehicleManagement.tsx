import React, { useState, useEffect } from 'react';
import useVehicleStore, { Vehicle } from '../../store/vehicleStore';
import useAuthStore from '../../store/authStore';
import { Plus, Edit, Trash2 } from 'lucide-react';

// Simple Modal Component (can be replaced with a library like react-modal or headlessui)
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

// Vehicle Form Component
interface VehicleFormProps {
  vehicleToEdit: Vehicle | null;
  onSave: (vehicleData: Omit<Vehicle, 'id' | 'driverId'> | Omit<Vehicle, 'driverId'>) => void;
  onClose: () => void;
}

const vehicleModelMap: Record<string, string[]> = {
  Toyota: ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Tacoma'],
  Ford: ['F-150', 'Escape', 'Explorer', 'Mustang', 'Ranger'],
  Honda: ['Civic', 'Accord', 'CR-V', 'Pilot', 'Odyssey'],
  Chevrolet: ['Silverado', 'Equinox', 'Traverse', 'Malibu', 'Tahoe'],
  Nissan: ['Altima', 'Sentra', 'Rogue', 'Pathfinder', 'Frontier'],
  BMW: ['3 Series', '5 Series', 'X3', 'X5', '7 Series'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'GLC', 'GLE', 'S-Class'],
  Volkswagen: ['Jetta', 'Passat', 'Tiguan', 'Atlas', 'Golf'],
  Audi: ['A4', 'A6', 'Q5', 'Q7', 'A3'],
  Hyundai: ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Palisade'],
  Kia: ['Forte', 'Optima', 'Sorento', 'Telluride', 'Sportage'],
  Other: ['Other'], // Allow 'Other' model if brand is 'Other'
};

const VehicleForm: React.FC<VehicleFormProps> = ({ vehicleToEdit, onSave, onClose }) => {
  const [type, setType] = useState<'Car' | 'Van' | 'Bus' | 'Minibus'>(vehicleToEdit?.type || 'Car');
  const vehicleBrands = Object.keys(vehicleModelMap);
  const [brand, setBrand] = useState(vehicleToEdit?.brand || vehicleBrands[0]);
  const [availableModels, setAvailableModels] = useState<string[]>(vehicleModelMap[brand] || []);
  const [model, setModel] = useState(vehicleToEdit?.model || '');
  const [licensePlate, setLicensePlate] = useState(vehicleToEdit?.licensePlate || '');
  const [capacity, setCapacity] = useState<number | string>(vehicleToEdit?.capacity || '');

  // Update available models when brand changes and handle initial/edit state
  useEffect(() => {
    let initialBrand = vehicleBrands[0];
    let initialModel = '';
    let initialAvailableModels = vehicleModelMap[initialBrand] || [];

    if (vehicleToEdit) {
      initialBrand = vehicleBrands.includes(vehicleToEdit.brand) ? vehicleToEdit.brand : 'Other';
      initialAvailableModels = vehicleModelMap[initialBrand] || [];
      // Ensure the saved model is valid for the brand, otherwise reset
      initialModel = initialAvailableModels.includes(vehicleToEdit.model) ? vehicleToEdit.model : (initialAvailableModels[0] || '');
    } else {
        initialAvailableModels = vehicleModelMap[initialBrand] || [];
        initialModel = initialAvailableModels[0] || ''; // Default to first model of default brand
    }

    setBrand(initialBrand);
    setAvailableModels(initialAvailableModels);
    setModel(initialModel);

  }, [vehicleToEdit]); // Rerun only when vehicleToEdit changes

  // Effect to update models when brand changes *after* initial load
  useEffect(() => {
    const modelsForBrand = vehicleModelMap[brand] || [];
    setAvailableModels(modelsForBrand);
    // Reset model if the current one isn't valid for the new brand, or if it's the initial load
    if (!modelsForBrand.includes(model) || !vehicleToEdit) {
        setModel(modelsForBrand[0] || ''); // Select the first available model
    }
  }, [brand]); // Rerun only when brand changes

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vehicleData = {
      type,
      brand,
      model,
      licensePlate,
      capacity: Number(capacity),
    };

    if (vehicleToEdit) {
      onSave({ ...vehicleData, id: vehicleToEdit.id });
    } else {
      onSave(vehicleData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as 'Car' | 'Van' | 'Bus' | 'Minibus')}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          required
        >
          <option value="Car">Car</option>
          <option value="Van">Van</option>
          <option value="Bus">Bus</option>
          <option value="Minibus">Minibus</option>
        </select>
      </div>
      <div>
        <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Brand</label>
        <select
          id="brand"
          value={brand}
          onChange={(e) => setBrand(e.target.value)} // This will trigger the useEffect for brand change
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          required
        >
          {vehicleBrands.map((brandName) => (
            <option key={brandName} value={brandName}>{brandName}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label>
        <select
          id="model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          required
          disabled={availableModels.length === 0} // Disable if no models available
        >
          {availableModels.length === 0 && <option value="">Select a brand first</option>}
          {availableModels.map((modelName) => (
            <option key={modelName} value={modelName}>{modelName}</option>
          ))}
        </select>
        {/* Optional: Input for 'Other' model if brand is 'Other' and model is 'Other' */}
        {/* {brand === 'Other' && model === 'Other' && (
          <input
            type="text"
            placeholder="Specify model"
            className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            // Add state and onChange handler for this input if needed
          />
        )} */}
      </div>
      <div>
        <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700">License Plate</label>
        <input
          type="text"
          id="licensePlate"
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">Capacity</label>
        <input
          type="number"
          id="capacity"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          required
          min="1"
        />
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <button type="button" onClick={onClose} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {vehicleToEdit ? 'Update Vehicle' : 'Add Vehicle'}
        </button>
      </div>
    </form>
  );
};

// Main Vehicle Management Component
const VehicleManagement: React.FC = () => {
  const { user } = useAuthStore();
  const { vehicles, fetchVehicles, addVehicle, updateVehicle, removeVehicle } = useVehicleStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchVehicles(user.id);
    }
  }, [fetchVehicles, user]);

  const handleOpenCreateModal = () => {
    setVehicleToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (vehicle: Vehicle) => {
    setVehicleToEdit(vehicle);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setVehicleToEdit(null);
  };

  const handleSaveVehicle = (vehicleData: Omit<Vehicle, 'id' | 'driverId'> | Omit<Vehicle, 'driverId'>) => {
    if (!user?.id) {
      console.error('User ID not found, cannot save vehicle.');
      alert('Error: User not logged in.');
      return;
    }

    if ('id' in vehicleData) {
      // Editing existing vehicle
      updateVehicle(vehicleData.id, vehicleData);
      alert('Vehicle updated successfully!');
    } else {
      // Adding new vehicle
      addVehicle({ ...vehicleData, driverId: user.id });
      alert('Vehicle added successfully!');
    }
    handleCloseModal();
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      removeVehicle(vehicleId);
      alert('Vehicle deleted successfully!');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Vehicles</h1>
        <button onClick={handleOpenCreateModal} className="btn btn-primary flex items-center">
          <Plus size={16} className="mr-1" /> Add Vehicle
        </button>
      </div>

      {vehicles.length === 0 ? (
        <p className="text-gray-500 text-center py-8">You haven't added any vehicles yet.</p>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {vehicles.map((vehicle) => (
              <li key={vehicle.id}>
                <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary-600 truncate">{vehicle.brand} {vehicle.model} ({vehicle.licensePlate})</p>
                    <p className="mt-1 flex items-center text-sm text-gray-500">
                      <span className="mr-2">{vehicle.type}</span> •
                      <span className="ml-2">Capacity: {vehicle.capacity}</span>
                    </p>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(vehicle)}
                      className="btn btn-secondary btn-sm p-1"
                      aria-label={`Edit ${vehicle.brand} ${vehicle.model}`}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteVehicle(vehicle.id)}
                      className="btn btn-danger btn-sm p-1"
                      aria-label={`Delete ${vehicle.brand} ${vehicle.model}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={vehicleToEdit ? 'Edit Vehicle' : 'Add New Vehicle'}
      >
        <VehicleForm
          vehicleToEdit={vehicleToEdit}
          onSave={handleSaveVehicle}
          onClose={handleCloseModal}
        />
      </Modal>
    </div>
  );
};

export default VehicleManagement;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Calendar, Clock, MapPin, Truck } from 'lucide-react';
import useDriverStore from '../../store/driverStore';

interface FormData {
  originCity: string;
  destinationCity: string;
  departureStop: string;
  pickAvailable: boolean;
  date: string;
  time: string;
  vehicle: string;
  availableSeats: number;
  notes: string;
}

// Define vehicle data with their capacities
const vehicleData = {
  car1: { name: 'Toyota Hiace', capacity: 8 },
  car2: { name: 'Toyota Coaster', capacity: 7 },
  car3: { name: 'Nissan Civilian', capacity: 6 },
  car4: { name: 'Mitsubishi Rosa', capacity: 5 },
  car5: { name: 'Toyota Land Cruiser', capacity: 4 }
};

// Filter vehicles with less than 9 seats
const eligibleVehicles = Object.entries(vehicleData)
  .filter(([_, data]) => data.capacity < 9)
  .map(([id, data]) => ({ id, name: data.name, capacity: data.capacity }));

const NewTrip: React.FC = () => {
  const navigate = useNavigate();
  const { createTrip, loading } = useDriverStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    originCity: '',
    destinationCity: '',
    departureStop: '',
    pickAvailable: false,
    date: '',
    time: '',
    vehicle: '',
    availableSeats: 0,
    notes: ''
  });
  
  // Available seat options based on selected vehicle
  const [seatOptions, setSeatOptions] = useState<number[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Update available seats when vehicle changes
    if (name === 'vehicle' && value) {
      const selectedVehicle = vehicleData[value as keyof typeof vehicleData];
      if (selectedVehicle) {
        // Generate seat options from 1 to vehicle capacity
        const maxSeats = selectedVehicle.capacity;
        const options = Array.from({ length: maxSeats }, (_, i) => i + 1);
        setSeatOptions(options);
        // Reset selected seats
        setFormData(prev => ({ ...prev, availableSeats: 0 }));
      }
    }
  };
  
  // Initialize seat options when component mounts
  useEffect(() => {
    if (formData.vehicle) {
      const selectedVehicle = vehicleData[formData.vehicle as keyof typeof vehicleData];
      if (selectedVehicle) {
        const maxSeats = selectedVehicle.capacity;
        const options = Array.from({ length: maxSeats }, (_, i) => i + 1);
        setSeatOptions(options);
      }
    }
  }, [formData.vehicle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (typeof createTrip === 'function') {
        await createTrip(formData);
        navigate('/driver/dashboard');
      } else {
        throw new Error('createTrip function is not available');
      }
    } catch (error) {
      console.error('Error creating trip:', error);
      // Show error message to user
      alert('Failed to create trip. Please try again later.');
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-full hover:bg-gray-200"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create New Trip</h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {['Route Details', 'Schedule', 'Vehicle'].map((step, index) => (
              <div
                key={step}
                className={`flex items-center ${index < 2 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep > index + 1 ? 'bg-primary-500 text-white' : currentStep === index + 1 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                >
                  {index + 1}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{step}</p>
                </div>
                {index < 2 && (
                  <div className="flex-1 ml-3">
                    <div className={`h-0.5 ${currentStep > index + 1 ? 'bg-primary-500' : 'bg-gray-200'}`} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
          {/* Step 1: Route Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Origin City */}
              <div>
                <label htmlFor="originCity" className="block text-sm font-medium text-gray-700">
                  Origin City
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="originCity"
                    name="originCity"
                    value={formData.originCity || ''}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Select origin city</option>
                    <option value="Kigali">Kigali</option>
                    <option value="Butare">Butare</option>
                    <option value="Gitarama">Gitarama</option>
                    <option value="Ruhengeri">Ruhengeri</option>
                    <option value="Gisenyi">Gisenyi</option>
                    <option value="Byumba">Byumba</option>
                    <option value="Cyangugu">Cyangugu</option>
                    <option value="Gikongoro">Gikongoro</option>
                    <option value="Kibungo">Kibungo</option>
                    <option value="Kibuye">Kibuye</option>
                    <option value="Nyanza">Nyanza</option>
                    <option value="Ruhango">Ruhango</option>
                    <option value="Rwamagana">Rwamagana</option>
                  </select>
                </div>
              </div>

              {/* Destination City */}
              <div className="mt-4">
                <label htmlFor="destinationCity" className="block text-sm font-medium text-gray-700">
                  Destination City
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="destinationCity"
                    name="destinationCity"
                    value={formData.destinationCity || ''}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Select destination city</option>
                    <option value="Kigali">Kigali</option>
                    <option value="Butare">Butare</option>
                    <option value="Gitarama">Gitarama</option>
                    <option value="Ruhengeri">Ruhengeri</option>
                    <option value="Gisenyi">Gisenyi</option>
                    <option value="Byumba">Byumba</option>
                    <option value="Cyangugu">Cyangugu</option>
                    <option value="Gikongoro">Gikongoro</option>
                    <option value="Kibungo">Kibungo</option>
                    <option value="Kibuye">Kibuye</option>
                    <option value="Nyanza">Nyanza</option>
                    <option value="Ruhango">Ruhango</option>
                    <option value="Rwamagana">Rwamagana</option>
                  </select>
                </div>
              </div>

              {/* Departure Bus Stop */}
              <div className="mt-4">
                <label htmlFor="departureStop" className="block text-sm font-medium text-gray-700">
                  Departure Bus Stop
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="departureStop"
                    name="departureStop"
                    value={formData.departureStop || ''}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Select departure bus stop</option>
                    <option value="Nyabugogo Bus Terminal">Nyabugogo Bus Terminal</option>
                    <option value="Remera Bus Stop">Remera Bus Stop</option>
                    <option value="Kimironko Bus Station">Kimironko Bus Station</option>
                    <option value="Downtown Kigali Station">Downtown Kigali Station</option>
                    <option value="Huye Bus Terminal">Huye Bus Terminal</option>
                    <option value="Musanze Bus Station">Musanze Bus Station</option>
                    <option value="Rubavu Terminal">Rubavu Terminal</option>
                    <option value="Rusizi Bus Stop">Rusizi Bus Stop</option>
                    <option value="Nyagatare Station">Nyagatare Station</option>
                    <option value="Karongi Bus Terminal">Karongi Bus Terminal</option>
                  </select>
                </div>
              </div>

              {/* Pick Available Checkbox */}
              <div className="mt-4">
                <div className="flex items-center">
                  <input
                    id="pickAvailable"
                    name="pickAvailable"
                    type="checkbox"
                    checked={formData.pickAvailable || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, pickAvailable: e.target.checked }))}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="pickAvailable" className="ml-2 block text-sm text-gray-700">
                    Pick Available
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>
          )}

          {/* Step 2: Schedule */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                  Time
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Vehicle */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="vehicle" className="block text-sm font-medium text-gray-700">
                  Vehicle
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Truck className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="vehicle"
                    name="vehicle"
                    value={formData.vehicle}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Select a vehicle</option>
                    {eligibleVehicles.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.name} ({vehicle.capacity} seats)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="availableSeats" className="block text-sm font-medium text-gray-700">
                  Available Seats
                </label>
                <div className="mt-1">
                  <select
                    id="availableSeats"
                    name="availableSeats"
                    value={formData.availableSeats}
                    onChange={handleInputChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    required
                    disabled={!formData.vehicle}
                  >
                    <option value="">Select available seats</option>
                    {seatOptions.map(num => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  {!formData.vehicle && (
                    <p className="mt-1 text-sm text-gray-500">Please select a vehicle first</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-between">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="btn btn-secondary"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </button>
            )}
            
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn btn-primary ml-auto"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-primary ml-auto"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Trip'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTrip;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../../components/common/ProgressBar';
import RouteSelection from '../../components/booking/RouteSelection';
import VehicleSelection from '../../components/booking/VehicleSelection';
import SeatSelection from '../../components/booking/SeatSelection';
import Schedule from '../../components/booking/Schedule';
import PickupAndExtras from '../../components/booking/PickupAndExtras';
import ReviewAndPayment from '../../components/booking/ReviewAndPayment';
import useBookingStore from '../../store/bookingStore';
import useAuthStore from '../../store/authStore';

const BookingPage: React.FC = () => {
  const { user } = useAuthStore();
  const { currentStep, nextStep, prevStep, goToStep, selectedRoute, selectedVehicle, selectedSeat, selectedTimeSlot } = useBookingStore();
  const navigate = useNavigate();

  const steps = [
    'Route',
    'Vehicle',
    'Seat',
    'Schedule',
    'Pickup & Extras',
    'Review & Payment',
  ];

  const totalSteps = steps.length;

  const canProceed = () => {
    switch (currentStep) {
      case 1: // Route
        return !!selectedRoute;
      case 2: // Vehicle
        return !!selectedVehicle;
      case 3: // Seat
        return !!selectedSeat;
      case 4: // Schedule
        return !!selectedTimeSlot;
      case 5: // Pickup & Extras
        return true; // No required fields in step 5
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <RouteSelection />;
      case 2:
        return <VehicleSelection />;
      case 3:
        return <SeatSelection />;
      case 4:
        return <Schedule />;
      case 5:
        return <PickupAndExtras />;
      case 6:
        return <ReviewAndPayment />;
      default:
        return <RouteSelection />;
    }
  };

  const handleNext = () => {
    // Check for login requirement at the step before payment (now step 6)
    if (currentStep === totalSteps && !user) {
      // If trying to proceed to payment without being logged in
      navigate('/login', { state: { redirectTo: '/book' } });
      return;
    }
    
    if (canProceed()) {
      nextStep();
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    prevStep();
    window.scrollTo(0, 0);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Book Your Journey</h1>
      
      <ProgressBar 
        steps={steps} 
        currentStep={currentStep} 
        onStepClick={goToStep}
      />
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
        {renderStepContent()}
      </div>
      
      <div className="mt-8 flex justify-between">
        {currentStep > 1 ? (
          <button
            onClick={handlePrev}
            className="btn btn-secondary"
          >
            Back
          </button>
        ) : (
          <div></div> // Empty div to maintain layout with flex justify-between
        )}
        
        {currentStep < totalSteps && (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`btn ${canProceed() ? 'btn-primary' : 'btn-disabled'}`}
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
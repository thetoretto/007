import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../../components/common/ProgressBar';
import RouteSelection from '../../components/booking/RouteSelection';
import VehicleSelection from '../../components/booking/VehicleSelection';
import SeatSelection from '../../components/booking/SeatSelection';
import Schedule from '../../components/booking/Schedule';
import PickupAndExtras from '../../components/booking/PickupAndExtras';
import Review from '../../components/booking/Review';
import Payment from '../../components/booking/Payment';
import useBookingStore from '../../store/bookingStore';
import useAuthStore from '../../store/authStore';

const BookingPage: React.FC = () => {
  const { user } = useAuthStore();
  const { currentStep, nextStep, prevStep, goToStep, selectedRoute, selectedVehicle, selectedSeat, selectedTimeSlot } = useBookingStore();
  const navigate = useNavigate();

  const steps = [
    'Route',
    'Schedule',
    'Vehicle',
    'Seat',
    'Review',
    { label: 'Payment', numbered: false } // Special case for last step
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!selectedRoute;
      case 2:
        return !!selectedTimeSlot;
      case 3:
        return !!selectedVehicle;
      case 4:
        return !!selectedSeat;
      case 5:
        return true; // Review validation
      case 6:
        return true; // Payment handled separately
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <RouteSelection />;
      case 2:
        return <Schedule />;
      case 3:
        return <VehicleSelection />;
      case 4:
        return <SeatSelection />;
      case 5:
        return <Review />;
      case 6:
        return <Payment />;
      default:
        return <RouteSelection />;
    }
  };

  const handleNext = () => {
    if (currentStep === 6 && !user) {
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
            className="btn btn-secondary transition-transform duration-150 ease-in-out hover:scale-105 hover:shadow-sm"
          >
            Back
          </button>
        ) : (
          <div></div>
        )}
        
        {currentStep < 6 ? (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`btn ${canProceed() ? 'btn-primary transition-transform duration-150 ease-in-out hover:scale-105 hover:shadow-sm' : 'btn-disabled'}`}
          >
            {currentStep === 5 ? 'Proceed to Payment' : 'Continue'}
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default BookingPage;

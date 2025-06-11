import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, User, ArrowRight, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import TripViewer, { Trip } from '../common/TripViewer';
import PaymentForm from '../common/PaymentForm';
import BookingConfirmation, { BookingDetails } from '../common/BookingConfirmation';


// Mock data for demonstration
const mockTrips: Trip[] = [
  {
    id: '1',
    fromLocation: 'Accra Central',
    toLocation: 'Kumasi',
    date: '2024-01-15',
    time: '08:00',
    price: 45.00,
    vehicle: {
      type: 'Bus',
      model: 'Mercedes Sprinter',
      capacity: 20,
      features: ['AC', 'WiFi', 'USB Charging']
    },
    driver: {
      name: 'Kwame Asante',
      rating: 4.8
    },
    availableSeats: 8,
    status: 'scheduled',
    duration: 240,
    distance: 250,
    startCoords: { latitude: 5.6037, longitude: -0.1870 },
    endCoords: { latitude: 6.6885, longitude: -1.6244 }
  },
  {
    id: '2',
    fromLocation: 'Accra Central',
    toLocation: 'Kumasi',
    date: '2024-01-15',
    time: '14:30',
    price: 50.00,
    vehicle: {
      type: 'Van',
      model: 'Toyota Hiace',
      capacity: 14,
      features: ['AC', 'Music System']
    },
    driver: {
      name: 'Ama Serwaa',
      rating: 4.9
    },
    availableSeats: 5,
    status: 'scheduled',
    duration: 220,
    distance: 250,
    startCoords: { latitude: 5.6037, longitude: -0.1870 },
    endCoords: { latitude: 6.6885, longitude: -1.6244 }
  }
];

export type BookingStep = 'search' | 'select' | 'passenger' | 'payment' | 'confirmation';

interface PassengerInfo {
  name: string;
  phone: string;
  email: string;
  seatPreference: string;
}

interface StreamlinedBookingProps {
  initialStep?: BookingStep;
  onClose?: () => void;
  className?: string;
}

const StreamlinedBooking: React.FC<StreamlinedBookingProps> = ({
  initialStep = 'search',
  onClose,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState<BookingStep>(initialStep);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [passengerInfo, setPassengerInfo] = useState<PassengerInfo>({
    name: '',
    phone: '',
    email: '',
    seatPreference: 'any'
  });
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState({
    from: 'Accra Central',
    to: 'Kumasi',
    date: '2024-01-15'
  });

  const steps: { key: BookingStep; title: string; description: string }[] = [
    { key: 'search', title: 'Search', description: 'Find trips' },
    { key: 'select', title: 'Select', description: 'Choose trip' },
    { key: 'passenger', title: 'Details', description: 'Passenger info' },
    { key: 'payment', title: 'Payment', description: 'Complete booking' },
    { key: 'confirmation', title: 'Done', description: 'Confirmation' }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);

  const handleTripSelect = (trip: Trip) => {
    setSelectedTrip(trip);
    setCurrentStep('passenger');
  };

  const handlePassengerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passengerInfo.name || !passengerInfo.phone) {
      showNotification('Please fill in all required fields', { body: 'Name and phone number are required' });
      return;
    }
    setCurrentStep('payment');
  };

  const handlePaymentComplete = async (paymentData: any) => {
    if (!selectedTrip) return;
    
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create booking details
      const booking: BookingDetails = {
        id: `BK${Date.now()}`,
        fromLocation: selectedTrip.fromLocation,
        toLocation: selectedTrip.toLocation,
        date: selectedTrip.date,
        time: selectedTrip.time,
        passengerName: passengerInfo.name,
        seatNumber: Math.floor(Math.random() * 20 + 1).toString(),
        seatType: passengerInfo.seatPreference,
        paymentMethod: paymentData.method,
        totalAmount: selectedTrip.price,
        confirmationCode: `GG${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      };
      
      setBookingDetails(booking);
      setCurrentStep('confirmation');
      
      showNotification('Booking Confirmed!', { 
        body: `Your trip from ${booking.fromLocation} to ${booking.toLocation} has been booked successfully.` 
      });
      
    } catch (error) {
      showNotification('Booking Failed', { body: 'Please try again or contact support.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStepNavigation = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' ? currentStepIndex + 1 : currentStepIndex - 1;
    if (newIndex >= 0 && newIndex < steps.length) {
      setCurrentStep(steps[newIndex].key);
    }
  };

  const canNavigateNext = () => {
    switch (currentStep) {
      case 'search':
        return true;
      case 'select':
        return !!selectedTrip;
      case 'passenger':
        return !!(passengerInfo.name && passengerInfo.phone);
      case 'payment':
        return false; // Payment handles its own submission
      case 'confirmation':
        return false;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'search':
      case 'select':
        return (
          <div className="space-y-6">
            {/* Search Form */}
            <div className="card p-4">
              <h3 className="text-lg font-semibold mb-4 text-text-light-primary dark:text-text-dark-primary">
                Search Trips
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-text-light-primary dark:text-text-dark-primary">
                    From
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-light-tertiary dark:text-text-dark-tertiary" />
                    <input
                      type="text"
                      value={searchCriteria.from}
                      onChange={(e) => setSearchCriteria(prev => ({ ...prev, from: e.target.value }))}
                      className="input-field pl-10"
                      placeholder="Departure city"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-text-light-primary dark:text-text-dark-primary">
                    To
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-light-tertiary dark:text-text-dark-tertiary" />
                    <input
                      type="text"
                      value={searchCriteria.to}
                      onChange={(e) => setSearchCriteria(prev => ({ ...prev, to: e.target.value }))}
                      className="input-field pl-10"
                      placeholder="Destination city"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-text-light-primary dark:text-text-dark-primary">
                    Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-light-tertiary dark:text-text-dark-tertiary" />
                    <input
                      type="date"
                      value={searchCriteria.date}
                      onChange={(e) => setSearchCriteria(prev => ({ ...prev, date: e.target.value }))}
                      className="input-field pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Trip Results */}
            <TripViewer
              trips={mockTrips}
              onTripBook={handleTripSelect}
              showFilters={false}
              compact={true}
              className="shadow-none border-0"
            />
          </div>
        );

      case 'passenger':
        return (
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4 text-text-light-primary dark:text-text-dark-primary">
              Passenger Information
            </h3>
            
            {selectedTrip && (
              <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text-light-primary dark:text-text-dark-primary">
                      {selectedTrip.fromLocation} → {selectedTrip.toLocation}
                    </p>
                    <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
                      {selectedTrip.date} at {selectedTrip.time}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">${selectedTrip.price.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handlePassengerSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-text-light-primary dark:text-text-dark-primary">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-light-tertiary dark:text-text-dark-tertiary" />
                  <input
                    type="text"
                    value={passengerInfo.name}
                    onChange={(e) => setPassengerInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field pl-10"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-text-light-primary dark:text-text-dark-primary">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={passengerInfo.phone}
                  onChange={(e) => setPassengerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="input-field"
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-text-light-primary dark:text-text-dark-primary">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={passengerInfo.email}
                  onChange={(e) => setPassengerInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="input-field"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-text-light-primary dark:text-text-dark-primary">
                  Seat Preference
                </label>
                <select
                  value={passengerInfo.seatPreference}
                  onChange={(e) => setPassengerInfo(prev => ({ ...prev, seatPreference: e.target.value }))}
                  className="input-field"
                >
                  <option value="any">Any Available Seat</option>
                  <option value="window">Window Seat</option>
                  <option value="aisle">Aisle Seat</option>
                  <option value="front">Front Section</option>
                  <option value="back">Back Section</option>
                </select>
              </div>
            </form>
          </div>
        );

      case 'payment':
        return selectedTrip ? (
          <PaymentForm
            amount={selectedTrip.price}
            onPaymentSubmit={handlePaymentComplete}
            isProcessing={isProcessing}
            showCancelButton={false}
            title="Complete Your Booking"
            className="shadow-none border-0"
          />
        ) : null;

      case 'confirmation':
        return bookingDetails ? (
          <BookingConfirmation
            bookingDetails={bookingDetails}
            onBookAnother={() => {
              setCurrentStep('search');
              setSelectedTrip(null);
              setPassengerInfo({ name: '', phone: '', email: '', seatPreference: 'any' });
              setBookingDetails(null);
            }}
            onViewBookings={() => {
              // Navigate to bookings page
              console.log('Navigate to bookings');
            }}
            className="shadow-none border-0"
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                index <= currentStepIndex
                  ? 'bg-primary border-primary text-black'
                  : 'border-border-light dark:border-border-dark text-text-light-tertiary dark:text-text-dark-tertiary'
              }`}>
                {index < currentStepIndex ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <div className="ml-3 hidden sm:block">
                <p className={`text-sm font-medium ${
                  index <= currentStepIndex
                    ? 'text-text-light-primary dark:text-text-dark-primary'
                    : 'text-text-light-tertiary dark:text-text-dark-tertiary'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-text-light-tertiary dark:text-text-dark-tertiary">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  index < currentStepIndex
                    ? 'bg-primary'
                    : 'bg-border-light dark:bg-border-dark'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[500px]">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      {currentStep !== 'confirmation' && (
        <div className="flex justify-between mt-8">
          <button
            onClick={() => handleStepNavigation('prev')}
            disabled={currentStepIndex === 0}
            className="btn btn-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </button>

          {currentStep !== 'payment' && (
            <button
              onClick={() => {
                if (currentStep === 'passenger') {
                  const form = document.querySelector('form');
                  if (form) {
                    form.requestSubmit();
                    return;
                  }
                }
                handleStepNavigation('next');
              }}
              disabled={!canNavigateNext()}
              className="btn btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </button>
          )}
        </div>
      )}

      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-text-light-tertiary dark:text-text-dark-tertiary hover:text-text-light-primary dark:hover:text-text-dark-primary transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default StreamlinedBooking;

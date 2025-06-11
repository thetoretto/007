import React, { useState } from 'react';
import { MapPin, Calendar, Clock, User, Check, X, ChevronLeft, ChevronRight, Star, Wifi, Zap, Music } from 'lucide-react';
import SeatSelector from './SeatSelector';
import UserRegistrationPrompt, { TicketDeliveryMethod } from './UserRegistrationPrompt';
import PaymentForm from '../common/PaymentForm';
import BookingConfirmation, { BookingDetails } from '../common/BookingConfirmation';
import { showNotification } from '../../utils/notifications';

// Enhanced Trip interface using mock data
interface Trip {
  id: string;
  fromLocation: string;
  toLocation: string;
  date: string;
  time: string;
  price: number;
  vehicle: {
    type: 'sedan' | 'van' | 'bus' | 'minibus';
    model: string;
    capacity: number;
    features: string[];
  };
  driver: {
    name: string;
    rating: number;
  };
  availableSeats: number;
  status: string;
  duration: number;
  distance: number;
  startCoords: { latitude: number; longitude: number };
  endCoords: { latitude: number; longitude: number };
}

// Enhanced mock trips with better design
const enhancedMockTrips: Trip[] = [
  {
    id: '1',
    fromLocation: 'Accra Central',
    toLocation: 'Kumasi',
    date: '2024-01-15',
    time: '08:00',
    price: 45.00,
    vehicle: {
      type: 'bus',
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
      type: 'van',
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
  },
  {
    id: '3',
    fromLocation: 'Accra Central',
    toLocation: 'Cape Coast',
    date: '2024-01-15',
    time: '10:00',
    price: 35.00,
    vehicle: {
      type: 'sedan',
      model: 'Toyota Corolla',
      capacity: 4,
      features: ['AC', 'Bluetooth']
    },
    driver: {
      name: 'Kofi Mensah',
      rating: 4.7
    },
    availableSeats: 3,
    status: 'scheduled',
    duration: 180,
    distance: 165,
    startCoords: { latitude: 5.6037, longitude: -0.1870 },
    endCoords: { latitude: 5.1054, longitude: -1.2466 }
  }
];

export type BookingStep = 'search' | 'select' | 'seats' | 'user' | 'payment' | 'confirmation';

interface PassengerInfo {
  name: string;
  phone: string;
  email: string;
  deliveryMethod: TicketDeliveryMethod;
  isRegistered: boolean;
}

interface EnhancedBookingProps {
  initialStep?: BookingStep;
  onClose?: () => void;
  className?: string;
}

const EnhancedBooking: React.FC<EnhancedBookingProps> = ({
  initialStep = 'search',
  onClose,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState<BookingStep>(initialStep);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengerInfo, setPassengerInfo] = useState<PassengerInfo>({
    name: '',
    phone: '',
    email: '',
    deliveryMethod: 'email',
    isRegistered: false
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
    { key: 'seats', title: 'Seats', description: 'Pick seats' },
    { key: 'user', title: 'Details', description: 'Your info' },
    { key: 'payment', title: 'Payment', description: 'Complete' },
    { key: 'confirmation', title: 'Done', description: 'Confirmed' }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);

  const handleTripSelect = (trip: Trip) => {
    setSelectedTrip(trip);
    setCurrentStep('seats');
  };

  const handleSeatSelect = (seatId: string) => {
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId);
      } else if (prev.length < 1) { // Limit to 1 seat for now
        return [...prev, seatId];
      }
      return prev;
    });
  };

  const handleSeatsConfirm = () => {
    if (selectedSeats.length > 0) {
      setCurrentStep('user');
    }
  };

  const handleUserRegistration = (deliveryMethod: TicketDeliveryMethod, contactInfo: any) => {
    setPassengerInfo({
      name: contactInfo.name,
      phone: contactInfo.phone,
      email: contactInfo.email || '',
      deliveryMethod,
      isRegistered: false
    });
    setCurrentStep('payment');
  };

  const handleUserAccountCreation = (userData: any) => {
    setPassengerInfo({
      name: userData.name,
      phone: userData.phone,
      email: userData.email,
      deliveryMethod: 'email',
      isRegistered: true
    });
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
        seatNumber: selectedSeats[0]?.replace('seat-', '') || '1A',
        seatType: 'standard',
        paymentMethod: paymentData.method,
        totalAmount: selectedTrip.price,
        confirmationCode: `GG${Math.random().toString(36).substring(2, 8).toUpperCase()}`
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
      case 'seats':
        return selectedSeats.length > 0;
      case 'user':
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
          <div className="space-y-4">
            {/* Search Form */}
            <div className="card p-4">
              <h3 className="text-lg font-semibold mb-4 text-text-light-primary dark:text-text-dark-primary">
                Search Trips
              </h3>
              <div className="space-y-3">
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
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-text-light-primary dark:text-text-dark-primary">
                Available Trips
              </h3>
              {enhancedMockTrips.map((trip) => (
                <div
                  key={trip.id}
                  className={`card p-4 border-2 transition-all duration-200 cursor-pointer ${
                    selectedTrip?.id === trip.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border-light dark:border-border-dark hover:border-primary/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-text-light-primary dark:text-text-dark-primary">
                        {trip.fromLocation} → {trip.toLocation}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-text-light-secondary dark:text-text-dark-secondary mt-1">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {trip.time}
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {trip.availableSeats} seats
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">${trip.price.toFixed(2)}</p>
                      <div className="flex items-center text-sm text-text-light-secondary dark:text-text-dark-secondary">
                        <Star className="h-3 w-3 mr-1 text-primary" />
                        {trip.driver.rating}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full">
                        {trip.vehicle.model}
                      </span>
                      <div className="flex space-x-1">
                        {trip.vehicle.features.slice(0, 2).map((feature, index) => {
                          const Icon = feature === 'AC' ? Zap : feature === 'WiFi' ? Wifi : Music;
                          return (
                            <Icon key={index} className="h-3 w-3 text-text-light-tertiary dark:text-text-dark-tertiary" />
                          );
                        })}
                      </div>
                    </div>
                    <button
                      onClick={() => handleTripSelect(trip)}
                      className="btn btn-primary btn-sm"
                    >
                      Select
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'seats':
        return selectedTrip ? (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-text-light-primary dark:text-text-dark-primary mb-2">
                Choose Your Seat
              </h3>
              <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
                {selectedTrip.fromLocation} → {selectedTrip.toLocation} • {selectedTrip.time}
              </p>
            </div>

            <SeatSelector
              vehicleType={selectedTrip.vehicle.type}
              capacity={selectedTrip.vehicle.capacity}
              selectedSeats={selectedSeats}
              onSeatSelect={handleSeatSelect}
              maxSeats={1}
              className="card"
            />
          </div>
        ) : null;

      case 'user':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-text-light-primary dark:text-text-dark-primary mb-2">
                Your Information
              </h3>
              <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
                How would you like to proceed?
              </p>
            </div>

            <UserRegistrationPrompt
              onContinueAsGuest={handleUserRegistration}
              onRegisterUser={handleUserAccountCreation}
              className="card"
            />
          </div>
        );

      case 'payment':
        return selectedTrip ? (
          <div className="space-y-4">
            <div className="card bg-primary/10 dark:bg-primary/20">
              <h3 className="font-semibold text-text-light-primary dark:text-text-dark-primary mb-2">
                Booking Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-light-secondary dark:text-text-dark-secondary">Route:</span>
                  <span className="text-text-light-primary dark:text-text-dark-primary">
                    {selectedTrip.fromLocation} → {selectedTrip.toLocation}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-light-secondary dark:text-text-dark-secondary">Date & Time:</span>
                  <span className="text-text-light-primary dark:text-text-dark-primary">
                    {selectedTrip.date} at {selectedTrip.time}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-light-secondary dark:text-text-dark-secondary">Seat:</span>
                  <span className="text-text-light-primary dark:text-text-dark-primary">
                    {selectedSeats[0]?.replace('seat-', '') || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border-light dark:border-border-dark">
                  <span className="text-text-light-primary dark:text-text-dark-primary">Total:</span>
                  <span className="text-primary">${selectedTrip.price.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <PaymentForm
              amount={selectedTrip.price}
              onPaymentSubmit={handlePaymentComplete}
              isProcessing={isProcessing}
              showCancelButton={false}
              title="Complete Your Booking"
              className="card"
            />
          </div>
        ) : null;

      case 'confirmation':
        return bookingDetails ? (
          <BookingConfirmation
            bookingDetails={bookingDetails}
            onBookAnother={() => {
              setCurrentStep('search');
              setSelectedTrip(null);
              setSelectedSeats([]);
              setPassengerInfo({
                name: '',
                phone: '',
                email: '',
                deliveryMethod: 'email',
                isRegistered: false
              });
              setBookingDetails(null);
            }}
            onViewBookings={() => {
              console.log('Navigate to bookings');
            }}
            className="border-0 shadow-none"
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-surface-light dark:bg-surface-dark ${className}`}>
      {/* Mobile-First Header */}
      <div className="bg-primary text-black p-4 flex items-center justify-between sticky top-0 z-10">
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-lg font-semibold">Book Your Trip</h1>
        <div className="w-9" /> {/* Spacer for centering */}
      </div>

      {/* Progress Steps - Mobile Optimized */}
      <div className="bg-surface-light dark:bg-surface-dark p-4 border-b border-border-light dark:border-border-dark sticky top-16 z-10">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                index <= currentStepIndex
                  ? 'bg-primary border-primary text-black'
                  : 'border-border-light dark:border-border-dark text-text-light-tertiary dark:text-text-dark-tertiary'
              }`}>
                {index < currentStepIndex ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${
                  index < currentStepIndex
                    ? 'bg-primary'
                    : 'bg-border-light dark:bg-border-dark'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 text-center">
          <p className="text-sm font-medium text-text-light-primary dark:text-text-dark-primary">
            {steps[currentStepIndex]?.title}
          </p>
          <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary">
            {steps[currentStepIndex]?.description}
          </p>
        </div>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="p-4 pb-20 max-w-4xl mx-auto">
        {renderStepContent()}
      </div>

      {/* Bottom Navigation - Fixed */}
      {currentStep !== 'confirmation' && (
        <div className="fixed bottom-0 left-0 right-0 bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark p-4 z-20">
          <div className="flex space-x-3 max-w-4xl mx-auto">
            <button
              onClick={() => handleStepNavigation('prev')}
              disabled={currentStepIndex === 0}
              className="btn btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </button>

            {currentStep !== 'payment' && (
              <button
                onClick={() => {
                  if (currentStep === 'seats') {
                    handleSeatsConfirm();
                  } else {
                    handleStepNavigation('next');
                  }
                }}
                disabled={!canNavigateNext()}
                className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedBooking;

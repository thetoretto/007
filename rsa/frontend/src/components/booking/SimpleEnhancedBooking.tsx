import React, { useState } from 'react';
import { MapPin, Calendar, Clock, User, Check, X, ChevronLeft, ChevronRight, Star, CreditCard, Phone, Mail, Download, Shield, Lock, QrCode, Share2, Printer } from 'lucide-react';
import SeatSelector from './SeatSelector';
import UserRegistrationPrompt, { TicketDeliveryMethod } from './UserRegistrationPrompt';
import { mockTrips as importedMockTrips, mockRoutes, mockVehicles, mockDrivers } from '../../utils/mockData';

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
}

// Transform mock data to our Trip interface
const transformMockTrips = (): Trip[] => {
  return importedMockTrips.map(trip => {
    const route = mockRoutes.find(r => r.id === trip.routeId);
    const vehicle = mockVehicles.find(v => v.id === trip.vehicleId);
    const driver = mockDrivers.find(d => d.id === trip.driverId);

    // Map vehicle types
    const getVehicleType = (type: string): 'sedan' | 'van' | 'bus' | 'minibus' => {
      switch (type) {
        case 'sedan': return 'sedan';
        case 'minivan':
        case 'minimpv': return 'van';
        case 'hatchback': return 'sedan';
        default: return vehicle?.capacity && vehicle.capacity > 15 ? 'bus' : 'minibus';
      }
    };

    return {
      id: trip.id,
      fromLocation: route?.origin.name || 'Unknown Origin',
      toLocation: route?.destination.name || 'Unknown Destination',
      date: new Date(trip.departureTime).toISOString().split('T')[0],
      time: new Date(trip.departureTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }),
      price: trip.pricePerSeat,
      vehicle: {
        type: getVehicleType(vehicle?.type || 'sedan'),
        model: vehicle?.model || 'Unknown Vehicle',
        capacity: vehicle?.capacity || 4,
        features: vehicle?.features || []
      },
      driver: {
        name: driver?.firstName && driver?.lastName ?
              `${driver.firstName} ${driver.lastName}` : 'Unknown Driver',
        rating: Math.random() * 1 + 4 // Random rating between 4-5
      },
      availableSeats: trip.availableSeats
    };
  });
};

// Get enhanced trips from mock data
const enhancedMockTrips: Trip[] = transformMockTrips();

export type BookingStep = 'search' | 'select' | 'seats' | 'user' | 'passenger' | 'payment' | 'confirmation';

interface SimpleEnhancedBookingProps {
  onClose?: () => void;
  className?: string;
}

const SimpleEnhancedBooking: React.FC<SimpleEnhancedBookingProps> = ({
  onClose,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState<BookingStep>('search');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [searchCriteria, setSearchCriteria] = useState({
    from: 'Downtown Station',
    to: 'Airport Terminal',
    date: '2025-06-15'
  });
  const [passengerInfo, setPassengerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    deliveryMethod: 'email' as TicketDeliveryMethod,
    isRegistered: false
  });
  const [paymentInfo, setPaymentInfo] = useState({
    method: 'credit_card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    mobileNumber: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentTime, setPaymentTime] = useState('');

  const steps = [
    { key: 'search' as BookingStep, title: 'Search', description: 'Find trips' },
    { key: 'select' as BookingStep, title: 'Select', description: 'Choose trip' },
    { key: 'seats' as BookingStep, title: 'Seats', description: 'Pick seats' },
    { key: 'user' as BookingStep, title: 'Account', description: 'Guest or Register' },
    { key: 'passenger' as BookingStep, title: 'Details', description: 'Your info' },
    { key: 'payment' as BookingStep, title: 'Payment', description: 'Complete' },
    { key: 'confirmation' as BookingStep, title: 'Done', description: 'Confirmed' }
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

  const handleStepNavigation = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' ? currentStepIndex + 1 : currentStepIndex - 1;
    if (newIndex >= 0 && newIndex < steps.length) {
      setCurrentStep(steps[newIndex].key);
    }
  };

  const handlePassengerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passengerInfo.name && passengerInfo.phone) {
      setCurrentStep('payment');
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulate payment processing with realistic delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Generate confirmation details
      const code = `GG${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const txnId = `TXN${Date.now()}${Math.random().toString(36).substring(2, 4).toUpperCase()}`;
      const currentTime = new Date().toLocaleString();

      setConfirmationCode(code);
      setTransactionId(txnId);
      setPaymentTime(currentTime);
      setBookingConfirmed(true);
      setCurrentStep('confirmation');
    } catch (error) {
      console.error('Payment failed:', error);
      // In a real app, show error message to user
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digit characters
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const validatePaymentForm = () => {
    if (paymentInfo.method === 'credit_card') {
      return !!(
        paymentInfo.cardholderName &&
        paymentInfo.cardNumber.replace(/\s/g, '').length >= 16 &&
        paymentInfo.expiryDate.length === 5 &&
        paymentInfo.cvv.length >= 3
      );
    } else if (paymentInfo.method === 'mobile_money') {
      return !!(paymentInfo.mobileNumber && paymentInfo.mobileNumber.length >= 10);
    }
    return false;
  };

  const canNavigateNext = () => {
    switch (currentStep) {
      case 'search':
      case 'select':
        return !!selectedTrip;
      case 'seats':
        return selectedSeats.length > 0;
      case 'user':
        return !!(passengerInfo.name && passengerInfo.phone);
      case 'passenger':
        return !!(passengerInfo.name && passengerInfo.phone);
      case 'payment':
        return validatePaymentForm();
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
            <div className="card p-6">
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
            <div className="space-y-4">
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
                      <span className="text-xs text-text-light-tertiary dark:text-text-dark-tertiary">
                        {trip.vehicle.features.join(', ')}
                      </span>
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
          <div className="space-y-6">
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

            {selectedSeats.length > 0 && (
              <div className="card p-4 bg-primary/10 dark:bg-primary/20">
                <h4 className="font-semibold text-text-light-primary dark:text-text-dark-primary mb-2">
                  Selected Seat
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-text-light-secondary dark:text-text-dark-secondary">
                    Seat {selectedSeats[0]?.replace('seat-', '') || 'N/A'}
                  </span>
                  <span className="font-bold text-primary">
                    ${selectedTrip.price.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : null;

      case 'user':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-text-light-primary dark:text-text-dark-primary mb-2">
                Complete Your Booking
              </h3>
              <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
                Choose how you'd like to proceed
              </p>
            </div>

            <UserRegistrationPrompt
              onContinueAsGuest={handleUserRegistration}
              onRegisterUser={handleUserAccountCreation}
              className="card"
            />
          </div>
        );

      case 'passenger':
        return (
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4 text-text-light-primary dark:text-text-dark-primary">
              Booking Summary
            </h3>

            {selectedTrip && (
              <div className="space-y-4">
                {/* Trip Summary */}
                <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-4">
                  <h4 className="font-semibold text-text-light-primary dark:text-text-dark-primary mb-3">
                    Trip Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-light-secondary dark:text-text-dark-secondary">Route:</span>
                      <span className="font-medium text-text-light-primary dark:text-text-dark-primary">
                        {selectedTrip.fromLocation} → {selectedTrip.toLocation}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-light-secondary dark:text-text-dark-secondary">Date & Time:</span>
                      <span className="font-medium text-text-light-primary dark:text-text-dark-primary">
                        {selectedTrip.date} at {selectedTrip.time}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-light-secondary dark:text-text-dark-secondary">Vehicle:</span>
                      <span className="font-medium text-text-light-primary dark:text-text-dark-primary">
                        {selectedTrip.vehicle.model}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-light-secondary dark:text-text-dark-secondary">Seat:</span>
                      <span className="font-medium text-text-light-primary dark:text-text-dark-primary">
                        {selectedSeats[0]?.replace('seat-', '') || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Passenger Summary */}
                <div className="bg-secondary/10 dark:bg-secondary/20 rounded-lg p-4">
                  <h4 className="font-semibold text-text-light-primary dark:text-text-dark-primary mb-3">
                    Passenger Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-light-secondary dark:text-text-dark-secondary">Name:</span>
                      <span className="font-medium text-text-light-primary dark:text-text-dark-primary">
                        {passengerInfo.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-light-secondary dark:text-text-dark-secondary">Phone:</span>
                      <span className="font-medium text-text-light-primary dark:text-text-dark-primary">
                        {passengerInfo.phone}
                      </span>
                    </div>
                    {passengerInfo.email && (
                      <div className="flex justify-between">
                        <span className="text-text-light-secondary dark:text-text-dark-secondary">Email:</span>
                        <span className="font-medium text-text-light-primary dark:text-text-dark-primary">
                          {passengerInfo.email}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-text-light-secondary dark:text-text-dark-secondary">Ticket Delivery:</span>
                      <span className="font-medium text-text-light-primary dark:text-text-dark-primary capitalize">
                        {passengerInfo.deliveryMethod}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-light-secondary dark:text-text-dark-secondary">Account:</span>
                      <span className="font-medium text-text-light-primary dark:text-text-dark-primary">
                        {passengerInfo.isRegistered ? 'Registered User' : 'Guest'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="border-t border-border-light dark:border-border-dark pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-text-light-primary dark:text-text-dark-primary">
                      Total Amount:
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      ${selectedTrip.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setCurrentStep('payment')}
                    className="btn btn-primary w-full"
                  >
                    Proceed to Payment
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'payment':
        return selectedTrip ? (
          <div className="space-y-6">
            {/* Booking Summary */}
            <div className="card p-6 bg-primary/10 dark:bg-primary/20">
              <h3 className="font-semibold text-text-light-primary dark:text-text-dark-primary mb-4">
                Booking Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-light-secondary dark:text-text-dark-secondary">Route:</span>
                  <span className="text-text-light-primary dark:text-text-dark-primary font-medium">
                    {selectedTrip.fromLocation} → {selectedTrip.toLocation}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-light-secondary dark:text-text-dark-secondary">Date & Time:</span>
                  <span className="text-text-light-primary dark:text-text-dark-primary font-medium">
                    {selectedTrip.date} at {selectedTrip.time}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-light-secondary dark:text-text-dark-secondary">Passenger:</span>
                  <span className="text-text-light-primary dark:text-text-dark-primary font-medium">
                    {passengerInfo.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-light-secondary dark:text-text-dark-secondary">Vehicle:</span>
                  <span className="text-text-light-primary dark:text-text-dark-primary font-medium">
                    {selectedTrip.vehicle.model}
                  </span>
                </div>
                <div className="border-t border-border-light dark:border-border-dark pt-3 mt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-text-light-primary dark:text-text-dark-primary">Total:</span>
                    <span className="text-primary">${selectedTrip.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4 text-text-light-primary dark:text-text-dark-primary">
                Payment Information
              </h3>

              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                {/* Payment Method Selection */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-text-light-primary dark:text-text-dark-primary">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => setPaymentInfo(prev => ({ ...prev, method: 'credit_card' }))}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        paymentInfo.method === 'credit_card'
                          ? 'border-primary bg-primary/5'
                          : 'border-border-light dark:border-border-dark hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <CreditCard className={`h-5 w-5 ${
                          paymentInfo.method === 'credit_card' ? 'text-primary' : 'text-text-light-tertiary dark:text-text-dark-tertiary'
                        }`} />
                        <div>
                          <p className="font-medium text-text-light-primary dark:text-text-dark-primary">Credit Card</p>
                          <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary">Visa, Mastercard, Amex</p>
                        </div>
                      </div>
                    </div>
                    <div
                      onClick={() => setPaymentInfo(prev => ({ ...prev, method: 'mobile_money' }))}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        paymentInfo.method === 'mobile_money'
                          ? 'border-primary bg-primary/5'
                          : 'border-border-light dark:border-border-dark hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Phone className={`h-5 w-5 ${
                          paymentInfo.method === 'mobile_money' ? 'text-primary' : 'text-text-light-tertiary dark:text-text-dark-tertiary'
                        }`} />
                        <div>
                          <p className="font-medium text-text-light-primary dark:text-text-dark-primary">Mobile Money</p>
                          <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary">MTN, Vodafone, AirtelTigo</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Credit Card Fields */}
                {paymentInfo.method === 'credit_card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-text-light-primary dark:text-text-dark-primary">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={paymentInfo.cardholderName}
                        onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardholderName: e.target.value }))}
                        className="input-field"
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-text-light-primary dark:text-text-dark-primary">
                        Card Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={paymentInfo.cardNumber}
                          onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardNumber: formatCardNumber(e.target.value) }))}
                          className="input-field pr-12"
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          required
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Lock className="h-4 w-4 text-text-light-tertiary dark:text-text-dark-tertiary" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-text-light-primary dark:text-text-dark-primary">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={paymentInfo.expiryDate}
                          onChange={(e) => setPaymentInfo(prev => ({ ...prev, expiryDate: formatExpiryDate(e.target.value) }))}
                          className="input-field"
                          placeholder="MM/YY"
                          maxLength={5}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-text-light-primary dark:text-text-dark-primary">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={paymentInfo.cvv}
                          onChange={(e) => setPaymentInfo(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '') }))}
                          className="input-field"
                          placeholder="123"
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Mobile Money Fields */}
                {paymentInfo.method === 'mobile_money' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-text-light-primary dark:text-text-dark-primary">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={paymentInfo.mobileNumber}
                        onChange={(e) => setPaymentInfo(prev => ({ ...prev, mobileNumber: e.target.value }))}
                        className="input-field"
                        placeholder="0XX XXX XXXX"
                        required
                      />
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Instructions:</strong> You will receive a prompt on your mobile device to authorize this payment.
                      </p>
                    </div>
                  </div>
                )}

                {/* Security Notice */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Your payment information is encrypted and secure
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isProcessing || !validatePaymentForm()}
                    className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing Payment...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Lock className="h-4 w-4" />
                        <span>Pay ${selectedTrip.price.toFixed(2)} Securely</span>
                      </div>
                    )}
                  </button>

                  {!validatePaymentForm() && (
                    <p className="text-xs text-accent mt-2 text-center">
                      Please fill in all required payment information
                    </p>
                  )}
                </div>
              </form>
            </div>
          </div>
        ) : null;

      case 'confirmation':
        return selectedTrip && bookingConfirmed ? (
          <div className="space-y-6">
            {/* Success Message */}
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-text-light-primary dark:text-text-dark-primary mb-2">
                Payment Successful!
              </h3>
              <p className="text-text-light-secondary dark:text-text-dark-secondary mb-4">
                Your trip has been successfully booked and paid for
              </p>

              {/* QR Code Placeholder */}
              <div className="inline-flex items-center justify-center w-24 h-24 bg-surface-light dark:bg-surface-dark border-2 border-dashed border-border-light dark:border-border-dark rounded-lg">
                <QrCode className="h-8 w-8 text-text-light-tertiary dark:text-text-dark-tertiary" />
              </div>
              <p className="text-xs text-text-light-tertiary dark:text-text-dark-tertiary mt-2">
                Scan QR code for quick access
              </p>
            </div>

            {/* Digital Receipt */}
            <div className="card p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary">
                  Digital Receipt
                </h4>
                <div className="text-right">
                  <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary">Receipt #</p>
                  <p className="font-mono text-sm font-bold text-text-light-primary dark:text-text-dark-primary">
                    {transactionId}
                  </p>
                </div>
              </div>

              {/* Trip Information */}
              <div className="space-y-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h5 className="font-semibold text-text-light-primary dark:text-text-dark-primary mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-primary" />
                    Trip Information
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-text-light-secondary dark:text-text-dark-secondary">From:</span>
                      <p className="font-medium text-text-light-primary dark:text-text-dark-primary">
                        {selectedTrip.fromLocation}
                      </p>
                    </div>
                    <div>
                      <span className="text-text-light-secondary dark:text-text-dark-secondary">To:</span>
                      <p className="font-medium text-text-light-primary dark:text-text-dark-primary">
                        {selectedTrip.toLocation}
                      </p>
                    </div>
                    <div>
                      <span className="text-text-light-secondary dark:text-text-dark-secondary">Date:</span>
                      <p className="font-medium text-text-light-primary dark:text-text-dark-primary">
                        {new Date(selectedTrip.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <span className="text-text-light-secondary dark:text-text-dark-secondary">Departure:</span>
                      <p className="font-medium text-text-light-primary dark:text-text-dark-primary">
                        {selectedTrip.time}
                      </p>
                    </div>
                    <div>
                      <span className="text-text-light-secondary dark:text-text-dark-secondary">Vehicle:</span>
                      <p className="font-medium text-text-light-primary dark:text-text-dark-primary">
                        {selectedTrip.vehicle.model}
                      </p>
                    </div>
                    <div>
                      <span className="text-text-light-secondary dark:text-text-dark-secondary">Seat:</span>
                      <p className="font-medium text-text-light-primary dark:text-text-dark-primary">
                        {selectedSeats[0]?.replace('seat-', '') || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-text-light-secondary dark:text-text-dark-secondary">Driver:</span>
                      <p className="font-medium text-text-light-primary dark:text-text-dark-primary">
                        {selectedTrip.driver.name} ⭐ {selectedTrip.driver.rating}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Passenger Information */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h5 className="font-semibold text-text-light-primary dark:text-text-dark-primary mb-3 flex items-center">
                    <User className="h-4 w-4 mr-2 text-primary" />
                    Passenger Details
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-text-light-secondary dark:text-text-dark-secondary">Name:</span>
                      <p className="font-medium text-text-light-primary dark:text-text-dark-primary">
                        {passengerInfo.name}
                      </p>
                    </div>
                    <div>
                      <span className="text-text-light-secondary dark:text-text-dark-secondary">Phone:</span>
                      <p className="font-medium text-text-light-primary dark:text-text-dark-primary">
                        {passengerInfo.phone}
                      </p>
                    </div>
                    {passengerInfo.email && (
                      <div>
                        <span className="text-text-light-secondary dark:text-text-dark-secondary">Email:</span>
                        <p className="font-medium text-text-light-primary dark:text-text-dark-primary">
                          {passengerInfo.email}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="text-text-light-secondary dark:text-text-dark-secondary">Ticket Delivery:</span>
                      <p className="font-medium text-text-light-primary dark:text-text-dark-primary capitalize">
                        {passengerInfo.deliveryMethod}
                      </p>
                    </div>
                    <div>
                      <span className="text-text-light-secondary dark:text-text-dark-secondary">Account Type:</span>
                      <p className="font-medium text-text-light-primary dark:text-text-dark-primary">
                        {passengerInfo.isRegistered ? 'Registered User' : 'Guest Booking'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h5 className="font-semibold text-text-light-primary dark:text-text-dark-primary mb-3 flex items-center">
                    <CreditCard className="h-4 w-4 mr-2 text-primary" />
                    Payment Details
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-text-light-secondary dark:text-text-dark-secondary">Method:</span>
                      <p className="font-medium text-text-light-primary dark:text-text-dark-primary">
                        {paymentInfo.method === 'credit_card' ? 'Credit Card' : 'Mobile Money'}
                      </p>
                    </div>
                    <div>
                      <span className="text-text-light-secondary dark:text-text-dark-secondary">Transaction ID:</span>
                      <p className="font-mono text-xs font-medium text-text-light-primary dark:text-text-dark-primary">
                        {transactionId}
                      </p>
                    </div>
                    <div>
                      <span className="text-text-light-secondary dark:text-text-dark-secondary">Payment Time:</span>
                      <p className="font-medium text-text-light-primary dark:text-text-dark-primary">
                        {paymentTime}
                      </p>
                    </div>
                    <div>
                      <span className="text-text-light-secondary dark:text-text-dark-secondary">Confirmation:</span>
                      <p className="font-mono font-bold text-primary">
                        {confirmationCode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="border-t-2 border-primary/20 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-text-light-primary dark:text-text-dark-primary">
                    Total Amount Paid:
                  </span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${selectedTrip.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary mt-1">
                  Payment processed successfully
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              {/* Primary Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    // Reset booking state
                    setCurrentStep('search');
                    setSelectedTrip(null);
                    setSelectedSeats([]);
                    setPassengerInfo({ name: '', phone: '', email: '', deliveryMethod: 'email', isRegistered: false });
                    setPaymentInfo({
                      method: 'credit_card',
                      cardNumber: '',
                      expiryDate: '',
                      cvv: '',
                      cardholderName: '',
                      mobileNumber: ''
                    });
                    setBookingConfirmed(false);
                    setConfirmationCode('');
                    setTransactionId('');
                    setPaymentTime('');
                  }}
                  className="btn btn-primary flex items-center justify-center space-x-2"
                >
                  <MapPin className="h-4 w-4" />
                  <span>Book Another Trip</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="btn btn-secondary flex items-center justify-center space-x-2"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Receipt</span>
                </button>
              </div>

              {/* Secondary Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    // Create downloadable ticket image
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx || !selectedTrip) return;

                    // Set canvas size
                    canvas.width = 800;
                    canvas.height = 1000;

                    // Background gradient
                    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                    gradient.addColorStop(0, '#FEE47B'); // Primary color
                    gradient.addColorStop(1, '#F3F4F6'); // Light gray
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // Header
                    ctx.fillStyle = '#000000';
                    ctx.font = 'bold 32px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('RSA TRAVEL TICKET', canvas.width / 2, 60);

                    // Ticket border
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(50, 100, canvas.width - 100, canvas.height - 200);

                    // Ticket content
                    ctx.fillStyle = '#000000';
                    ctx.font = '24px Arial';
                    ctx.textAlign = 'left';

                    let y = 160;
                    const lineHeight = 40;

                    // Trip details
                    ctx.fillText(`From: ${selectedTrip.fromLocation}`, 80, y);
                    y += lineHeight;
                    ctx.fillText(`To: ${selectedTrip.toLocation}`, 80, y);
                    y += lineHeight;
                    ctx.fillText(`Date: ${new Date(selectedTrip.date).toLocaleDateString()}`, 80, y);
                    y += lineHeight;
                    ctx.fillText(`Time: ${selectedTrip.time}`, 80, y);
                    y += lineHeight;
                    ctx.fillText(`Vehicle: ${selectedTrip.vehicle.model}`, 80, y);
                    y += lineHeight;
                    ctx.fillText(`Seat: ${selectedSeats[0]?.replace('seat-', '') || 'N/A'}`, 80, y);
                    y += lineHeight * 1.5;

                    // Passenger details
                    ctx.fillText(`Passenger: ${passengerInfo.name}`, 80, y);
                    y += lineHeight;
                    ctx.fillText(`Phone: ${passengerInfo.phone}`, 80, y);
                    y += lineHeight * 1.5;

                    // Payment details
                    ctx.fillText(`Amount Paid: $${selectedTrip.price.toFixed(2)}`, 80, y);
                    y += lineHeight;
                    ctx.fillText(`Payment Time: ${paymentTime}`, 80, y);
                    y += lineHeight * 1.5;

                    // Confirmation details
                    ctx.font = 'bold 28px Arial';
                    ctx.fillText(`Confirmation: ${confirmationCode}`, 80, y);
                    y += lineHeight;
                    ctx.font = '20px Arial';
                    ctx.fillText(`Transaction ID: ${transactionId}`, 80, y);
                    y += lineHeight * 2;

                    // QR Code placeholder
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(canvas.width / 2 - 75, y, 150, 150);
                    ctx.font = '16px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('QR CODE', canvas.width / 2, y + 80);

                    // Footer
                    ctx.font = '16px Arial';
                    ctx.fillText('Please arrive 15 minutes before departure', canvas.width / 2, canvas.height - 80);
                    ctx.fillText('Thank you for choosing RSA Travel!', canvas.width / 2, canvas.height - 50);

                    // Download the image
                    canvas.toBlob((blob) => {
                      if (blob) {
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `ticket-${confirmationCode}.png`;
                        link.click();
                        URL.revokeObjectURL(url);
                      }
                    }, 'image/png');
                  }}
                  className="btn btn-secondary flex items-center justify-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Ticket</span>
                </button>

                <button
                  onClick={() => {
                    if (passengerInfo.deliveryMethod === 'email' && passengerInfo.email) {
                      // Simulate email sending
                      alert(`✅ Ticket sent to ${passengerInfo.email}`);
                    } else if (passengerInfo.deliveryMethod === 'whatsapp' && passengerInfo.phone) {
                      // Simulate WhatsApp sending
                      alert(`✅ Ticket sent to WhatsApp: ${passengerInfo.phone}`);
                    } else if (passengerInfo.deliveryMethod === 'sms' && passengerInfo.phone) {
                      // Simulate SMS sending
                      alert(`✅ Ticket sent via SMS to: ${passengerInfo.phone}`);
                    } else if (passengerInfo.deliveryMethod === 'download') {
                      alert('✅ Ticket is ready for download above');
                    } else {
                      alert('❌ No delivery method configured');
                    }
                  }}
                  className="btn btn-secondary flex items-center justify-center space-x-2"
                >
                  {passengerInfo.deliveryMethod === 'whatsapp' ? (
                    <>
                      <Phone className="h-4 w-4" />
                      <span>WhatsApp</span>
                    </>
                  ) : passengerInfo.deliveryMethod === 'sms' ? (
                    <>
                      <Phone className="h-4 w-4" />
                      <span>SMS</span>
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    // Share receipt details
                    const shareText = `🎫 Trip Booked!\n\n📍 ${selectedTrip?.fromLocation} → ${selectedTrip?.toLocation}\n📅 ${selectedTrip?.date} at ${selectedTrip?.time}\n🎟️ Confirmation: ${confirmationCode}\n💰 Amount: $${selectedTrip?.price.toFixed(2)}`;

                    if (navigator.share) {
                      navigator.share({
                        title: 'Trip Booking Confirmation',
                        text: shareText
                      });
                    } else {
                      // Fallback: copy to clipboard
                      navigator.clipboard.writeText(shareText).then(() => {
                        alert('Booking details copied to clipboard!');
                      });
                    }
                  }}
                  className="btn btn-secondary flex items-center justify-center space-x-2"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
              </div>

              {/* Important Notice */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h6 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Important Information
                </h6>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Please arrive at the departure point 15 minutes early</li>
                  <li>• Keep your confirmation code ready for verification</li>
                  <li>• Contact support if you need to make changes: +233 XX XXX XXXX</li>
                  <li>• Cancellation policy: Free cancellation up to 2 hours before departure</li>
                  {passengerInfo.deliveryMethod === 'whatsapp' && (
                    <li>• Your ticket will be sent to your WhatsApp: {passengerInfo.phone}</li>
                  )}
                  {passengerInfo.deliveryMethod === 'sms' && (
                    <li>• Your ticket will be sent via SMS to: {passengerInfo.phone}</li>
                  )}
                  {passengerInfo.deliveryMethod === 'email' && passengerInfo.email && (
                    <li>• Your ticket will be sent to your email: {passengerInfo.email}</li>
                  )}
                  {passengerInfo.deliveryMethod === 'download' && (
                    <li>• Your ticket is available for download above</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-surface-light dark:bg-surface-dark ${className}`}>
      {/* Header */}
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
        <div className="w-9" />
      </div>

      {/* Progress Steps */}
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

      {/* Main Content */}
      <div className="p-4 pb-20 max-w-4xl mx-auto">
        {renderStepContent()}
      </div>

      {/* Bottom Navigation */}
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

            {currentStep !== 'payment' && currentStep !== 'user' && currentStep !== 'passenger' && (
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
                {currentStep === 'seats' ? 'Continue with Selected Seat' : 'Next'}
                <ChevronRight className="h-4 w-4 ml-2" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleEnhancedBooking;

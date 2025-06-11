import React, { useState } from 'react';
import { CreditCard, Calendar, Check, Info, Shield, X } from 'lucide-react';


interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'applepay' | 'googlepay';
  name: string;
  last4?: string;
  expiryDate?: string;
  icon: React.ReactNode;
}

interface Seat {
  id: string;
  number: string;
  price: number;
  type: 'standard' | 'premium' | 'vip' | 'accessible';
}

interface Trip {
  id: string;
  fromLocation: string;
  toLocation: string;
  date: string;
  time: string;
  price: number;
}

interface PaymentConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  trip?: Trip | null;
  seats?: Seat[];
  onAddPaymentMethod?: () => void;
}

const PaymentConfirmation: React.FC<PaymentConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  trip = null,
  seats = [],
  onAddPaymentMethod
}) => {
  // Mock payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card-1',
      type: 'card',
      name: 'Visa ending in 4242',
      last4: '4242',
      expiryDate: '12/25',
      icon: <CreditCard className="h-5 w-5 text-primary-800 dark:text-primary-200" />
    },
    {
      id: 'card-2',
      type: 'card',
      name: 'Mastercard ending in 8888',
      last4: '8888',
      expiryDate: '09/24',
      icon: <CreditCard className="h-5 w-5 text-error" />
    }
  ];

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(paymentMethods[0].id);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const calculateTotal = () => {
    let total = 0;
    
    // Add trip price if trip is selected
    if (trip) {
      total += trip.price;
    }
    
    // Add seat prices if seats are selected
    if (seats && seats.length > 0) {
      total += seats.reduce((sum, seat) => sum + seat.price, 0);
    }
    
    // Add fees
    const serviceFee = total * 0.05; // 5% service fee
    const platformFee = 1.99;
    
    return {
      subtotal: total,
      serviceFee,
      platformFee,
      total: total + serviceFee + platformFee
    };
  };

  const pricing = calculateTotal();

  const handlePaymentSubmit = () => {
    setIsProcessing(true);
    setError(null);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      
      // Simulate successful payment
      showNotification(
        'Payment Successful!',
        { 
          body: `Your payment of $${pricing.total.toFixed(2)} has been processed successfully.`
        }
      );
      
      onConfirm();
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 overflow-auto">
      <div className="w-full max-w-2xl bg-light dark:bg-section-dark rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-primary dark:bg-primary text-black flex justify-between items-center">
          <h2 className="text-xl font-semibold">Complete Your Payment</h2>
          <button
            onClick={onClose}
            className="text-black hover:text-gray-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4 sm:p-6">
          {/* Order summary */}
          <div className="mb-5 sm:mb-6">
            <h3 className="text-lg font-medium mb-2 sm:mb-3 text-black dark:text-dark-primary">Order Summary</h3>
            <div className="bg-gray-50 dark:bg-dark rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-primary-900 max-h-[40vh] sm:max-h-[50vh] overflow-y-auto">
              {trip && (
                <div className="mb-3 sm:mb-4 pb-3 border-b border-gray-200 dark:border-primary-900">
                  <h4 className="font-medium mb-1.5 sm:mb-2 text-sm sm:text-base text-light-primary dark:text-dark-primary">Trip Details</h4>
                  <div className="text-xs sm:text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">From:</span>
                      <span className="font-medium text-light-primary dark:text-dark-primary">{trip.fromLocation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">To:</span>
                      <span className="font-medium text-light-primary dark:text-dark-primary">{trip.toLocation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Date & Time:</span>
                      <span className="font-medium text-light-primary dark:text-dark-primary">{new Date(trip.date).toLocaleDateString()} at {trip.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Trip Price:</span>
                      <span className="font-medium text-light-primary dark:text-dark-primary">${trip.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {seats && seats.length > 0 && (
                <div className="mb-3 sm:mb-4 pb-3 border-b border-gray-200 dark:border-primary-900">
                  <h4 className="font-medium mb-1.5 sm:mb-2 text-sm sm:text-base text-light-primary dark:text-dark-primary">Selected Seats</h4>
                  <div className="text-xs sm:text-sm space-y-1">
                    {seats.map(seat => (
                      <div key={seat.id} className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Seat {seat.number} ({seat.type})</span>
                        <span className="font-medium text-light-primary dark:text-dark-primary">${seat.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="font-medium mb-1.5 sm:mb-2 text-sm sm:text-base text-text-base dark:text-text-inverse">Price Breakdown</h4>
                <div className="text-xs sm:text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="text-text-base dark:text-text-inverse">${pricing.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Service Fee:</span>
                    <span className="text-text-base dark:text-text-inverse">${pricing.serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Platform Fee:</span>
                    <span className="text-text-base dark:text-text-inverse">${pricing.platformFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-base pt-1 border-t border-gray-200 dark:border-primary-900 mt-1">
                    <span className="text-text-base dark:text-text-inverse">Total:</span>
                    <span className="text-text-base dark:text-text-inverse">${pricing.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Payment methods */}
          <div className="mb-5 sm:mb-6">
            <h3 className="text-lg font-medium mb-2 sm:mb-3 text-accent-black dark:text-text-inverse">Payment Method</h3>
            <div className="space-y-2 sm:space-y-3">
              {paymentMethods.map(method => (
                <div 
                  key={method.id}
                  className={`flex items-center p-2.5 sm:p-3 border dark:border-primary-900 rounded-lg cursor-pointer transition-colors ${selectedPaymentMethod === method.id ? 'border-primary-800 bg-primary-100 dark:border-primary-200 dark:bg-primary-900 dark:bg-opacity-30' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                  onClick={() => setSelectedPaymentMethod(method.id)}
                >
                  <div className="mr-2 sm:mr-3">
                    {method.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm sm:text-base text-text-base dark:text-text-inverse">{method.name}</div>
                    {method.expiryDate && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Expires {method.expiryDate}
                      </div>
                    )}
                  </div>
                  {selectedPaymentMethod === method.id && (
                    <div className="h-5 w-5 bg-primary-800 dark:bg-primary-200 rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-white dark:text-text-base" />
                    </div>
                  )}
                </div>
              ))}
              
              <button 
                className="flex items-center p-2.5 sm:p-3 border border-dashed dark:border-primary-900 rounded-lg text-primary-800 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-gray-800 w-full transition-colors"
                onClick={onAddPaymentMethod}
              >
                <div className="mx-auto flex items-center text-sm sm:text-base">
                  <CreditCard className="h-4 sm:h-5 w-4 sm:w-5 mr-2" />
                  Add Payment Method
                </div>
              </button>
            </div>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-error bg-opacity-10 dark:bg-opacity-20 border-l-4 border-error text-error dark:text-red-400 text-sm">
              <div className="flex">
                <Info className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
            </div>
          )}
          
          {/* Security notice */}
          <div className="mb-5 sm:mb-6 text-xs text-gray-500 dark:text-gray-400 flex items-center">
            <Shield className="h-3.5 sm:h-4 w-3.5 sm:w-4 mr-1 text-success" />
            Your payment is secured with 256-bit SSL encryption
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-primary-900 rounded-md shadow-sm text-xs sm:text-sm font-medium text-text-base dark:text-text-inverse bg-background-light dark:bg-section-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePaymentSubmit}
              className="btn btn-secondary sm:w-auto px-4 py-2 sm:py-2.5 rounded-md shadow-sm text-xs sm:text-sm font-medium text-text-base bg-primary hover:bg-primary-800 dark:bg-primary dark:text-text-base dark:hover:bg-primary-800 flex items-center justify-center transition-colors"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-text-base dark:text-text-base" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>Pay ${pricing.total.toFixed(2)}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation; 
import React, { useState } from 'react';
import { CheckCircle, Clock, Calendar, MapPin, Users, CreditCard, TruckIcon } from 'lucide-react';
import useBookingStore from '../../store/bookingStore';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const ReviewAndPayment: React.FC = () => {
  const navigate = useNavigate();
  const {
    selectedRoute,
    selectedVehicle,
    selectedSeat,
    selectedTimeSlot,
    doorstepPickup,
    pickupAddress,
    selectedExtras,
    baseFare,
    fees,
    extrasTotal,
    discount,
    total,
    applyDiscount,
    completeBooking,
    loading,
    error,
    isComplete,
    bookingId,
  } = useBookingStore();
  
  const { user } = useAuthStore();
  const [discountCode, setDiscountCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit');

  if (!selectedRoute || !selectedVehicle || !selectedSeat || !selectedTimeSlot) {
    return (
      <div className="p-4 bg-warning-50 text-warning-700 rounded-md">
        <p>Please complete all previous steps before proceeding to review.</p>
      </div>
    );
  }

  const handleApplyDiscount = () => {
    if (discountCode.trim()) {
      applyDiscount(discountCode.trim());
    }
  };

  const handlePayment = async () => {
    try {
      await completeBooking();
      // Navigate to success page or show success message
    } catch (error) {
      // Error is handled by the store
    }
  };

  if (isComplete && bookingId) {
    return (
      <div className="animate-fade-in text-center">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-success-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-4">Your booking has been successfully processed.</p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-gray-700 font-medium">Booking Reference: <span className="font-bold text-primary-600">{bookingId}</span></p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 w-full max-w-md">
            <button
              onClick={() => navigate('/passenger/trips')}
              className="btn btn-primary flex-1"
            >
              View My Trips
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn btn-secondary flex-1"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-semibold mb-6">Review & Payment</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-medium">Trip Summary</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Route</p>
                  <p className="font-medium">{selectedRoute.name}</p>
                  <div className="text-sm text-gray-600 mt-1">
                    <p>{selectedRoute.origin.name} to {selectedRoute.destination.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedRoute.distance} miles • ~{selectedRoute.duration} min
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{selectedTimeSlot.date}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium">{selectedTimeSlot.time}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Users className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Vehicle & Seat</p>
                  <p className="font-medium">{selectedVehicle.model}</p>
                  <p className="text-sm text-gray-600">Seat {selectedSeat.number}</p>
                </div>
              </div>
              
              {doorstepPickup && (
                <div className="flex items-start">
                  <TruckIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Doorstep Pickup</p>
                    <p className="font-medium">{pickupAddress || 'Address not provided'}</p>
                  </div>
                </div>
              )}
              
              {selectedExtras.length > 0 && (
                <div className="pt-3 mt-3 border-t border-gray-100">
                  <p className="text-sm font-medium mb-2">Selected Extras</p>
                  <ul className="space-y-2">
                    {selectedExtras.map(item => (
                      <li key={item.extra.id} className="flex justify-between text-sm">
                        <span>
                          {item.extra.name} 
                          {item.quantity > 1 && <span> x{item.quantity}</span>}
                        </span>
                        <span className="font-medium">
                          ${(item.extra.price * item.quantity).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-medium">Apply Discount</h3>
            </div>
            <div className="p-4">
              <div className="flex">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="Enter discount code"
                  className="form-input rounded-r-none"
                  disabled={loading}
                />
                <button
                  onClick={handleApplyDiscount}
                  disabled={loading || !discountCode.trim()}
                  className={`px-4 py-2 rounded-l-none rounded-r-md border border-l-0 border-gray-300 
                    ${
                      loading || !discountCode.trim()
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                    }
                  `}
                >
                  {loading ? <LoadingSpinner size="small" /> : 'Apply'}
                </button>
              </div>
              {error && (
                <p className="mt-2 text-sm text-error-600">{error}</p>
              )}
              {discount > 0 && (
                <p className="mt-2 text-sm text-success-600">
                  Discount of ${discount.toFixed(2)} applied!
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-medium">Price Breakdown</h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base fare</span>
                  <span className="font-medium">${baseFare.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service fee</span>
                  <span className="font-medium">${fees.toFixed(2)}</span>
                </div>
                {doorstepPickup && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Doorstep pickup</span>
                    <span className="font-medium">$5.00</span>
                  </div>
                )}
                {extrasTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Extras</span>
                    <span className="font-medium">${extrasTotal.toFixed(2)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-success-600">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-3 mt-2 border-t border-gray-100 flex justify-between">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-lg">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-medium">Payment Method</h3>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="credit"
                    name="paymentMethod"
                    type="radio"
                    checked={paymentMethod === 'credit'}
                    onChange={() => setPaymentMethod('credit')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <label htmlFor="credit" className="ml-3 flex items-center">
                    <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                    <span>Credit / Debit Card</span>
                  </label>
                </div>
                
                {paymentMethod === 'credit' && (
                  <div className="ml-7 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500 mb-2">
                      For demonstration purposes, no actual payment will be processed.
                    </p>
                    <p className="text-xs text-gray-400">
                      In a real application, this would include secure credit card input fields.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-primary-50 p-4 rounded-lg border border-primary-100 mb-6">
            <p className="text-sm text-primary-800">
              By proceeding with the payment, you agree to our{' '}
              <a href="#" className="text-primary-600 underline">Terms of Service</a> and{' '}
              <a href="#" className="text-primary-600 underline">Cancellation Policy</a>.
            </p>
          </div>
          
          <button
            onClick={handlePayment}
            disabled={loading}
            className={`w-full btn ${loading ? 'btn-disabled' : 'btn-primary'}`}
          >
            {loading ? <LoadingSpinner size="small" color="white" /> : 'Complete Booking'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewAndPayment;
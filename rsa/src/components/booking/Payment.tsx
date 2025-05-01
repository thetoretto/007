import React, { useState } from 'react';
import { CreditCard, CheckCircle } from 'lucide-react';
import useBookingStore from '../../store/bookingStore';
import LoadingSpinner from '../common/LoadingSpinner';

const Payment: React.FC = () => {
  const {
    total,
    loading,
    error,
    completeBooking,
    isComplete,
    bookingId
  } = useBookingStore();

  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await completeBooking();
  };

  if (isComplete && bookingId) {
    return (
      <div className="animate-fade-in text-center py-8">
        <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-10 w-10 text-success-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-4">Your booking has been confirmed.</p>
        <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto mb-6">
          <p className="text-gray-700">
            Booking Reference: <span className="font-bold text-primary-600">{bookingId}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-lg mx-auto">
      <div className="flex items-center mb-6">
        <CreditCard className="h-6 w-6 text-primary-500 mr-2" />
        <h2 className="text-xl font-semibold">Payment Details</h2>
      </div>

      <div className="bg-primary-50 p-4 rounded-lg mb-6">
        <p className="text-primary-700 font-medium">Total Amount: ${total.toFixed(2)}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Cardholder Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
            placeholder="John Doe"
            required
          />
        </div>

        <div>
          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Card Number
          </label>
          <input
            type="text"
            id="cardNumber"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
            className="form-input"
            placeholder="1234 5678 9012 3456"
            required
            maxLength={16}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date
            </label>
            <input
              type="text"
              id="expiry"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="form-input"
              placeholder="MM/YY"
              required
            />
          </div>

          <div>
            <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
              CVV
            </label>
            <input
              type="text"
              id="cvv"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
              className="form-input"
              placeholder="123"
              required
              maxLength={3}
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-error-50 text-error-700 rounded-md">
            <p>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full btn ${
            loading ? 'btn-disabled' : 'btn-primary'
          } transition-transform duration-150 ease-in-out hover:scale-[1.02]`}
        >
          {loading ? (
            <LoadingSpinner size="small" color="white" />
          ) : (
            `Pay $${total.toFixed(2)}`
          )}
        </button>

        <p className="text-sm text-gray-500 text-center mt-4">
          This is a demo payment form. No actual charges will be made.
        </p>
      </form>
    </div>
  );
};

export default Payment;
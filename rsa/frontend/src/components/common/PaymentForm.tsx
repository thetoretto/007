import React, { useState } from 'react';
import { CreditCard, Smartphone, Wallet, Check } from 'lucide-react';

export type PaymentMethod = 'airtel' | 'momo' | 'card' | null;

interface CardDetails {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}

interface MobileMoneyDetails {
  phoneNumber: string;
  fullName: string;
}

interface PaymentFormProps {
  onComplete: (data: {
    method: PaymentMethod;
    details: CardDetails | MobileMoneyDetails | null;
  }) => void;
  amount: number;
  isProcessing: boolean;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  onComplete,
  amount,
  isProcessing,
  onCancel
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [mobileDetails, setMobileDetails] = useState<MobileMoneyDetails>({
    phoneNumber: '',
    fullName: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateCardDetails = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!cardDetails.number.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(cardDetails.number.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }
    
    if (!cardDetails.name.trim()) {
      newErrors.cardName = 'Cardholder name is required';
    }
    
    if (!cardDetails.expiry.trim()) {
      newErrors.cardExpiry = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
      newErrors.cardExpiry = 'Expiry date format should be MM/YY';
    }
    
    if (!cardDetails.cvv.trim()) {
      newErrors.cardCvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
      newErrors.cardCvv = 'CVV must be 3 or 4 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateMobileDetails = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!mobileDetails.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10,12}$/.test(mobileDetails.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Enter a valid phone number';
    }
    
    if (!mobileDetails.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleMobileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMobileDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    let isValid = false;
    
    if (selectedMethod === 'card') {
      isValid = validateCardDetails();
      if (isValid) {
        onComplete({
          method: 'card',
          details: cardDetails
        });
      }
    } else if (selectedMethod === 'airtel' || selectedMethod === 'momo') {
      isValid = validateMobileDetails();
      if (isValid) {
        onComplete({
          method: selectedMethod,
          details: mobileDetails
        });
      }
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCardNumber(e.target.value);
    setCardDetails(prev => ({ ...prev, number: formattedValue }));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { value } = e.target;
    value = value.replace(/\D/g, '');
    
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
    }
    
    setCardDetails(prev => ({ ...prev, expiry: value }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
      
      {/* Payment method selection */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <button
          type="button"
          onClick={() => setSelectedMethod('airtel')}
          className={`p-4 border rounded-lg flex flex-col items-center justify-center transition-all ${
            selectedMethod === 'airtel' 
              ? 'border-accent-kente-gold bg-accent-kente-gold/10' 
              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          disabled={isProcessing}
        >
          <div className="w-12 h-12 flex items-center justify-center bg-red-100 dark:bg-red-900/30 rounded-full mb-2">
            <Smartphone className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <span className="font-medium">Airtel Money</span>
        </button>
        
        <button
          type="button"
          onClick={() => setSelectedMethod('momo')}
          className={`p-4 border rounded-lg flex flex-col items-center justify-center transition-all ${
            selectedMethod === 'momo' 
              ? 'border-accent-kente-gold bg-accent-kente-gold/10' 
              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          disabled={isProcessing}
        >
          <div className="w-12 h-12 flex items-center justify-center bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-2">
            <Wallet className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <span className="font-medium">MoMo</span>
        </button>
        
        <button
          type="button"
          onClick={() => setSelectedMethod('card')}
          className={`p-4 border rounded-lg flex flex-col items-center justify-center transition-all ${
            selectedMethod === 'card' 
              ? 'border-accent-kente-gold bg-accent-kente-gold/10' 
              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          disabled={isProcessing}
        >
          <div className="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-full mb-2">
            <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="font-medium">Card</span>
        </button>
      </div>
      
      {/* Mobile Money Payment Form (Airtel or MoMo) */}
      {(selectedMethod === 'airtel' || selectedMethod === 'momo') && (
        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={mobileDetails.phoneNumber}
              onChange={handleMobileInputChange}
              placeholder="Enter phone number"
              className={`w-full p-3 border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-700`}
              disabled={isProcessing}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              You'll receive a prompt on your phone to confirm payment
            </p>
          </div>
          
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={mobileDetails.fullName}
              onChange={handleMobileInputChange}
              placeholder="Enter account holder's name"
              className={`w-full p-3 border ${errors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-700`}
              disabled={isProcessing}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
            )}
          </div>
        </div>
      )}
      
      {/* Credit Card Payment Form */}
      {selectedMethod === 'card' && (
        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="number" className="block text-sm font-medium mb-1">
              Card Number
            </label>
            <input
              type="text"
              id="number"
              name="number"
              value={cardDetails.number}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className={`w-full p-3 border ${errors.cardNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-700`}
              disabled={isProcessing}
            />
            {errors.cardNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.cardNumber}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Cardholder Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={cardDetails.name}
              onChange={handleCardInputChange}
              placeholder="John Doe"
              className={`w-full p-3 border ${errors.cardName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-700`}
              disabled={isProcessing}
            />
            {errors.cardName && (
              <p className="mt-1 text-sm text-red-500">{errors.cardName}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expiry" className="block text-sm font-medium mb-1">
                Expiry Date
              </label>
              <input
                type="text"
                id="expiry"
                name="expiry"
                value={cardDetails.expiry}
                onChange={handleExpiryChange}
                placeholder="MM/YY"
                maxLength={5}
                className={`w-full p-3 border ${errors.cardExpiry ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-700`}
                disabled={isProcessing}
              />
              {errors.cardExpiry && (
                <p className="mt-1 text-sm text-red-500">{errors.cardExpiry}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="cvv" className="block text-sm font-medium mb-1">
                CVV
              </label>
              <input
                type="text"
                id="cvv"
                name="cvv"
                value={cardDetails.cvv}
                onChange={handleCardInputChange}
                placeholder="123"
                maxLength={4}
                className={`w-full p-3 border ${errors.cardCvv ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-700`}
                disabled={isProcessing}
              />
              {errors.cardCvv && (
                <p className="mt-1 text-sm text-red-500">{errors.cardCvv}</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Payment Summary */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center font-medium">
          <span>Total Amount:</span>
          <span className="text-lg text-accent-kente-gold">${amount.toFixed(2)}</span>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg font-medium"
          disabled={isProcessing}
        >
          Back
        </button>
        
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedMethod || isProcessing}
          className={`flex-1 py-3 px-4 rounded-lg font-medium text-white relative ${
            selectedMethod && !isProcessing
              ? 'bg-accent-kente-gold hover:bg-accent-kente-gold-dark' 
              : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
          }`}
        >
          {isProcessing ? (
            <>
              <span className="opacity-0">Pay ${amount.toFixed(2)}</span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            </>
          ) : (
            <>Pay ${amount.toFixed(2)}</>
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentForm; 
import React, { useState, useEffect } from 'react';
import { CreditCard, Smartphone, Wallet, Check, AlertCircle, ArrowLeft, Info } from 'lucide-react';

export type PaymentMethod = 'airtel' | 'momo' | 'card' | null;

export interface CardDetails {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}

export interface MobileMoneyDetails {
  phoneNumber: string;
  fullName: string;
}

export interface PaymentFormProps {
  onComplete: (data: {
    method: PaymentMethod;
    details: CardDetails | MobileMoneyDetails | null;
  }) => void;
  amount: number;
  isProcessing?: boolean;
  onCancel: () => void;
  defaultMethod?: PaymentMethod;
  availableMethods?: PaymentMethod[];
  currency?: string;
  title?: string;
  cardLabel?: string;
  airtelLabel?: string;
  momoLabel?: string;
  cancelLabel?: string;
  payLabel?: string;
  className?: string;
  showProcessingIndicator?: boolean;
  showTotalAmount?: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  onComplete,
  amount,
  isProcessing = false,
  onCancel,
  defaultMethod = null,
  availableMethods = ['airtel', 'momo', 'card'],
  currency = '$',
  title = 'Payment Method',
  cardLabel = 'Card',
  airtelLabel = 'Airtel Money',
  momoLabel = 'MoMo',
  cancelLabel = 'Back',
  payLabel = 'Pay',
  className = '',
  showProcessingIndicator = true,
  showTotalAmount = true
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(defaultMethod);
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
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Update selected method when defaultMethod changes
  useEffect(() => {
    if (defaultMethod && availableMethods.includes(defaultMethod)) {
      setSelectedMethod(defaultMethod);
    }
  }, [defaultMethod, availableMethods]);

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
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Live validation for better UX
    if (touched[name]) {
      validateCardDetails();
    }
  };

  const handleMobileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMobileDetails(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Live validation for better UX
    if (touched[name]) {
      validateMobileDetails();
    }
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
    setTouched(prev => ({ ...prev, number: true }));
    
    // Live validation
    if (touched.number) {
      validateCardDetails();
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { value } = e.target;
    value = value.replace(/\D/g, '');
    
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
    }
    
    setCardDetails(prev => ({ ...prev, expiry: value }));
    setTouched(prev => ({ ...prev, expiry: true }));
    
    // Live validation
    if (touched.expiry) {
      validateCardDetails();
    }
  };

  return (
    <div className={`card p-4 sm:p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-light-primary dark:text-dark-primary">{title}</h3>

      {/* Payment method selection */}
      <div className="grid grid-cols-1 gap-3 mb-5 sm:mb-6">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {availableMethods.includes('airtel') && (
            <button
              type="button"
              onClick={() => setSelectedMethod('airtel')}
              className={`card card-interactive p-2.5 sm:p-4 flex flex-col items-center justify-center transition-all duration-300 ${
                selectedMethod === 'airtel'
                  ? 'border-primary-700 bg-primary-700/5 shadow-lg ring-2 ring-primary-700/20'
                  : 'hover:border-primary-700/50 hover:shadow-md'
              }`}
              disabled={isProcessing}
              aria-pressed={selectedMethod === 'airtel'}
            >
              <div className="icon-badge icon-badge-lg bg-accent/10 text-accent mb-2">
                <Smartphone className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <span className="font-medium text-xs sm:text-sm text-center text-light-primary dark:text-dark-primary">{airtelLabel}</span>
              {selectedMethod === 'airtel' && (
                <div className="mt-1 sm:mt-2 bg-primary text-black text-xs rounded-full px-2 py-0.5 flex items-center">
                  <Check className="h-3 w-3 mr-1" /> Selected
                </div>
              )}
            </button>
          )}
          
          {availableMethods.includes('momo') && (
            <button
              type="button"
              onClick={() => setSelectedMethod('momo')}
              className={`card card-interactive p-2.5 sm:p-4 flex flex-col items-center justify-center transition-all duration-300 ${
                selectedMethod === 'momo'
                  ? 'border-primary-700 bg-primary-700/5 shadow-lg ring-2 ring-primary-700/20'
                  : 'hover:border-primary-700/50 hover:shadow-md'
              }`}
              disabled={isProcessing}
              aria-pressed={selectedMethod === 'momo'}
            >
              <div className="icon-badge icon-badge-lg bg-primary/10 text-primary mb-2">
                <Wallet className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <span className="font-medium text-xs sm:text-sm text-center text-light-primary dark:text-dark-primary">{momoLabel}</span>
              {selectedMethod === 'momo' && (
                <div className="mt-1 sm:mt-2 bg-primary text-black text-xs rounded-full px-2 py-0.5 flex items-center">
                  <Check className="h-3 w-3 mr-1" /> Selected
                </div>
              )}
            </button>
          )}

          {availableMethods.includes('card') && (
            <button
              type="button"
              onClick={() => setSelectedMethod('card')}
              className={`card card-interactive p-2.5 sm:p-4 flex flex-col items-center justify-center transition-all duration-300 ${
                selectedMethod === 'card'
                  ? 'border-primary-700 bg-primary-700/5 shadow-lg ring-2 ring-primary-700/20'
                  : 'hover:border-primary-700/50 hover:shadow-md'
              }`}
              disabled={isProcessing}
              aria-pressed={selectedMethod === 'card'}
            >
              <div className="icon-badge icon-badge-lg bg-purple/10 text-purple mb-2">
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <span className="font-medium text-xs sm:text-sm text-center text-light-primary dark:text-dark-primary">{cardLabel}</span>
              {selectedMethod === 'card' && (
                <div className="mt-1 sm:mt-2 bg-primary text-black text-xs rounded-full px-2 py-0.5 flex items-center">
                  <Check className="h-3 w-3 mr-1" /> Selected
                </div>
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Mobile Money Payment Form (Airtel or MoMo) */}
      {(selectedMethod === 'airtel' || selectedMethod === 'momo') && (
        <div className="space-y-4 mb-5 sm:mb-6">
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium mb-2 text-light-primary dark:text-dark-primary">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={mobileDetails.phoneNumber}
              onChange={handleMobileInputChange}
              placeholder="Enter phone number"
              className={`input-field ${errors.phoneNumber ? 'border-accent-red focus:border-accent-red focus:ring-accent-red/20' : ''}`}
              disabled={isProcessing}
              aria-invalid={!!errors.phoneNumber}
              aria-describedby={errors.phoneNumber ? "phoneNumber-error" : undefined}
            />
            {errors.phoneNumber && (
              <p id="phoneNumber-error" className="mt-1 text-xs sm:text-sm text-accent-red flex items-center">
                <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                {errors.phoneNumber}
              </p>
            )}
            <p className="mt-1 text-xs text-light-tertiary dark:text-dark-tertiary flex items-center">
              <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
              You'll receive a prompt on your phone to confirm payment
            </p>
          </div>
          
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium mb-2 text-light-primary dark:text-dark-primary">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={mobileDetails.fullName}
              onChange={handleMobileInputChange}
              placeholder="Enter account holder's name"
              className={`input-field ${errors.fullName ? 'border-accent-red focus:border-accent-red focus:ring-accent-red/20' : ''}`}
              disabled={isProcessing}
              aria-invalid={!!errors.fullName}
              aria-describedby={errors.fullName ? "fullName-error" : undefined}
            />
            {errors.fullName && (
              <p id="fullName-error" className="mt-1 text-xs sm:text-sm text-accent-red flex items-center">
                <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                {errors.fullName}
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* Credit Card Payment Form */}
      {selectedMethod === 'card' && (
        <div className="space-y-4 mb-5 sm:mb-6">
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
              className={`w-full p-2.5 sm:p-3 text-sm border ${errors.cardNumber ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-700 focus:border-accent-kente-gold focus:ring-accent-kente-gold`}
              disabled={isProcessing}
              aria-invalid={!!errors.cardNumber}
              aria-describedby={errors.cardNumber ? "cardNumber-error" : undefined}
            />
            {errors.cardNumber && (
              <p id="cardNumber-error" className="mt-1 text-xs sm:text-sm text-red-500 dark:text-red-400 flex items-center">
                <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                {errors.cardNumber}
              </p>
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
              className={`w-full p-2.5 sm:p-3 text-sm border ${errors.cardName ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-700 focus:border-accent-kente-gold focus:ring-accent-kente-gold`}
              disabled={isProcessing}
              aria-invalid={!!errors.cardName}
              aria-describedby={errors.cardName ? "cardName-error" : undefined}
            />
            {errors.cardName && (
              <p id="cardName-error" className="mt-1 text-xs sm:text-sm text-red-500 dark:text-red-400 flex items-center">
                <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                {errors.cardName}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
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
                className={`w-full p-2.5 sm:p-3 text-sm border ${errors.cardExpiry ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-700 focus:border-accent-kente-gold focus:ring-accent-kente-gold`}
                disabled={isProcessing}
                aria-invalid={!!errors.cardExpiry}
                aria-describedby={errors.cardExpiry ? "cardExpiry-error" : undefined}
              />
              {errors.cardExpiry && (
                <p id="cardExpiry-error" className="mt-1 text-xs sm:text-sm text-red-500 dark:text-red-400 flex items-center">
                  <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                  {errors.cardExpiry}
                </p>
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
                className={`w-full p-2.5 sm:p-3 text-sm border ${errors.cardCvv ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-700 focus:border-accent-kente-gold focus:ring-accent-kente-gold`}
                disabled={isProcessing}
                aria-invalid={!!errors.cardCvv}
                aria-describedby={errors.cardCvv ? "cardCvv-error" : undefined}
              />
              {errors.cardCvv && (
                <p id="cardCvv-error" className="mt-1 text-xs sm:text-sm text-red-500 dark:text-red-400 flex items-center">
                  <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                  {errors.cardCvv}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Payment Summary */}
      {showTotalAmount && (
        <div className="card bg-light/50 dark:bg-dark/50 p-3 sm:p-4 mb-5 sm:mb-6">
          <div className="flex justify-between items-center">
            <span className="font-medium text-sm sm:text-base text-light-primary dark:text-dark-primary">Total Amount:</span>
            <span className="text-base sm:text-lg text-primary font-bold">{currency}{amount.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary flex-1 py-3 px-4 order-2 sm:order-1"
          disabled={isProcessing}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {cancelLabel}
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedMethod || isProcessing}
          className={`btn flex-1 py-3 px-4 relative flex items-center justify-center order-1 sm:order-2 ${
            selectedMethod && !isProcessing
              ? 'btn-primary'
              : 'opacity-70 cursor-not-allowed bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
          }`}
        >
          {isProcessing && showProcessingIndicator ? (
            <>
              <span className="opacity-0">{payLabel} {currency}{amount.toFixed(2)}</span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white/30 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            </>
          ) : (
            <>
              {payLabel} {currency}{amount.toFixed(2)}
              <Check className="ml-2 h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentForm; 
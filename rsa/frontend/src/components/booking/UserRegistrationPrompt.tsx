import React, { useState } from 'react';
import { User, Phone, Mail, MessageCircle, Download, UserPlus, X } from 'lucide-react';

export type TicketDeliveryMethod = 'email' | 'whatsapp' | 'sms' | 'download';

interface UserRegistrationPromptProps {
  onContinueAsGuest: (deliveryMethod: TicketDeliveryMethod, contactInfo: ContactInfo) => void;
  onRegisterUser: (userData: UserRegistrationData) => void;
  onClose?: () => void;
  className?: string;
}

interface ContactInfo {
  name: string;
  phone: string;
  email?: string;
}

interface UserRegistrationData extends ContactInfo {
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

const UserRegistrationPrompt: React.FC<UserRegistrationPromptProps> = ({
  onContinueAsGuest,
  onRegisterUser,
  onClose,
  className = ''
}) => {
  const [mode, setMode] = useState<'choice' | 'guest' | 'register'>('choice');
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<TicketDeliveryMethod>('email');
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    name: '',
    phone: '',
    email: ''
  });
  const [registrationData, setRegistrationData] = useState<UserRegistrationData>({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const deliveryMethods = [
    {
      id: 'email' as TicketDeliveryMethod,
      name: 'Email',
      icon: Mail,
      description: 'Receive ticket via email',
      requiresEmail: true
    },
    {
      id: 'whatsapp' as TicketDeliveryMethod,
      name: 'WhatsApp',
      icon: MessageCircle,
      description: 'Get ticket on WhatsApp',
      requiresPhone: true
    },
    {
      id: 'sms' as TicketDeliveryMethod,
      name: 'SMS',
      icon: Phone,
      description: 'Receive via text message',
      requiresPhone: true
    },
    {
      id: 'download' as TicketDeliveryMethod,
      name: 'Download',
      icon: Download,
      description: 'Download ticket directly',
      requiresPhone: false
    }
  ];

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedMethod = deliveryMethods.find(m => m.id === selectedDeliveryMethod);
    
    if (!contactInfo.name || !contactInfo.phone) {
      return;
    }
    
    if (selectedMethod?.requiresEmail && !contactInfo.email) {
      return;
    }
    
    onContinueAsGuest(selectedDeliveryMethod, contactInfo);
  };

  const handleRegistrationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registrationData.name || !registrationData.phone || !registrationData.email || 
        !registrationData.password || !registrationData.confirmPassword) {
      return;
    }
    
    if (registrationData.password !== registrationData.confirmPassword) {
      return;
    }
    
    if (!registrationData.agreeToTerms) {
      return;
    }
    
    onRegisterUser(registrationData);
  };

  const renderChoiceScreen = () => (
    <div className="text-center space-y-6">
      <div>
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-text-light-primary dark:text-text-dark-primary mb-2">
          Complete Your Booking
        </h3>
        <p className="text-text-light-secondary dark:text-text-dark-secondary">
          Choose how you'd like to proceed with your booking
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => setMode('guest')}
          className="w-full p-4 border-2 border-border-light dark:border-border-dark rounded-xl hover:border-primary hover:bg-primary/5 transition-all duration-200 text-left"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
              <Download className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h4 className="font-medium text-text-light-primary dark:text-text-dark-primary">
                Continue as Guest
              </h4>
              <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
                Quick booking without creating an account
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setMode('register')}
          className="w-full p-4 border-2 border-primary bg-primary/5 rounded-xl hover:bg-primary/10 transition-all duration-200 text-left"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-text-light-primary dark:text-text-dark-primary">
                Create Account
              </h4>
              <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
                Save your details for faster future bookings
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  const renderGuestForm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-text-light-primary dark:text-text-dark-primary mb-2">
          Guest Booking
        </h3>
        <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
          How would you like to receive your ticket?
        </p>
      </div>

      {/* Delivery Method Selection */}
      <div className="grid grid-cols-2 gap-3">
        {deliveryMethods.map((method) => {
          const Icon = method.icon;
          return (
            <button
              key={method.id}
              onClick={() => setSelectedDeliveryMethod(method.id)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                selectedDeliveryMethod === method.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border-light dark:border-border-dark hover:border-primary/50'
              }`}
            >
              <Icon className={`h-5 w-5 mx-auto mb-2 ${
                selectedDeliveryMethod === method.id ? 'text-primary' : 'text-text-light-tertiary dark:text-text-dark-tertiary'
              }`} />
              <p className={`text-sm font-medium ${
                selectedDeliveryMethod === method.id
                  ? 'text-text-light-primary dark:text-text-dark-primary'
                  : 'text-text-light-secondary dark:text-text-dark-secondary'
              }`}>
                {method.name}
              </p>
            </button>
          );
        })}
      </div>

      {/* Contact Form */}
      <form onSubmit={handleGuestSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-text-light-primary dark:text-text-dark-primary">
            Full Name *
          </label>
          <input
            type="text"
            value={contactInfo.name}
            onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
            className="input-field"
            placeholder="Enter your full name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-text-light-primary dark:text-text-dark-primary">
            Phone Number *
          </label>
          <input
            type="tel"
            value={contactInfo.phone}
            onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
            className="input-field"
            placeholder="Enter your phone number"
            required
          />
        </div>

        {(selectedDeliveryMethod === 'email') && (
          <div>
            <label className="block text-sm font-medium mb-2 text-text-light-primary dark:text-text-dark-primary">
              Email Address *
            </label>
            <input
              type="email"
              value={contactInfo.email}
              onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
              className="input-field"
              placeholder="Enter your email address"
              required
            />
          </div>
        )}

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={() => setMode('choice')}
            className="btn btn-secondary flex-1"
          >
            Back
          </button>
          <button
            type="submit"
            className="btn btn-primary flex-1"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );

  const renderRegistrationForm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-text-light-primary dark:text-text-dark-primary mb-2">
          Create Account
        </h3>
        <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
          Join us for faster bookings and exclusive offers
        </p>
      </div>

      <form onSubmit={handleRegistrationSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-text-light-primary dark:text-text-dark-primary">
              Full Name *
            </label>
            <input
              type="text"
              value={registrationData.name}
              onChange={(e) => setRegistrationData(prev => ({ ...prev, name: e.target.value }))}
              className="input-field"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-text-light-primary dark:text-text-dark-primary">
              Phone Number *
            </label>
            <input
              type="tel"
              value={registrationData.phone}
              onChange={(e) => setRegistrationData(prev => ({ ...prev, phone: e.target.value }))}
              className="input-field"
              placeholder="Enter your phone number"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-text-light-primary dark:text-text-dark-primary">
            Email Address *
          </label>
          <input
            type="email"
            value={registrationData.email}
            onChange={(e) => setRegistrationData(prev => ({ ...prev, email: e.target.value }))}
            className="input-field"
            placeholder="Enter your email address"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-text-light-primary dark:text-text-dark-primary">
              Password *
            </label>
            <input
              type="password"
              value={registrationData.password}
              onChange={(e) => setRegistrationData(prev => ({ ...prev, password: e.target.value }))}
              className="input-field"
              placeholder="Create a password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-text-light-primary dark:text-text-dark-primary">
              Confirm Password *
            </label>
            <input
              type="password"
              value={registrationData.confirmPassword}
              onChange={(e) => setRegistrationData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="input-field"
              placeholder="Confirm your password"
              required
            />
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="terms"
            checked={registrationData.agreeToTerms}
            onChange={(e) => setRegistrationData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
            className="mt-1"
            required
          />
          <label htmlFor="terms" className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
            I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and{' '}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>
          </label>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={() => setMode('choice')}
            className="btn btn-secondary flex-1"
          >
            Back
          </button>
          <button
            type="submit"
            className="btn btn-primary flex-1"
          >
            Create Account
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className={`p-6 relative ${className}`}>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-text-light-tertiary dark:text-text-dark-tertiary hover:text-text-light-primary dark:hover:text-text-dark-primary transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      {mode === 'choice' && renderChoiceScreen()}
      {mode === 'guest' && renderGuestForm()}
      {mode === 'register' && renderRegistrationForm()}
    </div>
  );
};

export default UserRegistrationPrompt;

import React from 'react';
import { MapPin, CreditCard, Heart, Accessibility } from 'lucide-react';
import SettingsCard from './SettingsCard';
import SettingsInput from './SettingsInput';
import SettingsSelect from './SettingsSelect';
import { PassengerPreferences as PassengerPreferencesType } from '../../store/settingsStore';

interface PassengerPreferencesProps {
  preferences: PassengerPreferencesType;
  onChange: (preferences: Partial<PassengerPreferencesType>) => void;
}

const PassengerPreferences: React.FC<PassengerPreferencesProps> = ({
  preferences,
  onChange,
}) => {
  const paymentOptions = [
    { value: 'card', label: 'Credit/Debit Card' },
    { value: 'cash', label: 'Cash' },
    { value: 'mobile', label: 'Mobile Payment' },
    { value: 'wallet', label: 'Digital Wallet' },
  ];

  const seatOptions = [
    { value: 'any', label: 'Any Available Seat' },
    { value: 'window', label: 'Window Seat' },
    { value: 'aisle', label: 'Aisle Seat' },
    { value: 'front', label: 'Front of Vehicle' },
    { value: 'back', label: 'Back of Vehicle' },
  ];

  const accessibilityOptions = [
    'Wheelchair Accessible',
    'Visual Assistance',
    'Hearing Assistance',
    'Mobility Assistance',
    'Service Animal',
    'Extra Space Required',
  ];

  const handleAccessibilityChange = (option: string, checked: boolean) => {
    const current = preferences.accessibilityNeeds || [];
    const updated = checked 
      ? [...current, option]
      : current.filter(item => item !== option);
    onChange({ accessibilityNeeds: updated });
  };

  return (
    <>
      <SettingsCard
        title="Travel Preferences"
        description="Set your default travel preferences and locations"
        icon={MapPin}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingsInput
            label="Default Pickup Location"
            description="Your most common pickup location"
            value={preferences.defaultPickup}
            onChange={(value) => onChange({ defaultPickup: value as string })}
            placeholder="Enter address or location name"
          />

          <SettingsInput
            label="Default Drop-off Location"
            description="Your most common destination"
            value={preferences.defaultDropoff}
            onChange={(value) => onChange({ defaultDropoff: value as string })}
            placeholder="Enter address or location name"
          />
        </div>

        <SettingsSelect
          label="Seat Preference"
          description="Your preferred seating arrangement"
          value={preferences.seatPreference}
          onChange={(value) => onChange({ seatPreference: value })}
          options={seatOptions}
        />
      </SettingsCard>

      <SettingsCard
        title="Payment Preferences"
        description="Manage your preferred payment methods"
        icon={CreditCard}
      >
        <SettingsSelect
          label="Preferred Payment Method"
          description="Your default payment option for bookings"
          value={preferences.preferredPayment}
          onChange={(value) => onChange({ preferredPayment: value })}
          options={paymentOptions}
        />
      </SettingsCard>

      <SettingsCard
        title="Accessibility Needs"
        description="Configure accessibility requirements for your trips"
        icon={Accessibility}
      >
        <div className="space-y-3">
          {accessibilityOptions.map((option) => (
            <div key={option} className="driver-trip-card">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-light-primary dark:text-dark-primary">
                  {option}
                </span>
                <input
                  type="checkbox"
                  checked={(preferences.accessibilityNeeds || []).includes(option)}
                  onChange={(e) => handleAccessibilityChange(option, e.target.checked)}
                  className="form-checkbox h-4 w-4 text-primary"
                />
              </div>
            </div>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard
        title="Favorite Routes"
        description="Manage your frequently used routes"
        icon={Heart}
      >
        <div className="space-y-4">
          <div className="p-4 bg-light dark:bg-dark rounded-lg border border-light dark:border-dark">
            <h4 className="text-sm font-medium text-light-primary dark:text-dark-primary mb-2">
              Saved Routes
            </h4>
            <p className="text-sm text-light-secondary dark:text-dark-secondary mb-3">
              You have {preferences.favoriteRoutes.length} favorite routes saved.
            </p>
            <button className="btn btn-secondary btn-sm">
              Manage Favorite Routes
            </button>
          </div>
        </div>
      </SettingsCard>
    </>
  );
};

export default PassengerPreferences;

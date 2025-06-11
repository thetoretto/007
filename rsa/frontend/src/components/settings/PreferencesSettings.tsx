import React from 'react';
import { Settings } from 'lucide-react';
import SettingsCard from './SettingsCard';
import SettingsSelect from './SettingsSelect';
import SettingsInput from './SettingsInput';
import SettingsToggle from './SettingsToggle';
import { UserPreferences } from '../../store/settingsStore';

interface PreferencesSettingsProps {
  preferences: UserPreferences;
  onChange: (preferences: Partial<UserPreferences>) => void;
  userRole: string;
}

const PreferencesSettings: React.FC<PreferencesSettingsProps> = ({
  preferences,
  onChange,
  userRole,
}) => {
  const getDefaultViewOptions = () => {
    const baseOptions = [
      { value: 'dashboard', label: 'Dashboard' },
    ];

    if (userRole === 'admin') {
      baseOptions.push(
        { value: 'users', label: 'User Management' },
        { value: 'analytics', label: 'Analytics' },
        { value: 'routes', label: 'Route Management' },
      );
    } else if (userRole === 'driver') {
      baseOptions.push(
        { value: 'trips', label: 'My Trips' },
        { value: 'earnings', label: 'Earnings' },
        { value: 'vehicle', label: 'Vehicle Management' },
      );
    } else if (userRole === 'passenger') {
      baseOptions.push(
        { value: 'bookings', label: 'My Bookings' },
        { value: 'history', label: 'Trip History' },
        { value: 'routes', label: 'Available Routes' },
      );
    }

    return baseOptions;
  };

  const themeOptions = [
    { value: 'light', label: 'Light Mode' },
    { value: 'dark', label: 'Dark Mode' },
    { value: 'system', label: 'System Default' },
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
  ];

  const timezoneOptions = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'UTC', label: 'UTC' },
  ];

  const dateFormatOptions = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
  ];

  const timeFormatOptions = [
    { value: '12h', label: '12-hour (AM/PM)' },
    { value: '24h', label: '24-hour' },
  ];

  return (
    <SettingsCard
      title="User Preferences"
      description="Customize your application experience"
      icon={Settings}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingsSelect
          label="Default View"
          description="Page to show when you log in"
          value={preferences.defaultView}
          onChange={(value) => onChange({ defaultView: value })}
          options={getDefaultViewOptions()}
        />

        <SettingsSelect
          label="Theme"
          description="Choose your preferred color scheme"
          value={preferences.theme}
          onChange={(value) => onChange({ theme: value as 'light' | 'dark' | 'system' })}
          options={themeOptions}
        />

        <SettingsSelect
          label="Language"
          description="Select your preferred language"
          value={preferences.language}
          onChange={(value) => onChange({ language: value })}
          options={languageOptions}
        />

        <SettingsSelect
          label="Timezone"
          description="Your local timezone"
          value={preferences.timezone}
          onChange={(value) => onChange({ timezone: value })}
          options={timezoneOptions}
        />

        <SettingsSelect
          label="Date Format"
          description="How dates are displayed"
          value={preferences.dateFormat}
          onChange={(value) => onChange({ dateFormat: value })}
          options={dateFormatOptions}
        />

        <SettingsSelect
          label="Time Format"
          description="12-hour or 24-hour time"
          value={preferences.timeFormat}
          onChange={(value) => onChange({ timeFormat: value as '12h' | '24h' })}
          options={timeFormatOptions}
        />
      </div>

      <div className="pt-4 border-t border-light dark:border-dark">
        <SettingsToggle
          label="Auto Refresh"
          description="Automatically refresh data in the background"
          checked={preferences.autoRefresh}
          onChange={(value) => onChange({ autoRefresh: value })}
        />

        {preferences.autoRefresh && (
          <div className="ml-4 mt-4">
            <SettingsInput
              label="Refresh Interval (seconds)"
              description="How often to refresh data automatically"
              type="number"
              value={preferences.refreshInterval}
              onChange={(value) => onChange({ refreshInterval: value as number })}
              min={10}
              max={300}
              step={5}
            />
          </div>
        )}
      </div>
    </SettingsCard>
  );
};

export default PreferencesSettings;

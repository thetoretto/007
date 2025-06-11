import '../../index.css';
import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { User, Settings, Bell, Shield, MapPin } from 'lucide-react';
import SettingsLayout from '../../components/settings/SettingsLayout';
import ProfileSettings from '../../components/settings/ProfileSettings';
import NotificationSettings from '../../components/settings/NotificationSettings';
import PreferencesSettings from '../../components/settings/PreferencesSettings';
import PassengerPreferences from '../../components/settings/PassengerPreferences';
import SecuritySettings from '../../components/settings/SecuritySettings';
import { useSettingsStore } from '../../store/settingsStore';

const PassengerSettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const {
    settings,
    updateNotifications,
    updateUserPreferences,
    updatePassengerPreferences,
    updateSecuritySettings
  } = useSettingsStore();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'passenger', label: 'Travel Preferences', icon: MapPin },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'App Preferences', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'passenger':
        return (
          <PassengerPreferences
            preferences={settings.passengerPreferences || {
              ...settings.userPreferences,
              defaultPickup: '',
              defaultDropoff: '',
              preferredPayment: 'card',
              seatPreference: 'any',
              accessibilityNeeds: [],
              favoriteRoutes: [],
            }}
            onChange={updatePassengerPreferences}
          />
        );
      case 'notifications':
        return (
          <NotificationSettings
            settings={settings.notifications}
            onChange={updateNotifications}
            userRole={user?.role || 'passenger'}
          />
        );
      case 'preferences':
        return (
          <PreferencesSettings
            preferences={settings.userPreferences}
            onChange={updateUserPreferences}
            userRole={user?.role || 'passenger'}
          />
        );
      case 'security':
        return (
          <SecuritySettings
            settings={settings.security}
            onChange={updateSecuritySettings}
          />
        );
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <SettingsLayout
      title="Passenger Settings"
      description="Manage your travel preferences and account settings"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderTabContent()}
    </SettingsLayout>
  );
};

export default PassengerSettingsPage;

import '../../index.css';
import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { User, Settings, Bell, Shield, Truck, Clock } from 'lucide-react';
import SettingsLayout from '../../components/settings/SettingsLayout';
import ProfileSettings from '../../components/settings/ProfileSettings';
import NotificationSettings from '../../components/settings/NotificationSettings';
import PreferencesSettings from '../../components/settings/PreferencesSettings';
import DriverPreferences from '../../components/settings/DriverPreferences';
import SecuritySettings from '../../components/settings/SecuritySettings';
import { useSettingsStore } from '../../store/settingsStore';

const DriverSettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const {
    settings,
    updateNotifications,
    updateUserPreferences,
    updateDriverPreferences,
    updateSecuritySettings
  } = useSettingsStore();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'driver', label: 'Driver Preferences', icon: Truck },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'App Preferences', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'driver':
        return (
          <DriverPreferences
            preferences={settings.driverPreferences || {
              ...settings.userPreferences,
              maxTripsPerDay: 8,
              preferredRoutes: [],
              autoAcceptTrips: false,
              workingHours: { start: '06:00', end: '22:00' },
              breakDuration: 30,
              vehicleMaintenanceReminders: true,
            }}
            onChange={updateDriverPreferences}
          />
        );
      case 'notifications':
        return (
          <NotificationSettings
            settings={settings.notifications}
            onChange={updateNotifications}
            userRole={user?.role || 'driver'}
          />
        );
      case 'preferences':
        return (
          <PreferencesSettings
            preferences={settings.userPreferences}
            onChange={updateUserPreferences}
            userRole={user?.role || 'driver'}
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
      title="Driver Settings"
      description="Manage your driver profile and preferences"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderTabContent()}
    </SettingsLayout>
  );
};

export default DriverSettingsPage;

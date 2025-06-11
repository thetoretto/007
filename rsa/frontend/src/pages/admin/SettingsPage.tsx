import '../../index.css';
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { User, Settings, Bell, Shield, Database, Globe, Users, BarChart } from 'lucide-react';
import SettingsLayout from '../../components/settings/SettingsLayout';
import ProfileSettings from '../../components/settings/ProfileSettings';
import NotificationSettings from '../../components/settings/NotificationSettings';
import SystemSettings from '../../components/settings/SystemSettings';
import PreferencesSettings from '../../components/settings/PreferencesSettings';
import SecuritySettings from '../../components/settings/SecuritySettings';
import { useSettingsStore } from '../../store/settingsStore';

const AdminSettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const {
    settings,
    updateNotifications,
    updateSystemSettings,
    updateUserPreferences,
    updateSecuritySettings
  } = useSettingsStore();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'system', label: 'System', icon: Database },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'system':
        return (
          <SystemSettings
            settings={settings.system}
            onChange={updateSystemSettings}
          />
        );
      case 'notifications':
        return (
          <NotificationSettings
            settings={settings.notifications}
            onChange={updateNotifications}
            userRole={user?.role || 'admin'}
          />
        );
      case 'preferences':
        return (
          <PreferencesSettings
            preferences={settings.userPreferences}
            onChange={updateUserPreferences}
            userRole={user?.role || 'admin'}
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
      title="Admin Settings"
      description="Manage system settings and administrative preferences"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderTabContent()}
    </SettingsLayout>
  );
};

export default AdminSettingsPage;

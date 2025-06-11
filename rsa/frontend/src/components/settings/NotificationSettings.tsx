import React from 'react';
import { Bell } from 'lucide-react';
import SettingsCard from './SettingsCard';
import SettingsToggle from './SettingsToggle';
import { NotificationSettings as NotificationSettingsType } from '../../store/settingsStore';

interface NotificationSettingsProps {
  settings: NotificationSettingsType;
  onChange: (settings: Partial<NotificationSettingsType>) => void;
  userRole: string;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  settings,
  onChange,
  userRole,
}) => {
  const handleToggle = (key: keyof NotificationSettingsType, value: boolean) => {
    onChange({ [key]: value });
  };

  const getNotificationOptions = () => {
    const baseOptions = [
      {
        key: 'email' as keyof NotificationSettingsType,
        label: 'Email Notifications',
        description: 'Receive notifications via email',
      },
      {
        key: 'sms' as keyof NotificationSettingsType,
        label: 'SMS Notifications',
        description: 'Receive notifications via text message',
      },
      {
        key: 'push' as keyof NotificationSettingsType,
        label: 'Push Notifications',
        description: 'Receive browser push notifications',
      },
    ];

    if (userRole === 'admin') {
      baseOptions.push(
        {
          key: 'systemAlerts' as keyof NotificationSettingsType,
          label: 'System Alerts',
          description: 'Critical system notifications and alerts',
        },
        {
          key: 'userActivity' as keyof NotificationSettingsType,
          label: 'User Activity',
          description: 'Notifications about user registrations and activities',
        }
      );
    }

    if (userRole === 'driver') {
      baseOptions.push(
        {
          key: 'tripAlerts' as keyof NotificationSettingsType,
          label: 'Trip Alerts',
          description: 'Notifications about new trip assignments and updates',
        }
      );
    }

    if (userRole === 'passenger') {
      baseOptions.push(
        {
          key: 'bookingUpdates' as keyof NotificationSettingsType,
          label: 'Booking Updates',
          description: 'Notifications about your booking status and changes',
        },
        {
          key: 'promotions' as keyof NotificationSettingsType,
          label: 'Promotions & Offers',
          description: 'Special offers and promotional notifications',
        }
      );
    }

    return baseOptions;
  };

  return (
    <SettingsCard
      title="Notification Preferences"
      description="Manage how you receive notifications"
      icon={Bell}
    >
      {getNotificationOptions().map((option) => (
        <SettingsToggle
          key={option.key}
          label={option.label}
          description={option.description}
          checked={settings[option.key] || false}
          onChange={(value) => handleToggle(option.key, value)}
        />
      ))}
    </SettingsCard>
  );
};

export default NotificationSettings;

import React, { useState } from 'react';
import { Shield, Key, Smartphone, Clock, AlertTriangle } from 'lucide-react';
import SettingsCard from './SettingsCard';
import SettingsToggle from './SettingsToggle';
import SettingsInput from './SettingsInput';
import SettingsSelect from './SettingsSelect';
import { SecuritySettings as SecuritySettingsType } from '../../store/settingsStore';
import { useAuthStore } from '../../store/authStore';

interface SecuritySettingsProps {
  settings: SecuritySettingsType;
  onChange: (settings: Partial<SecuritySettingsType>) => void;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  settings,
  onChange,
}) => {
  const { user, changePassword } = useAuthStore();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const sessionTimeoutOptions = [
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '60', label: '1 hour' },
    { value: '120', label: '2 hours' },
    { value: '480', label: '8 hours' },
    { value: '1440', label: '24 hours' },
  ];

  const handlePasswordChange = async () => {
    if (!user) return;
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    try {
      await changePassword(user.id, passwordForm.newPassword);
      onChange({ passwordLastChanged: new Date().toISOString() });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      alert('Password changed successfully');
    } catch (error) {
      alert('Failed to change password');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <SettingsCard
        title="Account Security"
        description="Manage your account security settings"
        icon={Shield}
      >
        <SettingsToggle
          label="Two-Factor Authentication"
          description="Add an extra layer of security to your account"
          checked={settings.twoFactorEnabled}
          onChange={(value) => onChange({ twoFactorEnabled: value })}
        />

        {settings.twoFactorEnabled && (
          <div className="ml-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <Smartphone className="h-4 w-4" />
              <span className="text-sm font-medium">Two-factor authentication is enabled</span>
            </div>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              Your account is protected with an additional security layer.
            </p>
          </div>
        )}

        <SettingsToggle
          label="Login Notifications"
          description="Get notified when someone logs into your account"
          checked={settings.loginNotifications}
          onChange={(value) => onChange({ loginNotifications: value })}
        />

        <SettingsToggle
          label="Device Trust"
          description="Remember trusted devices to reduce security prompts"
          checked={settings.deviceTrust}
          onChange={(value) => onChange({ deviceTrust: value })}
        />

        <SettingsSelect
          label="Session Timeout"
          description="Automatically log out after period of inactivity"
          value={settings.sessionTimeout.toString()}
          onChange={(value) => onChange({ sessionTimeout: parseInt(value) })}
          options={sessionTimeoutOptions}
        />
      </SettingsCard>

      <SettingsCard
        title="Password Management"
        description="Change your password and view security information"
        icon={Key}
      >
        <div className="space-y-4">
          <div className="driver-trip-card">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-light-primary dark:text-dark-primary">
                  Password Last Changed
                </h4>
                <p className="text-sm text-light-secondary dark:text-dark-secondary">
                  {formatDate(settings.passwordLastChanged)}
                </p>
              </div>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="btn btn-secondary btn-sm"
              >
                Change Password
              </button>
            </div>
          </div>

          {showPasswordForm && (
            <div className="space-y-4 p-4 bg-light dark:bg-dark rounded-lg border border-light dark:border-dark">
              <SettingsInput
                label="Current Password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(value) => setPasswordForm(prev => ({ ...prev, currentPassword: value as string }))}
                required
              />
              <SettingsInput
                label="New Password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(value) => setPasswordForm(prev => ({ ...prev, newPassword: value as string }))}
                description="Must be at least 8 characters long"
                required
              />
              <SettingsInput
                label="Confirm New Password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(value) => setPasswordForm(prev => ({ ...prev, confirmPassword: value as string }))}
                required
              />
              <div className="flex gap-2">
                <button
                  onClick={handlePasswordChange}
                  className="btn btn-primary btn-sm"
                  disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                >
                  Update Password
                </button>
                <button
                  onClick={() => setShowPasswordForm(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </SettingsCard>

      <SettingsCard
        title="Security Alerts"
        description="Recent security activity and alerts"
        icon={AlertTriangle}
      >
        <div className="space-y-3">
          <div className="driver-trip-card">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-light-primary dark:text-dark-primary">
                  Account Security: Good
                </p>
                <p className="text-xs text-light-secondary dark:text-dark-secondary">
                  No suspicious activity detected
                </p>
              </div>
            </div>
          </div>
          
          <div className="driver-trip-card">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-light-secondary dark:text-dark-secondary" />
              <div>
                <p className="text-sm font-medium text-light-primary dark:text-dark-primary">
                  Last Login
                </p>
                <p className="text-xs text-light-secondary dark:text-dark-secondary">
                  {new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </SettingsCard>
    </>
  );
};

export default SecuritySettings;

import React from 'react';
import { Database, AlertTriangle } from 'lucide-react';
import SettingsCard from './SettingsCard';
import SettingsToggle from './SettingsToggle';
import SettingsInput from './SettingsInput';
import { SystemSettings as SystemSettingsType } from '../../store/settingsStore';

interface SystemSettingsProps {
  settings: SystemSettingsType;
  onChange: (settings: Partial<SystemSettingsType>) => void;
}

const SystemSettings: React.FC<SystemSettingsProps> = ({
  settings,
  onChange,
}) => {
  const handleToggle = (key: keyof SystemSettingsType, value: boolean) => {
    onChange({ [key]: value });
  };

  const handleNumberChange = (key: keyof SystemSettingsType, value: number) => {
    onChange({ [key]: value });
  };

  return (
    <SettingsCard
      title="System Configuration"
      description="Manage system-wide settings and configurations"
      icon={Database}
    >
      <SettingsToggle
        label="Maintenance Mode"
        description="Enable maintenance mode to restrict system access"
        checked={settings.maintenanceMode}
        onChange={(value) => handleToggle('maintenanceMode', value)}
      />
      
      {settings.maintenanceMode && (
        <div className="ml-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">System is in maintenance mode</span>
          </div>
          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
            Only administrators can access the system while maintenance mode is enabled.
          </p>
        </div>
      )}

      <SettingsToggle
        label="Allow New Registrations"
        description="Allow new users to register for accounts"
        checked={settings.allowRegistrations}
        onChange={(value) => handleToggle('allowRegistrations', value)}
      />

      <SettingsToggle
        label="Require Email Verification"
        description="Require email verification for new user accounts"
        checked={settings.requireEmailVerification}
        onChange={(value) => handleToggle('requireEmailVerification', value)}
      />

      <SettingsToggle
        label="Auto Backup"
        description="Automatically backup system data daily"
        checked={settings.autoBackup}
        onChange={(value) => handleToggle('autoBackup', value)}
      />

      <SettingsToggle
        label="Debug Mode"
        description="Enable debug mode for troubleshooting (affects performance)"
        checked={settings.debugMode}
        onChange={(value) => handleToggle('debugMode', value)}
      />

      <SettingsInput
        label="Maximum Bookings Per User"
        description="Maximum number of bookings a user can make per day"
        type="number"
        value={settings.maxBookingsPerUser}
        onChange={(value) => handleNumberChange('maxBookingsPerUser', value as number)}
        min={1}
        max={50}
        required
      />
    </SettingsCard>
  );
};

export default SystemSettings;

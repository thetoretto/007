import React from 'react';
import { Truck, Clock, Route } from 'lucide-react';
import SettingsCard from './SettingsCard';
import SettingsInput from './SettingsInput';
import SettingsToggle from './SettingsToggle';
import { DriverPreferences as DriverPreferencesType } from '../../store/settingsStore';

interface DriverPreferencesProps {
  preferences: DriverPreferencesType;
  onChange: (preferences: Partial<DriverPreferencesType>) => void;
}

const DriverPreferences: React.FC<DriverPreferencesProps> = ({
  preferences,
  onChange,
}) => {
  return (
    <>
      <SettingsCard
        title="Driver Work Preferences"
        description="Configure your work schedule and trip preferences"
        icon={Truck}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingsInput
            label="Maximum Trips Per Day"
            description="Limit the number of trips you can accept daily"
            type="number"
            value={preferences.maxTripsPerDay}
            onChange={(value) => onChange({ maxTripsPerDay: value as number })}
            min={1}
            max={20}
          />

          <SettingsInput
            label="Break Duration (minutes)"
            description="Minimum break time between trips"
            type="number"
            value={preferences.breakDuration}
            onChange={(value) => onChange({ breakDuration: value as number })}
            min={5}
            max={120}
            step={5}
          />
        </div>

        <SettingsToggle
          label="Auto Accept Trips"
          description="Automatically accept trip requests that match your preferences"
          checked={preferences.autoAcceptTrips}
          onChange={(value) => onChange({ autoAcceptTrips: value })}
        />

        <SettingsToggle
          label="Vehicle Maintenance Reminders"
          description="Receive reminders for vehicle maintenance schedules"
          checked={preferences.vehicleMaintenanceReminders}
          onChange={(value) => onChange({ vehicleMaintenanceReminders: value })}
        />
      </SettingsCard>

      <SettingsCard
        title="Working Hours"
        description="Set your preferred working schedule"
        icon={Clock}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingsInput
            label="Start Time"
            description="When you typically start working"
            type="time"
            value={preferences.workingHours.start}
            onChange={(value) => onChange({ 
              workingHours: { 
                ...preferences.workingHours, 
                start: value as string 
              } 
            })}
          />

          <SettingsInput
            label="End Time"
            description="When you typically finish working"
            type="time"
            value={preferences.workingHours.end}
            onChange={(value) => onChange({ 
              workingHours: { 
                ...preferences.workingHours, 
                end: value as string 
              } 
            })}
          />
        </div>
      </SettingsCard>

      <SettingsCard
        title="Route Preferences"
        description="Manage your preferred routes and areas"
        icon={Route}
      >
        <div className="space-y-4">
          <div className="p-4 bg-light dark:bg-dark rounded-lg border border-light dark:border-dark">
            <h4 className="text-sm font-medium text-light-primary dark:text-dark-primary mb-2">
              Preferred Routes
            </h4>
            <p className="text-sm text-light-secondary dark:text-dark-secondary mb-3">
              You have {preferences.preferredRoutes.length} preferred routes configured.
            </p>
            <button className="btn btn-secondary btn-sm">
              Manage Preferred Routes
            </button>
          </div>
        </div>
      </SettingsCard>
    </>
  );
};

export default DriverPreferences;

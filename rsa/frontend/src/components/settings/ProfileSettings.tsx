import React, { useState } from 'react';
import { User, Save } from 'lucide-react';
import SettingsCard from './SettingsCard';
import SettingsInput from './SettingsInput';
import { useAuthStore } from '../../store/authStore';

const ProfileSettings: React.FC = () => {
  const { user, updateUserProfile, loading } = useAuthStore();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });
  const [hasChanges, setHasChanges] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!user || !hasChanges) return;
    
    try {
      await updateUserProfile(user.id, formData);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <SettingsCard
      title="Profile Information"
      description="Update your personal information"
      icon={User}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingsInput
          label="First Name"
          value={formData.firstName}
          onChange={(value) => handleInputChange('firstName', value as string)}
          required
        />
        <SettingsInput
          label="Last Name"
          value={formData.lastName}
          onChange={(value) => handleInputChange('lastName', value as string)}
          required
        />
        <SettingsInput
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(value) => handleInputChange('email', value as string)}
          required
        />
        <SettingsInput
          label="Phone Number"
          type="tel"
          value={formData.phoneNumber}
          onChange={(value) => handleInputChange('phoneNumber', value as string)}
          placeholder="+1 (555) 123-4567"
        />
      </div>
      
      {hasChanges && (
        <div className="pt-4 border-t border-light dark:border-dark">
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn btn-primary flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </SettingsCard>
  );
};

export default ProfileSettings;

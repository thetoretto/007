import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Settings interfaces
export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  systemAlerts?: boolean;
  userActivity?: boolean;
  tripAlerts?: boolean;
  bookingUpdates?: boolean;
  promotions?: boolean;
}

export interface SystemSettings {
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  requireEmailVerification: boolean;
  maxBookingsPerUser: number;
  autoBackup: boolean;
  debugMode: boolean;
}

export interface UserPreferences {
  defaultView: string;
  autoRefresh: boolean;
  refreshInterval: number;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

export interface DriverPreferences extends UserPreferences {
  maxTripsPerDay: number;
  preferredRoutes: string[];
  autoAcceptTrips: boolean;
  workingHours: {
    start: string;
    end: string;
  };
  breakDuration: number;
  vehicleMaintenanceReminders: boolean;
}

export interface PassengerPreferences extends UserPreferences {
  defaultPickup: string;
  defaultDropoff: string;
  preferredPayment: string;
  seatPreference: string;
  accessibilityNeeds: string[];
  favoriteRoutes: string[];
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  passwordLastChanged: string;
  loginNotifications: boolean;
  deviceTrust: boolean;
}

export interface AppSettings {
  notifications: NotificationSettings;
  system: SystemSettings;
  userPreferences: UserPreferences;
  driverPreferences?: DriverPreferences;
  passengerPreferences?: PassengerPreferences;
  security: SecuritySettings;
}

interface SettingsState {
  settings: AppSettings;
  loading: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
}

interface SettingsActions {
  updateNotifications: (notifications: Partial<NotificationSettings>) => void;
  updateSystemSettings: (system: Partial<SystemSettings>) => void;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
  updateDriverPreferences: (preferences: Partial<DriverPreferences>) => void;
  updatePassengerPreferences: (preferences: Partial<PassengerPreferences>) => void;
  updateSecuritySettings: (security: Partial<SecuritySettings>) => void;
  saveSettings: () => Promise<void>;
  resetSettings: () => void;
  loadSettings: (userId: string, userRole: string) => Promise<void>;
  applyTheme: (theme: 'light' | 'dark' | 'system') => void;
}

// Default settings
const getDefaultSettings = (userRole: string): AppSettings => {
  const baseSettings: AppSettings = {
    notifications: {
      email: true,
      sms: true,
      push: true,
      systemAlerts: userRole === 'admin',
      userActivity: userRole === 'admin',
      tripAlerts: userRole !== 'admin',
      bookingUpdates: userRole !== 'admin',
      promotions: userRole === 'passenger',
    },
    system: {
      maintenanceMode: false,
      allowRegistrations: true,
      requireEmailVerification: true,
      maxBookingsPerUser: 10,
      autoBackup: true,
      debugMode: false,
    },
    userPreferences: {
      defaultView: userRole === 'admin' ? 'dashboard' : userRole === 'driver' ? 'trips' : 'bookings',
      autoRefresh: true,
      refreshInterval: 30,
      theme: 'system',
      language: 'en',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 30,
      passwordLastChanged: new Date().toISOString(),
      loginNotifications: true,
      deviceTrust: false,
    },
  };

  if (userRole === 'driver') {
    baseSettings.driverPreferences = {
      ...baseSettings.userPreferences,
      maxTripsPerDay: 8,
      preferredRoutes: [],
      autoAcceptTrips: false,
      workingHours: {
        start: '06:00',
        end: '22:00',
      },
      breakDuration: 30,
      vehicleMaintenanceReminders: true,
    };
  }

  if (userRole === 'passenger') {
    baseSettings.passengerPreferences = {
      ...baseSettings.userPreferences,
      defaultPickup: '',
      defaultDropoff: '',
      preferredPayment: 'card',
      seatPreference: 'any',
      accessibilityNeeds: [],
      favoriteRoutes: [],
    };
  }

  return baseSettings;
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set, get) => ({
      settings: getDefaultSettings('passenger'),
      loading: false,
      error: null,
      hasUnsavedChanges: false,

      updateNotifications: (notifications) => {
        set((state) => ({
          settings: {
            ...state.settings,
            notifications: { ...state.settings.notifications, ...notifications },
          },
          hasUnsavedChanges: true,
        }));
      },

      updateSystemSettings: (system) => {
        set((state) => ({
          settings: {
            ...state.settings,
            system: { ...state.settings.system, ...system },
          },
          hasUnsavedChanges: true,
        }));
      },

      updateUserPreferences: (preferences) => {
        set((state) => ({
          settings: {
            ...state.settings,
            userPreferences: { ...state.settings.userPreferences, ...preferences },
          },
          hasUnsavedChanges: true,
        }));
        
        // Apply theme immediately
        if (preferences.theme) {
          get().applyTheme(preferences.theme);
        }
      },

      updateDriverPreferences: (preferences) => {
        set((state) => ({
          settings: {
            ...state.settings,
            driverPreferences: { ...state.settings.driverPreferences, ...preferences },
          },
          hasUnsavedChanges: true,
        }));
      },

      updatePassengerPreferences: (preferences) => {
        set((state) => ({
          settings: {
            ...state.settings,
            passengerPreferences: { ...state.settings.passengerPreferences, ...preferences },
          },
          hasUnsavedChanges: true,
        }));
      },

      updateSecuritySettings: (security) => {
        set((state) => ({
          settings: {
            ...state.settings,
            security: { ...state.settings.security, ...security },
          },
          hasUnsavedChanges: true,
        }));
      },

      saveSettings: async () => {
        set({ loading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // In a real app, this would save to backend
          console.log('Settings saved:', get().settings);
          
          set({ loading: false, hasUnsavedChanges: false });
        } catch (error) {
          set({ loading: false, error: (error as Error).message });
          throw error;
        }
      },

      resetSettings: () => {
        const currentRole = get().settings.userPreferences.defaultView === 'dashboard' ? 'admin' : 'passenger';
        set({
          settings: getDefaultSettings(currentRole),
          hasUnsavedChanges: true,
        });
      },

      loadSettings: async (userId: string, userRole: string) => {
        set({ loading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // In a real app, this would load from backend
          const defaultSettings = getDefaultSettings(userRole);
          
          set({ 
            settings: defaultSettings,
            loading: false,
            hasUnsavedChanges: false,
          });
        } catch (error) {
          set({ loading: false, error: (error as Error).message });
          throw error;
        }
      },

      applyTheme: (theme: 'light' | 'dark' | 'system') => {
        const root = document.documentElement;
        
        if (theme === 'system') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          root.classList.toggle('dark', prefersDark);
        } else {
          root.classList.toggle('dark', theme === 'dark');
        }
        
        // Store theme preference
        localStorage.setItem('theme', theme);
      },
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);

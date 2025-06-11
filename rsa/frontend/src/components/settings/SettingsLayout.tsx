import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Settings, AlertCircle } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { useAuthStore } from '../../store/authStore';

interface SettingsLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  tabs: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<any>;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({
  title,
  description,
  children,
  tabs,
  activeTab,
  onTabChange,
}) => {
  const { user } = useAuthStore();
  const { 
    saveSettings, 
    resetSettings, 
    hasUnsavedChanges, 
    loading, 
    error,
    loadSettings 
  } = useSettingsStore();
  
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      loadSettings(user.id, user.role);
    }
  }, [user, loadSettings]);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSave = async () => {
    try {
      await saveSettings();
      // Show success message or toast
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleReset = () => {
    resetSettings();
    setShowResetConfirm(false);
  };

  return (
    <div className="driver-dashboard">
      {/* Modern Header */}
      <header className="driver-header mb-8">
        <div className="container-app">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="icon-badge icon-badge-lg bg-primary text-on-primary">
                  <Settings className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-light-primary dark:text-dark-primary">
                    {title}
                  </h1>
                  <p className="text-sm text-light-secondary dark:text-dark-secondary">
                    {description}
                  </p>
                </div>
              </div>
              <div className="driver-status-badge online">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                Settings Configuration Active
              </div>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              {hasUnsavedChanges && (
                <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Unsaved changes</span>
                </div>
              )}
              
              <button
                onClick={() => setShowResetConfirm(true)}
                className="btn btn-secondary flex items-center gap-2 px-4 py-3"
                disabled={loading}
              >
                <RotateCcw className="h-5 w-5" />
                Reset
              </button>
              
              <button
                onClick={handleSave}
                className="btn btn-primary flex items-center gap-2 px-4 py-3 shadow-primary"
                disabled={loading || !hasUnsavedChanges}
              >
                <Save className="h-5 w-5" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="container-app mb-6">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Error: {error}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container-app py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="driver-metric-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="icon-badge icon-badge-md bg-primary-light text-primary">
                  <Settings className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-light-primary dark:text-dark-primary">
                  Settings Menu
                </h2>
              </div>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-light text-primary'
                          : 'text-light-secondary dark:text-dark-secondary hover:text-light-primary dark:hover:text-dark-primary hover:bg-light dark:hover:bg-dark'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            {children}
          </div>
        </div>
      </main>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Reset Settings
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to reset all settings to their default values? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="btn btn-danger"
              >
                Reset Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsLayout;

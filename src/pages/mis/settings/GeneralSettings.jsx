import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../contexts/useAuth";
import {
  Save,
  AlertTriangle,
  Info,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

function GeneralSettings() {
  const { token } = useAuth();
  const [settings, setSettings] = useState({
    systemName: "EventStream Evaluation System",
    institutionName: "La Verdad Christian College - Apalit",
    defaultLanguage: "english",
    timezone: "Asia/Manila",
    dateFormat: "MM/DD/YYYY",
    maintenanceMode: false,
    maintenanceMessage: "System under maintenance. Please try again later.",
    maxUploadSize: "10",
    sessionTimeout: "30",
    enableAnalytics: true,
    showTutorials: true,
    enableMisReports: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const fetchSettings = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/settings/general", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success && data.data) {
        setSettings({
          ...data.data,
          maxUploadSize: String(data.data.maxUploadSize || 10),
          sessionTimeout: String(data.data.sessionTimeout || 30),
        });
      }
    } catch (error) {
      console.error("Error fetching general settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const response = await fetch("/api/settings/general", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...settings,
          maxUploadSize: Number(settings.maxUploadSize),
          sessionTimeout: Number(settings.sessionTimeout),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSaveStatus({
          type: "success",
          message: "Settings saved successfully!",
        });
      } else {
        throw new Error(data.message || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveStatus({
        type: "error",
        message: error.message || "Failed to save settings. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">General Settings</h1>
          <p className="text-gray-600 mt-1">
            Configure basic system parameters and preferences
          </p>
        </div>
      </div>

      {saveStatus && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            saveStatus.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {saveStatus.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <span>{saveStatus.message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* System Information */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5" />
            System Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="systemName"
                className="block text-gray-700 font-medium mb-1"
              >
                System Name
              </label>
              <input
                type="text"
                id="systemName"
                name="systemName"
                value={settings.systemName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="institutionName"
                className="block text-gray-700 font-medium mb-1"
              >
                Institution Name
              </label>
              <input
                type="text"
                id="institutionName"
                name="institutionName"
                value={settings.institutionName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Localization Settings */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Localization Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="defaultLanguage"
                className="block text-gray-700 font-medium mb-1"
              >
                Default Language
              </label>
              <select
                id="defaultLanguage"
                name="defaultLanguage"
                value={settings.defaultLanguage}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="english">English</option>
                <option value="filipino">Filipino</option>
                <option value="spanish">Spanish</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="timezone"
                className="block text-gray-700 font-medium mb-1"
              >
                Timezone
              </label>
              <select
                id="timezone"
                name="timezone"
                value={settings.timezone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Asia/Manila">Asia/Manila (UTC+8)</option>
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">
                  America/New York (UTC-5)
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="dateFormat"
                className="block text-gray-700 font-medium mb-1"
              >
                Date Format
              </label>
              <select
                id="dateFormat"
                name="dateFormat"
                value={settings.dateFormat}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY (01/31/2024)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (31/01/2024)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (2024-01-31)</option>
              </select>
            </div>
          </div>
        </div>

        {/* System Behavior */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5" />
            System Behavior
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="maintenanceMode"
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="maintenanceMode"
                className="text-gray-700 font-medium"
              >
                Maintenance Mode
              </label>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="enableMisReports"
                name="enableMisReports"
                checked={settings.enableMisReports}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="enableMisReports"
                className="text-gray-700 font-medium"
              >
                Enable Reports for MIS Staff
              </label>
            </div>

            {settings.maintenanceMode && (
              <div className="md:col-span-2">
                <label
                  htmlFor="maintenanceMessage"
                  className="block text-gray-700 font-medium mb-1"
                >
                  Maintenance Message
                </label>
                <textarea
                  id="maintenanceMessage"
                  name="maintenanceMessage"
                  value={settings.maintenanceMessage}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="maxUploadSize"
                className="block text-gray-700 font-medium mb-1"
              >
                Maximum Upload Size (MB)
              </label>
              <input
                type="number"
                id="maxUploadSize"
                name="maxUploadSize"
                value={settings.maxUploadSize}
                onChange={handleInputChange}
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="sessionTimeout"
                className="block text-gray-700 font-medium mb-1"
              >
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                id="sessionTimeout"
                name="sessionTimeout"
                value={settings.sessionTimeout}
                onChange={handleInputChange}
                min="5"
                max="120"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* User Experience */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5" />
            User Experience
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="enableAnalytics"
                name="enableAnalytics"
                checked={settings.enableAnalytics}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="enableAnalytics"
                className="text-gray-700 font-medium"
              >
                Enable Usage Analytics
              </label>
              <span className="text-gray-500 text-sm">
                Collect anonymous usage data to improve the system
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="showTutorials"
                name="showTutorials"
                checked={settings.showTutorials}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="showTutorials"
                className="text-gray-700 font-medium"
              >
                Show Tutorial Tips
              </label>
              <span className="text-gray-500 text-sm">
                Display helpful tips and guides for new users
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-blue-950 hover:bg-blue-900 text-white px-6 py-3 rounded-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default GeneralSettings;

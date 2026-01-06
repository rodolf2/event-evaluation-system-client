import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../contexts/useAuth";
import {
  Save,
  Shield,
  Key,
  Lock,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

function SecuritySettings() {
  const { token } = useAuth();
  const [settings, setSettings] = useState({
    jwtExpiration: "7d",
    passwordMinLength: "8",
    passwordRequireSpecial: true,
    passwordRequireNumber: true,
    passwordRequireUppercase: true,
    maxFailedAttempts: "5",
    accountLockoutDuration: "15",
    twoFactorEnabled: false,
    ipRestrictionEnabled: false,
    allowedIps: "",
    sessionConcurrency: "single",
    apiRateLimit: "100",
    corsAllowedOrigins: "http://localhost:5173,https://eventstream.lvcc.edu.ph",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const fetchSettings = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/settings/security", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success && data.data) {
        setSettings({
          ...data.data,
          passwordMinLength: String(data.data.passwordMinLength || 8),
          maxFailedAttempts: String(data.data.maxFailedAttempts || 5),
          accountLockoutDuration: String(
            data.data.accountLockoutDuration || 15
          ),
          apiRateLimit: String(data.data.apiRateLimit || 100),
        });
      }
    } catch (error) {
      console.error("Error fetching security settings:", error);
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
      const response = await fetch("/api/settings/security", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...settings,
          passwordMinLength: Number(settings.passwordMinLength),
          maxFailedAttempts: Number(settings.maxFailedAttempts),
          accountLockoutDuration: Number(settings.accountLockoutDuration),
          apiRateLimit: Number(settings.apiRateLimit),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSaveStatus({
          type: "success",
          message: "Security settings saved successfully!",
        });
      } else {
        throw new Error(data.message || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving security settings:", error);
      setSaveStatus({
        type: "error",
        message:
          error.message ||
          "Failed to save security settings. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading security settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Security Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Configure system security policies and authentication
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
        {/* Authentication Settings */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Key className="w-5 h-5" />
            Authentication Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="jwtExpiration"
                className="block text-gray-700 font-medium mb-1"
              >
                JWT Token Expiration
              </label>
              <select
                id="jwtExpiration"
                name="jwtExpiration"
                value={settings.jwtExpiration}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1h">1 Hour</option>
                <option value="6h">6 Hours</option>
                <option value="1d">1 Day</option>
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="sessionConcurrency"
                className="block text-gray-700 font-medium mb-1"
              >
                Session Concurrency
              </label>
              <select
                id="sessionConcurrency"
                name="sessionConcurrency"
                value={settings.sessionConcurrency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="single">Single Session</option>
                <option value="multiple">Multiple Sessions</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Single session logs out previous sessions when new login occurs
              </p>
            </div>
          </div>
        </div>

        {/* Password Policy */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Password Policy
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="passwordMinLength"
                className="block text-gray-700 font-medium mb-1"
              >
                Minimum Password Length
              </label>
              <input
                type="number"
                id="passwordMinLength"
                name="passwordMinLength"
                value={settings.passwordMinLength}
                onChange={handleInputChange}
                min="6"
                max="20"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="passwordRequireSpecial"
                  name="passwordRequireSpecial"
                  checked={settings.passwordRequireSpecial}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="passwordRequireSpecial"
                  className="text-gray-700 font-medium"
                >
                  Require Special Characters
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="passwordRequireNumber"
                  name="passwordRequireNumber"
                  checked={settings.passwordRequireNumber}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="passwordRequireNumber"
                  className="text-gray-700 font-medium"
                >
                  Require Numbers
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="passwordRequireUppercase"
                  name="passwordRequireUppercase"
                  checked={settings.passwordRequireUppercase}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="passwordRequireUppercase"
                  className="text-gray-700 font-medium"
                >
                  Require Uppercase Letters
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Account Security */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Account Security
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="maxFailedAttempts"
                className="block text-gray-700 font-medium mb-1"
              >
                Max Failed Login Attempts
              </label>
              <input
                type="number"
                id="maxFailedAttempts"
                name="maxFailedAttempts"
                value={settings.maxFailedAttempts}
                onChange={handleInputChange}
                min="3"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="accountLockoutDuration"
                className="block text-gray-700 font-medium mb-1"
              >
                Account Lockout Duration (minutes)
              </label>
              <input
                type="number"
                id="accountLockoutDuration"
                name="accountLockoutDuration"
                value={settings.accountLockoutDuration}
                onChange={handleInputChange}
                min="5"
                max="60"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-3 md:col-span-2">
              <input
                type="checkbox"
                id="twoFactorEnabled"
                name="twoFactorEnabled"
                checked={settings.twoFactorEnabled}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="twoFactorEnabled"
                className="text-gray-700 font-medium"
              >
                Enable Two-Factor Authentication
              </label>
              <span className="text-gray-500 text-sm">
                Requires users to verify with email or authenticator app
              </span>
            </div>

            <div className="flex items-center gap-3 md:col-span-2">
              <input
                type="checkbox"
                id="ipRestrictionEnabled"
                name="ipRestrictionEnabled"
                checked={settings.ipRestrictionEnabled}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="ipRestrictionEnabled"
                className="text-gray-700 font-medium"
              >
                Enable IP Restriction
              </label>
            </div>

            {settings.ipRestrictionEnabled && (
              <div className="md:col-span-2">
                <label
                  htmlFor="allowedIps"
                  className="block text-gray-700 font-medium mb-1"
                >
                  Allowed IP Addresses (comma separated)
                </label>
                <textarea
                  id="allowedIps"
                  name="allowedIps"
                  value={settings.allowedIps}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="192.168.1.1, 10.0.0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to allow all IPs. Use CIDR notation for ranges
                  (e.g., 192.168.1.0/24)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* API Security */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Security
          </h2>

          <div className="space-y-6">
            <div>
              <label
                htmlFor="apiRateLimit"
                className="block text-gray-700 font-medium mb-1"
              >
                API Rate Limit (requests per minute)
              </label>
              <input
                type="number"
                id="apiRateLimit"
                name="apiRateLimit"
                value={settings.apiRateLimit}
                onChange={handleInputChange}
                min="10"
                max="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="corsAllowedOrigins"
                className="block text-gray-700 font-medium mb-1"
              >
                CORS Allowed Origins (comma separated)
              </label>
              <textarea
                id="corsAllowedOrigins"
                name="corsAllowedOrigins"
                value={settings.corsAllowedOrigins}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                List of allowed domains for CORS requests. Use * to allow all
                (not recommended for production)
              </p>
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
            {isSaving ? "Saving..." : "Save Security Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SecuritySettings;

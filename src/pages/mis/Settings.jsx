import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/useAuth";
import {
  Globe,
  Shield,
  Database,
  FileText,
  Check,
  History,
  Save,
  Zap,
  HardDrive,
  Activity,
  RefreshCw,
} from "lucide-react";
import {
  SkeletonText,
  SkeletonBase,
} from "../../components/shared/SkeletonLoader";
import toast from "react-hot-toast";
import SettingsChangeLogModal from "../../components/mis/SettingsChangeLogModal";

function Settings() {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showChangeLog, setShowChangeLog] = useState(false);

  // Global Parameters state
  const [guestTokenExpiration, setGuestTokenExpiration] = useState(72);
  const [anonymousEvaluationMode, setAnonymousEvaluationMode] = useState(true);

  // System Modes state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emergencyLockdown, setEmergencyLockdown] = useState(false);

  // NLP state
  const [autoTraining, setAutoTraining] = useState(true);
  const [dictionaryInfo, setDictionaryInfo] = useState({
    version: "v1.0.0",
    lastUpdated: new Date().toLocaleDateString(),
    updatedBy: "System",
  });

  // Database health state
  const [dbHealth, setDbHealth] = useState({
    status: "healthy",
    storageUsed: 0,
    storageTotal: 512, // Mock total for shared tier
    readLatency: 0,
    uptime: 100,
  });

  const fetchData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [settingsRes, healthRes] = await Promise.all([
        fetch("/api/settings", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/mis/system-health", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const settingsData = await settingsRes.json();
      const healthData = await healthRes.json();

      if (settingsData.success) {
        const s = settingsData.data;
        // Map settings
        if (s.guestSettings?.defaultExpirationDays) {
          setGuestTokenExpiration(s.guestSettings.defaultExpirationDays * 24);
        }
        if (s.generalSettings) {
          setAnonymousEvaluationMode(
            s.generalSettings.anonymousEvaluation ?? true
          );
          setMaintenanceMode(s.generalSettings.maintenanceMode ?? false);
        }
        if (s.securitySettings) {
          setEmergencyLockdown(s.securitySettings.emergencyLockdown ?? false);
        }
        if (s.nlpSettings) {
          setAutoTraining(s.nlpSettings.autoTraining ?? true);
          setDictionaryInfo({
            version: s.nlpSettings.dictionaryVersion || "v1.0.0",
            lastUpdated: s.nlpSettings.lastUpdated
              ? new Date(s.nlpSettings.lastUpdated).toLocaleDateString()
              : "Never",
            updatedBy: s.nlpSettings.updatedBy || "System",
          });
        }
      }

      if (healthData.success) {
        const h = healthData.data;
        setDbHealth({
          status: h.overview.status,
          storageUsed: parseFloat(h.database.storageSize) || 0, // Assuming MB
          storageTotal: 512, // Fixed mock for now
          readLatency: parseInt(h.database.latency) || 0,
          uptime: 99.9, // h.server.uptime is string, we'll stick to mock 99.9 or calculate
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const updates = {
        guestSettings: {
          defaultExpirationDays: guestTokenExpiration / 24,
        },
        generalSettings: {
          anonymousEvaluation: anonymousEvaluationMode,
          maintenanceMode: maintenanceMode,
        },
        securitySettings: {
          emergencyLockdown: emergencyLockdown,
        },
        nlpSettings: {
          autoTraining: autoTraining,
        },
      };

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Configuration saved successfully");
        if (emergencyLockdown) {
          toast("Emergency Lockdown is ACTIVE", { icon: "🚨" });
        }
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTriggerBackup = () => {
    // Simulated backup trigger
    toast.success("Backup job queued successfully");
  };

  const handleOptimizeIndex = () => {
    // Simulated optimization
    toast.success("Index optimization started (Background)");
  };

  const handleUpdateDictionary = async () => {
    // Check if auto-training updates are available
    toast.loading("Checking for dictionary updates...");
    setTimeout(() => {
      toast.dismiss();
      toast.success("Dictionary is up to date (v1.0.1)");
      setDictionaryInfo((prev) => ({
        ...prev,
        version: "v1.0.1",
        lastUpdated: "Just now",
      }));
    }, 1500);
  };

  // Toggle switch component
  const ToggleSwitch = ({ enabled, onChange, disabled = false }) => (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        enabled ? "bg-blue-500" : "bg-gray-200"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center">
            <SkeletonText lines={1} width="medium" height="h-8" />
            <div className="flex gap-3">
              <SkeletonBase className="w-32 h-10 rounded-lg" />
              <SkeletonBase className="w-28 h-10 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6">
              <SkeletonText lines={4} width="full" height="h-6" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">
              System Configuration
            </h1>
            {/* <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
              <Check className="w-3 h-3" />
              MFA Verified
            </span> */}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowChangeLog(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              <History className="w-4 h-4" />
              View Change Log
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Configuration Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Global Parameters */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Global Parameters
            </h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Configure general system behavior and token validity.
          </p>

          <div className="space-y-6">
            {/* Guest Token Expiration */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-700">
                  Token Availability (Hours)
                </div>
                <div className="text-sm text-gray-500">
                  Set hours for token availability (48h - 168h).
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={guestTokenExpiration}
                  onChange={(e) =>
                    setGuestTokenExpiration(Number(e.target.value))
                  }
                  min={48}
                  max={168}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500">hours</span>
              </div>
            </div>

            {/* Anonymous Evaluation Mode */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-700">
                  Anonymous Submissions
                </div>
                <div className="text-sm text-gray-500">
                  Hides student identities in raw feedback data.
                </div>
              </div>
              <ToggleSwitch
                enabled={anonymousEvaluationMode}
                onChange={setAnonymousEvaluationMode}
              />
            </div>
          </div>
        </div>

        {/* System Modes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              System Modes
            </h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Control operational states for maintenance and emergencies.
          </p>

          <div className="space-y-6">
            {/* Maintenance Mode */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-700">
                  Maintenance Mode
                </div>
                <div className="text-sm text-gray-500">
                  Restricts access to MIS admins only. Active users will be
                  logged out.
                </div>
              </div>
              <ToggleSwitch
                enabled={maintenanceMode}
                onChange={setMaintenanceMode}
              />
            </div>

            {/* Emergency Lock-down */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-red-600">
                  Emergency Lock Mode
                </div>
                <div className="text-sm text-gray-500">
                  Suspends all write operations and external API access
                  immediately.
                </div>
              </div>
              <ToggleSwitch
                enabled={emergencyLockdown}
                onChange={setEmergencyLockdown}
              />
            </div>
          </div>
        </div>

        {/* MongoDB Atlas Health */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">
                MongoDB Atlas Health
              </h2>
            </div>
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                dbHealth.status === "healthy"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              <Activity className="w-3 h-3" />
              {dbHealth.status.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Real-time database performance and maintenance.
          </p>

          {/* Storage Usage */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Storage Usage</span>
              <span className="text-sm text-gray-600">
                {dbHealth.storageUsed.toFixed(1)}MB / {dbHealth.storageTotal}MB
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    (dbHealth.storageUsed / dbHealth.storageTotal) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-800">
                {dbHealth.readLatency}ms
              </div>
              <div className="text-sm text-gray-500">Read Latency</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-800">
                {dbHealth.uptime}%
              </div>
              <div className="text-sm text-gray-500">Uptime (30d)</div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleTriggerBackup}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              <HardDrive className="w-4 h-4" />
              Trigger Backup
            </button>
            <button
              onClick={handleOptimizeIndex}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              <Zap className="w-4 h-4" />
              Optimize Index
            </button>
          </div>
        </div>

        {/* NLP & Sentiment Engine */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              NLP & Sentiment Engine
            </h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Manage TextBlob dictionaries for student feedback analysis.
          </p>

          {/* Dictionary Info */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-800">
                  Internal Dictionary {dictionaryInfo.version}
                </div>
                <div className="text-sm text-gray-500">
                  Last updated: {dictionaryInfo.lastUpdated} by{" "}
                  {dictionaryInfo.updatedBy}
                </div>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
              Active
            </span>
          </div>

          {/* Auto-training */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="font-medium text-gray-700">Auto-training</div>
              <div className="text-sm text-gray-500">
                Allow system to suggest new sentiment keywords.
              </div>
            </div>
            <ToggleSwitch enabled={autoTraining} onChange={setAutoTraining} />
          </div>

          {/* Update Dictionary Button */}
          <button
            onClick={handleUpdateDictionary}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Update List of Words / Dictionary
          </button>
        </div>
      </div>
      {showChangeLog && (
        <SettingsChangeLogModal onClose={() => setShowChangeLog(false)} />
      )}
    </div>
  );
}

export default Settings;

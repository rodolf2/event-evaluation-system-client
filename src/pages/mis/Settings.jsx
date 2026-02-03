import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/useAuth";
import {
  Globe,
  Shield,
  Database,
  FileText,
  History,
  Save,
  Activity,
  Lock,
  Plus,
  Trash2,
  BookOpen,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import {
  SkeletonText,
  SkeletonBase,
} from "../../components/shared/SkeletonLoader";
import toast from "react-hot-toast";
import SettingsChangeLogModal from "../../components/mis/SettingsChangeLogModal";

function Settings() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showChangeLog, setShowChangeLog] = useState(false);

  // System Modes state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emergencyLockdown, setEmergencyLockdown] = useState(false);
  const [domainWhitelist, setDomainWhitelist] = useState([]);
  const [newDomain, setNewDomain] = useState("");

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

      if (settingsData.success) {
        const s = settingsData.data;
        if (s.generalSettings) {
          setMaintenanceMode(s.generalSettings.maintenanceMode ?? false);
        }
        if (s.securitySettings) {
          setEmergencyLockdown(s.securitySettings.emergencyLockdown ?? false);
          setDomainWhitelist(s.securitySettings.domainWhitelist || []);
        }
      }

      const healthData = await healthRes.json();

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
        generalSettings: {
          maintenanceMode: maintenanceMode,
        },
        securitySettings: {
          emergencyLockdown: emergencyLockdown,
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
      /*
     toast.success("No MIS-specific settings to save currently.");
     */
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSecuritySettings = async (updates) => {
    try {
      const response = await fetch("/api/settings/security", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      if (data.success) {
        setDomainWhitelist(data.data.domainWhitelist); // Update purely the whitelist from response
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating settings:", error);
      return false;
    }
  };

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return;
    const newEntry = { domain: newDomain, label: "Custom Domain" };
    const updatedList = [...domainWhitelist, newEntry];

    if (await handleUpdateSecuritySettings({ domainWhitelist: updatedList })) {
      setNewDomain("");
      toast.success("Domain added to whitelist");
    } else {
      toast.error("Failed to add domain");
    }
  };

  const handleRemoveDomain = async (id) => {
    const updatedList = domainWhitelist.filter((item) => item._id !== id);
    if (await handleUpdateSecuritySettings({ domainWhitelist: updatedList })) {
      toast.success("Domain removed from whitelist");
    } else {
      toast.error("Failed to remove domain");
    }
  };




  // Toggle switch component
  const ToggleSwitch = ({ enabled, onChange, disabled = false }) => (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${enabled ? "bg-blue-500" : "bg-gray-200"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${enabled ? "translate-x-6" : "translate-x-1"
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
              className="flex items-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Configuration Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        {/* NLP Engine Card */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col h-full">
          <div className="flex items-start gap-3 mb-1">
            <FileText className="w-6 h-6 text-gray-700 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">NLP & Sentiment Engine</h2>
              <p className="text-gray-500 text-sm">Manage TextBlob dictionaries for student feedback analysis.</p>
            </div>
          </div>

          <div className="mt-6 bg-gray-50/50 rounded-xl p-4 border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100/50 rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="font-bold text-gray-800">Internal Dictionary v1.0.0</div>
                <div className="text-xs text-gray-500">Last updated: 1/6/2026 by System</div>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
              Active
            </span>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <div>
              <div className="font-bold text-gray-800">Lexicon Management</div>
              <p className="text-sm text-gray-500">Manage the list of words used for sentiment analysis.</p>
            </div>
            <Link 
              to="/mis/lexicon-management"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              Manage Words
            </Link>
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
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${dbHealth.status === "healthy"
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
                    100,
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

        </div>

      </div>

      {/* Email Domain Whitelist */}
      <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Email Domain Whitelist
            </h2>
          </div>

          {/* Add Domain Input */}
          <div className="flex flex-col sm:flex-row gap-2 mb-6">
            <input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="e.g., @laverdad.edu.ph"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddDomain}
              className="flex items-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-900 text-white rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              Add Domain
            </button>
          </div>

          {/* Domain List */}
          <div className="space-y-3">
            {domainWhitelist.map((item) => (
              <div
                key={item._id || item.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <div className="font-medium text-gray-800">{item.domain}</div>
                  <div className="text-sm text-gray-500">{item.label}</div>
                </div>
                <button
                  onClick={() => handleRemoveDomain(item._id || item.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

      {showChangeLog && (
        <SettingsChangeLogModal onClose={() => setShowChangeLog(false)} />
      )}
    </div>
  );
}

export default Settings;

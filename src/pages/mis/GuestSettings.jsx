import { useState, useEffect } from "react";
import { Save, Users, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../../contexts/useAuth";
import toast from "react-hot-toast";

function GuestSettings() {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    defaultExpirationDays: 30,
    allowGuestEvaluators: true,
    allowGuestSpeakers: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings/guest", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load guest settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/settings/guest", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Guest settings saved successfully");
      } else {
        toast.error(data.message || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-950"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6 text-blue-950" />
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Guest Access Settings
          </h2>
          <p className="text-sm text-gray-500">
            Configure guest evaluator and speaker account settings
          </p>
        </div>
      </div>

      {/* Default Expiration */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 mb-1">
              Default Account Expiration
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Guest accounts will be automatically deleted after this period.
              This can be overridden per event.
            </p>
            <div className="flex items-center gap-4">
              <select
                value={settings.defaultExpirationDays}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    defaultExpirationDays: parseInt(e.target.value),
                  })
                }
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
                <option value={180}>180 days</option>
                <option value={365}>365 days</option>
              </select>
              <span className="text-sm text-gray-500">
                Current default: {settings.defaultExpirationDays} days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Guest Evaluators Toggle */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">
                Guest Evaluators
              </h3>
              <p className="text-sm text-gray-500">
                Allow external evaluators to access and fill out evaluation
                forms using event verification codes.
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.allowGuestEvaluators}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  allowGuestEvaluators: e.target.checked,
                })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Guest Speakers Toggle */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">
                Guest Speaker Access
              </h3>
              <p className="text-sm text-gray-500">
                Allow PSAS staff to generate tokenized access links for guest
                speakers to view event reports.
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.allowGuestSpeakers}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  allowGuestSpeakers: e.target.checked,
                })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">How Guest Account Expiration Works</p>
          <p>
            Guest accounts are automatically deleted from the database after the
            expiration period. Their evaluation responses are preserved and
            anonymized - only the guest account is removed.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2 bg-blue-950 text-white rounded-lg hover:bg-blue-900 transition disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default GuestSettings;

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/useAuth";
import {
  Globe,
  FileText,
  Users,
  RefreshCw,
  Save,
  Database,
  BookOpen,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import calendar from "dayjs/plugin/calendar";
import {
  SkeletonText,
  SkeletonBase,
  SkeletonTable,
} from "../../components/shared/SkeletonLoader";
import ConfirmationModal from "../../components/shared/ConfirmationModal";

dayjs.extend(relativeTime);
dayjs.extend(calendar);

const PsasSystemControls = () => {
  const { token, currentUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // -- GLOBAL SETTINGS STATE --
  const [anonymousEvaluationMode, setAnonymousEvaluationMode] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emergencyLockdown, setEmergencyLockdown] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // -- SECURITY / SESSIONS STATE --
  const [sessions, setSessions] = useState([]);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [sessionToRevoke, setSessionToRevoke] = useState(null);
  const [isRevoking, setIsRevoking] = useState(false);

  // Verify Role Access
  if (currentUser?.position !== "PSAS Head" && currentUser?.position !== "MIS Head") {
    // Fallback if accessed directly by unauthorized user (though sidebar hides it)
  }

  const fetchData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [settingsRes, sessionsRes] = await Promise.all([
        fetch("/api/settings", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/mis/security/sessions", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const settingsData = await settingsRes.json();
      const sessionsData = await sessionsRes.json();

      // 1. Settings
      if (settingsData.success) {
        const s = settingsData.data;
        if (s.generalSettings) {
          setAnonymousEvaluationMode(s.generalSettings.anonymousEvaluation ?? true);
          setMaintenanceMode(s.generalSettings.maintenanceMode ?? false);
        }
        if (s.securitySettings) {
          setEmergencyLockdown(s.securitySettings.emergencyLockdown ?? false);
        }
      }

      // 2. Sessions
      if (sessionsData.success) {
        setSessions(
          sessionsData.data.map((s) => ({
            ...s,
            lastAccess: s.lastAccess ? dayjs(s.lastAccess).fromNow() : "Never",
            expiresAt: dayjs(s.expiresAt).calendar(null, {
              sameDay: '[Today at] h:mm A',
              nextDay: '[Tomorrow at] h:mm A',
              nextWeek: 'dddd [at] h:mm A',
              lastDay: '[Yesterday at] h:mm A',
              lastWeek: '[Last] dddd [at] h:mm A',
              sameElse: 'MMM D, YYYY h:mm A'
            }),
          }))
        );
      }

    } catch (error) {
      console.error("Error fetching system data:", error);
      toast.error("Failed to load system configuration");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- HANDLERS: GLOBAL SETTINGS ---
  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const updates = {
        generalSettings: {
          anonymousEvaluation: anonymousEvaluationMode,
          maintenanceMode: maintenanceMode,
        },
        securitySettings: {
          emergencyLockdown: emergencyLockdown,
        },
      };

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("System configuration saved");
        if (emergencyLockdown) toast("Emergency Lockdown is ACTIVE", { icon: "🚨" });
      } else {
        toast.error(data.message || "Failed to save settings");
      }
    } catch (error) {
      toast.error("Error saving settings");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const ToggleSwitch = ({ enabled, onChange, disabled, color="blue" }) => (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-${color}-500 focus:ring-offset-2 ${
        enabled ? `bg-${color}-600` : "bg-gray-200"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${enabled ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );

  // --- HANDLERS: SESSIONS ---
  const handleRevokeSession = (session) => {
    setSessionToRevoke(session);
    setShowRevokeConfirm(true);
  };

  const confirmRevoke = async () => {
    if (!sessionToRevoke) return;
    
    setIsRevoking(true);
    try {
      const response = await fetch(`/api/mis/security/sessions/${sessionToRevoke.id}/revoke`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        toast.success("Session revoked");
        setShowRevokeConfirm(false);
        setSessionToRevoke(null);
        fetchData(); // Refresh all
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to revoke session");
      }
    } catch (e) {
      toast.error("Error revoking session");
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-500 text-sm">Manage global configuration, sentiment analysis components, and security sessions.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <SkeletonBase className="h-40 w-full rounded-xl" />
          <SkeletonBase className="h-64 w-full rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Settings Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-800">Global Parameters</h2>
              </div>
              
              <div className="space-y-6 flex-1">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Anonymous Submissions</div>
                    <div className="text-sm text-gray-500">Hide student identities in reports</div>
                  </div>
                  <ToggleSwitch enabled={anonymousEvaluationMode} onChange={setAnonymousEvaluationMode} />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSavingSettings ? "Saving..." : "Save Configuration"}
                </button>
              </div>
            </div>

            {/* NLP Engine Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
              <div className="flex items-start gap-3 mb-1">
                <FileText className="w-6 h-6 text-gray-700 mt-1" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">NLP & Sentiment Engine</h2>
                  <p className="text-gray-500 text-sm">Manage TextBlob dictionaries for student feedback analysis.</p>
                </div>
              </div>

              {/* Dictionary Status Selection (Visual only as per design) */}
              <div className="mt-6 bg-gray-50/50 rounded-xl p-4 border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100/50 rounded-xl flex items-center justify-center">
                    <Database className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Internal Dictionary v1.0.0</div>
                    <div className="text-xs text-gray-500">Last updated: 1/6/2026 by System</div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                  Active
                </span>
              </div>

              {/* Lexicon Management Footer */}
              <div className="mt-8 flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-800">Lexicon Management</div>
                  <p className="text-sm text-gray-500">Manage the list of words used for sentiment analysis.</p>
                </div>
                <Link 
                  to="/psas/lexicon-management"
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition-colors"
                >
                  <BookOpen className="w-5 h-5" />
                  Manage Words
                </Link>
              </div>
            </div>
          </div>

          {/* Active Sessions Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-800">Active Guest Sessions</h3>
              </div>
              <button 
                onClick={fetchData} 
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Active</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Access Expires</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sessions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No active sessions found</td>
                    </tr>
                  ) : (
                    sessions.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{s.userName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            {s.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{s.lastAccess}</td>
                        <td className="px-6 py-4 text-sm text-blue-600 font-medium">{s.expiresAt}</td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleRevokeSession(s)} 
                            className="text-red-600 hover:text-red-700 hover:underline text-sm font-medium"
                          >
                            Revoke
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* Confirmation Modal for Revocation */}
      <ConfirmationModal
        isOpen={showRevokeConfirm}
        onClose={() => {
          if (!isRevoking) {
            setShowRevokeConfirm(false);
            setSessionToRevoke(null);
          }
        }}
        onConfirm={confirmRevoke}
        title="Revoke Guest Access"
        message={`Are you sure you want to revoke access for ${sessionToRevoke?.name}? They will be immediately blocked from viewing the ${sessionToRevoke?.role === "Speaker" ? "report" : "evaluation form"}.`}
        confirmText="Revoke Access"
        cancelText="Keep Access"
        isDestructive={true}
        isLoading={isRevoking}
      />
    </div>
  );
};

export default PsasSystemControls;

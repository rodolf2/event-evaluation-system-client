import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/useAuth";
import {
  Shield,
  Lock,
  Globe,
  Users,
  RefreshCw,
  Trash2,
  Plus,
  AlertTriangle,
  Check,
  Activity,
} from "lucide-react";
import {
  SkeletonText,
  SkeletonBase,
  SkeletonTable,
} from "../../components/shared/SkeletonLoader";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

// Mock data for JWT sessions with Role
// Security Component

function SecurityOversight() {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [ipWhitelist, setIpWhitelist] = useState([]);
  const [domainWhitelist, setDomainWhitelist] = useState([]);
  const [newIp, setNewIp] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [lockdownEnabled, setLockdownEnabled] = useState(false);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [sessionsRes, settingsRes] = await Promise.all([
        fetch("/api/mis/security/sessions", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/settings/security", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const sessionsData = await sessionsRes.json();
      const settingsData = await settingsRes.json();

      if (sessionsData.success) {
        setSessions(
          sessionsData.data.map((s) => ({
            ...s,
            // Format time if needed, backend sends ISO/Date object
            lastAccess: dayjs(s.lastAccess).fromNow(),
          }))
        );
      }

      if (settingsData.success) {
        setIpWhitelist(settingsData.data.ipWhitelist || []);
        setDomainWhitelist(settingsData.data.domainWhitelist || []);
        setLockdownEnabled(settingsData.data.emergencyLockdown || false);
      }
    } catch (error) {
      console.error("Error fetching security data:", error);
      toast.error("Failed to load security data");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefreshSessions = () => {
    fetchData();
    toast.success("Security status refreshed");
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      const response = await fetch(
        `/api/mis/security/sessions/${sessionId}/revoke`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        toast.success("Session revoked successfully");
        fetchData();
      } else {
        toast.error(data.message || "Failed to revoke session");
      }
    } catch (error) {
      console.error("Error revoking session:", error);
      toast.error("An error occurred");
    }
  };

  const handleEmergencyLockdown = async () => {
    // Toggle lockdown
    const newStatus = !lockdownEnabled;
    try {
      const response = await fetch("/api/settings/security", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ emergencyLockdown: newStatus }),
      });
      const data = await response.json();

      if (data.success) {
        setLockdownEnabled(newStatus);
        toast(
          newStatus
            ? "Emergency Lockdown ACTIVATED"
            : "Emergency Lockdown Deactivated",
          {
            icon: newStatus ? "🚨" : "🔓",
            style: {
              background: newStatus ? "#FEF2F2" : "#F0FDF4",
              color: newStatus ? "#991B1B" : "#166534",
            },
          }
        );
      } else {
        toast.error("Failed to update lockdown status");
      }
    } catch (error) {
      console.error("Error updating lockdown:", error);
      toast.error("An error occurred");
    }
  };

  const handeUpdateSettings = async (updates) => {
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
        setIpWhitelist(data.data.ipWhitelist);
        setDomainWhitelist(data.data.domainWhitelist);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating settings:", error);
      return false;
    }
  };

  const handleAddIp = async () => {
    if (!newIp.trim()) return;
    const newEntry = { ip: newIp, label: "Custom Rule" };
    const updatedList = [...ipWhitelist, newEntry];

    if (await handeUpdateSettings({ ipWhitelist: updatedList })) {
      setNewIp("");
      toast.success("IP added to whitelist");
    } else {
      toast.error("Failed to add IP");
    }
  };

  const handleRemoveIp = async (id) => {
    // Filter by _id if exists, else match by index or other prop if backend didn't assign yet (it should have)
    const updatedList = ipWhitelist.filter((item) => item._id !== id);
    if (await handeUpdateSettings({ ipWhitelist: updatedList })) {
      toast.success("IP removed from whitelist");
    } else {
      toast.error("Failed to remove IP");
    }
  };

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return;
    const newEntry = { domain: newDomain, label: "Custom Domain" };
    const updatedList = [...domainWhitelist, newEntry];

    if (await handeUpdateSettings({ domainWhitelist: updatedList })) {
      setNewDomain("");
      toast.success("Domain added to whitelist");
    } else {
      toast.error("Failed to add domain");
    }
  };

  const handleRemoveDomain = async (id) => {
    const updatedList = domainWhitelist.filter((item) => item._id !== id);
    if (await handeUpdateSettings({ domainWhitelist: updatedList })) {
      toast.success("Domain removed from whitelist");
    } else {
      toast.error("Failed to remove domain");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center">
            <SkeletonText lines={1} width="medium" height="h-8" />
            <SkeletonBase className="w-40 h-10 rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6">
              <SkeletonText lines={2} width="full" height="h-6" />
            </div>
          ))}
        </div>

        <SkeletonTable rows={5} columns={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Security Oversight
          </h1>
          <button
            onClick={handleEmergencyLockdown}
            className={`flex items-center gap-2 px-4 py-2 ${
              lockdownEnabled
                ? "bg-red-800 hover:bg-red-900 border-2 border-red-500 animate-pulse"
                : "bg-red-600 hover:bg-red-700"
            } text-white rounded-lg transition`}
          >
            <AlertTriangle className="w-4 h-4" />
            {lockdownEnabled ? "SYSTEM LOCKDOWN ACTIVE" : "Emergency Lockdown"}
          </button>
        </div>
      </div>

      {/* System Encryption & Compliance */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          System Encryption & Compliance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Data at Rest */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-gray-600" />
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <Check className="w-3 h-3" />
                Verified
              </span>
            </div>
            <div className="text-sm text-gray-500">Data at Rest</div>
            <div className="text-lg font-bold text-gray-800">
              AES-256 Encrypted
            </div>
          </div>

          {/* Data in Transit */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-gray-600" />
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <Check className="w-3 h-3" />
                Verified
              </span>
            </div>
            <div className="text-sm text-gray-500">Data in Transit</div>
            <div className="text-lg font-bold text-gray-800">
              TLS 1.3 / HTTPS
            </div>
          </div>

          {/* WAF Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Lock className="w-6 h-6 text-gray-600" />
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <Check className="w-3 h-3" />
                Active
              </span>
            </div>
            <div className="text-sm text-gray-500">WAF Status</div>
            <div className="text-lg font-bold text-gray-800">
              Blocking Threats
            </div>
          </div>
        </div>
      </div>

      {/* Active JWT Sessions */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">
                Active JWT Sessions
              </h2>
            </div>
            <button
              onClick={handleRefreshSessions}
              className="flex items-center gap-2 px-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh List
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Access
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sessions.length > 0 ? (
                sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {session.userName}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          session.role === "Evaluator"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {session.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {session.lastAccess}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleRevokeSession(session.id)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm hover:underline"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No active sessions found (Last 24h).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* IP and Domain Whitelists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IP Whitelist Management */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              IP Whitelist Management
            </h2>
          </div>

          {/* Add IP Input */}
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
              placeholder="e.g., 192.168.1.0/24"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddIp}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              Add IP
            </button>
          </div>

          {/* IP List */}
          <div className="space-y-3">
            {ipWhitelist.map((item) => (
              <div
                key={item._id || item.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <div className="font-medium text-gray-800">{item.ip}</div>
                  <div className="text-sm text-gray-500">{item.label}</div>
                </div>
                <button
                  onClick={() => handleRemoveIp(item._id || item.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
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
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="e.g., @laverdad.edu.ph"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddDomain}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
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
      </div>
    </div>
  );
}

export default SecurityOversight;

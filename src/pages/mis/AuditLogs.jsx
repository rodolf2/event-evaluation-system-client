import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/useAuth";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Activity,
  Key,
  ChevronDown,
  FileText,
  CircleUser,
} from "lucide-react";
import {
  SkeletonTable,
  SkeletonText,
} from "../../components/shared/SkeletonLoader";
import toast from "react-hot-toast";

// Time range options
const TIME_RANGES = [
  { id: "24h", label: "Last 24 Hours" },
  { id: "7d", label: "Last 7 Days" },
  { id: "30d", label: "Last 30 Days" },
  { id: "all", label: "All Time" },
];

// Category labels mapping
const CATEGORY_LABELS = {
  auth: "Authentication",
  user: "User Management",
  form: "Forms",
  evaluation: "Evaluations",
  certificate: "Certificates",
  report: "Reports",
  notification: "Notifications",
  system: "System",
  security: "Security",
  settings: "Settings",
};

function AuditLogs() {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    eventType: "",
    timeRange: "24h",
  });
  const [eventTypes, setEventTypes] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    roleChanges: 0,
    trend: 0,
  });

  const fetchFilterOptions = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch("/api/mis/audit-logs/filter-options", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success && data.data?.categories) {
        setEventTypes(data.data.categories);
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  }, [token]);

  const fetchLogs = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.search) queryParams.append("search", filters.search);
      if (filters.eventType) queryParams.append("category", filters.eventType);
      if (filters.timeRange) queryParams.append("timeRange", filters.timeRange);

      const response = await fetch(`/api/mis/audit-logs?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setLogs(data.data);
        setPagination((prev) => ({
          ...prev,
          ...data.pagination,
        }));
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      toast.error("Failed to fetch audit logs");
    } finally {
      setIsLoading(false);
    }
  }, [token, pagination.page, pagination.limit, filters]);

  const fetchStats = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch("/api/mis/audit-logs/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        const current = data.data.last24HoursCount || 0;
        const previous = data.data.previous24HoursCount || 0;
        let trend = 0;

        if (previous > 0) {
          trend = Math.round(((current - previous) / previous) * 100);
        } else if (current > 0) {
          trend = 100; // 100% increase if starting from 0
        }

        setStats({
          totalEvents: current,
          roleChanges: data.data.categoryBreakdown?.user || 0,
          trend: trend,
        });
      }
    } catch (error) {
      console.error("Error fetching audit log stats:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    fetchStats();
    fetchFilterOptions();
  }, [fetchStats, fetchFilterOptions]);

  // Debounce search
  const [localSearch, setLocalSearch] = useState(filters.search);

  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((prev) => {
        if (prev.search !== localSearch) {
          setPagination((prevP) => ({ ...prevP, page: 1 }));
          return { ...prev, search: localSearch };
        }
        return prev;
      });
    }, 500);

    return () => clearTimeout(handler);
  }, [localSearch]);

  const handleExportPDF = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.eventType) queryParams.append("category", filters.eventType);
      if (filters.timeRange) queryParams.append("timeRange", filters.timeRange);
      queryParams.append("format", "pdf");

      const response = await fetch(
        `/api/mis/audit-logs/export?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-logs-report-${new Date().toISOString().split("T")[0]
        }.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("PDF exported successfully");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF");
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Format timestamp for display
  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    const options = {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    return date.toLocaleDateString("en-US", options);
  };

  // Get action display
  const getActionDisplay = (log) => {
    const actionMap = {
      // Authentication actions
      LOGIN: { title: "User Login", desc: "Authenticated via SSO" },
      USER_LOGIN: { title: "User Login", desc: "User authenticated" },
      LOGOUT: { title: "User Logout", desc: "Session ended" },
      USER_LOGOUT: { title: "User Logout", desc: "Session ended" },
      GUEST_LOGIN: { title: "Guest Login", desc: "Guest user authenticated" },
      FAILED_LOGIN: { title: "Failed Login", desc: "Authentication failed" },
      FAILED_AUTH: { title: "Failed Auth", desc: "Authentication failed" },
      
      // User CRUD actions
      USER_CREATE: { title: "User Created", desc: "New user account created" },
      USER_UPDATE: { title: "User Updated", desc: "User profile modified" },
      USER_DELETE: { title: "User Deleted", desc: "User account removed" },
      ROLE_CHANGE: { title: "Role Changed", desc: "User role updated" },
      USER_ACTIVATED: { title: "User Activated", desc: "Account activated" },
      USER_SUSPENDED: { title: "User Suspended", desc: "Account suspended" },
      
      // Form CRUD actions
      FORM_CREATE: { title: "Form Created", desc: "New evaluation form created" },
      FORM_UPDATE: { title: "Form Updated", desc: "Form content modified" },
      FORM_DELETE: { title: "Form Deleted", desc: "Form removed" },
      FORM_PUBLISH: { title: "Form Published", desc: "Form made available" },
      
      // Certificate CRUD actions
      CERTIFICATE_CREATE: { title: "Certificate Generated", desc: "New certificate issued" },
      CERTIFICATE_UPDATE: { title: "Certificate Updated", desc: "Certificate modified" },
      CERTIFICATE_DELETE: { title: "Certificate Deleted", desc: "Certificate removed" },
      CERTIFICATE_DOWNLOAD: { title: "Certificate Downloaded", desc: "Certificate file retrieved" },
      
      // Notification CRUD actions
      NOTIFICATION_CREATE: { title: "Notification Created", desc: "New notification sent" },
      NOTIFICATION_DELETE: { title: "Notification Deleted", desc: "Notification removed" },
      
      // Report actions
      REPORT_VIEW: { title: "Report Viewed", desc: "Analytics report accessed" },
      REPORT_GENERATE: { title: "Report Generated", desc: "Report created" },
      REPORT_GENERATED: { title: "Report Generated", desc: "Quarterly Evaluation" },
      
      // System actions
      SSO_SYNC: { title: "SSO Sync", desc: "Bulk update" },
      CONFIG_UPDATE: { title: "Config Update", desc: "Settings changed" },
      SETTINGS_UPDATE: { title: "Settings Updated", desc: "System configuration modified" },
      SYSTEM_SETTINGS_UPDATE: { title: "System Settings Updated", desc: "Configuration changed" },
    };

    const mapped = actionMap[log.action] || {
      title: log.action.replace(/_/g, " "),
      desc: log.description,
    };
    const isFailed =
      log.action?.includes("FAILED") || log.severity === "critical";

    // Helper to format metadata details
    const renderDetails = () => {
      if (!log.metadata) return null;

      // System Settings Updates
      if (log.action === "SYSTEM_SETTINGS_UPDATE" && log.metadata.changes) {
        return (
          <div className="mt-1 text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
            <div className="font-semibold mb-1">Changes:</div>
            <ul className="space-y-1">
              {Object.entries(log.metadata.changes).map(([key, change]) => (
                <li key={key} className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                  <span className="font-mono text-gray-500">{key}:</span>
                  <span className="break-all">
                    <span className="text-red-600 bg-red-50 px-1 rounded">
                      {JSON.stringify(change.old)}
                    </span>
                    {" → "}
                    <span className="text-green-600 bg-green-50 px-1 rounded">
                      {JSON.stringify(change.new)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      }

      // Role Changes
      if (log.action === "ROLE_CHANGE") {
        return (
          <div className="mt-1 text-xs text-gray-600">
             <span className="font-semibold">Target:</span> {log.userEmail || "Unknown"}
             <br/>
             <span className="font-semibold">Role:</span> {log.metadata.oldValue} → {log.metadata.newValue}
          </div>
        );
      }
      
      // User Activation/Suspension
      if (log.action === "USER_ACTIVATED" || log.action === "USER_SUSPENDED") {
         return (
          <div className="mt-1 text-xs text-gray-600">
             <span className="font-semibold">Target:</span> {log.metadata?.targetName ? `${log.metadata.targetName} (${log.userEmail})` : (log.userEmail || "Unknown")}
             <br/>
             <span className="font-semibold">Status:</span> {log.action === "USER_ACTIVATED" ? "Active" : "Suspended"}
          </div>
        );
      }

       // User Created/Deleted
       if (log.action === "USER_CREATE" || log.action === "USER_DELETE") {
         const targetEmail = log.metadata?.newValue?.email || log.metadata?.oldValue?.email || "Unknown";
         const targetRole = log.metadata?.newValue?.role || log.metadata?.oldValue?.role || "";
         return (
          <div className="mt-1 text-xs text-gray-600">
             <span className="font-semibold">Target:</span> {targetEmail} {targetRole && `(${targetRole})`}
          </div>
        );
      }

      return null;
    };

    return (
      <div>
        <div
          className={`font-medium ${isFailed ? "text-red-600" : "text-gray-900"
            }`}
        >
          {mapped.title}
        </div>
        <div className="text-sm text-gray-500">{mapped.desc}</div>
        {renderDetails()}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-800">
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              <FileText className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm">Total Events (24h)</span>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold text-gray-800">
              {stats.totalEvents.toLocaleString()}
            </span>
          </div>
          <p
            className={`text-xs mt-1 ${stats.trend > 0
              ? "text-green-600"
              : stats.trend < 0
                ? "text-red-600"
                : "text-gray-500"
              }`}
          >
            {stats.trend > 0 ? "↑" : stats.trend < 0 ? "↓" : "—"}{" "}
            {Math.abs(stats.trend)}% vs yesterday
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm">Role Changes</span>
            <Key className="w-5 h-5 text-gray-400" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold text-gray-800">
              {stats.roleChanges}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">— Stable</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Actor or Action..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Event Type Dropdown */}
            <div className="relative">
              <select
                value={filters.eventType}
                onChange={(e) => {
                  setFilters((prev) => ({
                    ...prev,
                    eventType: e.target.value,
                  }));
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">All Event Types</option>
                {eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {CATEGORY_LABELS[type] ||
                      type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Time Range Dropdown */}
            <div className="relative">
              <select
                value={filters.timeRange}
                onChange={(e) => {
                  setFilters((prev) => ({
                    ...prev,
                    timeRange: e.target.value,
                  }));
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {TIME_RANGES.map((range) => (
                  <option key={range.id} value={range.id}>
                    {range.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <SkeletonTable rows={8} columns={3} />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center">
            <Activity className="mx-auto h-12 w-12 text-gray-400" />
            <p className="text-gray-500 mt-4">No audit logs found</p>
          </div>
        ) : (
          <>
            {/* Mobile Card Layout */}
            <div className="block lg:hidden">
              <div className="divide-y divide-gray-200">
                {logs.map((log) => {
                  const isSuspicious =
                    log.severity === "critical" ||
                    log.action?.includes("FAILED");
                  return (
                    <div
                      key={log._id}
                      className={`p-4 ${isSuspicious ? "bg-red-50" : "hover:bg-gray-50"
                        }`}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        {log.action === "FAILED_LOGIN" ||
                          log.action === "FAILED_AUTH" ||
                          (!log.userId?.profilePicture && !log.userId?.avatar) ? (
                          <CircleUser
                            className={`w-8 h-8 text-gray-400 ${isSuspicious ? "text-red-400" : ""
                              }`}
                          />
                        ) : (
                          <img
                            src={
                              log.userId?.profilePicture || log.userId?.avatar
                            }
                            alt={log.userName}
                            className={`w-8 h-8 rounded-full object-cover shrink-0 ${isSuspicious ? "border-2 border-red-400" : ""
                              }`}
                            onError={(e) => {
                              // If image fails to load, replace with default icon
                              e.target.style.display = 'none';
                              e.target.parentNode.innerHTML =
                                '<svg class="w-8 h-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>';
                            }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div
                            className={`font-bold ${isSuspicious ? "text-red-700" : "text-gray-900"
                              }`}
                          >
                            {isSuspicious
                              ? "Unknown"
                              : log.userName || "System"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {log.userRole || "User"} •{" "}
                            {formatTimestamp(log.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="ml-11">{getActionDisplay(log)}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Role / Actor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs.map((log) => {
                    const isSuspicious =
                      log.severity === "critical" ||
                      log.action?.includes("FAILED");
                    return (
                      <tr
                        key={log._id}
                        className={`transition ${isSuspicious
                          ? "bg-red-50 hover:bg-red-100"
                          : "hover:bg-gray-50"
                          }`}
                      >
                        <td className="px-6 py-4">
                          <div
                            className={`font-medium ${isSuspicious ? "text-red-700" : "text-gray-900"
                              }`}
                          >
                            {formatTimestamp(log.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {log.action === "FAILED_LOGIN" ||
                              log.action === "FAILED_AUTH" ||
                              (!log.userId?.profilePicture &&
                                !log.userId?.avatar) ? (
                              <CircleUser
                                className={`w-8 h-8 text-gray-400 ${isSuspicious ? "text-red-400" : ""
                                  }`}
                              />
                            ) : (
                              <img
                                src={
                                  log.userId?.profilePicture ||
                                  log.userId?.avatar
                                }
                                alt={log.userName}
                                className={`w-8 h-8 rounded-full object-cover ${isSuspicious ? "border-2 border-red-400" : ""
                                  }`}
                                onError={(e) => {
                                  // If image fails to load, replace with default icon
                                  e.target.style.display = 'none';
                                  e.target.parentNode.innerHTML =
                                    '<svg class="w-8 h-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>';
                                }}
                              />
                            )}
                            <div>
                              <div
                                className={`font-bold ${isSuspicious
                                  ? "text-red-700"
                                  : "text-gray-900"
                                  }`}
                              >
                                {isSuspicious
                                  ? "Unknown"
                                  : log.userName || "System"}
                              </div>
                              <div className="text-xs text-gray-500 font-mono">
                                {log.userRole ? log.userRole : "User"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">{getActionDisplay(log)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 text-sm">
                  Page {pagination.page} of {pagination.pages || 1}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AuditLogs;

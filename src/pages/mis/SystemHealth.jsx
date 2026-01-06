import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/useAuth";
import {
  Activity,
  Database,
  Server,
  Cpu,
  HardDrive,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  SkeletonCard,
  SkeletonText,
  SkeletonBase,
  SkeletonGrid,
} from "../../components/shared/SkeletonLoader";

const STATUS_COLORS = {
  healthy: "text-green-500",
  warning: "text-yellow-500",
  degraded: "text-orange-500",
  critical: "text-red-500",
};

const STATUS_BG_COLORS = {
  healthy: "bg-green-100",
  warning: "bg-yellow-100",
  degraded: "bg-orange-100",
  critical: "bg-red-100",
};

const STATUS_ICONS = {
  healthy: <CheckCircle className="w-6 h-6 text-green-500" />,
  warning: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
  degraded: <AlertCircle className="w-6 h-6 text-orange-500" />,
  critical: <XCircle className="w-6 h-6 text-red-500" />,
};

function SystemHealth() {
  const { token } = useAuth();
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Skeleton Component
  const SystemHealthSkeleton = () => (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <SkeletonText lines={1} width="medium" height="h-8" />
            <SkeletonText
              lines={1}
              width="large"
              height="h-4"
              className="mt-2"
            />
          </div>
          <div className="flex gap-4">
            <SkeletonBase className="w-32 h-6" />
            <SkeletonBase className="w-24 h-10 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Overall Health Skeleton */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <SkeletonBase className="w-8 h-8 rounded-full" />
            <div>
              <SkeletonText lines={1} width="medium" height="h-6" />
              <SkeletonText
                lines={1}
                width="small"
                height="h-4"
                className="mt-1"
              />
            </div>
          </div>
          <div className="text-right">
            <SkeletonText lines={1} width="small" height="h-4" />
            <SkeletonText
              lines={1}
              width="small"
              height="h-8"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Status Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex gap-3 mb-4">
              <SkeletonBase className="w-8 h-8 rounded-lg" />
              <SkeletonText lines={1} width="medium" height="h-6" />
            </div>
            <div className="space-y-3">
              <SkeletonText lines={1} width="full" height="h-4" />
              <SkeletonText lines={1} width="full" height="h-4" />
              <SkeletonText lines={1} width="full" height="h-4" />
            </div>
          </div>
        ))}
      </div>

      {/* Error Statistics Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <SkeletonText
            lines={1}
            width="medium"
            height="h-6"
            className="mb-4"
          />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <SkeletonBase key={i} className="h-24 rounded-lg bg-gray-50" />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <SkeletonText
            lines={1}
            width="medium"
            height="h-6"
            className="mb-4"
          />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <SkeletonBase key={i} className="h-12 rounded-lg bg-gray-50" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const fetchHealth = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/mis/system-health", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setHealth(data.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Error fetching system health:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchHealth();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchHealth]);

  const getProgressColor = (percent) => {
    const value = parseFloat(percent);
    if (value < 50) return "bg-green-500";
    if (value < 75) return "bg-yellow-500";
    if (value < 90) return "bg-orange-500";
    return "bg-red-500";
  };

  if (isLoading && !health) {
    return <SystemHealthSkeleton />;
  }

  if (!health) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500">Unable to load system health data</p>
      </div>
    );
  }

  const { overview, database, memory, cpu, server, errors, criticalEvents } =
    health;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">System Health</h1>
            <p className="text-gray-600 mt-1">
              Real-time system monitoring and diagnostics
            </p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Auto-refresh (30s)
            </label>
            <button
              onClick={fetchHealth}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>
        {lastUpdated && (
          <p className="text-xs text-gray-500 mt-2">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Overall Health Status */}
      <div
        className={`rounded-lg shadow-md p-6 ${
          STATUS_BG_COLORS[overview.status]
        } border-l-4 ${
          overview.status === "healthy"
            ? "border-green-500"
            : overview.status === "warning"
            ? "border-yellow-500"
            : overview.status === "degraded"
            ? "border-orange-500"
            : "border-red-500"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {STATUS_ICONS[overview.status]}
            <div>
              <h2 className="text-xl font-bold text-gray-800 capitalize">
                System {overview.status}
              </h2>
              <p className="text-gray-600">
                Health Score: {overview.healthScore}/100
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Response Time</p>
            <p className="text-2xl font-bold text-gray-800">
              {overview.responseTime}
            </p>
          </div>
        </div>
      </div>

      {/* Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Database Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Database</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <span
                className={`font-medium ${
                  database.status === "connected"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {database.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Latency</span>
              <span className="font-medium text-gray-800">
                {database.latency}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Storage</span>
              <span className="font-medium text-gray-800">
                {database.storageSize}
              </span>
            </div>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <HardDrive className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Memory</h3>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Heap Usage</span>
                <span className="font-medium text-gray-800">
                  {memory.heapUsedPercent}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getProgressColor(
                    memory.heapUsedPercent
                  )}`}
                  style={{ width: `${memory.heapUsedPercent}%` }}
                ></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Used / Total</span>
              <span className="text-sm font-medium text-gray-800">
                {memory.heapUsed} / {memory.heapTotal}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">System</span>
              <span className="text-sm font-medium text-gray-800">
                {memory.systemUsedPercent}% used
              </span>
            </div>
          </div>
        </div>

        {/* CPU Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Cpu className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-800">CPU</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cores</span>
              <span className="font-medium text-gray-800">{cpu.cores}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Load (1m)</span>
              <span className="font-medium text-gray-800">
                {cpu.loadAverage["1min"]}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Load (5m)</span>
              <span className="font-medium text-gray-800">
                {cpu.loadAverage["5min"]}
              </span>
            </div>
          </div>
        </div>

        {/* Server Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Server className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Server</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="font-medium text-gray-800">{server.uptime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Node.js</span>
              <span className="font-medium text-gray-800">
                {server.nodeVersion}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Platform</span>
              <span className="font-medium text-gray-800 capitalize">
                {server.platform}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Error Rates */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Error Statistics</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-red-600">
                {errors.lastHour}
              </p>
              <p className="text-sm text-gray-600">Errors (Last Hour)</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-orange-600">
                {errors.last24Hours}
              </p>
              <p className="text-sm text-gray-600">Errors (24h)</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-yellow-600">
                {errors.warningsLast24h}
              </p>
              <p className="text-sm text-gray-600">Warnings (24h)</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-gray-800">
                {errors.errorRate}
              </p>
              <p className="text-sm text-gray-600">Error Rate</p>
            </div>
          </div>
        </div>

        {/* Database Collections */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800">
              Database Collections
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Users</span>
              <span className="font-bold text-blue-600">
                {database.collections.users.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Forms</span>
              <span className="font-bold text-green-600">
                {database.collections.forms.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Audit Logs</span>
              <span className="font-bold text-purple-600">
                {database.collections.auditLogs.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Errors & Critical Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Errors */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">Recent Errors</h3>
          </div>
          {errors.recentErrors.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No recent errors
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {errors.recentErrors.map((error) => (
                <div key={error.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {error.action}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {error.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(error.timestamp).toLocaleString()} •{" "}
                        {error.user}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Critical Events */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">
              Critical Events (24h)
            </h3>
          </div>
          {criticalEvents.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No critical events
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {criticalEvents.map((event) => (
                <div key={event.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {event.action}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                          {event.category}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SystemHealth;

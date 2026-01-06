import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/useAuth";
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  RefreshCw,
  TrendingUp,
  Clock,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  SkeletonCard,
  SkeletonText,
  SkeletonBase,
  SkeletonGrid,
  SkeletonTable,
} from "../../components/shared/SkeletonLoader";

const ROLE_COLORS = {
  participant: "#3B82F6",
  psas: "#10B981",
  "club-officer": "#8B5CF6",
  "school-admin": "#F59E0B",
  mis: "#EF4444",
  evaluator: "#6366F1",
  "guest-speaker": "#EC4899",
};

const CHART_COLORS = [
  "#3B82F6",
  "#10B981",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#6366F1",
  "#EC4899",
  "#14B8A6",
];

function UserStatistics() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Skeleton Component
  const UserStatisticsSkeleton = () => (
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
          <SkeletonBase className="w-24 h-10 rounded-lg" />
        </div>
      </div>

      {/* Overview Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between">
              <div>
                <SkeletonText lines={1} width="small" height="h-4" />
                <SkeletonText
                  lines={1}
                  width="medium"
                  height="h-8"
                  className="mt-2"
                />
              </div>
              <SkeletonBase className="w-12 h-12 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6">
            <SkeletonText
              lines={1}
              width="medium"
              height="h-6"
              className="mb-6"
            />
            <SkeletonBase className="w-full h-64 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Recent Registrations Skeleton */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <SkeletonText lines={1} width="medium" height="h-6" />
        </div>
        <SkeletonTable rows={5} columns={4} />
      </div>
    </div>
  );

  const fetchStats = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/mis/user-statistics", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching user statistics:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formatRoleName = (role) => {
    return role
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (isLoading && !stats) {
    return <UserStatisticsSkeleton />;
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500">Unable to load user statistics</p>
      </div>
    );
  }

  const {
    overview,
    roleDistribution,
    registrationTrend,
    loginTrend,
    recentRegistrations,
  } = stats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              User Statistics
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive user analytics and trends
            </p>
          </div>
          <button
            onClick={fetchStats}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-blue-950 mt-1">
                {overview.totalUsers.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Users</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {overview.activeUsers.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {overview.totalUsers > 0
                  ? (
                      (overview.activeUsers / overview.totalUsers) *
                      100
                    ).toFixed(1)
                  : 0}
                % of total
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">New This Month</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">
                {overview.newUsersThisMonth.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {overview.newUsersThisWeek} this week
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <UserPlus className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Guest Users</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">
                {overview.guestUsers.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {overview.inactiveUsers} inactive
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <UserX className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Distribution Pie Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            User Distribution by Role
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ role, percentage }) =>
                    `${formatRoleName(role)} (${percentage}%)`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="role"
                >
                  {roleDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        ROLE_COLORS[entry.role] ||
                        CHART_COLORS[index % CHART_COLORS.length]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [value, formatRoleName(name)]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-3 justify-center">
            {roleDistribution.map((item, index) => (
              <div key={item.role} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      ROLE_COLORS[item.role] ||
                      CHART_COLORS[index % CHART_COLORS.length],
                  }}
                ></div>
                <span className="text-sm text-gray-600">
                  {formatRoleName(item.role)} ({item.count})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Registration Trend Bar Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            User Registration Trend (Last 6 Months)
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={registrationTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickFormatter={(value) => {
                    const [year, month] = value.split("-");
                    const date = new Date(year, month - 1);
                    return date.toLocaleDateString("en-US", { month: "short" });
                  }}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => {
                    const [year, month] = value.split("-");
                    const date = new Date(year, month - 1);
                    return date.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    });
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#3B82F6"
                  name="New Users"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Login Activity Trend */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Login Activity Trend (Last 30 Days)
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={loginTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  });
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#10B981"
                strokeWidth={2}
                name="Logins"
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Registrations Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Recent User Registrations
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentRegistrations.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                        {user.name?.charAt(0) || "U"}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${ROLE_COLORS[user.role]}20`,
                        color: ROLE_COLORS[user.role],
                      }}
                    >
                      {formatRoleName(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserStatistics;

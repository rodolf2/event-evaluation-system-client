import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/useAuth";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardCard from "../../components/psas/DashboardCard";
import { SkeletonCard } from "../../components/shared/SkeletonLoader";

function MisDashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalEvents: 0,
    systemHealth: "Good",
    recentActivity: [],
  });
  const [thumbnailUrls, setThumbnailUrls] = useState({
    userStats: null,
    systemHealth: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardStats = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/mis/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("MIS Stats Response Status:", response.status);
      const data = await response.json();
      console.log("MIS Stats Response Data:", data);

      if (response.ok && data.success) {
        const statsData = data.data || data;
        setStats({
          totalUsers: statsData.totalUsers || 0,
          activeUsers: statsData.activeUsers || 0,
          totalEvents: statsData.totalEvents || 0,
          systemHealth: statsData.systemHealth || "Good",
          recentActivity: statsData.recentActivity || [],
        });
      } else {
        console.error("API Error:", data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const fetchThumbnails = useCallback(async () => {
    if (!token) return;

    try {
      // Add cache-busting timestamp to ensure fresh thumbnail
      const timestamp = new Date().getTime();
      const userStatsThumb = `/api/thumbnails/user-stats.png?t=${timestamp}&token=${token}`;
      const systemHealthThumb = `/api/thumbnails/system-health.png?t=${timestamp}&token=${token}`;
      setThumbnailUrls({
        userStats: userStatsThumb,
        systemHealth: systemHealthThumb,
      });
    } catch (err) {
      console.error("Error fetching thumbnails:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardStats();
    fetchThumbnails();
  }, [fetchDashboardStats, fetchThumbnails]);

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Welcome Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Welcome, {user?.name || "MIS Administrator"}
                </h1>
                <p className="text-gray-600 mt-1">MIS Portal Dashboard</p>
              </div>
              <div className="flex items-center gap-4">
                <Link to="/mis/notifications" className="relative">
                  <Bell className="w-5 h-5 text-gray-600" />
                </Link>
                <Link
                  to="/mis/user-management"
                  className="bg-blue-950 hover:bg-blue-900 text-white px-4 py-2 rounded-lg transition"
                >
                  Manage Users
                </Link>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-blue-950">
                {stats.totalUsers}
              </div>
              <div className="text-gray-600 mt-2">Total Users</div>
              {stats.totalUsers === 0 && (
                <div className="text-xs text-gray-400 mt-1">
                  No users found in database
                </div>
              )}
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-green-600">
                {stats.activeUsers}
              </div>
              <div className="text-gray-600 mt-2">Active Users</div>
              {stats.activeUsers === 0 && (
                <div className="text-xs text-gray-400 mt-1">
                  No active users found
                </div>
              )}
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-purple-600">
                {stats.totalEvents}
              </div>
              <div className="text-gray-600 mt-2">Total Events</div>
              {stats.totalEvents === 0 && (
                <div className="text-xs text-gray-400 mt-1">
                  No events found in database
                </div>
              )}
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div
                className={`text-3xl font-bold ${
                  stats.systemHealth === "Good"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {stats.systemHealth}
              </div>
              <div className="text-gray-600 mt-2">System Health</div>
            </div>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DashboardCard
              image={thumbnailUrls.userStats}
              title="User Statistics"
              buttonText="View User Analytics"
              link="/mis/reports/users"
            />
            <DashboardCard
              image={thumbnailUrls.systemHealth}
              title="System Health"
              buttonText="View System Reports"
              link="/mis/reports/system"
            />
          </div>

          {/* Recent Activity */}
          {stats.recentActivity.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Recent Activity
              </h2>
              <div className="space-y-4">
                {stats.recentActivity.slice(0, 5).map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm shrink-0">
                      {activity.user?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {activity.user || "System"}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {activity.type || "Activity"}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {stats.recentActivity.length > 5 && (
                <div className="mt-4 text-center">
                  <Link
                    to="/mis/reports/activity"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View All Activity
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/mis/user-management"
                className="bg-blue-950 hover:bg-blue-900 text-white p-4 rounded-lg transition text-center"
              >
                <div className="text-2xl mb-2">👥</div>
                <div>User Management</div>
              </Link>
              <Link
                to="/mis/reports"
                className="bg-blue-950 hover:bg-blue-900 text-white p-4 rounded-lg transition text-center"
              >
                <div className="text-2xl mb-2">📊</div>
                <div>System Reports</div>
              </Link>
              <Link
                to="/mis/settings"
                className="bg-blue-950 hover:bg-blue-900 text-white p-4 rounded-lg transition text-center"
              >
                <div className="text-2xl mb-2">⚙️</div>
                <div>System Settings</div>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default MisDashboard;

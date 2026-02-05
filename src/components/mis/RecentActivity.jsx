import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/useAuth";

const RecentActivity = () => {
  const { token } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let abortController = new AbortController();

    if (token) {
      fetchActivities(abortController.signal);
    } else {
      setLoading(false);
    }

    return () => abortController.abort();
  }, [token]);

  const fetchActivities = async (signal) => {
    // Timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoading(false);
        // Set empty or fallback
      }
    }, 10000);

    try {
      setLoading(true);
      const response = await fetch("/api/mis/recent-activity?limit=5", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 503) {
          throw new Error("Service unavailable");
        }
        throw new Error("Failed to fetch activities");
      }

      const result = await response.json();
      if (result.success) {
        setActivities(result.data);
      } else {
        throw new Error(result.message || "Failed to fetch activities");
      }
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") return;

      console.error("Error fetching activities:", err);
      // Fallback to some default activities if API fails
      setActivities([
        {
          action: "System Ready",
          description: "MIS Dashboard initialized and ready",
          createdAt: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Recent Activity
        </h3>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white shadow rounded-md p-3 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div data-tour="recent-activity">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">
        Recent Activity
      </h3>
      <div className="space-y-2">
        {activities.length > 0 ? (
          activities.map((activity, i) => (
            <div
              key={activity._id || i}
              className="bg-white shadow-sm rounded-lg p-4 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 items-start hover:shadow-md transition-shadow duration-200 border border-gray-100"
            >
              <div className="flex flex-col">
                  <span className="font-bold text-gray-900 text-sm tracking-wide uppercase truncate" title={activity.action}>
                    {activity.action}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    {new Date(activity.createdAt).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
              </div>
              <span className="text-gray-600 text-sm leading-relaxed break-words">
                {activity.description}
              </span>
            </div>
          ))
        ) : (
          <div className="bg-white shadow rounded-md p-3 text-center text-gray-500">
            No recent activities found
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;

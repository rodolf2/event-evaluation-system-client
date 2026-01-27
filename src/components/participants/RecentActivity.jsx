import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/useAuth';

const RecentActivity = () => {
  const { token } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchActivities();
    }
  }, [token]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/activities?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }

      const result = await response.json();
      if (result.success) {
        setActivities(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch activities');
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      // Fallback to some default activities if API fails
      setActivities([
        { action: 'Welcome Aboard!', description: 'First access to account', createdAt: new Date() },
        { action: 'Profile Updated', description: 'Profile information has been updated', createdAt: new Date() }
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
            <div key={i} className="bg-white shadow rounded-md p-3 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
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
              <span className="font-bold text-gray-900 text-sm tracking-wide uppercase">
                {activity.action}
              </span>
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

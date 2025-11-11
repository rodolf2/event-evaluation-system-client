import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { useAuth } from "../../contexts/useAuth";
import { useState, useCallback, useEffect } from "react";

const ClubOfficerLayout = ({ children }) => {
  const { user, token, removeToken } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notification count
  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Count unread notifications
          const unread = result.data.filter((notif) => !notif.isRead).length;
          setUnreadCount(unread);
        }
      }
    } catch (error) {
      console.error("Failed to fetch notification count:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchUnreadCount();
    // Update unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/club-officer/home" className="text-xl font-bold text-gray-900">
                Club Officer Portal
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <Link to="/club-officer/notifications" className="relative">
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              
              {/* User Menu */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">{user?.name}</span>
                <button
                  onClick={removeToken}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
};

export default ClubOfficerLayout;
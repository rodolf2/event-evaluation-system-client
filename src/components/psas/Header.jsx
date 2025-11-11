import { Bell, ChevronDown, Menu } from "lucide-react";
import { useAuth } from "../../contexts/useAuth";
import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";

const Header = ({ onMenuClick, onProfileClick }) => {
  const { user, token, refreshUserData } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const profileRef = useRef(null);

  // Fetch unread notification count
  const fetchUnreadCount = useCallback(async () => {
    try {
      if (!token) return;

      const response = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
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
      console.error("Error fetching unread count:", error);
    }
  }, [token]);

  useEffect(() => {
    refreshUserData();
    fetchUnreadCount();

    const refreshInterval = setInterval(() => {
      refreshUserData();
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [refreshUserData, token, fetchUnreadCount]);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/profile") return "My Account";
    if (path === "/psas/home") return "Home";
    if (path.includes("/evaluations")) return "Evaluations";
    if (path.includes("/certificates")) return "Certificates";
    if (path === "/psas/analytics") return "Event Analytics";
    if (path.includes("/reports")) return "Reports";
    return "Home";
  };

  const handleProfileClick = () => {
    if (profileRef.current) {
      const rect = profileRef.current.getBoundingClientRect();
      onProfileClick(rect);
    }
  };

  return (
    <header className="flex items-center justify-between bg-white shadow-sm p-4 rounded-lg relative z-20 hover:shadow-lg">
      {/* Hamburger + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-gray-100 transition lg:hover:bg-gray-100/50"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="font-semibold text-gray-700 text-lg">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <Link to="/psas/notifications" className="relative">
          <Bell className="w-5 h-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>
        <div className="relative">
          <div
            ref={profileRef}
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleProfileClick}
          >
            <img
              src={user?.profilePicture || "/src/assets/users/user1.jpg"}
              alt="User"
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="font-medium text-gray-700 hidden sm:block">
              {user?.name || "User"}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

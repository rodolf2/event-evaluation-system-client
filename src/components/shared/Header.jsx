import { Bell, ChevronDown, ChevronUp, Menu } from "lucide-react";
import { useAuth } from "../../contexts/useAuth";
import { useSocket } from "../../contexts/SocketContext";
import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../../api";

const Header = ({
  onMenuClick,
  onProfileClick,
  config = {},
  className = "",
  isProfileModalOpen = false,
}) => {
  const { user, token, refreshUserData } = useAuth();
  const socket = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showBadge, setShowBadge] = useState(false);
  const [lastUnreadCount, setLastUnreadCount] = useState(0);
  const location = useLocation();
  const profileRef = useRef(null);

  // Fetch unread notification count
  const fetchUnreadCount = useCallback(async () => {
    try {
      if (!token) return;

      const response = await fetch(`${api.baseURL}/api/notifications/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const newCount = result.data.unread || 0;
          setUnreadCount(newCount);

          // Show badge for 3 seconds when new notifications arrive, but only after a 2-second delay
          if (newCount > lastUnreadCount) {
            setTimeout(() => {
              setShowBadge(true);
              setTimeout(() => setShowBadge(false), 3000);
            }, 2000); // 2-second delay before showing badge
          }

          setLastUnreadCount(newCount);
        }
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, [token]);

  // Initial data fetch
  useEffect(() => {
    refreshUserData();
    fetchUnreadCount();
  }, [refreshUserData, token, fetchUnreadCount]);

  // Real-time updates via socket (replaces polling)
  useEffect(() => {
    if (socket) {
      socket.on("user-updated", () => {
        console.log("👤 User updated via socket");
        refreshUserData();
      });
      socket.on("notification-received", () => {
        console.log("🔔 Notification received via socket");
        fetchUnreadCount();
      });
      return () => {
        socket.off("user-updated");
        socket.off("notification-received");
      };
    }
  }, [socket, refreshUserData, fetchUnreadCount]);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/profile") return "My Account";

    // Use config.pageTitles if provided, otherwise fallback to default logic
    if (config.pageTitles) {
      for (const [route, title] of Object.entries(config.pageTitles)) {
        if (path === route) return title;
        if (route.startsWith("*") && path.includes(route.slice(1)))
          return title;
      }
    }

    return config.defaultTitle || "Home";
  };

  const handleProfileClick = () => {
    if (profileRef.current) {
      const rect = profileRef.current.getBoundingClientRect();
      onProfileClick(rect);
    }
  };

  const getNotificationLink = () => {
    // Check user role to determine correct notifications path
    if (user?.role === "club-officer") {
      return "/club-officer/notifications";
    }
    if (user?.role === "senior-management") {
      return "/senior-management/notifications";
    }
    if (user?.role === "psas") {
      return "/psas/notifications";
    }
    if (user?.role === "mis") {
      return "/mis/notifications";
    }
    return config.notificationPath
      ? `/psas/notifications`
      : `/student/notifications`;
  };

  const notificationLink = getNotificationLink();

  return (
    <header
      data-tour="header"
      className={`sticky top-0 flex items-center justify-between bg-white shadow-sm p-4 rounded-lg z-20 hover:shadow-lg ${className}`}
    >
      {/* Hamburger + Title */}
      <div className="flex items-center gap-3">
        <button
          data-tour="sidebar-toggle"
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
        <Link to={notificationLink} className="relative">
          <Bell className="w-5 h-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
          {showBadge && (
            <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
          )}
        </Link>
        <div className="relative">
          <div
            ref={profileRef}
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleProfileClick}
          >
            <img
              src={
                user?.profilePicture ||
                "https://via.placeholder.com/32x32?text=U"
              }
              alt="User"
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="font-medium text-gray-700 hidden sm:block">
              {user?.name || "User"}
            </span>
            {isProfileModalOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-500 hidden sm:block" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

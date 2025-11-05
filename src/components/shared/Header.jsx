import { Bell, ChevronDown, Menu } from "lucide-react";
import { useAuth } from "../../contexts/useAuth";
import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

const Header = ({ onMenuClick, onProfileClick, config = {}, className = "" }) => {
  const { user, refreshUserData } = useAuth();
  const location = useLocation();
  const profileRef = useRef(null);

  useEffect(() => {
    refreshUserData();
    const refreshInterval = setInterval(() => {
      refreshUserData();
    }, 30000);
    return () => clearInterval(refreshInterval);
  }, [refreshUserData]);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/profile") return "My Account";

    // Use config.pageTitles if provided, otherwise fallback to default logic
    if (config.pageTitles) {
      for (const [route, title] of Object.entries(config.pageTitles)) {
        if (path === route) return title;
        if (route.startsWith('*') && path.includes(route.slice(1))) return title;
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

  const notificationLink = config.notificationPath ? `/psas/notifications` : `/participant/notifications`;

  return (
    <header className={`sticky top-0 flex items-center justify-between bg-white shadow-sm p-4 rounded-lg z-20 hover:shadow-lg ${className}`}>
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
        <Link to={notificationLink}>
          <Bell className="w-5 h-5 text-gray-600" />
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

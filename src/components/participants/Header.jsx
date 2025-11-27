import { Bell, ChevronDown, Menu } from "lucide-react";
import { useAuth } from "../../contexts/useAuth";
import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

const Header = ({ onMenuClick, onProfileClick }) => {
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
    if (path.includes("/participant/home")) return "Home";
    if (path.includes("/participant/evaluations")) return "My Evaluations";
    if (path.includes("/participant/certificates")) return "My Certificates";
    if (path.includes("/participant/badges")) return "My Badges";
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
        <Link to="/participant/notifications">
          <Bell className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="relative">
          <div
            ref={profileRef}
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleProfileClick}
          >
            <img
              src={user?.profilePicture || "https://via.placeholder.com/32x32?text=U"}
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

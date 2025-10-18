import { Bell, ChevronDown, Menu } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ProfileIcon from "../../assets/icons/profile-icon.svg?react";
import LogoutIcon from "../../assets/icons/logout-icon.svg?react";

const Header = ({ onMenuClick }) => {
  const { user, removeToken } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/profile") return "My Account";
    if (path === "/psas") return "Home";
    if (path.includes("/evaluations")) return "Evaluations";
    if (path.includes("/certificates")) return "Certificates";
    if (path === "/psas/analytics") return "Event Analytics";
    if (path.includes("/reports")) return "Reports";
    return "Home";
  };

  return (
    <header className="flex items-center justify-between bg-white shadow-sm p-4 rounded-lg relative z-20">
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
        <Bell className="w-5 h-5 text-gray-600" />
        <div className="relative">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <img
              src={user?.avatar || "/src/assets/users/user1.jpg"}
              alt="User"
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="font-medium text-gray-700 hidden sm:block">
              {user?.name || "User"}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
          </div>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <ProfileIcon className="w-5 h-5" />
                <span>Profile</span>
              </Link>
              <button
                onClick={removeToken}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogoutIcon className="w-5 h-5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

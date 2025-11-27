import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import ProfileIcon from "../../assets/icons/profile-icon.svg?react";
import LogoutIcon from "../../assets/icons/logout-icon.svg?react";
import { LuLogOut } from "react-icons/lu";

const ProfileModal = ({ isOpen, onClose, position }) => {
  const { user, removeToken } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      className="absolute mt-2 w-86 bg-white rounded-lg shadow-lg py-4 z-50"
      style={position}
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
    >
      <div className="flex items-center gap-3 px-4 pb-4 border-b border-gray-200">
        <img
          src={user?.profilePicture || "https://via.placeholder.com/48x48?text=U"}
          alt="User"
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">
            {user?.name || "User"}
          </span>
          <span className="text-sm text-gray-500">
            {user?.email || "user@laverdad.edu.ph"}
          </span>
        </div>
      </div>
      <div className="pt-2">
        <Link
          to={
            user?.role === "psas"
              ? "/psas/profile"
              : user?.role === "club-officer"
              ? "/club-officer/profile"
              : user?.role === "school-admin"
              ? "/school-admin/profile"
              : "/profile"
          }
          onClick={onClose} // Close modal on navigation
          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg mx-2"
        >
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
            <ProfileIcon className="w-5 h-5 text-white" />
          </div>
          <span className="font-medium">Profile</span>
        </Link>
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg mx-2"
        >
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
            <LogoutIcon className="w-5 h-5 text-white -mr-1" />
          </div>
          <span className="font-medium">Log out</span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 bg-[#F4F4F5]/10 flex items-center justify-center z-9999"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl p-6 max-w-xs w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4">
                <LuLogOut className="w-12 h-12 text-gray-800" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Confirm Logout
              </h2>
              <p className="text-gray-600 mb-6 text-sm">
                Are you sure you want to log out?
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => {
                    removeToken();
                    setShowLogoutConfirm(false);
                    onClose();
                  }}
                  className="flex-1 bg-[#006C55] hover:bg-[#005a47] text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 bg-[#A72929] hover:bg-[#8f2323] text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileModal;

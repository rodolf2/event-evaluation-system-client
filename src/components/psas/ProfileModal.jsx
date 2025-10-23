import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import ProfileIcon from "../../assets/icons/profile-icon.svg?react";
import LogoutIcon from "../../assets/icons/logout-icon.svg?react";

const ProfileModal = ({ isOpen, onClose, position }) => {
  const { user, removeToken } = useAuth();

  if (!isOpen) return null;

  return (
    <div
      className="absolute mt-2 w-80 bg-white rounded-lg shadow-lg py-4 z-50"
      style={position}
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
    >
      <div className="flex items-center gap-3 px-4 pb-4 border-b border-gray-200">
        <img
          src={user?.profilePicture || "/src/assets/users/user1.jpg"}
          alt="User"
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{user?.name || "User"}</span>
          <span className="text-sm text-gray-500">{user?.email || "user@laverdad.edu.ph"}</span>
        </div>
      </div>
      <div className="pt-2">
        <Link
          to="/profile"
          onClick={onClose} // Close modal on navigation
          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg mx-2"
        >
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
            <ProfileIcon className="w-5 h-5 text-white" />
          </div>
          <span className="font-medium">Profile</span>
        </Link>
        <button
          onClick={() => {
            removeToken();
            onClose();
          }}
          className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg mx-2"
        >
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
            <LogoutIcon className="w-5 h-5 text-white -mr-1" />
          </div>
          <span className="font-medium">Log out</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;

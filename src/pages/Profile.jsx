import { Camera, ChevronRight } from "lucide-react";
import { useAuth } from "../contexts/useAuth";
import PSASLayout from "../components/psas/PSASLayout";
import ParticipantLayout from "../components/participants/ParticipantLayout";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Import badge images (only for participants and club officers)
import BronzeBadge from "../assets/badges/BRONZE.png";
import SilverBadge from "../assets/badges/SILVER.png";
import GoldBadge from "../assets/badges/GOLD.png";
import TitaniumBadge from "../assets/badges/TITANIUM.png";
import PlatinumBadge from "../assets/badges/PLATINUM.png";

// A simple toggle switch component
const ToggleSwitch = ({ label, enabled, setEnabled }) => (
  <div className="flex items-center justify-between py-3">
    <span className="text-gray-600">{label}</span>
    <button
      onClick={() => setEnabled(!enabled)}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none ${
        enabled ? "bg-blue-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);

function Profile() {
  const { user, token } = useAuth();
  const [muteNotifications, setMuteNotifications] = useState(false);
  const [muteReminders, setMuteReminders] = useState(false);
  const [acquiredBadges, setAcquiredBadges] = useState([]);
  const [loadingBadges, setLoadingBadges] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);

  // Edit mode states
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedInfo, setEditedInfo] = useState({
    department: "",
    position: "",
    country: "",
    timezone: "",
  });

  // Initialize edited info when user data loads
  useEffect(() => {
    if (user) {
      setEditedInfo({
        department: user.department || "",
        position: user.position || "",
        country: user.country || "Philippines",
        timezone: user.timezone || "Asia/Manila",
      });
      // Load notification preferences
      setMuteNotifications(user.muteNotifications || false);
      setMuteReminders(user.muteReminders || false);
    }
  }, [user]);

  // Map theme to appropriate border color (same as in Badges.jsx)
  const getBorderColor = (theme) => {
    const colorMap = {
      bronze: "border-amber-600",
      silver: "border-gray-400",
      gold: "border-yellow-500",
      titanium: "border-gray-500",
      platinum: "border-gray-300",
    };
    return colorMap[theme] || "border-blue-200";
  };

  // Badge configurations (same as in Badges.jsx)
  const baseBadgeConfig = [
    { name: "Bronze", icon: BronzeBadge, highlighted: true, theme: "bronze" },
    { name: "Silver", icon: SilverBadge, theme: "silver" },
    { name: "Gold", icon: GoldBadge, theme: "gold" },
    { name: "Titanium", icon: TitaniumBadge, theme: "titanium" },
    { name: "Platinum", icon: PlatinumBadge, theme: "platinum" },
  ];

  // Fetch completion count and calculate acquired badges
  const fetchBadgeData = async () => {
    if (!token) return;

    try {
      setLoadingBadges(true);
      const headers = new Headers();
      if (token) {
        headers.append("Authorization", `Bearer ${token}`);
      }
      headers.append("Content-Type", "application/json");

      const response = await fetch("/api/forms/completion-stats", {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (!response.ok) return;

      const data = await response.json();
      const completedCount = data?.data?.completedCount || 0;

      // Calculate which badges are acquired
      const acquired = baseBadgeConfig
        .map((badge, index) => {
          const target = (index + 1) * 5;
          return {
            ...badge,
            target,
            unlocked: completedCount >= target,
          };
        })
        .filter((badge) => badge.unlocked);

      setAcquiredBadges(acquired);
    } catch (err) {
      console.error("Error fetching badge data:", err);
    } finally {
      setLoadingBadges(false);
    }
  };

  // Fetch badge data when component mounts
  useEffect(() => {
    if (
      (user?.role === "participant" || user?.role === "club-officer") &&
      token
    ) {
      fetchBadgeData();
    }
  }, [user, token]);

  // Handle edit mode toggle
  const handleEditClick = () => {
    setIsEditingInfo(true);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditingInfo(false);
    // Reset to original values
    setEditedInfo({
      department: user.department || "",
      position: user.position || "",
      country: user.country || "Philippines",
      timezone: user.timezone || "Asia/Manila",
    });
  };

  // Handle save edited information
  const handleSaveInfo = async () => {
    if (!token) return;

    try {
      setIsSaving(true);
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editedInfo),
      });

      const data = await response.json();

      if (data.success) {
        // Update local storage with new user data
        localStorage.setItem("user", JSON.stringify(data.data.user));
        // Force an immediate UI update by refreshing user data
        window.location.reload();
      } else {
        console.error("Failed to update profile:", data.message);
        alert("Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Get role-based display text
  const getRoleDisplay = (role) => {
    const roleMap = {
      participant: "Participant",
      "club-officer": "Club Officer",
      psas: "PSAS Staff",
      "school-admin": "School Administrator",
      mis: "MIS Staff",
    };
    return roleMap[role] || role;
  };

  const getAccessLevelDisplay = (role) => {
    if (role === "mis" || role === "school-admin")
      return "Administrative Access";
    if (role === "psas") return "Staff Access";
    if (role === "club-officer") return "Officer Access";
    return "User Access";
  };

  // Handle profile picture change
  const handleProfilePictureClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = handleFileSelect;
    input.click();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    try {
      setUploadingPicture(true);

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;

        // Upload to server
        const response = await fetch("/api/auth/profile/picture", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ profilePicture: base64String }),
        });

        const data = await response.json();

        if (data.success) {
          // Update local storage
          localStorage.setItem("user", JSON.stringify(data.data.user));
          // Reload to update UI
          window.location.reload();
        } else {
          alert(data.message || "Failed to upload profile picture");
          setUploadingPicture(false);
        }
      };

      reader.onerror = () => {
        alert("Error reading file");
        setUploadingPicture(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert("Error uploading profile picture");
      setUploadingPicture(false);
    }
  };

  if (!user) {
    return (
      <PSASLayout>
        <div className="flex justify-center items-center h-full">
          <p>Loading user profile...</p>
        </div>
      </PSASLayout>
    );
  }

  const badgesLink =
    user.role === "participant" || user.role === "club-officer"
      ? "/participant/badges"
      : null;

  // Use role-specific layout so participants do NOT see the PSAS sidebar/layout.
  const LayoutComponent =
    user.role === "participant" || user.role === "club-officer"
      ? ParticipantLayout
      : PSASLayout;

  return (
    <LayoutComponent>
      <div className="bg-gray-50 min-h-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-4">
            {/* My Profile Header */}
            <div className="bg-white rounded-xl shadow-md p-4 text-center">
              <h2 className="text-xl font-bold text-gray-800">My Profile</h2>
            </div>
            {/* Profile Details Card */}
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto mb-4">
                <img
                  src={user.profilePicture || "/src/assets/users/user1.jpg"}
                  alt="Profile"
                  className="w-full h-full rounded-lg object-cover border-4 border-white shadow-sm"
                />
                <button
                  onClick={handleProfilePictureClick}
                  disabled={uploadingPicture}
                  className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Change profile picture"
                >
                  {uploadingPicture ? (
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Camera className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                {user.name}
              </h3>
              <p className="text-gray-500 mt-1">
                {user.position || getRoleDisplay(user.role)}
              </p>
              {user.department && (
                <p className="text-gray-500">{user.department}</p>
              )}
            </div>
            {/* Account Settings Header */}
            <div className="bg-white rounded-xl shadow-md p-4 text-center">
              <h2 className="text-xl font-bold text-gray-800">
                Account Settings
              </h2>
            </div>
            {/* Toggles Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="divide-y divide-gray-200">
                <ToggleSwitch
                  label="Mute Notifications?"
                  enabled={muteNotifications}
                  setEnabled={async (newValue) => {
                    setMuteNotifications(newValue);
                    if (!token) return;
                    try {
                      await fetch("/api/auth/profile", {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ muteNotifications: newValue }),
                      });
                      const updatedUser = {
                        ...user,
                        muteNotifications: newValue,
                      };
                      localStorage.setItem("user", JSON.stringify(updatedUser));
                    } catch (error) {
                      console.error(
                        "Error updating notification preference:",
                        error
                      );
                      setMuteNotifications(!newValue);
                    }
                  }}
                />
                <ToggleSwitch
                  label="Mute Reminders?"
                  enabled={muteReminders}
                  setEnabled={async (newValue) => {
                    setMuteReminders(newValue);
                    if (!token) return;
                    try {
                      await fetch("/api/auth/profile", {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ muteReminders: newValue }),
                      });
                      const updatedUser = { ...user, muteReminders: newValue };
                      localStorage.setItem("user", JSON.stringify(updatedUser));
                    } catch (error) {
                      console.error(
                        "Error updating reminder preference:",
                        error
                      );
                      setMuteReminders(!newValue);
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Personal Information Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Personal Information
                </h2>
                {!isEditingInfo ? (
                  <button
                    onClick={handleEditClick}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400 transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveInfo}
                      disabled={isSaving}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <label className="block text-gray-500 font-medium">
                    Email Address
                  </label>
                  <p className="text-gray-800 font-semibold mt-1">
                    {user.email}
                  </p>
                </div>
                <div>
                  <label className="block text-gray-500 font-medium">
                    Position
                  </label>
                  {isEditingInfo ? (
                    <input
                      type="text"
                      value={editedInfo.position}
                      onChange={(e) =>
                        setEditedInfo({
                          ...editedInfo,
                          position: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                      placeholder="e.g., Department Head, Student"
                    />
                  ) : (
                    <p className="text-gray-800 font-semibold mt-1">
                      {user.position || getRoleDisplay(user.role)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-500 font-medium">
                    {user.role === "participant" || user.role === "club-officer"
                      ? "Club"
                      : "Department"}
                  </label>
                  {isEditingInfo ? (
                    <input
                      type="text"
                      value={editedInfo.department}
                      onChange={(e) =>
                        setEditedInfo({
                          ...editedInfo,
                          department: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                      placeholder={
                        user.role === "participant" ||
                        user.role === "club-officer"
                          ? "e.g., Student Council, Drama Club"
                          : "e.g., Student Affairs"
                      }
                    />
                  ) : (
                    <p className="text-gray-800 font-semibold mt-1">
                      {user.department || "Not specified"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-500 font-medium">
                    Access Level
                  </label>
                  <p className="text-gray-800 font-semibold mt-1">
                    {getAccessLevelDisplay(user.role)}
                  </p>
                </div>
                <div>
                  <label className="block text-gray-500 font-medium">
                    Country
                  </label>
                  {isEditingInfo ? (
                    <input
                      type="text"
                      value={editedInfo.country}
                      onChange={(e) =>
                        setEditedInfo({
                          ...editedInfo,
                          country: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                    />
                  ) : (
                    <p className="text-gray-800 font-semibold mt-1">
                      {user.country || "Philippines"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-500 font-medium">
                    Timezone
                  </label>
                  {isEditingInfo ? (
                    <input
                      type="text"
                      value={editedInfo.timezone}
                      onChange={(e) =>
                        setEditedInfo({
                          ...editedInfo,
                          timezone: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                    />
                  ) : (
                    <p className="text-gray-800 font-semibold mt-1">
                      {user.timezone || "Asia/Manila"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Evaluation Badges Card - Only show for participants and club officers */}
            {(user.role === "participant" || user.role === "club-officer") && (
              <div className="bg-white rounded-xl shadow-md px-8 py-12">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    Evaluation Badges
                  </h2>
                  <Link
                    to={badgesLink}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    View My Badges <ChevronRight className="w-5 h-5 ml-1" />
                  </Link>
                </div>

                {loadingBadges ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : acquiredBadges.length > 0 ? (
                  <div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      {acquiredBadges.map((badge, index) => (
                        <div
                          key={index}
                          className="flex flex-col items-center text-center"
                        >
                          <img
                            src={badge.icon}
                            alt={badge.name}
                            className={`w-16 h-16 rounded-full mb-2 border-2 ${getBorderColor(
                              badge.theme
                            )}`}
                          />
                          <p className="text-sm font-medium text-gray-800">
                            {badge.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 text-center text-gray-500 py-8">
                    <p className="text-sm">
                      Start completing evaluation forms to unlock your first
                      badge.
                    </p>
                    <p className="text-xs">
                      Your earned badges will appear here once unlocked.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </LayoutComponent>
  );
}

export default Profile;

import { useCallback } from "react";
import { useAuth } from "../../contexts/useAuth";

function ProfileSection() {
  const { user } = useAuth();

  console.log("🔍 Participants ProfileSection rendering, user:", user);

  const getEmailHash = useCallback((email) => {
    let hash = 0;
    if (!email || email.length === 0) return hash;

    for (let i = 0; i < email.length; i++) {
      const char = email.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }, []);

  const emailHash = getEmailHash(user?.email);
  const gravatarUrl = `https://www.gravatar.com/avatar/${emailHash}?d=identicon&s=200`;

  const avatarUrl = user?.profilePicture || gravatarUrl;

  return (
    <div
      className="bg-white rounded-lg shadow-md p-4 flex items-center space-x-4"
      data-testid="participant-profile-section"
    >
      <img
        src={avatarUrl}
        alt={user?.name}
        className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
        onError={(e) => {
          e.target.style.display = "none";
          e.target.nextSibling.style.display = "flex";
        }}
      />
      <div
        className="w-12 h-12 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center"
        style={{ display: "none" }}
      >
        <span className="text-white font-semibold text-lg">
          {user?.name?.[0]?.toUpperCase() || "U"}
        </span>
      </div>
      <p className="text-lg font-semibold text-gray-800">
        Hi, {user?.name || "User"}!
      </p>
    </div>
  );
}

export default ProfileSection;

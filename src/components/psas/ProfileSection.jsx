import { useEffect } from "react";
import { useAuth } from "../../contexts/useAuth";

function ProfileSection() {
  const { user, refreshUserData } = useAuth();

  // Refresh user data periodically
  useEffect(() => {
    refreshUserData();
    const interval = setInterval(() => {
      refreshUserData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [refreshUserData]);

  if (!user) {
    return <div className="animate-pulse bg-gray-200 h-16 rounded-lg"></div>;
  }

  // Generate avatar URL based on email
  const getEmailHash = (email) => {
    let hash = 0;
    if (!email || email.length === 0) return hash;
    
    for (let i = 0; i < email.length; i++) {
      const char = email.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  };

  const emailHash = getEmailHash(user.email);
  const gravatarUrl = `https://www.gravatar.com/avatar/${emailHash}?d=identicon&s=200`;
  
  // Use Gravatar or fallback to UI Avatars
  const avatarUrl = user.profilePicture || gravatarUrl;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center space-x-4">
        <img 
          src={avatarUrl} 
          alt={user.name} 
          className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
        />
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-800">Hi, {user.name}!</h2>
        </div>
      </div>
    </div>
  );
}

export default ProfileSection;
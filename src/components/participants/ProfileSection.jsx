import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../contexts/useAuth";

function ProfileSection() {
  const { user, refreshUserData } = useAuth();
  const [activityLevel, setActivityLevel] = useState(0);
  const activityTimer = useRef(null);
  const dataUpdateInterval = useRef(null);
  const activityCount = useRef(0);

  // Generate MD5 hash for Gravatar
  const getEmailHash = useCallback((email) => {
    // Simple hash function for demo purposes
    // In production, use a proper MD5 hash library
    let hash = 0;
    if (!email || email.length === 0) return hash;

    for (let i = 0; i < email.length; i++) {
      const char = email.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }, []);

  // Dynamic data refresh based on user activity
  const dynamicRefresh = useCallback(() => {
    refreshUserData();
    // Increase refresh frequency based on activity level
    const refreshInterval = activityLevel > 5 ? 15000 : 30000;

    if (dataUpdateInterval.current) {
      clearInterval(dataUpdateInterval.current);
    }

    dataUpdateInterval.current = setInterval(() => {
      refreshUserData();
    }, refreshInterval);

    return () => {
      if (dataUpdateInterval.current) {
        clearInterval(dataUpdateInterval.current);
      }
    };
  }, [refreshUserData, activityLevel]);

  // Update activity metrics
  const updateActivityMetrics = useCallback(() => {
    activityCount.current += 1;

    // Reset timer if exists
    if (activityTimer.current) {
      clearTimeout(activityTimer.current);
    }

    // Set timer to update activity level
    activityTimer.current = setTimeout(() => {
      setActivityLevel(Math.min(10, activityCount.current / 5));
      activityCount.current = Math.max(0, activityCount.current - 1);
    }, 5000);
  }, []);

  // Initialize activity tracking
  useEffect(() => {
    updateActivityMetrics();

    // Track user interactions
    const handleUserActivity = () => {
      updateActivityMetrics();
    };

    // Listen for various user interactions
    window.addEventListener("click", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);
    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("scroll", handleUserActivity);

    return () => {
      window.removeEventListener("click", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("scroll", handleUserActivity);

      if (activityTimer.current) {
        clearTimeout(activityTimer.current);
      }
    };
  }, [updateActivityMetrics]);

  // Dynamic data refresh
  useEffect(() => {
    return dynamicRefresh();
  }, [dynamicRefresh]);


  if (!user) {
    return <div className="animate-pulse bg-gray-200 h-24 rounded-lg"></div>;
  }

  // Generate avatar URL based on email with dynamic sizing
  const emailHash = getEmailHash(user.email);
  const size = Math.max(100, 200 - activityLevel * 10); // Dynamic size based on activity
  const gravatarUrl = `https://www.gravatar.com/avatar/${emailHash}?d=identicon&s=${size}`;

  // Use Gravatar or fallback to UI Avatars with dynamic parameters
  const avatarUrl = user.profilePicture || gravatarUrl;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex items-center space-x-4">
      <img
        src={avatarUrl}
        alt={user.name}
        className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center" style={{ display: 'none' }}>
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

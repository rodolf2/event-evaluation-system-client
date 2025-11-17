import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../contexts/useAuth";

function ProfileSection() {
  const { user, refreshUserData } = useAuth();
  const [lastActivity, setLastActivity] = useState("Just now");
  const [isExpanded, setIsExpanded] = useState(false);
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
      hash = ((hash << 5) - hash) + char;
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
    setLastActivity("Just now");
    
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

  // Handle profile expansion toggle
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    updateActivityMetrics();
  };

  if (!user) {
    return <div className="animate-pulse bg-gray-200 h-24 rounded-lg"></div>;
  }

  // Generate avatar URL based on email with dynamic sizing
  const emailHash = getEmailHash(user.email);
  const size = Math.max(100, 200 - (activityLevel * 10)); // Dynamic size based on activity
  const gravatarUrl = `https://www.gravatar.com/avatar/${emailHash}?d=identicon&s=${size}`;
  
  // Use Gravatar or fallback to UI Avatars with dynamic parameters
  const avatarUrl = user.profilePicture || gravatarUrl;

  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-4 mb-6 transition-all duration-300 hover:shadow-lg ${
        isExpanded ? 'scale-105' : ''
      }`}
    >
      <div className="flex items-center space-x-4">
        <img 
          src={avatarUrl} 
          alt={user.name} 
          className={`rounded-full object-cover border-2 transition-all duration-300 ${
            isExpanded ? 'w-20 h-20 border-blue-600' : 'w-16 h-16 border-blue-500'
          }`}
          onClick={toggleExpand}
        />
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
          <p className="text-sm text-gray-600">{user.email}</p>
          <div className="flex items-center mt-1">
            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
              activityLevel > 5 ? 'bg-green-500 animate-pulse' : 'bg-green-400'
            }`}></span>
            <span className="text-xs text-gray-500">
              Active {lastActivity} {activityLevel > 7 && '(high activity)'}
            </span>
          </div>
        </div>
      </div>
      
      <div className={`mt-4 pt-4 border-t border-gray-100 transition-all duration-300 ${
        isExpanded ? 'opacity-100' : 'opacity-90'
      }`}>
        <div className="flex justify-between text-sm">
          <div>
            <p className="font-medium text-gray-700">Role</p>
            <p className="text-gray-600">{user.role}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Status</p>
            <p className="text-gray-600">{user.isActive ? "Active" : "Inactive"}</p>
          </div>
          <div>
            <button 
              className="px-3 py-1 bg-blue-500 text-white rounded-md text-xs hover:bg-blue-600 transition-colors"
              onClick={() => {
                updateActivityMetrics();
                refreshUserData();
              }}
            >
              {isExpanded ? "Update Profile" : "View Full Profile"}
            </button>
          </div>
        </div>
        
        {isExpanded && (
          <div className="mt-4 pt-2 border-t border-gray-100 animate-fadeIn">
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Activity Level:</span>
              <span className="ml-2">{Array(Math.ceil(activityLevel)).fill('●').join('')}</span>
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Last Updated:</span>
              <span className="ml-2">{new Date().toLocaleTimeString()}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileSection;
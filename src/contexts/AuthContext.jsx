import { useState, useEffect, useCallback, useRef } from "react";
import { AuthContext } from "./AuthContextDefinition";
import { toast } from "react-hot-toast";

// Session timeout configuration
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes inactivity
const CHECK_INTERVAL_MS = 60 * 1000; // Check every 60 seconds
const ACTIVITY_KEY = "lastActivityTime";
const TOKEN_EXPIRY_WARNING_MS = 5 * 60 * 1000; // Warn when 5 minutes left
const TOKEN_REFRESH_BUFFER_MS = 2 * 60 * 1000; // Refresh when 2 minutes left


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true); // Always start loading to check auth status
  const [systemStatus, setSystemStatus] = useState({
    active: false,
    message: "",
    type: "normal", // 'maintenance' or 'lockdown'
  });
  const sessionCheckIntervalRef = useRef(null);
  const tokenRef = useRef(token);

  // Update tokenRef whenever token state changes
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  const fetchUser = useCallback(async (tokenToUse = null) => {
    // Rely on cookie for auth, so no token check needed here


    // Don't fetch if we already have user data (unless forced refresh needed?)
    // Actually, we should probably verify token validity on mount?
    // But for now, stick to existing logic to minimize diff.

    try {
      const API_BASE_URL =
        import.meta.env.VITE_API_URL ||
        import.meta.env.VITE_API_BASE_URL ||
        "http://localhost:5000";
      
      // Use provided token, or current ref, or state
      const activeToken = tokenToUse || tokenRef.current || token;

      if (!activeToken) {
        console.log("[AUTH-CONTEXT] No token available, skipping profile fetch");
        setIsLoading(false);
        return;
      }
      
      
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });

      const data = await response.json();

      if (response.status === 503) {
        setSystemStatus({
          active: true,
          message: data.message,
          type: data.message.includes("lockdown") ? "lockdown" : "maintenance",
        });
        setIsLoading(false);
        // Do not remove token, user is authenticated but system is locked
        return;
      }

      // Explicitly check for auth failures
      if (response.status === 401) {
        console.error("Authentication failed (401), logging out");
        removeToken();
        return;
      }


      // Ignore other server errors/rate limits (e.g., 429, 500, 502) to prevent accidental logout
      if (!response.ok) {
        console.warn(`Server authentication check failed with status: ${response.status}`);
        // Do not removeToken() here. Just return.
        return;
      }

      // Reset system status if successful
      setSystemStatus({ active: false, message: "", type: "normal" });

      if (data.success && data.data.user) {
        // Verify the user data is complete and valid
        const user = data.data.user;
        if (!user.email || !user.role) {
          console.error("Invalid user data received");
          // removeToken(); // Don't logout on bad data? Maybe, but definitely not on network error.
          // For invalid data, we probably DO want to logout as state is corrupted.
          removeToken();
          return;
        }
        // Set default profile picture if none exists
        if (!user.profilePicture) {
          user.profilePicture = `https://ui-avatars.com/api/?name=${encodeURIComponent(
            user.name,
          )}&background=random`;
        }
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
      } else {
        console.error("Failed to fetch user profile, success=false");
        // If the server explicitly says success=false, it might be an auth error or other logic error.
        // We should check the STATUS code primarily. This block runs if response.ok was true but data.success is false?
        // Wait, response.ok triggers for 200-299.
        // If response was 401, it threw? No, fetch doesn't throw on 401.
        // I need to check response status before parsing json.
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      // Only remove token on 401 from the server, which we handle above via response.status check inside catch? 
      // No, fetch doesn't throw on HTTP errors. It throws on network errors.
      // So if we are here, it's a network error (like cancelled request from reload). 
      // WE SHOULD NOT LOGOUT HERE.
      // removeToken(); 
    } finally {
      setIsLoading(false);
    }
  }, [token]); // Still depend on token for lifecycle, but ref handles the "immediate" case
  // Function to refresh user data with error handling
  const refreshUserData = useCallback(async (tokenToUse = null) => {
    try {
      setIsLoading(true);
      await fetchUser(tokenToUse);
    } catch (error) {
      console.error("Error refreshing user data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchUser]);

  // Session timeout helper functions
  const updateActivityTime = useCallback(() => {
    localStorage.setItem(ACTIVITY_KEY, Date.now().toString());
  }, []);

  const checkSessionExpiry = useCallback(() => {
    const lastActivity = localStorage.getItem(ACTIVITY_KEY);
    if (!lastActivity) return false;

    const elapsed = Date.now() - parseInt(lastActivity, 10);
    return elapsed > SESSION_TIMEOUT_MS;
  }, []);

  const handleSessionExpired = useCallback(() => {
    if (sessionCheckIntervalRef.current) {
      clearInterval(sessionCheckIntervalRef.current);
      sessionCheckIntervalRef.current = null;
    }
    localStorage.clear();
    setUser(null);
    toast.error(
      "Your session has expired due to inactivity. Please log in again.",
      {
        duration: 5000,
      },
    );
    // Redirect to login with session expired message
    window.location.href = "/login?error=session_expired";
  }, []);

  useEffect(() => {
    // Initial check on mount
    refreshUserData(); 
  }, [refreshUserData]);

  // Session timeout effect - only active when user is logged in
  useEffect(() => {
    if (!user) {
      // Clear interval if user logs out
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
        sessionCheckIntervalRef.current = null;
      }
      return;
    }

    // Initialize activity time on login
    if (!localStorage.getItem(ACTIVITY_KEY)) {
      updateActivityTime();
    }

    // Check if session already expired (e.g., on page reload)
    if (checkSessionExpiry()) {
      handleSessionExpired();
      return;
    }

    // Activity event listeners
    const activityEvents = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
    ];

    const handleActivity = () => {
      updateActivityTime();
    };

    // Throttle activity updates to avoid excessive localStorage writes
    let activityThrottleTimeout = null;
    const throttledHandleActivity = () => {
      if (activityThrottleTimeout) return;
      activityThrottleTimeout = setTimeout(() => {
        handleActivity();
        activityThrottleTimeout = null;
      }, 1000); // Update at most once per second
    };

    // Add activity listeners
    activityEvents.forEach((event) => {
      window.addEventListener(event, throttledHandleActivity, {
        passive: true,
      });
    });

    // Periodic session check
    sessionCheckIntervalRef.current = setInterval(() => {
      if (checkSessionExpiry()) {
        handleSessionExpired();
      }
    }, CHECK_INTERVAL_MS);

    // Cleanup
    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, throttledHandleActivity);
      });
      if (activityThrottleTimeout) {
        clearTimeout(activityThrottleTimeout);
      }
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
        sessionCheckIntervalRef.current = null;
      }
    };
  }, [
    user,
    updateActivityTime,
    checkSessionExpiry,
    handleSessionExpired,
  ]);

  const saveToken = (newToken) => {
    localStorage.setItem("token", newToken);
    tokenRef.current = newToken; // Update ref immediately for the next call
    setToken(newToken);
    // Fetch user data WITH the new token immediately to avoid state delay
    refreshUserData(newToken);
  };

  const removeToken = () => {
    // Securely clear all localStorage data
    localStorage.clear();
    
    // Clear interval if running
    if (sessionCheckIntervalRef.current) {
      clearInterval(sessionCheckIntervalRef.current);
      sessionCheckIntervalRef.current = null;
    }
    
    // Reset state
    setToken(null);
    setUser(null);

    // Call server logout (informative)
    const API_BASE_URL =
      import.meta.env.VITE_API_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      "http://localhost:5000";

    fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
    }).catch((err) => console.error("Logout error", err));
  };

  const updateUser = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoading,
        systemStatus,
        saveToken,
        removeToken,
        updateUser,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

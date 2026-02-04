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
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(() => {
    // Don't start in loading state by default - use timeout approach
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    return savedToken && !savedUser;
  });
  const [systemStatus, setSystemStatus] = useState({
    active: false,
    message: "",
    type: "normal", // 'maintenance' or 'lockdown'
  });
  const sessionCheckIntervalRef = useRef(null);

  const fetchUser = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    // Don't fetch if we already have user data (unless forced refresh needed?)
    // Actually, we should probably verify token validity on mount?
    // But for now, stick to existing logic to minimize diff.

    try {
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include", // Important: Send cookies for cross-origin requests
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

      // Reset system status if successful
      setSystemStatus({ active: false, message: "", type: "normal" });

      if (data.success && data.data.user) {
        // Verify the user data is complete and valid
        const user = data.data.user;
        if (!user.email || !user.role) {
          console.error("Invalid user data received");
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
        console.error("Failed to fetch user profile");
        removeToken();
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      // Only remove token on auth errors or network mismatch?
      // For safety, catching generic error might mean network down.
      // If network down, maybe show maintenance too? For now, keep removeToken behavior for critical fails.
      removeToken();
    } finally {
      setIsLoading(false);
    }
  }, [token]);
  // Function to refresh user data with error handling
  const refreshUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      await fetchUser();
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
    localStorage.removeItem(ACTIVITY_KEY);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
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
    if (token) {
      // Add a timeout to ensure we don't get stuck in loading state
      const loadingTimeout = setTimeout(() => {
        setIsLoading(false);
      }, 5000); // 5 second timeout

      refreshUserData().finally(() => {
        clearTimeout(loadingTimeout);
      });
    } else {
      setIsLoading(false);
    }
  }, [token, refreshUserData]);

  // Session timeout effect - only active when user is logged in
  useEffect(() => {
    if (!token || !user) {
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
    token,
    user,
    updateActivityTime,
    checkSessionExpiry,
    handleSessionExpired,
  ]);

  const saveToken = (userToken) => {
    if (!userToken) {
      removeToken();
      return;
    }
    localStorage.setItem("token", userToken);
    setToken(userToken);
    refreshUserData(); // Fetch user data with new token
  };

  const removeToken = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem(ACTIVITY_KEY);
    if (sessionCheckIntervalRef.current) {
      clearInterval(sessionCheckIntervalRef.current);
      sessionCheckIntervalRef.current = null;
    }
    setToken(null);
    setUser(null);
  };

  const updateUser = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        saveToken,
        removeToken,
        refreshUserData,
        updateUser,
        isLoading,
        systemStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

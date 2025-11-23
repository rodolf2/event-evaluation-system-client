import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContextDefinition";

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

  const fetchUser = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    // Don't fetch if we already have user data
    if (user) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

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
            user.name
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
      removeToken();
    } finally {
      setIsLoading(false);
    }
  }, [token, user]);
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

  useEffect(() => {
    if (token && !user) {
      // Add a timeout to ensure we don't get stuck in loading state
      const loadingTimeout = setTimeout(() => {
        setIsLoading(false);
      }, 5000); // 5 second timeout

      refreshUserData().finally(() => {
        clearTimeout(loadingTimeout);
      });
    } else if (!token) {
      setIsLoading(false);
    } else if (user) {
      setIsLoading(false);
    }
  }, [token, user, refreshUserData]);

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
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        saveToken,
        removeToken,
        refreshUserData,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

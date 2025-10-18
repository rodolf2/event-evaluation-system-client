import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await fetch(
            "http://localhost:5000/api/auth/profile",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await response.json();

          if (data.success && data.data.user) {
            // Verify the user data is complete and valid
            const user = data.data.user;
            if (!user.email || !user.role) {
              console.error("Invalid user data received");
              removeToken();
              return;
            }
            setUser(user);
          } else {
            console.error("Failed to fetch user profile");
            removeToken();
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          removeToken();
        }
      } else {
        // Clear user data if no token exists
        setUser(null);
      }
    };

    fetchUser();
  }, [token]);

  const saveToken = (userToken) => {
    setToken(userToken);
    localStorage.setItem("token", userToken);
  };

  const removeToken = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, saveToken, removeToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

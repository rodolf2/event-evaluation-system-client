import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

function AuthCallback() {
  const { saveToken, user, isLoading, refreshUserData } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [retryCount, setRetryCount] = useState(0);

  // Get home route based on user role
  const getHomeRoute = (userRole) => {
    switch (userRole) {
      case "psas":
        return "/psas/home";
      case "club-officer":
        return "/club-officer/home";
      case "student":
        return "/student/home";
      case "senior-management":
        return "/senior-management/home";
      case "mis":
        return "/mis";
      case "evaluator":
      case "guest-speaker":
        return "/student/home";
      default:
        return "/login";
    }
  };

  // Determine effective home route
  const homeRoute = user ? getHomeRoute(user.role) : "/login";

  useEffect(() => {
    // Restore token extraction from URL
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      console.log("[AUTH-CALLBACK] Token found in URL, saving...");
      saveToken(token);
    } else if (!isLoading && !user) {
      console.warn("[AUTH-CALLBACK] No token found and not logged in, redirecting to login");
      navigate("/login");
    }
  }, [location, saveToken, isLoading, user, navigate]);

  // Separate effect to handle redirection after user state is populated
  useEffect(() => {
    if (user && !isLoading) {
      handleRedirect();
    }
  }, [user, isLoading]);

  const handleRedirect = () => {
    const redirectTo = localStorage.getItem("redirectTo");
    console.log("[AUTH-CALLBACK] Auth success, redirecting...");

    if (redirectTo) {
      localStorage.removeItem("redirectTo");
      navigate(redirectTo);
    } else {
      navigate(getHomeRoute(user.role));
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "18px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      Processing authentication...
    </div>
  );
}

export default AuthCallback;

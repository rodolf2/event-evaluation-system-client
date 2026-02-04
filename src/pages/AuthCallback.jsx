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
    // Explicitly refresh user data when landing on callback to ensure cookie is picked up
    const initializeAuth = async () => {
      // If we already have a user, proceed immediately
      if (user) {
        handleRedirect();
        return;
      }

      // If still loading or no user, try to refresh
      await refreshUserData();
    };

    initializeAuth();
  }, [refreshUserData]); // Only run on mount (and when refreshUserData changes, which is stable)

  // Separate effect to handle redirection after loading state settles
  useEffect(() => {
    if (!isLoading) {
      if (user) {
        handleRedirect();
      } else {
        // If first attempt failed, try one more time after a short delay
        // This handles cases where the cookie needs a split second to be attached
        if (retryCount < 2) {
          const timer = setTimeout(() => {
            console.log(`[AUTH-CALLBACK] Retrying auth check (${retryCount + 1}/2)...`);
            setRetryCount(prev => prev + 1);
            refreshUserData();
          }, 1000); // Wait 1 second before retry
          return () => clearTimeout(timer);
        } else {
          // If all retries failed
          console.warn("[AUTH-CALLBACK] Auth failed after retries, redirecting to login");
          navigate("/login?error=auth_failed");
        }
      }
    }
  }, [isLoading, user, retryCount]);

  const handleRedirect = () => {
    const redirectTo = localStorage.getItem("redirectTo");
    console.log("[AUTH-CALLBACK] Auth success, redirecting...");
    
    if (redirectTo) {
      localStorage.removeItem("redirectTo");
      navigate(redirectTo);
    } else {
      navigate(user ? getHomeRoute(user.role) : "/login");
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

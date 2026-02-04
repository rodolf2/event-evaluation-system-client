import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

function AuthCallback() {
  const { saveToken, user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [tokenSaved, setTokenSaved] = useState(false);

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
    // Just wait for user data to load (via cookie)
    if (!isLoading) {
      if (user) {
        // Check if there's a stored redirection path
        const redirectTo = localStorage.getItem("redirectTo");
        
        // Navigate with a small delay to ensure state settles
        setTimeout(() => {
          if (redirectTo) {
            console.log("[AUTH-CALLBACK] Redirecting to stored path:", redirectTo);
            localStorage.removeItem("redirectTo");
            navigate(redirectTo);
          } else {
            navigate(homeRoute);
          }
        }, 100);
      } else {
        // If loading finished and no user, auth failed
        console.warn("[AUTH-CALLBACK] No user found after loading, redirecting to login");
        navigate("/login");
      }
    }
  }, [isLoading, user, navigate, homeRoute]);

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

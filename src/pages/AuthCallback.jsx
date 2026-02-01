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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token && !tokenSaved) {
      saveToken(token);
      setTokenSaved(true);
    } else if (!token) {
      navigate("/login");
    }
  }, [location, navigate, saveToken, tokenSaved]);

  // Wait for user data to be loaded before navigating
  useEffect(() => {
    if (tokenSaved && !isLoading && user) {
      // Check if there's a stored redirection path
      const redirectTo = localStorage.getItem("redirectTo");
      
      // Navigate to intended route or role-based home route
      setTimeout(() => {
        if (redirectTo) {
          console.log("[AUTH-CALLBACK] Redirecting to stored path:", redirectTo);
          localStorage.removeItem("redirectTo"); // Clean up
          navigate(redirectTo);
        } else {
          navigate(getHomeRoute(user.role));
        }
      }, 100);
    }
  }, [tokenSaved, isLoading, user, navigate]);

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

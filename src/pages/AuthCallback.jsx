import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

function AuthCallback() {
  const { saveToken, user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [tokenSaved, setTokenSaved] = useState(false);

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
      // Small delay to ensure everything is settled
      setTimeout(() => {
        navigate("/");
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

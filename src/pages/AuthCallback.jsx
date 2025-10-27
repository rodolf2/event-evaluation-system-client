import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

function AuthCallback() {
  const { saveToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      saveToken(token);
      // Add a small delay to ensure token is saved before redirecting
      setTimeout(() => {
        navigate("/");
      }, 100);
    } else {
      navigate("/login");
    }
  }, [location, navigate, saveToken]);

  return <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '18px',
    fontFamily: 'Arial, sans-serif'
  }}>
    Processing authentication...
  </div>;
}

export default AuthCallback;

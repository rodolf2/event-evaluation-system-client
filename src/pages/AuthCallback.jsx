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
      // We'll let the root route handle the redirection based on role
      navigate("/");
    } else {
      navigate("/login");
    }
  }, [location, navigate, saveToken]);

  return <div>Loading...</div>;
}

export default AuthCallback;

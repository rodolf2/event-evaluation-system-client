import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";

function LoginPage() {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [searchParams] = useSearchParams();
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState(null);

  // Check for error parameter in URL (e.g., account_inactive, session_expired, access_denied)
  useEffect(() => {
    const error = searchParams.get("error");
    const message = searchParams.get("message");

    if (error === "account_inactive") {
      toast.error(
        "Your account has been deactivated. Please contact an administrator.",
        { duration: 5000 }
      );
      // Clean up the URL
      window.history.replaceState({}, document.title, "/login");
    } else if (error === "session_expired") {
      setSessionExpiredMessage(
        "Your session has timed out due to inactivity. Please sign in again."
      );
      toast.error("Session timed out. Please sign in again.", {
        duration: 5000,
      });
      // Clean up the URL
      window.history.replaceState({}, document.title, "/login");
    } else if (error === "access_denied") {
      const errorMessage = message
        ? decodeURIComponent(message)
        : "Access denied. You are not authorized to access this system.";
      toast.error(errorMessage, { duration: 8000 });
      setSessionExpiredMessage(errorMessage);
      // Clean up the URL
      window.history.replaceState({}, document.title, "/login");
    } else if (error === "oauth_error") {
      toast.error(
        "An error occurred during authentication. Please try again.",
        { duration: 5000 }
      );
      window.history.replaceState({}, document.title, "/login");
    }

    // Capture redirectTo parameter and store it for redirection after login
    const redirectTo = searchParams.get("redirectTo");
    if (redirectTo) {
      localStorage.setItem("redirectTo", redirectTo);
      console.log("[LOGIN] Stored redirectTo path:", redirectTo);
    }
  }, [searchParams]);

  const handleGoogleLogin = () => {
    window.location.href = `${apiUrl}/api/auth/google`;
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-6 sm:p-8 bg-white">
        <div className="flex flex-col items-center w-full max-w-xs sm:max-w-sm md:max-w-md h-full justify-center">
          {/* Logo */}
          <img
            src="/assets/logo/LOGO.png"
            alt="School Logo"
            className="w-16 h-16 sm:w-20 sm:h-20 mb-4"
          />

          {/* Session Expired Message */}
          {sessionExpiredMessage && (
            <div className="w-full mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 text-sm text-center font-medium">
                ⏱️ {sessionExpiredMessage}
              </p>
            </div>
          )}

          {/* Welcome Text */}
          <h1 className="text-xl sm:text-2xl font-bold mb-2 text-center">
            Welcome!
          </h1>
          <p className="text-gray-600 mb-8 text-center text-sm sm:text-base">
            Sign in with your Google account to continue
          </p>

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full border flex items-center justify-center py-3 rounded-md hover:bg-gray-100 bg-white text-gray-700 font-medium transition"
          >
            <img
              src="/assets/logo/google-logo.png"
              alt="Google"
              className="w-5 h-5 mr-3"
            />
            Sign in with Google
          </button>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 bg-white p-4 sm:p-6 lg:p-8">
        <div className="relative w-full h-full min-h-[50vh] lg:min-h-0 rounded-2xl overflow-hidden flex items-center justify-center">
          {/* Background Image */}
          <img
            src="/assets/background-image/LV2.jpg"
            alt="La Verdad Christian College Background"
            className="w-full h-full object-cover"
          />

          {/* Blue Overlay */}
          <div className="absolute inset-0 bg-blue-950 opacity-80"></div>

          {/* Text Content */}
          <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center p-6">
            <div className="max-w-md">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-extrabold mb-4 text-white uppercase tracking-wider">
                Evaluation System for School and Program Events
              </h2>
              <p className="text-xs sm:text-sm md:text-base lg:text-base mb-8 text-white/90">
                An Intuitive and Engaging Event Evaluation System for La Verdad
                Christian College – Apalit, Pampanga
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

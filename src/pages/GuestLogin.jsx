import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../api";

function GuestLogin() {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "evaluator",
    verificationCode: "",
    accessToken: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenLogin, setIsTokenLogin] = useState(false);

  // Check if there's a token in the URL (for email-based token access)
  const urlToken = searchParams.get('token');

  // If URL token exists, try to authenticate automatically
  useEffect(() => {
    if (urlToken && !isTokenLogin) {
      handleTokenLogin(urlToken);
    }
  }, [urlToken, isTokenLogin]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setFormData({
      ...formData,
      role: role
    });

    // If guest speaker is selected, switch to token-based login
    if (role === "guest-speaker") {
      setIsTokenLogin(true);
    } else {
      setIsTokenLogin(false);
    }
  };

  const handleTokenLogin = async (token) => {
    setIsLoading(true);
    setIsTokenLogin(true);

    try {
      const response = await api.post(
        `${apiUrl}/api/guest/authenticate`,
        { token }
      );

      if (response.data.success) {
        // Store token and redirect
        localStorage.setItem("token", response.data.token);
        toast.success("Login successful!");

        // Redirect to guest speaker report viewer
        navigate(`/guest-access?token=${token}`);
      }
    } catch (error) {
      console.error("Token authentication error:", error);
      toast.error(
        error.response?.data?.message || "Invalid or expired access token"
      );
      // Clear the token from URL if authentication fails
      navigate('/guest-login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      let response;

      if (isTokenLogin || formData.role === "guest-speaker") {
        // Token-based authentication for guest speakers
        if (!formData.accessToken && !urlToken) {
          toast.error("Please enter your access token");
          setIsLoading(false);
          return;
        }

        const token = formData.accessToken || urlToken;
        response = await api.post(
          `${apiUrl}/api/guest/authenticate`,
          { token }
        );
      } else {
        // Existing verification code system for evaluators
        if (!formData.name || !formData.email || !formData.role) {
          toast.error("Please fill in all required fields");
          setIsLoading(false);
          return;
        }

        response = await api.post(
          `${apiUrl}/api/auth/guest`,
          {
            name: formData.name,
            email: formData.email,
            role: formData.role,
            verificationCode: formData.verificationCode,
          }
        );
      }

      if (response.data.success) {
        // Store token
        localStorage.setItem("token", response.data.data?.token || response.data.token);

        // Show success message
        toast.success("Login successful!");

        // Redirect based on role
        if (formData.role === "evaluator") {
          navigate("/participant/home");
        } else if (formData.role === "guest-speaker") {
          navigate(`/guest-access?token=${formData.accessToken || urlToken}`);
        }
      }
    } catch (error) {
      console.error("Guest login error:", error);
      toast.error(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
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

          {/* Welcome Text */}
          <h1 className="text-xl sm:text-2xl font-bold mb-2 text-center">
            {isTokenLogin ? "Guest Speaker Access" : "Guest Login"}
          </h1>
          <p className="text-gray-600 mb-8 text-center text-sm sm:text-base">
            {isTokenLogin
              ? "Enter your access token to view event reports"
              : "Enter your credentials to access designated reports or evaluations"}
          </p>

          {/* Guest Login Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {!isTokenLogin && (
              <>
                {/* Full Name - only for evaluators */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleRoleChange}
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="evaluator">Evaluator</option>
                    <option value="guest-speaker">Guest Speaker</option>
                  </select>
                </div>

                {/* Email - only for evaluators */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                {/* Verification Code - only for evaluators */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Verification Code
                  </label>
                  <input
                    type="text"
                    name="verificationCode"
                    value={formData.verificationCode}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter event verification code"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the verification code provided for the event you attended
                  </p>
                </div>
              </>
            )}

            {/* Access Token - only for guest speakers */}
            {isTokenLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Access Token
                </label>
                <input
                  type="text"
                  name="accessToken"
                  value={formData.accessToken}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your access token from the email"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the access token sent to your email by the PSAS department
                </p>
              </div>
            )}

            {/* Continue Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-950 hover:bg-blue-900 text-white font-medium py-3 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Logging in..." : isTokenLogin ? "Access Reports" : "Continue"}
            </button>
          </form>
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
              <button
                onClick={handleBackToLogin}
                className="bg-[#EF9A08] hover:bg-[#EF9A08]/90 text-black font-bold py-3 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105"
              >
                Back to Log In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuestLogin;

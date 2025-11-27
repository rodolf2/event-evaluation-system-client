import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../api";
import logo from "../assets/logo/LOGO.png";
import bgImage from "../assets/background-image/LV2.jpg";

function GuestLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "evaluator",
    verificationCode: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.name || !formData.email || !formData.role) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/api/auth/guest", {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        verificationCode: formData.verificationCode,
      });

      if (response.data.success) {
        // Store token
        localStorage.setItem("token", response.data.data.token);

        // Show success message
        toast.success("Login successful!");

        // Redirect based on role
        if (formData.role === "evaluator") {
          navigate("/participant/home");
        } else if (formData.role === "guest-speaker") {
          navigate("/participant/home");
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
            src={logo}
            alt="School Logo"
            className="w-16 h-16 sm:w-20 sm:h-20 mb-4"
          />

          {/* Welcome Text */}
          <h1 className="text-xl sm:text-2xl font-bold mb-2 text-center">
            Guest Login
          </h1>
          <p className="text-gray-600 mb-8 text-center text-sm sm:text-base">
            Enter your credentials to access designated reports or evaluations
          </p>

          {/* Guest Login Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {/* Full Name */}
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
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="evaluator">Evaluator</option>
                <option value="guest-speaker">Guest Speaker</option>
              </select>
            </div>

            {/* Email */}
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

            {/* Verification Code */}
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

            {/* Continue Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-950 hover:bg-blue-900 text-white font-medium py-3 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Logging in..." : "Continue"}
            </button>
          </form>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 bg-white p-4 sm:p-6 lg:p-8">
        <div className="relative w-full h-full min-h-[50vh] lg:min-h-0 rounded-2xl overflow-hidden flex items-center justify-center">
          {/* Background Image */}
          <img
            src={bgImage}
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

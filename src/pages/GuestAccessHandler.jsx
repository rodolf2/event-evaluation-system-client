import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { validateGuestToken } from "../api/guestApi";

const GuestAccessHandler = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check for token in URL or localStorage
    const urlToken = searchParams.get("token");
    const storedToken = localStorage.getItem("guestToken");

    const tokenToValidate = urlToken || storedToken;

    if (tokenToValidate) {
      validateToken(tokenToValidate);
    } else {
      setIsLoading(false);
    }
  }, [searchParams]);

  const validateToken = async (token) => {
    setIsValidating(true);
    setError("");

    try {
      const response = await validateGuestToken(token);

      // Store token and access details
      localStorage.setItem("guestToken", token);
      localStorage.setItem("guestAccess", JSON.stringify(response));

      // Redirect based on role
      if (response.role === "speaker") {
        navigate("/guest/reports");
      } else if (response.role === "evaluator") {
        navigate(`/guest/evaluation?formId=${response.reference_id}`);
      }
    } catch (err) {
      // Clear any stored token if validation fails
      localStorage.removeItem("guestToken");
      localStorage.removeItem("guestAccess");

      setError(
        err.response?.data?.message ||
          "Invalid or expired access token. Please request a new link from the event organizer."
      );
      console.error("Token validation failed:", err);
    } finally {
      setIsLoading(false);
      setIsValidating(false);
    }
  };

  const handleManualTokenSubmit = async (e) => {
    e.preventDefault();
    const manualToken = e.target.token.value;
    if (manualToken) {
      validateToken(manualToken);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validating your access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Guest Access
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please use the access link provided in your email or enter your
            token below.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleManualTokenSubmit}>
          <div className="rounded-md shadow-sm">
            <div>
              <label htmlFor="token" className="sr-only">
                Access Token
              </label>
              <input
                id="token"
                name="token"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter your access token manually"
                disabled={isValidating}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isValidating}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidating ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Validating...
                </>
              ) : (
                "Access Event"
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-500">
          <p>Having trouble? Contact the event organizer for assistance.</p>
        </div>
      </div>
    </div>
  );
};

export default GuestAccessHandler;

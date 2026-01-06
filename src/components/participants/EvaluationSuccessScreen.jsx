import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CertificateViewer from "./CertificateViewer";
import { useAuth } from "../../contexts/useAuth";
import toast from "react-hot-toast";

const EvaluationSuccessScreen = ({
  formId,
  onViewCertificates,
  certificateData,
}) => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateAvailable, setCertificateAvailable] = useState(false);
  const [loadingCertificate, setLoadingCertificate] = useState(true);
  const [foundCertificateId, setFoundCertificateId] = useState(null);

  useEffect(() => {
    // Check if certificate is immediately available
    if (certificateData?.certificateId) {
      setCertificateAvailable(true);
      setFoundCertificateId(certificateData.certificateId);
      setLoadingCertificate(false);
    } else {
      // Poll for certificate generation status
      checkCertificateStatus();
    }
  }, [certificateData]);

  const checkCertificateStatus = async () => {
    if (!formId) return;

    try {
      setLoadingCertificate(true);
      const response = await fetch(`/api/certificates/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const userCertificates = data.data || [];
          const formCertificate = userCertificates.find(
            (cert) =>
              cert.formId?._id === formId || cert.eventId?._id === formId
          );

          if (formCertificate) {
            setCertificateAvailable(true);
            setFoundCertificateId(formCertificate.certificateId);
            toast.success("🎉 Your certificate is ready! Click to view it.", {
              duration: 5000,
              icon: "🏆",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error checking certificate status:", error);
    } finally {
      setLoadingCertificate(false);
    }
  };

  const handleViewCertificates = () => {
    setShowCertificate(true);
  };

  const handleViewCertificateDirectly = () => {
    // Navigate to appropriate certificates page based on user role
    // Add fallback check in case user object isn't loaded yet
    const userRole = user?.role;
    let certificatesPath = "/participant/certificates"; // default

    if (userRole === "club-officer") {
      certificatesPath = "/club-officer/certificates/my";
    } else if (userRole === "participant") {
      certificatesPath = "/participant/certificates";
    } else if (userRole === "psas") {
      certificatesPath = "/psas/certificates";
    }

    console.log(
      "Navigating to certificates page:",
      certificatesPath,
      "for user role:",
      userRole
    );
    navigate(certificatesPath);
  };

  const handleDone = () => {
    // Show success message for badge progression
    toast.success("🎉 Great job! Your evaluation is complete!", {
      duration: 4000,
      icon: "🏆",
    });

    if (onViewCertificates) {
      onViewCertificates();
    } else {
      // Navigate to appropriate certificates page based on user role
      const userRole = user?.role;
      let certificatesPath = "/participant/certificates"; // default

      if (userRole === "club-officer") {
        certificatesPath = "/club-officer/certificates/my";
      } else if (userRole === "participant") {
        certificatesPath = "/participant/certificates";
      } else if (userRole === "psas") {
        certificatesPath = "/psas/certificates";
      }

      console.log(
        "Navigating to certificates page:",
        certificatesPath,
        "for user role:",
        userRole
      );
      navigate(certificatesPath);
    }
  };

  const handleDownload = () => {
    // Handle download completion - could show a toast or update state
    toast.success("📥 Certificate downloaded successfully!", {
      duration: 3000,
      icon: "📜",
    });
    console.log("Certificate downloaded successfully");
  };

  // Show certificate viewer if requested
  if (showCertificate) {
    return (
      <CertificateViewer
        certificateId={foundCertificateId}
        onDownload={handleDownload}
        onDone={handleDone}
      />
    );
  }

  // Show success screen
  return (
    <div
      className="w-full flex items-center justify-center bg-white p-8 rounded-lg shadow-sm"
      style={{ minHeight: "calc(100vh - 200px)" }}
    >
      <div className="text-center max-w-4xl">
        <div className="mb-8">
          {/* Success Check Icon */}
          <div className="w-24 h-24 bg-white border-8 border-[#0C2A92] rounded-full mx-auto flex items-center justify-center mb-6">
            <svg
              className="w-12 h-12 text-[#0C2A92]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-[#0C2A92] mb-4">Thank You!</h1>

          <p className="text-xl text-gray-600 mb-4">
            Thank you for taking your time to fill up this evaluation. Your
            response is now
            <br />
            subject for analysis.
          </p>

          <p className="text-gray-600 mb-6 text-xl">
            Your certificate of participation is now ready for viewing, and your
            badge progress has been updated! Please click the button below!
          </p>
        </div>

        {/* Certificate Status Indicator */}
        {loadingCertificate && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
              <p className="text-blue-700">Generating your certificate...</p>
            </div>
          </div>
        )}

        {/* Certificate Available Alert */}
        {certificateAvailable && !loadingCertificate && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-green-700 font-medium">
                Your certificate is ready!
              </p>
            </div>
          </div>
        )}

        {/* Email Sent Confirmation */}
        {certificateAvailable && !loadingCertificate && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <p className="text-blue-700">
                A copy has been sent to your email
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-4">
          <button
            onClick={handleViewCertificates}
            disabled={!certificateAvailable || loadingCertificate}
            className="px-8 py-3 bg-[#0C2A92] text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loadingCertificate ? "Loading..." : "View My Certificate"}
          </button>
          <button
            onClick={handleViewCertificateDirectly}
            className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            Go to My Certificates
          </button>
        </div>
      </div>
    </div>
  );
};

export default EvaluationSuccessScreen;

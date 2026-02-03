import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import CompleteReport from "./reports/CompleteReport";
import GuestLayout from "../components/guest/GuestLayout";

function GuestAccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = searchParams.get("token");

  useEffect(() => {
    const fetchReport = async () => {
      if (!token) {
        setError("No access token provided");
        setLoading(false);
        return;
      }

      try {
        // First validate the token
        const validateResponse = await fetch("/api/guest/validate-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const validateData = await validateResponse.json();

        if (!validateData.success) {
          setError(validateData.message || "Invalid or expired token");
          setLoading(false);
          return;
        }

        // Fetch the full analytics data
        const reportId = validateData.data.reportId;
        const analyticsResponse = await fetch(`/api/guest/report/${token}`);
        const analyticsData = await analyticsResponse.json();

        if (analyticsData.success) {
          const formData = analyticsData.data.report;

          // Fetch full analytics for the form
          const fullAnalyticsResponse = await fetch(
            `/api/analytics/form/${reportId}`,
            {
              headers: { "Content-Type": "application/json" },
            }
          );

          let analyticsResult = null;
          if (fullAnalyticsResponse.ok) {
            const fullData = await fullAnalyticsResponse.json();
            if (fullData.success) {
              analyticsResult = fullData.data;
            }
          }

          // Create report object compatible with CompleteReport
          setReport({
            id: reportId,
            formId: reportId,
            title: formData.title || validateData.data.reportTitle,
            eventDate: formData.eventDates?.[0] || new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            analyticsData: analyticsResult,
            isDynamic: true,
            isGuestView: true,
          });
        } else {
          setError("Failed to load report data");
        }
      } catch (err) {
        console.error("Error fetching report:", err);
        setError(err.message || "Failed to load report");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();

    // Set up periodic health check (every 30 seconds)
    const healthCheckInterval = setInterval(async () => {
      if (!token || error) return;

      try {
        const response = await fetch("/api/guest/validate-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        if (!data.success) {
          setError(data.message || "Access has been revoked or expired");
          setReport(null);
        }
      } catch (err) {
        console.error("Health check failed:", err);
      }
    }, 30000);

    return () => clearInterval(healthCheckInterval);
  }, [token, error]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#1F3463] to-[#2d4a8c]">
        <div className="text-center bg-white p-8 rounded-xl shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1F3463] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading report...</p>
          <p className="text-gray-400 text-sm mt-2">
            Please wait while we retrieve your report
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#1F3463] to-[#2d4a8c]">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Access Error
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate("/guest/access")}
              className="w-full bg-[#1F3463] hover:bg-[#2d4a8c] text-white font-medium py-3 rounded-lg transition"
            >
              Return to Access Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <GuestLayout>
      {report ? (
        <CompleteReport
          report={report}
          onBack={null}
          isGeneratedReport={false}
          isGuestView={true}
        />
      ) : (
        <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow">
          No report data available
        </div>
      )}
    </GuestLayout>
  );
}

export default GuestAccessPage;

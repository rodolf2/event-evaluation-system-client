import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { SkeletonCard, SkeletonText, SkeletonBase } from "./SkeletonLoader";
import { useAuth } from "../../contexts/useAuth";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import StatsCards from "../psas/eventanalytics/StatsCards";
import ChartsSection from "../psas/eventanalytics/ChartsSection";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const EventAnalyticsContent = ({ basePath = "/psas" }) => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formId, setFormId] = useState(null);
  const [availableForms, setAvailableForms] = useState([]);
  const [formsLoading, setFormsLoading] = useState(true);

  // Fetch available forms for the current user
  useEffect(() => {
    const fetchAvailableForms = async () => {
      if (!token) return;

      try {
        const response = await fetch("/api/forms", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch forms");
        }

        const result = await response.json();

        if (result.success && result.data) {
          // Handle both array and object response formats
          const formsArray = Array.isArray(result.data)
            ? result.data
            : result.data.forms || [];

          // Filter to only published forms (since only they have responses)
          const publishedForms = formsArray.filter(
            (form) => form.status === "published"
          );
          setAvailableForms(publishedForms);

          // Auto-select first form if none is selected
          if (publishedForms.length > 0 && !formId) {
            setFormId(publishedForms[0]._id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch available forms:", error);
        setAvailableForms([]);
      } finally {
        setFormsLoading(false);
      }
    };

    fetchAvailableForms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Run when token changes

  // Get form ID from URL params only (no localStorage to avoid custom IDs)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlFormId = urlParams.get("formId");

    if (urlFormId && /^[0-9a-fA-F]{24}$/.test(urlFormId)) {
      setFormId(urlFormId);
    }
    // Note: We removed localStorage fallback to avoid custom form IDs
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!formId) {
        setLoading(false);
        return;
      }

      // Validate that the formId is a proper MongoDB ObjectId (24 hex characters)
      if (!/^[0-9a-fA-F]{24}$/.test(formId)) {
        console.warn(
          "Invalid form ID format, skipping analytics fetch:",
          formId
        );
        setAnalyticsData({
          totalAttendees: 0,
          totalResponses: 0,
          responseRate: 0,
          remainingNonResponses: 0,
          responseBreakdown: {
            positive: { percentage: 0, count: 0 },
            neutral: { percentage: 0, count: 0 },
            negative: { percentage: 0, count: 0 },
          },
          responseOverview: {
            labels: [],
            data: [],
            dateRange: "No data available",
          },
        });
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        if (!token) {
          throw new Error("No authentication token found");
        }

        // Fetch real analytics data from the API
        const response = await fetch(`/api/analytics/form/${formId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to fetch analytics data"
          );
        }

        const result = await response.json();

        if (result.success && result.data) {
          setAnalyticsData(result.data);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Failed to fetch event analytics:", error);

        // If we get a CastError, it means the formId is not a valid ObjectId
        if (
          error.message &&
          error.message.includes("Cast to ObjectId failed")
        ) {
          console.error(
            "Invalid form ID format. This form may not be published yet or the ID is corrupted."
          );
          // Check if we should switch to another available form
          if (availableForms.length > 0 && formId !== availableForms[0]._id) {
            console.log("Switching to first available published form");
            setFormId(availableForms[0]._id);
            return; // Let the effect run again with the new formId
          }
        }

        // You could show a toast notification here with the error message
        console.error(
          "Analytics Error:",
          error.message || "Failed to load analytics data"
        );

        // Set empty data to show "no data" state
        setAnalyticsData({
          totalAttendees: 0,
          totalResponses: 0,
          responseRate: 0,
          remainingNonResponses: 0,
          responseBreakdown: {
            positive: { percentage: 0, count: 0 },
            neutral: { percentage: 0, count: 0 },
            negative: { percentage: 0, count: 0 },
          },
          responseOverview: {
            labels: [],
            data: [],
            dateRange: "No data available",
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [formId, availableForms, token]);

  // Show loading state
  if (loading || formsLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex flex-col gap-6">
        {/* Header Section Skeleton */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <SkeletonText lines={1} width="small" height="h-4" />
            <SkeletonBase className="w-64 h-10 rounded-lg" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="space-y-4">
                <SkeletonText lines={1} width="small" height="h-4" />
                <SkeletonText lines={1} width="large" height="h-8" />
                <SkeletonText lines={1} width="small" height="h-3" />
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section Skeleton */}
        <div className="grid gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <SkeletonText
                lines={1}
                width="medium"
                height="h-6"
                className="mb-4"
              />
              <SkeletonBase className="w-full h-64 rounded-lg" />
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <SkeletonText
                lines={1}
                width="medium"
                height="h-6"
                className="mb-4"
              />
              <SkeletonBase className="w-full h-64 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <SkeletonText
                lines={1}
                width="medium"
                height="h-6"
                className="mb-4"
              />
              <SkeletonBase className="w-full h-64 rounded-lg" />
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <SkeletonText
                lines={1}
                width="medium"
                height="h-6"
                className="mb-4"
              />
              <SkeletonBase className="w-full h-64 rounded-lg" />
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <SkeletonText
                lines={1}
                width="medium"
                height="h-6"
                className="mb-4"
              />
              <SkeletonBase className="w-full h-64 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show no forms available state
  if (availableForms.length === 0) {
    return (
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No Published Forms Available
          </h2>
          <p className="text-gray-600 mb-6">
            You need to have at least one published form to view analytics.
          </p>
          <a
            href={`${basePath}/evaluations`}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Create New Evaluation
          </a>
        </div>
      </div>
    );
  }

  // Show no valid form selected state
  if (!formId || !/^[0-9a-fA-F]{24}$/.test(formId)) {
    return (
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Invalid Form Selected
          </h2>
          <p className="text-gray-600 mb-6">
            The selected form is not valid. Please select a published form to
            view analytics.
          </p>
          {availableForms.length > 0 && (
            <a
              href={`${basePath}/evaluations`}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Select Form
            </a>
          )}
        </div>
      </div>
    );
  }

  // Guard against null analyticsData before destructuring
  if (!analyticsData) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex flex-col gap-6">
        {/* Header Section Skeleton */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <SkeletonText lines={1} width="small" height="h-4" />
            <SkeletonBase className="w-64 h-10 rounded-lg" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="space-y-4">
                <SkeletonText lines={1} width="small" height="h-4" />
                <SkeletonText lines={1} width="large" height="h-8" />
                <SkeletonText lines={1} width="small" height="h-3" />
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section Skeleton */}
        <div className="grid gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <SkeletonText
                lines={1}
                width="medium"
                height="h-6"
                className="mb-4"
              />
              <SkeletonBase className="w-full h-64 rounded-lg" />
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <SkeletonText
                lines={1}
                width="medium"
                height="h-6"
                className="mb-4"
              />
              <SkeletonBase className="w-full h-64 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <SkeletonText
                lines={1}
                width="medium"
                height="h-6"
                className="mb-4"
              />
              <SkeletonBase className="w-full h-64 rounded-lg" />
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <SkeletonText
                lines={1}
                width="medium"
                height="h-6"
                className="mb-4"
              />
              <SkeletonBase className="w-full h-64 rounded-lg" />
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <SkeletonText
                lines={1}
                width="medium"
                height="h-6"
                className="mb-4"
              />
              <SkeletonBase className="w-full h-64 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === DYNAMIC DATA AND OPTIONS ===
  const {
    totalAttendees,
    totalResponses,
    responseRate,
    responseBreakdown,
    responseOverview,
  } = analyticsData;
  const remainingNonResponses = totalAttendees - totalResponses;

  const responseRateData = {
    datasets: [
      {
        data: [responseRate, 100 - responseRate],
        backgroundColor: ["#3B82F6", "#E5E7EB"],
        borderWidth: 0,
      },
    ],
  };

  const responseBreakdownData = {
    labels: ["Positive", "Neutral", "Negative"],
    datasets: [
      {
        data: [
          responseBreakdown.positive.percentage,
          responseBreakdown.neutral.percentage,
          responseBreakdown.negative.percentage,
        ],
        backgroundColor: ["#1E3A8A", "#3B82F6", "#93C5FD"],
        hoverBackgroundColor: ["#1E40AF", "#2563EB", "#60A5FA"],
      },
    ],
  };

  const responseOverviewData = {
    labels: responseOverview?.labels || [],
    datasets: [
      {
        label: "Responses",
        data: responseOverview?.data || [],
        backgroundColor: "#3B82F6",
      },
    ],
  };

  // === OPTIONS ===
  const responseRateOptions = {
    rotation: 270,
    circumference: 180,
    cutout: "70%",
    plugins: { legend: { display: false } },
  };

  const responseBreakdownOptions = {
    cutout: "60%",
    plugins: { legend: { display: false } },
  };

  const responseOverviewOptions = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 20 },
      },
    },
    plugins: { legend: { display: false } },
  };

  const handleGenerateReport = async () => {
    try {
      const toastId = toast.loading("Generating report...");
      const response = await fetch(
        `/api/analytics/reports/generate/${formId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success("Report generated successfully!", { id: toastId });
        // Navigate to reports page to see the generated report
        navigate(`${basePath}/reports`);
      } else {
        toast.error(result.message || "Failed to generate report", {
          id: toastId,
        });
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("An error occurred while generating the report");
    }
  };

  const handleViewReport = () => {
    navigate(`${basePath}/reports/${formId}`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        {/* Form Selector */}
        {availableForms.length > 0 && (
          <div className="flex items-center gap-4">
            <label
              htmlFor="form-select"
              className="text-sm font-medium text-gray-700"
            >
              Select Form:
            </label>
            <select
              id="form-select"
              value={formId || ""}
              onChange={(e) => setFormId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {availableForms.map((form) => (
                <option key={form._id} value={form._id}>
                  {form.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Top Stats */}
      <StatsCards
        totalAttendees={totalAttendees}
        totalResponses={totalResponses}
        remainingNonResponses={remainingNonResponses}
      />

      {/* Main Content Area */}
      <ChartsSection
        responseRate={responseRate}
        responseOverview={responseOverview}
        responseRateData={responseRateData}
        responseBreakdownData={responseBreakdownData}
        responseOverviewData={responseOverviewData}
        responseRateOptions={responseRateOptions}
        responseBreakdownOptions={responseBreakdownOptions}
        responseOverviewOptions={responseOverviewOptions}
        responseBreakdown={responseBreakdown}
        onGenerateReport={handleGenerateReport}
        onViewReport={handleViewReport}
      />
    </div>
  );
};

export default EventAnalyticsContent;

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Search,
  ChevronDown,
  X,
  FileBarChart,
  Calendar,
  RefreshCw,
} from "lucide-react";
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
  BarElement,
);

const EventAnalyticsContent = ({ basePath = "/psas" }) => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formId, setFormId] = useState(null);
  const [availableForms, setAvailableForms] = useState([]);
  const [formsLoading, setFormsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Optimize: Track in-flight requests and cache them
  const requestCacheRef = useRef({});
  const abortControllerRef = useRef(null);

  // Clear cache on logout
  useEffect(() => {
    if (!token) {
      // Clear all cached analytics data when user logs out
      requestCacheRef.current = {};
      console.log("[SECURITY] Analytics cache cleared on logout");
    }
  }, [token]);

  // Fetch available forms for the current user
  useEffect(() => {
    const fetchAvailableForms = async () => {
      if (!token) {
        setFormsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/forms?limit=10&status=published&summaryOnly=true&search=${encodeURIComponent(searchQuery)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

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
            (form) => form.status === "published",
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

    // Debounce search fetching
    const timeoutId = setTimeout(() => {
      fetchAvailableForms();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [token, searchQuery]); // Remove formId to avoid re-fetching list when selection changes

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
          formId,
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

      // Check if data is already cached locally
      if (requestCacheRef.current[formId]) {
        console.log(`[CACHE HIT] Loading cached analytics for form ${formId}`);
        setAnalyticsData(requestCacheRef.current[formId]);
        setLoading(false);
        return;
      }

      // Cancel previous request if switching forms quickly
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

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
          signal: abortControllerRef.current.signal,
        });

        // Don't process if request was aborted
        if (abortControllerRef.current.signal.aborted) {
          console.log(`[ABORT] Request cancelled for form ${formId}`);
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to fetch analytics data",
          );
        }

        const result = await response.json();

        if (result.success && result.data) {
          // Cache the result locally
          requestCacheRef.current[formId] = result.data;
          setAnalyticsData(result.data);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        // Don't log error if request was intentionally aborted
        if (error.name === "AbortError") {
          console.log(`[ABORT] Request aborted for form ${formId}`);
          return;
        }

        console.error("Failed to fetch event analytics:", error);

        // Show error toast for visibility
        if (
          error.message &&
          !error.message.includes("Cast to ObjectId failed")
        ) {
          toast.error(error.message || "Failed to load analytics data");
        }

        // If we get a CastError, it means the formId is not a valid ObjectId
        if (
          error.message &&
          error.message.includes("Cast to ObjectId failed")
        ) {
          console.error(
            "Invalid form ID format. This form may not be published yet or the ID is corrupted.",
          );
          // Check if we should switch to another available form
          if (availableForms.length > 0 && formId !== availableForms[0]._id) {
            console.log("Switching to first available published form");
            setFormId(availableForms[0]._id);
            return; // Let the effect run again with the new formId
          }
        }

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
      <div className="min-h-screen flex flex-col gap-6">
        {/* Header Section Skeleton */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <SkeletonBase className="w-full lg:max-w-md h-10 rounded-lg" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-4 relative h-28"
            >
              <div className="flex items-center gap-3 mb-4">
                <SkeletonBase className="w-6 h-6 rounded-md opacity-40" />
                <SkeletonBase className="w-32 h-4 rounded opacity-60" />
              </div>
              <SkeletonBase className="w-20 h-10 rounded mt-1" />
            </div>
          ))}
        </div>

        {/* Charts Section Skeleton */}
        <div className="grow grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Response Rate Skeleton */}
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col min-h-[350px]">
            <SkeletonBase className="w-32 h-6 rounded mb-8" />
            <div className="flex-1 flex flex-col justify-center items-center">
              <SkeletonBase className="w-48 h-48 rounded-full border-20 border-gray-100 opacity-60" />
              <SkeletonBase className="w-40 h-3 rounded mt-8 opacity-40" />
            </div>
          </div>

          {/* Response Breakdown Skeleton */}
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col min-h-[350px]">
            <SkeletonBase className="w-44 h-6 rounded mb-8" />
            <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-8">
              <SkeletonBase className="w-40 h-40 rounded-full border-20 border-gray-100 opacity-60" />
              <div className="w-full sm:flex-1 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SkeletonBase className="w-3 h-3 rounded-full" />
                      <SkeletonBase className="w-16 h-4 rounded" />
                    </div>
                    <SkeletonBase className="w-20 h-4 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Response Overview Skeleton */}
          <div className="bg-white p-4 rounded-lg shadow-md flex flex-col min-h-[350px]">
            <SkeletonBase className="w-40 h-6 rounded mb-2" />
            <SkeletonBase className="w-32 h-3 rounded mb-6 opacity-40" />
            <div className="grow flex items-end justify-between gap-2 px-2 pb-2">
              {[...Array(12)].map((_, i) => (
                <SkeletonBase
                  key={i}
                  className="flex-1 rounded-t opacity-40"
                  style={{ height: `${Math.random() * 60 + 20}%` }}
                />
              ))}
            </div>
          </div>

          {/* Report Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between items-center text-center py-8"
              >
                <SkeletonBase className="w-32 h-6 rounded mb-4" />
                <div className="space-y-2 mb-6">
                  <SkeletonBase className="w-full h-3 rounded opacity-60" />
                  <SkeletonBase className="w-4/5 h-3 rounded mx-auto opacity-60" />
                </div>
                <SkeletonBase className="w-full h-10 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show no forms available state (only if no search query and no form selected)
  if (availableForms.length === 0 && !searchQuery && !formId) {
    return (
      <div className="p-4 md:p-8 min-h-screen flex flex-col items-center justify-center">
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
      <div className="p-4 md:p-8 min-h-screen flex flex-col items-center justify-center">
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
      <div className="min-h-screen flex flex-col gap-6">
        {/* Header Section Skeleton */}
        <div className="flex justify-between items-center">
          <SkeletonBase className="w-full max-w-md h-10 rounded-lg" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-4 relative h-28"
            >
              <div className="flex items-center gap-3 mb-4">
                <SkeletonBase className="w-6 h-6 rounded-md opacity-40" />
                <SkeletonBase className="w-32 h-4 rounded opacity-60" />
              </div>
              <SkeletonBase className="w-20 h-10 rounded mt-1" />
            </div>
          ))}
        </div>

        {/* Charts Section Skeleton */}
        <div className="grow grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Response Rate Skeleton */}
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col min-h-[350px]">
            <SkeletonBase className="w-32 h-6 rounded mb-8" />
            <div className="flex-1 flex flex-col justify-center items-center">
              <SkeletonBase className="w-48 h-48 rounded-full border-20 border-gray-100 opacity-60" />
              <SkeletonBase className="w-40 h-3 rounded mt-8 opacity-40" />
            </div>
          </div>

          {/* Response Breakdown Skeleton */}
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col min-h-[350px]">
            <SkeletonBase className="w-44 h-6 rounded mb-8" />
            <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-8">
              <SkeletonBase className="w-40 h-40 rounded-full border-20 border-gray-100 opacity-60" />
              <div className="w-full sm:flex-1 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SkeletonBase className="w-3 h-3 rounded-full" />
                      <SkeletonBase className="w-16 h-4 rounded" />
                    </div>
                    <SkeletonBase className="w-20 h-4 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Response Overview Skeleton */}
          <div className="bg-white p-4 rounded-lg shadow-md flex flex-col min-h-[350px]">
            <SkeletonBase className="w-40 h-6 rounded mb-2" />
            <SkeletonBase className="w-32 h-3 rounded mb-6 opacity-40" />
            <div className="grow flex items-end justify-between gap-2 px-2 pb-2">
              {[...Array(12)].map((_, i) => (
                <SkeletonBase
                  key={i}
                  className="flex-1 rounded-t opacity-40"
                  style={{ height: `${Math.random() * 60 + 20}%` }}
                />
              ))}
            </div>
          </div>

          {/* Report Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between items-center text-center py-8"
              >
                <SkeletonBase className="w-32 h-6 rounded mb-4" />
                <div className="space-y-2 mb-6">
                  <SkeletonBase className="w-full h-3 rounded opacity-60" />
                  <SkeletonBase className="w-4/5 h-3 rounded mx-auto opacity-60" />
                </div>
                <SkeletonBase className="w-full h-10 rounded-xl" />
              </div>
            ))}
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
        backgroundColor: ["#1E3A8A", "#E5E7EB"],
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
        backgroundColor: ["#10B981", "#F59E0B", "#EF4444"],
        hoverBackgroundColor: ["#059669", "#D97706", "#DC2626"],
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
        },
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
    navigate(`${basePath}/reports/${formId}?dynamic=true`, {
      state: { fromEventAnalytics: true }
    });
  };

  // Filter and sort forms
  const filteredAndSortedForms = [...availableForms]
    .filter((form) =>
      form.title.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const selectedForm = availableForms.find((f) => f._id === formId);

  return (
    <div className="min-h-screen flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        {/* Form Selector + Refresh Button */}
        {(availableForms.length > 0 || searchQuery !== "") && (
          <div className="w-full lg:max-w-md xl:max-w-xl">
            <div className="relative group w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder={
                    selectedForm ? selectedForm.title : "Search events..."
                  }
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchFocused(true);
                  }}
                  onFocus={() => setIsSearchFocused(true)}
                  // Clear search on blur, but delay to allow clicks on results
                  onBlur={() =>
                    setTimeout(() => setIsSearchFocused(false), 200)
                  }
                  className="w-full pl-10 pr-9 py-2 bg-white border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {isSearchFocused && (
                <div className="absolute z-30 w-full mt-1.5 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200 p-1">
                  <div className="max-h-[250px] overflow-y-auto custom-scrollbar flex flex-col gap-0.5">
                    {filteredAndSortedForms.length > 0 ? (
                      filteredAndSortedForms.map((form) => (
                        <button
                          key={form._id}
                          onMouseDown={(e) => {
                            // Use onMouseDown to trigger before input onBlur
                            e.preventDefault();
                            setFormId(form._id);
                            setSearchQuery("");
                            setIsSearchFocused(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2.5 transition-colors ${
                            formId === form._id
                              ? "bg-blue-50 text-blue-700"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <Calendar
                            className={`w-4 h-4 ${formId === form._id ? "text-blue-500" : "text-gray-400"}`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate text-sm">
                              {form.title}
                            </div>
                            <div className="text-[10px] opacity-60">
                              {new Date(form.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          {formId === form._id && (
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        <p className="text-xs font-medium">No matches</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
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

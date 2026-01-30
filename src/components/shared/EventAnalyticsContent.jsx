import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Search, ChevronDown, X, FileBarChart, Calendar } from "lucide-react";
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
  const [sortOption, setSortOption] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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
            errorData.message || "Failed to fetch analytics data",
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

        // Show error toast for visibility
        if (error.message && !error.message.includes("Cast to ObjectId failed")) {
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
      <div className="p-6 min-h-screen flex flex-col gap-6">
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
      <div className="p-6 min-h-screen flex flex-col gap-6">
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
    navigate(`${basePath}/reports/${formId}`);
  };

  // Filter and sort forms
  const filteredAndSortedForms = [...availableForms]
    .filter((form) =>
      form.title.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

  const selectedForm = availableForms.find((f) => f._id === formId);

  return (
    <div className="p-6 min-h-screen flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        {/* Form Selector */}
        {availableForms.length > 0 && (
          <div className="flex flex-col sm:flex-row items-end gap-3 w-full lg:w-auto">
            <div className="flex flex-col gap-1 w-full sm:w-[350px]">
              <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 ml-1">
                Event Analysis
              </span>
              <div className="relative group">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
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
                    className="w-full pl-9 pr-9 py-1.5 bg-white border border-gray-300 rounded-lg shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
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
                  <div className="absolute z-50 w-full mt-1.5 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200 p-1">
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
                            className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2.5 transition-colors ${formId === form._id
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

            {/* Sort Dropdown */}
            {availableForms.length >= 2 && (
              <div className="flex flex-col gap-1 shrink-0">
                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 ml-1">
                  Sort By
                </span>
                <div className="relative">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-gray-300 rounded-lg shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-xs font-medium text-gray-700 min-w-[130px]"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="title-asc">Title (A-Z)</option>
                    <option value="title-desc">Title (Z-A)</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}
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

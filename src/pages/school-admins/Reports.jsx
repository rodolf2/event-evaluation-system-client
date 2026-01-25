import { useState, useEffect, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import SchoolAdminLayout from "../../components/school-admins/SchoolAdminLayout";
import { useAuth } from "../../contexts/useAuth";
import QuantitativeRatings from "../reports/QuantitativeRatings";
import QualitativeComments from "../reports/QualitativeComments";
import PositiveComments from "../reports/PositiveComments";
import NegativeComments from "../reports/NegativeComments";
import NeutralComments from "../reports/NeutralComments";
import CompleteReport from "../reports/CompleteReport";
import {
  SkeletonBase,
  SkeletonCard,
  SkeletonText,
} from "../../components/shared/SkeletonLoader";

const ReportCard = ({ report, onSelect }) => {
  return (
    <div className="bg-[#EEEEF0] hover:bg-[#DEDFE0] rounded-lg shadow-sm overflow-hidden p-4 transition-colors duration-200">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden group relative">
        <div className="relative">
          <img
            src={
              report.thumbnail ||
              "https://placehold.co/800x450/1e3a8a/ffffff?text=Generating+Thumbnail..."
            }
            alt={report.title}
            className="w-full h-48 object-cover"
            onLoad={() => {
              console.log(
                `✅ Thumbnail loaded for: ${report.title}`,
                report.thumbnail,
              );
            }}
            onError={(e) => {
              console.error(
                `❌ Thumbnail failed for: ${report.title}`,
                report.thumbnail,
              );
              e.target.onerror = null;
              // Fallback to placeholder with report title
              const encodedTitle = encodeURIComponent(report.title || "Report");
              e.target.src = `https://placehold.co/800x450/1e3a8a/ffffff?text=${encodedTitle}`;
            }}
          />
          <div className="absolute inset-0 bg-[#DEDFE0] bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={() => onSelect(report)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              View Report
            </button>
          </div>
        </div>
      </div>
      <h3 className="text-gray-800 font-semibold text-center mt-3">
        {report.title}
      </h3>
    </div>
  );
};

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const [view, setView] = useState("list");
  const [selectedReport, setSelectedReport] = useState(null);

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "all",
    department: "",
    ratingFilter: "",
  });

  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const pagination = {
    page,
    limit,
    total,
    pages: totalPages,
  };

  const fetchReports = useCallback(
    async (searchParams = {}) => {
      try {
        setLoading(true);
        setError(null);

        // Fetch shared reports for school admin
        const response = await fetch(`/api/reports/my-shared`, {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch reports: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          let filteredReports = result.reports || [];

          // Apply client-side filtering
          if (searchQuery) {
            filteredReports = filteredReports.filter((r) =>
              r.title?.toLowerCase().includes(searchQuery.toLowerCase()),
            );
          }

          // Client-side pagination
          const startIdx = (page - 1) * limit;
          const paginatedReports = filteredReports.slice(
            startIdx,
            startIdx + limit,
          );

          setReports(paginatedReports);
          setTotal(filteredReports.length);
          setTotalPages(Math.ceil(filteredReports.length / limit));
        } else {
          throw new Error(result.message || "Failed to fetch shared reports");
        }
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [token, searchQuery, limit, page],
  );

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (view === "list") {
        fetchReports();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [view, fetchReports]);

  const fetchReportById = async (formId) => {
    try {
      // Fetch analytics data for this specific form
      const response = await fetch(`/api/analytics/form/${formId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Create a dynamic report object from the analytics data
        const dynamicReport = {
          id: formId,
          formId: formId,
          title: `Event Analytics Report - ${
            result.data.formInfo?.title || result.data.formTitle || "Form"
          }`,
          eventDate: new Date().toISOString().split("T")[0], // Use current date as fallback
          lastUpdated: new Date().toISOString(),
          analyticsData: result.data,
          isDynamic: true,
        };

        setSelectedReport(dynamicReport);
        setView("dashboard");
      }
    } catch (error) {
      console.error("Failed to fetch report data:", error);
      setError(error.message);
    }
  };

  // Check URL for formId and handle direct report access
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const formIdFromUrl = urlParams.get("formId");

    // Also check path parameters
    const pathParts = window.location.pathname.split("/");
    const reportIndex = pathParts.findIndex((part) => part === "reports");
    const formIdFromPath =
      reportIndex !== -1 && pathParts[reportIndex + 1]
        ? pathParts[reportIndex + 1]
        : null;

    const finalFormId = formIdFromUrl || formIdFromPath;

    if (finalFormId && /^[0-9a-fA-F]{24}$/.test(finalFormId)) {
      // If we have a formId in URL, fetch it directly
      fetchReportById(finalFormId);
    }
  }, [window.location.pathname, window.location.search]);

  useEffect(() => {
    if (view === "list") {
      fetchReports();
    }
  }, [fetchReports, view]);

  const handleSort = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleSelectReport = (report) => {
    setSelectedReport(report);
    setView("dashboard");
  };

  const handleBackToList = () => {
    setView("list");
    setSelectedReport(null);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPage(1);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage(1);
  };

  const sortedReports = [...reports].sort((a, b) => {
    if (sortOrder === "asc") {
      return new Date(a.eventDate) - new Date(b.eventDate);
    }
    return new Date(b.eventDate) - new Date(a.eventDate);
  });

  if (loading && reports.length === 0) {
    return (
      <SchoolAdminLayout>
        <div className="p-8 bg-gray-100 min-h-full">
          {/* Search and Sort Bar Skeleton */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative max-w-md">
              <SkeletonText className="w-full h-10 bg-gray-300 rounded-lg" />
            </div>
            <SkeletonText className="w-20 h-10 bg-gray-300 rounded-lg" />
          </div>

          {/* Reports Grid Skeleton */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-[#EEEEF0] rounded-lg shadow-sm overflow-hidden p-4"
                >
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <SkeletonBase className="w-full h-48 bg-gray-300 rounded" />
                    <div className="p-3">
                      <SkeletonText className="h-4 w-3/4 mx-auto bg-gray-300 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SchoolAdminLayout>
    );
  }

  if (error) {
    return (
      <SchoolAdminLayout>
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-red-600 text-center">
            <p className="text-lg font-semibold">Error loading reports</p>
            <p>{error}</p>
            <button
              onClick={() => fetchReports()}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </SchoolAdminLayout>
    );
  }

  return (
    <SchoolAdminLayout>
      {view === "list" && (
        <div className="p-8 bg-gray-100 min-h-full">
          {/* Search and Sort Bar */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div className="relative">
              <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 focus-within:ring-2 focus-within:ring-blue-500">
                <span className="w-3 h-3 bg-[#2662D9] rounded-sm mr-2 shrink-0"></span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="bg-transparent py-2 pr-8 text-gray-700 appearance-none cursor-pointer focus:outline-none w-full text-sm"
                >
                  <option value="desc">Latest First</option>
                  <option value="asc">Oldest First</option>
                </select>
                <div className="absolute right-3 pointer-events-none">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Pagination Controls - Notification Style */}
            {pagination.pages > 1 && (
              <div className="ml-auto flex items-center gap-2">
                <span className="text-sm text-gray-600 mr-2">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <div className="flex items-center">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className={`p-2 rounded-full transition-colors ${
                      page === 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "hover:bg-gray-200 text-gray-700"
                    }`}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className={`p-2 rounded-full transition-colors ${
                      page === totalPages
                        ? "text-gray-300 cursor-not-allowed"
                        : "hover:bg-gray-200 text-gray-700"
                    }`}
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reports Grid */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            {sortedReports.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No reports found</p>
                {(searchQuery || Object.values(filters).some((f) => f)) && (
                  <p className="text-sm text-gray-400 mt-2">
                    Try adjusting your search or filters
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {sortedReports.map((report, index) => (
                    <ReportCard
                      key={`${report.id}-${index}`}
                      report={report}
                      onSelect={handleSelectReport}
                      isLive={
                        report.lastUpdated &&
                        Date.now() - new Date(report.lastUpdated).getTime() <
                          300000
                      } // 5 minutes
                    />
                  ))}
                </div>

                {/* Pagination Removed - Moved to Top */}
              </>
            )}
          </div>
        </div>
      )}

      {view === "dashboard" && selectedReport && (
        <CompleteReport
          report={selectedReport}
          onBack={handleBackToList}
          isGeneratedReport={!selectedReport.isDynamic}
        />
      )}
      {view === "qualitative" && selectedReport && (
        <QualitativeComments
          report={selectedReport}
          onBack={() => setView("dashboard")}
        />
      )}
      {view === "positive" && selectedReport && (
        <PositiveComments
          report={selectedReport}
          onBack={() => setView("dashboard")}
        />
      )}
      {view === "negative" && selectedReport && (
        <NegativeComments
          report={selectedReport}
          onBack={() => setView("dashboard")}
        />
      )}
      {view === "neutral" && selectedReport && (
        <NeutralComments
          report={selectedReport}
          onBack={() => setView("dashboard")}
        />
      )}
    </SchoolAdminLayout>
  );
};

export default Reports;

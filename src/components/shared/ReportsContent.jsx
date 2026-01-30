import { useState, useEffect, useCallback } from "react";
import { Search, Filter } from "lucide-react";
import { useAuth } from "../../contexts/useAuth";
import { useSocket } from "../../contexts/SocketContext";
import QuantitativeRatings from "../../pages/reports/QuantitativeRatings";
import QualitativeComments from "../../pages/reports/QualitativeComments";
import PositiveComments from "../../pages/reports/PositiveComments";
import NegativeComments from "../../pages/reports/NegativeComments";
import NeutralComments from "../../pages/reports/NeutralComments";
import CompleteReport from "../../pages/reports/CompleteReport";
import { SkeletonBase, SkeletonText } from "./SkeletonLoader";

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
                report.thumbnail
              );
            }}
            onError={(e) => {
              console.error(
                `❌ Thumbnail failed for: ${report.title}`,
                report.thumbnail
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

const ReportsContent = () => {
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();
  const socket = useSocket();

  const [view, setView] = useState("list");
  const [selectedReport, setSelectedReport] = useState(null);

  const [filters] = useState({
    startDate: "",
    endDate: "",
    status: "all",
    department: "",
    ratingFilter: "",
  });

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
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

        // Build query parameters
        const queryParams = new URLSearchParams({
          ...searchParams,
          limit: limit,
          page: page,
          search: searchQuery,
          ...(filters.status !== "all" && { status: filters.status }),
          ...(filters.startDate && { startDate: filters.startDate }),
          ...(filters.endDate && { endDate: filters.endDate }),
          ...(filters.department && { department: filters.department }),
        });

        const response = await fetch(`/api/analytics/reports?${queryParams}`, {
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
          setReports(result.data.reports);
          setTotal(result.data.pagination.total);
          setTotalPages(result.data.pagination.pages);
        } else {
          throw new Error(result.message || "Failed to fetch reports");
        }
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [token, searchQuery, filters, limit, page]
  );

  // Setup real-time listeners for reports
  useEffect(() => {
    if (socket) {
      socket.on("response-received", (data) => {
        console.log("📊 Real-time response received for form:", data.formId);
        // If we are in the list view, refresh the list
        if (view === "list") {
          fetchReports();
        }
        // If we are viewing the report for this specific form, refresh it
        else if (selectedReport && (selectedReport.id === data.formId || selectedReport.formId === data.formId)) {
          fetchReportById(data.formId);
        }
      });

      return () => {
        socket.off("response-received");
      };
    }
  }, [socket, view, selectedReport, fetchReports]);

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
          title: `Event Analytics Report - ${result.data.formInfo?.title || result.data.formTitle || "Form"
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
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <>
      {view === "list" && (
        <div className="p-8 bg-gray-100 min-h-full">
          {/* Search and Sort Bar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSort}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition"
            >
              <Filter className="w-4 h-4" />
              Sort
            </button>
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

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-500">
                      Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.total
                      )}{" "}
                      of {pagination.total} reports
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-500">
                        Page {page} of {totalPages}
                      </span>
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                        className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
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
    </>
  );
};

export default ReportsContent;

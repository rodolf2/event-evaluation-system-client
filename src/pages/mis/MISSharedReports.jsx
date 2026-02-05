import { useState, useEffect, useCallback } from "react";
import {
  Search,
  FileText,
  BarChart2,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import MisLayout from "../../components/mis/MisLayout";
import { useAuth } from "../../contexts/useAuth";
import CompleteReport from "../reports/CompleteReport";
import {
  SkeletonBase,
  SkeletonText,
} from "../../components/shared/SkeletonLoader";

// CSS-based thumbnail card that doesn't require server-generated images
const ReportCard = ({ report, onSelect, token }) => {
  // Generate a consistent color based on report title
  const getGradientColor = (title) => {
    const colors = [
      "from-blue-600 to-blue-800",
      "from-indigo-600 to-indigo-800",
      "from-purple-600 to-purple-800",
      "from-teal-600 to-teal-800",
      "from-cyan-600 to-cyan-800",
      "from-emerald-600 to-emerald-800",
    ];
    const hash = (title || "Report")
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-[#EEEEF0] hover:bg-[#DEDFE0] rounded-lg shadow-sm overflow-hidden p-4 transition-colors duration-200">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden group relative">
        <div className="relative">
          {/* CSS-based thumbnail design or Real Thumbnail */}
          {report.thumbnail ? (
            <div className="w-full h-48 relative">
              <img 
                src={`${report.thumbnail}?token=${token}`} 
                alt={report.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div 
                className={`hidden w-full h-full bg-linear-to-br ${getGradientColor(report.title)} flex-col items-center justify-center p-4`}
              >
                <div className="bg-white/20 rounded-full p-4 mb-3">
                  <BarChart2 className="w-10 h-10 text-white" />
                </div>
                <div className="text-white text-center">
                  <p className="text-xs uppercase tracking-wider opacity-80 mb-1">
                    Evaluation Report
                  </p>
                  <p className="text-sm font-medium line-clamp-2 px-2">
                    {report.title?.length > 40
                      ? `${report.title.substring(0, 40)}...`
                      : report.title}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`w-full h-48 bg-linear-to-br ${getGradientColor(report.title)} flex flex-col items-center justify-center p-4`}
            >
              <div className="bg-white/20 rounded-full p-4 mb-3">
                <BarChart2 className="w-10 h-10 text-white" />
              </div>
              <div className="text-white text-center">
                <p className="text-xs uppercase tracking-wider opacity-80 mb-1">
                  Evaluation Report
                </p>
                <p className="text-sm font-medium line-clamp-2 px-2">
                  {report.title?.length > 40
                    ? `${report.title.substring(0, 40)}...`
                    : report.title}
                </p>
              </div>
              {report.sharedAt && (
                <div className="absolute bottom-2 right-2 flex items-center gap-1 text-white/70 text-xs">
                  <Calendar className="w-3 h-3" />
                  {formatDate(report.sharedAt)}
                </div>
              )}
            </div>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-[#DEDFE0] bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={() => onSelect(report)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
            >
              View Report
            </button>
          </div>
        </div>
      </div>
      <h3 className="text-gray-800 font-semibold text-center mt-3 line-clamp-2">
        {report.title}
      </h3>
      {report.sharedBy && (
        <p className="text-xs text-gray-500 text-center mt-1 flex items-center justify-center gap-1">
          <User className="w-3 h-3" />
          Shared by {report.sharedBy.name || report.sharedBy.email}
        </p>
      )}
    </div>
  );
};

const MISSharedReports = () => {
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, user } = useAuth();

  const [view, setView] = useState("list");
  const [selectedReport, setSelectedReport] = useState(null);

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

  // Check if user has permission to view reports
  const hasPermission =
    (user?.role === "mis" && user?.position === "MIS Head") ||
    user?.role === "psas" ||
    user?.role === "superadmin" ||
    user?.role === "admin";

  const fetchReports = useCallback(async () => {
    if (!hasPermission) {
      setLoading(false);
      setError("You do not have permission to view shared reports.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

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
  }, [token, searchQuery, limit, page, hasPermission]);

  useEffect(() => {
    if (view === "list") {
      fetchReports();
    }
  }, [fetchReports, view]);

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
      return (
        new Date(a.sharedAt || a.eventDate) -
        new Date(b.sharedAt || b.eventDate)
      );
    }
    return (
      new Date(b.sharedAt || b.eventDate) - new Date(a.sharedAt || a.eventDate)
    );
  });

  // No permission state
  if (!hasPermission) {
    return (
      <MisLayout>
        <div className="p-8 bg-gray-100 min-h-full flex items-center justify-center">
          <div className="text-center">
            <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Access Restricted
            </h2>
            <p className="text-gray-500">
              You do not have permission to view shared reports.
            </p>
          </div>
        </div>
      </MisLayout>
    );
  }

  // Loading state
  if (loading && reports.length === 0) {
    return (
      <MisLayout>
        <div className="p-8 bg-gray-100 min-h-full">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative max-w-md">
              <SkeletonText className="w-full h-10 bg-gray-300 rounded-lg" />
            </div>
            <SkeletonText className="w-20 h-10 bg-gray-300 rounded-lg" />
          </div>

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
      </MisLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <MisLayout>
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
      </MisLayout>
    );
  }

  return (
    <MisLayout>
      {view === "list" && (
        <div className="p-8 bg-gray-100 min-h-full">


          {/* Search and Sort Bar */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
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
                    className={`p-2 rounded-full transition-colors ${page === 1
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
                    className={`p-2 rounded-full transition-colors ${page === totalPages
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
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No shared reports found</p>
                <p className="text-sm text-gray-400 mt-2">
                  Reports shared with you will appear here
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {sortedReports.map((report, index) => (
                    <ReportCard
                      key={`${report.id}-${index}`}
                      report={report}
                      onSelect={handleSelectReport}
                      token={token}
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
    </MisLayout>
  );
};

export default MISSharedReports;

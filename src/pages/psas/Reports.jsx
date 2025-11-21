import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  ArrowUp,
  ArrowDown,
  Filter,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import PSASLayout from "../../components/psas/PSASLayout";
import { useAuth } from "../../contexts/useAuth";
import QuantitativeRatings from "../reports/QuantitativeRatings";
import QualitativeComments from "../reports/QualitativeComments";
import PositiveComments from "../reports/PositiveComments";
import NegativeComments from "../reports/NegativeComments";
import NeutralComments from "../reports/NeutralComments";
import CompleteReport from "../reports/CompleteReport";

const ReportCard = ({ report, onSelect, isLive = false }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatLastUpdated = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden group relative">
      {isLive && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
            <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
            LIVE
          </div>
        </div>
      )}
      <div className="relative">
        <img
          src={
            report.thumbnail ||
            "https://placehold.co/800x450/1e3a8a/ffffff?text=Generating+Thumbnail..."
          }
          alt={report.title}
          className="w-full h-40 object-cover"
          onError={(e) => {
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
      <div className="p-4">
        <h3 className="text-gray-800 font-semibold text-center">
          {report.title}
        </h3>
        <div className="mt-2 text-sm text-gray-600 text-center space-y-1">
          <p>{formatDate(report.eventDate)}</p>
          <p className="flex items-center justify-center gap-1">
            <span>{report.feedbackCount} responses</span>
            {report.averageRating && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {report.averageRating.toFixed(1)}
                </span>
              </>
            )}
          </p>
          {report.lastUpdated && (
            <p className="text-xs text-gray-400">
              Updated {formatLastUpdated(report.lastUpdated)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const FilterPanel = ({
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  departments,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-gray-500" />
        <h3 className="text-sm font-semibold text-gray-700">Filters</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <div className="space-y-2">
            <input
              type="date"
              value={filters.startDate || ""}
              onChange={(e) =>
                onFiltersChange({ ...filters, startDate: e.target.value })
              }
              className="w-full text-xs border border-gray-300 rounded px-2 py-1"
            />
            <input
              type="date"
              value={filters.endDate || ""}
              onChange={(e) =>
                onFiltersChange({ ...filters, endDate: e.target.value })
              }
              className="w-full text-xs border border-gray-300 rounded px-2 py-1"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status || "all"}
            onChange={(e) =>
              onFiltersChange({ ...filters, status: e.target.value })
            }
            className="w-full text-xs border border-gray-300 rounded px-2 py-1"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Department
          </label>
          <select
            value={filters.department || ""}
            onChange={(e) =>
              onFiltersChange({ ...filters, department: e.target.value })
            }
            className="w-full text-xs border border-gray-300 rounded px-2 py-1"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Rating Range
          </label>
          <select
            value={filters.ratingFilter || ""}
            onChange={(e) =>
              onFiltersChange({ ...filters, ratingFilter: e.target.value })
            }
            className="w-full text-xs border border-gray-300 rounded px-2 py-1"
          >
            <option value="">All Ratings</option>
            <option value="4-5">4.0 - 5.0 (Excellent)</option>
            <option value="3-4">3.0 - 4.0 (Good)</option>
            <option value="2-3">2.0 - 3.0 (Fair)</option>
            <option value="1-2">1.0 - 2.0 (Poor)</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={onApplyFilters}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition"
        >
          Apply Filters
        </button>
        <button
          onClick={onClearFilters}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-300 transition"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null); // eslint-disable-line no-unused-vars
  const [showFilters, setShowFilters] = useState(false);
  const { token } = useAuth();

  const [view, setView] = useState("list");
  const [selectedReport, setSelectedReport] = useState(null);

  // Dynamic filtering state
  const [filters, setFilters] = useState({
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

  // Extract unique departments from reports
  const availableDepartments = useMemo(() => {
    const depts = new Set();
    reports.forEach((report) => {
      if (report.metadata?.department) {
        depts.add(report.metadata.department);
      }
    });
    return Array.from(depts).sort();
  }, [reports]);

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
          setLastRefresh(new Date().toISOString());
        } else {
          throw new Error(result.message || "Failed to fetch reports");
        }
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError(err.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, searchQuery, filters, limit, page]
  );

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (view === "list") {
        setRefreshing(true);
        fetchReports();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [view, fetchReports]);

  useEffect(() => {
    if (view === "list") {
      fetchReports();
    }
  }, [fetchReports, view]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReports();
  }, [fetchReports]);

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

  const handleApplyFilters = () => {
    setPage(1);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      startDate: "",
      endDate: "",
      status: "all",
      department: "",
      ratingFilter: "",
    };
    setFilters(clearedFilters);
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
      <PSASLayout>
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reports...</p>
          </div>
        </div>
      </PSASLayout>
    );
  }

  if (error) {
    return (
      <PSASLayout>
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
      </PSASLayout>
    );
  }

  return (
    <PSASLayout>
      {view === "list" && (
        <div className="p-8 bg-gray-100 min-h-full">
          {/* Header with refresh and filter toggle */}
          <div className="flex items-center justify-between mb-6">
            <div>
              {/* {lastRefresh && (
                <p className="text-sm text-gray-500">
                  Last updated: {new Date(lastRefresh).toLocaleTimeString()}
                  {refreshing && <span className="ml-2 text-blue-500">Refreshing...</span>}
                </p>
              )} */}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Search and Sort Bar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSort}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition"
            >
              {sortOrder === "asc" ? (
                <ArrowUp className="w-5 h-5 text-gray-600 mr-2" />
              ) : (
                <ArrowDown className="w-5 h-5 text-gray-600 mr-2" />
              )}
              Sort
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
              departments={availableDepartments}
            />
          )}

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
        <CompleteReport report={selectedReport} onBack={handleBackToList} />
      )}
      {view === "quantitative" && selectedReport && (
        <QuantitativeRatings
          report={selectedReport}
          onBack={() => setView("dashboard")}
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
    </PSASLayout>
  );
};

export default Reports;

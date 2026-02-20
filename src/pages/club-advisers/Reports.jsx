import { useState, useEffect, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import ClubAdviserLayout from "../../components/club-advisers/ClubAdviserLayout";
import { useAuth } from "../../contexts/useAuth";
import CompleteReport from "../reports/CompleteReport";
import {
  SkeletonBase,
  SkeletonText,
} from "../../components/shared/SkeletonLoader";

const ReportCard = ({ report, onSelect, token }) => {
  const getThumbnailUrl = () => {
    if (!report.thumbnail) {
      return "https://placehold.co/800x450/1e3a8a/ffffff?text=Generating+Thumbnail...";
    }
    const separator = report.thumbnail.includes("?") ? "&" : "?";
    return `${report.thumbnail}${separator}token=${token}`;
  };

  return (
    <div className="bg-white border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl rounded-lg overflow-hidden p-3 sm:p-4 transition-all duration-200 flex flex-col h-full shadow-md">
      <div className="relative aspect-video w-full rounded-lg overflow-hidden group">
        <img
          src={getThumbnailUrl()}
          alt={report.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            const encodedTitle = encodeURIComponent(report.title || "Report");
            e.target.src = `https://placehold.co/800x450/1e3a8a/ffffff?text=${encodedTitle}`;
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300"></div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button
            onClick={() => onSelect(report)}
            className="bg-blue-600 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-lg font-semibold hover:bg-blue-700 transition text-sm sm:text-base shadow-lg"
          >
            View Report
          </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center mt-3">
        <h3 className="text-gray-800 font-semibold text-center text-sm sm:text-base line-clamp-2 px-1">
          {report.title}
        </h3>
      </div>
    </div>
  );
};

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const [view, setView] = useState("list");
  const [selectedReport, setSelectedReport] = useState(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [totalPages, setTotalPages] = useState(0);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/reports/my-shared`, {
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

        if (searchQuery) {
          filteredReports = filteredReports.filter((r) =>
            r.title?.toLowerCase().includes(searchQuery.toLowerCase()),
          );
        }

        const startIdx = (page - 1) * limit;
        const paginatedReports = filteredReports.slice(
          startIdx,
          startIdx + limit,
        );

        setReports(paginatedReports);
        setTotalPages(Math.ceil(filteredReports.length / limit));
      } else {
        throw new Error(result.message || "Failed to fetch shared reports");
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  }, [token, searchQuery, limit, page]);

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
    const dateA = new Date(a.eventDate || a.sharedAt);
    const dateB = new Date(b.eventDate || b.sharedAt);
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  if (loading && reports.length === 0) {
    return (
      <ClubAdviserLayout>
        <div className="p-3 sm:p-6 md:p-8 bg-gray-100 min-h-full">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative max-w-md w-full">
              <SkeletonText className="w-full h-10 bg-gray-300 rounded-lg" />
            </div>
            <SkeletonText className="w-20 h-10 bg-gray-300 rounded-lg" />
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="bg-[#EEEEF0] rounded-lg p-4">
                  <SkeletonBase className="w-full h-48 bg-gray-300 rounded" />
                  <SkeletonText className="h-4 w-3/4 mx-auto bg-gray-300 mt-3" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </ClubAdviserLayout>
    );
  }

  return (
    <ClubAdviserLayout>
      {view === "list" && (
        <div className="p-3 sm:p-6 md:p-8 bg-gray-100 min-h-full">
          {/* Search and Sort Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
            <div className="relative w-full lg:max-w-md xl:max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between lg:justify-start gap-4 w-full lg:w-auto lg:ml-auto">
              {/* Sort Dropdown */}
              <div className="relative min-w-[140px]">
                <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 focus-within:ring-2 focus-within:ring-blue-500">
                  <span className="w-3 h-3 bg-[#2662D9] rounded-sm mr-2 shrink-0"></span>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="bg-transparent py-2 pr-8 text-gray-700 appearance-none cursor-pointer focus:outline-none w-full text-sm font-medium"
                  >
                    <option value="desc">Latest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>
              </div>

              {/* Pagination (Responsive) */}
              {totalPages > 1 && (
                <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-2 py-1 shadow-sm ml-auto lg:ml-0">
                  <span className="text-xs sm:text-sm text-gray-600 px-2 font-medium whitespace-nowrap border-r border-gray-200 mr-1">
                    Page {page} of {totalPages}
                  </span>
                  <div className="flex items-center">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className={`p-1.5 rounded-md transition-colors ${page === 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "hover:bg-gray-100 text-gray-700"
                        }`}
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                      className={`p-1.5 rounded-md transition-colors ${page === totalPages
                        ? "text-gray-300 cursor-not-allowed"
                        : "hover:bg-gray-100 text-gray-700"
                        }`}
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            {sortedReports.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No reports found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {sortedReports.map((report, index) => (
                  <ReportCard
                    key={`${report.id}-${index}`}
                    report={report}
                    onSelect={handleSelectReport}
                    token={token}
                  />
                ))}
              </div>
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
    </ClubAdviserLayout>
  );
};

export default Reports;

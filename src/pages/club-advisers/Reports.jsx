import { useState, useEffect, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import ClubAdviserLayout from "../../components/club-advisers/ClubAdviserLayout";
import { useAuth } from "../../contexts/useAuth";
import CompleteReport from "../reports/CompleteReport";
import {
  SkeletonBase,
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
            onError={(e) => {
              e.target.onerror = null;
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
        <div className="p-8 bg-gray-100 min-h-full">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative max-w-md w-full">
              <SkeletonText className="w-full h-10 bg-gray-300 rounded-lg" />
            </div>
            <SkeletonText className="w-20 h-10 bg-gray-300 rounded-lg" />
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
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
        <div className="p-8 bg-gray-100 min-h-full">
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
              </div>
            </div>

            {totalPages > 1 && (
              <div className="ml-auto flex items-center gap-2">
                <span className="text-sm text-gray-600 mr-2">
                  Page {page} of {totalPages}
                </span>
                <div className="flex items-center">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="p-2 disabled:text-gray-300"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="p-2 disabled:text-gray-300"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            {sortedReports.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No reports found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {sortedReports.map((report, index) => (
                  <ReportCard
                    key={`${report.id}-${index}`}
                    report={report}
                    onSelect={handleSelectReport}
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

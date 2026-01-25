import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ParticipantLayout from "../../components/participants/ParticipantLayout";
import {
  SkeletonCard,
  SkeletonText,
} from "../../components/shared/SkeletonLoader";
import { Search, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { useAuth } from "../../contexts/useAuth";

const Evaluations = () => {
  const navigate = useNavigate();
  const [evaluations, setEvaluations] = useState([]);
  const [filteredEvaluations, setFilteredEvaluations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchMyEvaluations();
  }, [token]);

  useEffect(() => {
    const filtered = evaluations.filter((evaluation) =>
      evaluation.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    // Sort by eventStartDate
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.eventStartDate || 0);
      const dateB = new Date(b.eventStartDate || 0);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
    setFilteredEvaluations(sorted);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, evaluations, sortOrder]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEvaluations.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredEvaluations.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fetchMyEvaluations = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch("/api/forms/my-evaluations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch evaluations: ${response.status}`);
      }

      const data = await response.json();
      setEvaluations(data.success ? data.data.forms : []);
    } catch (err) {
      console.error("Error fetching evaluations:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <ParticipantLayout>
        <div className="bg-gray-100 min-h-screen pb-8">
          <div className="max-w-full">
            {/* Search and Filter Skeleton */}
            <div className="flex items-center mb-8 gap-4">
              <div className="relative w-full sm:w-auto sm:flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
                </div>
                <div className="w-full h-12 bg-gray-300 rounded-lg animate-pulse"></div>
              </div>
              <div className="relative">
                <div className="bg-gray-300 p-3 rounded-lg w-24 h-12 animate-pulse"></div>
              </div>
            </div>

            {/* Evaluation Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-8 flex items-center h-full">
                    <div className="grow space-y-4">
                      <SkeletonText lines={1} width="large" height="h-8" />
                      <div className="space-y-2">
                        <SkeletonText lines={1} width="small" height="h-4" />
                        <SkeletonText lines={1} width="medium" height="h-4" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ParticipantLayout>
    );
  }

  if (error) {
    return (
      <ParticipantLayout>
        <div className="bg-gray-100 min-h-screen flex items-center justify-center">
          <div className="text-red-600 text-center">
            <p className="text-lg font-semibold">Error loading evaluations</p>
            <p>{error}</p>
            <button
              onClick={fetchMyEvaluations}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </ParticipantLayout>
    );
  }

  return (
    <ParticipantLayout>
      <div className="bg-gray-100 min-h-screen pb-8">
        <div className="max-w-full">
          <div className="flex items-center mb-8 gap-4">
            <div className="relative w-full sm:w-auto sm:flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 focus-within:ring-2 focus-within:ring-green-500">
                <span className="w-3 h-3 bg-[#2662D9] rounded-sm mr-2 shrink-0"></span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="bg-transparent py-3 pr-8 text-gray-700 appearance-none cursor-pointer focus:outline-none w-full text-sm"
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
            {filteredEvaluations.length > itemsPerPage && (
              <div className="ml-auto flex items-center gap-2">
                <span className="text-sm text-gray-600 mr-2">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-full transition-colors ${
                      currentPage === 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "hover:bg-gray-200 text-gray-700"
                    }`}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-full transition-colors ${
                      currentPage === totalPages
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

          {filteredEvaluations.length === 0 ? (
            <div className="text-center text-gray-500">
              <p className="text-lg">No evaluations available at this time.</p>
              <p className="text-sm">
                Evaluations will appear here when assigned to you.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentItems.map((evaluation, index) => {
                  const isCompleted = evaluation.completed || false;
                  const now = new Date();
                  const startDate = evaluation.eventStartDate
                    ? new Date(evaluation.eventStartDate)
                    : null;
                  const endDate = evaluation.eventEndDate
                    ? new Date(evaluation.eventEndDate)
                    : null;

                  const isSameDay = (d1, d2) => {
                    return (
                      d1.getFullYear() === d2.getFullYear() &&
                      d1.getMonth() === d2.getMonth() &&
                      d1.getDate() === d2.getDate()
                    );
                  };

                  const isUpcoming =
                    startDate && now < startDate && !isSameDay(now, startDate);
                  const isExpired =
                    endDate && now > endDate && !isSameDay(now, endDate);
                  const isAvailable = !isUpcoming && !isExpired && !isCompleted;

                  return (
                    <div
                      key={evaluation._id || index}
                      className={`rounded-lg shadow-md transition-all duration-300 ${
                        isCompleted
                          ? "bg-linear-to-r from-green-500 to-green-600 opacity-75 cursor-not-allowed"
                          : isExpired
                            ? "bg-gray-400 opacity-75 cursor-not-allowed"
                            : isUpcoming
                              ? "bg-blue-400 opacity-75 cursor-not-allowed"
                              : "bg-[linear-gradient(-0.15deg,_#324BA3_38%,_#002474_100%)] hover:shadow-lg cursor-pointer"
                      }`}
                      onClick={
                        isAvailable
                          ? () =>
                              navigate(`/evaluations/start/${evaluation._id}`)
                          : undefined
                      }
                    >
                      <div
                        className={`rounded-r-lg ml-3 p-8 flex items-center h-full ${
                          isCompleted ? "bg-green-50" : "bg-white"
                        }`}
                      >
                        <div className="grow">
                          <h3 className="font-bold text-2xl mb-4 text-gray-800">
                            {evaluation.title}
                          </h3>
                          {isCompleted && (
                            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-4 inline-flex items-center gap-1">
                              <Check className="h-4 w-4" />
                              Completed
                            </div>
                          )}
                          {isExpired && !isCompleted && (
                            <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium mb-4 inline-flex items-center gap-1">
                              Closed
                            </div>
                          )}
                          {isUpcoming && !isCompleted && (
                            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4 inline-flex items-center gap-1">
                              Upcoming
                            </div>
                          )}
                          <div className="text-sm text-gray-500 space-x-4">
                            <span>
                              Open: {formatDate(evaluation.eventStartDate)}
                            </span>
                            <span>
                              Closes: {formatDate(evaluation.eventEndDate)}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`ml-4 ${
                            isCompleted ? "text-green-500" : "text-gray-400"
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="h-6 w-6" />
                          ) : (
                            <ChevronRight className="h-6 w-6" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </ParticipantLayout>
  );
};

export default Evaluations;

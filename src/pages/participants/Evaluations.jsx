import { useState, useEffect, useCallback } from "react";
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
  const [filterOption, setFilterOption] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const fetchMyEvaluations = useCallback(async () => {
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
  }, [token]);

  useEffect(() => {
    fetchMyEvaluations();
  }, [fetchMyEvaluations]);

  useEffect(() => {
    let processEvaluations = evaluations.filter((evaluation) =>
      evaluation.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    // Apply status filters if a status option is selected
    if (["available", "upcoming", "closed", "completed"].includes(filterOption)) {
      processEvaluations = processEvaluations.filter((evaluation) => {
        const isCompleted = evaluation.completed || false;
        const now = new Date();
        const startDate = evaluation.eventStartDate ? new Date(evaluation.eventStartDate) : null;
        const endDate = evaluation.eventEndDate ? new Date(evaluation.eventEndDate) : null;
        const isSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
        
        const isUpcoming = startDate && now < startDate && !isSameDay(now, startDate);
        const isExpired = endDate && now > endDate && !isSameDay(now, endDate);
        const isAvailable = !isUpcoming && !isExpired && !isCompleted;
        
        if (filterOption === "available") return isAvailable;
        if (filterOption === "upcoming") return isUpcoming && !isCompleted;
        if (filterOption === "closed") return isExpired && !isCompleted;
        if (filterOption === "completed") return isCompleted;
        return true;
      });
    }

    // Always sort by eventStartDate
    const finalEvaluations = [...processEvaluations].sort((a, b) => {
      const dateA = new Date(a.eventStartDate || 0);
      const dateB = new Date(b.eventStartDate || 0);
      // If filterOption is 'oldest', sort ascending. Otherwise (latest or any status filter), sort descending by default.
      return filterOption === "oldest" ? dateA - dateB : dateB - dateA;
    });

    setFilteredEvaluations(finalEvaluations);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, evaluations, filterOption]);

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
        <div className="bg-gray-100 h-full">
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
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5">
              {Array.from({ length: 15 }).map((_, index) => (
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
        <div className="bg-gray-100 h-full flex items-center justify-center">
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
      <div className="bg-gray-100 h-full">
        <div className="max-w-full">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row lg:flex-row lg:items-center gap-4 w-full">
              <div className="relative w-full lg:max-w-md xl:max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between lg:justify-start gap-4 w-full lg:w-auto lg:ml-auto">
                <div className="relative min-w-[140px]">
                  <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 focus-within:ring-2 focus-within:ring-blue-500">
                    <span className="w-3 h-3 bg-[#2662D9] rounded-sm mr-2 shrink-0"></span>
                    <select
                      value={filterOption}
                      onChange={(e) => setFilterOption(e.target.value)}
                      className="bg-transparent py-2 pr-8 text-gray-700 appearance-none cursor-pointer focus:outline-none w-full text-sm font-medium"
                    >
                      <optgroup label="Sort By Date">
                        <option value="latest">Latest First</option>
                        <option value="oldest">Oldest First</option>
                      </optgroup>
                      <optgroup label="Filter By Status">
                        <option value="available">Available</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="closed">Closed</option>
                        <option value="completed">Completed</option>
                      </optgroup>
                    </select>
                    <div className="absolute right-3 pointer-events-none">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {filteredEvaluations.length > itemsPerPage && (
                  <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-2 py-1 shadow-sm ml-auto lg:ml-0">
                    <span className="text-xs sm:text-sm text-gray-600 px-2 font-medium whitespace-nowrap border-r border-gray-200 mr-1">
                      Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex items-center">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`p-1.5 rounded-md transition-colors ${currentPage === 1
                          ? "text-gray-300 cursor-not-allowed"
                          : "hover:bg-gray-100 text-gray-700"
                          }`}
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`p-1.5 rounded-md transition-colors ${currentPage === totalPages
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
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5">
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
                      className={`rounded-lg shadow-md transition-all duration-300 ${isCompleted
                          ? "bg-linear-to-r from-green-500 to-green-600 opacity-75 cursor-not-allowed"
                          : isExpired
                            ? "bg-gray-400 opacity-75 cursor-not-allowed"
                            : isUpcoming
                              ? "bg-blue-400 opacity-75 cursor-not-allowed"
                              : "bg-[linear-gradient(-0.15deg,#324BA3_38%,#002474_100%)] hover:shadow-lg cursor-pointer"
                        }`}
                      onClick={
                        isAvailable
                          ? () =>
                            navigate(`/evaluations/start/${evaluation._id}`)
                          : undefined
                      }
                    >
                      <div
                      className={`rounded-r-lg ml-3 p-5 sm:p-6 flex flex-col justify-between ${isCompleted ? "bg-green-50" : "bg-white"
                        }`}
                      >
                        <div className="grow">
                          <h3 className="font-bold text-lg mb-3 text-gray-800 line-clamp-2">
                            {evaluation.title}
                          </h3>
                          {isCompleted && (
                            <div className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-sm font-medium mb-3 inline-flex items-center gap-1">
                              <Check className="h-4 w-4" />
                              Completed
                            </div>
                          )}
                          {isExpired && !isCompleted && (
                            <div className="bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full text-sm font-medium mb-3 inline-flex items-center gap-1">
                              Closed
                            </div>
                          )}
                          {isUpcoming && !isCompleted && (
                            <div className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-sm font-medium mb-3 inline-flex items-center gap-1">
                              Upcoming
                            </div>
                          )}
                          <div className="text-sm text-gray-500 space-y-1">
                            <p>Open: {formatDate(evaluation.eventStartDate)}</p>
                            <p>Closes: {formatDate(evaluation.eventEndDate)}</p>
                          </div>
                        </div>
                        <div
                          className={`mt-4 flex justify-end w-full ${isCompleted ? "text-green-500" : "text-gray-400"
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

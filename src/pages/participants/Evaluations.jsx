import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ParticipantLayout from "../../components/participants/ParticipantLayout";
import { SkeletonBase } from "../../components/shared/SkeletonLoader";
import { Search, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { useAuth } from "../../contexts/useAuth";

const Evaluations = () => {
  const navigate = useNavigate();
  const [evaluations, setEvaluations] = useState([]);
  const [filteredEvaluations, setFilteredEvaluations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
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
      setIsInitialLoad(false);
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
    if (
      ["available", "upcoming", "closed", "completed"].includes(filterOption)
    ) {
      processEvaluations = processEvaluations.filter((evaluation) => {
        const isCompleted = evaluation.completed || false;
        const now = new Date();
        const startDate = evaluation.eventStartDate
          ? new Date(evaluation.eventStartDate)
          : null;
        const endDate = evaluation.eventEndDate
          ? new Date(evaluation.eventEndDate)
          : null;
        const isSameDay = (d1, d2) =>
          d1.getFullYear() === d2.getFullYear() &&
          d1.getMonth() === d2.getMonth() &&
          d1.getDate() === d2.getDate();

        const isUpcoming =
          startDate && now < startDate && !isSameDay(now, startDate);
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

  if (isInitialLoad) {
    return (
      <ParticipantLayout>
        <div>
          {/* Search and Filter Skeleton */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row lg:flex-row lg:items-center gap-4 w-full">
              <div className="relative w-full lg:max-w-md xl:max-w-xl">
                <SkeletonBase className="w-full h-10 rounded-lg" />
              </div>
              <div className="flex flex-wrap items-center justify-between lg:justify-start gap-4 w-full lg:w-auto lg:ml-auto">
                <SkeletonBase className="w-36 h-10 rounded-lg" />
                <SkeletonBase className="w-40 h-10 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Evaluation Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[200px] flex flex-col overflow-hidden"
              >
                {/* Top bar indicator match */}
                <div className="w-full h-1 bg-gray-100 shrink-0" />

                <div className="p-3 sm:p-4 grow flex flex-col justify-between">
                  <div className="mb-2">
                    {/* Title skeleton */}
                    <SkeletonBase className="w-3/4 h-4 rounded mb-2" />
                    {/* Badge skeleton */}
                    <SkeletonBase className="w-16 h-4 rounded" />
                  </div>

                  {/* Bottom section match */}
                  <div className="flex justify-between items-end mt-2">
                    <div className="space-y-1.5">
                      {/* Date skeletons */}
                      <SkeletonBase className="w-24 h-2 rounded" />
                      <SkeletonBase className="w-28 h-2 rounded" />
                    </div>
                    {/* Icon skeleton */}
                    <SkeletonBase className="w-4 h-4 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ParticipantLayout>
    );
  }

  if (error) {
    return (
      <ParticipantLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
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
      <div>
        <div>
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row lg:flex-row lg:items-center gap-4 w-full">
              <div className="relative w-full lg:max-w-md xl:max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-white shadow-sm"
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

                {filteredEvaluations.length > itemsPerPage && (
                  <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-2 py-1 shadow-sm ml-auto lg:ml-0">
                    <span className="text-xs sm:text-sm text-gray-600 px-2 font-medium whitespace-nowrap border-r border-gray-200 mr-1">
                      Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex items-center">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`p-1.5 rounded-md transition-colors ${
                          currentPage === 1
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
                        className={`p-1.5 rounded-md transition-colors ${
                          currentPage === totalPages
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
            <div className={`text-center py-12 transition-opacity duration-200 ${loading && !isInitialLoad ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
              <p className="text-gray-500">No evaluations found</p>
            </div>
          ) : (
            <>
              <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6 transition-opacity duration-200 ${loading && !isInitialLoad ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
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
                      className={`bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-300 flex flex-col overflow-hidden group min-h-[200px] h-full ${
                        isCompleted
                          ? "opacity-75"
                          : isExpired || isUpcoming
                            ? "opacity-75"
                            : "hover:shadow-md cursor-pointer"
                      }`}
                      onClick={
                        isAvailable
                          ? () =>
                              navigate(`/evaluations/start/${evaluation._id}`)
                          : undefined
                      }
                    >
                      <div
                        className={`w-full h-1 shrink-0 transition-all duration-300 ${
                          isCompleted
                            ? "bg-green-500"
                            : isExpired
                              ? "bg-gray-400"
                              : isUpcoming
                                ? "bg-blue-400"
                                : "bg-blue-600 group-hover:h-1.5"
                        }`}
                      ></div>
                      <div className="p-3 sm:p-4 flex-1 flex flex-col">
                        <div className="mb-2">
                          <h3 className="font-bold text-sm sm:text-base text-gray-800 line-clamp-2 leading-tight group-hover:text-blue-700 transition-colors">
                            {evaluation.title}
                          </h3>
                          {isCompleted && (
                            <div className="mt-1.5 bg-green-50 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border border-green-100 w-fit">
                              <Check size={10} />
                              Completed
                            </div>
                          )}
                          {isExpired && !isCompleted && (
                            <div className="mt-1.5 bg-gray-50 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border border-gray-100 w-fit">
                              Closed
                            </div>
                          )}
                          {isUpcoming && !isCompleted && (
                            <div className="mt-1.5 bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border border-blue-100 w-fit">
                              Upcoming
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between items-end mt-auto pt-2">
                          <div className="text-[10px] sm:text-[11px] text-gray-500 space-y-0.5">
                            <p className="flex items-center gap-1.5">
                              <span
                                className={`w-1 h-1 rounded-full ${isCompleted ? "bg-green-400" : "bg-blue-400"}`}
                              ></span>
                              Open: {formatDate(evaluation.eventStartDate)}
                            </p>
                            <p className="flex items-center gap-1.5 text-gray-400">
                              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                              Closes: {formatDate(evaluation.eventEndDate)}
                            </p>
                          </div>
                          {!isCompleted && !isExpired && !isUpcoming && (
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
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

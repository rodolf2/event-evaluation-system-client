import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import uploadIcon from "../../../assets/icons/upload-icon.svg";
import blankFormIcon from "../../../assets/icons/blankform-icon.svg";

const EvaluationContent = ({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  evaluationForms,
  onCreateNew,
  onShowUploadModal
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset to first page when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy]);

  const totalPages = Math.ceil(evaluationForms.length / itemsPerPage);
  const paginatedForms = evaluationForms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-4 md:p-8  min-h-screen">
      {/* Start an evaluation section - preserved */}
      <div className="shrink-0">
        <h2 className="text-lg text-gray-800 mb-4 font-bold">Start an Evaluation</h2>
        <div className="mb-7">
          <div
            className="mb-8 text-white p-6 rounded-xl shadow-lg relative"
            style={{
              background:
                "linear-gradient(-0.15deg, #324BA3 38%, #002474 100%)",
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              <div className="flex flex-col items-center gap-3">
                <div
                  className="bg-white rounded-xl shadow-lg p-4 sm:p-8 text-center cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 relative z-10 w-full"
                  onClick={onCreateNew}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto">
                    <img
                      src={blankFormIcon}
                      alt="Blank Form"
                      className="w-8 h-8 sm:w-12 sm:h-12"
                    />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white text-center">
                  Blank Form
                </h3>
              </div>

              <div className="flex flex-col items-center gap-3">
                <div
                  className="bg-white rounded-xl shadow-lg p-4 sm:p-8 text-center cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 relative z-10 w-full"
                  onClick={onShowUploadModal}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto">
                    <img
                      src={uploadIcon}
                      alt="Upload"
                      className="w-8 h-8 sm:w-12 sm:h-12"
                    />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white text-center">
                  Upload Form
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Evaluations Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-3 w-full">
          <div className="flex-1 relative w-full lg:max-w-md xl:max-w-xl">
            <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between lg:justify-start gap-4 w-full lg:w-auto lg:ml-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="newest">Event</option>
              <option value="oldest">Oldest</option>
              <option value="title">Title A-Z</option>
            </select>
            
            {/* Compact Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-2 py-1 shadow-sm ml-auto lg:ml-0">
                <span className="text-xs sm:text-sm text-gray-600 px-2 font-medium whitespace-nowrap border-r border-gray-200 mr-1">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
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
                    onClick={() => setCurrentPage(currentPage + 1)}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5">
        {paginatedForms.map((form) => (
          <RecentEvaluationCard key={form.id} form={form} />
        ))}
      </div>
    </div>
  );
};

const RecentEvaluationCard = ({ form }) => {
  const handleCardClick = () => {
    window.location.href = `/psas/evaluations?edit=${form.id}`;
  };

  // Placeholder dates - replace with actual data if available
  const openDate = form.createdAt || "Aug 14, 2025";
  const closeDate = form.createdAt || "Aug 19, 2025";

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group h-full"
      onClick={handleCardClick}
    >
      <div className="w-full h-1 bg-blue-600 transition-all duration-300 group-hover:h-1.5 shrink-0"></div>
      <div className="p-3 sm:p-4 grow flex flex-col justify-between">
        <div className="mb-2">
          <h3 className="text-sm sm:text-base font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-blue-700 transition-colors">
            {form.title}
          </h3>
        </div>
        <div className="flex justify-between items-end mt-2">
          <div className="text-[10px] sm:text-xs text-gray-500 space-y-0.5">
            <p className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-blue-400"></span>
              Open: {openDate}
            </p>
            <p className="flex items-center gap-1.5 text-gray-400">
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              Closes: {closeDate}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </div>
  );
};

export default EvaluationContent;
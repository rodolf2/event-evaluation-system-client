import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  Users,
  RotateCcw,
  Lock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import uploadIcon from "../../../assets/icons/upload-icon.svg";
import blankFormIcon from "../../../assets/icons/blankform-icon.svg";
import EvaluatorShareModal from "../../shared/EvaluatorShareModal";
import ConfirmationModal from "../../shared/ConfirmationModal";
import Pagination from "../../shared/Pagination";

const EvaluationContent = ({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  evaluationForms,
  onCreateNew,
  onShowUploadModal,
  onReopenForm,
  onCloseForm,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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
    <div className="p-3 sm:p-5 md:p-6 bg-white flex flex-col min-h-screen">
      <div className="flex-1">
        <h2 className="text-2xl sm:text-3xl text-gray-800 mb-4 font-bold">Start an Evaluation</h2>
        <div className="mb-7">
          <div
            className="mb-8 text-white p-4 sm:p-6 rounded-xl shadow-lg relative"
            style={{
              background:
                "linear-gradient(-0.15deg, #324BA3 38%, #002474 100%)",
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto">
              <div className="flex flex-col items-center gap-2 sm:gap-3">
                <div
                  className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 text-center cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 relative z-10 w-full"
                  onClick={onCreateNew}
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center mx-auto">
                    <img
                      src={blankFormIcon}
                      alt="Blank Form"
                      className="w-6 h-6 sm:w-10 sm:h-10 md:w-12 md:h-12"
                    />
                  </div>
                </div>
                <h3 className="text-base sm:text-lg md:text-2xl font-bold text-white text-center">
                  Blank Form
                </h3>
              </div>
  
              <div className="flex flex-col items-center gap-2 sm:gap-3">
                <div
                  className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 text-center cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 relative z-10 w-full"
                  onClick={onShowUploadModal}
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center mx-auto">
                    <img
                      src={uploadIcon}
                      alt="Upload"
                      className="w-6 h-6 sm:w-10 sm:h-10 md:w-12 md:h-12"
                    />
                  </div>
                </div>
                <h3 className="text-base sm:text-lg md:text-2xl font-bold text-white text-center">
                  Upload a Form
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          <h3 className="text-xl font-bold text-gray-800">Recent Evaluations</h3>
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex flex-col sm:flex-row lg:flex-row lg:items-center gap-4 w-full">
            <div className="relative w-full lg:max-w-md xl:max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between lg:justify-start gap-4 w-full lg:w-auto lg:ml-auto">
              {/* Filter/Sort Dropdown */}
              <div className="relative min-w-[160px]">
                <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 focus-within:ring-2 focus-within:ring-blue-500">
                  <Filter className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent py-2 pr-8 text-gray-700 appearance-none cursor-pointer focus:outline-none w-full text-sm font-medium"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="title">Title A-Z</option>
                    <option value="responses">Most Responses</option>
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {paginatedForms.map((form) => (
            <RecentEvaluationCard
              key={form.id}
              form={form}
              onReopenForm={onReopenForm}
              onCloseForm={onCloseForm}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const RecentEvaluationCard = ({ form, onReopenForm, onCloseForm }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isReopeing, setIsReopening] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showReopenConfirm, setShowReopenConfirm] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const handleCardClick = (e) => {
    // Don't navigate if clicking on menu items
    if (e.target.closest(".menu-button")) {
      return;
    }

    // Store the form ID to edit and navigate to create form view
    localStorage.setItem("editFormId", form.id);
    window.location.href = `/psas/evaluations?view=create&edit=${form.id}`;
  };

  const handleReopen = (e) => {
    e.stopPropagation(); // Prevent card click
    setShowReopenConfirm(true);
    setShowMenu(false);
  };

  const handleConfirmReopen = async () => {
    setIsReopening(true);
    try {
      await onReopenForm(form.id);
      setShowReopenConfirm(false);
    } finally {
      setIsReopening(false);
    }
  };

  const handleClose = (e) => {
    e.stopPropagation(); // Prevent card click
    setShowCloseConfirm(true);
    setShowMenu(false);
  };

  const handleConfirmClose = async () => {
    setIsClosing(true);
    try {
      await onCloseForm(form.id);
      setShowCloseConfirm(false);
    } finally {
      setIsClosing(false);
    }
  };

  const toggleMenu = (e) => {
    e.stopPropagation(); // Prevent card click
    setShowMenu(!showMenu);
  };

  const now = new Date();
  const isExpired = form.eventEndDate && now > new Date(form.eventEndDate);
  const isClosed = form.status === "closed" || (form.status === "published" && isExpired);

  // Check if there are any menu options to show
  const hasMenuOptions = (form.status === "published" && !isExpired) || isClosed;

  return (
    <>
      <div
        className="rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-300 h-full flex flex-col relative"
        onClick={handleCardClick}
      >
        {isClosed && (
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 border border-red-200 shadow-sm">
              <Lock size={12} />
              Closed
            </span>
          </div>
        )}
        <div className="bg-white p-4 rounded-t-lg grow flex flex-col">
          <div className="text-center mb-3 shrink-0 relative">
            <h2 className="text-lg font-bold text-gray-800 line-clamp-2 h-12 flex items-center justify-center">
              {form.title}
            </h2>
            <p className="text-gray-500 text-xs line-clamp-2">
              {form.description || "No description provided"}
            </p>

            {/* Menu button - only show if there are menu options */}
            {hasMenuOptions && (
              <div className="absolute top-0 right-0">
                <button
                  onClick={toggleMenu}
                  className="menu-button p-2 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                  title="Actions"
                >
                  <MoreVertical size={20} />
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-48">
                    {form.status === "published" && !isExpired && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowShareModal(true);
                            setShowMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                        >
                          <Users size={16} />
                          Share with Evaluators
                        </button>
                        <button
                          onClick={handleClose}
                          className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Lock size={16} />
                          Close Form
                        </button>
                      </>
                    )}
                    {isClosed && (
                      <button
                        onClick={handleReopen}
                        className="w-full px-4 py-2 text-left text-green-600 hover:bg-green-50 flex items-center gap-2"
                      >
                        <RotateCcw size={16} />
                        Reopen Form
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fixed preview section */}
          <div className="grow">
            <div className="flex justify-between items-center mb-3">
              <input
                type="text"
                placeholder="Sample question..."
                className="w-full pr-6 py-2 text-xs border border-gray-300 rounded-lg bg-gray-50"
                disabled
                value="Sample question preview"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  name={`option-${form.id}`}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  disabled
                />
                <label className="ml-3 text-gray-700 text-sm">Option 1</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  name={`option-${form.id}`}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  disabled
                />
                <label className="ml-3 text-gray-700 text-sm">Option 2</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  name={`option-${form.id}`}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  disabled
                />
                <label className="ml-3 text-gray-700 text-sm">Option 3</label>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed footer */}
        <div
          className="p-3 rounded-b-lg shrink-0"
          style={{
            background: isClosed
              ? "linear-gradient(-0.15deg, #4B5563 38%, #1F2937 100%)"
              : "linear-gradient(-0.15deg, #324BA3 38%, #002474 100%)",
          }}
        >
          <h3 className="text-base font-bold text-white line-clamp-1">
            {form.title}
          </h3>
          <div className="mt-2 text-sm text-white/80 flex items-center justify-between">
            <div>
              <span>{form.responses} responses</span>
              <span className="mx-2">•</span>
              <span>
                {isClosed ? "Closed" : (form.status === "published" ? "Published" : "Draft")}
              </span>
            </div>
            <span className="text-xs">{form.createdAt}</span>
          </div>
        </div>
      </div>

      {/* Evaluator Share Modal */}
      <EvaluatorShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        formId={form.id}
        formTitle={form.title}
      />

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showReopenConfirm}
        onClose={() => setShowReopenConfirm(false)}
        onConfirm={handleConfirmReopen}
        title="Reopen Evaluation"
        message={`Are you sure you want to reopen "${form.title}"? It will be available for another 7 days.`}
        confirmText="Reopen"
        cancelText="Cancel"
        isDestructive={false}
        isLoading={isReopeing}
      />

      <ConfirmationModal
        isOpen={showCloseConfirm}
        onClose={() => setShowCloseConfirm(false)}
        onConfirm={handleConfirmClose}
        title="Close Evaluation"
        message={`Are you sure you want to close "${form.title}"? New responses will no longer be accepted.`}
        confirmText="Close Form"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isClosing}
      />
    </>
  );
};

export default EvaluationContent;

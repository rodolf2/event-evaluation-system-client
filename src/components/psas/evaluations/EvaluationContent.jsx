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
  filterOption,
  setFilterOption,
  evaluationForms,
  onCreateNew,
  onShowUploadModal,
  onReopenForm,
  onCloseForm,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset to first page when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterOption]);

  const totalPages = Math.ceil(evaluationForms.length / itemsPerPage);
  const paginatedForms = evaluationForms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-3 sm:p-5 md:p-6 bg-white flex flex-col min-h-screen">
      <div className="flex-1">
        <h2 className="text-lg text-gray-800 mb-4 font-bold">Start an Evaluation</h2>
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div
            className="group bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200 border-l-4 border-l-[#2662D9] w-full max-w-sm"
            onClick={onCreateNew}
          >
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
              <img
                src={blankFormIcon}
                alt="Blank Form"
                className="w-6 h-6"
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-base">Blank Form</h3>
              <p className="text-sm text-gray-500">Create from scratch</p>
            </div>
          </div>

          <div
            className="group bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200 border-l-4 border-l-[#2662D9] w-full max-w-sm"
            onClick={onShowUploadModal}
          >
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
              <img
                src={uploadIcon}
                alt="Upload"
                className="w-6 h-6"
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-base">Upload a Form</h3>
              <p className="text-sm text-gray-500">Import a Google Form</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          <h3 className="text-lg font-bold text-gray-800">Recent Evaluations</h3>
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
                    value={filterOption}
                    onChange={(e) => setFilterOption(e.target.value)}
                    className="bg-transparent py-2 pr-8 text-gray-700 appearance-none cursor-pointer focus:outline-none w-full text-sm font-medium"
                  >
                    <optgroup label="Sort By Date">
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="title">Title A-Z</option>
                      <option value="responses">Most Responses</option>
                    </optgroup>
                    <optgroup label="Filter By Status">
                      <option value="available">Available</option>
                      <option value="closed">Closed</option>
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

        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
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
        className="rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all duration-300 h-full flex flex-col relative bg-white overflow-hidden group"
        onClick={handleCardClick}
      >
        {isClosed && (
          <div className="absolute top-1.5 left-1.5 z-10">
            <span className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border border-red-100 shadow-sm">
              <Lock size={10} />
              Closed
            </span>
          </div>
        )}
        <div className="p-2 sm:p-3 grow flex flex-col">
          <div className="text-center mb-2 shrink-0 relative">
            <div className="min-h-10 flex items-center justify-center px-4">
              <h2 className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-2 text-center leading-tight">
                {form.title}
              </h2>
            </div>
            <p className="text-gray-500 text-[10px] sm:text-xs line-clamp-1 mt-0.5 px-2">
              {form.description || "No description provided"}
            </p>

            {/* Menu button - only show if there are menu options */}
            {hasMenuOptions && (
              <div className="absolute -top-1 -right-1">
                <button
                  onClick={toggleMenu}
                  className="menu-button p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Actions"
                >
                  <MoreVertical size={16} />
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-xl z-20 w-44 overflow-hidden">
                    {form.status === "published" && !isExpired && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowShareModal(true);
                            setShowMenu(false);
                          }}
                          className="w-full px-3 py-2 text-left text-[11px] sm:text-xs text-blue-600 hover:bg-blue-50 flex items-center gap-2 transition-colors"
                        >
                          <Users size={14} />
                          Share with Evaluators
                        </button>
                        <button
                          onClick={handleClose}
                          className="w-full px-3 py-2 text-left text-[11px] sm:text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                        >
                          <Lock size={14} />
                          Close Form
                        </button>
                      </>
                    )}
                    {isClosed && (
                      <button
                        onClick={handleReopen}
                        className="w-full px-3 py-2 text-left text-[11px] sm:text-xs text-green-600 hover:bg-green-50 flex items-center gap-2 transition-colors"
                      >
                        <RotateCcw size={14} />
                        Reopen Form
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Compact preview section */}
          <div className="grow mt-1 scale-[0.9] origin-top">
            <div className="flex justify-between items-center mb-1.5">
              <div className="w-full py-1 text-[10px] border border-gray-200 rounded px-2 bg-gray-50 text-gray-400 truncate">
                Sample question preview
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full border border-gray-300 mr-2" />
                <label className="text-gray-500 text-[10px]">Option 1</label>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full border border-gray-300 mr-2" />
                <label className="text-gray-500 text-[10px]">Option 2</label>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full border border-gray-300 mr-2" />
                <label className="text-gray-500 text-[10px]">Option 3</label>
              </div>
            </div>
          </div>
        </div>

        {/* Compact footer */}
        <div
          className="px-2.5 py-2 shrink-0 border-t border-white/10"
          style={{
            background: isClosed
              ? "linear-gradient(to bottom right, #4B5563, #374151)"
              : "linear-gradient(to bottom right, #1e40af, #1e3a8a)",
          }}
        >
          <h3 className="text-[11px] sm:text-xs font-bold text-white line-clamp-1">
            {form.title}
          </h3>
          <div className="mt-1 text-[9px] sm:text-[10px] text-white/80 flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <span>{form.responses} resp.</span>
              <span className="opacity-40">•</span>
              <span className="capitalize">
                {isClosed ? "Closed" : (form.status === "published" ? "Live" : "Draft")}
              </span>
            </div>
            <span className="shrink-0">{form.createdAt}</span>
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

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ClubOfficerLayout from "../../components/club-officers/ClubOfficerLayout";
import { SkeletonBase } from "../../components/shared/SkeletonLoader";
import {
  Search,
  Filter,
  MoreVertical,
  Users,
  RotateCcw,
  Lock,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../contexts/useAuth";
import toast from "react-hot-toast";
import uploadIcon from "../../assets/icons/upload-icon.svg";
import blankFormIcon from "../../assets/icons/blankform-icon.svg";
import EvaluatorShareModal from "../../components/shared/EvaluatorShareModal";
import ConfirmationModal from "../../components/shared/ConfirmationModal";

const SurveyEvaluationCard = ({ evaluation, onReopen, onClose }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isReopening, setIsReopening] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showReopenConfirm, setShowReopenConfirm] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const handleCardClick = (e) => {
    // Don't navigate if clicking on menu items
    if (e.target.closest(".menu-button")) {
      return;
    }

    // Store the form ID to edit and navigate to create form view
    localStorage.setItem("editFormId", evaluation._id);
    window.location.href = `/club-officer/form-creation?edit=${evaluation._id}`;
  };

  const toggleMenu = (e) => {
    e.stopPropagation(); // Prevent card click
    setShowMenu(!showMenu);
  };

  const now = new Date();
  const isExpired =
    evaluation.eventEndDate && now > new Date(evaluation.eventEndDate);
  const isClosed =
    evaluation.status === "closed" ||
    (evaluation.status === "published" && isExpired);

  const handleConfirmReopen = async () => {
    setIsReopening(true);
    try {
      await onReopen(evaluation._id);
      setShowReopenConfirm(false);
    } finally {
      setIsReopening(false);
    }
  };

  const handleConfirmClose = async () => {
    setIsClosing(true);
    try {
      await onClose(evaluation._id);
      setShowCloseConfirm(false);
    } finally {
      setIsClosing(false);
    }
  };

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
                {evaluation.title}
              </h2>
            </div>
            <p className="text-gray-500 text-[10px] sm:text-xs line-clamp-1 mt-0.5 px-2">
              {evaluation.description || "No description provided"}
            </p>

            {/* Menu button - only show if there are menu options */}
            {((evaluation.status === "published" && !isExpired) ||
              isClosed) && (
              <div className="absolute -top-1 -right-1 z-20">
                <button
                  onClick={toggleMenu}
                  className="menu-button p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Actions"
                >
                  <MoreVertical size={16} />
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-xl z-30 w-44 overflow-hidden">
                    {evaluation.status === "published" && !isExpired && (
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
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowCloseConfirm(true);
                            setShowMenu(false);
                          }}
                          className="w-full px-3 py-2 text-left text-[11px] sm:text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                        >
                          <Lock size={14} />
                          Close Form
                        </button>
                      </>
                    )}
                    {isClosed && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowReopenConfirm(true);
                          setShowMenu(false);
                        }}
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
            {evaluation.title}
          </h3>
          <div className="mt-1 text-[9px] sm:text-[10px] text-white/80 flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <span>{evaluation.responseCount || 0} resp.</span>
              <span className="opacity-40">•</span>
              <span className="capitalize">
                {isClosed
                  ? "Closed"
                  : evaluation.status === "published"
                    ? "Live"
                    : "Draft"}
              </span>
            </div>
            <span className="shrink-0">
              {new Date(evaluation.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Evaluator Share Modal */}
      <EvaluatorShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        formId={evaluation._id}
        formTitle={evaluation.title}
      />

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showReopenConfirm}
        onClose={() => setShowReopenConfirm(false)}
        onConfirm={handleConfirmReopen}
        title="Reopen Evaluation"
        message={`Are you sure you want to reopen "${evaluation.title}"? It will be available for another 7 days.`}
        confirmText="Reopen"
        cancelText="Cancel"
        isDestructive={false}
        isLoading={isReopening}
      />

      <ConfirmationModal
        isOpen={showCloseConfirm}
        onClose={() => setShowCloseConfirm(false)}
        onConfirm={handleConfirmClose}
        title="Close Evaluation"
        message={`Are you sure you want to close this form "${evaluation.title}"? New responses will no longer be accepted.`}
        confirmText="Close Form"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isClosing}
      />
    </>
  );
};

const SurveyCreation = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [evaluations, setEvaluations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [googleFormsUrl, setGoogleFormsUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [showCreateOptions, setShowCreateOptions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const fetchEvaluations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/forms`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch evaluations: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        const forms = Array.isArray(result.data)
          ? result.data
          : result.data.forms || result.data || [];
        setEvaluations(forms);
      } else {
        throw new Error(result.message || "Failed to fetch evaluations");
      }
    } catch (err) {
      console.error("Error fetching evaluations:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchEvaluations();
    }
  }, [token, fetchEvaluations]);

  // Reset to first page when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterOption]);

  const handleCreateNew = () => {
    navigate("/club-officer/form-creation?new=true");
  };

  const handleShowUploadModal = () => {
    setShowUploadModal(true);
  };

  const handleUrlChange = (e) => {
    setGoogleFormsUrl(e.target.value);
  };

  const handleUpload = async () => {
    if (!googleFormsUrl) {
      toast.error("Please enter a Google Forms URL.");
      return;
    }

    if (!token) {
      toast.error("You must be logged in to import forms.");
      return;
    }

    setIsExtracting(true);

    try {
      const response = await fetch("/api/forms/extract-by-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: googleFormsUrl,
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        const extractedData = responseData.data;

        toast.success("Google Form data extracted successfully!", {
          duration: 5000,
          style: {
            background: "#10B981",
            color: "#FFFFFF",
          },
          iconTheme: {
            primary: "#FFFFFF",
            secondary: "#10B981",
          },
        });

        const tempData = {
          title: extractedData.title,
          description: extractedData.description,
          questions: extractedData.questions || [],
          sections: extractedData.sections || [],
          uploadedFiles: extractedData.uploadedFiles || [],
          uploadedLinks: extractedData.uploadedLinks || [],
          file: null, // No file to keep
          // Preserve scraped response data for report generation
          scrapedResponseData: extractedData.scrapedResponseData || null,
          googleFormId: extractedData.googleFormId || null,
        };

        localStorage.setItem("tempFormData", JSON.stringify(tempData));

        setShowUploadModal(false);
        setGoogleFormsUrl(""); // Clear the URL input

        navigate("/club-officer/form-creation?new=true");

        localStorage.removeItem("uploadedFormId");
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          console.error("Failed to parse error response as JSON:", jsonError);
          errorData = { message: "Unknown server error" };
        }

        if (response.status === 409) {
          toast.error(
            "This Google Form has already been imported. You can find it in your recent evaluations.",
          );
        } else if (response.status === 400) {
          toast.error(
            errorData.message ||
              "Invalid input. Please check your data and try again.",
          );
        } else {
          toast.error(`Import failed: ${errorData.message}`);
        }
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error(`An error occurred: ${error.message}`);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleReopenForm = async (formId) => {
    try {
      const response = await fetch(`/api/forms/${formId}/reopen`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        toast.success(
          "Form reopened successfully! It is now published and available for another 7 days.",
          {
            duration: 8000,
            style: {
              background: "#10B981",
              color: "#FFFFFF",
            },
            iconTheme: {
              primary: "#FFFFFF",
              secondary: "#10B981",
            },
          },
        );
        fetchEvaluations();
      } else {
        toast.error(result.message || "Failed to reopen form");
      }
    } catch (error) {
      console.error("Error reopening form:", error);
      toast.error("An error occurred while reopening the form");
    }
  };

  const handleCloseForm = async (formId) => {
    try {
      const response = await fetch(`/api/forms/${formId}/close`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        toast.success(
          "Form closed successfully. New responses will no longer be accepted.",
          {
            duration: 8000,
            style: {
              background: "#10B981",
              color: "#FFFFFF",
            },
            iconTheme: {
              primary: "#FFFFFF",
              secondary: "#10B981",
            },
          },
        );
        fetchEvaluations();
      } else {
        toast.error(result.message || "Failed to close form");
      }
    } catch (error) {
      console.error("Error closing form:", error);
      toast.error("An error occurred while closing the form");
    }
  };

  const filteredEvaluations = evaluations
    .filter((evaluation) =>
      evaluation.title.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .filter((evaluation) => {
      if (
        ["available", "upcoming", "closed", "published"].includes(filterOption)
      ) {
        const now = new Date();
        const endDate = evaluation.eventEndDate
          ? new Date(evaluation.eventEndDate)
          : null;
        const isExpired = endDate && now > endDate;
        const isClosedStatus =
          evaluation.status === "closed" ||
          (evaluation.status === "published" && isExpired);
        const isPublished = evaluation.status === "published" && !isExpired;
        // Upcoming might not be easily determinable here without eventStartDate, so assuming published is roughly available/active for now in this context.
        // Assuming "published" state is what available means.

        if (filterOption === "available" || filterOption === "published")
          return isPublished;
        if (filterOption === "closed") return isClosedStatus;
        if (filterOption === "upcoming") return false; // Without explicit start date in this view, difficult to ascertain 'upcoming'.
      }
      return true;
    })
    .sort((a, b) => {
      if (filterOption === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (filterOption === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (filterOption === "title") {
        return a.title.localeCompare(b.title);
      } else if (filterOption === "responses") {
        return (b.responseCount || 0) - (a.responseCount || 0);
      }
      return new Date(b.createdAt) - new Date(a.createdAt); // Default fallback sort
    });

  const totalPages = Math.ceil(filteredEvaluations.length / itemsPerPage);
  const paginatedEvaluations = filteredEvaluations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  if (isInitialLoad) {
    return (
      <ClubOfficerLayout>
        <div className="flex flex-col">
          <div className="shrink-0 flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto">
              {/* Search and Filter Skeleton */}
              <div className="flex flex-col gap-4 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 w-full">
                    <div className="relative w-full lg:max-w-md xl:max-w-xl">
                      <SkeletonBase className="w-full h-10 rounded-lg" />
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                      <SkeletonBase className="w-36 h-10 rounded-lg" />
                      <SkeletonBase className="w-40 h-10 rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Evaluation Cards Grid */}
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
                {/* Dashed "Create" placeholder */}
                <div className="rounded-xl shadow-sm border-2 border-dashed border-gray-200 h-full min-h-[160px] flex flex-col items-center justify-center bg-gray-50/50">
                  <SkeletonBase className="w-12 h-12 rounded-full mb-3" />
                  <SkeletonBase className="h-4 w-24 rounded mb-1" />
                  <SkeletonBase className="h-3 w-20 rounded" />
                </div>
                {Array.from({ length: 9 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col overflow-hidden"
                  >
                    {/* Card body - matches actual card structure */}
                    <div className="p-2 sm:p-3 grow flex flex-col">
                      {/* Title + description */}
                      <div className="text-center mb-2 shrink-0">
                        <div className="min-h-10 flex items-center justify-center px-4">
                          <SkeletonBase className="w-3/4 h-4 rounded" />
                        </div>
                        <SkeletonBase className="w-1/2 h-2 rounded mx-auto mt-1" />
                      </div>
                      {/* Preview section */}
                      <div className="grow mt-1 scale-[0.9] origin-top">
                        <SkeletonBase className="w-full h-5 rounded mb-1.5" />
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <SkeletonBase className="h-3 w-3 rounded-full mr-2" />
                            <SkeletonBase className="h-2 w-14 rounded" />
                          </div>
                          <div className="flex items-center">
                            <SkeletonBase className="h-3 w-3 rounded-full mr-2" />
                            <SkeletonBase className="h-2 w-14 rounded" />
                          </div>
                          <div className="flex items-center">
                            <SkeletonBase className="h-3 w-3 rounded-full mr-2" />
                            <SkeletonBase className="h-2 w-14 rounded" />
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Blue gradient footer */}
                    <div className="px-2.5 py-2 shrink-0 bg-linear-to-br from-blue-800 to-blue-900">
                      <SkeletonBase className="w-2/3 h-3 rounded bg-white/20 mb-1" />
                      <div className="flex items-center justify-between">
                        <SkeletonBase className="w-1/3 h-2 rounded bg-white/20" />
                        <SkeletonBase className="w-1/4 h-2 rounded bg-white/20" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ClubOfficerLayout>
    );
  }

  if (error) {
    return (
      <ClubOfficerLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="text-red-600 text-center">
            <p className="text-lg font-semibold">Error loading evaluations</p>
            <p>{error}</p>
            <button
              onClick={fetchEvaluations}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </ClubOfficerLayout>
    );
  }

  return (
    <>
      <ClubOfficerLayout>
        <div className="flex flex-col">
          <div className="shrink-0 flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col gap-4 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 w-full">
                    <div className="relative w-full lg:max-w-md xl:max-w-xl">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search evaluations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-white shadow-sm"
                      />
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                      <div className="relative">
                        <Filter className="absolute left-1.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <select
                          value={filterOption}
                          onChange={(e) => setFilterOption(e.target.value)}
                          className="w-[160px] pl-7 pr-6 py-2 text-sm border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 focus:border-blue-500 cursor-pointer shadow-sm bg-white appearance-none"
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
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                      {totalPages > 1 && (
                        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-2 py-1 shadow-sm">
                          <span className="text-xs sm:text-sm text-gray-600 px-2 font-medium whitespace-nowrap border-r border-gray-200 mr-1">
                            Page {currentPage} of {totalPages}
                          </span>
                          <div className="flex items-center">
                            <button
                              onClick={() => setCurrentPage(currentPage - 1)}
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
                              onClick={() => setCurrentPage(currentPage + 1)}
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
              </div>

              <div className={`grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6 transition-opacity duration-200 ${loading && !isInitialLoad ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
                <div
                  className="rounded-xl shadow-sm border-2 border-dashed border-gray-300 cursor-pointer hover:shadow-md hover:border-[#2662D9] hover:bg-blue-50/50 transition-all duration-300 h-full min-h-[160px] flex flex-col items-center justify-center bg-gray-50/50 group"
                  onClick={() => setShowCreateOptions(true)}
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6 text-[#2662D9]" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-800">
                    New Evaluation
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Create or upload</p>
                </div>
                {paginatedEvaluations.map((evaluation) => (
                  <SurveyEvaluationCard
                    key={evaluation._id}
                    evaluation={evaluation}
                    onReopen={handleReopenForm}
                    onClose={handleCloseForm}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Create Options Modal */}
        {showCreateOptions && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
              <button
                onClick={() => setShowCreateOptions(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Create Evaluation
              </h2>

              <div className="flex flex-col gap-4">
                <div
                  className="group bg-gray-50/50 border border-gray-200 rounded-xl p-5 flex items-center gap-4 cursor-pointer hover:shadow-md hover:bg-blue-50/50 hover:border-blue-300 transition-all duration-200 border-l-4 border-l-[#2662D9] w-full"
                  onClick={() => {
                    setShowCreateOptions(false);
                    handleCreateNew();
                  }}
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                    <img
                      src={blankFormIcon}
                      alt="Blank Form"
                      className="w-6 h-6"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-base">
                      Blank Form
                    </h3>
                    <p className="text-sm text-gray-500">Create from scratch</p>
                  </div>
                </div>

                <div
                  className="group bg-gray-50/50 border border-gray-200 rounded-xl p-5 flex items-center gap-4 cursor-pointer hover:shadow-md hover:bg-blue-50/50 hover:border-blue-300 transition-all duration-200 border-l-4 border-l-[#2662D9] w-full"
                  onClick={() => {
                    setShowCreateOptions(false);
                    handleShowUploadModal();
                  }}
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                    <img src={uploadIcon} alt="Upload" className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-base">
                      Upload a Form
                    </h3>
                    <p className="text-sm text-gray-500">
                      Upload a Google Form
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 md:p-8 w-full max-w-lg z-60">
              <h2 className="text-lg sm:text-xl font-bold mb-4">
                Upload Google Form
              </h2>
              <p className="text-gray-600 text-sm sm:text-sm mb-4">
                Paste a Google Forms URL below to import the form structure.
              </p>
              <input
                type="text"
                value={googleFormsUrl}
                onChange={handleUrlChange}
                placeholder="Paste Google Forms URL here"
                className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setGoogleFormsUrl("");
                  }}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isExtracting}
                  className="px-6 sm:px-8 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isExtracting ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </div>
        )}
      </ClubOfficerLayout>
    </>
  );
};

export default SurveyCreation;

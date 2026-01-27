import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ClubOfficerLayout from "../../components/club-officers/ClubOfficerLayout";
import {
  SkeletonCard,
  SkeletonText,
  SkeletonBase,
} from "../../components/shared/SkeletonLoader";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  MoreVertical,
  Trash2,
  Users,
} from "lucide-react";
import { useAuth } from "../../contexts/useAuth";
import toast from "react-hot-toast";
import uploadIcon from "../../assets/icons/upload-icon.svg";
import blankFormIcon from "../../assets/icons/blankform-icon.svg";
import EvaluatorShareModal from "../../components/shared/EvaluatorShareModal";

const SurveyEvaluationCard = ({ evaluation, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleCardClick = (e) => {
    // Don't navigate if clicking on menu items
    if (e.target.closest(".menu-button")) {
      return;
    }

    // Store the form ID to edit and navigate to create form view
    localStorage.setItem("editFormId", evaluation._id);
    window.location.href = `/club-officer/form-creation?edit=${evaluation._id}`;
  };

  const handleDelete = (e) => {
    e.stopPropagation(); // Prevent card click
    if (
      window.confirm(`Are you sure you want to delete "${evaluation.title}"?`)
    ) {
      onDelete(evaluation);
    }
    setShowMenu(false);
  };

  const toggleMenu = (e) => {
    e.stopPropagation(); // Prevent card click
    setShowMenu(!showMenu);
  };

  return (
    <>
      <div
        className="rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-300 h-full flex flex-col"
        onClick={handleCardClick}
      >
        <div className="bg-white p-6 rounded-t-lg grow flex flex-col">
          <div className="text-center mb-4 shrink-0 relative">
            <h2 className="text-2xl font-bold text-gray-800 line-clamp-2 h-16 flex items-center justify-center">
              {evaluation.title}
            </h2>
            <p className="text-gray-500 text-sm line-clamp-2">
              {evaluation.description || "No description provided"}
            </p>

            {/* Menu button */}
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
                  {evaluation.status === "published" && (
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
                  )}
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete Form
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Fixed preview section */}
          <div className="grow">
            <div className="flex justify-between items-center mb-4">
              <input
                type="text"
                placeholder="Sample question..."
                className="w-full pr-6 py-3 text-sm border border-gray-300 rounded-lg bg-gray-50"
                disabled
                value="Sample question preview"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="radio"
                  name={`option-${evaluation._id}`}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  disabled
                />
                <label className="ml-3 text-gray-700 text-sm">Option 1</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  name={`option-${evaluation._id}`}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  disabled
                />
                <label className="ml-3 text-gray-700 text-sm">Option 2</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  name={`option-${evaluation._id}`}
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
          className="p-4 rounded-b-lg shrink-0"
          style={{
            background: "linear-gradient(-0.15deg, #324BA3 38%, #002474 100%)",
          }}
        >
          <h3 className="text-lg font-bold text-white line-clamp-1">
            {evaluation.title}
          </h3>
          <div className="mt-2 text-sm text-white/80 flex items-center justify-between">
            <div>
              <span>{evaluation.responseCount || 0} responses</span>
              <span className="mx-2">•</span>
              <span>
                {evaluation.status === "published" ? "Published" : "Draft"}
              </span>
            </div>
            <span className="text-xs">
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
    </>
  );
};

const SurveyCreation = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [evaluations, setEvaluations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [googleFormsUrl, setGoogleFormsUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);

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
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchEvaluations();
    }
  }, [token, fetchEvaluations]);

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

        toast.success("Google Form data extracted successfully!");

        const tempData = {
          title: extractedData.title,
          description: extractedData.description,
          questions: extractedData.questions || [],
          sections: extractedData.sections || [],
          uploadedFiles: extractedData.uploadedFiles || [],
          uploadedLinks: extractedData.uploadedLinks || [],
          file: null, // No file to keep
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

  const handleDelete = async (evaluation) => {
    if (
      !window.confirm(`Are you sure you want to delete "${evaluation.title}"?`)
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/forms/${evaluation._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Evaluation deleted successfully");
        fetchEvaluations();
      } else {
        toast.error("Failed to delete evaluation");
      }
    } catch (error) {
      console.error("Error deleting evaluation:", error);
      toast.error("Error deleting evaluation");
    }
  };

  const filteredEvaluations = evaluations
    .filter((evaluation) =>
      evaluation.title.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      } else if (sortBy === "responses") {
        return (b.responseCount || 0) - (a.responseCount || 0);
      }
      return 0;
    });

  if (loading) {
    return (
      <ClubOfficerLayout>
        <div className="p-6 md:p-5 flex flex-col">
          {/* Header Section - Match the actual gradient layout */}
          <div className="mb-8">
            <h2 className="text-3xl text-gray-800 mb-4 font-bold">Start an Evaluation</h2>
            <div className="mb-7">
              <div
                className="mb-8 text-white p-8 rounded-xl shadow-lg relative"
                style={{
                  background:
                    "linear-gradient(-0.15deg, #324BA3 38%, #002474 100%)",
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-10xl mx-auto">
                  <div className="flex flex-col items-center gap-5">
                    <div className="bg-white rounded-xl shadow-lg p-8 sm:p-16 text-center w-full">
                      <SkeletonBase className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 rounded-full bg-gray-200" />
                      <SkeletonText
                        lines={1}
                        width="medium"
                        height="h-6"
                        className="bg-gray-200 text-gray-800"
                      />
                    </div>
                    <div className="text-center w-full">
                      <SkeletonText
                        lines={1}
                        width="large"
                        height="h-8"
                        className="text-white bg-white/20"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-5">
                    <div className="bg-white rounded-xl shadow-lg p-8 sm:p-16 text-center w-full">
                      <SkeletonBase className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 rounded-full bg-gray-200" />
                      <SkeletonText
                        lines={1}
                        width="medium"
                        height="h-6"
                        className="bg-gray-200 text-gray-800"
                      />
                    </div>
                    <div className="text-center w-full">
                      <SkeletonText
                        lines={1}
                        width="large"
                        height="h-8"
                        className="text-white bg-white/20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Evaluations Section */}
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <SkeletonText
                  lines={1}
                  width="medium"
                  height="h-8"
                  className="bg-gray-300"
                />
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-3">
                  <div className="flex-1 relative">
                    <SkeletonBase className="w-full pl-12 pr-6 py-4 text-lg rounded-lg bg-gray-300" />
                  </div>
                  <SkeletonBase className="w-24 h-14 rounded-lg bg-gray-300" />
                </div>
              </div>

              {/* Evaluation Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-lg shadow-md h-full flex flex-col"
                  >
                    <div className="bg-white p-6 rounded-t-lg grow flex flex-col">
                      <div className="text-center mb-4">
                        <SkeletonText
                          lines={2}
                          height="h-6"
                          className="bg-gray-300"
                        />
                        <SkeletonText
                          lines={1}
                          height="h-4"
                          className="bg-gray-300 mt-2"
                        />
                      </div>
                      <div className="grow">
                        <div className="flex justify-between items-center mb-4">
                          <SkeletonBase className="w-full pr-6 py-3 text-sm rounded-lg bg-gray-300" />
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <SkeletonBase className="h-4 w-4 rounded bg-gray-300" />
                            <SkeletonText
                              lines={1}
                              height="h-4"
                              className="ml-3 bg-gray-300"
                            />
                          </div>
                          <div className="flex items-center">
                            <SkeletonBase className="h-4 w-4 rounded bg-gray-300" />
                            <SkeletonText
                              lines={1}
                              height="h-4"
                              className="ml-3 bg-gray-300"
                            />
                          </div>
                          <div className="flex items-center">
                            <SkeletonBase className="h-4 w-4 rounded bg-gray-300" />
                            <SkeletonText
                              lines={1}
                              height="h-4"
                              className="ml-3 bg-gray-300"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-b-lg bg-linear-to-r from-blue-800 to-blue-900">
                      <SkeletonText
                        lines={1}
                        height="h-6"
                        className="bg-white/20"
                      />
                      <div className="mt-2 flex items-center justify-between">
                        <SkeletonText
                          lines={1}
                          height="h-4"
                          className="bg-white/20"
                        />
                        <SkeletonText
                          lines={1}
                          height="h-3"
                          className="bg-white/20"
                        />
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
        <div className="p-6 md:p-5 bg-gray-50 flex flex-col items-center justify-center min-h-screen">
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
        <div className="p-6 md:p-5 flex flex-col">
          <div className="shrink-0">
            <h2 className="text-3xl text-gray-800 mb-4 font-bold">Start an Evaluation</h2>
            <div className="mb-7">
              <div
                className="mb-8 text-white p-8 rounded-xl shadow-lg relative"
                style={{
                  background:
                    "linear-gradient(-0.15deg, #324BA3 38%, #002474 100%)",
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-10xl mx-auto">
                  <div className="flex flex-col items-center gap-5">
                    <div
                      className="bg-white rounded-xl shadow-lg p-8 sm:p-16 text-center cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 relative z-10 w-full"
                      onClick={handleCreateNew}
                    >
                      <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center mx-auto">
                        <img
                          src={blankFormIcon}
                          alt="Blank Form"
                          className="w-10 h-10 sm:w-16 sm:h-16"
                        />
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center">
                      Blank Form
                    </h3>
                  </div>

                  <div className="flex flex-col items-center gap-5">
                    <div
                      className="bg-white rounded-xl shadow-lg p-8 sm:p-16 text-center cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 relative z-10 w-full"
                      onClick={handleShowUploadModal}
                    >
                      <div className="w-24 h-24 sm:w-30 sm:h-32 flex items-center justify-center mx-auto">
                        <img
                          src={uploadIcon}
                          alt="Upload"
                          className="w-10 h-10 sm:w-16 sm:h-16"
                        />
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center">
                      Upload a Form
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 mb-5">
                <h2 className="text-3xl font-semibold text-gray-800">
                  Recent Evaluations
                </h2>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search evaluations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="title">Title A-Z</option>
                      <option value="responses">Most Responses</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredEvaluations.map((evaluation) => (
                  <SurveyEvaluationCard
                    key={evaluation._id}
                    evaluation={evaluation}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {showUploadModal && (
          <div className="fixed inset-0 bg-[#F4F4F5]/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 w-full max-w-lg z-60">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                Import Google Form
              </h3>

              {/* Google Forms URL Section */}
              <div className="mb-6">
                <input
                  type="url"
                  placeholder="https://docs.google.com/forms/d/.../viewform"
                  onChange={handleUrlChange}
                  value={googleFormsUrl} // Bind value to state
                  disabled={isExtracting}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${isExtracting ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Paste the URL of an existing Google Form to import its
                  questions
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setGoogleFormsUrl(""); // Clear the URL input on cancel
                  }}
                  disabled={isExtracting}
                  className={`px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition ${isExtracting ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isExtracting}
                  className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 ${isExtracting ? "opacity-75 cursor-not-allowed" : ""
                    }`}
                >
                  {isExtracting ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Extracting...
                    </>
                  ) : (
                    "Import Form"
                  )}
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

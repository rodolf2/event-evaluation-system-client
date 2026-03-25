import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import PSASLayout from "../../components/psas/PSASLayout";
import {
  SkeletonCard,
  SkeletonText,
  SkeletonBase,
} from "../../components/shared/SkeletonLoader";
import FormCreationInterface from "../../components/psas/evaluations/FormCreationInterface";
import EvaluationContent from "../../components/psas/evaluations/EvaluationContent";
import { useAuth } from "../../contexts/useAuth";
import { FormSessionManager } from "../../utils/formSessionManager";

const Evaluations = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { token } = useAuth();
  const [view, setView] = useState(
    localStorage.getItem("evaluationsView") || "dashboard",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOption, setFilterOption] = useState("newest");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [googleFormsUrl, setGoogleFormsUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [isExtracting, setIsExtracting] = useState(false);
  const [evaluationForms, setEvaluationForms] = useState([]);
  const [currentFormId, setCurrentFormId] = useState(null);
  const selectedTemplate = searchParams.get("template");

  // Persist view state to support page reloads
  useEffect(() => {
    localStorage.setItem("evaluationsView", view);
  }, [view]);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await fetch("/api/forms?summaryOnly=true", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          // Handle both old format (array) and new format (object with forms property)
          const formsArray = Array.isArray(data.data)
            ? data.data
            : data.data.forms || [];
          const mappedForms = formsArray.map((form) => ({
            id: form._id,
            title: form.title || `Evaluation Form ${form._id.slice(-6)}`,
            description: form.description,
            status: form.status,
            createdAt: new Date(form.createdAt).toLocaleDateString(),
            createdAtRaw: new Date(form.createdAt),
            responses: form.responseCount || 0,
            questions: form.questions || [],
            sections: form.sections || [],
            uploadedFiles: form.uploadedFiles || [],
            uploadedLinks: form.uploadedLinks || [],
            eventEndDate: form.eventEndDate,
          }));
          setEvaluationForms(mappedForms);
        }
      } catch (error) {
        console.error("Error fetching forms:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchForms();
    } else {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, [token]);

  // Handle editing a form
  useEffect(() => {
    const editParam = searchParams.get("edit");
    if (editParam) {
      // Store the form ID to edit and switch to create view
      localStorage.setItem("editFormId", editParam);
      setCurrentFormId(editParam);
      setView("create");
    }
  }, [searchParams]);

  // Handle recipients parameter from student assignment
  useEffect(() => {
    const recipients = searchParams.get("recipients");
    const formId = searchParams.get("formId");

    if (recipients) {
      // If formId is provided, ensure it matches the edit form ID
      if (formId) {
        localStorage.setItem("editFormId", formId);
        setCurrentFormId(formId); // Store for passing to FormCreationInterface
      }

      // Switch to create view to show the form with assigned students
      setView("create");
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedTemplate) {
      setView("create");
    }
  }, [selectedTemplate]);

  // Handle view parameter for navigation from other pages
  useEffect(() => {
    const viewParam = searchParams.get("view");
    if (viewParam === "create") {
      setView("create");
    }
  }, [searchParams]);

  const handleCreateNew = () => {
    // Clear any temporary form data to ensure we start with a blank form
    FormSessionManager.clearAllFormData();
    setCurrentFormId(null);

    setView("create");
  };

  const handleShowUploadModal = () => {
    setShowUploadModal(true);
  };

  const handleReopenForm = async (formId) => {
    try {
      const response = await fetch(`/api/forms/${formId}/reopen`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        // Update the form locally
        setEvaluationForms((prev) =>
          prev.map((form) =>
            form.id === formId ? { ...form, status: "published" } : form,
          ),
        );
        toast.success("Form reopened successfully");
      } else {
        toast.error(data.message || "Failed to reopen form");
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

      const data = await response.json();

      if (data.success) {
        // Update the form locally
        setEvaluationForms((prev) =>
          prev.map((form) =>
            form.id === formId ? { ...form, status: "closed" } : form,
          ),
        );
        toast.success("Form closed successfully");
      } else {
        toast.error(data.message || "Failed to close form");
      }
    } catch (error) {
      console.error("Error closing form:", error);
      toast.error("An error occurred while closing the form");
    }
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
          // Preserve scraped response data for report generation
          scrapedResponseData: extractedData.scrapedResponseData || null,
          googleFormId: extractedData.googleFormId || null,
        };

        localStorage.setItem("tempFormData", JSON.stringify(tempData));

        setShowUploadModal(false);
        setGoogleFormsUrl(""); // Clear the URL input

        setView("create");

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

  // Filter and sort forms
  const filteredAndSortedForms = evaluationForms
    .filter((form) =>
      form.title.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter((form) => {
      if (
        ["available", "upcoming", "closed", "published"].includes(filterOption)
      ) {
        const now = new Date();
        const endDate = form.eventEndDate ? new Date(form.eventEndDate) : null;
        const isExpired = endDate && now > endDate;
        const isClosedStatus =
          form.status === "closed" ||
          (form.status === "published" && isExpired);
        const isPublished = form.status === "published" && !isExpired;

        if (filterOption === "available" || filterOption === "published")
          return isPublished;
        if (filterOption === "closed") return isClosedStatus;
        if (filterOption === "upcoming") return false; // same as above
      }
      return true;
    })
    .sort((a, b) => {
      if (filterOption === "newest") {
        return b.createdAtRaw - a.createdAtRaw;
      } else if (filterOption === "oldest") {
        return a.createdAtRaw - b.createdAtRaw;
      } else if (filterOption === "title") {
        return a.title.localeCompare(b.title);
      } else if (filterOption === "responses") {
        return b.responses - a.responses;
      }
      return b.createdAtRaw - a.createdAtRaw; // default fallback sort
    });

  if (loading) {
    return (
      <PSASLayout backgroundColor="bg-gray-100">
        <div className="flex flex-col">
          <div className="flex-1">
            {/* Header Skeleton - Matches EvaluationContent layout */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex flex-col sm:flex-row lg:flex-row lg:items-center gap-4 w-full">
                  <div className="relative w-full lg:max-w-md xl:max-w-xl">
                    <SkeletonBase className="w-full h-10 rounded-xl shadow-sm" />
                  </div>
                  <div className="flex flex-wrap items-center justify-between lg:justify-start gap-4 w-full lg:w-auto lg:ml-auto">
                    <SkeletonBase className="w-36 h-10 rounded-xl shadow-sm" />
                    <div className="hidden sm:block">
                      <SkeletonBase className="w-40 h-10 rounded-xl shadow-sm" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid Skeleton */}
              <div className="grid grid-cols-[repeat(auto-fill,240px)] justify-center gap-4 sm:gap-6 md:gap-5">
              {/* New Evaluation Placeholder Skeleton */}
              <div className="rounded-xl shadow-sm border-2 border-dashed border-gray-200 h-full min-h-[160px] flex flex-col items-center justify-center bg-gray-50/50">
                <SkeletonBase className="w-12 h-12 rounded-full mb-3" />
                <SkeletonBase className="h-4 w-24 rounded mb-1" />
                <SkeletonBase className="h-3 w-20 rounded" />
              </div>
              {/* Form Card Skeletons */}
              {Array.from({ length: 9 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col overflow-hidden"
                >
                  <div className="p-2 sm:p-3 grow flex flex-col">
                    <div className="text-center mb-2 shrink-0">
                      <div className="min-h-10 flex items-center justify-center px-4">
                        <SkeletonBase className="w-3/4 h-4 rounded" />
                      </div>
                      <SkeletonBase className="w-1/2 h-2 rounded mx-auto mt-1" />
                    </div>
                    {/* Preview Section Skeleton */}
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
                      </div>
                    </div>
                  </div>
                  {/* Footer Skeleton */}
                  <div className="px-2.5 py-2 shrink-0 bg-gray-100">
                    <SkeletonBase className="w-2/3 h-3 rounded bg-gray-200 mb-1" />
                    <div className="flex items-center justify-between">
                      <SkeletonBase className="w-1/3 h-2 rounded bg-gray-200" />
                      <SkeletonBase className="w-1/4 h-2 rounded bg-gray-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PSASLayout>
    );
  }

  return (
    <>
      {/* Always keep PSAS shell (sidebar + header) via PSASLayout */}
      <PSASLayout backgroundColor="bg-gray-100">
        {view === "create" ? (
          <FormCreationInterface
            currentFormId={currentFormId}
            onBack={() => {
              setView("dashboard");
              setSearchParams({}); // Clear URL params
              // Clear edit form ID when going back
              localStorage.removeItem("editFormId");
              setCurrentFormId(null);
            }}
          />
        ) : (
          <EvaluationContent
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterOption={filterOption}
            setFilterOption={setFilterOption}
            evaluationForms={filteredAndSortedForms}
            onCreateNew={handleCreateNew}
            onShowUploadModal={handleShowUploadModal}
            onReopenForm={handleReopenForm}
            onCloseForm={handleCloseForm}
          />
        )}

        {showUploadModal && view === "dashboard" && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 w-full max-w-lg z-60">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                Upload Google Form
              </h3>

              {/* Google Forms URL Section */}
              <div className="mb-6">
                <input
                  type="url"
                  placeholder="https://docs.google.com/forms/d/.../viewform"
                  onChange={handleUrlChange}
                  value={googleFormsUrl} // Bind value to state
                  disabled={isExtracting}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    isExtracting ? "bg-gray-100 cursor-not-allowed" : ""
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
                  className={`px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition ${
                    isExtracting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isExtracting}
                  className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 ${
                    isExtracting ? "opacity-75 cursor-not-allowed" : ""
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
                      Uploading...
                    </>
                  ) : (
                    "Upload Form"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </PSASLayout>
    </>
  );
};

export default Evaluations;

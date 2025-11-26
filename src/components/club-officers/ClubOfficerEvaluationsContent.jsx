import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  SkeletonCard,
  SkeletonText,
  SkeletonBase,
} from "../shared/SkeletonLoader";
import FormCreationInterface from "../psas/evaluations/FormCreationInterface";
import EvaluationContent from "../psas/evaluations/EvaluationContent";
import { useAuth } from "../../contexts/useAuth";
import { FormSessionManager } from "../../utils/formSessionManager";

function ClubOfficerEvaluationsContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { token } = useAuth();
  const [view, setView] = useState(
    localStorage.getItem("evaluationsView") || "dashboard"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
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
        const response = await fetch("/api/forms", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          // Handle both array and object response formats
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

  const handleDeleteForm = async (formId) => {
    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        // Remove the deleted form from the local state
        setEvaluationForms((prev) => prev.filter((form) => form.id !== formId));

        // Clean up localStorage for the deleted form
        if (localStorage.getItem("editFormId") === formId) {
          localStorage.removeItem("editFormId");
        }

        // Clean up any form session data
        const formSessionKey = `formSession_${formId}`;
        const formRecipientsKey = `formRecipients_${formId}`;
        const certificateLinkedKey = `certificateLinked_${formId}`;

        localStorage.removeItem(formSessionKey);
        localStorage.removeItem(formRecipientsKey);
        localStorage.removeItem(certificateLinkedKey);

        toast.success("Form deleted successfully");
      } else {
        toast.error("Failed to delete form");
      }
    } catch (error) {
      console.error("Error deleting form:", error);
      toast.error("Failed to delete form");
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
            "This Google Form has already been imported. You can find it in your recent evaluations."
          );
        } else if (response.status === 400) {
          toast.error(
            errorData.message ||
              "Invalid input. Please check your data and try again."
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
      form.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "newest") {
        return b.createdAtRaw - a.createdAtRaw;
      } else if (sortBy === "oldest") {
        return a.createdAtRaw - b.createdAtRaw;
      } else if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      } else if (sortBy === "responses") {
        return b.responses - a.responses;
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="p-6 md:p-5 bg-gray-50 flex flex-col">
        {/* Header Section - Match the actual gradient layout */}
        <div className="mb-8">
          <h2 className="text-3xl text-gray-800 mb-4">Start an evaluation</h2>
          <div className="mb-7">
            <div
              className="mb-8 text-white p-8 rounded-xl shadow-lg relative"
              style={{
                background:
                  "linear-gradient(-0.15deg, #324BA3 38%, #002474 100%)",
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-10xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-8 sm:p-16 text-center">
                  <SkeletonBase className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 rounded-full bg-gray-200" />
                  <SkeletonText
                    lines={1}
                    width="medium"
                    height="h-6"
                    className="bg-gray-200 text-gray-800"
                  />
                </div>
                <div className="bg-white rounded-xl shadow-lg p-8 sm:p-16 text-center">
                  <SkeletonBase className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 rounded-full bg-gray-200" />
                  <SkeletonText
                    lines={1}
                    width="medium"
                    height="h-6"
                    className="bg-gray-200 text-gray-800"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-10xl mx-auto mt-5">
                <div className="text-center">
                  <SkeletonText
                    lines={1}
                    width="large"
                    height="h-8"
                    className="text-white bg-white/20"
                  />
                </div>
                <div className="text-center">
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
    );
  }

  return (
    <>
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
          sortBy={sortBy}
          setSortBy={setSortBy}
          evaluationForms={filteredAndSortedForms}
          onCreateNew={handleCreateNew}
          onShowUploadModal={handleShowUploadModal}
          onDeleteForm={handleDeleteForm}
        />
      )}

      {showUploadModal && view === "dashboard" && (
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
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  isExtracting ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
              <p className="text-sm text-gray-500 mt-1">
                Paste the URL of an existing Google Form to import its questions
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
    </>
  );
}

export default ClubOfficerEvaluationsContent;

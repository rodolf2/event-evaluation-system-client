import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import PSASLayout from "../../components/psas/PSASLayout";
import FormCreationInterface from "../../components/psas/evaluations/FormCreationInterface";
import EvaluationContent from "../../components/psas/evaluations/EvaluationContent";
import { useAuth } from "../../contexts/useAuth";

const Evaluations = () => {
  const [searchParams] = useSearchParams();
  const { token } = useAuth();
  const [view, setView] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [googleFormsUrl, setGoogleFormsUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [evaluationForms, setEvaluationForms] = useState([]);
  const selectedTemplate = searchParams.get("template");

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
          const mappedForms = data.data.map(form => ({
            id: form._id,
            title: form.title || `Evaluation Form ${form._id.slice(-6)}`,
            description: form.description,
            status: form.status,
            createdAt: new Date(form.createdAt).toLocaleDateString(),
            responses: form.responseCount || 0,
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
      sessionStorage.setItem('editFormId', editParam);
      setView("create");
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedTemplate) {
      setView("create");
    }
  }, [selectedTemplate]);

  const handleCreateNew = () => {
    // Clear any temporary form data to ensure we start with a blank form
    sessionStorage.removeItem('tempFormData');
    sessionStorage.removeItem('editFormId');
    setView("create");
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

    try {
      const response = await fetch("/api/forms/extract-by-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
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
          uploadedFiles: extractedData.uploadedFiles || [],
          uploadedLinks: extractedData.uploadedLinks || [],
          file: null, // No file to keep
        };

        sessionStorage.setItem('tempFormData', JSON.stringify(tempData));

        setShowUploadModal(false);
        setGoogleFormsUrl(""); // Clear the URL input

        setView("create");

        sessionStorage.removeItem('uploadedFormId');
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          console.error('Failed to parse error response as JSON:', jsonError);
          errorData = { message: 'Unknown server error' };
        }

        if (response.status === 409) {
          toast.error("This Google Form has already been imported. You can find it in your recent evaluations.");
        } else if (response.status === 400) {
          toast.error(errorData.message || "Invalid input. Please check your data and try again.");
        } else {
          toast.error(`Import failed: ${errorData.message}`);
        }
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error(`An error occurred: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <PSASLayout>
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PSASLayout>
    );
  }

  return (
    <>
      <PSASLayout>
        {view === "create" ? (
          <FormCreationInterface onBack={() => {
            setView("dashboard");
            // Clear edit form ID when going back
            sessionStorage.removeItem('editFormId');
          }} />
        ) : (
          <EvaluationContent
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortBy={sortBy}
            setSortBy={setSortBy}
            evaluationForms={evaluationForms}
            onCreateNew={handleCreateNew}
            onShowUploadModal={handleShowUploadModal}
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Import Form
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
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import PSASLayout from "../../components/psas/PSASLayout";
import FormCreationInterface from "../../components/psas/evaluations/FormCreationInterface";
import EvaluationContent from "../../components/psas/evaluations/EvaluationContent";
import { useAuth } from "../../contexts/useAuth";

const Evaluations = () => {
  const [searchParams] = useSearchParams();
  const { token, user } = useAuth();
  const [view, setView] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
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

  useEffect(() => {
    if (selectedTemplate) {
      setView("create");
    }
  }, [selectedTemplate]);

  const handleCreateNew = () => setView("create");
  const handleShowUploadModal = () => {
    setShowUploadModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile({ file, type: 'file' });
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    if (url) {
      setSelectedFile({ url, type: 'google-form' });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file or enter a Google Forms URL.");
      return;
    }

    if (!token) {
      toast.error("You must be logged in to upload forms.");
      return;
    }

    try {
      let response;
      
      if (selectedFile.type === 'google-form') {
        // Handle Google Forms URL upload
        response = await fetch("/api/forms/upload-by-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            url: selectedFile.url,
            createdBy: user?._id,
          }),
        });
      } else {
        // Handle file upload
        const formData = new FormData();
        formData.append("file", selectedFile.file);
        formData.append("createdBy", user?._id);

        response = await fetch("/api/forms/upload", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          body: formData,
        });
      }

      if (response.ok) {
        const responseData = await response.json();
        
        if (responseData.success && responseData.data && responseData.data.form) {
          toast.success(selectedFile.type === 'google-form' 
            ? "Google Form imported successfully!" 
            : "Form uploaded successfully!");
          
          // Fetch the latest forms to include the newly uploaded one
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
            }
          };

          await fetchForms();
          
          // Close the modal and clear selection
          setShowUploadModal(false);
          setSelectedFile(null);
          
          // Switch to create view with the uploaded form data
          setView("create");
          
          // Store the uploaded form ID to be used by FormCreationInterface
          sessionStorage.setItem('uploadedFormId', responseData.data.form._id);
        } else {
          toast.error("Upload succeeded but form data is incomplete");
        }
      } else {
        const errorData = await response.json();
        toast.error(`${selectedFile.type === 'google-form' ? 'Import' : 'Upload'} failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
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
          <FormCreationInterface onBack={() => setView("dashboard")} />
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
                Upload Form
              </h3>

              {/* File Upload Section */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-700 mb-3">Upload File</h4>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  accept=".pdf,.docx,.csv,.xlsx,.txt,.doc"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Supported formats: PDF, DOCX, CSV, XLSX, TXT
                </p>
              </div>

              <div className="relative flex items-center my-6">
                <span className="grow border-t border-gray-300"></span>
                <span className="px-4 text-gray-500 bg-white">or</span>
                <span className="grow border-t border-gray-300"></span>
              </div>

              {/* Google Forms URL Section */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-700 mb-3">Import Google Form</h4>
                <input
                  type="url"
                  placeholder="https://docs.google.com/forms/d/.../viewform"
                  onChange={handleUrlChange}
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
                    setSelectedFile(null);
                  }}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Upload
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
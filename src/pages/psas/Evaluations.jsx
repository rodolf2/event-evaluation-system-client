import { useState, useEffect } from "react";
import PSASLayout from "../../components/psas/PSASLayout";
import ImportCSVModal from "../../components/psas/evaluations/ImportCSVModal";
import FormCreationInterface from "../../components/psas/evaluations/FormCreationInterface";
import EvaluationContent from "../../components/psas/evaluations/EvaluationContent";

const Evaluations = () => {
  const [view, setView] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadUrl, setUploadUrl] = useState("");
  const [loading, setLoading] = useState(true);

  const evaluationForms = [
    {
      id: 1,
      title: "Untitled Form",
      description: "Form Description",
      status: "Draft",
      createdAt: "2025-01-15",
      responses: 0,
    },
    {
      id: 2,
      title: "Untitled Form",
      description: "Form Description",
      status: "Published",
      createdAt: "2025-01-14",
      responses: 25,
    },
    {
      id: 3,
      title: "Untitled Form",
      description: "Form Description",
      status: "Draft",
      createdAt: "2025-01-13",
      responses: 0,
    },
    {
      id: 4,
      title: "Untitled Form",
      description: "Form Description",
      status: "Published",
      createdAt: "2025-01-12",
      responses: 150,
    },
  ];

  useEffect(() => {
    // Simulate loading delay for consistent user experience
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreateNew = () => setView("create");
  const handleImport = () => setShowUploadModal(true);

  // Show loading spinner while data is being initialized
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
            onImport={handleImport}
          />
        )}


        {showUploadModal && view === "dashboard" && (
          <div className="fixed inset-0 bg-[#F4F4F5]/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md z-60">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Upload Form
              </h3>
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Add link or File URL"
                  value={uploadUrl}
                  onChange={(e) => setUploadUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadUrl("");
                  }}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log("Uploading:", uploadUrl);
                    setShowUploadModal(false);
                    setUploadUrl("");
                  }}
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

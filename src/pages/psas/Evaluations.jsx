import { useState } from "react";
import PSASLayout from "../../components/psas/PSASLayout";
import { Plus, Upload, Search, Filter } from "lucide-react";
import uploadIcon from "../../assets/icons/upload-icon.svg";
import blankFormIcon from "../../assets/icons/blankform-icon.svg";

const Evaluations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadUrl, setUploadUrl] = useState("");

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

  return (
    <PSASLayout>
      <div className="p-6 md:p-5 bg-gray-50 flex flex-col">
        {/* Start an Evaluation Section */}
        <div className="flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Start an evaluation
          </h2>

          {/* Cards and Labels Container */}
          <div className="mb-7">
            {/* Cards and Labels Container */}
            <div
              className="mb-8 text-white p-8 rounded-xl shadow-lg"
              style={{
                background:
                  "linear-gradient(-0.15deg, #324BA3 38%, #002474 100%)",
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-10xl mx-auto">
                {/* Blank Form Card */}
                <div className="bg-white rounded-xl shadow-lg p-8 sm:p-16 text-center cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center mx-auto mb-4">
                    <img
                      src={blankFormIcon}
                      alt="Blank Form"
                      className="w-10 h-10 sm:w-16 sm:h-16"
                    />
                  </div>
                </div>

                {/* Upload Form Card */}
                <div
                  className="bg-white rounded-xl shadow-lg p-8 sm:p-16 text-center cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105"
                  onClick={() => setShowUploadModal(true)}
                >
                  <div className="w-24 h-24 sm:w-30 sm:h-32 flex items-center justify-center mx-auto mb-4">
                    <img
                      src={uploadIcon}
                      alt="Upload"
                      className="w-10 h-10 sm:w-16 sm:h-16"
                    />
                  </div>
                </div>
              </div>

              {/* Labels Below Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-10xl mx-auto mt-5">
                <div className="text-center">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                    Blank Form
                  </h3>
                </div>
                <div className="text-center">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                    Upload Form
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Evaluations Section */}
          <div className="flex-1 overflow-y-auto">
            {/* Header with Search and Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Recent Evaluations
              </h2>

              {/* Search and Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-3">
                <div className="flex-1 relative">
                  <Search className="w-6 h-6 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search evaluations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Filter className="w-6 h-6 text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="title">Title A-Z</option>
                    <option value="responses">Most Responses</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Evaluation Forms Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
              {evaluationForms.map((form) => (
                <div
                  key={form.id}
                  className="bg-white rounded-xl shadow-lg p-3 sm:p-4 cursor-pointer duration-300 min-h-[200px] sm:min-h-[180px]"
                  style={{
                    background:
                      "linear-gradient(-0.15deg, #324BA3 38%, #002474 100%)",
                  }}
                >
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm sm:text-base">F</span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                        form.status === "Published"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {form.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-800 mb-2 text-sm sm:text-base truncate">
                    {form.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                    {form.description}
                  </p>

                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
                    <span className="font-medium">
                      {form.responses} responses
                    </span>
                    <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-[#F4F4F5]/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
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
                  // Handle upload logic here
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
  );
};

export default Evaluations;

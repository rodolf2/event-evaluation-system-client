import {
  Search,
  Filter,
  ChevronRight
} from "lucide-react";
import uploadIcon from "../../../assets/icons/upload-icon.svg";
import blankFormIcon from "../../../assets/icons/blankform-icon.svg";

const EvaluationContent = ({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  evaluationForms,
  onCreateNew,
  onShowUploadModal
}) => {
  return (
    <div className="p-4 md:p-8  min-h-screen">
      {/* Start an evaluation section - preserved */}
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
              <div
                className="bg-white rounded-xl shadow-lg p-8 sm:p-16 text-center cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 relative z-10"
                onClick={onCreateNew}
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center mx-auto mb-4">
                  <img
                    src={blankFormIcon}
                    alt="Blank Form"
                    className="w-10 h-10 sm:w-16 sm:h-16"
                  />
                </div>
              </div>

              <div
                className="bg-white rounded-xl shadow-lg p-8 sm:p-16 text-center cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 relative z-10"
                onClick={onShowUploadModal}
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
      </div>

      {/* Recent Evaluations Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h2 className="text-2xl font-bold text-gray-800">My Evaluations</h2>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="newest">Event</option>
              <option value="oldest">Oldest</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {evaluationForms.map((form) => (
          <RecentEvaluationCard key={form.id} form={form} />
        ))}
      </div>
    </div>
  );
};

const RecentEvaluationCard = ({ form }) => {
  const handleCardClick = () => {
    window.location.href = `/psas/evaluations?edit=${form.id}`;
  };

  // Placeholder dates - replace with actual data if available
  const openDate = form.createdAt || "August 14, 2025";
  const closeDate = form.createdAt || "August 19, 2025";

  return (
    <div
      className="bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-300 flex overflow-hidden"
      onClick={handleCardClick}
    >
      <div className="w-2 bg-blue-600"></div>
      <div className="p-5 grow flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">{form.title}</h3>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            <p>Open: {openDate}</p>
            <p>Closes: {closeDate}</p>
          </div>
          <ChevronRight className="w-6 h-6 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default EvaluationContent;
import {
  Search,
  Filter,
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
    <div className="p-6 md:p-5 bg-gray-50 flex flex-col">
      <div className="shrink-0">
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

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Recent Evaluations
            </h2>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {evaluationForms.map((form) => (
              <RecentEvaluationCard key={form.id} form={form} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const RecentEvaluationCard = ({ form }) => {
  return (
    <div className="rounded-lg shadow-md">
      <div className="bg-white p-6 rounded-t-lg">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{form.title}</h2>
          <p className="text-gray-500">{form.description}</p>
        </div>
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Write a description..."
            className="w-full pr-6 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled
          />
        </div>
        <div>
          <div className="flex items-center mb-4">
            <input
              type="radio"
              name={`option-${form.id}`}
              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              disabled
            />
            <label className="ml-3 text-gray-700">Option 1</label>
          </div>
          <div className="flex items-center mb-4">
            <input
              type="radio"
              name={`option-${form.id}`}
              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              disabled
            />
            <label className="ml-3 text-gray-700">Option 2</label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              name={`option-${form.id}`}
              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              disabled
            />
            <label className="ml-3 text-gray-700">Option 3</label>
          </div>
        </div>
      </div>
      <div
        className="p-6 rounded-b-lg"
        style={{
          background: "linear-gradient(-0.15deg, #324BA3 38%, #002474 100%)",
        }}
      >
        <h3 className="text-xl font-bold text-white">{form.title}</h3>
      </div>
    </div>
  );
};

export default EvaluationContent;
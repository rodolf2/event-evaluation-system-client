import { Plus, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { templates } from "../../../templates";

const CertificateGallery = ({
  onTemplateSelect,
  onBlankCanvas,
  isFromEvaluation = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Reset to first page when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOrder]);

  const filteredTemplates = templates
    .filter((template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });

  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const paginatedTemplates = filteredTemplates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="max-h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-auto">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-3">
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
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5">
          {!isFromEvaluation && (
            <div
              className="rounded-xl shadow-sm border-2 border-dashed border-gray-300 cursor-pointer hover:shadow-md hover:border-[#2662D9] hover:bg-blue-50/50 transition-all duration-300 h-full min-h-[160px] flex flex-col items-center justify-center bg-gray-50/50 group"
              onClick={onBlankCanvas}
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-[#2662D9]" />
              </div>
              <h3 className="text-sm font-bold text-gray-800">Blank Canvas</h3>
              <p className="text-xs text-gray-500 mt-1">Start from scratch</p>
            </div>
          )}
          {paginatedTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => onTemplateSelect(template)}
              className="cursor-pointer group"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 hover:shadow-md hover:border-blue-200 transition-all duration-200 overflow-hidden">
                <div className="aspect-4/3 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-2 pb-1">
                  <p className="text-center text-gray-800 font-semibold text-xs sm:text-sm line-clamp-1">
                    {template.name}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CertificateGallery;

import { Plus, Search, Filter } from "lucide-react";
import { useState } from "react";
import { templates } from "../../../templates";

const CertificateGallery = ({ onTemplateSelect, onBlankCanvas, isFromEvaluation = false }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const filteredTemplates = templates
    .filter((template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });

  return (
    <div className="p-6 max-h-screen">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {isFromEvaluation ? "Choose a Certificate Template" : "Create a Certificate"}
        </h2>
        <div className="mb-7">
          <div
            className="group bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200 border-l-4 border-l-[#2662D9] max-w-md"
            onClick={onBlankCanvas}
          >
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
              <Plus className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-base">Blank Canvas</h3>
              <p className="text-sm text-gray-500">Start from scratch</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Choose a template</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
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
          {filteredTemplates.map((template) => (
            <div key={template.id} onClick={() => onTemplateSelect(template)} className="cursor-pointer group">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 hover:shadow-md hover:border-blue-200 transition-all duration-200 overflow-hidden">
                <div className="aspect-4/3 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                  <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-2 pb-1">
                  <p className="text-center text-gray-800 font-semibold text-xs sm:text-sm line-clamp-1">{template.name}</p>
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
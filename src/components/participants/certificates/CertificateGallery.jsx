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
        <div onClick={onBlankCanvas} className="rounded-lg p-4 cursor-pointer hover:shadow-xl transition-shadow h-[330px]" style={{ background: "linear-gradient(180deg, #002474, #324BA3)" }}>
          <div className="bg-white rounded-md p-16 flex items-center justify-center h-[80%]">
            <Plus size={56} className="text-blue-700" />
          </div>
          <p className="text-center text-white text-xl font-semibold mt-4">Blank Canvas</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => (
            <div key={template.id} onClick={() => onTemplateSelect(template)} className="cursor-pointer group">
              <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow aspect-4/3 flex items-center justify-center overflow-hidden">
                <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover" />
              </div>
              <p className="text-center text-gray-700 font-semibold mt-2">{template.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CertificateGallery;
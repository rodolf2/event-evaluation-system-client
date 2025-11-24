import React, { useState } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Edit,
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
  onShowUploadModal,
  onDeleteForm
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
                  Bank Form
                </h3>
              </div>
              <div className="text-center">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                  Upload a Form
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 mb-7">
            <h2 className="text-3xl font-bold text-gray-800">
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
              <RecentEvaluationCard key={form.id} form={form} onDeleteForm={onDeleteForm} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const RecentEvaluationCard = ({ form, onDeleteForm }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleCardClick = (e) => {
    // Don't navigate if clicking on menu items
    if (e.target.closest('.menu-button')) {
      return;
    }
    
    // Store the form ID to edit and navigate to create form view
    localStorage.setItem('editFormId', form.id);
    window.location.href = `/psas/evaluations?view=create&edit=${form.id}`;
  };

  const handleDelete = (e) => {
    e.stopPropagation(); // Prevent card click
    if (window.confirm(`Are you sure you want to delete "${form.title}"?`)) {
      onDeleteForm(form.id);
    }
    setShowMenu(false);
  };

  const toggleMenu = (e) => {
    e.stopPropagation(); // Prevent card click
    setShowMenu(!showMenu);
  };

  return (
    <div
      className="rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-300 h-full flex flex-col"
      onClick={handleCardClick}
    >
      <div className="bg-white p-6 rounded-t-lg grow flex flex-col">
        <div className="text-center mb-4 shrink-0 relative">
          <h2 className="text-2xl font-bold text-gray-800 line-clamp-2">{form.title}</h2>
          <p className="text-gray-500 text-sm line-clamp-2">{form.description}</p>
          
          {/* Menu button */}
          <div className="absolute top-0 right-0">
            <button
              onClick={toggleMenu}
              className="menu-button p-2 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              title="Actions"
            >
              <MoreVertical size={20} />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-48">
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete Form
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Fixed preview section */}
        <div className="grow">
          <div className="flex justify-between items-center mb-4">
            <input
              type="text"
              placeholder="Sample question..."
              className="w-full pr-6 py-3 text-sm border border-gray-300 rounded-lg bg-gray-50"
              disabled
              value="Sample question preview"
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="radio"
                name={`option-${form.id}`}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                disabled
              />
              <label className="ml-3 text-gray-700 text-sm">Option 1</label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                name={`option-${form.id}`}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                disabled
              />
              <label className="ml-3 text-gray-700 text-sm">Option 2</label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                name={`option-${form.id}`}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                disabled
              />
              <label className="ml-3 text-gray-700 text-sm">Option 3</label>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed footer */}
      <div
        className="p-4 rounded-b-lg shrink-0"
        style={{
          background: "linear-gradient(-0.15deg, #324BA3 38%, #002474 100%)",
        }}
      >
        <h3 className="text-lg font-bold text-white line-clamp-1">{form.title}</h3>
        <div className="mt-2 text-sm text-white/80 flex items-center justify-between">
          <div>
            <span>{form.responses} responses</span>
            <span className="mx-2">•</span>
            <span>{form.status}</span>
          </div>
          <span className="text-xs">{form.createdAt}</span>
        </div>
      </div>
    </div>
  );
};

export default EvaluationContent;
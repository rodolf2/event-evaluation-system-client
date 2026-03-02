import { Search, Trash2 } from "lucide-react";
import plusIcon from "../../../assets/icons/plus.svg";
import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../contexts/useAuth";
import { templates } from "../../../templates";
import {
  getTemplatesForEvent,
  EVENT_TEMPLATE_MAPPING,
} from "../../../templates/eventTemplateMapping";
import ConfirmationModal from "../../shared/ConfirmationModal";

const CertificateGallery = ({
  onTemplateSelect,
  onBlankCanvas,
  isFromEvaluation = false,
  eventName = null,
}) => {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedEventType, setSelectedEventType] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [customTemplates, setCustomTemplates] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch custom templates
  useEffect(() => {
    const fetchTemplates = async () => {
      if (!token) {
        return;
      }

      try {
        const response = await axios.get("/api/certificates/templates", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success && response.data.data.custom) {
          setCustomTemplates(response.data.data.custom);
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };

    fetchTemplates();
  }, [token]);

  const handleDeleteTemplate = (e, templateId) => {
    e.stopPropagation();
    setTemplateToDelete(templateId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!templateToDelete) return;

    setIsDeleting(true);
    try {
      await axios.delete(`/api/certificates/templates/${templateToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove from state
      setCustomTemplates((prev) => prev.filter((t) => t.id !== templateToDelete));

      // If selected, deselect
      if (selectedTemplate?.id === templateToDelete) {
        setSelectedTemplate(null);
      }
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Error deleting template:", error);
      alert("Failed to delete template");
    } finally {
      setIsDeleting(false);
      setTemplateToDelete(null);
    }
  };

  const allTemplates = useMemo(() => {
    const builtIn = templates || [];
    return [...customTemplates, ...builtIn];
  }, [customTemplates]);

  // Get recommended templates for this event (if eventName provided)
  const recommendedTemplateIds = useMemo(() => {
    if (eventName && isFromEvaluation) {
      const recommended = getTemplatesForEvent(null, eventName);
      return new Set(recommended.map((t) => t.id));
    }
    return new Set();
  }, [eventName, isFromEvaluation]);

  const filteredTemplates = useMemo(() => {
    let filtered = allTemplates;

    if (searchTerm) {
      filtered = filtered.filter(
        (template) =>
          template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (template.description &&
            template.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase())),
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (template) => template.category === selectedCategory,
      );
    }

    if (selectedEventType !== "all") {
      const eventTemplates = EVENT_TEMPLATE_MAPPING[selectedEventType] || [];
      const eventTemplateIds = new Set(eventTemplates.map((t) => t.id));
      filtered = filtered.filter((template) =>
        eventTemplateIds.has(template.id),
      );
    }

    // Sort: recommended first (if event specified), then alphabetically
    filtered.sort((a, b) => {
      const aRecommended = recommendedTemplateIds.has(a.id);
      const bRecommended = recommendedTemplateIds.has(b.id);
      if (aRecommended && !bRecommended) return -1;
      if (!aRecommended && bRecommended) return 1;
      return a.name.localeCompare(b.name);
    });

    return filtered;
  }, [
    allTemplates,
    searchTerm,
    selectedCategory,
    selectedEventType,
    recommendedTemplateIds,
  ]);

  const categories = useMemo(() => {
    const cats = new Set();
    allTemplates.forEach((t) => {
      if (t.category) cats.add(t.category);
    });
    return Array.from(cats).sort();
  }, [allTemplates]);

  const eventTypes = useMemo(() => {
    return Object.keys(EVENT_TEMPLATE_MAPPING).sort();
  }, []);

  const handleTemplateSelect = (template) => {
    // Immediately notify parent of template selection with proper workflow flags
    onTemplateSelect(template, {
      action: "preview",
      isFromEvaluation,
    });
  };

  const handleConfirmTemplate = () => {
    // User has confirmed the selected template - trigger save and return workflow
    if (selectedTemplate && onTemplateSelect) {
      onTemplateSelect(selectedTemplate, {
        action: "confirm",
        saveTemplate: true,
        isFromEvaluation: isFromEvaluation,
      });
    }
  };

  const handleBackToGallery = () => {
    // Return to gallery without losing selected template
    setSelectedTemplate(null);
  };

  return (
    <div className="w-full flex flex-col min-h-[70vh]">
      <div className="shrink-0 mb-6 sm:mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4 sm:mb-6 leading-tight">
          {isFromEvaluation
            ? "Link a Certificate Template"
            : "Create a Certificate"}
        </h2>

        {/* Only show Blank Canvas option when NOT from evaluation (certificate linking context) */}
        {!isFromEvaluation && (
          <div className="mb-6 sm:mb-8">
            <div
              className="group bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200 border-l-4 border-l-[#2662D9] w-full max-w-sm"
              onClick={onBlankCanvas}
            >
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                <img
                  src={plusIcon}
                  alt="Plus"
                  className="w-6 h-6"
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-base">Blank Canvas</h3>
                <p className="text-sm text-gray-500">Start from scratch</p>
              </div>
            </div>
          </div>
        )}

        {/* Template Selection */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
            <h2 className="text-lg font-bold text-gray-800">
              Choose a template
            </h2>
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <div className="relative flex-1 min-w-[200px] sm:min-w-[240px]">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <select
                value={selectedEventType}
                onChange={(e) => setSelectedEventType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-[140px]"
              >
                <option value="all">All Events</option>
                {eventTypes.map((eventType) => (
                  <option key={eventType} value={eventType}>
                    {eventType
                      .replace(/-/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
              {categories.length > 0 && (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-[140px]"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
            {filteredTemplates.map((template) => {
              const isRecommended = recommendedTemplateIds.has(template.id);
              const isSelected = selectedTemplate?.id === template.id;
              return (
                <div
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`cursor-pointer group relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all duration-200 ${
                    isSelected
                      ? "ring-2 ring-blue-500 ring-offset-2 shadow-md"
                      : ""
                  }`}
                >
                  {isRecommended && eventName && (
                    <div className="absolute top-1.5 right-1.5 bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold z-10 shadow-sm">
                      Recommended
                    </div>
                  )}

                  {/* Delete button for custom templates */}
                  {template.isOwner && (
                    <button
                      onClick={(e) => handleDeleteTemplate(e, template.id)}
                      className="absolute top-1.5 right-1.5 p-1 bg-white/90 text-red-600 rounded shadow-sm hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all pointer-events-auto z-10"
                      title="Delete Template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Category Badge */}
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/50 backdrop-blur-xs text-white text-[8px] font-medium rounded uppercase tracking-wider z-10">
                    {template.category || "General"}
                  </div>

                  {/* Template Preview */}
                  <div className="bg-gray-50 aspect-4/3 flex items-center justify-center overflow-hidden border-b border-gray-100 group-hover:border-blue-100 transition-all">
                    {template.thumbnail || template.preview ? (
                      <img
                        src={template.thumbnail || template.preview}
                        alt={template.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="text-gray-400 text-[10px] p-2 text-center uppercase font-medium">
                        {template.name}
                      </div>
                    )}
                  </div>

                  {/* Template Info */}
                  <div className="p-2.5">
                    <h3 className="font-semibold text-gray-800 text-[11px] sm:text-xs leading-tight line-clamp-1">
                      {template.name}
                    </h3>
                    {template.description ? (
                      <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
                        {template.description}
                      </p>
                    ) : (
                      <p className="text-[10px] text-gray-400 mt-0.5 italic">
                        No description
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-16 sm:py-24">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-600 text-lg sm:text-xl font-medium mb-2">
                  No templates found
                </p>
                <p className="text-gray-500 text-sm sm:text-base">
                  Try adjusting your search terms or filters
                </p>
              </div>
            </div>
          )}

          {/* Confirmation Panel */}
          {selectedTemplate && isFromEvaluation && (
            <div className="mt-8 sm:mt-12 bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6 md:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-800 text-lg sm:text-xl mb-1">
                    Selected: {selectedTemplate.name}
                  </h3>
                  {selectedTemplate.description && (
                    <p className="text-sm sm:text-base text-blue-600 leading-relaxed">
                      {selectedTemplate.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleBackToGallery}
                    className="px-4 py-2.5 text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm"
                  >
                    Choose Different
                  </button>
                  <button
                    onClick={handleConfirmTemplate}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm shadow-md"
                  >
                    Use This Template
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Template"
        message="Are you sure you want to delete this certificate template? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default CertificateGallery;

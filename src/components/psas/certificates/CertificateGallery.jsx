import { Search } from "lucide-react";
import { useState, useMemo } from "react";
import { templates } from "../../../templates";
import {
  getAllTemplates,
  getTemplatesForEvent,
  EVENT_TEMPLATE_MAPPING,
} from "../../../templates/eventTemplateMapping";
import plusIcon from "../../../assets/icons/plus.svg";

const CertificateGallery = ({
  onTemplateSelect,
  onBlankCanvas,
  isFromEvaluation = false,
  eventName = null,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedEventType, setSelectedEventType] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const allTemplates = useMemo(() => {
    return templates || getAllTemplates();
  }, []);

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
              .includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (template) => template.category === selectedCategory
      );
    }

    if (selectedEventType !== "all") {
      const eventTemplates = EVENT_TEMPLATE_MAPPING[selectedEventType] || [];
      const eventTemplateIds = new Set(eventTemplates.map((t) => t.id));
      filtered = filtered.filter((template) =>
        eventTemplateIds.has(template.id)
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
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 leading-tight">
          Create a certificate
        </h2>
        <div className="mb-6 sm:mb-8">
          <div
            className="mb-6 sm:mb-8 text-white p-4 sm:p-6 md:p-8 rounded-xl shadow-lg relative"
            style={{
              background:
                "linear-gradient(-0.15deg, #324BA3 38%, #002474 100%)",
            }}
          >
            <div className="flex justify-center px-4">
              <div
                className="bg-white rounded-xl shadow-lg p-6 sm:p-8 md:p-12 lg:p-16 text-center cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative z-10 w-full max-w-md sm:max-w-lg md:max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl"
                onClick={onBlankCanvas}
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 flex items-center justify-center mx-auto mb-4 sm:mb-6 md:mb-8">
                  <img
                    src={plusIcon}
                    alt="Plus"
                    className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-center px-4">
              <div className="text-center">
                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">
                  Blank Canvas
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Template Selection */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 lg:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
              Choose a template
            </h2>
            <div className="flex flex-wrap items-center gap-2 lg:gap-3">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredTemplates.map((template) => {
              const isRecommended = recommendedTemplateIds.has(template.id);
              const isSelected = selectedTemplate?.id === template.id;
              return (
                <div
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`cursor-pointer group relative bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${
                    isSelected
                      ? "ring-2 ring-blue-500 ring-offset-2 shadow-xl"
                      : ""
                  }`}
                >
                  {isRecommended && eventName && (
                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold z-10">
                      ⭐ Recommended
                    </div>
                  )}

                  {/* Template Preview */}
                  <div className="bg-linear-to-br from-gray-100 to-gray-200 aspect-4/3 flex items-center justify-center overflow-hidden border border-gray-300 group-hover:border-blue-500 transition-all">
                    {template.thumbnail ? (
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-500 text-xs sm:text-sm p-3 sm:p-4 text-center">
                        {template.name}
                      </div>
                    )}
                  </div>

                  {/* Template Info */}
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-gray-800 text-xs sm:text-sm mb-1 leading-tight text-center">
                      {template.name}
                    </h3>
                    {template.description && (
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed ">
                        {template.description}
                      </p>
                    )}

                    {isRecommended && eventName && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs text-blue-600 font-medium">
                          Works well for {eventName}
                        </p>
                      </div>
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
    </div>
  );
};

export default CertificateGallery;

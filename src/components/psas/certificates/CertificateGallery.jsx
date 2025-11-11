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
      const eventTemplateIds = new Set(eventTemplates.map(t => t.id));
      filtered = filtered.filter(template => eventTemplateIds.has(template.id));
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
  }, [allTemplates, searchTerm, selectedCategory, selectedEventType, recommendedTemplateIds]);

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

  return (
    <div className="p-6 md:p-5 bg-gray-50 flex flex-col">
      <div className="shrink-0">
        <h2 className="text-3xl text-gray-800 mb-4">Create a certificate</h2>
        <div className="mb-7">
          <div
            className="mb-8 text-white p-8 rounded-xl shadow-lg relative"
            style={{
              background:
                "linear-gradient(-0.15deg, #324BA3 38%, #002474 100%)",
            }}
          >
            <div className="flex justify-center max-w-10xl mx-auto">
              <div
                className="bg-white rounded-xl shadow-lg p-8 sm:p-16 text-center cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 relative z-10"
                onClick={onBlankCanvas}
                style={{ minHeight: "300px", width: "1500px" }}
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center mx-auto mb-4">
                  <img src={plusIcon} alt="Plus" className="w-16 h-16" />
                </div>
              </div>
            </div>

            <div className="flex justify-center max-w-10xl mx-auto mt-5">
              <div className="text-center">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                  Blank Canvas
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Template Selection */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Choose a template
            </h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-48 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={selectedEventType}
                onChange={(e) => setSelectedEventType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Event Types</option>
                {eventTypes.map((eventType) => (
                  <option key={eventType} value={eventType}>
                    {eventType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
              {categories.length > 0 && (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTemplates.map((template) => {
              const isRecommended = recommendedTemplateIds.has(template.id);
              return (
                <div
                  key={template.id}
                  onClick={() => onTemplateSelect(template)}
                  className="cursor-pointer group relative"
                >
                  {isRecommended && eventName && (
                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold z-10">
                      ★
                    </div>
                  )}
                  <div className="bg-gray-200 rounded-lg aspect-4/3 flex items-center justify-center overflow-hidden border border-gray-300 group-hover:border-blue-500 transition-all">
                    {template.thumbnail ? (
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-500 text-sm p-4 text-center">
                        {template.name}
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-center font-medium text-gray-800 text-sm">
                    {template.name}
                    {isRecommended && eventName && (
                      <span className="text-blue-500 text-xs block">
                        Recommended
                      </span>
                    )}
                  </p>
                </div>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg">
                No templates found. Try a different search.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateGallery;

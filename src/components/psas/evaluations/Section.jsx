import { useRef, useEffect } from "react";
import { Trash2 } from "lucide-react";

const Section = ({
  id,
  index,
  title,
  description,
  onRemove,
  active,
  onUpdateSection,
}) => {
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);

  // Auto-resize textareas
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = "auto";
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    }
  }, [title]);

  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.style.height = "auto";
      descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
    }
  }, [description]);

  // Fallback label if index is missing; index is managed by parent.
  const sectionLabel = index ? `Section ${index}` : "Section";

  return (
    <div className="mt-6 flex justify-center relative">
      {/* Section label badge aligned just above the section container, matching Section 1 style */}
      <div className="absolute -top-4 left-0 z-10">
        <span className="px-3 py-1 text-xs sm:text-sm font-medium text-white bg-[#1F3463] rounded-t-md shadow-sm">
          {sectionLabel}
        </span>
      </div>

      <div
        className={`w-full max-w-4xl bg-white rounded-lg shadow-sm p-6 sm:p-10 relative min-h-[220px] transition
          ${active
            ? "ring-2 ring-blue-500/40"
            : "hover:ring-1 hover:ring-gray-200"
          }`}
      >
        {/* Section title - aligned to match Section 1 header styling */}
        <textarea
          ref={titleRef}
          value={title || ""}
          placeholder={`${sectionLabel} title`}
          onChange={(e) => onUpdateSection?.(id, "title", e.target.value)}
          className="w-full text-xl sm:text-3xl font-bold border-none outline-none mb-2 text-center placeholder:text-gray-400 resize-none overflow-hidden"
          rows={1}
        />

        {/* Section description - positioned directly under title like Section 1 */}
        <textarea
          ref={descriptionRef}
          value={description || ""}
          placeholder="Add a description"
          onChange={(e) => onUpdateSection?.(id, "description", e.target.value)}
          className="w-full text-sm sm:text-base text-gray-600 border-none outline-none resize-none mb-4 text-center placeholder:text-gray-400 overflow-hidden"
          rows={1}
        />

        {/* Delete section */}
        <div className="absolute bottom-4 right-4">
          <button
            type="button"
            onClick={() => onRemove?.(id)}
            className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100 transition"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Section;

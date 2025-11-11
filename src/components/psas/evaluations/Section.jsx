import { Trash2 } from "lucide-react";

/**
 * Section card component (restored previous simple design).
 *
 * - Simple white card, same visual language as main form card.
 * - No floating "Section X" label banner.
 * - No star/move/overflow menu.
 * - Keeps delete button in bottom-right.
 * - Supports active highlighting via `active` prop (for current FormCreationInterface logic).
 */
const Section = ({
  id,
  index,
  title,
  description,
  onRemove,
  active,
  onUpdateSection,
}) => {
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
          ${
            active
              ? "ring-2 ring-blue-500/40"
              : "hover:ring-1 hover:ring-gray-200"
          }`}
      >
        {/* Section title - aligned to match Section 1 header styling */}
        <input
          type="text"
          value={title || ""}
          placeholder={`${sectionLabel} title`}
          onChange={(e) => onUpdateSection?.(id, "title", e.target.value)}
          className="w-full text-3xl sm:text-5xl font-bold border-none outline-none mb-2 text-center placeholder:text-gray-400"
        />

        {/* Section description - positioned directly under title like Section 1 */}
        <textarea
          value={description || ""}
          placeholder="Add a description"
          onChange={(e) => onUpdateSection?.(id, "description", e.target.value)}
          className="w-full text-base sm:text-lg text-gray-600 border-none outline-none resize-none mb-4 text-center placeholder:text-gray-400"
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

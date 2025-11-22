import { useState, useEffect, useRef, memo } from "react";
import { ChevronDown, Copy, Trash2 } from "lucide-react";

// Emoji Icons
import E1 from "../../../assets/icons/emojis/E1.svg";
import E2 from "../../../assets/icons/emojis/E2.svg";
import E3 from "../../../assets/icons/emojis/E3.svg";
import E4 from "../../../assets/icons/emojis/E4.svg";
import E5 from "../../../assets/icons/emojis/E5.svg";
import H1 from "../../../assets/icons/emojis/H1.svg";
import H2 from "../../../assets/icons/emojis/H2.svg";
import H3 from "../../../assets/icons/emojis/H3.svg";
import H4 from "../../../assets/icons/emojis/H4.svg";
import H5 from "../../../assets/icons/emojis/H5.svg";
import S1 from "../../../assets/icons/emojis/S1.svg";
import S2 from "../../../assets/icons/emojis/S2.svg";
import S3 from "../../../assets/icons/emojis/S3.svg";
import S4 from "../../../assets/icons/emojis/S4.svg";
import S5 from "../../../assets/icons/emojis/S5.svg";

// Question type icons (ensure these paths match your actual files)
import MultipleChoice from "../../../assets/icons/forms/multiple_choice.svg";
import LikertScale from "../../../assets/icons/forms/likert_scale.svg";
import Paragraph from "../../../assets/icons/forms/paragraph.svg";
import NumericRatings from "../../../assets/icons/forms/numeric_rating.svg";

const emojiStylesMap = {
  Default: [E1, E2, E3, E4, E5],
  Heart: [H1, H2, H3, H4, H5],
  Star: [S1, S2, S3, S4, S5],
};

// Map question types to their corresponding icons using your imported SVGs.
// IMPORTANT:
// Only include mappings for types that have dedicated icons in the local assets.
const typeIconMap = {
  "Multiple Choices": MultipleChoice,
  "Numeric Ratings": NumericRatings,
  "Likert Scale": LikertScale,
  Paragraph: Paragraph,
};

const QUESTION_TYPES = [
  {
    label: "Multiple Choices",
    value: "Multiple Choices",
    icon: MultipleChoice,
  },
  { label: "Numeric Ratings", value: "Numeric Ratings", icon: NumericRatings },
  { label: "Likert Scale", value: "Likert Scale", icon: LikertScale },
  { label: "Paragraph", value: "Paragraph", icon: Paragraph },
];

const Question = memo(function Question(props) {
  const {
    id,
    type,
    title,
    options = [],
    required,
    ratingScale,
    emojiStyle,
    likertStart,
    likertEnd,
    likertStartLabel,
    likertEndLabel,
    updateQuestion,
    duplicateQuestion,
    removeQuestion,
  } = props;

  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
  const styleDropdownRef = useRef(null);

  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const typeDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        styleDropdownRef.current &&
        !styleDropdownRef.current.contains(event.target)
      ) {
        setIsStyleDropdownOpen(false);
      }
      if (
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(event.target)
      ) {
        setIsTypeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addOption = () =>
    updateQuestion(id, (q) => ({
      ...q,
      options: [
        ...(q.options || []),
        `Option ${((q.options || []).length || 0) + 1}`,
      ],
    }));

  const updateOption = (index, value) => {
    updateQuestion(id, (q) => {
      const newOptions = q.options.map((option, i) =>
        i === index ? value : option
      );
      return {
        ...q,
        options: newOptions,
      };
    });
  };

  const removeOption = (index) =>
    updateQuestion(id, (q) => ({
      ...q,
      options: q.options.filter((_, i) => i !== index),
    }));

  const getNumbersToShow = (scale) => {
    if (scale === 3) return [1, 2, 3];
    if (scale === 4) return [1, 2, 3, 4];
    return [1, 2, 3, 4, 5];
  };

  const getIconIndices = (scale) => {
    if (scale === 3) return [0, 2, 4];
    if (scale === 4) return [0, 1, 3, 4];
    return [0, 1, 2, 3, 4];
  };

  const numbersToShow = getNumbersToShow(ratingScale || 5);
  const iconIndices = getIconIndices(ratingScale || 5);
  const emojiList = emojiStylesMap[emojiStyle] || emojiStylesMap.Default;

  const renderOptions = () => {
    switch (type) {
      case "Numeric Ratings":
        return (
          <div className="mt-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-4">
              <select
                value={ratingScale}
                onChange={(e) =>
                  updateQuestion(id, (q) => ({
                    ...q,
                    ratingScale: parseInt(e.target.value, 10),
                  }))
                }
                className="p-2 border border-gray-300 rounded-md"
              >
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>

              <div className="relative" ref={styleDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsStyleDropdownOpen(!isStyleDropdownOpen)}
                  className="flex items-center p-2 border border-gray-300 rounded-md"
                >
                  <img
                    src={emojiList[iconIndices[iconIndices.length - 1]]}
                    alt={emojiStyle}
                    className="w-6 h-6"
                  />
                  <ChevronDown size={16} className="ml-2 text-gray-500" />
                </button>

                {isStyleDropdownOpen && (
                  <div className="absolute top-full mt-1 w-auto bg-white border border-gray-300 rounded-md shadow-lg z-20">
                    <div className="flex flex-col p-1">
                      {Object.keys(emojiStylesMap).map((style) => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => {
                            updateQuestion(id, (q) => ({
                              ...q,
                              emojiStyle: style,
                            }));
                            setIsStyleDropdownOpen(false);
                          }}
                          className="p-2 rounded-md hover:bg-gray-100"
                        >
                          <img
                            src={
                              emojiStylesMap[style][
                                iconIndices[iconIndices.length - 1]
                              ]
                            }
                            alt={style}
                            className="w-10 h-10"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center items-center text-center gap-x-2 sm:gap-x-4">
              {numbersToShow.map((num, index) => (
                <div key={num} className="flex flex-col items-center">
                  <span>{num}</span>
                  <img
                    src={emojiList[iconIndices[index]]}
                    alt={`Rating ${num}`}
                    className="w-10 h-10 sm:w-12 mt-1"
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case "Multiple Choices":
        return (
          <div className="mt-4">
            {(options || []).map((opt, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="radio"
                  name={`question-${id}`}
                  className="mr-3 h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  disabled
                />
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    updateOption(index, e.target.value);
                  }}
                  className="grow p-2 bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none"
                />
                <button
                  onClick={() => removeOption(index)}
                  className="ml-2 text-red-600 hover:text-red-800"
                  disabled={options.length <= 2}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={addOption}
              className="text-blue-600 mt-2 text-sm hover:text-blue-800"
            >
              + Add option
            </button>
          </div>
        );

      case "Likert Scale":
        return (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-4">
              <select
                value={likertStart}
                onChange={(e) =>
                  updateQuestion(id, (q) => ({
                    ...q,
                    likertStart: parseInt(e.target.value, 10),
                  }))
                }
                className="p-2 border border-gray-300 rounded-md"
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span>to</span>
              <select
                value={likertEnd}
                onChange={(e) =>
                  updateQuestion(id, (q) => ({
                    ...q,
                    likertEnd: parseInt(e.target.value, 10),
                  }))
                }
                className="p-2 border border-gray-300 rounded-md"
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 text-right">{likertStart}</span>
                <input
                  type="text"
                  value={likertStartLabel || ""}
                  onChange={(e) =>
                    updateQuestion(id, (q) => ({
                      ...q,
                      likertStartLabel: e.target.value,
                    }))
                  }
                  className="grow p-2 bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="w-6 text-right">{likertEnd}</span>
                <input
                  type="text"
                  value={likertEndLabel || ""}
                  onChange={(e) =>
                    updateQuestion(id, (q) => ({
                      ...q,
                      likertEndLabel: e.target.value,
                    }))
                  }
                  className="grow p-2 bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        );

      case "Paragraph":
        return (
          <div className="mt-4">
            <textarea
              placeholder="Long answer text"
              className="w-full border border-gray-200 rounded-md p-2 min-h-[100px]"
            />
          </div>
        );

      default:
        return null;
    }
  };

  const currentTypeIcon = typeIconMap[type];

  // Compute background color for the type dropdown when a type is selected
  const typeSelectBg = type && type !== "" ? "bg-[#F4F4F5]" : "bg-white";

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-4">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <input
            type="text"
            value={title || ""}
            onChange={(e) =>
              updateQuestion(id, (q) => ({
                ...q,
                title: e.target.value,
              }))
            }
            placeholder="Write a description ..."
            className="w-full text-lg font-medium border border-gray-300 rounded-md px-3 py-2 mb-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-gray-400"
          />
          {/* Removed 'Optional' label per requirements; required toggle still functional */}
        </div>

        {/* Custom type dropdown */}
        <div className="relative inline-block w-56" ref={typeDropdownRef}>
          <button
            type="button"
            onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
            className={`flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-md text-left ${typeSelectBg}`}
          >
            <div className="flex items-center gap-2">
              {currentTypeIcon && (
                <img
                  src={currentTypeIcon}
                  alt=""
                  className="w-5 h-5 object-contain"
                />
              )}
              <span className="block truncate">{type || "Select Type"}</span>
            </div>
            <ChevronDown size={16} className="text-gray-500 shrink-0" />
          </button>

          {isTypeDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-30 max-h-60 overflow-y-auto">
              {QUESTION_TYPES.map((qType) => (
                <button
                  key={qType.value}
                  type="button"
                  onClick={() => {
                    const newType = qType.value;
                    updateQuestion(id, (q) => {
                      const updatedQuestion = {
                        ...q,
                        type: newType,
                      };

                      // Reset type-specific properties when changing types
                      if (newType === "Multiple Choices") {
                        updatedQuestion.options =
                          q.options && q.options.length > 0
                            ? q.options
                            : ["Option 1", "Option 2"];
                      } else {
                        updatedQuestion.options = [];
                      }

                      if (newType === "Numeric Ratings") {
                        updatedQuestion.ratingScale = q.ratingScale || 5;
                        updatedQuestion.emojiStyle = q.emojiStyle || "Default";
                      }

                      if (newType === "Likert Scale") {
                        updatedQuestion.likertStart = q.likertStart || 1;
                        updatedQuestion.likertEnd = q.likertEnd || 5;
                        updatedQuestion.likertStartLabel =
                          q.likertStartLabel || "Poor";
                        updatedQuestion.likertEndLabel =
                          q.likertEndLabel || "Excellent";
                      }

                      return updatedQuestion;
                    });
                    setIsTypeDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors"
                >
                  {qType.icon ? (
                    <img
                      src={qType.icon}
                      alt=""
                      className="w-5 h-5 object-contain"
                    />
                  ) : (
                    <div className="w-5 h-5" /> // Spacer for alignment
                  )}
                  <span>{qType.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {renderOptions()}

      <div className="flex items-center justify-end gap-2 mt-4">
        <button
          onClick={() => duplicateQuestion(id)}
          className="p-2 rounded-md hover:bg-gray-100"
          title="Duplicate"
        >
          <Copy size={16} />
        </button>
        <button
          onClick={() => removeQuestion(id)}
          className="p-2 rounded-md hover:bg-gray-100 text-red-600"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
        <div className="flex items-center gap-2 border-l border-gray-200 pl-3 ml-3">
          <label className="text-sm text-gray-600">Required</label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={required}
              onChange={(e) =>
                updateQuestion(id, (q) => ({
                  ...q,
                  required: e.target.checked,
                }))
              }
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );
});

export default Question;

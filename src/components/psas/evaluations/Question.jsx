import { useState, useEffect, useRef, memo } from "react";
import {
    ChevronDown,
    Copy,
    Trash2,
  } from "lucide-react";
  
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

const emojiStylesMap = {
    Default: [E1, E2, E3, E4, E5],
    Heart: [H1, H2, H3, H4, H5],
    Star: [S1, S2, S3, S4, S5],
  };

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
    const [currentStartLabel, setCurrentStartLabel] = useState(
      likertStartLabel || ""
    );
    const [currentEndLabel, setCurrentEndLabel] = useState(likertEndLabel || "");
  
    useEffect(
      () => setCurrentStartLabel(likertStartLabel || ""),
      [likertStartLabel]
    );
    useEffect(() => setCurrentEndLabel(likertEndLabel || ""), [likertEndLabel]);
  
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          styleDropdownRef.current &&
          !styleDropdownRef.current.contains(event.target)
        ) {
          setIsStyleDropdownOpen(false);
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
                  />
                  <input
                    type="text"
                    defaultValue={opt}
                    className="grow p-2 bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none"
                  />
                </div>
              ))}
              <button onClick={addOption} className="text-blue-600 mt-2 text-sm">
                Add option
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
                    value={currentStartLabel}
                    onChange={(e) => setCurrentStartLabel(e.target.value)}
                    onBlur={() =>
                      updateQuestion(id, (q) => ({
                        ...q,
                        likertStartLabel: currentStartLabel,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        updateQuestion(id, (q) => ({
                          ...q,
                          likertStartLabel: currentStartLabel,
                        }));
                        e.target.blur();
                      }
                    }}
                    className="grow p-2 bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none"
                  />
                </div>
  
                <div className="flex items-center gap-2">
                  <span className="w-6 text-right">{likertEnd}</span>
                  <input
                    type="text"
                    value={currentEndLabel}
                    onChange={(e) => setCurrentEndLabel(e.target.value)}
                    onBlur={() =>
                      updateQuestion(id, (q) => ({
                        ...q,
                        likertEndLabel: currentEndLabel,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        updateQuestion(id, (q) => ({
                          ...q,
                          likertEndLabel: currentEndLabel,
                        }));
                        e.target.blur();
                      }
                    }}
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
  
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              defaultValue={title || "Untitled Question"}
              className="w-full text-lg font-medium border-none outline-none mb-2"
            />
            <div className="text-sm text-gray-500">
              {required ? "Required" : "Optional"}
            </div>
          </div>
  
          <select
            value={type}
            onChange={(e) =>
              updateQuestion(id, (q) => ({ ...q, type: e.target.value }))
            }
            className="p-2 border rounded-md"
          >
            <option>Multiple Choices</option>
            <option>Numeric Ratings</option>
            <option>Likert Scale</option>
            <option>Paragraph</option>
          </select>
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
                  updateQuestion(id, (q) => ({ ...q, required: e.target.checked }))
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
import React, { useState, useRef, useEffect, useCallback } from "react";
// SVG Icons matching FormCreationInterface Question.jsx
import E1 from "../../assets/icons/emojis/E1.svg";
import E2 from "../../assets/icons/emojis/E2.svg";
import E3 from "../../assets/icons/emojis/E3.svg";
import E4 from "../../assets/icons/emojis/E4.svg";
import E5 from "../../assets/icons/emojis/E5.svg";
import H1 from "../../assets/icons/emojis/H1.svg";
import H2 from "../../assets/icons/emojis/H2.svg";
import H3 from "../../assets/icons/emojis/H3.svg";
import H4 from "../../assets/icons/emojis/H4.svg";
import H5 from "../../assets/icons/emojis/H5.svg";
import S1 from "../../assets/icons/emojis/S1.svg";
import S2 from "../../assets/icons/emojis/S2.svg";
import S3 from "../../assets/icons/emojis/S3.svg";
import S4 from "../../assets/icons/emojis/S4.svg";
import S5 from "../../assets/icons/emojis/S5.svg";

import L1 from "../../assets/icons/likert_scale/1.svg";
import L2 from "../../assets/icons/likert_scale/2.svg";
import L3 from "../../assets/icons/likert_scale/3.svg";
import L4 from "../../assets/icons/likert_scale/4.svg";
import L5 from "../../assets/icons/likert_scale/5.svg";
import L6 from "../../assets/icons/likert_scale/6.svg";
import L7 from "../../assets/icons/likert_scale/7.svg";
import L8 from "../../assets/icons/likert_scale/8.svg";
import L9 from "../../assets/icons/likert_scale/9.svg";
import L10 from "../../assets/icons/likert_scale/10.svg";
import SliderIcon from "../../assets/icons/slider.svg";

const DynamicRatingInput = ({
  type,
  scale,
  icon = "star",
  startLabel,
  endLabel,
  value,
  onChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);

  // Exact same mapping as FormCreationInterface Question.jsx
  const emojiStylesMap = {
    Default: [E1, E2, E3, E4, E5],
    Heart: [H1, H2, H3, H4, H5],
    Star: [S1, S2, S3, S4, S5],
  };

  const likertIconMap = {
    1: L1,
    2: L2,
    3: L3,
    4: L4,
    5: L5,
    6: L6,
    7: L7,
    8: L8,
    9: L9,
    10: L10,
  };

  const getColorGradient = (icon, position) => {
    const gradients = {
      Star: ["#FFF1C8", "#FFEAAC", "#FFE290", "#FFD45A", "#FFC92F"],
      Heart: ["#FFECEC", "#FFE1E1", "#FFC7C7", "#FFB7B7", "#FF9D9D"],
      Default: ["#CC3845", "#F79651", "#FFCC4D", "#B4D084", "#2DA43E"],
    };
    return gradients[icon]?.[position - 1] || "#E5E7EB";
  };

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

  const numbersToShow = getNumbersToShow(scale);
  const iconIndices = getIconIndices(scale);
  const emojiList = emojiStylesMap[icon] || emojiStylesMap.Star;

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !sliderRef.current) return;
    const slider = sliderRef.current;
    const rect = slider.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, offsetX / rect.width));
    const newValue = Math.round(percentage * (numbersToShow.length - 1)) + 1;
    onChange(newValue);
  }, [isDragging, numbersToShow.length, onChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const renderRatingIcons = () => {
    return (
      <div className="flex flex-col items-center w-full max-w-md mx-auto">
        <div className="flex justify-between w-full relative z-10 mb-4">
          {numbersToShow.map((num, index) => {
            const i = iconIndices[index];
            const isSelected = value === num;
            const color = getColorGradient(icon, num);

            return (
              <label
                key={num}
                className="flex flex-col items-center cursor-pointer group relative"
              >
                <input
                  type="radio"
                  name="rating"
                  value={num}
                  className="sr-only"
                  checked={isSelected}
                  onChange={() => onChange(num)}
                />

                {/* Number ABOVE icon */}
                <span
                  className={`text-sm font-medium mb-1 transition-colors ${
                    isSelected
                      ? "text-gray-900 scale-110 drop-shadow-sm"
                      : "text-gray-600 group-hover:text-gray-800"
                  }`}
                >
                  {num}
                </span>

                {/* Icon */}
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 flex items-center justify-center transition-all group-hover:scale-105 shadow-md ${
                    isSelected
                      ? `ring-2 ring-blue-500 scale-110 bg-[${color}] border-gray-300 shadow-lg`
                      : `bg-[${color}] border-[${color}] hover:border-gray-300 hover:shadow-md`
                  }`}
                >
                  <img
                    src={emojiList[i]}
                    alt={`${icon} ${num}`}
                    className="w-9 h-9 sm:w-10 sm:h-10 drop-shadow-sm"
                  />
                </div>
              </label>
            );
          })}
        </div>

        {/* Continuous connected gradient slider */}
        <div
          ref={sliderRef}
          className="relative w-full h-4 bg-gray-200 rounded-full shadow-inner overflow-hidden mt-2 cursor-pointer"
          onMouseDown={(e) => {
            setIsDragging(true);
            handleMouseMove(e);
          }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `linear-gradient(to right, ${numbersToShow
                .map((num) => getColorGradient(icon, num))
                .join(", ")})`,
            }}
          ></div>
          {value && (
            <img
              src={SliderIcon}
              alt="Slider"
              className="absolute w-6 h-6 z-20"
              style={{
                left: `${((value - 1) / (numbersToShow.length - 1)) * 100}%`,
                transform: "translateX(-50%) translateY(100%)",
                bottom: "-4px",
                cursor: "pointer",
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsDragging(true);
              }}
            />
          )}
        </div>
      </div>
    );
  };

  const renderLikertScale = () => {
    const range = [];
    for (let i = 1; i <= scale; i++) {
      range.push(i);
    }
    return (
      <div className="w-full flex items-center justify-between gap-2 mt-2">
        <span className="text-sm text-gray-600">{startLabel || "Poor"}</span>
        <div className="flex justify-center items-center gap-2">
          {range.map((num) => (
            <label
              key={num}
              className="flex flex-col items-center cursor-pointer p-2 rounded-lg hover:bg-gray-100"
            >
              <input
                type="radio"
                name="likert"
                value={num}
                className="sr-only"
                checked={value === num}
                onChange={() => onChange(num)}
              />
              <img
                src={likertIconMap[num]}
                alt={`Likert ${num}`}
                className={`w-12 h-12 sm:w-14 sm:h-14 transition-all ${
                  value === num ? "scale-110" : "opacity-70"
                }`}
              />
            </label>
          ))}
        </div>
        <span className="text-sm text-gray-600">{endLabel || "Excellent"}</span>
      </div>
    );
  };

  if (type === "Numeric Ratings") {
    return (
      <div className="flex justify-center items-center text-center gap-x-2 sm:gap-x-4">
        {renderRatingIcons()}
      </div>
    );
  }

  if (type === "Likert Scale") {
    return renderLikertScale();
  }

  return null;
};

export default DynamicRatingInput;

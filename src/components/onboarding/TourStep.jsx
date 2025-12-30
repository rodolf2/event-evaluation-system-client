import React, { useEffect, useState } from "react";

function TourStep({ title, description, position, step, totalSteps, onSkip, onContinue, onDone, showDone = false }) {
  const [viewportWidth, setViewportWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  const isMobile = viewportWidth < 768;
  const [highlightStyle, setHighlightStyle] = useState(null);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (position === "recent-activity") {
      const target =
        document.querySelector("[data-tour='recent-activity']") ||
        document.querySelector("#recent-activity") ||
        document.querySelector(".recent-activity");

      if (target && target.scrollIntoView) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [position, isMobile]);

  useEffect(() => {
    const selectorMap = {
      sidebar: [
        "[data-tour='sidebar-toggle']",
        "[data-tour='sidebar']",
        ".sidebar-toggle",
        ".hamburger",
        "button[aria-label*='menu']",
      ],
      header: ["[data-tour='header']", ".header"],
      "recent-activity": [
        "[data-tour='recent-activity']",
        "#recent-activity",
        ".recent-activity",
      ],
    };

    const computeHighlight = () => {
      const candidates = selectorMap[position] || [];
      let target = null;
      for (const sel of candidates) {
        const el = document.querySelector(sel);
        if (el) {
          target = el;
          break;
        }
      }

      if (target && target.getBoundingClientRect) {
        const rect = target.getBoundingClientRect();
        const padding = position === "sidebar" ? 6 : 8;
        setHighlightStyle({
          top: `${rect.top + window.scrollY - padding}px`,
          left: `${rect.left + window.scrollX - padding}px`,
          width: `${rect.width + padding * 2}px`,
          height: `${rect.height + padding * 2}px`,
          borderRadius: position === "sidebar" ? "9999px" : "12px",
        });
      } else {
        setHighlightStyle(null);
      }
    };

    const raf = requestAnimationFrame(computeHighlight);
    const handleScroll = () => computeHighlight();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", computeHighlight);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", computeHighlight);
    };
  }, [position, viewportWidth]);

  // Position styles for different elements
  const getPositionStyles = () => {
    if (isMobile) {
      switch (position) {
        case "sidebar":
          return {
            container: "left-1/2 top-8 -translate-x-1/2 w-[calc(100%-2rem)]",
            arrow: "top-[-8px] left-1/2 -translate-x-1/2 rotate-180 -translate-y-1/2",
            backdropOffset: "",
            overlayOffset: "",
            highlight: "rounded-full",
          };
        case "header":
          return {
            container: "left-1/2 top-8 -translate-x-1/2 w-[calc(100%-2rem)]",
            arrow: "top-[-8px] left-1/2 -translate-x-1/2 rotate-180",
            backdropOffset: "",
            overlayOffset: "",
            highlight: "top-2 left-3 right-3 h-14",
          };
        case "recent-activity":
          return {
            container: "left-1/2 top-8 -translate-x-1/2 w-[calc(100%-2rem)]",
            arrow: "top-[-8px] left-1/2 -translate-x-1/2 rotate-180",
            backdropOffset: "",
            overlayOffset: "",
            highlight: "top-[200px] left-3 right-3 h-[320px]",
          };
        default:
          return {
            container: "left-1/2 top-8 -translate-x-1/2 w-[calc(100%-2rem)]",
            arrow: "top-[-8px] left-1/2 -translate-x-1/2 rotate-180",
            backdropOffset: "",
            overlayOffset: "",
            highlight: "top-2 left-3 right-3 h-16",
          };
      }
    }

    switch (position) {
      case "sidebar":
        return {
          container: "left-32 top-1/2 -translate-y-1/2",
          arrow: "left-[-8px] top-1/2 -translate-y-1/2",
          backdropOffset: "md:left-[130px]",
          overlayOffset: "md:left-[130px]",
          highlight: "rounded-full",
        };
      case "header":
        return {
          container: "top-32 right-4",
          arrow: "top-[-8px] left-[310px] -translate-x-1/2",
          backdropOffset: "md:top-[100px] md:left-[130px]",
          overlayOffset: "md:top-[120px] md:left-[130px]",
          highlight: "top-0 left-[130px] right-5 h-16",
        };
      case "recent-activity":
        return {
          container: "top-60 left-[120px]",
          arrow: "bottom-[-8px] right-[270px] -translate-x-1/2",
          backdropOffset: "md:top-[500px] md:left-[1290px]",
          overlayOffset: "md:top-[500px] md:left-[1290px]",
          highlight: "top-[420px] left-[130px] right-[350px] h-[280px]",
        };
      default:
        return {
          container: "left-32 top-1/2 -translate-y-1/2",
          arrow: "left-[-8px] top-1/2 -translate-y-1/2",
          backdropOffset: "",
          overlayOffset: "",
          highlight: "",
        };
    }
  };

  const pos = getPositionStyles();

  return (
    <>
      {/* Backdrop blur - exclude sidebar, header, or recent activity area */}
      <div
        className={`fixed inset-0 z-40 ${isMobile ? "bg-white/20" : "bg-white/50"} ${pos.backdropOffset}`}
      />

      {/* Light dark overlay - exclude sidebar, header, or recent activity area */}
      <div
        className={`fixed inset-0 z-45 ${isMobile ? "bg-[#F1F0F0]/30" : "bg-[#F1F0F0]/50"} ${pos.overlayOffset}`}
      />

      {/* Highlight target area */}
      {pos.highlight && (
        <div
          className={`pointer-events-none fixed z-48 rounded-lg border-2 border-blue-500/80 bg-blue-100/30 shadow-[0_0_0_6px_rgba(59,130,246,0.15)] animate-pulse ${pos.highlight}`}
          style={
            highlightStyle
              ? {
                  top: highlightStyle.top,
                  left: highlightStyle.left,
                  width: highlightStyle.width,
                  height: highlightStyle.height,
                  borderRadius: highlightStyle.borderRadius,
                }
              : undefined
          }
        />
      )}

      {/* Tour Step Modal */}
      <div className={`fixed ${pos.container} z-50 p-4 max-w-sm transform md:transform-none`}>
        <div className="bg-white rounded-lg shadow-xl p-6 relative w-full md:w-auto">
          {/* Arrow pointing to element */}
          <div
            className={`absolute ${pos.arrow} w-0 h-0 ${
              position === "sidebar"
                ? "border-t-8 border-b-8 border-r-8 border-transparent border-r-white"
                : position === "header"
                ? "border-l-8 border-r-8 border-b-8 border-transparent border-b-white"
                : position === "recent-activity"
                ? "border-l-8 border-r-8 border-t-8 border-transparent border-t-white"
                : "border-t-8 border-b-8 border-r-8 border-transparent border-r-white"
            }`}
          ></div>

          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {description}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-500">
              Step {step} of {totalSteps}
            </span>
            <div className="flex space-x-2">
              {!showDone && (
                <button
                  onClick={onSkip}
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                >
                  Skip
                </button>
              )}
              {!showDone ? (
                <button
                  onClick={onContinue}
                  className="bg-[#1F3463] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={onDone}
                  className="bg-[#1F3463] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 hover:scale-105 transition-colors"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TourStep;

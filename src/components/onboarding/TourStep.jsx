import React, { useEffect, useState, useRef } from "react";

function TourStep({
  title,
  description,
  position,
  step,
  totalSteps,
  onSkip,
  onContinue,
  onDone,
  showDone = false,
}) {
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024,
  );
  const isMobile = viewportWidth < 768;

  // State for dynamic styles
  const [styles, setStyles] = useState({
    highlight: null,
    tooltip: null,
    arrow: null,
  });

  const tooltipRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (position === "recent-activity") {
      const target =
        document.querySelector("[data-tour='recent-activity']") ||
        document.querySelector("#recent-activity") ||
        document.querySelector(".recent-activity");

      if (target) {
        // Always scroll to show the entire recent activity section from the top
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [position]);

  useEffect(() => {
    const selectorMap = {
      sidebar: [
        "[data-tour='sidebar']",
        "[data-tour='sidebar-toggle']",
        ".sidebar-toggle",
        ".hamburger",
        "button[aria-label*='menu']",
        "aside", // Fallback to sidebar element itself
      ],
      header: ["[data-tour='header']", ".header", "header"],
      "recent-activity": [
        "[data-tour='recent-activity']",
        "#recent-activity",
        ".recent-activity",
      ],
    };

    const computeLayout = () => {
      const candidates = selectorMap[position] || [];
      let target = null;
      for (const sel of candidates) {
        const el = document.querySelector(sel);
        if (el) {
          const rect = el.getBoundingClientRect();

          const style = window.getComputedStyle(el);
          // Check if element is visible on screen
          // We check basic visibility styles
          // And we check rect dimensions and position to ensure it's in the viewport
          const isVisible =
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            style.opacity !== "0" &&
            rect.width > 0 &&
            rect.height > 0 &&
            rect.right > 0 &&
            rect.left < window.innerWidth;

          if (isVisible) {
            target = el;
            break;
          }
        }
      }

      if (!target || !target.getBoundingClientRect) {
        // Fallback or hidden: Center the modal if target undefined
        setStyles({
          highlight: null,
          tooltip: {
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            margin: 0,
          },
          arrow: { display: "none" },
        });
        return;
      }

      const rect = target.getBoundingClientRect();
      const padding = position === "sidebar" ? 6 : 8;

      // Use fixed positioning so highlight always appears above sticky/fixed elements
      // getBoundingClientRect() already returns viewport-relative coords, perfect for fixed positioning
      const highlightStyle = {
        position: "fixed",
        top: `${rect.top - padding}px`,
        left: `${rect.left - padding}px`,
        width: `${rect.width + padding * 2}px`,
        height: `${rect.height + padding * 2}px`,
        borderRadius: position === "sidebar" ? "15px" : "12px",
      };

      // Calculate Tooltip Position
      let tooltipStyle = {};
      let arrowStyle = {};

      const tooltipWidth = 384; // max-w-sm approx
      const gap = 16; // space between target and tooltip

      if (isMobile) {
        // Mobile Strategy: Button sheet style or centered
        // We'll place it at the bottom area generally, or below the header if header step.

        if (position === "header" || position === "sidebar") {
          // Add extra offset for sidebar to move it down further
          const verticalOffset = position === "sidebar" ? 16 : 0;

          tooltipStyle = {
            position: "fixed",
            top: `${rect.bottom + gap + verticalOffset}px`,
            left: "50%",
            transform: "translateX(-50%)",
            width: "calc(100% - 32px)",
            maxWidth: "24rem",
          };

          // Calculate arrow position
          let arrowLeft = "50%";
          if (position === "sidebar") {
            // Point to the hamburger icon
            // Tooltip starts at 16px from left edge
            const targetCenter = rect.left + rect.width / 2;
            const relativeLeft = targetCenter - 16;
            arrowLeft = `${relativeLeft}px`;
          }

          arrowStyle = {
            top: "-8px",
            left: arrowLeft,
            transform: "translateX(-50%)",
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderBottom: "8px solid white",
          };
        } else {
          // For others, center it or put at bottom
          // Let's use a "bottom-sheet" feel for mobile steps to avoid obfuscating top nav
          tooltipStyle = {
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "calc(100% - 32px)",
            maxWidth: "24rem",
          };
          // No arrow for floating bottom card on mobile usually, or point up if we knew where target is?
          // If target is visible, point to it?
          // Let's keep it simple: No arrow if floating at bottom.
          arrowStyle = { display: "none" };
        }
      } else {
        // Desktop Strategy
        if (position === "sidebar") {
          // Place to the RIGHT. Align TOP to avoid going off-screen if element is high up
          // Calculate top: rect.top, maybe shift down slightly if needed.
          // Don't use translateY(-50%) as it risks negative top.

          tooltipStyle = {
            position: "fixed",
            top: `${rect.top}px`,
            left: `${rect.right + gap}px`,
          };

          // Arrow pointing deep left (vertical center of target? or align with top?)
          // Target height is usually small (icon). Tooltip is large.
          // Arrow should be near the top of the tooltip to point to the icon.
          const iconCenterOffset = rect.height / 2;

          arrowStyle = {
            left: "-8px",
            top: "32px",
            transform: "translateY(-50%)",
            borderTop: "8px solid transparent",
            borderBottom: "8px solid transparent",
            borderRight: "8px solid white",
            position: "absolute",
          };
        } else if (position === "header") {
          // Place BELOW
          // Align right edge or center? Header is wide.
          // Let's align to the right side of the screen usually for user profile
          // Or center relative to highlight?
          const idealLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
          // Clamp
          const maxLeft = window.innerWidth - tooltipWidth - 20;
          const finalLeft = Math.min(Math.max(20, idealLeft), maxLeft);

          tooltipStyle = {
            position: "fixed",
            top: `${rect.bottom + gap}px`,
            left: `${finalLeft}px`,
          };

          // Arrow calculation
          // relative to tooltip container
          const arrowLeftCandidates = rect.left + rect.width / 2 - finalLeft;

          arrowStyle = {
            top: "-8px",
            left: `${Math.max(10, Math.min(tooltipWidth - 10, arrowLeftCandidates))}px`,
            transform: "translateX(-50%)",
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderBottom: "8px solid white",
          };
        } else {
          // Recent Activity / Content
          // Priority: RIGHT -> BOTTOM (Right Aligned)

          if (rect.right + tooltipWidth + gap < window.innerWidth) {
            // Fits on Right
            tooltipStyle = {
              position: "fixed",
              top: `${rect.top}px`,
              left: `${rect.right + gap}px`,
            };
            arrowStyle = {
              left: "-8px",
              top: "24px",
              borderTop: "8px solid transparent",
              borderBottom: "8px solid transparent",
              borderRight: "8px solid white",
              position: "absolute",
            };
          } else {
            // Fallback: Bottom, Right Aligned
            const alignRightLeft = rect.right - tooltipWidth;
            // Ensure positive left
            const finalLeft = Math.max(10, alignRightLeft);

            tooltipStyle = {
              position: "fixed",
              top: `${rect.top - gap}px`,
              left: `${finalLeft}px`,
              transform: "translateY(-100%)",
            };

            // Arrow on bottom, near right side
            arrowStyle = {
              bottom: "-8px",
              right: "24px",
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "8px solid white",
              position: "absolute",
            };
          }
        }
      }

      setStyles({
        highlight: highlightStyle,
        tooltip: tooltipStyle,
        arrow: arrowStyle,
      });
    };

    const raf = requestAnimationFrame(computeLayout);
    const handleScroll = () => computeLayout();

    // Also listen on the <main> scroll container, since the app scrolls inside <main>
    const mainEl = document.querySelector("main");

    // We update on scroll and resize
    window.addEventListener("scroll", handleScroll, { passive: true });
    if (mainEl)
      mainEl.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", computeLayout);
    // Initial compute - longer delay for recent-activity to allow scrollIntoView to finish
    const delay = position === "recent-activity" ? 500 : 100;
    setTimeout(computeLayout, delay);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", handleScroll);
      if (mainEl) mainEl.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", computeLayout);
    };
  }, [position, isMobile]);

  return (
    <>
      {/* Highlight with cutout effect - box-shadow darkens everything except the highlighted area */}
      {styles.highlight ? (
        <div
          className="z-9999 rounded-lg border-2 border-blue-500/80 pointer-events-none transition-all duration-300 ease-out"
          style={{
            ...styles.highlight,
            boxShadow: `0 0 0 9999px rgba(0, 0, 0, ${isMobile ? 0.2 : 0.4})`,
          }}
        />
      ) : (
        <div
          className={`fixed inset-0 z-9998 transition-colors duration-300 ${isMobile ? "bg-black/20" : "bg-black/40"}`}
        />
      )}

      {/* Tour Step Modal */}
      <div
        ref={tooltipRef}
        className="z-9999 p-0 max-w-sm w-full transition-all duration-300 ease-out"
        style={styles.tooltip || { display: "none" }}
      >
        <div className="bg-white rounded-lg shadow-xl p-6 relative">
          {/* Arrow */}
          <div className="absolute w-0 h-0" style={styles.arrow} />

          <div className="mb-4 text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {description}
            </p>
          </div>

          <div className="flex justify-between items-center mb-0">
            <span className="text-sm text-gray-500">
              Step {step} of {totalSteps}
            </span>
            <div className="flex space-x-2">
              {!showDone && (
                <button
                  onClick={onSkip}
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium px-3 py-1"
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

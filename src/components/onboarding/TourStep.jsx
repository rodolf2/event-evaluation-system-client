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
    typeof window !== "undefined" ? window.innerWidth : 1024
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

      if (target && target.scrollIntoView) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
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
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            style.opacity !== '0' &&
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

      // Calculate Highlight (Fixed or Absolute?)
      // Using absolute + scrollY allows it to move with page if necessary, 
      // but if the element is fixed (like sidebar/header), absolute relative to document works if we add scrollY.
      // However, to avoid syncing issues, let's use fixed matching the element if the element is fixed?
      // Simpler: Use absolute relative to document.

      const highlightStyle = {
        top: `${rect.top + window.scrollY - padding}px`,
        left: `${rect.left + window.scrollX - padding}px`,
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

        if (position === 'header') {
          tooltipStyle = {
            position: 'fixed',
            top: `${rect.bottom + gap}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)',
            maxWidth: '24rem',
          };
          arrowStyle = {
            top: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderBottom: '8px solid white',
          };
        } else {
          // For others, center it or put at bottom
          // Let's use a "bottom-sheet" feel for mobile steps to avoid obfuscating top nav
          tooltipStyle = {
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)',
            maxWidth: '24rem',
          };
          // No arrow for floating bottom card on mobile usually, or point up if we knew where target is?
          // If target is visible, point to it?
          // Let's keep it simple: No arrow if floating at bottom.
          arrowStyle = { display: 'none' };
        }

      } else {
        // Desktop Strategy
        if (position === 'sidebar') {
          // Place to the RIGHT and CENTER vertically
          tooltipStyle = {
            position: 'absolute',
            top: `${rect.top + window.scrollY + (rect.height / 2)}px`,
            left: `${rect.right + window.scrollX + gap}px`,
            transform: 'translateY(-50%)',
          };
          arrowStyle = {
            left: '-8px',
            top: '50%',
            transform: 'translateY(-50%)',
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderRight: '8px solid white',
            position: 'absolute'
          };
        } else if (position === 'header') {
          // Place BELOW
          // Align right edge or center? Header is wide.
          // Let's align to the right side of the screen usually for user profile
          // Or center relative to highlight?
          const idealLeft = rect.left + window.scrollX + (rect.width / 2) - (tooltipWidth / 2);
          // Clamp
          const maxLeft = window.innerWidth - tooltipWidth - 20;
          const finalLeft = Math.min(Math.max(20, idealLeft), maxLeft);

          tooltipStyle = {
            position: 'absolute',
            top: `${rect.bottom + window.scrollY + gap}px`,
            left: `${finalLeft}px`,
          };

          // Arrow calculation
          // relative to tooltip container
          const arrowLeftCandidates = (rect.left + window.scrollX + (rect.width / 2)) - finalLeft;

          arrowStyle = {
            top: '-8px',
            left: `${Math.max(10, Math.min(tooltipWidth - 10, arrowLeftCandidates))}px`,
            transform: 'translateX(-50%)',
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderBottom: '8px solid white',
          };

        } else {
          // Recent Activity / Content
          // Try RIGHT, if not fit, try LEFT, if not fit try BOTTOM.
          // Simplified: Place to the right if space, else left.

          if (rect.right + tooltipWidth + gap < window.innerWidth) {
            // Fits on Right
            tooltipStyle = {
              position: 'absolute',
              top: `${rect.top + window.scrollY}px`,
              left: `${rect.right + window.scrollX + gap}px`,
            };
            arrowStyle = {
              left: '-8px',
              top: '24px',
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              borderRight: '8px solid white',
            };
          } else {
            // Place on Left?
            // Or float center?
            // Let's float centered on the element if large, or center screen.
            tooltipStyle = {
              position: 'absolute',
              top: `${rect.top + window.scrollY}px`,
              left: `${rect.left + window.scrollX - tooltipWidth - gap}px`,
            };
            arrowStyle = {
              right: '-8px',
              top: '24px',
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              borderLeft: '8px solid white',
              position: 'absolute'
            };
          }
        }
      }

      setStyles({
        highlight: highlightStyle,
        tooltip: tooltipStyle,
        arrow: arrowStyle
      });
    };

    const raf = requestAnimationFrame(computeLayout);
    const handleScroll = () => computeLayout();

    // We update on scroll and resize
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", computeLayout);
    // Initial compute
    setTimeout(computeLayout, 100); // Give small delay for layout

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", computeLayout);
    };
  }, [position, isMobile]);

  return (
    <>
      {/* Backdrop blur - we use a mask or just distinct overlays. 
          For simplicity, we'll keep the full overlay and use z-index for highlight. 
      */}
      <div className={`fixed inset-0 z-40 transition-colors duration-300 ${isMobile ? "bg-black/20" : "bg-black/40"}`} />

      {/* Highlight target area */}
      {styles.highlight && (
        <div
          className="absolute z-50 rounded-lg border-2 border-blue-500/80 bg-blue-100/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] pointer-events-none transition-all duration-300 ease-out"
          style={styles.highlight}
        />
      )}

      {/* Tour Step Modal */}
      <div
        ref={tooltipRef}
        className="z-50 p-0 max-w-sm w-full transition-all duration-300 ease-out"
        style={styles.tooltip || { display: 'none' }}
      >
        <div className="bg-white rounded-lg shadow-xl p-6 relative">
          {/* Arrow */}
          <div
            className="absolute w-0 h-0"
            style={styles.arrow}
          />

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

import React from "react";

// Note: The school logo should be imported separately if you have a PNG/SVG of just the seal
// For now, we'll use a placeholder circle or you can add the logo path here
import LogoImage from "../../assets/logo/LOGO.png";

const ReportHeader = () => {
  return (
    <div
      id="report-header"
      className="w-full rounded-t-lg overflow-hidden print:rounded-none"
      style={{
        background:
          "linear-gradient(135deg, #1e3a5f 0%, #2c5282 50%, #1e3a5f 100%)",
        position: "relative",
      }}
    >
      {/* Decorative left pattern */}
      <div
        className="absolute left-0 top-0 h-full w-16 opacity-30"
        style={{
          background: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(59, 130, 246, 0.3) 10px,
              rgba(59, 130, 246, 0.3) 20px
            )
          `,
        }}
      />

      {/* Right gold accent bar */}
      <div
        className="absolute right-0 top-0 h-full w-8"
        style={{
          background:
            "linear-gradient(180deg, #d4a84b 0%, #c9a227 50%, #d4a84b 100%)",
          boxShadow: "-2px 0 8px rgba(0,0,0,0.3)",
        }}
      />

      <div className="flex items-center py-4 px-8 pr-16">
        {/* Logo */}
        <div className="shrink-0 mr-6">
          <div
            className="w-20 h-20 rounded-full overflow-hidden"
            style={{
              background: "white",
              border: "2px solid #eab308",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            <img
              src={LogoImage}
              alt="La Verdad Christian College Logo"
              className="w-full h-full object-contain p-1"
              onError={(e) => {
                // Fallback if logo doesn't exist
                e.target.style.display = "none";
                e.target.parentElement.innerHTML = `
                  <div class="w-full h-full flex items-center justify-center text-xs text-center p-2 font-semibold" style="color: #1e3a8a;">
                    LVCC
                  </div>
                `;
              }}
            />
          </div>
        </div>

        {/* School Name */}
        <div className="grow">
          <h1
            className="text-2xl font-bold tracking-wide"
            style={{
              color: "#d4a84b",
              fontFamily: "'Times New Roman', Times, serif",
              textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
              letterSpacing: "0.05em",
            }}
          >
            LA VERDAD
          </h1>
          <h2
            className="text-lg font-semibold tracking-wider"
            style={{
              color: "#d4a84b",
              fontFamily: "'Times New Roman', Times, serif",
              letterSpacing: "0.1em",
            }}
          >
            CHRISTIAN COLLEGE, INC.
          </h2>
          <p
            className="text-sm mt-1"
            style={{
              color: "#e0e0e0",
              fontFamily: "'Times New Roman', Times, serif",
              fontStyle: "italic",
            }}
          >
            Apalit, Pampanga
          </p>
        </div>
      </div>

      {/* Bottom border line */}
      <div
        className="h-1 w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, #d4a84b 10%, #d4a84b 90%, transparent 100%)",
        }}
      />
    </div>
  );
};

export default ReportHeader;

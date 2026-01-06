import React from "react";

// Report Footer Component - HTML/CSS based (no image)
export const ReportPageFooter = () => {
  return (
    <div
      id="report-footer"
      className="w-full rounded-b-lg overflow-hidden print:rounded-none"
      style={{
        background: "linear-gradient(180deg, #1a365d 0%, #1e3a5f 100%)",
        position: "relative",
      }}
    >
      {/* Left gold accent bar */}
      <div
        className="absolute left-0 top-0 h-full w-8"
        style={{
          background:
            "linear-gradient(180deg, #d4a84b 0%, #c9a227 50%, #d4a84b 100%)",
          boxShadow: "2px 0 8px rgba(0,0,0,0.3)",
        }}
      />

      {/* Top border line */}
      <div
        className="h-0.5 w-full"
        style={{
          background:
            "linear-gradient(90deg, #d4a84b 0%, #d4a84b 10%, transparent 100%)",
        }}
      />

      <div className="flex items-center justify-center py-3 px-12 pl-16">
        <div className="flex items-center gap-8 text-sm">
          {/* Address */}
          <p
            style={{
              color: "#e0e0e0",
              fontFamily: "'Times New Roman', Times, serif",
              letterSpacing: "0.02em",
            }}
          >
            MacArthur Highway, Sampaloc, Apalit, Pampanga 2016
          </p>

          {/* Separator */}
          <span className="hidden sm:inline" style={{ color: "#d4a84b" }}>
            |
          </span>

          {/* Email */}
          <a
            href="mailto:info@laverdad.edu.ph"
            style={{
              color: "#e0e0e0",
              fontFamily: "'Times New Roman', Times, serif",
              letterSpacing: "0.02em",
              textDecoration: "none",
            }}
          >
            info@laverdad.edu.ph
          </a>
        </div>
      </div>
    </div>
  );
};

export default ReportPageFooter;

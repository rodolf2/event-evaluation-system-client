import React from "react";

// Import header image
import HeaderImage from "../../assets/header.png";

const ReportHeader = () => {
  return (
    <div
      id="report-header"
      className="w-full rounded-t-lg overflow-hidden print:rounded-none"
    >
      <img
        src={HeaderImage}
        alt="La Verdad Christian College Header"
        className="w-full h-auto object-cover"
        style={{
          display: "block",
          minHeight: "60px",
        }}
      />
    </div>
  );
};

export default ReportHeader;

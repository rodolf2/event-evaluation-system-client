import React from "react";

// Import footer image
import FooterImage from "../../assets/footer.png";

// Report Footer Component - Using image
export const ReportPageFooter = () => {
  return (
    <div
      id="report-footer"
      className="w-full rounded-b-lg overflow-hidden print:rounded-none"
    >
      <img
        src={FooterImage}
        alt="La Verdad Christian College Footer"
        className="w-full h-auto object-cover"
        style={{
          display: "block",
          minHeight: "30px",
        }}
      />
    </div>
  );
};

export default ReportPageFooter;

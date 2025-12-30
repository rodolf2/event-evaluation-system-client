import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Download, Printer, UserPlus, ArrowLeft, Send } from "lucide-react";

const ReportActions = ({
  onBackClick,
  eventId,
  isGeneratedReport = false,
  onShareGuest,
}) => {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      const loadingToast = document.createElement("div");
      loadingToast.innerHTML = "Preparing PDF Report... (Please wait)";
      loadingToast.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.8); color: white; padding: 20px;
        border-radius: 8px; z-index: 9999;
      `;
      document.body.appendChild(loadingToast);

      // Wait for animations to finish (crucial for Charts)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Find the entire report container
      const reportElement = document.querySelector(
        ".container.mx-auto.max-w-5xl"
      );
      if (!reportElement) {
        document.body.removeChild(loadingToast);
        alert("Report content not found. Please try again.");
        return;
      }

      // --- Header/Footer Extraction for Every Page ---
      let headerTemplate = "";
      let footerTemplate = "";

      // Find header image and create template
      const headerImg = reportElement.querySelector(
        'img[alt="La Verdad Christian College Header"]'
      );
      if (headerImg) {
        try {
          const response = await fetch(headerImg.src);
          const blob = await response.blob();
          const reader = new FileReader();
          const base64 = await new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
          // Scale up by 1.33 to counteract Puppeteer's 0.75x template scaling
          headerTemplate = `
            <div style="width: 100%; height: 100%; margin: 0; padding: 0; transform: scale(1.33); transform-origin: top left;">
              <img src="${base64}" style="width: 75%; height: auto; display: block;" />
            </div>`;
        } catch (e) {
          console.warn("Failed to process header image", e);
        }
      }

      // Find footer image and create template
      const footerImg = reportElement.querySelector('img[alt="Report Footer"]');
      if (footerImg) {
        try {
          const response = await fetch(footerImg.src);
          const blob = await response.blob();
          const reader = new FileReader();
          const base64 = await new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
          // Scale up by 1.33 to counteract Puppeteer's 0.75x template scaling
          footerTemplate = `
            <div style="width: 100%; height: 100%; margin: 0; padding: 0; transform: scale(1.33); transform-origin: bottom left;">
              <img src="${base64}" style="width: 75%; height: auto; display: block;" />
            </div>`;
        } catch (e) {
          console.warn("Failed to process footer image", e);
        }
      }

      // --- Cloning and Content Preparation ---
      const clone = reportElement.cloneNode(true);

      // Remove header/footer from content to avoid duplication (they're now in templates)
      const cloneHeaders = clone.querySelectorAll(
        'img[alt="La Verdad Christian College Header"]'
      );
      cloneHeaders.forEach((header) => {
        const parent = header.parentElement;
        if (
          parent &&
          parent.tagName === "DIV" &&
          parent.children.length === 1
        ) {
          parent.remove();
        } else {
          header.remove();
        }
      });

      const cloneFooters = clone.querySelectorAll('img[alt="Report Footer"]');
      cloneFooters.forEach((footer) => {
        const parent = footer.parentElement;
        if (
          parent &&
          parent.tagName === "DIV" &&
          parent.children.length === 1
        ) {
          parent.remove();
        } else {
          footer.remove();
        }
      });

      // Rasterize SVGs (Charts)
      // User Note: Removed manual rasterization as Puppeteer works better with static SVGs.
      // const originalSvgs = reportElement.querySelectorAll("svg"); ...

      // Convert remaining standard images (like static embedded ones)
      const images = clone.querySelectorAll("img");
      const imagePromises = Array.from(images).map(async (img) => {
        try {
          if (img.src.startsWith("data:")) return;

          const response = await fetch(img.src, {
            mode: "cors",
            credentials: "same-origin",
          });
          if (!response.ok) throw new Error("Fetch failed");

          const blob = await response.blob();
          const reader = new FileReader();
          await new Promise((resolve, reject) => {
            reader.onloadend = () => {
              img.src = reader.result;
              resolve();
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch {
          // Fallback to absolute URL
          if (img.src.startsWith("/")) {
            img.src = `${window.location.origin}${img.src}`;
          }
        }
      });
      await Promise.all(imagePromises);

      // Styles
      const styles = Array.from(document.styleSheets)
        .map((styleSheet) => {
          try {
            return Array.from(styleSheet.cssRules)
              .map((rule) => rule.cssText)
              .join("\n");
          } catch {
            return "";
          }
        })
        .filter((style) => style.trim().length > 0)
        .join("\n");

      const formData = JSON.parse(
        sessionStorage.getItem("currentFormData") || "{}"
      );
      const reportTitle = formData.title || "Evaluation Report";

      const completeHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <base href="${window.location.origin}/">
            <title>${reportTitle}</title>
            <style>
              ${styles}
              img { max-width: 100% !important; }
              /* Add padding to body to act as page margins for the text content */
              body { padding: 0 40px; }
              /* Hide screen-only elements */
              .print\\:hidden { display: none !important; }
            </style>
          </head>
          <body>
            <div class="report-print-content">
              ${clone.innerHTML}
            </div>
          </body>
        </html>
      `;

      loadingToast.innerHTML = "Downloading PDF...";

      const response = await fetch(`/api/reports/${eventId}/generate-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          html: completeHTML,
          title: reportTitle,
          headerTemplate, // Pass templates
          footerTemplate,
        }),
      });

      document.body.removeChild(loadingToast);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `evaluation-report-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error generating PDF:", error);
      const toast = document.querySelector("div[style*='z-index: 9999']");
      if (toast) document.body.removeChild(toast);
      alert("Failed to download PDF. Please check console for details.");
    }
  };

  const handleGenerate = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication required. Please log in again.");
        return;
      }

      const response = await fetch(
        `/api/analytics/reports/generate/${eventId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        alert("Report generated successfully!");
        // Navigate to reports page to see the generated report
        navigate("/psas/reports");
      } else {
        alert(result.message || "Failed to generate report");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      alert("An error occurred while generating the report");
    }
  };

  const handleShowPreparedBy = () => {
    navigate("/psas/reports/prepared-by", {
      state: { reportId: eventId, eventId: eventId },
    });
  };

  return (
    <div className="print:hidden">
      <div className="flex justify-between items-center">
        <button
          onClick={onBackClick}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Go back"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex items-center space-x-4">
          {onShareGuest && (
            <button
              onClick={onShareGuest}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Share with guest"
            >
              <Send size={20} className="text-gray-600" />
            </button>
          )}
          <button
            onClick={handleShowPreparedBy}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="View Prepared By"
          >
            <UserPlus size={20} className="text-gray-600" />
          </button>
          <button
            onClick={handlePrint}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Print report"
          >
            <Printer size={20} className="text-gray-600" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Download as PDF"
          >
            <Download size={20} className="text-gray-600" />
          </button>
          {!isGeneratedReport && (
            <button
              onClick={handleGenerate}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              title="Generate report"
            >
              Generate
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

ReportActions.propTypes = {
  onBackClick: PropTypes.func.isRequired,
  eventId: PropTypes.string.isRequired,
  isGeneratedReport: PropTypes.bool,
  onShareGuest: PropTypes.func,
};

export default ReportActions;

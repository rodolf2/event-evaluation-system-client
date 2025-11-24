import { useNavigate } from "react-router-dom";
import { Download, Printer, UserPlus, ArrowLeft } from "lucide-react";

const ReportActions = ({ onBackClick, eventId, isGeneratedReport = false }) => {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      // Find the entire report container (including headers and footers)
      const reportElement = document.querySelector(
        ".container.mx-auto.max-w-5xl"
      );
      if (!reportElement) {
        alert("Report content not found. Please try again.");
        return;
      }

      // Get the form data to include the title
      const formData = JSON.parse(
        sessionStorage.getItem("currentFormData") || "{}"
      );
      const reportTitle = formData.title || "Evaluation Report";

      // Extract all CSS styles from the page
      const styles = Array.from(document.styleSheets)
        .map((styleSheet) => {
          try {
            return Array.from(styleSheet.cssRules)
              .map((rule) => rule.cssText)
              .join("\n");
          } catch {
            // Handle cross-origin stylesheets
            return "";
          }
        })
        .filter((style) => style.trim().length > 0)
        .join("\n");

      // Extract the HTML content
      let htmlContent = reportElement.innerHTML;

      // Convert images to base64 data URLs
      const images = reportElement.querySelectorAll("img");
      const imagePromises = Array.from(images).map(async (img) => {
        try {
          // Create a canvas to draw the image and get its data URL
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Wait for image to load if it's not already loaded
          if (!img.complete) {
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              // Set a timeout in case image never loads
              setTimeout(reject, 5000);
            });
          }

          // Set canvas dimensions
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;

          // Draw image to canvas
          ctx.drawImage(img, 0, 0);

          // Get data URL
          const dataUrl = canvas.toDataURL("image/png");

          // Replace the src in the HTML content
          htmlContent = htmlContent.replace(
            new RegExp(img.src.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
            dataUrl
          );

          return Promise.resolve();
        } catch (error) {
          console.warn("Failed to convert image to base64:", img.src, error);
          return Promise.resolve();
        }
      });

      // Wait for all images to be converted
      await Promise.all(imagePromises);

      // Create complete HTML with styles
      const completeHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>${reportTitle}</title>
            <style>
              ${styles}
            </style>
          </head>
          <body>
            <div class="report-print-content">
              ${htmlContent}
            </div>
          </body>
        </html>
      `;

      // Show loading message
      const loadingToast = document.createElement("div");
      loadingToast.innerHTML = "Downloading PDF...";
      loadingToast.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 20px;
        border-radius: 8px;
        z-index: 9999;
      `;
      document.body.appendChild(loadingToast);

      // Send complete HTML with styles to server for PDF generation
      const response = await fetch(`/api/reports/${eventId}/generate-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          html: completeHTML,
          title: reportTitle,
        }),
      });

      // Remove loading message
      document.body.removeChild(loadingToast);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate PDF");
      }

      // Create blob from response and trigger download
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
      alert("Failed to generate PDF. Please try again.");
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

export default ReportActions;

import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Download, Printer, UserPlus, ArrowLeft, Send } from "lucide-react";

const ReportActions = ({
  onBackClick,
  eventId,
  isGeneratedReport = false,
  onShareGuest,
  loading = false,
}) => {
  const navigate = useNavigate();

  const handlePrint = () => {
    if (loading) {
      alert("Please wait for report to finish loading");
      return;
    }
    window.print();
  };

  const handleDownload = async () => {
    if (loading) {
      alert("Please wait for report to finish loading");
      return;
    }
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

      // Import html2canvas for capturing HTML components
      const html2canvas = (await import("html2canvas")).default;

      // Find header element (now an HTML component, not an image)
      // Find header element (now an HTML component, not an image)
      // Using ID for more reliable selection
      const headerElement =
        reportElement.querySelector("#report-header") ||
        reportElement
          .querySelector('img[alt="La Verdad Christian College Logo"]')
          ?.closest(".w-full.rounded-t-lg");

      if (headerElement) {
        try {
          console.log("Found header element, capturing...");
          // Capture the HTML header as an image using html2canvas
          const headerCanvas = await html2canvas(headerElement, {
            backgroundColor: "#1e3a5f", // Force background color to match gradient start
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true,
          });
          const headerBase64 = headerCanvas.toDataURL("image/png");
          console.log("Header captured, length:", headerBase64.length);

          // Scale up by 1.33 to counteract Puppeteer's 0.75x template scaling
          headerTemplate = `
            <style>body, html { margin: 0; padding: 0; }</style>
            <div style="width: 100%; height: 100%; margin: 0; padding: 0; transform: scale(1.33); transform-origin: top left;">
              <img src="${headerBase64}" style="width: 75%; height: auto; display: block;" />
            </div>`;
        } catch (e) {
          console.error("Failed to process header", e);
        }
      } else {
        console.warn("Header element not found using selectors");
      }

      // Find footer element (now an HTML component, not an image)
      const footerElement =
        reportElement.querySelector("#report-footer") ||
        reportElement
          .querySelector('a[href="mailto:info@laverdad.edu.ph"]')
          ?.closest(".w-full.rounded-b-lg");

      if (footerElement) {
        try {
          console.log("Found footer element, capturing...");
          // Capture the HTML footer as an image using html2canvas
          const footerCanvas = await html2canvas(footerElement, {
            backgroundColor: "#1a365d", // Force background color
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true,
          });
          const footerBase64 = footerCanvas.toDataURL("image/png");
          console.log("Footer captured, length:", footerBase64.length);

          // Scale up by 1.33 to counteract Puppeteer's 0.75x template scaling
          footerTemplate = `
            <style>body, html { margin: 0; padding: 0; }</style>
            <div style="width: 100%; height: 100%; margin: 0; padding: 0; transform: scale(1.33); transform-origin: bottom left;">
              <img src="${footerBase64}" style="width: 75%; height: auto; display: block;" />
            </div>`;
        } catch (e) {
          console.error("Failed to process footer", e);
        }
      } else {
        console.warn("Footer element not found using selectors");
      }

      // --- Cloning and Content Preparation ---
      const clone = reportElement.cloneNode(true);

      // Remove header/footer blocks from content to avoid duplication (they're now in templates)
      // Remove entire header block (includes ReportHeader, ReportDescription, and title)
      const headerBlock = clone.querySelector("#report-header-block");
      if (headerBlock) headerBlock.remove();

      // Also remove individual header elements if they exist elsewhere
      const headersToRemove = clone.querySelectorAll("#report-header");
      headersToRemove.forEach((el) => el.remove());

      // Remove entire footer block
      const footerBlock = clone.querySelector("#report-footer-block");
      if (footerBlock) footerBlock.remove();

      // Also remove individual footer elements if they exist elsewhere
      const footersToRemove = clone.querySelectorAll("#report-footer");
      footersToRemove.forEach((el) => el.remove());

      // Fallback for legacy headers/footers
      const legacyHeaders = clone.querySelectorAll(
        'img[alt="La Verdad Christian College Logo"], img[alt="La Verdad Christian College Header"]'
      );
      legacyHeaders.forEach((img) => {
        const wrapper =
          img.closest(".w-full.rounded-t-lg") || img.closest(".w-full");
        if (wrapper) wrapper.remove();
      });

      const legacyFooters = clone.querySelectorAll(
        'a[href="mailto:info@laverdad.edu.ph"], img[alt="Report Footer"]'
      );
      legacyFooters.forEach((el) => {
        const wrapper =
          el.closest(".w-full.rounded-b-lg") || el.closest(".w-full");
        if (wrapper) wrapper.remove();
      });

      // Rasterize Charts using html2canvas - More reliable for Recharts
      // Find all chart containers with multiple selectors for better coverage
      const chartSelectors =
        ".recharts-wrapper, .recharts-responsive-container, [class*='recharts']";
      const chartContainers = reportElement.querySelectorAll(chartSelectors);
      const cloneChartContainers = clone.querySelectorAll(chartSelectors);

      console.log("Found chart containers:", chartContainers.length);
      console.log("Found clone chart containers:", cloneChartContainers.length);

      // Log each found container for debugging
      chartContainers.forEach((c, i) => {
        console.log(
          `Chart ${i}:`,
          c.className,
          "dimensions:",
          c.offsetWidth,
          "x",
          c.offsetHeight
        );
      });

      // Also target SVG elements directly as fallback
      const svgElements = reportElement.querySelectorAll(
        "svg.recharts-surface"
      );
      const cloneSvgs = clone.querySelectorAll("svg.recharts-surface");

      console.log("Found SVG elements:", svgElements.length);

      // html2canvas is already imported above for header/footer capture

      // Filter to only process .recharts-wrapper elements (top-level chart containers)
      const wrapperContainers = Array.from(chartContainers).filter((c) =>
        c.classList.contains("recharts-wrapper")
      );
      const cloneWrapperContainers = Array.from(cloneChartContainers).filter(
        (c) => c.classList.contains("recharts-wrapper")
      );

      const chartPromises = wrapperContainers.map(async (container, index) => {
        try {
          const cloneContainer = cloneWrapperContainers[index];
          if (!cloneContainer) return;

          // Capture the chart container as an image
          const canvas = await html2canvas(container, {
            backgroundColor: "#ffffff",
            scale: 2, // Higher quality
            logging: false,
            useCORS: true,
            allowTaint: true,
          });

          // Convert to data URL
          const pngDataUrl = canvas.toDataURL("image/png");

          // Create replacement image
          const replacement = document.createElement("img");
          replacement.src = pngDataUrl;
          replacement.style.width = `${container.offsetWidth}px`;
          replacement.style.height = `${container.offsetHeight}px`;
          replacement.style.display = "block";
          replacement.style.maxWidth = "100%";

          // Replace the chart container in the clone
          if (cloneContainer.parentNode) {
            cloneContainer.parentNode.replaceChild(replacement, cloneContainer);
          }
        } catch (err) {
          console.warn("Error capturing chart with html2canvas:", err);

          // Fallback: try to capture just the SVG
          if (svgElements[index] && cloneSvgs[index]) {
            try {
              const svg = svgElements[index];
              const cloneSvg = cloneSvgs[index];
              const svgRect = svg.getBoundingClientRect();
              const width = svgRect.width || 400;
              const height = svgRect.height || 300;

              // Create a canvas and draw the SVG
              const svgData = new XMLSerializer().serializeToString(svg);
              const svgBlob = new Blob([svgData], {
                type: "image/svg+xml;charset=utf-8",
              });
              const url = URL.createObjectURL(svgBlob);

              const img = new Image();
              await new Promise((resolve) => {
                img.onload = () => {
                  const canvas = document.createElement("canvas");
                  canvas.width = width * 2;
                  canvas.height = height * 2;
                  const ctx = canvas.getContext("2d");
                  ctx.scale(2, 2);
                  ctx.fillStyle = "white";
                  ctx.fillRect(0, 0, width, height);
                  ctx.drawImage(img, 0, 0, width, height);

                  const replacement = document.createElement("img");
                  replacement.src = canvas.toDataURL("image/png");
                  replacement.style.width = `${width}px`;
                  replacement.style.height = `${height}px`;

                  if (cloneSvg.parentNode) {
                    cloneSvg.parentNode.replaceChild(replacement, cloneSvg);
                  }
                  URL.revokeObjectURL(url);
                  resolve();
                };
                img.onerror = () => {
                  URL.revokeObjectURL(url);
                  resolve();
                };
                img.src = url;
              });
            } catch (svgErr) {
              console.warn("SVG fallback also failed:", svgErr);
            }
          }
        }
      });
      await Promise.all(chartPromises);

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
            title="Share Report"
          >
            <UserPlus size={20} className="text-gray-600" />
          </button>
          <button
            onClick={handlePrint}
            disabled={loading}
            className={`p-2 hover:bg-gray-100 rounded-full transition-colors ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title="Print report"
          >
            <Printer size={20} className="text-gray-600" />
          </button>
          <button
            onClick={handleDownload}
            disabled={loading}
            className={`p-2 hover:bg-gray-100 rounded-full transition-colors ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
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
  loading: PropTypes.bool,
};

export default ReportActions;

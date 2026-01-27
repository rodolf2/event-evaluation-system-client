import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Download, Printer, UserPlus, ArrowLeft, Send } from "lucide-react";
import { useAuth } from "../../contexts/useAuth";

const ReportActions = ({
  onBackClick,
  eventId,
  isGeneratedReport = false,
  onShareGuest,
  loading = false,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handlePrint = async () => {
    if (loading) {
      toast.error("Please wait for report to finish loading");
      return;
    }

    // Open window immediately to avoid popup blocker
    // Must be done in sync context before any async operations
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      toast.error("Please allow pop-ups to print the report.");
      return;
    }

    // Show loading message in the print window
    printWindow.document.write(`
      <html>
        <head><title>Preparing Report...</title></head>
        <body style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
          <div style="text-align: center;">
            <div style="font-size: 18px; margin-bottom: 10px;">Preparing print preview...</div>
            <div style="color: #666;">Please wait while charts are being processed.</div>
          </div>
        </body>
      </html>
    `);

    try {
      // Wait for charts to be fully rendered
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get form data for report title
      const formData = JSON.parse(
        sessionStorage.getItem("currentFormData") || "{}",
      );
      const reportTitle = formData.title || "Evaluation Report";

      // Find the report container
      const reportElement = document.querySelector(
        ".container.mx-auto.max-w-5xl",
      );
      if (!reportElement) {
        printWindow.close();
        toast.error("Report content not found. Please try again.");
        return;
      }

      // Import html2canvas for chart conversion
      const html2canvas = (await import("html2canvas")).default;

      // Clone the report element
      const clone = reportElement.cloneNode(true);

      // Remove the original header/footer from the clone to prevent duplication
      // (We add our own header/footer in the print template)
      const headerBlock = clone.querySelector("#report-header-block");
      const footerBlock = clone.querySelector("#report-footer-block");
      const originalHeader = clone.querySelector("#report-header");
      const originalFooter = clone.querySelector("#report-footer");

      if (headerBlock) headerBlock.remove();
      if (footerBlock) footerBlock.remove();
      if (originalHeader) originalHeader.remove();
      if (originalFooter) originalFooter.remove();

      // Get header and footer images (from the original, before removal)
      let headerBase64 = "";
      let footerBase64 = "";

      try {
        const headerImg = document.querySelector("#report-header img");
        if (headerImg && headerImg.complete) {
          const canvas = document.createElement("canvas");
          canvas.width = headerImg.naturalWidth || 800;
          canvas.height = headerImg.naturalHeight || 80;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(headerImg, 0, 0);
          headerBase64 = canvas.toDataURL("image/png");
        }
      } catch (e) {
        console.warn("Could not convert header to base64:", e);
      }

      try {
        const footerImg = document.querySelector("#report-footer img");
        if (footerImg && footerImg.complete) {
          const canvas = document.createElement("canvas");
          canvas.width = footerImg.naturalWidth || 800;
          canvas.height = footerImg.naturalHeight || 40;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(footerImg, 0, 0);
          footerBase64 = canvas.toDataURL("image/png");
        }
      } catch (e) {
        console.warn("Could not convert footer to base64:", e);
      }

      // Convert charts to images
      const chartContainers = reportElement.querySelectorAll(
        ".print-chart-container, .recharts-wrapper",
      );
      const cloneChartContainers = clone.querySelectorAll(
        ".print-chart-container, .recharts-wrapper",
      );

      for (let i = 0; i < chartContainers.length; i++) {
        try {
          const container = chartContainers[i];
          const cloneContainer = cloneChartContainers[i];
          if (!cloneContainer) continue;

          const width = container.offsetWidth || 400;
          const height = container.offsetHeight || 300;

          // Clone the container and normalize colors before capture
          const canvas = await html2canvas(container, {
            backgroundColor: "#ffffff",
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true,
            // Use onclone to fix unsupported CSS color functions
            onclone: (clonedDoc) => {
              // Convert oklch and other unsupported color functions to fallback colors
              const allElements = clonedDoc.querySelectorAll("*");
              allElements.forEach((el) => {
                const computedStyle = window.getComputedStyle(el);
                const bgColor = computedStyle.backgroundColor;
                const textColor = computedStyle.color;

                // Check for oklch or other unsupported color functions
                if (bgColor && bgColor.includes("oklch")) {
                  el.style.backgroundColor = "#ffffff";
                }
                if (textColor && textColor.includes("oklch")) {
                  el.style.color = "#000000";
                }
              });
            },
          });

          const pngDataUrl = canvas.toDataURL("image/png");
          const replacement = document.createElement("img");
          replacement.src = pngDataUrl;
          replacement.style.width = `${width}px`;
          replacement.style.height = `${height}px`;
          replacement.style.display = "block";
          replacement.style.maxWidth = "100%";

          if (cloneContainer.parentNode) {
            cloneContainer.parentNode.replaceChild(replacement, cloneContainer);
          }
        } catch (err) {
          console.warn("Error capturing chart:", err);
          // On error, just leave the original chart element in place
          // The print may still work with SVG charts
        }
      }

      // Collect styles
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

      // Build the print document HTML
      const printHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>${reportTitle}</title>
            <style>
              ${styles}
              
              /* Print-specific styles */
              @media print {
                @page {
                  margin: 0.5in 0.4in;
                  size: A4;
                }
              }
              
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              
              body {
                margin: 0;
                padding: 0;
                font-family: 'Times New Roman', Times, serif !important;
                font-size: 11pt;
                line-height: 1.5;
                color: #000;
                background: white;
              }
              
              .print-header {
                width: 100%;
                margin-bottom: 10px;
              }
              
              .print-header img {
                width: 100%;
                max-height: 120px;
                object-fit: contain;
              }
              
              .print-title {
                text-align: center;
                padding: 10px 20px;
                border-bottom: 1px solid #e5e7eb;
              }
              
              .print-title h1 {
                color: #1e3a8a;
                font-size: 16pt;
                font-weight: bold;
                margin: 0 0 8px 0;
              }
              
              .print-title p {
                color: #4b5563;
                font-size: 10pt;
                margin: 0;
                line-height: 1.4;
              }
              
              .print-content {
                padding: 15px 30px;
              }
              
              .print-footer {
                position: fixed;
                bottom: 0;
                left: 0;
                width: 100%;
              }
              
              .print-footer img {
                width: 100%;
                max-height: 50px;
                object-fit: cover;
              }
              
              /* Hide navigation elements */
              aside, nav, .print\\:hidden, header:has(.lucide-menu) {
                display: none !important;
              }
              
              /* Chart and content styling */
              .print-chart-container, .recharts-wrapper {
                page-break-inside: avoid;
                break-inside: avoid;
                margin-bottom: 15px;
              }
              
              img { max-width: 100% !important; }
              
              h1, h2, h3, h4, h5, h6 {
                color: #1e3a8a !important;
                page-break-after: avoid;
              }
              
              .section-page {
                page-break-before: always;
              }
              
              .section-page:first-child {
                page-break-before: avoid;
              }
            </style>
          </head>
          <body>
            <!-- Header -->
            <div class="print-header">
              ${headerBase64
          ? `<img src="${headerBase64}" alt="Header" />`
          : `<div style="width: 100%; height: 60px; background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 50%, #1e3a5f 100%);"></div>`
        }
            </div>
            
            <!-- Title Section -->
            <div class="print-title">
              <h1>${reportTitle}</h1>
              <p>This evaluation report serves as a guide for the institution to acknowledge the impact of the said event on the welfare and enjoyment of the students at La Verdad Christian College – Apalit, Pampanga.</p>
            </div>
            
            <!-- Report Content -->
            <div class="print-content">
              ${clone.innerHTML}
            </div>
            
            <!-- Footer -->
            <div class="print-footer">
              ${footerBase64
          ? `<img src="${footerBase64}" alt="Footer" />`
          : `<div style="width: 100%; height: 30px; background: linear-gradient(180deg, #1a365d 0%, #1e3a5f 100%);"></div>`
        }
            </div>
          </body>
        </html>
      `;

      // Write the final HTML to the print window
      printWindow.document.open();
      printWindow.document.write(printHTML);
      printWindow.document.close();

      // Wait for content to load then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
    } catch (error) {
      console.error("Error preparing print:", error);
      const toast = document.querySelector("div[style*='z-index: 9999']");
      if (toast && toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      // Fallback to simple print
      window.print();
    }
  };

  const handleDownload = async () => {
    if (loading) {
      toast.error("Please wait for report to finish loading");
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

      // Wait for animations to finish and charts to fully render
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Ensure charts are visible and have dimensions before capture
      const allCharts = document.querySelectorAll(".print-chart-container");
      allCharts.forEach((container) => {
        container.style.visibility = "visible";
        container.style.opacity = "1";
      });

      // Find the entire report container
      const reportElement = document.querySelector(
        ".container.mx-auto.max-w-5xl",
      );
      if (!reportElement) {
        document.body.removeChild(loadingToast);
        toast.error("Report content not found. Please try again.");
        return;
      }

      // --- Create Header and Footer Templates for Puppeteer ---
      // These will appear on EVERY page of the PDF
      // Font size must be specified in px and styles must be inline

      // Get form data first (needed for report title in header)
      const formData = JSON.parse(
        sessionStorage.getItem("currentFormData") || "{}",
      );
      const reportTitle = formData.title || "Evaluation Report";

      // Convert header image to base64 for embedding in the PDF
      let headerBase64 = "";
      let footerBase64 = "";

      try {
        // Get header image from the page
        const headerImg = document.querySelector("#report-header img");
        if (headerImg && headerImg.complete) {
          const canvas = document.createElement("canvas");
          canvas.width = headerImg.naturalWidth || 800;
          canvas.height = headerImg.naturalHeight || 80;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(headerImg, 0, 0);
          headerBase64 = canvas.toDataURL("image/png");
        }
      } catch (e) {
        console.warn("Could not convert header to base64:", e);
      }

      try {
        // Get footer image from the page
        const footerImg = document.querySelector("#report-footer img");
        if (footerImg && footerImg.complete) {
          const canvas = document.createElement("canvas");
          canvas.width = footerImg.naturalWidth || 800;
          canvas.height = footerImg.naturalHeight || 40;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(footerImg, 0, 0);
          footerBase64 = canvas.toDataURL("image/png");
        }
      } catch (e) {
        console.warn("Could not convert footer to base64:", e);
      }

      // Header template - using the header.png image
      const headerTemplate = `
        <div style="width: 100%; margin: 0; padding: 0;">
          ${headerBase64
          ? `<img src="${headerBase64}" alt="Header" style="width: 100%; height: auto; max-height: 120px; display: block; object-fit: contain; object-position: left;" />`
          : `<div style="width: 100%; height: 60px; background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 50%, #1e3a5f 100%);"></div>`
        }
          <!-- Form Title - appears below header on each page -->
          <div style="
            width: 100%;
            background: white;
            padding: 8px 32px;
            border-bottom: 1px solid #e5e7eb;
            font-family: 'Times New Roman', Times, serif;
          ">
            <div style="color: #1e3a8a; font-size: 14px; font-weight: bold; text-align: center;">
              ${reportTitle}
            </div>
          </div>

          <!-- Report Description - appears below title on each page -->
          <div style="
            width: 100%;
            background: white;
            padding: 8px 32px;
            border-bottom: 1px solid #e5e7eb;
            font-family: 'Times New Roman', Times, serif;
          ">
            <div style="color: #4b5563; font-size: 11px; text-align: center; line-height: 1.4;">
              This evaluation report serves as a guide for the institution to acknowledge the impact of the said event on the welfare and enjoyment of the students at La Verdad Christian College – Apalit, Pampanga.
            </div>
          </div>
        </div>
      `;

      // Footer template - using the footer.png image with page numbers
      const footerTemplate = `
        <div style="width: 100%; margin: 0; padding: 0; position: relative;">
          ${footerBase64
          ? `<img src="${footerBase64}" alt="Footer" style="width: 100%; height: auto; display: block;" />`
          : `<div style="width: 100%; height: 30px; background: linear-gradient(180deg, #1a365d 0%, #1e3a5f 100%);"></div>`
        }
          <div style="
            position: absolute;
            bottom: 8px;
            right: 20px;
            font-size: 9px;
            color: #ffffff;
            font-family: 'Times New Roman', Times, serif;
          ">
            Page <span class="pageNumber"></span> of <span class="totalPages"></span>
          </div>
        </div>
      `;

      // Import html2canvas for capturing HTML components (used for charts only now)
      const html2canvas = (await import("html2canvas")).default;

      // --- Cloning and Content Preparation ---
      const clone = reportElement.cloneNode(true);

      // Remove in-content header and footer since they now appear via Puppeteer templates on every page
      const headerBlock = clone.querySelector("#report-header-block");
      const footerBlock = clone.querySelector("#report-footer-block");
      if (headerBlock) headerBlock.remove();
      if (footerBlock) footerBlock.remove();

      // Rasterize Charts using html2canvas - More reliable for Recharts
      // Find all chart containers with multiple selectors for better coverage
      // We need to capture the parent div that contains the ResponsiveContainer
      // Recharts renders: div.recharts-wrapper > svg.recharts-surface

      // First, try to find chart containers by our explicit print-chart-container class
      const printChartContainers = reportElement.querySelectorAll(
        ".print-chart-container",
      );
      const clonePrintChartContainers = clone.querySelectorAll(
        ".print-chart-container",
      );

      console.log(
        "Found print-chart-container elements:",
        printChartContainers.length,
      );

      // If we found print-chart-container elements, use those directly
      let chartContainers = [];
      let cloneChartContainers = [];

      if (printChartContainers.length > 0) {
        chartContainers = Array.from(printChartContainers);
        cloneChartContainers = Array.from(clonePrintChartContainers);
      } else {
        // Fallback: find any recharts-related elements
        const rechartsContainers = reportElement.querySelectorAll(
          ".recharts-wrapper, .recharts-responsive-container, [class*='recharts']",
        );
        const cloneRechartsContainers = clone.querySelectorAll(
          ".recharts-wrapper, .recharts-responsive-container, [class*='recharts']",
        );
        chartContainers = Array.from(rechartsContainers);
        cloneChartContainers = Array.from(cloneRechartsContainers);
      }

      console.log("Found chart containers:", chartContainers.length);

      // Log each found container for debugging
      chartContainers.forEach((c, i) => {
        console.log(
          `Chart ${i}:`,
          c.className,
          "dimensions:",
          c.offsetWidth,
          "x",
          c.offsetHeight,
        );
      });

      // Also target SVG elements directly as fallback
      const svgElements = reportElement.querySelectorAll(
        "svg.recharts-surface, svg[class*='recharts']",
      );
      const cloneSvgs = clone.querySelectorAll(
        "svg.recharts-surface, svg[class*='recharts']",
      );

      console.log("Found SVG elements:", svgElements.length);

      // Create a map of original container to its clone for accurate replacement
      const chartMap = new Map();
      // This includes recharts-responsive-container which wraps the actual chart
      const getClassName = (el) => {
        try {
          return String(el.className);
        } catch {
          return "";
        }
      };

      const allChartContainers = chartContainers.filter((c) => {
        // Check for various Recharts container classes
        const className = getClassName(c);
        return (
          (c.classList && c.classList.contains("recharts-wrapper")) ||
          (c.classList &&
            c.classList.contains("recharts-responsive-container")) ||
          className.includes("recharts")
        );
      });

      const allCloneChartContainers = cloneChartContainers.filter((c) => {
        const className = getClassName(c);
        return (
          (c.classList && c.classList.contains("recharts-wrapper")) ||
          (c.classList &&
            c.classList.contains("recharts-responsive-container")) ||
          className.includes("recharts")
        );
      });

      // Create a map of original container to its clone for accurate replacement
      allChartContainers.forEach((container, idx) => {
        const cloneContainer = allCloneChartContainers[idx];
        if (container && cloneContainer) {
          chartMap.set(container, cloneContainer);
        }
      });

      const chartPromises = Array.from(chartMap.entries()).map(
        async ([container, cloneContainer, svgElement, cloneSvg]) => {
          try {
            if (!cloneContainer) return;

            // Get the actual dimensions from the container
            const width = container.offsetWidth || 400;
            const height = container.offsetHeight || 300;

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
            replacement.style.width = `${width}px`;
            replacement.style.height = `${height}px`;
            replacement.style.display = "block";
            replacement.style.maxWidth = "100%";

            // Replace the chart container in the clone
            if (cloneContainer.parentNode) {
              cloneContainer.parentNode.replaceChild(
                replacement,
                cloneContainer,
              );
            }
          } catch (err) {
            console.warn("Error capturing chart with html2canvas:", err);

            // Fallback: try to capture just the SVG
            const svgIndex = Array.from(chartContainers).indexOf(container);
            if (svgElements[svgIndex] && cloneSvgs[svgIndex]) {
              try {
                const svg = svgElement;
                const svgRect = svg.getBoundingClientRect();
                const svgWidth = svgRect.width || 400;
                const svgHeight = svgRect.height || 300;

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
                    canvas.width = svgWidth * 2;
                    canvas.height = svgHeight * 2;
                    const ctx = canvas.getContext("2d");
                    ctx.scale(2, 2);
                    ctx.fillStyle = "white";
                    ctx.fillRect(0, 0, svgWidth, svgHeight);
                    ctx.drawImage(img, 0, 0, svgWidth, svgHeight);

                    const replacement = document.createElement("img");
                    replacement.src = canvas.toDataURL("image/png");
                    replacement.style.width = `${svgWidth}px`;
                    replacement.style.height = `${svgHeight}px`;
                    replacement.style.display = "block";
                    replacement.style.maxWidth = "100%";

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
        },
      );
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
              /* Remove default margins */
              body { margin: 0; padding: 0; }
              /* Hide screen-only elements */
              .print\\:hidden { display: none !important; }
              /* Ensure charts are visible in print */
              .recharts-wrapper { display: block !important; }
              .recharts-responsive-container { display: block !important; width: 100% !important; }
              .print-chart-container { page-break-inside: avoid; break-inside: avoid; margin-bottom: 20px; }
              /* Ensure SVG charts are visible */
              svg.recharts-surface { display: block !important; }
              /* Ensure chart parent containers have proper dimensions */
              .recharts-wrapper svg { display: block !important; }
              /* Fix for charts in pie charts */
              .recharts-pie { display: block !important; }
              .recharts-bar { display: block !important; }
              /* Report content styling - padding for content area */
              .report-print-content { padding: 10px 30px; }

              /* ========================================
                 ENHANCED PAGE BREAK & READABILITY RULES
                 ======================================== */

              /* Orphan/Widow Control */
              p, li, span { orphans: 3; widows: 3; }

              /* Individual comment items */
              .comment-item {
                break-inside: avoid;
                page-break-inside: avoid;
                margin-bottom: 0.5rem;
              }

              /* Comment section container - allow breaks between comments */
              .comment-section-container {
                break-inside: auto;
                page-break-inside: auto;
              }

              /* Question blocks - keep question with chart */
              .question-block {
                break-inside: avoid;
                page-break-inside: avoid;
                margin-bottom: 1.5rem;
              }

              /* Section pages - force new page */
              .section-page {
                page-break-before: always;
                break-before: page;
              }
              .section-page:first-child {
                page-break-before: avoid;
                break-before: auto;
              }

              /* Insights paragraphs */
              .space-y-6 > p {
                break-inside: avoid;
                page-break-inside: avoid;
              }

              /* Keep headers with content */
              h4, h5 {
                page-break-after: avoid;
                break-after: avoid;
              }

              /* Additional spacing improvements for print */
              .mb-8 { margin-bottom: 1.5rem !important; }
              .mb-6 { margin-bottom: 1rem !important; }
              .mb-4 { margin-bottom: 0.75rem !important; }
              .mb-2 { margin-bottom: 0.5rem !important; }
              .mt-8 { margin-top: 1.5rem !important; }
              .mt-6 { margin-top: 1rem !important; }
              .mt-4 { margin-top: 0.75rem !important; }
              .mt-2 { margin-top: 0.5rem !important; }

              /* Better font for print */
              body, p, li, span, div {
                font-family: 'Times New Roman', Times, serif !important;
                line-height: 1.5 !important;
              }
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
      a.download = `evaluation-report-${new Date().toISOString().split("T")[0]
        }.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error generating PDF:", error);
      // Safely remove loading toast if it exists
      const toast = document.querySelector("div[style*='z-index: 9999']");
      if (toast && toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      toast.error("Failed to download PDF. Please check console for details.");
    }
  };

  const handleGenerate = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required. Please log in again.");
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
        },
      );

      const result = await response.json();

      if (result.success) {
        toast.success("Report generated successfully!");
        // Navigate to reports page to see the generated report
        navigate("/psas/reports");
      } else {
        toast.error(result.message || "Failed to generate report");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("An error occurred while generating the report");
    }
  };

  const handleShowPreparedBy = () => {
    const basePath = user?.role === "club-officer" ? "/club-officer" : "/psas";
    navigate(`${basePath}/reports/prepared-by`, {
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
          {onShareGuest &&
            ["psas", "club-officer", "mis"].includes(user?.role) && (
              <button
                onClick={onShareGuest}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Share with guest"
              >
                <Send size={20} className="text-gray-600" />
              </button>
            )}
          {["psas", "club-officer", "mis"].includes(user?.role) && (
            <button
              onClick={handleShowPreparedBy}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Share Report"
            >
              <UserPlus size={20} className="text-gray-600" />
            </button>
          )}
          <button
            onClick={handlePrint}
            disabled={loading}
            className={`p-2 hover:bg-gray-100 rounded-full transition-colors ${loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            title="Print report"
          >
            <Printer size={20} className="text-gray-600" />
          </button>
          <button
            onClick={handleDownload}
            disabled={loading}
            className={`p-2 hover:bg-gray-100 rounded-full transition-colors ${loading ? "opacity-50 cursor-not-allowed" : ""
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

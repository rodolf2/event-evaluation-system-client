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
                margin-bottom: 15px;
              }
              
              .print-header img {
                width: 100%;
                height: 80px;
                object-fit: cover;
                display: block;
              }
              
              .print-title {
                text-align: center;
                padding: 15px 30px;
                border-bottom: 2px solid #1e3a8a;
                margin-bottom: 15px;
              }
              
              .print-title h1 {
                color: #1e3a8a;
                font-size: 18pt;
                font-weight: bold;
                margin: 0 0 10px 0;
              }
              
              .print-title p {
                color: #4b5563;
                font-size: 11pt;
                margin: 0;
                line-height: 1.5;
              }
              
              .print-content {
                padding: 20px 40px;
              }
              
              .print-footer {
                position: fixed;
                bottom: 0;
                left: 0;
                width: 100%;
              }
              
              .print-footer img {
                width: 100%;
                height: 50px;
                object-fit: cover;
                display: block;
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
              ${
                headerBase64
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
              ${
                footerBase64
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
      // Build the POST data
      // Removed image header/footer as requested by user to prevent layout issues
      
      // Simple text header
      const headerTemplate = `
        <div style="width:100%;height:30px;font-size:10px;text-align:center;color:#666;border-bottom:1px solid #ddd;margin-bottom:10px;display:flex;justify-content:center;align-items:center;">
          <span>LA VERDAD CHRISTIAN COLLEGE - APALIT, PAMPANGA</span>
        </div>`;

      // Simple footer with page numbers
      const footerTemplate = `
        <div style="width:100%;height:30px;font-size:9px;text-align:center;color:#999;border-top:1px solid #ddd;margin-top:10px;display:flex;justify-content:center;align-items:center;">
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>`;

      // Import html2canvas for capturing HTML components (used for charts only now)
      const html2canvas = (await import("html2canvas")).default;

      // --- Cloning and Content Preparation ---
      const clone = reportElement.cloneNode(true);

      // Remove in-content header and footer since they appear via Puppeteer templates on every page
      const headerBlock = clone.querySelector("#report-header-block");
      const footerBlock = clone.querySelector("#report-footer-block");
      if (headerBlock) headerBlock.remove();
      if (footerBlock) footerBlock.remove();


      // Debug: log the clone structure
      const allH1s = clone.querySelectorAll("h1");
      const allH4s = clone.querySelectorAll("h4");
      const allH5s = clone.querySelectorAll("h5");
      console.log("Clone debug - h1 count:", allH1s.length, "h4 count:", allH4s.length, "h5 count:", allH5s.length);

      // Force proper styling on the evaluation title (h1)
      allH1s.forEach((h1) => {
        // STRIP ALL CLASSES to avoid Tailwind conflicts and ensure visibility
        h1.removeAttribute("class");
        
        // Apply inline styles to match original design (text-3xl font-extrabold text-blue-900)
        h1.style.display = "block";
        h1.style.visibility = "visible";
        h1.style.fontSize = "24pt"; // Approx text-3xl
        h1.style.fontWeight = "800"; // font-extrabold
        h1.style.textAlign = "center";
        h1.style.color = "#000000"; // Changed to black as requested
        h1.style.margin = "16px auto";
        h1.style.opacity = "1";
        h1.style.lineHeight = "1.2";
        h1.style.position = "relative"; // Ensure stacking context
        h1.style.zIndex = "1000";       // Force above potential overlaps
        h1.style.backgroundColor = "white"; // Ensure opaque background if needed? No, that might cover logo.
      });

      // Force styling on all h2 titles (EVALUATION RESULT SUMMARY)
      const allH2s = clone.querySelectorAll("h2");
      allH2s.forEach((h2) => {
        h2.removeAttribute("class");
        h2.style.fontSize = "18pt"; // Approx text-2xl
        h2.style.fontWeight = "bold";
        h2.style.textAlign = "center";
        h2.style.color = "#000000"; // Black
        h2.style.textTransform = "uppercase";
        h2.style.marginBottom = "8px";
        h2.style.display = "block";
        h2.style.visibility = "visible";
      });

      // Force styling on all h3 titles (Section headers like "Qualitative Comments")
      const allH3s = clone.querySelectorAll("h3");
      allH3s.forEach((h3) => {
        h3.removeAttribute("class");
        h3.style.fontSize = "14pt"; // Approx text-xl
        h3.style.fontWeight = "bold";
        h3.style.color = "#000000"; // Black
        h3.style.borderBottom = "2px solid #000000"; // Black border
        h3.style.paddingBottom = "8px";
        h3.style.marginBottom = "24px";
        h3.style.display = "block";
        h3.style.visibility = "visible";
        h3.style.pageBreakAfter = "avoid";
      });

      // Fix the title wrapper div
      const titleWrapper = clone.querySelector(".text-center.mt-4");
      if (titleWrapper) {
        titleWrapper.removeAttribute("class"); // Strip classes
        titleWrapper.style.textAlign = "center";
        titleWrapper.style.marginTop = "0";
        titleWrapper.style.marginBottom = "10px";
        titleWrapper.style.display = "block";
      }

      // Force styling on all h4 section titles
      allH4s.forEach((h4) => {
        // STRIP ALL CLASSES
        h4.removeAttribute("class");
        
        // Match original design (text-xl font-bold)
        h4.style.display = "block";
        h4.style.visibility = "visible";
        h4.style.fontSize = "16pt"; // Approx text-xl
        h4.style.fontWeight = "bold"; // font-bold
        h4.style.textAlign = "center"; // text-center
        h4.style.color = "#000000";
        h4.style.margin = "15px 0 12px 0";
        h4.style.opacity = "1";
        h4.style.lineHeight = "1.3";
      });

      // Force h4 parent wrappers to be visible
      allH4s.forEach((h4) => {
        const parent = h4.parentElement;
        if (parent) {
          parent.removeAttribute("class"); 
          parent.style.display = "block";
          parent.style.visibility = "visible";
          parent.style.overflow = "visible"; 
          parent.style.opacity = "1";
          parent.style.marginBottom = "15px";
        }
      });

      // Force styling on h5 titles
      allH5s.forEach((h5) => {
        h5.removeAttribute("class");
        
        // Match original design (text-lg font-bold)
        h5.style.display = "block";
        h5.style.visibility = "visible";
        h5.style.fontSize = "12pt"; // Approx text-lg
        h5.style.fontWeight = "bold";
        h5.style.color = "#000000";
        h5.style.margin = "10px 0";
        h5.style.lineHeight = "1.4";
      });

      // CRITICAL: Remove overflow-hidden from ALL elements
      const allOverflowHidden = clone.querySelectorAll(".overflow-hidden");
      allOverflowHidden.forEach((el) => {
        el.className = el.className.replace(/\boverflow-hidden\b/g, "overflow-visible");
        el.style.overflow = "visible";
      });

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
              @page {
                margin-top: 40px !important;
                margin-bottom: 30px !important;
              }

              /* Ensure overflow-visible works for replaced elements */
              .overflow-visible {
              img { max-width: 100% !important; }
              /* Remove default margins */
              body { margin: 0; padding: 0; }
              /* Ensure overflow-visible works for replaced elements */
              h1 { width: 100% !important; margin: 0 auto; }
              
              /* Ensure comments don't break awkwardly */
              .comment-item { page-break-inside: avoid; break-inside: avoid; }
              
              .overflow-visible {
                overflow: visible !important;
              }

              /* IMPORTANT: Define .hidden FIRST so it can be overridden */
              .hidden { display: none !important; }

              /* Hide screen-only elements */
              .print\\:hidden { display: none !important; }
              
              /* Show print-only elements - MUST be defined AFTER .hidden */
              .print\\:block { display: block !important; }
              
              /* Override overflow-hidden so section content is never clipped */
              .overflow-hidden { overflow: visible !important; }
              
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

              /* Individual comment items - COMPACT for PDF */
              .comment-item {
                break-inside: avoid;
                page-break-inside: avoid;
                margin-bottom: 0.1rem !important;
                padding: 0.1rem 0 !important;
                line-height: 1.3 !important;
              }

              .comment-item p {
                margin: 0 !important;
                padding: 0 !important;
                font-size: 10pt !important;
                line-height: 1.3 !important;
              }

              .comment-item span {
                font-size: 10pt !important;
                line-height: 1.3 !important;
              }

              /* Comment section container - compact spacing */
              .comment-section-container {
                break-inside: auto;
                page-break-inside: auto;
                gap: 0 !important;
              }

              .comment-section-container.space-y-2 > * + * {
                margin-top: 0.15rem !important;
              }

              /* Question blocks - keep question with chart but allow multiple per page */
              .question-block {
                break-inside: avoid;
                page-break-inside: avoid;
                margin-bottom: 0.75rem;
              }

              /* Section pages - NO forced breaks, natural flow */
              .section-page {
                page-break-before: auto;
                break-before: auto;
                margin-bottom: 0.5rem;
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
                page-break-after: avoid !important;
                break-after: avoid !important;
              }

              /* Section titles - ensure visible and properly sized */
              .section-page h4 {
                font-size: 16pt !important;
                font-weight: bold !important;
                margin-bottom: 0.75rem !important;
                margin-top: 0.5rem !important;
                text-align: center !important;
                display: block !important;
                visibility: visible !important;
                color: #000 !important;
                min-height: 1.5em !important;
              }

              .section-page > div > div.text-center {
                margin-bottom: 0.75rem !important;
                padding: 0.25rem 0 !important;
                display: block !important;
                visibility: visible !important;
                min-height: 2em !important;
              }

              /* Override text-lg for section heading */
              .section-page .text-lg.font-bold {
                font-size: 16pt !important;
                display: block !important;
              }

              /* Additional spacing improvements for print */
              .mb-8 { margin-bottom: 0.75rem !important; }
              .mb-6 { margin-bottom: 0.5rem !important; }
              .mb-4 { margin-bottom: 0.4rem !important; }
              .mb-2 { margin-bottom: 0.25rem !important; }
              .mt-8 { margin-top: 0.75rem !important; }
              .mt-6 { margin-top: 0.5rem !important; }
              .mt-4 { margin-top: 0.4rem !important; }
              .mt-2 { margin-top: 0.25rem !important; }

              /* Better font for print */
              body, p, li, span, div {
                font-family: 'Times New Roman', Times, serif !important;
                line-height: 1.4 !important;
              }

              /* ========================================
                 FIRST PAGE LAYOUT - Title & Year Comparison
                 ======================================== */
              /* Keep title and year comparison together on first page */
              #report-header-block {
                page-break-after: avoid !important;
              }
              
              .print-title,
              .print-description {
                page-break-after: avoid !important;
              }
              
              /* Force page break after year level breakdown section */
              .print-page-break-after-forced {
                page-break-after: always !important;
                page-break-inside: auto !important;
              }

              /* Each comparison entry (Department, Program items) - avoid being cut off */
              .print-page-break-after-forced .border-b {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }

              /* Section wrappers inside the first-page div - allow breaking between them */
              .print-page-break-after-forced .section-page {
                page-break-inside: auto !important;
              }
              
              /* ========================================
                 4 QUESTIONS PER PAGE LAYOUT - ULTRA COMPACT
                 ======================================== */
               /* Qualitative questions wrapper - single column per page */
               .qualitative-questions-wrapper {
                 display: flex !important;
                 flex-direction: column !important;
                 gap: 0.5rem !important;
               }
              
               /* Question block - keep intact, no breaks inside */
               .question-block {
                 page-break-inside: avoid !important;
                 break-inside: avoid !important;
                 margin-bottom: 1.5rem !important;
                 padding-bottom: 1rem !important;
                 padding-top: 0.5rem !important;
                 border-bottom: 1px solid #e5e7eb !important;
                 display: block !important;
               }
               
               .question-block:last-child {
                 border-bottom: none !important;
                 margin-bottom: 0 !important;
               }
              
              /* After every 4th question in a group, that's the end of page so naturally breaks */
              /* The wrapper div with print-page-break-before-forced ensures page breaks */
              
               /* Chart+Legend container - let it auto-size when it's a flex wrapper */
               .print-chart-container {
                 page-break-inside: avoid !important;
                 break-inside: avoid !important;
                 margin-bottom: 0.5rem !important;
                 margin-top: 0.5rem !important;
                 padding: 0 !important;
                 /* Do NOT constrain width/height — the outer wrapper holds chart + legend */
                 height: auto !important;
                 max-height: none !important;
                 width: 100% !important;
                 min-width: auto !important;
               }
               
               /* Inner chart recharts wrapper - fixed size */
               .print-chart-container .recharts-wrapper,
               .print-chart-container .recharts-responsive-container {
                 max-height: 140px !important;
                 height: 140px !important;
                 width: 140px !important;
                 margin: 0 !important;
               }
               
               .print-chart-container svg.recharts-surface {
                 height: 140px !important;
                 width: 140px !important;
               }
              
              /* Report Summary sentiment chart - larger than per-question charts */
              .h-64.print-chart-container {
                height: 300px !important;
                width: 300px !important;
                min-height: 300px !important;
                min-width: 300px !important;
              }

              .h-64.print-chart-container .recharts-wrapper,
              .h-64.print-chart-container .recharts-responsive-container {
                height: 300px !important;
                width: 300px !important;
                max-height: 300px !important;
              }

              .h-64.print-chart-container svg.recharts-surface {
                height: 300px !important;
                width: 300px !important;
              }
              
              /* Space saving overrides - AGGRESSIVE */
              .space-y-12 { gap: 0 !important; }
              .gap-12 { gap: 0 !important; }
              .grid { gap: 0 !important; }
              .mb-16 { margin-bottom: 0 !important; }
              .mb-12 { margin-bottom: 0 !important; }
              .mb-8 { margin-bottom: 0.25rem !important; }
              .mb-6 { margin-bottom: 0.15rem !important; }
              .mb-4 { margin-bottom: 0.1rem !important; }
              .mt-8 { margin-top: 0 !important; }
              .mt-6 { margin-top: 0 !important; }
              .mt-4 { margin-top: 0 !important; }
              .mt-2 { margin-top: 0 !important; }
              
              /* Question specific styling - VERY COMPACT */
              .question-block h5 { 
                font-size: 9pt !important; 
                margin-bottom: 0.15rem !important; 
                margin-top: 0 !important;
                font-weight: bold !important;
                page-break-after: avoid !important;
                line-height: 1.1 !important;
              }
              
              .question-block p { 
                font-size: 8pt !important; 
                margin-bottom: 0.15rem !important;
                margin-top: 0 !important;
                page-break-after: avoid !important;
                line-height: 1.1 !important;
              }
              
              /* Reduce padding in sections */
              .section-page {
                padding: 0 !important;
                margin-bottom: 0 !important;
                margin-top: 0 !important;
              }
              
              /* Section wrapper - reduce spacing */
              .print\:shadow-none {
                padding: 0 !important;
                margin-bottom: 0 !important;
                margin-top: 0 !important;
              }
              
              /* Print-keep-together class to group title and response count */
              .print-keep-together {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                margin-bottom: 0.15rem !important;
              }
              
              /* Flex containers in questions - chart LEFT, legend RIGHT */
              .flex.flex-col.md\\:flex-row.items-center.justify-center.gap-2 {
                flex-direction: row !important;
                gap: 1rem !important;
                align-items: center !important;
                justify-content: flex-start !important;
                width: 100% !important;
                height: auto !important;
                max-height: none !important;
                min-height: auto !important;
                overflow: visible !important;
              }
              
              /* Chart wrapper - fixed size on the left */
              .flex.flex-col.md\\:flex-row.items-center.justify-center.gap-2 > div:first-child {
                flex-shrink: 0 !important;
                width: 140px !important;
                height: 140px !important;
                min-width: 140px !important;
                min-height: 140px !important;
              }
              
              /* Legend wrapper - beside the chart */
              .flex.flex-col.md\\:flex-row.items-center.justify-center.gap-2 > div:last-child {
                flex: 1 !important;
                padding-left: 0.5rem !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: center !important;
              }
              
              /* Legend styling - compact items */
              .space-y-2 > div {
                margin-bottom: 0.1rem !important;
                padding-bottom: 0 !important;
                line-height: 1.2 !important;
                font-size: 8pt !important;
              }
              
              /* Legend item text */
              .space-y-2 span {
                font-size: 8pt !important;
                line-height: 1.2 !important;
              }

              /* Legend color dots */
              .space-y-2 .w-3.h-3 {
                width: 8px !important;
                height: 8px !important;
                min-width: 8px !important;
                flex-shrink: 0 !important;
              }
              
              /* Chart wrapper compactness */
              .flex.flex-col.md\\:flex-row {
                margin: 0 !important;
                padding: 0 !important;
                gap: 0.5rem !important;
              }
              
              /* Responsive container - remove extra spacing */
              .recharts-responsive-container {
                margin: 0 !important;
                padding: 0 !important;
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
        let errorMessage = "Failed to generate PDF";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
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
      // Safely remove loading toast if it exists
      const loadingToast = document.querySelector(
        "div[style*='z-index: 9999']",
      );
      if (loadingToast && loadingToast.parentNode) {
        loadingToast.parentNode.removeChild(loadingToast);
      }
      toast.error(`Failed to download PDF: ${error.message}`);
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
              disabled={loading}
              className={`bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
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

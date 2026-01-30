import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { useCanvasHistory } from "../../../hooks/useCanvasHistory";
import ElementsPanel from "./ElementsPanel";
import CanvasToolbar from "./CanvasToolbar";
import {
  Bold,
  Italic,
  Underline,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Copy,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  ChevronLeft,
  Plus,
  Sliders,
  X,
} from "lucide-react";

import { jsPDF } from "jspdf";
import axios from "axios";
import { useAuth } from "../../../contexts/useAuth";

const CERTIFICATE_SIZES = {
  // Force all sizes to landscape orientation
  "US Letter": { width: 1056, height: 816 }, // 11" x 8.5" landscape at 96 DPI
  A4: { width: 1123, height: 794 }, // 297mm x 210mm landscape at 96 DPI
};

const CertificateEditor = ({
  initialData,
  isPreviewMode = false,
  isFromEvaluation = false,
  onSave,
  onBack,
  onDone,
}) => {
  const [certificateSize, setCertificateSize] = useState("US Letter");
  const [showPanels, setShowPanels] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState(null); // 'elements' | 'properties' | null

  const BASE_WIDTH = CERTIFICATE_SIZES[certificateSize].width;
  const BASE_HEIGHT = CERTIFICATE_SIZES[certificateSize].height;
  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const wrapperRef = useRef(null);
  const fabricCanvas = useRef(null);
  const fabricRef = useRef(null);
  // Removed duplicate fabricRef declaration
  const fileInputRef = useRef(null);
  const bgInputRef = useRef(null);
  const { token } = useAuth();

  const [activeObject, setActiveObject] = useState(null);
  const [, setForceUpdate] = useState(0);
  const [snapLines, setSnapLines] = useState([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);

  // Save as Template modal state
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  const {
    pushHistory: rawPushHistory,
    undo: rawUndo,
    redo: rawRedo,
  } = useCanvasHistory();

  const pushHistory = useCallback(() => {
    if (fabricCanvas.current) {
      rawPushHistory(fabricCanvas.current);
    }
  }, [rawPushHistory]);

  const undo = useCallback(() => {
    if (fabricCanvas.current) {
      rawUndo(fabricCanvas.current);
    }
  }, [rawUndo]);

  const redo = useCallback(() => {
    if (fabricCanvas.current) {
      rawRedo(fabricCanvas.current);
    }
  }, [rawRedo]);

  // Create refs for functions to prevent unnecessary re-initialization
  const cloneObjectRef = useRef();

  useEffect(() => {
    let resizeObserver = null;
    let mounted = true;
    // Capture ref value for cleanup
    const wrapperElement = wrapperRef.current;

    const initFabric = async () => {
      // Ensure clean canvas element before initialization
      const canvasEl = canvasRef.current;
      if (!canvasEl) return;

      // Clear any existing canvas content
      canvasEl.innerHTML = "";

      const BASE_WIDTH = CERTIFICATE_SIZES[certificateSize].width;
      const BASE_HEIGHT = CERTIFICATE_SIZES[certificateSize].height;

      try {
        const fabricModule = await import("fabric");
        const fabric = fabricModule.default || fabricModule;
        if (!mounted || !fabric) return;

        if (!canvasEl) return;

        // Double-check canvas doesn't exist before creating new one
        if (fabricCanvas.current && !fabricCanvas.current.destroyed) {
          fabricCanvas.current.dispose();
          fabricCanvas.current = null;
        }

        fabricRef.current = fabric;

        const canvas = new fabric.Canvas(canvasEl, {
          width: BASE_WIDTH,
          height: BASE_HEIGHT,
          backgroundColor: "#ffffff",
          selection: true,
          preserveObjectStacking: true,
        });
        fabricCanvas.current = canvas;

        const safeHasCanvas = () =>
          mounted &&
          canvas &&
          !canvas.destroyed &&
          fabricCanvas.current === canvas;

        /**
         * Fit the certificate canvas into the visible wrapper and scaled it.
         */
        const centerAndFitCanvas = () => {
          if (!safeHasCanvas()) return;
          const outer = wrapperRef.current;
          if (!outer) return;

          // Padding to ensure it doesn't touch edges (16px total horizontal/vertical)
          const padding = 32;
          const availableWidth = outer.clientWidth - padding;
          const availableHeight = outer.clientHeight - padding;

          if (availableWidth <= 0 || availableHeight <= 0) return;

          // Calculate scale to fit the certificate within the available space
          const scaleX = availableWidth / BASE_WIDTH;
          const scaleY = availableHeight / BASE_HEIGHT;

          // Fit fully visible
          let scale = Math.min(scaleX, scaleY);

          // Limit max scale to 1 to avoid pixelation if that's desired,
          // generally for certificates we want to see the whole thing so upscaling on big screens is fine
          // but let's cap at 1.5x to avoid extreme blurriness on massive screens if generic
          scale = Math.min(scale, 1.2);

          const finalWidth = BASE_WIDTH * scale;
          const finalHeight = BASE_HEIGHT * scale;

          try {
            if (!safeHasCanvas()) return;
            canvas.setDimensions({ width: finalWidth, height: finalHeight });
            canvas.setViewportTransform([scale, 0, 0, scale, 0, 0]);
            canvas.requestRenderAll();
          } catch (err) {
            console.warn(
              "CertificateEditor centerAndFitCanvas error (ignored):",
              err,
            );
          }
        };

        const handleResize = () => {
          if (!safeHasCanvas()) return;
          try {
            centerAndFitCanvas();
          } catch (err) {
            console.warn(
              "CertificateEditor handleResize error (ignored):",
              err,
            );
          }
        };

        // Initial fit/center
        handleResize();

        // Observe container size changes using wrapperRef
        if (typeof ResizeObserver !== "undefined") {
          resizeObserver = new ResizeObserver(() => {
            // Guard every callback so Fabric internals never crash the app
            try {
              window.requestAnimationFrame(() => handleResize());
            } catch (err) {
              console.warn(
                "CertificateEditor ResizeObserver callback error (ignored):",
                err,
              );
            }
          });

          if (wrapperElement) {
            resizeObserver.observe(wrapperElement);
          }
        }

        const updateSelection = () => {
          setActiveObject(canvas.getActiveObject());
          setForceUpdate((f) => f + 1);
        };

        const handleTextAutoShrink = (obj) => {
          if (!obj || obj.type !== "textbox") return;
          const minFontSize = 10;
          const text = obj.text || "";
          const isPlaceholder = text.includes("[") && text.includes("]");
          let maxLines = 4;
          if (isPlaceholder) maxLines = 1;
          else if (obj.fontSize >= 40) maxLines = 2;

          let shrinked = false;
          let iterations = 0;
          // In Fabric Textbox, _textLines is populated after wrap
          while (obj._textLines && obj._textLines.length > maxLines && obj.fontSize > minFontSize && iterations < 50) {
            obj.set("fontSize", obj.fontSize - 1);
            obj.initDimensions(); // Re-calculate wrap
            shrinked = true;
            iterations++;
          }
          if (shrinked && canvas) canvas.requestRenderAll();
        };

        const handleModification = (e) => {
          if (e && e.target) handleTextAutoShrink(e.target);
          updateSelection();
          rawPushHistory(canvas);
        };

        canvas.on({
          "object:modified": handleModification,
          "object:added": (e) => {
            if (e.target && e.target.type === "textbox") handleTextAutoShrink(e.target);
            handleModification();
          },
          "object:removed": handleModification,
          "text:changed": (e) => handleTextAutoShrink(e.target),
          "selection:created": updateSelection,
          "selection:updated": updateSelection,
          "selection:cleared": updateSelection,
        });

        canvas.on("object:selected", (e) => {
          e.target.set({
            borderColor: "#2563EB",
            cornerColor: "#2563EB",
            cornerStyle: "circle",
            transparentCorners: false,
          });
        });

        // canvas.on("object:moving", (e) => {
        //   const obj = e.target;
        //   if (!obj) return;

        // ... snapping logic omitted for brevity in diff, it uses canvas methods so it should work fine with updated transforms
        // because Fabric handles object coordinates relative to canvas logic dimensions if viewportTransform is set correctly.
        // });

        // ... (Rest of event handlers)

        /* Re-adding the missing snapping logic setup from original file or ensuring it works 
           Note: The full replacement content should strictly follow the boundaries given.
           Wait, there is a lot of code in the middle I am skipping if I look at StartLine/EndLine.
           I need to make sure I don't delete the snapping logic in the middle.
           
           Actually, the "snapping logic" is inside `initFabric`.
           Use `replace_file_content` carefully.
           
           I will replace from `const canvasRef...` down to `// Observe container size changes...` block end, 
           BUT `initFabric` is long.
           
           Better strategy:
           Use `multi_replace_file_content` or split this into smaller chunks.
           The biggest change is `centerAndFitCanvas`.
           `handleResize` is small.
           `ResizeObserver` setup is small.
           `wrapperRef` addition is small.
           
           Let's do this in small chunks.
        */

        // const updateSelection = () => {
        //   setActiveObject(canvas.getActiveObject());
        //   setForceUpdate((f) => f + 1);
        // };

        // const handleModification = () => {
        //   updateSelection();
        //   rawPushHistory(canvas);
        // };

        // canvas.on({
        //   "object:modified": handleModification,
        //   "object:added": handleModification,
        //   "object:removed": handleModification,
        //   "selection:created": updateSelection,
        //   "selection:updated": updateSelection,
        //   "selection:cleared": updateSelection,
        // });

        // canvas.on("object:selected", (e) => {
        //   e.target.set({
        //     borderColor: "#2563EB",
        //     cornerColor: "#2563EB",
        //     cornerStyle: "circle",
        //     transparentCorners: false,
        //   });
        // });

        canvas.on("object:moving", (e) => {
          const obj = e.target;
          if (!obj) return;

          const snapThreshold = 12; // Increased threshold for better snapping
          const canvasWidth = canvas.getWidth();
          const canvasHeight = canvas.getHeight();

          // Calculate object bounds
          const objLeft = obj.left;
          const objRight = obj.left + obj.getScaledWidth();
          const objTop = obj.top;
          const objBottom = obj.top + obj.getScaledHeight();
          const objCenterX = obj.left + obj.getScaledWidth() / 2;
          const objCenterY = obj.top + obj.getScaledHeight() / 2;

          // Define comprehensive snap points
          const snapPoints = {
            // Horizontal snap points
            left: 0,
            centerX: canvasWidth / 2,
            right: canvasWidth,
            quarterLeft: canvasWidth / 4,
            quarterRight: (canvasWidth * 3) / 4,
            thirdLeft: canvasWidth / 3,
            thirdRight: (canvasWidth * 2) / 3,

            // Vertical snap points
            top: 0,
            centerY: canvasHeight / 2,
            bottom: canvasHeight,
            quarterTop: canvasHeight / 4,
            quarterBottom: (canvasHeight * 3) / 4,
            thirdTop: canvasHeight / 3,
            thirdBottom: (canvasHeight * 2) / 3,
          };

          const newSnapLines = [];
          let snapped = false;

          // Check horizontal snapping with priority (center first, then edges)
          const horizontalSnaps = [
            {
              point: objCenterX,
              target: snapPoints.centerX,
              type: "vertical",
              label: "center",
              priority: 1,
            },
            {
              point: objLeft,
              target: snapPoints.left,
              type: "vertical",
              label: "left",
              priority: 2,
            },
            {
              point: objRight,
              target: snapPoints.right,
              type: "vertical",
              label: "right",
              priority: 2,
            },
            {
              point: objLeft,
              target: snapPoints.thirdLeft,
              type: "vertical",
              label: "third-left",
              priority: 3,
            },
            {
              point: objRight,
              target: snapPoints.thirdRight,
              type: "vertical",
              label: "third-right",
              priority: 3,
            },
            {
              point: objLeft,
              target: snapPoints.quarterLeft,
              type: "vertical",
              label: "quarter-left",
              priority: 4,
            },
            {
              point: objRight,
              target: snapPoints.quarterRight,
              type: "vertical",
              label: "quarter-right",
              priority: 4,
            },
          ];

          // Sort by priority and check snapping
          horizontalSnaps.sort((a, b) => a.priority - b.priority);

          for (const { point, target, type, label } of horizontalSnaps) {
            if (Math.abs(point - target) < snapThreshold) {
              obj.left = target - (point - objLeft);
              newSnapLines.push({ type, position: target, label });
              snapped = true;
              break; // Only snap to one horizontal point at a time
            }
          }

          // Check vertical snapping with priority (center first, then edges)
          const verticalSnaps = [
            {
              point: objCenterY,
              target: snapPoints.centerY,
              type: "horizontal",
              label: "center",
              priority: 1,
            },
            {
              point: objTop,
              target: snapPoints.top,
              type: "horizontal",
              label: "top",
              priority: 2,
            },
            {
              point: objBottom,
              target: snapPoints.bottom,
              type: "horizontal",
              label: "bottom",
              priority: 2,
            },
            {
              point: objTop,
              target: snapPoints.thirdTop,
              type: "horizontal",
              label: "third-top",
              priority: 3,
            },
            {
              point: objBottom,
              target: snapPoints.thirdBottom,
              type: "horizontal",
              label: "third-bottom",
              priority: 3,
            },
            {
              point: objTop,
              target: snapPoints.quarterTop,
              type: "horizontal",
              label: "quarter-top",
              priority: 4,
            },
            {
              point: objBottom,
              target: snapPoints.quarterBottom,
              type: "horizontal",
              label: "quarter-bottom",
              priority: 4,
            },
          ];

          // Sort by priority and check snapping
          verticalSnaps.sort((a, b) => a.priority - b.priority);

          for (const { point, target, type, label } of verticalSnaps) {
            if (Math.abs(point - target) < snapThreshold) {
              obj.top = target - (point - objTop);
              newSnapLines.push({ type, position: target, label });
              snapped = true;
              break; // Only snap to one vertical point at a time
            }
          }

          // If snapped, trigger canvas render
          if (snapped) {
            canvas.requestRenderAll();
          }

          setSnapLines(newSnapLines);
        });

        canvas.on("object:modified", () => {
          setSnapLines([]);
        });

        if (initialData) {
          canvas.loadFromJSON(initialData, () => {
            // Make all objects selectable and movable (including backgrounds and borders)
            canvas.getObjects().forEach((obj) => {
              obj.set({
                selectable: true,
                evented: true,
                lockMovementX: false,
                lockMovementY: false,
                lockScalingX: false,
                lockScalingY: false,
                lockRotation: false,
                hasControls: true,
                hasBorders: true,
                borderColor: "#2563EB",
                cornerColor: "#2563EB",
                cornerStyle: "circle",
                transparentCorners: false,
              });
            });

            // Ensure all objects/backgrounds/borders are laid out on the logical canvas
            canvas.renderAll();

            // Run auto-shrink for all text boxes after initial render
            canvas.getObjects().forEach((obj) => {
              if (obj.type === "textbox") handleTextAutoShrink(obj);
            });

            // Center the full canvas (including any background/border) in the container
            centerAndFitCanvas();
            pushHistory();
          });
        } else {
          pushHistory();
          centerAndFitCanvas();
        }

        const handleKey = (e) => {
          if (!canvas) return;
          const active = canvas.getActiveObject();
          if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
            return;

          if ((e.key === "Delete" || e.key === "Backspace") && active) {
            canvas.remove(active);
            canvas.discardActiveObject();
          }
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
            e.preventDefault();
            undo();
          }
          if (
            (e.ctrlKey || e.metaKey) &&
            (e.key.toLowerCase() === "y" ||
              (e.shiftKey && e.key.toLowerCase() === "z"))
          ) {
            e.preventDefault();
            redo();
          }
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
            e.preventDefault();
            cloneObjectRef.current?.();
          }
        };
        window.addEventListener("keydown", handleKey);

        // Cleanup specific to this initFabric call
        return () => {
          window.removeEventListener("keydown", handleKey);
          try {
            if (resizeObserver) {
              // Unobserve the parent container
              const parentContainer = canvasContainerRef.current?.parentElement;
              if (parentContainer) {
                resizeObserver.unobserve(parentContainer);
              }
              resizeObserver.disconnect();
            }
          } catch {
            // ignore observer cleanup errors
          }
          try {
            if (safeHasCanvas()) {
              fabricCanvas.current.dispose();
              fabricCanvas.current = null;
            }
          } catch {
            // ignore dispose errors
          }
        };
      } catch (err) {
        console.error("CertificateEditor initFabric failed:", err);
      }
    };

    let cleanupFn = null;
    initFabric().then((cleanup) => {
      if (mounted && typeof cleanup === "function") {
        cleanupFn = cleanup;
      }
    });

    return () => {
      mounted = false;
      if (cleanupFn) {
        try {
          cleanupFn();
        } catch (err) {
          console.warn("CertificateEditor cleanup error (ignored):", err);
        }
      } else {
        // Fallback cleanup if init failed early
        try {
          if (resizeObserver) {
            // Unobserve the parent container
            const parentContainer = canvasContainer?.parentElement;
            if (parentContainer) {
              resizeObserver.unobserve(parentContainer);
            }
            resizeObserver.disconnect();
          }
        } catch {
          // ignore
        }
        try {
          if (fabricCanvas.current && !fabricCanvas.current.destroyed) {
            fabricCanvas.current.dispose();
            fabricCanvas.current = null;
          }
        } catch {
          // ignore
        }
      }
    };
  }, [certificateSize, initialData, pushHistory, redo, undo, rawPushHistory]);

  // Handle responsive behavior - auto-hide panels on mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);
      if (mobile && showPanels) {
        setShowPanels(false);
      }
    };

    // Check on mount
    checkMobile();

    // Listen for resize events
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, [showPanels]);

  const addObjectToCanvas = useCallback((object) => {
    const canvas = fabricCanvas.current;
    if (!canvas) return;
    canvas.add(object);
    canvas.setActiveObject(object);
  }, []);

  const addText = useCallback(
    (isHeadline) => {
      const fabric = fabricRef.current;
      if (!fabric || !fabricCanvas.current) return;
      const boxWidth = isHeadline ? 800 : 600;
      const text = new fabric.Textbox(
        isHeadline ? "Click to edit headline" : "Click to edit body text",
        {
          left: (BASE_WIDTH - boxWidth) / 2,
          top: isHeadline ? 180 : 350,
          fontSize: isHeadline ? 48 : 24,
          fill: "#000",
          fontFamily: "Inter, Arial",
          width: boxWidth,
          editable: true,
          textAlign: "center",
        },
      );
      addObjectToCanvas(text);
    },
    [addObjectToCanvas, BASE_WIDTH],
  );

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(
        "Image file is too large. Please select an image smaller than 10MB.",
      );
      e.target.value = "";
      return;
    }

    setIsUploadingImage(true);

    const reader = new FileReader();
    reader.onload = (f) => {
      const dataUrl = f.target.result;
      const fabric = fabricRef.current;
      const canvas = fabricCanvas.current;

      if (!fabric || !canvas) {
        toast.error("Canvas is not ready. Please try again.");
        console.error("Fabric or canvas not ready for image upload");
        setIsUploadingImage(false);
        return;
      }

      console.log("Creating Fabric.js image from data URL...");

      // Try the standard Fabric.js approach first
      let imageLoaded = false;

      fabric.Image.fromURL(
        dataUrl,
        (img) => {
          imageLoaded = true;
          console.log("Fabric.js image callback executed", img);
          setIsUploadingImage(false);

          if (!img) {
            toast.error("Failed to load image. Please try a different image file.");
            console.error(
              "Failed to create image from URL - img is null/undefined",
            );
            return;
          }

          console.log("Image loaded successfully:", img.width, "x", img.height);
          addImageToCanvas(img);
        },
        {
          crossOrigin: "anonymous",
        },
      );

      // Fallback: Use native Image object if Fabric.js fails
      setTimeout(() => {
        if (!imageLoaded) {
          console.log("Fabric.js approach failed, trying fallback method...");

          const nativeImg = new Image();
          nativeImg.crossOrigin = "anonymous";
          nativeImg.onload = () => {
            console.log("Native image loaded, creating Fabric.js image...");
            const img = new fabric.Image(nativeImg);
            setIsUploadingImage(false);
            addImageToCanvas(img);
          };
          nativeImg.onerror = () => {
            setIsUploadingImage(false);
            toast.error("Failed to load image. Please try a different image file.");
            console.error("Both Fabric.js and native image loading failed");
          };
          nativeImg.src = dataUrl;
        }
      }, 2000); // Wait 2 seconds for Fabric.js to respond

      // Add a timeout to reset loading state if callback never executes
      setTimeout(() => {
        if (!imageLoaded) {
          setIsUploadingImage(false);
          console.warn("Image upload timed out - resetting loading state");
          toast.error("Image upload timed out. Please try again.");
        }
      }, 15000); // 15 second timeout

      // Helper function to add image to canvas
      const addImageToCanvas = (img) => {
        // Scale image to reasonable size while maintaining aspect ratio
        const maxWidth = 400;
        const maxHeight = 300;

        if (img.width > maxWidth || img.height > maxHeight) {
          const scaleX = maxWidth / img.width;
          const scaleY = maxHeight / img.height;
          const scale = Math.min(scaleX, scaleY);
          console.log("Scaling image by factor:", scale);
          img.scale(scale);
        }

        // Set interactive properties
        img.set({
          selectable: true,
          evented: true,
          lockMovementX: false,
          lockMovementY: false,
          lockScalingX: false,
          lockScalingY: false,
          lockRotation: false,
          hasControls: true,
          hasBorders: true,
          borderColor: "#2563EB",
          cornerColor: "#2563EB",
          cornerStyle: "circle",
          transparentCorners: false,
        });

        // Center the image on canvas
        canvas.centerObject(img);

        // Add to canvas and make active
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.requestRenderAll();

        // Push to history for undo/redo
        pushHistory();

        console.log("Image added to canvas successfully!");
      };
    };

    reader.onerror = (error) => {
      setIsUploadingImage(false);
      toast.error("Error reading the image file. Please try again.");
      console.error("Error reading file:", error);
    };

    reader.readAsDataURL(file);

    // Clear the input
    e.target.value = "";
  };

  const addImageFromUrl = () => {
    const url = prompt(
      "Enter direct image URL (e.g., https://example.com/image.jpg)\n\nNote: Most websites block cross-origin access. Try these working examples:\n• https://picsum.photos/800/600 (random image)\n• https://via.placeholder.com/800x600 (placeholder)\n• Direct links from Unsplash/Pexels/Pixabay\n• Or upload files directly for best results",
    );
    if (!url) return;

    // Basic URL validation
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      toast.error("Please enter a valid URL.");
      return;
    }

    // Check if it's likely a direct image URL
    const imageExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".svg",
      ".bmp",
    ];
    const isImageUrl = imageExtensions.some((ext) =>
      parsedUrl.pathname.toLowerCase().includes(ext),
    );

    if (!isImageUrl) {
      toast.error(
        "This doesn't appear to be a direct image URL. Please use a direct link to an image file (ending in .jpg, .png, etc.)",
      );
      return;
    }

    const fabric = fabricRef.current;
    const canvas = fabricCanvas.current;

    if (!fabric || !canvas) {
      toast.error("Canvas is not ready. Please try again.");
      console.error("Fabric or canvas not ready for URL image");
      return;
    }

    console.log("Loading image from URL:", url);
    toast.loading("Loading image from URL... This may take a few seconds.", { id: "url-image-load" });

    // Try the standard Fabric.js approach first
    let urlImageLoaded = false;

    fabric.Image.fromURL(
      url,
      (img) => {
        urlImageLoaded = true;
        console.log("URL Fabric.js image callback executed", img);

        if (!img) {
          toast.error(
            "Failed to load image from URL. Make sure the URL allows cross-origin access and the image exists.", { id: "url-image-load" }
          );
          console.error("Failed to load image from URL:", url);
          return;
        }

        console.log(
          "URL image loaded successfully:",
          img.width,
          "x",
          img.height,
        );
        addUrlImageToCanvas(img);
      },
      {
        crossOrigin: "anonymous",
      },
    );

    // Fallback: Use native Image object if Fabric.js fails
    setTimeout(() => {
      if (!urlImageLoaded) {
        console.log("URL Fabric.js approach failed, trying fallback method...");

        const nativeImg = new Image();
        nativeImg.crossOrigin = "anonymous";
        nativeImg.onload = () => {
          console.log("Native URL image loaded, creating Fabric.js image...");
          const img = new fabric.Image(nativeImg);
          addUrlImageToCanvas(img);
        };
        nativeImg.onerror = (error) => {
          console.error("URL image loading error:", error);
          toast.error(
            "Failed to load image from URL. This is usually due to CORS policy or invalid URL.", { id: "url-image-load" }
          );
        };
        nativeImg.src = url;
      }
    }, 3000); // Wait 3 seconds for Fabric.js to respond

    // Helper function to add URL image to canvas
    const addUrlImageToCanvas = (img) => {
      // Scale image to reasonable size while maintaining aspect ratio
      const maxWidth = 400;
      const maxHeight = 300;

      if (img.width > maxWidth || img.height > maxHeight) {
        const scaleX = maxWidth / img.width;
        const scaleY = maxHeight / img.height;
        const scale = Math.min(scaleX, scaleY);
        console.log("Scaling URL image by factor:", scale);
        img.scale(scale);
      }

      // Set interactive properties
      img.set({
        selectable: true,
        evented: true,
        lockMovementX: false,
        lockMovementY: false,
        lockScalingX: false,
        lockScalingY: false,
        lockRotation: false,
        hasControls: true,
        hasBorders: true,
        borderColor: "#2563EB",
        cornerColor: "#2563EB",
        cornerStyle: "circle",
        transparentCorners: false,
      });

      // Center the image on canvas
      canvas.centerObject(img);

      // Add to canvas and make active
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.requestRenderAll();

      // Push to history for undo/redo
      pushHistory();

      toast.success("Image loaded successfully!", { id: "url-image-load" });
      console.log("URL image added to canvas successfully!");
    };
  };

  const addShape = (type) => {
    const fabric = fabricRef.current;
    if (!fabric || !fabricCanvas.current) return;
    let shape;
    const options = {
      left: 150,
      top: 150,
      width: 120,
      height: 120,
      fill: "#cccccc",
    };
    switch (type) {
      case "rect":
        shape = new fabric.Rect(options);
        break;
      case "circle":
        shape = new fabric.Circle({ ...options, radius: 60 });
        break;
      case "star": {
        const points = [
          { x: 50, y: 0 },
          { x: 61, y: 35 },
          { x: 98, y: 35 },
          { x: 68, y: 57 },
          { x: 79, y: 91 },
          { x: 50, y: 70 },
          { x: 21, y: 91 },
          { x: 32, y: 57 },
          { x: 2, y: 35 },
          { x: 39, y: 35 },
        ];
        shape = new fabric.Polygon(points, { ...options });
        break;
      }
      case "triangle":
        shape = new fabric.Triangle(options);
        break;
      default:
        return;
    }
    addObjectToCanvas(shape);
  };

  const clearCanvas = () => {
    const canvas = fabricCanvas.current;
    if (!canvas) return;

    // Reset all objects and background safely for Fabric v5
    canvas.clear();

    // In Fabric v5, use setBackgroundColor via the options API or assign + renderAll
    canvas.backgroundColor = "#ffffff";
    if (typeof canvas.requestRenderAll === "function") {
      canvas.requestRenderAll();
    } else {
      canvas.renderAll();
    }
  };

  const cloneObject = useCallback(async () => {
    const canvas = fabricCanvas.current;
    const obj = canvas?.getActiveObject();
    if (!obj) return;

    try {
      const cloned = await obj.clone();
      cloned.set({ left: obj.left + 12, top: obj.top + 12 });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.requestRenderAll();
      pushHistory();
    } catch (err) {
      console.error("Error cloning object:", err);
    }
  }, [pushHistory]);

  // Update the ref after cloneObject is defined
  cloneObjectRef.current = cloneObject;

  const bringToFront = useCallback(() => {
    const canvas = fabricCanvas.current;
    const obj = canvas?.getActiveObject();
    if (!obj) return;
    canvas.bringObjectToFront(obj);
    canvas.requestRenderAll();
    pushHistory();
  }, [pushHistory]);

  const bringForward = useCallback(() => {
    const canvas = fabricCanvas.current;
    const obj = canvas?.getActiveObject();
    if (!obj) return;
    canvas.bringObjectForward(obj);
    canvas.requestRenderAll();
    pushHistory();
  }, [pushHistory]);

  const sendBackward = useCallback(() => {
    const canvas = fabricCanvas.current;
    const obj = canvas?.getActiveObject();
    if (!obj) return;
    canvas.sendObjectBackwards(obj);
    canvas.requestRenderAll();
    pushHistory();
  }, [pushHistory]);

  const sendToBack = useCallback(() => {
    const canvas = fabricCanvas.current;
    const obj = canvas?.getActiveObject();
    if (!obj) return;
    canvas.sendObjectToBack(obj);
    canvas.requestRenderAll();
    pushHistory();
  }, [pushHistory]);

  const deleteObject = useCallback(() => {
    const canvas = fabricCanvas.current;
    const obj = canvas?.getActiveObject();
    if (!obj) return;
    canvas.remove(obj);
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    pushHistory();
  }, [pushHistory]);

  const alignObject = useCallback(
    (edge) => {
      const canvas = fabricCanvas.current;
      const obj = canvas?.getActiveObject();
      if (!obj) return;
      switch (edge) {
        case "left":
          obj.set("left", 0);
          break;
        case "h-center":
          obj.set(
            "left",
            (canvas.width / canvas.getZoom() - obj.getScaledWidth()) / 2,
          );
          break;
        case "right":
          obj.set(
            "left",
            canvas.width / canvas.getZoom() - obj.getScaledWidth(),
          );
          break;
        case "top":
          obj.set("top", 0);
          break;
        case "v-center":
          obj.set(
            "top",
            (canvas.height / canvas.getZoom() - obj.getScaledHeight()) / 2,
          );
          break;
        case "bottom":
          obj.set(
            "top",
            canvas.height / canvas.getZoom() - obj.getScaledHeight(),
          );
          break;
        default:
          break;
      }
      canvas.requestRenderAll();
      pushHistory();
    },
    [pushHistory],
  );

  const updateProperty = useCallback(
    (prop, value) => {
      const obj = fabricCanvas.current?.getActiveObject();
      if (obj) {
        obj.set(prop, value);
        fabricCanvas.current.requestRenderAll();
        setForceUpdate((f) => f + 1);
        pushHistory();
      }
    },
    [pushHistory],
  );

  const downloadPDF = () => {
    const canvas = fabricCanvas.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 1,
    });

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [BASE_WIDTH, BASE_HEIGHT],
    });

    doc.addImage(dataUrl, "PNG", 0, 0, BASE_WIDTH, BASE_HEIGHT);
    doc.save("certificate.pdf");
  };

  const downloadTemplateJson = () => {
    const canvas = fabricCanvas.current;
    if (!canvas) return;

    const name = prompt(
      "Enter a filename for the template (e.g., 'formal-award'):",
    );
    if (!name) return;

    const json = JSON.stringify(canvas.toJSON(), null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert(`Template data for "${name}.json" has been downloaded.`);
  };

  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file for the background.");
      e.target.value = "";
      return;
    }

    // Validate file size (max 15MB for background)
    if (file.size > 15 * 1024 * 1024) {
      toast.error(
        "Background image file is too large. Please select an image smaller than 15MB.",
      );
      e.target.value = "";
      return;
    }

    setIsUploadingBackground(true);

    const reader = new FileReader();
    reader.onload = (f) => {
      const dataUrl = f.target.result;
      const fabric = fabricRef.current;
      const canvas = fabricCanvas.current;

      if (!fabric || !canvas) {
        toast.error("Canvas is not ready. Please try again.");
        console.error("Fabric or canvas not ready for background image");
        setIsUploadingBackground(false);
        return;
      }

      console.log("Creating background Fabric.js image from data URL...");

      // Try the standard Fabric.js approach first
      let backgroundLoaded = false;

      fabric.Image.fromURL(
        dataUrl,
        (img) => {
          backgroundLoaded = true;
          console.log("Background Fabric.js image callback executed", img);
          setIsUploadingBackground(false);

          if (!img) {
            toast.error(
              "Failed to load background image. Please try a different image file.",
            );
            console.error(
              "Failed to create background image - img is null/undefined",
            );
            return;
          }

          console.log(
            "Background image loaded successfully:",
            img.width,
            "x",
            img.height,
          );
          setBackgroundImage(img);
        },
        {
          crossOrigin: "anonymous",
        },
      );

      // Fallback: Use native Image object if Fabric.js fails
      setTimeout(() => {
        if (!backgroundLoaded) {
          console.log(
            "Background Fabric.js approach failed, trying fallback method...",
          );

          const nativeImg = new Image();
          nativeImg.crossOrigin = "anonymous";
          nativeImg.onload = () => {
            console.log(
              "Native background image loaded, creating Fabric.js image...",
            );
            const img = new fabric.Image(nativeImg);
            setIsUploadingBackground(false);
            setBackgroundImage(img);
          };
          nativeImg.onerror = () => {
            setIsUploadingBackground(false);
            toast.error(
              "Failed to load background image. Please try a different image file.",
            );
            console.error(
              "Both Fabric.js and native background image loading failed",
            );
          };
          nativeImg.src = dataUrl;
        }
      }, 2000); // Wait 2 seconds for Fabric.js to respond

      // Add a timeout to reset loading state if callback never executes
      setTimeout(() => {
        if (!backgroundLoaded) {
          setIsUploadingBackground(false);
          console.warn(
            "Background image upload timed out - resetting loading state",
          );
          toast.error("Background image upload timed out. Please try again.");
        }
      }, 15000); // 15 second timeout

      // Helper function to set background image
      const setBackgroundImage = (img) => {
        // Calculate the scaling factors to cover the entire canvas
        const scaleX = canvas.width / img.width;
        const scaleY = canvas.height / img.height;
        const scale = Math.max(scaleX, scaleY);
        console.log("Background scaling factor:", scale);

        // Center the image
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        img.set({
          scaleX: scale,
          scaleY: scale,
          originX: "center",
          originY: "center",
          left: centerX,
          top: centerY,
        });

        // Try the correct Fabric.js method for setting background image
        if (typeof canvas.setBackgroundImage === "function") {
          canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
        } else {
          // Fallback for different Fabric.js versions
          canvas.backgroundImage = img;
          canvas.renderAll();
        }

        // Push to history for undo/redo
        pushHistory();

        console.log("Background image set successfully!");
      };
    };

    reader.onerror = (error) => {
      setIsUploadingBackground(false);
      toast.error("Error reading the background image file. Please try again.");
      console.error("Error reading background file:", error);
    };

    reader.readAsDataURL(file);

    // Clear the input
    e.target.value = "";
  };

  const handleSaveAndReturn = () => {
    if (onSave) {
      // Get current canvas state
      const canvas = fabricCanvas.current;
      if (canvas) {
        const canvasData = canvas.toJSON();
        onSave(canvasData);
      } else {
        onSave();
      }
    }
  };

  const handleBackToGallery = () => {
    if (onBack) {
      onBack();
    }
  };

  const handleSaveTemplateToDatabase = async () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    try {
      setIsSavingTemplate(true);
      const canvas = fabricCanvas.current;

      // Generate thumbnail
      const thumbnail = canvas.toDataURL({
        format: "png",
        quality: 0.8,
        multiplier: 0.5, // Smaller thumbnail
      });

      const canvasData = canvas.toJSON();

      const response = await axios.post(
        "/api/certificates/templates",
        {
          name: templateName,
          description: templateDescription,
          canvasData,
          thumbnail,
          isPublic: false, // Default to private
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        toast.success("Template saved successfully!");
        setShowSaveTemplateModal(false);
        setTemplateName("");
        setTemplateDescription("");

        // Clear canvas after save
        if (canvas) {
          canvas.clear();
          canvas.backgroundColor = "#ffffff";
          canvas.renderAll();
          pushHistory();
        }
      }
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error(error.response?.data?.message || "Failed to save template");
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const togglePanels = () => {
    setShowPanels(!showPanels);
  };

  const PropertiesPanel = () => {
    const isObjectSelected = !!activeObject;
    const isText =
      isObjectSelected && ["textbox", "i-text"].includes(activeObject.type);
    const isShape =
      isObjectSelected &&
      ["rect", "circle", "triangle", "polygon"].includes(activeObject.type);
    const isImage = isObjectSelected && activeObject.type === "image";

    const getProp = (prop, fallback) => activeObject?.get(prop) ?? fallback;

    return (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">
            Certificate Size (Landscape Only)
          </h4>
          <select
            value={certificateSize}
            onChange={(e) => setCertificateSize(e.target.value)}
            className="w-full p-2 border rounded-md text-sm"
          >
            {Object.keys(CERTIFICATE_SIZES).map((size) => (
              <option key={size} value={size}>
                {size} (Landscape)
              </option>
            ))}
          </select>
        </div>

        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Position</h4>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-1">
            <button
              disabled={!isObjectSelected}
              onClick={() => alignObject("left")}
              className="p-2 border rounded-md hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
              title="Align Left"
            >
              <AlignHorizontalJustifyStart className="w-4 h-4" />
            </button>
            <button
              disabled={!isObjectSelected}
              onClick={() => alignObject("h-center")}
              className="p-2 border rounded-md hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
              title="Align Center Horizontal"
            >
              <AlignHorizontalJustifyCenter className="w-4 h-4" />
            </button>
            <button
              disabled={!isObjectSelected}
              onClick={() => alignObject("right")}
              className="p-2 border rounded-md hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
              title="Align Right"
            >
              <AlignHorizontalJustifyEnd className="w-4 h-4" />
            </button>
            <button
              disabled={!isObjectSelected}
              onClick={() => alignObject("top")}
              className="p-2 border rounded-md hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
              title="Align Top"
            >
              <AlignVerticalJustifyStart className="w-4 h-4" />
            </button>
            <button
              disabled={!isObjectSelected}
              onClick={() => alignObject("v-center")}
              className="p-2 border rounded-md hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
              title="Align Center Vertical"
            >
              <AlignVerticalJustifyCenter className="w-4 h-4" />
            </button>
            <button
              disabled={!isObjectSelected}
              onClick={() => alignObject("bottom")}
              className="p-2 border rounded-md hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
              title="Align Bottom"
            >
              <AlignVerticalJustifyEnd className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Layer</h4>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-1">
            <button
              disabled={!isObjectSelected}
              onClick={cloneObject}
              className="p-2 border rounded-md hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
              title="Duplicate (Ctrl/Cmd+D)"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              disabled={!isObjectSelected}
              onClick={bringToFront}
              className="p-2 border rounded-md hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
              title="Bring to Front"
            >
              <ChevronsUp className="w-4 h-4" />
            </button>
            <button
              disabled={!isObjectSelected}
              onClick={bringForward}
              className="p-2 border rounded-md hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
              title="Bring Forward"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              disabled={!isObjectSelected}
              onClick={sendBackward}
              className="p-2 border rounded-md hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
              title="Send Backward"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              disabled={!isObjectSelected}
              onClick={sendToBack}
              className="p-2 border rounded-md hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
              title="Send to Back"
            >
              <ChevronsDown className="w-4 h-4" />
            </button>
            <button
              disabled={!isObjectSelected}
              onClick={deleteObject}
              className="p-2 border rounded-md hover:bg-red-50 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 text-red-600 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          <h4
            className={`font-semibold mb-2 ${!isText && isObjectSelected ? "text-gray-400" : "text-gray-700"
              }`}
          >
            Text
          </h4>
          <div className="flex flex-col sm:flex-row gap-2 mb-2">
            <select
              disabled={!isText}
              value={getProp("fontFamily", "Inter")}
              onChange={(e) => updateProperty("fontFamily", e.target.value)}
              className="flex-1 p-2 border rounded-md text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option>Inter</option>
              <option>Arial</option>
              <option>Times New Roman</option>
              <option>Courier New</option>
            </select>
            <input
              disabled={!isText}
              type="number"
              value={getProp("fontSize", 24)}
              onChange={(e) =>
                updateProperty("fontSize", parseInt(e.target.value, 10) || 1)
              }
              className="w-full sm:w-20 p-2 border rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <div className="grid grid-cols-4 gap-1 mb-2">
            <button
              disabled={!isText}
              onClick={() =>
                updateProperty(
                  "fontWeight",
                  getProp("fontWeight", "normal") === "bold"
                    ? "normal"
                    : "bold",
                )
              }
              className={`p-2 border rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors hover:bg-gray-50 ${getProp("fontWeight", "normal") === "bold"
                ? "bg-blue-100 border-blue-500"
                : ""
                }`}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              disabled={!isText}
              onClick={() =>
                updateProperty(
                  "fontStyle",
                  getProp("fontStyle", "normal") === "italic"
                    ? "normal"
                    : "italic",
                )
              }
              className={`p-2 border rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors hover:bg-gray-50 ${getProp("fontStyle", "normal") === "italic"
                ? "bg-blue-100 border-blue-500"
                : ""
                }`}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              disabled={!isText}
              onClick={() =>
                updateProperty("underline", !getProp("underline", false))
              }
              className={`p-2 border rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors hover:bg-gray-50 ${getProp("underline", false) ? "bg-blue-100 border-blue-500" : ""
                }`}
              title="Underline"
            >
              <Underline className="w-4 h-4" />
            </button>
            <input
              disabled={!isText}
              type="color"
              value={getProp("fill", "#000000")}
              onChange={(e) => updateProperty("fill", e.target.value)}
              className="w-full h-full p-1 border-gray-300 rounded-md cursor-pointer disabled:cursor-not-allowed"
              title="Text Color"
            />
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button
              disabled={!isText}
              onClick={() => updateProperty("textAlign", "left")}
              className={`p-2 border rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors hover:bg-gray-50 ${getProp("textAlign", "left") === "left"
                ? "bg-blue-100 border-blue-500"
                : ""
                }`}
              title="Align Text Left"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              disabled={!isText}
              onClick={() => updateProperty("textAlign", "center")}
              className={`p-2 border rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors hover:bg-gray-50 ${getProp("textAlign", "center") === "center"
                ? "bg-blue-100 border-blue-500"
                : ""
                }`}
              title="Align Text Center"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              disabled={!isText}
              onClick={() => updateProperty("textAlign", "right")}
              className={`p-2 border rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors hover:bg-gray-50 ${getProp("textAlign", "right") === "right"
                ? "bg-blue-100 border-blue-500"
                : ""
                }`}
              title="Align Text Right"
            >
              <AlignRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          <h4
            className={`font-semibold mb-2 ${!isShape && !isImage && isObjectSelected
              ? "text-gray-400"
              : "text-gray-700"
              }`}
          >
            Color
          </h4>
          <input
            disabled={!isShape && !isImage}
            type="color"
            value={getProp("fill", "#cccccc")}
            onChange={(e) => updateProperty("fill", e.target.value)}
            className="w-full h-10 p-1 border-gray-300 rounded-md cursor-pointer disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Quick Actions</h4>
          <div className="flex gap-2">
            <button
              onClick={undo}
              className="flex-1 px-3 py-2 border rounded-md hover:bg-gray-100 transition-colors text-sm"
              title="Undo (Ctrl/Cmd+Z)"
            >
              Undo
            </button>
            <button
              onClick={redo}
              className="flex-1 px-3 py-2 border rounded-md hover:bg-gray-100 transition-colors text-sm"
              title="Redo (Ctrl/Cmd+Y)"
            >
              Redo
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <button
              onClick={downloadPDF}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Download PDF
            </button>
            <button
              onClick={downloadTemplateJson}
              className="px-3 py-2 border rounded-md hover:bg-gray-100 transition-colors text-sm whitespace-nowrap"
            >
              Download JSON
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="w-full h-screen bg-transparent font-sans overflow-hidden"
      style={{ overflowX: "hidden" }}
    >
      <div
        className="flex flex-col lg:flex-row h-full w-full overflow-hidden"
        style={{ overflowX: "hidden" }}
      >
        {/* Left Sidebar - Elements Panel */}
        {showPanels && !isMobile && (
          <div className="w-full lg:w-60 xl:w-72 2xl:w-80 p-3 lg:p-4 flex flex-col gap-3 bg-white border-b lg:border-r lg:border-b-0 shrink-0 overflow-y-auto max-h-screen">
            {/* Back to Gallery button - only in preview mode */}
            {isPreviewMode && (
              <button
                onClick={handleBackToGallery}
                className="flex items-center justify-center w-8 h-8 text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors mb-2"
                title="Back to Gallery"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <ElementsPanel
              onAddText={addText}
              onAddImage={handleImageUpload}
              onAddImageFromUrl={addImageFromUrl}
              onAddShape={addShape}
              onSetBackgroundImage={handleBackgroundUpload}
              fileInputRef={fileInputRef}
              bgInputRef={bgInputRef}
              isUploadingImage={isUploadingImage}
              isUploadingBackground={isUploadingBackground}
            />
          </div>
        )}

        {/* Main Canvas Area */}
        <div
          className={`flex-1 flex flex-col min-w-0 max-w-full overflow-hidden overflow-x-hidden ${isMobile ? "pb-16" : ""
            }`}
        >
          {/* Top Toolbar */}
          <div className="relative shrink-0 bg-white border-b z-10">
            <CanvasToolbar
              showPanels={showPanels}
              onTogglePanels={togglePanels}
              isMobile={isMobile}
            />
          </div>

          {/* Canvas Container */}
          <div
            ref={wrapperRef}
            className={`flex-1 flex items-start justify-center bg-gray-100 overflow-hidden overflow-x-hidden ${isMobile ? "p-2 pt-2" : "p-2 pt-2"
              }`}
          >
            <div
              ref={canvasContainerRef}
              className="bg-white shadow-2xl rounded-2xl relative max-w-full max-h-full overflow-hidden"
              style={{ width: "fit-content", height: "fit-content" }}
            >
              <canvas ref={canvasRef} />

              {/* Snap Lines Overlay */}
              {snapLines.length > 0 && fabricCanvas.current && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                >
                  {(() => {
                    const canvas = fabricCanvas.current;
                    const vpt = canvas.viewportTransform;
                    if (!vpt) return null;

                    const scale = vpt[0]; // scaleX
                    const offsetX = vpt[4];
                    const offsetY = vpt[5];

                    return snapLines.map((line, index) => {
                      const scaledPosition = line.position * scale;
                      const adjustedPosition =
                        scaledPosition +
                        (line.type === "vertical" ? offsetX : offsetY);

                      return (
                        <div
                          key={`${line.type}-${line.position}-${index}`}
                          className={`absolute bg-red-500 ${line.type === "vertical"
                            ? "w-px h-full"
                            : "h-px w-full"
                            }`}
                          style={{
                            ...(line.type === "vertical"
                              ? { left: `${adjustedPosition}px` }
                              : { top: `${adjustedPosition}px` }),
                            opacity: 0.8,
                            zIndex: 1000,
                          }}
                        >
                          {/* Snap point indicator */}
                          <div
                            className="absolute bg-red-500 rounded-full w-2 h-2 -translate-x-1 -translate-y-1"
                            style={{
                              ...(line.type === "vertical"
                                ? { left: "0px", top: "50%" }
                                : { top: "0px", left: "50%" }),
                            }}
                          />
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties Panel */}
        {showPanels && !isMobile && (
          <div className="w-full lg:w-60 xl:w-72 2xl:w-80 p-3 lg:p-4 flex flex-col gap-3 bg-white border-t lg:border-l lg:border-t-0 shrink-0 overflow-hidden max-h-screen">
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="flex items-center justify-between mb-3 sticky top-0 z-30 bg-white pb-2">
                <h3 className="text-sm font-semibold text-gray-700">
                  Properties
                </h3>
                {/* Done/Save button - "Done" when linking, "Save as Template" when creating */}
                {(isPreviewMode ||
                  (isFromEvaluation && (onDone || onSave)) ||
                  !isFromEvaluation) && (
                    <button
                      onClick={
                        isFromEvaluation
                          ? isPreviewMode
                            ? handleSaveAndReturn
                            : onSave || onDone
                          : () => setShowSaveTemplateModal(true)
                      }
                      className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 shadow-sm transition-colors"
                    >
                      {isFromEvaluation ? "Done" : "Save as Template"}
                    </button>
                  )}
              </div>
              <PropertiesPanel />
            </div>
            <div className="shrink-0 pb-35">
              <button
                onClick={clearCanvas}
                className="w-full px-4 py-2 bg-white border border-gray-300 text-sm text-gray-700 rounded-md hover:bg-gray-100 text-center transition-colors"
              >
                Clear Canvas
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Panels Overlay */}
      {/* Mobile Bottom Bar */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center h-16 z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <button
            onClick={() =>
              setActiveMobileTab(
                activeMobileTab === "elements" ? null : "elements",
              )
            }
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeMobileTab === "elements" ? "text-blue-600" : "text-gray-600"
              }`}
          >
            <Plus className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Add Elements</span>
          </button>
          <div className="w-px h-8 bg-gray-200"></div>
          <button
            onClick={() =>
              setActiveMobileTab(
                activeMobileTab === "properties" ? null : "properties",
              )
            }
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeMobileTab === "properties"
              ? "text-blue-600"
              : "text-gray-600"
              }`}
          >
            <Sliders className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Properties</span>
          </button>
        </div>
      )}

      {/* Mobile Bottom Sheet */}
      {isMobile && activeMobileTab && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setActiveMobileTab(null)}
        >
          <div
            className="bg-white rounded-t-2xl shadow-2xl w-full max-h-[50vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-800">
                {activeMobileTab === "elements" ? "Add Elements" : "Properties"}
              </h3>
              <button
                onClick={() => setActiveMobileTab(null)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-white">
              {activeMobileTab === "elements" ? (
                <ElementsPanel
                  onAddText={addText}
                  onAddImage={handleImageUpload}
                  onAddImageFromUrl={addImageFromUrl}
                  onAddShape={addShape}
                  onSetBackgroundImage={handleBackgroundUpload}
                  fileInputRef={fileInputRef}
                  bgInputRef={bgInputRef}
                  isUploadingImage={isUploadingImage}
                  isUploadingBackground={isUploadingBackground}
                />
              ) : (
                <PropertiesPanel />
              )}
            </div>
          </div>
        </div>
      )}
      {/* Save Template Modal */}
      {showSaveTemplateModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Save as Template
                </h3>
                <button
                  onClick={() => setShowSaveTemplateModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g., Annual Award 2024"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    maxLength={100}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description{" "}
                    <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <textarea
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Brief description of this template..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none h-24"
                    maxLength={500}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowSaveTemplateModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                  disabled={isSavingTemplate}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTemplateToDatabase}
                  disabled={isSavingTemplate || !templateName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {isSavingTemplate ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Template"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateEditor;

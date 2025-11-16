import { useState, useEffect, useRef, useCallback } from "react";
import { useCanvasHistory } from "../../../hooks/useCanvasHistory";
import ElementsPanel from "./ElementsPanel";
import CanvasToolbar from "./CanvasToolbar";
import CanvasContainer from "./CanvasContainer";
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
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  ArrowLeft,
  Save,
  Eye,
  Edit3,
} from "lucide-react";

import { jsPDF } from "jspdf";

const CERTIFICATE_SIZES = {
  // Force all sizes to landscape orientation
  "US Letter": { width: 1056, height: 816 }, // 11" x 8.5" landscape at 96 DPI
  A4: { width: 1123, height: 794 }, // 297mm x 210mm landscape at 96 DPI
};

const CertificateEditor = ({
  initialData,
  selectedTemplate = null,
  isPreviewMode = false,
  isFromEvaluation = false,
  formId = null,
  onSave,
  onBack,
  onDone,
}) => {
  const [certificateSize, setCertificateSize] = useState("US Letter");
  const [showPanels, setShowPanels] = useState(true);

  const BASE_WIDTH = CERTIFICATE_SIZES[certificateSize].width;
  const BASE_HEIGHT = CERTIFICATE_SIZES[certificateSize].height;
  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const fabricCanvas = useRef(null);
  const fabricRef = useRef(null);
  const fileInputRef = useRef(null);
  const bgInputRef = useRef(null);

  const [activeObject, setActiveObject] = useState(null);
  const [, setForceUpdate] = useState(0);

  const { pushHistory, undo, redo } = useCanvasHistory();

  // Create refs for functions to prevent unnecessary re-initialization
  const cloneObjectRef = useRef();

  // Create ref to track container for cleanup
  const containerRef = useRef(null);

  useEffect(() => {
    let resizeObserver = null;
    let mounted = true;

    // Capture container at effect start
    const container = containerRef.current;

    const initFabric = async () => {
      // Ensure clean canvas element before initialization
      const canvasEl = canvasRef.current;
      if (!canvasEl) return;

      // Clear any existing canvas content
      canvasEl.innerHTML = "";

      // Move calculation inside effect to properly handle dependencies
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
         * Fit the logical certificate canvas into the visible container and center it.
         */
        const centerAndFitCanvas = () => {
          if (!safeHasCanvas()) return;
          const container = canvasContainerRef.current;
          if (!container) return;

          const padding = 40; // visual margin inside container
          const availableWidth = Math.max(
            container.clientWidth - padding * 2,
            100
          );
          const availableHeight = Math.max(
            container.clientHeight - padding * 2,
            100
          );

          const scaleX = availableWidth / BASE_WIDTH;
          const scaleY = availableHeight / BASE_HEIGHT;
          const scale = Math.min(scaleX, scaleY, 1); // do not upscale above 1

          const offsetX = (container.clientWidth - BASE_WIDTH * scale) / 2;
          const offsetY = (container.clientHeight - BASE_HEIGHT * scale) / 2;

          try {
            if (!safeHasCanvas()) return;
            canvas.setViewportTransform([scale, 0, 0, scale, offsetX, offsetY]);
            canvas.requestRenderAll();
          } catch (err) {
            console.warn(
              "CertificateEditor centerAndFitCanvas error (ignored):",
              err
            );
          }
        };

        const handleResize = () => {
          if (!safeHasCanvas()) return;
          const container = canvasContainerRef.current;
          if (!container) return;

          try {
            // Keep logical size fixed for tools/alignments
            canvas.setWidth(BASE_WIDTH);
            canvas.setHeight(BASE_HEIGHT);
            centerAndFitCanvas();
          } catch (err) {
            console.warn(
              "CertificateEditor handleResize error (ignored):",
              err
            );
          }
        };

        // Initial fit/center
        handleResize();

        // Observe container size changes (including panel toggles/layout)
        if (typeof ResizeObserver !== "undefined") {
          resizeObserver = new ResizeObserver(() => {
            // Guard every callback so Fabric internals never crash the app
            try {
              handleResize();
            } catch (err) {
              console.warn(
                "CertificateEditor ResizeObserver callback error (ignored):",
                err
              );
            }
          });
          if (canvasContainerRef.current) {
            resizeObserver.observe(canvasContainerRef.current);
          }
        }

        const updateSelection = () => {
          setActiveObject(canvas.getActiveObject());
          setForceUpdate((f) => f + 1);
        };

        canvas.on({
          "object:modified": updateSelection,
          "object:added": updateSelection,
          "object:removed": updateSelection,
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

        canvas.on("object:moving", (e) => {
          const obj = e.target;
          if (!obj) return;
          const snap = 8;
          const objCenterX = obj.left + obj.getScaledWidth() / 2;
          const canvasCenterX = canvas.getWidth() / 2;
          if (Math.abs(objCenterX - canvasCenterX) < snap) {
            obj.left = canvasCenterX - obj.getScaledWidth() / 2;
          }
          const objCenterY = obj.top + obj.getScaledHeight() / 2;
          const canvasCenterY = canvas.getHeight() / 2;
          if (Math.abs(objCenterY - canvasCenterY) < snap) {
            obj.top = canvasCenterY - obj.getScaledHeight() / 2;
          }
        });

        if (initialData) {
          canvas.loadFromJSON(initialData, () => {
            // Ensure all objects/backgrounds/borders are laid out on the logical canvas
            canvas.renderAll();
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
            if (resizeObserver && containerRef.current) {
              resizeObserver.unobserve(containerRef.current);
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
          if (resizeObserver && containerRef.current) {
            resizeObserver.unobserve(containerRef.current);
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
  }, [certificateSize, initialData, pushHistory, redo, undo]);

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
      const text = new fabric.Textbox(
        isHeadline ? "Click to edit headline" : "Click to edit body text",
        {
          left: 100,
          top: 100,
          fontSize: isHeadline ? 48 : 24,
          fill: "#000",
          fontFamily: "Inter, Arial",
          width: isHeadline ? 400 : 300,
          editable: true,
        }
      );
      addObjectToCanvas(text);
    },
    [addObjectToCanvas]
  );

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (f) => {
      const fabric = fabricRef.current;
      if (!fabric) return;
      fabric.Image.fromURL(
        f.target.result,
        (img) => {
          img.scaleToWidth(300);
          fabricCanvas.current.centerObject(img);
          addObjectToCanvas(img);
        },
        { crossOrigin: "anonymous" }
      );
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const addImageFromUrl = () => {
    const url = prompt("Enter image URL (must allow cross-origin)");
    if (!url) return;
    const fabric = fabricRef.current;
    if (!fabric) return;
    fabric.Image.fromURL(
      url,
      (img) => {
        img.scaleToWidth(300);
        fabricCanvas.current.centerObject(img);
        addObjectToCanvas(img);
      },
      { crossOrigin: "anonymous" }
    );
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

  const cloneObject = useCallback(() => {
    const canvas = fabricCanvas.current;
    const obj = canvas?.getActiveObject();
    if (!obj) return;
    obj.clone((cloned) => {
      cloned.set({ left: obj.left + 12, top: obj.top + 12 });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
    });
  }, []);

  // Update the ref after cloneObject is defined
  cloneObjectRef.current = cloneObject;

  const bringForward = useCallback(
    () =>
      fabricCanvas.current?.bringForward(
        fabricCanvas.current.getActiveObject()
      ),
    []
  );

  const sendBackward = useCallback(
    () =>
      fabricCanvas.current?.sendBackwards(
        fabricCanvas.current.getActiveObject()
      ),
    []
  );

  const deleteObject = useCallback(
    () => fabricCanvas.current?.remove(fabricCanvas.current.getActiveObject()),
    []
  );

  const alignObject = useCallback((edge) => {
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
          (canvas.width / canvas.getZoom() - obj.getScaledWidth()) / 2
        );
        break;
      case "right":
        obj.set("left", canvas.width / canvas.getZoom() - obj.getScaledWidth());
        break;
      case "top":
        obj.set("top", 0);
        break;
      case "v-center":
        obj.set(
          "top",
          (canvas.height / canvas.getZoom() - obj.getScaledHeight()) / 2
        );
        break;
      case "bottom":
        obj.set(
          "top",
          canvas.height / canvas.getZoom() - obj.getScaledHeight()
        );
        break;
      default:
        break;
    }
    canvas.requestRenderAll();
  }, []);

  const updateProperty = useCallback((prop, value) => {
    const obj = fabricCanvas.current?.getActiveObject();
    if (obj) {
      obj.set(prop, value);
      fabricCanvas.current.requestRenderAll();
      setForceUpdate((f) => f + 1);
    }
  }, []);

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
      "Enter a filename for the template (e.g., 'formal-award'):"
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
    const reader = new FileReader();
    reader.onload = (f) => {
      const fabric = fabricRef.current;
      if (!fabric || !fabricCanvas.current) return;
      fabric.Image.fromURL(
        f.target.result,
        (img) => {
          // Calculate the scaling factors
          const scaleX = fabricCanvas.current.width / img.width;
          const scaleY = fabricCanvas.current.height / img.height;
          const scale = Math.max(scaleX, scaleY); // Use max to cover the entire canvas

          // Center the image
          const centerX = fabricCanvas.current.width / 2;
          const centerY = fabricCanvas.current.height / 2;

          img.set({
            scaleX: scale,
            scaleY: scale,
            originX: "center",
            originY: "center",
            left: centerX,
            top: centerY,
          });

          fabricCanvas.current.setBackgroundImage(
            img,
            fabricCanvas.current.renderAll.bind(fabricCanvas.current)
          );
        },
        { crossOrigin: "anonymous" }
      );
    };
    reader.readAsDataURL(file);
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
        {/* Preview Mode Header */}
        {isPreviewMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-blue-800">
              <Eye size={16} />
              <span className="font-medium text-sm">Preview Mode</span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              You can edit this template. Click "Done" to apply it.
            </p>
          </div>
        )}

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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1">
            <button
              disabled={!isObjectSelected}
              onClick={() => alignObject("left")}
              className="p-1.5 sm:p-2 border rounded-md hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              <AlignHorizontalJustifyStart size={14} sm={{ size: 16 }} />
            </button>
            <button
              disabled={!isObjectSelected}
              onClick={() => alignObject("h-center")}
              className="p-2 border rounded-md hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              <AlignHorizontalJustifyCenter size={16} />
            </button>
            <button
              disabled={!isObjectSelected}
              onClick={() => alignObject("right")}
              className="p-2 border rounded-md hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              <AlignHorizontalJustifyEnd size={16} />
            </button>
            <button
              disabled={!isObjectSelected}
              onClick={() => alignObject("top")}
              className="p-2 border rounded-md hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              <AlignVerticalJustifyStart size={16} />
            </button>
            <button
              disabled={!isObjectSelected}
              onClick={() => alignObject("v-center")}
              className="p-2 border rounded-md hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              <AlignVerticalJustifyCenter size={16} />
            </button>
            <button
              disabled={!isObjectSelected}
              onClick={() => alignObject("bottom")}
              className="p-2 border rounded-md hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              <AlignVerticalJustifyEnd size={16} />
            </button>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Layer</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
            <button
              disabled={!isObjectSelected}
              onClick={cloneObject}
              className="p-1.5 sm:p-2 border rounded-md hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
              title="Duplicate (Ctrl/Cmd+D)"
            >
              <Copy size={14} className="sm:w-4 sm:h-4" />
            </button>
            <button
              disabled={!isObjectSelected}
              onClick={bringForward}
              className="p-2 border rounded-md hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              <ChevronUp size={16} />
            </button>
            <button
              disabled={!isObjectSelected}
              onClick={sendBackward}
              className="p-2 border rounded-md hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              <ChevronDown size={16} />
            </button>
            <button
              disabled={!isObjectSelected}
              onClick={deleteObject}
              className="p-2 border rounded-md hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div>
          <h4
            className={`font-semibold mb-2 ${
              !isText && isObjectSelected ? "text-gray-400" : "text-gray-700"
            }`}
          >
            Text
          </h4>
          <div className="flex gap-2 mb-2">
            <select
              disabled={!isText}
              value={getProp("fontFamily", "Inter")}
              onChange={(e) => updateProperty("fontFamily", e.target.value)}
              className="flex-1 p-2 border rounded-md text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option>Inter</option> <option>Arial</option>{" "}
              <option>Times New Roman</option> <option>Courier New</option>
            </select>
            <input
              disabled={!isText}
              type="number"
              value={getProp("fontSize", 24)}
              onChange={(e) =>
                updateProperty("fontSize", parseInt(e.target.value, 10) || 1)
              }
              className="w-20 p-2 border rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 mb-2">
            <button
              disabled={!isText}
              onClick={() =>
                updateProperty(
                  "fontWeight",
                  getProp("fontWeight", "normal") === "bold" ? "normal" : "bold"
                )
              }
              className={`p-1.5 sm:p-2 border rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 ${
                getProp("fontWeight", "normal") === "bold" ? "bg-gray-200" : ""
              }`}
            >
              <Bold size={14} className="sm:w-4 sm:h-4" />
            </button>
            <button
              disabled={!isText}
              onClick={() =>
                updateProperty(
                  "fontStyle",
                  getProp("fontStyle", "normal") === "italic"
                    ? "normal"
                    : "italic"
                )
              }
              className={`p-2 border rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 ${
                getProp("fontStyle", "normal") === "italic" ? "bg-gray-200" : ""
              }`}
            >
              <Italic size={16} />
            </button>
            <button
              disabled={!isText}
              onClick={() =>
                updateProperty("underline", !getProp("underline", false))
              }
              className={`p-2 border rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 ${
                getProp("underline", false) ? "bg-gray-200" : ""
              }`}
            >
              <Underline size={16} />
            </button>
            <input
              disabled={!isText}
              type="color"
              value={getProp("fill", "#000000")}
              onChange={(e) => updateProperty("fill", e.target.value)}
              className="w-full h-full p-1 border-gray-300 rounded-md cursor-pointer disabled:cursor-not-allowed"
            />
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button
              disabled={!isText}
              onClick={() => updateProperty("textAlign", "left")}
              className={`p-1.5 sm:p-2 border rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 ${
                getProp("textAlign", "left") === "left" ? "bg-gray-200" : ""
              }`}
            >
              <AlignLeft size={14} className="sm:w-4 sm:h-4" />
            </button>
            <button
              disabled={!isText}
              onClick={() => updateProperty("textAlign", "center")}
              className={`p-1 md:p-2 border rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 ${
                getProp("textAlign", "center") === "center" ? "bg-gray-200" : ""
              }`}
            >
              <AlignCenter size={16} />
            </button>
            <button
              disabled={!isText}
              onClick={() => updateProperty("textAlign", "right")}
              className={`p-1 md:p-2 border rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 ${
                getProp("textAlign", "right") === "right" ? "bg-gray-200" : ""
              }`}
            >
              <AlignRight size={16} />
            </button>
          </div>
        </div>

        <div>
          <h4
            className={`font-semibold mb-2 ${
              !isShape && !isImage && isObjectSelected
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
          <h4 className="font-semibold mb-2">Quick Actions</h4>
          <div className="flex gap-2">
            <button
              onClick={undo}
              className="flex-1 px-3 py-2 border rounded-md hover:bg-gray-100"
            >
              Undo
            </button>
            <button
              onClick={redo}
              className="flex-1 px-3 py-2 border rounded-md hover:bg-gray-100"
            >
              Redo
            </button>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={downloadPDF}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Download PDF
            </button>
            <button
              onClick={downloadTemplateJson}
              className="px-3 py-2 border rounded-md hover:bg-gray-100"
            >
              Download JSON
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-screen bg-transparent font-sans overflow-hidden">
      <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden">
        {/* Left Sidebar - Elements Panel */}
        {showPanels && (
          <div className="w-full lg:w-60 xl:w-64 p-2 sm:p-3 flex flex-col gap-2 sm:gap-3 bg-white border-b lg:border-r lg:border-b-0 shrink-0 h-full lg:h-auto overflow-auto lg:overflow-hidden">
            <ElementsPanel
              onAddText={addText}
              onAddImage={handleImageUpload}
              onAddImageFromUrl={addImageFromUrl}
              onAddShape={addShape}
              onSetBackgroundImage={handleBackgroundUpload}
              fileInputRef={fileInputRef}
              bgInputRef={bgInputRef}
            />
          </div>
        )}

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-hidden lg:overflow-auto lg:min-h-0">
          {/* Top Toolbar */}
          <div className="relative shrink-0 bg-white border-b z-10">
            <CanvasToolbar
              showPanels={showPanels}
              onTogglePanels={togglePanels}
            />
          </div>

          {/* Action Bar - Preview Mode Controls */}
          {isPreviewMode && (
            <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Edit3 size={18} />
                    <span className="font-medium">
                      {selectedTemplate
                        ? `Editing: ${selectedTemplate.name}`
                        : "Editing Template"}
                    </span>
                  </div>
                  {selectedTemplate?.description && (
                    <span className="text-sm text-blue-600">
                      {selectedTemplate.description}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleBackToGallery}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft size={16} />
                    Back to Gallery
                  </button>
                  <button
                    onClick={handleSaveAndReturn}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Save size={16} />
                    Done - Use This Template
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Canvas Container */}
          <div
            className={`flex-1 overflow-hidden flex items-center justify-center bg-gray-100 p-2 sm:p-4 lg:p-6 xl:p-8 ${
              showPanels ? "lg:pr-2 xl:pr-4" : ""
            }`}
          >
            <div
              className={`${
                showPanels
                  ? "w-[96%] sm:w-[95%] lg:w-[88%] xl:w-[90%]"
                  : "w-[98%]"
              } max-w-full h-[65vh] sm:h-[70vh] md:h-[75vh] lg:h-[85vh] xl:h-[80vh] max-h-[85vh] bg-white shadow-2xl rounded-2xl overflow-hidden transition-all duration-300`}
            >
              <CanvasContainer
                canvasRef={canvasRef}
                containerRef={canvasContainerRef}
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties Panel */}
        {showPanels && (
          <div className="w-full lg:w-60 xl:w-64 p-2 sm:p-3 flex flex-col gap-2 sm:gap-3 bg-white border-t lg:border-l lg:border-t-0 shrink-0 h-full lg:h-auto overflow-auto lg:overflow-hidden relative">
            <div className="flex-1 min-h-0 overflow-auto">
              <div className="flex items-center justify-between mb-2 sm:mb-3 sticky top-0 z-30 bg-white pb-1 sm:pb-2">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-700">
                  Properties
                </h3>
                {/* Legacy Done button for evaluation flow */}
                {isFromEvaluation && (onDone || onSave) && (
                  <button
                    onClick={onSave || onDone}
                    className="px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 shadow-sm"
                  >
                    Done
                  </button>
                )}
              </div>
              <PropertiesPanel />
            </div>
            <div className="shrink-0 pt-2">
              <button
                onClick={clearCanvas}
                className="w-full px-3 sm:px-4 py-2 bg-white border border-gray-300 text-sm text-gray-700 rounded-md hover:bg-gray-100 text-center"
              >
                Clear Canvas
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateEditor;

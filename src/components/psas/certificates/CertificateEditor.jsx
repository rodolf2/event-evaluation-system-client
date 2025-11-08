import { useState, useEffect, useRef } from "react";
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
} from "lucide-react";

import { jsPDF } from "jspdf";

const CERTIFICATE_SIZES = {
  "US Letter": { width: 1056, height: 816 }, // 11" x 8.5" at 96 DPI
  "A4": { width: 1123, height: 794 }, // 297mm x 210mm at 96 DPI
};

const CertificateEditor = ({ initialData }) => {
  const [certificateSize, setCertificateSize] = useState("US Letter");
  
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

  useEffect(() => {
    let resizeObserver;
    let mounted = true;

    const initFabric = async () => {
      const fabricModule = await import("fabric");
      const fabric = fabricModule.default || fabricModule;

      if (!mounted || !fabric) return;

      fabricRef.current = fabric;

      const canvasEl = canvasRef.current;
      const canvas = new fabric.Canvas(canvasEl, {
        width: BASE_WIDTH,
        height: BASE_HEIGHT,
        backgroundColor: "#ffffff",
        selection: true,
        preserveObjectStacking: true,
      });
      fabricCanvas.current = canvas;

      /**
       * Fit the logical certificate canvas into the visible container and center it.
       *
       * IMPORTANT:
       * - We treat BASE_WIDTH/BASE_HEIGHT as the canonical certificate size.
       * - Backgrounds/borders are expected to be designed to that size.
       * - We DO NOT try to "fit objects" by their bounds anymore, because
       *   templates with borders/backgrounds are already aligned to the canvas.
       * - We only scale and center the entire canvas surface using viewportTransform.
       */
      const centerAndFitCanvas = () => {
        if (!canvasContainerRef.current || !canvas) return;

        const container = canvasContainerRef.current;
        const padding = 40; // visual margin inside container

        const availableWidth = Math.max(container.clientWidth - padding * 2, 100);
        const availableHeight = Math.max(container.clientHeight - padding * 2, 100);

        const scaleX = availableWidth / BASE_WIDTH;
        const scaleY = availableHeight / BASE_HEIGHT;
        const scale = Math.min(scaleX, scaleY, 1); // do not upscale above 1

        // Center the entire logical canvas inside the container
        const offsetX = (container.clientWidth - BASE_WIDTH * scale) / 2;
        const offsetY = (container.clientHeight - BASE_HEIGHT * scale) / 2;

        canvas.setViewportTransform([scale, 0, 0, scale, offsetX, offsetY]);
        canvas.requestRenderAll();
      };

      const handleResize = () => {
        if (!canvasContainerRef.current || !canvas) return;

        // Keep logical size fixed for tools/alignments
        canvas.setWidth(BASE_WIDTH);
        canvas.setHeight(BASE_HEIGHT);

        centerAndFitCanvas();
      };

      // Initial fit/center
      handleResize();

      // Observe container size changes (including panel toggles/layout)
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      if (canvasContainerRef.current) {
        resizeObserver.observe(canvasContainerRef.current);
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
          cloneObject();
        }
      };
      window.addEventListener("keydown", handleKey);

      return () => {
        window.removeEventListener("keydown", handleKey);
        if (resizeObserver && canvasContainerRef.current) {
          resizeObserver.unobserve(canvasContainerRef.current);
        }
        if (canvas) {
          canvas.dispose();
        }
      };
    };

    let cleanupFn;
    initFabric().then((cleanup) => {
      if (mounted) cleanupFn = cleanup;
    });

    return () => {
      mounted = false;
      if (cleanupFn) cleanupFn();
    };
  }, [pushHistory, initialData]);

  const addObjectToCanvas = (object) => {
    const canvas = fabricCanvas.current;
    if (!canvas) return;
    canvas.add(object);
    canvas.setActiveObject(object);
  };

  const addText = (isHeadline) => {
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
  };

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
    canvas.clear();
    canvas.setBackgroundColor("#fff", canvas.renderAll.bind(canvas));
  };

  const cloneObject = () => {
    const canvas = fabricCanvas.current;
    const obj = canvas?.getActiveObject();
    if (!obj) return;
    obj.clone((cloned) => {
      cloned.set({ left: obj.left + 12, top: obj.top + 12 });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
    });
  };

  const bringForward = () =>
    fabricCanvas.current?.bringForward(fabricCanvas.current.getActiveObject());
  const sendBackward = () =>
    fabricCanvas.current?.sendBackwards(fabricCanvas.current.getActiveObject());
  const deleteObject = () =>
    fabricCanvas.current?.remove(fabricCanvas.current.getActiveObject());

  const alignObject = (edge) => {
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
  };

  const updateProperty = (prop, value) => {
    const obj = fabricCanvas.current?.getActiveObject();
    if (obj) {
      obj.set(prop, value);
      fabricCanvas.current.requestRenderAll();
      setForceUpdate((f) => f + 1);
    }
  };



  const downloadPDF = () => {
    const canvas = fabricCanvas.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,
    });

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [BASE_WIDTH, BASE_HEIGHT],
    });

    doc.addImage(dataUrl, 'PNG', 0, 0, BASE_WIDTH, BASE_HEIGHT);
    doc.save('certificate.pdf');
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
          <h4 className="font-semibold text-gray-700 mb-2">Certificate Size</h4>
          <select
            value={certificateSize}
            onChange={(e) => setCertificateSize(e.target.value)}
            className="w-full p-2 border rounded-md text-sm"
          >
            {Object.keys(CERTIFICATE_SIZES).map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Position</h4>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-1">
            <button
              disabled={!isObjectSelected}
              onClick={() => alignObject("left")}
              className="p-2 border rounded-md hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              <AlignHorizontalJustifyStart size={16} />
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
            <button
              disabled={!isObjectSelected}
              onClick={cloneObject}
              className="p-2 border rounded-md hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
              title="Duplicate (Ctrl/Cmd+D)"
            >
              <Copy size={16} />
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1 mb-2">
            <button
              disabled={!isText}
              onClick={() =>
                updateProperty(
                  "fontWeight",
                  getProp("fontWeight", "normal") === "bold" ? "normal" : "bold"
                )
              }
              className={`p-2 border rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 ${
                getProp("fontWeight", "normal") === "bold" ? "bg-gray-200" : ""
              }`}
            >
              <Bold size={16} />
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
              className={`p-1 md:p-2 border rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 ${
                getProp("textAlign", "left") === "left" ? "bg-gray-200" : ""
              }`}
            >
              <AlignLeft size={16} />
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
    <div className="bg-gray-100 font-sans h-screen">
      <div className="flex flex-row h-screen bg-white shadow-md overflow-x-hidden">
        <div className="w-72 p-4 flex flex-col gap-6 bg-white border-r overflow-y-auto">
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

        <div className="flex-1 flex flex-col min-h-0">
          <CanvasToolbar />
          <CanvasContainer canvasRef={canvasRef} containerRef={canvasContainerRef} />
        </div>

        <div className="w-80 p-4 relative bg-white border-l overflow-y-auto">
          <PropertiesPanel />
          <div className="absolute bottom-4 right-4 left-4">
            <button
              onClick={clearCanvas}
              className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
            >
              Clear Canvas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateEditor;

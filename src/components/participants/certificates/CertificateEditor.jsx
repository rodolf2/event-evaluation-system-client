import { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus,
  Upload,
  Square,
  Circle,
  Star,
  Triangle,
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
  Sliders,
  X,
} from "lucide-react";

const BASE_WIDTH = 800;
const BASE_HEIGHT = 600;

const CertificateEditor = ({ initialData }) => {
  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const fabricCanvas = useRef(null);
  const fabricRef = useRef(null);
  const fileInputRef = useRef(null);
  const bgInputRef = useRef(null);

  const [activeObject, setActiveObject] = useState(null);
  const [, setForceUpdate] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState(null); // 'elements' | 'properties' | null

  const historyRef = useRef([]);
  const redoRef = useRef([]);

  const pushHistory = useCallback(() => {
    try {
      const canvas = fabricCanvas.current;
      if (!canvas) return;
      const json = JSON.stringify(canvas.toJSON(["selectable"]));
      const last = historyRef.current[historyRef.current.length - 1];
      if (json !== last) {
        historyRef.current.push(json);
        if (historyRef.current.length > 60) historyRef.current.shift();
        redoRef.current = [];
      }
    } catch (err) {
      console.error("Error updating canvas history:", err);
    }
  }, []);

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
        backgroundColor: "#fff",
        selection: true,
        preserveObjectStacking: true,
      });
      fabricCanvas.current = canvas;

      if (initialData) {
        canvas.loadFromJSON(initialData, () => {
          canvas.renderAll();
          pushHistory();
        });
      } else {
        historyRef.current = [];
        pushHistory();
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

      const container = canvasContainerRef.current;
      const resizeCanvasToContainer = () => {
        if (!container || !canvas) return;
        const containerWidth = container.clientWidth - 64; // Account for p-8 padding
        const containerHeight = container.clientHeight - 64; // Account for p-8 padding
        const scaleX = containerWidth / BASE_WIDTH;
        const scaleY = containerHeight / BASE_HEIGHT;
        const scale = Math.max(0.2, Math.min(scaleX, scaleY));
        canvas.setDimensions({
          width: BASE_WIDTH * scale,
          height: BASE_HEIGHT * scale,
        });
        canvas.setZoom(scale);
        canvas.renderAll();
      };

      resizeCanvasToContainer();
      resizeObserver = new ResizeObserver(resizeCanvasToContainer);
      if (container) resizeObserver.observe(container);

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
        if (resizeObserver && container) resizeObserver.unobserve(container);
        if (canvas) canvas.dispose();
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

  const undo = () => {
    const canvas = fabricCanvas.current;
    if (!canvas || historyRef.current.length <= 1) return;
    const current = historyRef.current.pop();
    redoRef.current.push(current);
    const prev = historyRef.current[historyRef.current.length - 1];
    if (prev) canvas.loadFromJSON(prev, () => canvas.renderAll());
  };

  const redo = () => {
    const canvas = fabricCanvas.current;
    if (!canvas || !redoRef.current.length) return;
    const next = redoRef.current.pop();
    historyRef.current.push(next);
    canvas.loadFromJSON(next, () => canvas.renderAll());
  };

  const downloadPNG = () => {
    const canvas = fabricCanvas.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 1 / canvas.getZoom(),
    });
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "certificate.png";
    link.click();
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
          fabricCanvas.current.setBackgroundImage(
            img,
            fabricCanvas.current.renderAll.bind(fabricCanvas.current),
            {
              scaleX: fabricCanvas.current.width / img.width,
              scaleY: fabricCanvas.current.height / img.height,
            }
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
              onClick={downloadPNG}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Download PNG
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

  // Mobile detection effect
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Elements Panel Component for reuse
  const ElementsPanel = () => (
    <div>
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-2">Text</h4>
        <button
          onClick={() => addText(true)}
          className="text-left text-xl font-bold w-full p-2 hover:bg-gray-100 rounded-md"
        >
          Headline
        </button>
        <button
          onClick={() => addText(false)}
          className="text-left text-base w-full p-2 hover:bg-gray-100 rounded-md"
        >
          Body Text
        </button>
      </div>
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-2">Images</h4>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => fileInputRef.current.click()}
            className="flex items-center justify-center gap-2 p-2 border rounded-md hover:bg-gray-100"
          >
            <Upload size={16} /> Upload
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
            accept="image/*"
          />
          <button
            onClick={addImageFromUrl}
            className="flex items-center justify-center gap-2 p-2 border rounded-md hover:bg-gray-100 text-sm"
          >
            From URL
          </button>
          <button
            onClick={() => bgInputRef.current.click()}
            className="flex items-center justify-center gap-2 p-2 border rounded-md hover:bg-gray-100"
          >
            Set Background
          </button>
          <input
            type="file"
            ref={bgInputRef}
            onChange={handleBackgroundUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => {
              fabricCanvas.current?.setBackgroundImage(
                null,
                fabricCanvas.current.renderAll.bind(fabricCanvas.current)
              );
            }}
            className="flex items-center justify-center gap-2 p-2 border rounded-md hover:bg-gray-100 text-sm"
          >
            Clear BG
          </button>
        </div>
      </div>
      <div>
        <h4 className="font-semibold text-gray-700 mb-2">Shapes</h4>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => addShape("rect")}
            className="p-3 bg-gray-200 hover:bg-gray-300 rounded-md flex items-center justify-center"
          >
            <Square size={20} className="text-gray-600" />
          </button>
          <button
            onClick={() => addShape("circle")}
            className="p-3 bg-gray-200 hover:bg-gray-300 rounded-md flex items-center justify-center"
          >
            <Circle size={20} className="text-gray-600" />
          </button>
          <button
            onClick={() => addShape("star")}
            className="p-3 bg-gray-200 hover:bg-gray-300 rounded-md flex items-center justify-center"
          >
            <Star size={20} className="text-gray-600" />
          </button>
          <button
            onClick={() => addShape("triangle")}
            className="p-3 bg-gray-200 hover:bg-gray-300 rounded-md flex items-center justify-center"
          >
            <Triangle size={20} className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="bg-gray-100 font-sans h-screen overflow-hidden"
      style={{ overflowX: "hidden" }}
    >
      <div
        className={`flex flex-col lg:flex-row h-full bg-white shadow-md overflow-hidden ${
          isMobile ? "pb-16" : ""
        }`}
        style={{ overflowX: "hidden" }}
      >
        {/* Left Sidebar - Elements Panel - Hidden on mobile */}
        {!isMobile && (
          <div className="w-72 p-4 border-r overflow-y-auto flex flex-col gap-6 shrink-0 max-h-screen">
            <div>
              <h3 className="font-bold text-lg mb-4">Elements</h3>
              <ElementsPanel />
            </div>
          </div>
        )}

        {/* Canvas Area - Full screen on mobile */}
        <div
          className={`flex-1 flex justify-center items-center bg-gray-200 overflow-hidden ${
            isMobile ? "p-2" : "p-8"
          }`}
          ref={canvasContainerRef}
        >
          <div className="bg-white shadow-lg overflow-hidden max-w-full max-h-full">
            <canvas ref={canvasRef} />
          </div>
        </div>

        {/* Right Sidebar - Properties Panel - Hidden on mobile */}
        {!isMobile && (
          <div className="w-80 p-4 border-l overflow-hidden bg-white shrink-0 max-h-screen flex flex-col">
            <h3 className="font-bold text-lg mb-4 shrink-0">Properties</h3>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <PropertiesPanel />
            </div>
            <div className="shrink-0 pt-4 pb-35">
              <button
                onClick={clearCanvas}
                className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
              >
                Clear Canvas
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Bar */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center h-16 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <button
            onClick={() =>
              setActiveMobileTab(
                activeMobileTab === "elements" ? null : "elements"
              )
            }
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              activeMobileTab === "elements" ? "text-blue-600" : "text-gray-600"
            }`}
          >
            <Plus className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Add Elements</span>
          </button>
          <div className="w-px h-8 bg-gray-200"></div>
          <button
            onClick={() =>
              setActiveMobileTab(
                activeMobileTab === "properties" ? null : "properties"
              )
            }
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              activeMobileTab === "properties"
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
            className="bg-white rounded-t-2xl shadow-2xl w-full max-h-[60vh] flex flex-col overflow-hidden"
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
                <ElementsPanel />
              ) : (
                <>
                  <PropertiesPanel />
                  <div className="mt-4">
                    <button
                      onClick={clearCanvas}
                      className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
                    >
                      Clear Canvas
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateEditor;

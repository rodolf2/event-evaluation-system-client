import { useState, useEffect, useRef } from "react";
import PSASLayout from "../../components/psas/PSASLayout";
import { Plus, Search, Upload, Type, Square, Circle, Star, Triangle, Bold, Italic, Underline, Trash2 } from "lucide-react";

const placeholderCert = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='16' fill='%236b7280' dominant-baseline='middle' text-anchor='middle'%3ECertificate%3C/text%3E%3C/svg%3E";

const CertificateEditor = ({ onBack }) => {
  const canvasRef = useRef(null);
  const fabricCanvas = useRef(null);
  const fabricRef = useRef(null);
  const [activeObject, setActiveObject] = useState(null);

  useEffect(() => {
    const initFabric = async () => {
      const fabricModule = await import('fabric');
      const fabric = fabricModule.default;
      fabricRef.current = fabric;

      const canvas = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: '#fff',
      });
      fabricCanvas.current = canvas;

      canvas.on({
        'selection:created': (e) => setActiveObject(e.selected[0]),
        'selection:updated': (e) => setActiveObject(e.selected[0]),
        'selection:cleared': () => setActiveObject(null),
      });
    };
    initFabric();

    return () => {
      if (fabricCanvas.current) {
        fabricCanvas.current.dispose();
      }
    };
  }, []);

  const updateProperty = (prop, value) => {
    const obj = fabricCanvas.current.getActiveObject();
    if (obj) {
      obj.set(prop, value);
      fabricCanvas.current.renderAll();
      setActiveObject(fabricCanvas.current.getActiveObject()); // Force re-render of panel
    }
  };

  const addText = (isHeadline) => {
    const fabric = fabricRef.current;
    if (!fabric) return;
    const text = new fabric.Textbox(isHeadline ? 'Headline' : 'Body Text', {
      left: 100,
      top: 100,
      fontSize: isHeadline ? 48 : 24,
      fill: '#000',
    });
    fabricCanvas.current.add(text);
    fabricCanvas.current.setActiveObject(text);
  };

  const addShape = (type) => {
    const fabric = fabricRef.current;
    if (!fabric) return;
    let shape;
    const options = { left: 150, top: 150, width: 100, height: 100, fill: '#ccc' };
    switch (type) {
      case 'rect': shape = new fabric.Rect(options); break;
      case 'circle': shape = new fabric.Circle({ ...options, radius: 50 }); break;
      case 'star': shape = new fabric.Polygon([{x: 50, y: 0}, {x: 61, y: 35}, {x: 98, y: 35}, {x: 68, y: 57}, {x: 79, y: 91}, {x: 50, y: 70}, {x: 21, y: 91}, {x: 32, y: 57}, {x: 2, y: 35}, {x: 39, y: 35}], { ...options }); break;
      case 'triangle': shape = new fabric.Triangle(options); break;
      default: return;
    }
    fabricCanvas.current.add(shape);
    fabricCanvas.current.setActiveObject(shape);
  };

  const clearCanvas = () => {
    if (fabricCanvas.current) {
      fabricCanvas.current.clear();
      fabricCanvas.current.backgroundColor = '#fff';
      fabricCanvas.current.renderAll();
    }
  };

  const PropertiesPanel = () => {
    if (!activeObject) {
      return <div className="text-center text-gray-500">Select an object to edit</div>;
    }

    const isText = activeObject.type === 'textbox';

    return (
      <div className="space-y-4">
        {isText && (
            <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">Text</h4>
                <div className="flex gap-2 mb-2">
                    <select value={activeObject.get('fontFamily')} onChange={(e) => updateProperty('fontFamily', e.target.value)} className="flex-1 p-2 border rounded-md"> <option>Inter</option> <option>Arial</option> </select>
                    <select value={activeObject.get('fontSize')} onChange={(e) => updateProperty('fontSize', parseInt(e.target.value, 10))} className="w-20 p-2 border rounded-md"> <option>24</option> <option>36</option> <option>48</option> </select>
                </div>
                <div className="grid grid-cols-4 gap-1">
                    <button onClick={() => updateProperty('fontWeight', activeObject.get('fontWeight') === 'bold' ? 'normal' : 'bold')} className={`p-2 border rounded-md ${activeObject.get('fontWeight') === 'bold' ? 'bg-gray-200' : ''}`}><Bold size={16}/></button>
                    <button onClick={() => updateProperty('fontStyle', activeObject.get('fontStyle') === 'italic' ? 'normal' : 'italic')} className={`p-2 border rounded-md ${activeObject.get('fontStyle') === 'italic' ? 'bg-gray-200' : ''}`}><Italic size={16}/></button>
                    <button onClick={() => updateProperty('underline', !activeObject.get('underline'))} className={`p-2 border rounded-md ${activeObject.get('underline') ? 'bg-gray-200' : ''}`}><Underline size={16}/></button>
                    <input type="color" value={activeObject.get('fill')} onChange={(e) => updateProperty('fill', e.target.value)} className="w-full h-10 p-1 border-gray-300 rounded-md cursor-pointer"/>
                </div>
            </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-200 p-4 font-sans">
      <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
        <button onClick={onBack} className="font-bold text-lg"> &larr; </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 min-h-[600px]">
        {/* Left Sidebar */}
        <div className="w-full md:w-1/4 bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-bold text-lg mb-4">Elements</h3>
          <div className="mb-6">
            <h4 className="font-semibold text-gray-700 mb-2">Text</h4>
            <button onClick={() => addText(true)} className="text-left text-2xl font-bold w-full p-2 hover:bg-gray-100 rounded-md">Headline</button>
            <button onClick={() => addText(false)} className="text-left text-base w-full p-2 hover:bg-gray-100 rounded-md">Body Text</button>
          </div>
          <div className="mb-6">
            <h4 className="font-semibold text-gray-700 mb-2">Images</h4>
            <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 p-2 border rounded-md hover:bg-gray-100"><Upload size={16} /> Upload</button>
                <button className="flex-1 flex items-center justify-center gap-2 p-2 border rounded-md hover:bg-gray-100">From URL</button>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Shapes</h4>
            <div className="flex gap-2">
              <button onClick={() => addShape('rect')} className="p-4 bg-gray-200 hover:bg-gray-300 rounded-md"><Square className="text-gray-600" /></button>
              <button onClick={() => addShape('circle')} className="p-4 bg-gray-200 hover:bg-gray-300 rounded-md"><Circle className="text-gray-600" /></button>
              <button onClick={() => addShape('star')} className="p-4 bg-gray-200 hover:bg-gray-300 rounded-md"><Star className="text-gray-600" /></button>
              <button onClick={() => addShape('triangle')} className="p-4 bg-gray-200 hover:bg-gray-300 rounded-md"><Triangle className="text-gray-600" /></button>
            </div>
          </div>
        </div>

        {/* Center Canvas */}
        <div className="w-full md:w-1/2 flex justify-center items-center bg-gray-300 rounded-lg p-4">
          <div className="bg-white shadow-lg">
            <canvas ref={canvasRef} />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full md:w-1/4 bg-white p-4 rounded-lg shadow-sm relative">
            <PropertiesPanel />
            <div className="absolute bottom-4 right-4 left-4">
                 <button onClick={clearCanvas} className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100">Clear Canvas</button>
            </div>
        </div>
      </div>
    </div>
  );
};

const Certificates = () => {
  const [view, setView] = useState("gallery"); // gallery or editor

  const templates = [
    { name: "Foundation Week Celebration", imgSrc: placeholderCert },
    { name: "Child Protection Seminar", imgSrc: placeholderCert },
    { name: "Basic Education Intramurals", imgSrc: placeholderCert },
    { name: "Graduation Day 2025", imgSrc: placeholderCert },
    { name: "Certificate of Achievement", imgSrc: placeholderCert },
    { name: "Certificate of Participation", imgSrc: placeholderCert },
    { name: "Certificate of Excellence", imgSrc: placeholderCert },
    { name: "Certificate of Completion", imgSrc: placeholderCert },
  ];

  if (view === "editor") {
    return (
      <PSASLayout>
        <CertificateEditor onBack={() => setView("gallery")} />
      </PSASLayout>
    );
  }

  return (
    <PSASLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Create a certificate</h2>
          <div onClick={() => setView("editor")} className="rounded-lg p-4 cursor-pointer hover:shadow-xl transition-shadow" style={{ background: 'linear-gradient(180deg, #002474, #324BA3)' }}>
            <div className="bg-white rounded-md p-16 flex items-center justify-center">
              <Plus size={56} className="text-blue-700" />
            </div>
            <p className="text-center text-white text-xl font-semibold mt-4">Blank Canvas</p>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Choose a template</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search" 
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-48"
                />
              </div>
              <div className="relative">
                <select className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg appearance-none">
                  <option>Event</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                   <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.516 7.548c.436-.446 1.043-.481 1.576 0L10 10.405l2.908-2.857c.533-.481 1.141-.446 1.574 0 .436.445.408 1.197 0 1.615l-3.717 3.717a1.023 1.023 0 01-1.459 0l-3.717-3.717c-.408-.418-.436-1.17 0-1.615z"/></svg>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {templates.map((template, index) => (
              <div key={index} onClick={() => setView("editor")} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
                <div className="bg-gray-200 rounded-md mb-4 overflow-hidden">
                  <img src={template.imgSrc} alt={template.name} className="w-full h-auto object-cover" />
                </div>
                <p className="text-center text-gray-700 font-medium">{template.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PSASLayout>
  );
};

export default Certificates;
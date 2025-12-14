import { PanelLeftClose, PanelLeft } from "lucide-react";

const CanvasToolbar = ({ showPanels, onTogglePanels, isMobile }) => {
  return (
    <div className="flex items-center w-full p-2">
      {/* Panel Toggle Button - positioned at left edge */}
      {!isMobile && (
        <button
          onClick={onTogglePanels}
          className="flex items-center justify-center w-8 h-8 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          title={showPanels ? "Hide Side Panels" : "Show Side Panels"}
        >
          {showPanels ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
        </button>
      )}
    </div>
  );
};

export default CanvasToolbar;

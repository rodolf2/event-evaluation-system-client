import { PanelTopClose, PanelTopOpen } from "lucide-react";

const CanvasToolbar = ({ showPanels, onTogglePanels, isMobile }) => {
  return (
    <div className="flex items-center justify-between w-full p-2">
      <div className="flex-1 text-center">
        <span className="text-sm font-medium text-gray-700">
          {isMobile ? "Certificate Editor (Mobile)" : "Certificate Editor"}
        </span>
      </div>

      {/* Panel Toggle Button */}
      {!isMobile && (
        <button
          onClick={onTogglePanels}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors ml-2"
          title={showPanels ? "Hide Side Panels" : "Show Side Panels"}
        >
          {showPanels ? (
            <PanelTopClose size={16} />
          ) : (
            <PanelTopOpen size={16} />
          )}
          <span
            className={`${
              isMobile ? "hidden sm:inline" : ""
            } text-sm font-medium`}
          >
            {showPanels ? "Hide Panels" : "Show Panels"}
          </span>
        </button>
      )}
    </div>
  );
};

export default CanvasToolbar;

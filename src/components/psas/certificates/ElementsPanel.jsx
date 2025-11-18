import { Bold, Italic, Underline, Trash2, Copy, Plus, Upload, Loader2 } from "lucide-react";

const ElementsPanel = ({
  onAddText,
  onAddImage,
  onAddImageFromUrl,
  onAddShape,
  onSetBackgroundImage,
  fileInputRef,
  bgInputRef,
  isUploadingImage = false,
  isUploadingBackground = false,
}) => {
  return (
    <div>
      <h3 className="font-bold text-lg mb-4">Elements</h3>

      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-2">Text</h4>
        <button
          onClick={() => onAddText(true)}
          className="text-left text-2xl font-bold w-full p-2 hover:bg-gray-100 rounded-md"
        >
          Headline
        </button>
        <button
          onClick={() => onAddText(false)}
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
            disabled={isUploadingImage}
            className="flex items-center justify-center gap-2 p-2 border rounded-md hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
            title="Upload image file from your device"
          >
            {isUploadingImage ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Upload size={16} />
            )}
            {isUploadingImage ? 'Uploading...' : 'Upload'}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={onAddImage}
            className="hidden"
            accept="image/*"
          />
          <button
            onClick={onAddImageFromUrl}
            className="flex items-center justify-center gap-2 p-2 border rounded-md hover:bg-gray-100 text-xs"
            title="Load image from web URL (direct image links only)"
          >
            From URL
          </button>
          <button
            onClick={() => bgInputRef.current.click()}
            disabled={isUploadingBackground}
            className="flex items-center justify-center gap-2 p-2 border rounded-md hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {isUploadingBackground ? (
              <Loader2 size={16} className="animate-spin" />
            ) : null}
            {isUploadingBackground ? 'Setting...' : 'Set Background'}
          </button>
          <input
            type="file"
            ref={bgInputRef}
            onChange={onSetBackgroundImage}
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-700 mb-2">Shapes</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onAddShape("rect")}
            className="p-4 bg-gray-200 hover:bg-gray-300 rounded-md"
          >
            <div className="w-6 h-6 bg-gray-600 rounded-sm mx-auto"></div>
          </button>
          <button
            onClick={() => onAddShape("circle")}
            className="p-4 bg-gray-200 hover:bg-gray-300 rounded-md"
          >
            <div className="w-6 h-6 bg-gray-600 rounded-full mx-auto"></div>
          </button>
          <button
            onClick={() => onAddShape("star")}
            className="p-4 bg-gray-200 hover:bg-gray-300 rounded-md"
          >
            <div className="w-6 h-6 bg-gray-600 mx-auto" style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}></div>
          </button>
          <button
            onClick={() => onAddShape("triangle")}
            className="p-4 bg-gray-200 hover:bg-gray-300 rounded-md"
          >
            <div className="w-6 h-6 bg-gray-600 mx-auto" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ElementsPanel;
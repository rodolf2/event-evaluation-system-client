import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import {
  X,
  ArrowLeft,
  Camera,
  Upload,
  Image as ImageIcon,
  Minus,
  Plus,
} from "lucide-react";

const ProfilePictureModal = ({
  isOpen,
  onClose,
  currentImage,
  onSave,
  onRemove,
}) => {
  const [step, setStep] = useState("VIEW_CURRENT"); // VIEW_CURRENT, SELECT_SOURCE, TAKE_PHOTO, ADJUST, SAVING, SUCCESS
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); // Used for final preview in SUCCESS/SAVING
  const [cameraError, setCameraError] = useState(null);

  // Cropping state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const imageRef = useRef(null); // Reference to the image element in ADJUST step

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("VIEW_CURRENT");
      setSelectedImage(null);
      setPreviewUrl(null);
      setCameraError(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Handle camera stream attachment when step changes to TAKE_PHOTO
  useEffect(() => {
    if (step === "TAKE_PHOTO" && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current
        .play()
        .catch((e) => console.error("Error playing video:", e));
    }
  }, [step]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      streamRef.current = stream;
      setStep("TAKE_PHOTO");
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError(
        "Unable to access camera. Please ensure you have granted permission."
      );
      setStep("TAKE_PHOTO");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL("image/png");
      setSelectedImage(dataUrl);
      stopCamera();
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setStep("ADJUST");
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      // Updated limit to 10MB
      toast.error("Image size must be less than 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setStep("ADJUST");
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Cropping Handlers
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - crop.x, y: e.clientY - crop.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      e.preventDefault();
      setCrop({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX - crop.x, y: touch.clientY - crop.y });
  };

  const handleTouchMove = (e) => {
    if (isDragging) {
      const touch = e.touches[0];
      setCrop({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    }
  };

  const getCroppedImg = async () => {
    if (!selectedImage) return null;

    const img = new Image();
    img.src = selectedImage;
    await new Promise((resolve) => (img.onload = resolve));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Output size (high quality)
    const size = 400;
    canvas.width = size;
    canvas.height = size;

    // Visual container size was 280px
    const visualSize = 280;
    const scaleFactor = size / visualSize;

    // Fill background (optional, for transparency)
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, size, size);

    // Draw image with transforms
    // Translate to center of canvas
    ctx.translate(size / 2, size / 2);
    // Apply crop offset (scaled)
    ctx.translate(crop.x * scaleFactor, crop.y * scaleFactor);
    // Apply zoom
    ctx.scale(zoom, zoom);
    // Draw image centered
    ctx.drawImage(img, -img.width / 2, -img.height / 2);

    return canvas.toDataURL("image/png");
  };

  const handleSave = async () => {
    setStep("SAVING");
    try {
      const croppedImage = await getCroppedImg();
      setPreviewUrl(croppedImage); // Set for success view
      await onSave(croppedImage);
      setStep("SUCCESS");
    } catch (error) {
      console.error("Error saving profile picture:", error);
      setStep("ADJUST");
    }
  };

  const handleRemove = async () => {
    await onRemove();
    onClose();
  };

  if (!isOpen) return null;

  const renderContent = () => {
    switch (step) {
      case "VIEW_CURRENT":
        return (
          <div className="flex flex-col items-center">
            <div className="flex justify-between w-full mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Profile Picture
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-500 text-sm text-center mb-8">
              A profile picture helps people recognize you. Add a profile now if
              you don't have one yet.
            </p>
            <div className="w-40 h-40 rounded-full overflow-hidden mb-8 border-4 border-gray-100 shadow-sm">
              <img
                src={currentImage}
                alt="Current Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => setStep("SELECT_SOURCE")}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Change
              </button>
              <button
                onClick={handleRemove}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Remove
              </button>
            </div>
          </div>
        );

      case "SELECT_SOURCE":
        return (
          <div className="flex flex-col">
            <div className="flex items-center mb-6">
              <button
                onClick={() => setStep("VIEW_CURRENT")}
                className="mr-4 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft size={24} />
              </button>
            </div>

            <div
              className="border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center mb-8 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <ImageIcon size={48} className="text-gray-500" />
              </div>
              <p className="text-gray-600 font-medium">Drag photo here</p>
            </div>

            <div className="relative flex items-center justify-center mb-8">
              <div className="border-t border-gray-200 w-full absolute"></div>
              <span className="bg-white px-4 text-gray-500 text-sm relative z-10">
                or
              </span>
            </div>

            <div className="flex gap-4 w-full">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                Upload from device
              </button>
              <button
                onClick={startCamera}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                Take a picture
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
            />
          </div>
        );

      case "TAKE_PHOTO":
        return (
          <div className="flex flex-col items-center">
            <div className="flex items-center w-full mb-4">
              <button
                onClick={() => {
                  stopCamera();
                  setStep("SELECT_SOURCE");
                }}
                className="mr-4 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft size={24} />
              </button>
              <h2 className="text-xl font-bold text-gray-800">Take Photo</h2>
            </div>

            <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden mb-6 flex items-center justify-center">
              {cameraError ? (
                <div className="text-white text-center p-4">
                  <p className="mb-2 text-red-400 font-semibold">
                    Camera Error
                  </p>
                  <p className="text-sm">{cameraError}</p>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  onLoadedMetadata={() => {
                    if (videoRef.current) {
                      videoRef.current
                        .play()
                        .catch((e) => console.error("Play error:", e));
                    }
                  }}
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="flex gap-4 w-full">
              {!cameraError && (
                <button
                  onClick={capturePhoto}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Camera size={20} />
                  Capture
                </button>
              )}
            </div>
          </div>
        );

      case "ADJUST":
        return (
          <div className="flex flex-col items-center">
            <div className="flex items-center w-full mb-4">
              <button
                onClick={() => {
                  setStep("SELECT_SOURCE");
                  setSelectedImage(null);
                }}
                className="mr-4 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft size={24} />
              </button>
              <h2 className="text-xl font-bold text-gray-800">
                Adjust Profile Picture
              </h2>
            </div>

            <p className="text-gray-500 text-sm text-center mb-6">
              Drag to reposition and use the slider to zoom.
            </p>

            {/* Cropping Area */}
            <div className="relative w-[280px] h-[280px] mb-6 select-none">
              {/* Circular Mask */}
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 overflow-hidden z-10 pointer-events-none shadow-lg"></div>

              {/* Image Container */}
              <div
                className="w-full h-full overflow-hidden bg-gray-100 rounded-full cursor-move relative"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
              >
                {selectedImage && (
                  <img
                    ref={imageRef}
                    src={selectedImage}
                    alt="Crop"
                    draggable={false}
                    style={{
                      transform: `translate(-50%, -50%) translate(${crop.x}px, ${crop.y}px) scale(${zoom})`,
                      top: "50%",
                      left: "50%",
                      position: "absolute",
                      maxWidth: "100%",
                      maxHeight: "100%",
                    }}
                  />
                )}
              </div>
            </div>

            {/* Zoom Control */}
            <div className="flex items-center gap-4 w-full max-w-xs mb-8">
              <Minus size={20} className="text-gray-500" />
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <Plus size={20} className="text-gray-500" />
            </div>

            <div className="flex gap-4 w-full">
              <button
                onClick={() => {
                  setStep("SELECT_SOURCE");
                  setSelectedImage(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Save Profile Picture
              </button>
            </div>
          </div>
        );

      case "SAVING":
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <h2 className="text-xl font-bold text-gray-800 mb-8">
              Saving Profile Picture
            </h2>
            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* Loading Spinner Ring */}
              <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>

              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-sm relative z-10">
                <img
                  src={previewUrl}
                  alt="Saving..."
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        );

      case "SUCCESS":
        return (
          <div className="flex flex-col items-center">
            <div className="flex justify-end w-full mb-4">
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-8">
              Profile Picture has been saved
            </h2>
            <div className="w-48 h-48 rounded-full overflow-hidden mb-8 border-4 border-gray-100 shadow-sm">
              <img
                src={previewUrl}
                alt="Saved"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        {renderContent()}
      </div>
    </div>
  );
};

export default ProfilePictureModal;

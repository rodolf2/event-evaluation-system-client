import { useState, useRef } from "react";
import { Upload } from "lucide-react";

const AttendeeManagement = ({ uploadedCSVData, onCSVUpload, onViewStudents }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    setIsUploading(true);
    try {
      const text = await file.text();
      // Parse CSV logic would be handled by the parent component
      // For now, just pass the file content
      await onCSVUpload(text);
    } catch (error) {
      console.error("Error processing CSV:", error);
      alert("Error processing CSV file. Please check the format.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "text/csv") {
      handleFileSelect(file);
    } else {
      alert("Please select a valid CSV file");
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Attendee Management</h3>

      <div className="space-y-4">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">
            {isUploading ? "Processing..." : "Drop CSV file here or click to browse"}
          </p>
          <p className="text-sm text-gray-500">
            CSV must contain 'name' and 'email' columns
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          >
            {isUploading ? "Uploading..." : "Select CSV File"}
          </button>
        </div>

        {uploadedCSVData && uploadedCSVData.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-green-800 font-medium">
                  ✓ {uploadedCSVData.length} attendees uploaded
                </p>
                <p className="text-green-600 text-sm">
                  Ready to include in evaluation
                </p>
              </div>
              <button
                onClick={onViewStudents}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                View List
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendeeManagement;
import { useState, useRef } from "react";
import { UploadCloud, FileCheck2, Link as LinkIcon, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ImportCSVModal = ({ isOpen, onClose, onFileUpload, uploadedCSVData }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file) => {
    if (!file || file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      alert('Please select a valid CSV file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      // First upload the file to get a URL
      const uploadResponse = await fetch('/api/upload/csv', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        if (uploadData.success && uploadData.url) {
          // Now call the onFileUpload with the URL
          onFileUpload(uploadData.url);
        } else {
          alert('Failed to upload file');
        }
      } else {
        alert('Failed to upload file');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#F1F0F0]/75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 w-full max-w-lg z-60">
        <h2 className="text-2xl font-bold mb-6">Import CSV</h2>
        
        {/* Drag and Drop Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-10 text-center mb-4 cursor-pointer transition-colors ${
            isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300"
          } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragOver(false);
          }}
          onDrop={async (e) => {
            e.preventDefault();
            setIsDragOver(false);

            const files = e.dataTransfer.files;
            if (files.length > 0) {
              await handleFileUpload(files[0]);
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (file) {
                await handleFileUpload(file);
              }
            }}
          />
          <UploadCloud className="w-12 h-12 mx-auto text-gray-400" />
          <p className="mt-4 text-gray-600">
            {uploading ? "Uploading..." : "Click to select or drag and drop CSV file"}
          </p>
          <p className="text-sm text-gray-500">Only CSV files are supported</p>
        </div>

        <div className="relative flex items-center my-6">
          <span className="grow border-t border-gray-300"></span>
          <span className="px-4 text-gray-500 bg-white">or</span>
          <span className="grow border-t border-gray-300"></span>
        </div>

        {/* File URL Input - CSV and other file URLs */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File URL</label>
            <input
              type="text"
              placeholder="Add CSV file URL"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  onFileUpload && onFileUpload(e.target.value.trim());
                  e.target.value = '';
                }
              }}
            />
            <p className="text-xs text-gray-500 mt-1">
              Add URL to a CSV file for importing attendee data
            </p>
          </div>
        </div>

        {/* Uploaded CSV Display */}
        {uploadedCSVData && (
          <div className="bg-gray-100 rounded-lg p-4 flex items-center mb-4">
            <FileCheck2 className="w-6 h-6 text-blue-600 mr-4" />
            <div className="grow">
              <p className="font-semibold text-gray-800">{uploadedCSVData.filename}</p>
              <p className="text-sm text-gray-600">{uploadedCSVData.students.length} students imported</p>
            </div>
            <button
              onClick={() => {
                // Store CSV data in sessionStorage for the student list page
                sessionStorage.setItem('csvData', JSON.stringify(uploadedCSVData));
                navigate('/psas/students');
              }}
              className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm font-semibold ml-4 hover:bg-blue-200 transition"
            >
              View
            </button>
          </div>
        )}

        {/* Action Buttons */}
        {!uploadedCSVData && (
          <div className="flex justify-end gap-4 mt-8">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Import"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportCSVModal;

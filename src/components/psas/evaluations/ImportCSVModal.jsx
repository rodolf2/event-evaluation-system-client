import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { UploadCloud, FileCheck2, Link as LinkIcon, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FormSessionManager } from "../../../utils/formSessionManager";
import ConfirmationModal from "../../shared/ConfirmationModal";

/**
 * ImportCSVModal - CSV import system with secure in-memory handling
 * CRITICAL: CSV data is never persisted to localStorage
 */
const ImportCSVModal = ({
  isOpen,
  onClose,
  onFileUpload,
  uploadedCSVData,
  currentFormId,
}) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Queue for files and links to be imported
  const [fileQueue, setFileQueue] = useState([]);
  const [linkQueue, setLinkQueue] = useState([]);

  const [linkValue, setLinkValue] = useState("");
  const [uploadedData, setUploadedData] = useState(null);

  // Confirmation state
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => { },
  });

  // Initialize uploadedData from props when modal opens
  useEffect(() => {
    if (uploadedCSVData && !uploadedData) {
      setUploadedData(uploadedCSVData);
    }
  }, [uploadedCSVData]);

  // isOpen state changes
  useEffect(() => {
    if (uploadedCSVData && !uploadedData) {
      setUploadedData(uploadedCSVData);
    }
  }, [uploadedCSVData]);

  const handleFileSelect = (file) => {
    const allowedExtensions = [".csv", ".xlsx", ".xls"];
    const ext = file?.name?.toLowerCase().split(".").pop();

    if (!file || !allowedExtensions.includes(`.${ext}`)) {
      toast.error("Please select a valid CSV or Excel file (.csv, .xlsx, .xls)");
      return;
    }

    const fileItem = {
      file: file,
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      selected: false,
    };

    setFileQueue((prev) => [...prev, fileItem]);
  };

  const handleFileCheckboxChange = (fileId, checked) => {
    setFileQueue((prev) =>
      prev.map((item) =>
        item.id === fileId ? { ...item, selected: checked } : item
      )
    );
  };

  const removeFileFromQueue = (fileId) => {
    const fileItem = fileQueue.find(item => item.id === fileId);
    setConfirmConfig({
      title: "Remove File",
      message: `Are you sure you want to remove "${fileItem?.name || 'this file'}" from the import queue?`,
      onConfirm: () => {
        setFileQueue((prev) => prev.filter((item) => item.id !== fileId));
        setShowConfirm(false);
      }
    });
    setShowConfirm(true);
  };

  const handleAddLink = () => {
    if (linkValue.trim()) {
      const url = linkValue.trim();
      let displayFilename = url.split("/").pop() || "CSV File";

      // Improved filename extraction for Google Sheets and general URLs
      if (url.includes("docs.google.com/spreadsheets/d/")) {
        const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (match && match[1]) {
          displayFilename = `Google Sheet (${match[1].substring(0, 8)}...)`;
        } else {
          displayFilename = "Google Sheet";
        }
      } else if (displayFilename.includes("?")) {
        displayFilename = displayFilename.split("?")[0];
      }

      const linkItem = {
        id: Date.now() + Math.random(),
        url: url,
        filename: displayFilename,
        selected: false,
      };

      setLinkQueue((prev) => [...prev, linkItem]);
      setLinkValue("");
    }
  };

  const handleLinkCheckboxChange = (linkId, checked) => {
    setLinkQueue((prev) =>
      prev.map((item) =>
        item.id === linkId ? { ...item, selected: checked } : item
      )
    );
  };

  const removeLinkFromQueue = (linkId) => {
    const linkItem = linkQueue.find(item => item.id === linkId);
    setConfirmConfig({
      title: "Remove Link",
      message: `Are you sure you want to remove this link for "${linkItem?.filename || 'the file'}" from the import queue?`,
      onConfirm: () => {
        setLinkQueue((prev) => prev.filter((item) => item.id !== linkId));
        setShowConfirm(false);
      }
    });
    setShowConfirm(true);
  };

  const showCustomError = (errorMessage) => {
    let formattedMessage = errorMessage;
    
    if (typeof errorMessage === "string" && errorMessage.includes("Missing required column(s):")) {
      const [titlePart, rest] = errorMessage.split("Missing required column(s):");
      if (rest) {
        const colsPart = rest.split(". Expected columns:");
        const missingCols = colsPart[0].trim();
        const expectedCols = colsPart[1] ? colsPart[1].trim() : "name, email";
        
        formattedMessage = (
          <div className="flex flex-col gap-2 pb-1">
            <span className="font-bold text-[15px] tracking-wide">
              {titlePart.replace(/:\s*$/, "")}
            </span>
            <ul className="list-disc pl-5 opacity-95 space-y-1">
              <li>
                <span className="font-semibold">Missing required:</span>{" "}
                <span className="bg-white/25 px-1.5 py-0.5 rounded font-mono text-sm font-bold shadow-sm">
                  {missingCols}
                </span>
              </li>
              <li>
                <span className="font-semibold">Expected columns:</span> {expectedCols.replace(".", "")}
              </li>
            </ul>
          </div>
        );
      }
    }

    toast.error(
      (t) => (
        <div className="relative w-full">
          <div className="whitespace-pre-line text-white pr-6">
            {formattedMessage}
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="absolute -top-3 -right-3 text-white border-2 border-white rounded-full bg-red-500 hover:bg-white hover:text-red-500 transition-colors p-1 flex items-center justify-center h-6 w-6 shadow-md"
          >
            <X size={14} />
          </button>
        </div>
      ),
      {
        duration: Infinity,
        style: {
          alignItems: "flex-start",
          maxWidth: "500px",
          padding: "16px",
          background: "#EF4444",
          color: "#FFFFFF",
        },
        icon: null
      }
    );
  };

  const handleImport = async () => {
    const selectedFiles = fileQueue.filter((item) => item.selected);
    const selectedLinks = linkQueue.filter((item) => item.selected);

    if (selectedFiles.length === 0 && selectedLinks.length === 0) {
      showCustomError("Please select at least one file or link to import");
      return;
    }

    setUploading(true);
    let successCount = 0;
    let specificErrorShown = false;
    const importedFileIds = [];
    const importedLinkIds = [];

    try {
      // Process selected files
      for (const fileItem of selectedFiles) {
        try {
          const formData = new FormData();
          formData.append("file", fileItem.file);

          const uploadResponse = await fetch("/api/upload/csv", {
            method: "POST",
            body: formData,
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            if (uploadData.success && uploadData.url) {
              // Ensure student data is included
              const students = uploadData.students || [];
              const warnings = uploadData.warnings || [];

              const uploadResult = {
                url: uploadData.url,
                filename: fileItem.name,
                students: students,
                uploadedAt: new Date().toISOString(),
              };

              setUploadedData(uploadResult);
              // Pass the complete upload result to FormCreationInterface
              onFileUpload(uploadResult);
              importedFileIds.push(fileItem.id);
              successCount++;

              if (warnings.length > 0) {
                toast(
                  `Imported ${students.length} students. Skipped ${warnings.length} rows:\n${warnings.slice(0, 3).join('\n')}${warnings.length > 3 ? '\n...' : ''}`,
                  {
                    duration: 6000,
                    icon: '⚠️',
                  }
                );
              }
            } else {
              showCustomError(uploadData.message || `Failed to process file: ${fileItem.name}`);
              specificErrorShown = true;
            }
          } else {
             showCustomError(`Error uploading file: ${fileItem.name} (Server Error)`);
             specificErrorShown = true;
          }
        } catch (error) {
          console.error("Error uploading file:", fileItem.name, error);
          showCustomError(`Error uploading file: ${fileItem.name}`);
          specificErrorShown = true;
        }
      }

      // Process selected links - use backend proxy to avoid CORS
      for (const linkItem of selectedLinks) {
        try {
          // Use backend proxy to fetch external CSV URLs
          const proxyResponse = await fetch("/api/upload/csv-from-url", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ url: linkItem.url }),
          });

          const proxyData = await proxyResponse.json();

          if (!proxyResponse.ok || !proxyData.success) {
            throw new Error(
              proxyData.error || proxyData.message || "Failed to fetch CSV"
            );
          }

          const students = proxyData.students || [];
          const warnings = proxyData.warnings || [];

          if (students.length === 0) {
            showCustomError(
              "No valid students found in the CSV. Ensure it has 'name' and 'email' columns."
            );
            specificErrorShown = true;
            continue;
          }

          const linkResult = {
            url: linkItem.url,
            filename: proxyData.filename || linkItem.filename,
            students,
            uploadedAt: new Date().toISOString(),
          };

          setUploadedData(linkResult);
          // Pass the validated result to FormCreationInterface
          onFileUpload(linkResult);
          importedLinkIds.push(linkItem.id);
          successCount++;

          if (warnings.length > 0) {
             toast(
               `Imported ${students.length} students. Skipped ${warnings.length} rows:\n${warnings.slice(0, 3).join('\n')}${warnings.length > 3 ? '\n...' : ''}`,
               {
                 duration: 6000,
                 icon: '⚠️',
               }
             );
           }
        } catch (error) {
          console.error("Error importing link:", linkItem.url, error);
          showCustomError(
            `Import failed for ${linkItem.filename}: ${error?.message || "Unknown error"}`
          );
          specificErrorShown = true;
        }
      }

      if (successCount > 0) {
        setFileQueue((prev) =>
          prev.filter((item) => !importedFileIds.includes(item.id))
        );
        setLinkQueue((prev) =>
          prev.filter((item) => !importedLinkIds.includes(item.id))
        );
      } else if (!specificErrorShown) {
        showCustomError(
          "Failed to import any files. Please check your CSV format (required columns: name, email, unique valid emails)."
        );
      }
    } catch (error) {
      console.error("Import error:", error);
      showCustomError("Error importing files");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-9999 p-4"
      style={{ zIndex: 9999 }}
    >
      <div className="bg-white rounded-lg p-8 w-full max-w-lg relative">
        <h2 className="text-2xl font-bold mb-6">Import CSV</h2>

        <div
          className={`border-2 border-dashed rounded-lg p-10 text-center mb-4 cursor-pointer transition-colors ${isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300"
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

            const { files } = e.dataTransfer;
            if (files.length > 0) {
              handleFileSelect(files[0]);
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (file) {
                handleFileSelect(file);
                // Reset input value so the same file can be selected again if removed
                e.target.value = "";
              }
            }}
          />
          <UploadCloud className="w-12 h-12 mx-auto text-gray-400" />
          <p className="mt-4 text-gray-600">
            {uploading
              ? "Uploading..."
              : "Click to select or drag and drop a file"}
          </p>
          <p className="text-sm text-gray-500">
            CSV and Excel files (.csv, .xlsx, .xls) are supported
          </p>
        </div>

        <div className="relative flex items-center my-6">
          <span className="grow border-t border-gray-300"></span>
          <span className="px-4 text-gray-500 bg-white">or</span>
          <span className="grow border-t border-gray-300"></span>
        </div>

        {/* Link Input with Add Button */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add CSV file URL"
                value={linkValue}
                onChange={(e) => setLinkValue(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && linkValue.trim()) {
                    handleAddLink();
                  }
                }}
              />
              <button
                onClick={handleAddLink}
                disabled={!linkValue.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                Add Link
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Add URL to a CSV file for importing attendee data. Note: OneDrive,
              Google Drive, and Dropbox share links are not supported due to
              CORS restrictions. Google Sheets must be set to "Anyone with the
              link can view".
            </p>
          </div>
        </div>

        {/* Queued Files Display */}
        {fileQueue.map((fileItem) => (
          <div
            key={fileItem.id}
            className="bg-gray-100 rounded-lg p-4 flex items-center mb-4"
          >
            <label className="flex items-center grow cursor-pointer select-none">
              <input
                type="checkbox"
                checked={fileItem.selected}
                onChange={(e) =>
                  handleFileCheckboxChange(fileItem.id, e.target.checked)
                }
                className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 mr-4 cursor-pointer"
              />
              <div className="grow">
                <p className="font-semibold text-gray-800">{fileItem.name}</p>
                <p className="text-sm text-gray-600">
                  {Math.round(fileItem.size / 1024)} KB
                </p>
              </div>
            </label>
            <button
              onClick={() => removeFileFromQueue(fileItem.id)}
              className="p-1 text-red-500 hover:bg-red-100 rounded ml-2 shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        ))}

        {/* Queued Links Display */}
        {linkQueue.map((linkItem) => (
          <div
            key={linkItem.id}
            className="bg-gray-100 rounded-lg p-4 flex items-center mb-4"
          >
            <label className="flex items-center grow cursor-pointer select-none min-w-0 pr-4">
              <input
                type="checkbox"
                checked={linkItem.selected}
                onChange={(e) =>
                  handleLinkCheckboxChange(linkItem.id, e.target.checked)
                }
                className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 mr-4 cursor-pointer shrink-0"
              />
              <div className="grow min-w-0 overflow-hidden">
                <p className="font-semibold text-gray-800 truncate">
                  {linkItem.filename}
                </p>
                <p className="text-sm text-gray-600 truncate overflow-hidden text-ellipsis max-w-full">
                  {linkItem.url}
                </p>
              </div>
            </label>
            <button
              onClick={() => removeLinkFromQueue(linkItem.id)}
              className="p-1 text-red-500 hover:bg-red-100 rounded shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        ))}

        {/* Uploaded CSV Display */}
        {uploadedData && (
          <div className="bg-gray-100 rounded-lg p-4 flex items-center mb-4">
            <FileCheck2 className="w-6 h-6 text-blue-600 mr-4" />
            <div className="grow">
              <p className="font-semibold text-gray-800">
                {uploadedData.filename}
              </p>
              <p className="text-sm text-gray-600">
                {uploadedData.students?.length || 0} students imported
              </p>
            </div>
            <button
              onClick={async () => {
                // Use the currentFormId passed as prop, fallback to FormSessionManager
                let formId =
                  currentFormId || FormSessionManager.getCurrentFormId();
                if (!formId) {
                  formId = FormSessionManager.initializeFormSession();
                }

                // Persist transient CSV payload into the current form session
                // This is scoped to this form draft and cleared on successful publish via clearAllFormData.
                try {
                  FormSessionManager.saveTransientCSVData(uploadedData);
                } catch (error) {
                  console.warn(
                    "Could not store transient CSV data in session:",
                    error
                  );
                }

                // Always navigate with the specific formId so StudentList can resolve eligibility correctly
                // Use PSAS students page for both roles since student assignment is shared functionality
                const navigationUrl = `/psas/students?formId=${encodeURIComponent(
                  formId
                )}&from=evaluation`;
                navigate(navigationUrl);
              }}
              className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm font-semibold ml-4 hover:bg-blue-200 transition"
            >
              View
            </button>
            <button
              onClick={() => {
                setConfirmConfig({
                  title: "Remove Uploaded Data",
                  message: `Are you sure you want to remove the imported data from "${uploadedData.filename}"? This will clear all student assignments for this form.`,
                  onConfirm: () => {
                    setUploadedData(null);
                    onFileUpload(null);
                    setShowConfirm(false);
                  }
                });
                setShowConfirm(true);
              }}
              className="p-1 text-red-500 hover:bg-red-100 rounded ml-2 transition"
              title="Remove"
            >
              <X size={20} />
            </button>
          </div>
        )}

        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={uploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {uploading ? "Importing..." : "Import"}
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText="Remove"
      />
    </div>
  );
};

export default ImportCSVModal;

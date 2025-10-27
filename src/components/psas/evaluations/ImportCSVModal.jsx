import { UploadCloud, FileCheck2, Link as LinkIcon } from "lucide-react";

const ImportCSVModal = ({ isOpen, onClose, onFileUpload }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#F1F0F0]/75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 w-full max-w-lg z-60">
        <h2 className="text-2xl font-bold mb-6">Import CSV</h2>
        
        {/* Drag and Drop Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center mb-4">
          <UploadCloud className="w-12 h-12 mx-auto text-gray-400" />
          <p className="mt-4 text-gray-600">Select a CSV file to import</p>
          <p className="text-sm text-gray-500">or drag and drop it here</p>
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

        {/* Upload Progress - Hide for now since this is just a placeholder */}
        {/* <div className="bg-gray-100 rounded-lg p-4 flex items-center">
            <FileCheck2 className="w-6 h-6 text-blue-600 mr-4" />
            <div className="grow">
                <p className="font-semibold text-gray-800">Ictweekattendance.csv</p>
                <div className="flex items-center">
                    <div className="w-full bg-gray-300 rounded-full h-2 mr-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">100%</span>
                </div>
            </div>
            <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm font-semibold ml-4">View</button>
        </div> */}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <button 
            onClick={onClose} 
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportCSVModal;

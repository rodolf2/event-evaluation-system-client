import { Send } from "lucide-react";

const PublishButton = ({ canPublish, validationMessage, onPublish, isPublishing }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Publish Form</h3>
          {validationMessage && (
            <p className="text-red-600 text-sm">{validationMessage}</p>
          )}
          {!validationMessage && (
            <p className="text-green-600 text-sm">✓ Ready to publish</p>
          )}
        </div>

        <button
          onClick={onPublish}
          disabled={!canPublish || isPublishing}
          className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-colors ${
            canPublish && !isPublishing
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <Send size={18} />
          {isPublishing ? "Publishing..." : "Publish Form"}
        </button>
      </div>
    </div>
  );
};

export default PublishButton;
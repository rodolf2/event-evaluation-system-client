import { CheckCircle } from "lucide-react";
import { FormSessionManager } from "../../../utils/formSessionManager";

const SuccessScreen = ({ onBackToEvaluations, formId }) => {
  const handleBackToEvaluations = () => {
    // Comprehensive cleanup - clear all form-related data
    FormSessionManager.clearAllFormData();
    
    // Clear additional keys that might be left over
    const keysToRemove = [
      "tempFormData",
      "uploadedFormId",
      "editFormId",
      "studentSelection",
      "preservedFormId",
      "preservedFormIdTimestamp",
    ];
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    // Clear any certificate-related flags
    if (formId) {
      localStorage.removeItem(`certificateLinked_${formId}`);
      localStorage.removeItem(`formRecipients_${formId}`);
    }

    // Call the parent callback to navigate back
    onBackToEvaluations();
  };

  return (
    <div className="w-full flex items-center justify-center bg-white p-8 rounded-lg shadow-sm" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <div className="text-center max-w-lg">
        <div className="mb-8">
          {/* Custom Check Icon to match the screenshot */}
          <div className="w-24 h-24 bg-white border-8 border-[#0C2A92] rounded-full mx-auto flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-[#0C2A92]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-[#0C2A92] mb-4">
            Successful!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for taking your time to create this evaluation. <br/> Your form is now ready to collect responses.
          </p>
        </div>
        
        <button
          onClick={handleBackToEvaluations}
          className="px-8 py-3 bg-[#0C2A92] text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors"
        >
          Back to Evaluations
        </button>
      </div>
    </div>
  );
};

export default SuccessScreen;

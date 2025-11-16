import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Award, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Lightbulb, X } from "lucide-react";
import { FormSessionManager } from "../../../utils/formSessionManager";

/**
 * InlineCertificatePanel - Collapsible certificate section with smart suggestions
 * Appears between student assignment and the final link button
 */
const InlineCertificatePanel = ({
  isCertificateLinked,
  linkedCertificateId,
  certificateValidationStatus,
  formTitle,
  questions,
  sections
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Smart certificate suggestions based on form content
  const getCertificateSuggestions = () => {
    const allQuestions = [...questions, ...sections.flatMap(s => s.questions || [])];
    const hasEventType = formTitle.toLowerCase().includes('event') || 
                        formTitle.toLowerCase().includes('workshop') ||
                        formTitle.toLowerCase().includes('seminar');
    const hasPerformanceWords = formTitle.toLowerCase().includes('performance') ||
                               formTitle.toLowerCase().includes('evaluation') ||
                               formTitle.toLowerCase().includes('assessment');
    const hasQuantitativeRatings = allQuestions.some(q => 
      q.type === 'Numeric Ratings' || q.type === 'Likert Scale'
    );
    const hasMultipleSections = sections.length > 0;

    const suggestions = [];

    if (hasEventType) {
      suggestions.push({
        type: 'Event Completion',
        description: 'For attending and participating in the event',
        icon: '🎯',
        color: 'bg-blue-50 border-blue-200 text-blue-700'
      });
    }

    if (hasPerformanceWords || hasQuantitativeRatings) {
      suggestions.push({
        type: 'Performance Achievement',
        description: 'For completing performance evaluation',
        icon: '📊',
        color: 'bg-green-50 border-green-200 text-green-700'
      });
    }

    if (hasMultipleSections) {
      suggestions.push({
        type: 'Multi-Section Completion',
        description: 'For completing comprehensive evaluation',
        icon: '📋',
        color: 'bg-purple-50 border-purple-200 text-purple-700'
      });
    }

    // Default suggestions
    suggestions.push({
      type: 'Participation Certificate',
      description: 'General participation recognition',
      icon: '🏆',
      color: 'bg-orange-50 border-orange-200 text-orange-700'
    });

    return suggestions.slice(0, 3); // Show max 3 suggestions
  };

  const handleCertificateClick = () => {
    // **ROOT CAUSE FIX**: Ensure we use the correct, current formId for navigation
    // When all 3 requirements are completed, handlePublish creates a new serverFormId
    // We need to ensure navigation uses the current formId that matches FormCreationInterface
    
    // Force save form data before navigating to ensure data is preserved
    const formCreationState = localStorage.getItem('formCreationState');
    if (formCreationState) {
      const formData = JSON.parse(formCreationState);
      FormSessionManager.saveFormData(formData);
    }

    // **ENHANCED**: Get the current formId with proper fallback logic
    let stableFormId = FormSessionManager.getCurrentFormId();
    
    // If no current formId, try to initialize or get from URL parameters
    if (!stableFormId) {
      // Check URL parameters for edit mode
      const currentUrlParams = new URLSearchParams(location.search);
      const editParam = currentUrlParams.get("edit");
      
      if (editParam) {
        // Use the edit parameter as the formId
        stableFormId = editParam;
        FormSessionManager.ensurePersistentFormId(stableFormId);
      } else {
        // Initialize a new form session
        stableFormId = FormSessionManager.initializeFormSession();
      }
    }

    // **ENHANCED**: Preserve the id across navigation with correct state
    FormSessionManager.ensurePersistentFormId(stableFormId);
    FormSessionManager.preserveFormId();

    // Navigate to certificates page with proper parameters
    const currentUrlParams = new URLSearchParams(location.search);
    const fromParam = currentUrlParams.get("from") || "evaluation";
    const editParam = currentUrlParams.get("edit");

    const queryParams = new URLSearchParams();
    queryParams.set("from", fromParam);
    queryParams.set("formId", stableFormId);
    if (editParam) {
      queryParams.set("edit", editParam);
    }

    // **LOGGING**: Debug the navigation parameters
    console.log("🔗 Certificate Navigation Debug:", {
      stableFormId,
      fromParam,
      editParam,
      currentUrl: location.search,
      queryString: queryParams.toString()
    });

    navigate(`/psas/certificates?${queryParams.toString()}`);
  };

  const suggestions = getCertificateSuggestions();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isCertificateLinked 
              ? certificateValidationStatus.isValid
                ? 'bg-green-100'
                : 'bg-red-100'
              : 'bg-orange-100'
          }`}>
            {isCertificateLinked ? (
              certificateValidationStatus.isValid ? (
                <CheckCircle className="text-green-600" size={20} />
              ) : (
                <AlertCircle className="text-red-600" size={20} />
              )
            ) : (
              <Award className="text-orange-600" size={20} />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Certificate Configuration
            </h3>
            <p className="text-sm text-gray-500">
              {isCertificateLinked 
                ? certificateValidationStatus.isValid
                  ? "Certificate linked and ready"
                  : "Certificate has issues that need fixing"
                : "Link a certificate template to reward participants"
              }
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="text-gray-400" size={20} />
        ) : (
          <ChevronDown className="text-gray-400" size={20} />
        )}
      </div>

      {isExpanded && (
        <div className="mt-6 space-y-4">
          {/* Certificate Status Details */}
          {isCertificateLinked && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Certificate Linked</p>
                  <p className="text-sm text-gray-600">
                    ID: {linkedCertificateId || 'Unknown'}
                  </p>
                  {!certificateValidationStatus.isValid && (
                    <p className="text-sm text-red-600 mt-1">
                      Issue: {certificateValidationStatus.message}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleCertificateClick}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Change
                </button>
              </div>
            </div>
          )}

          {/* Smart Suggestions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="text-yellow-500" size={16} />
              <h4 className="font-medium text-gray-900">Smart Suggestions</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-2 ${suggestion.color} cursor-pointer hover:shadow-sm transition-shadow`}
                  onClick={handleCertificateClick}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{suggestion.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{suggestion.type}</p>
                      <p className="text-xs opacity-75">{suggestion.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={handleCertificateClick}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                isCertificateLinked
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-orange-600 text-white hover:bg-orange-700"
              }`}
            >
              {isCertificateLinked ? "Change Certificate" : "Link Certificate Template"}
            </button>
            {isCertificateLinked && !certificateValidationStatus.isValid && (
              <button
                onClick={() => {/* Add fix certificate logic */}}
                className="px-4 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InlineCertificatePanel;

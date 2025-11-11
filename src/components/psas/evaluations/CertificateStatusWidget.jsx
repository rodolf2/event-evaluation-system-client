import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, AlertCircle, Award, ChevronDown, ChevronUp } from "lucide-react";
import { FormSessionManager } from "../../../utils/formSessionManager";

/**
 * CertificateStatusWidget - Floating status indicator for certificate linking
 * Provides quick access to certificate linking without scrolling to bottom
 */
const CertificateStatusWidget = ({
  isCertificateLinked,
  linkedCertificateId,
  certificateValidationStatus
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleCertificateClick = () => {
    // Force save form data before navigating
    const formCreationState = localStorage.getItem('formCreationState');
    if (formCreationState) {
      const formData = JSON.parse(formCreationState);
      FormSessionManager.saveFormData(formData);
    }

    // Ensure we have a stable form ID that will persist across navigation
    let stableFormId = FormSessionManager.getCurrentFormId();
    if (!stableFormId) {
      stableFormId = FormSessionManager.initializeFormSession();
    }

    // Preserve the id across navigation
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

    navigate(`/psas/certificates?${queryParams.toString()}`);
  };

  const getStatusInfo = () => {
    if (isCertificateLinked && certificateValidationStatus.isValid) {
      return {
        icon: CheckCircle,
        color: "text-green-500",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        status: "Certificate Linked",
        description: "Ready for publishing",
        action: "Change Certificate"
      };
    } else if (isCertificateLinked && !certificateValidationStatus.isValid) {
      return {
        icon: AlertCircle,
        color: "text-red-500",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        status: "Certificate Invalid",
        description: certificateValidationStatus.message || "Please fix certificate issues",
        action: "Fix Certificate"
      };
    } else {
      return {
        icon: Award,
        color: "text-orange-500",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        status: "Certificate Required",
        description: "Add certificate to enable publishing",
        action: "Link Certificate"
      };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="fixed top-4 right-4 z-40">
      <div
        className={`bg-white rounded-lg shadow-lg border-2 ${statusInfo.borderColor} ${statusInfo.bgColor} transition-all duration-200 ${
          isExpanded ? "max-w-sm" : "max-w-xs"
        }`}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-3 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <StatusIcon className={statusInfo.color} size={20} />
            <div className="flex flex-col">
              <p className="font-medium text-sm text-gray-900">
                {statusInfo.status}
              </p>
              <p className="text-xs text-gray-500">
                {statusInfo.description}
              </p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="text-gray-400" size={16} />
          ) : (
            <ChevronDown className="text-gray-400" size={16} />
          )}
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="px-3 pb-3 border-t border-gray-100">
            {isCertificateLinked && linkedCertificateId && (
              <div className="mt-2 text-xs text-gray-600">
                <p>Certificate ID: {linkedCertificateId}</p>
                {certificateValidationStatus.message && (
                  <p className="mt-1">
                    Status: {certificateValidationStatus.message}
                  </p>
                )}
              </div>
            )}
            <button
              onClick={handleCertificateClick}
              className={`mt-3 w-full text-xs font-medium py-2 px-3 rounded transition-colors ${
                isCertificateLinked
                  ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                  : "bg-orange-100 text-orange-700 hover:bg-orange-200"
              }`}
            >
              {statusInfo.action}
            </button>
          </div>
        )}

        {/* Collapsed Action Button */}
        {!isExpanded && (
          <div className="px-3 pb-3">
            <button
              onClick={handleCertificateClick}
              className={`w-full text-xs font-medium py-1.5 px-3 rounded transition-colors ${
                isCertificateLinked
                  ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                  : "bg-orange-100 text-orange-700 hover:bg-orange-200"
              }`}
            >
              {statusInfo.action}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateStatusWidget;
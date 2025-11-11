import { CheckCircle, AlertCircle, Clock, FileText, Users, Award } from "lucide-react";

/**
 * EnhancedPublishArea - Improved publish section with certificate validation feedback
 * Shows comprehensive status of all required elements before publishing
 */
const EnhancedPublishArea = ({
  isPublishing,
  isCertificateLinked,
  certificateValidationStatus,
  csvValidationStatus,
  hasStudents,
  hasQuestions,
  hasDates,
  onPublish
}) => {
  const validationItems = [
    {
      id: 'questions',
      label: 'Form Questions',
      status: hasQuestions ? 'complete' : 'pending',
      icon: FileText,
      description: hasQuestions ? 'Questions added' : 'Add at least one question'
    },
    {
      id: 'dates',
      label: 'Event Dates',
      status: hasDates ? 'complete' : 'pending',
      icon: Clock,
      description: hasDates ? 'Event dates set' : 'Set start and end dates'
    },
    {
      id: 'recipients',
      label: 'Recipients',
      status: (csvValidationStatus.isValid && hasStudents) ? 'complete' : 'pending',
      icon: Users,
      description: (csvValidationStatus.isValid && hasStudents) 
        ? `${csvValidationStatus.recordCount} students assigned` 
        : 'Assign students to this form'
    },
    {
      id: 'certificate',
      label: 'Certificate',
      status: isCertificateLinked && certificateValidationStatus.isValid ? 'complete' : 'pending',
      icon: Award,
      description: isCertificateLinked 
        ? (certificateValidationStatus.isValid 
            ? 'Certificate linked and valid' 
            : `Certificate issue: ${certificateValidationStatus.message}`)
        : 'Link a certificate template'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="text-green-500" size={18} />;
      case 'pending':
        return <div className="w-4.5 h-4.5 border-2 border-gray-300 rounded-full" />;
      default:
        return <div className="w-4.5 h-4.5 border-2 border-gray-300 rounded-full" />;
    }
  };

  const allValid = validationItems.every(item => item.status === 'complete');
  const certificateInvalid = isCertificateLinked && !certificateValidationStatus.isValid;
  const hasErrors = !allValid || certificateInvalid;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Publish</h3>
        <p className="text-sm text-gray-600">
          Complete all requirements below before publishing your evaluation form
        </p>
      </div>

      {/* Validation Checklist */}
      <div className="space-y-3 mb-6">
        {validationItems.map((item) => {
          const StatusIcon = item.icon;
          return (
            <div
              key={item.id}
              className={`flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${
                item.status === 'complete' 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <StatusIcon 
                  className={item.status === 'complete' ? 'text-green-600' : 'text-gray-400'} 
                  size={18} 
                />
                <div>
                  <p className={`font-medium text-sm ${
                    item.status === 'complete' ? 'text-green-900' : 'text-gray-700'
                  }`}>
                    {item.label}
                  </p>
                  <p className={`text-xs ${
                    item.status === 'complete' ? 'text-green-700' : 'text-gray-500'
                  }`}>
                    {item.description}
                  </p>
                </div>
              </div>
              {getStatusIcon(item.status)}
            </div>
          );
        })}
      </div>

      {/* Certificate-specific feedback */}
      {isCertificateLinked && !certificateValidationStatus.isValid && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-red-600" size={16} />
            <p className="text-sm font-medium text-red-900">Certificate Issue</p>
          </div>
          <p className="text-xs text-red-700 mt-1">
            {certificateValidationStatus.message}
          </p>
        </div>
      )}

      {/* CSV-specific feedback */}
      {csvValidationStatus.message && !csvValidationStatus.isValid && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-orange-600" size={16} />
            <p className="text-sm font-medium text-orange-900">Recipients Issue</p>
          </div>
          <p className="text-xs text-orange-700 mt-1">
            {csvValidationStatus.message}
          </p>
        </div>
      )}

      {/* Publish Button */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          {allValid ? (
            <span className="flex items-center gap-2 text-green-700">
              <CheckCircle size={16} />
              All requirements met
            </span>
          ) : (
            <span>
              {validationItems.filter(item => item.status === 'pending').length} of {validationItems.length} requirements remaining
            </span>
          )}
        </div>
        
        <button
          onClick={onPublish}
          disabled={isPublishing || hasErrors}
          className={`px-6 py-3 font-semibold rounded-lg transition-colors ${
            hasErrors || isPublishing
              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isPublishing ? "Publishing..." : "Publish Form"}
        </button>
      </div>

      {/* Help text for issues */}
      {hasErrors && (
        <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded">
          💡 <strong>Tip:</strong> Complete all items above to enable publishing. 
          Click on incomplete items for guidance on what needs to be done.
        </div>
      )}
    </div>
  );
};

export default EnhancedPublishArea;
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Award, FileText, ExternalLink, CheckCircle, AlertCircle, Link as LinkIcon } from "lucide-react";
import { FormWorkflowManager } from "../../../utils/formWorkflowManager";
import { FormSessionManager } from "../../../utils/formSessionManager";
import { useAuth } from "../../../contexts/useAuth";
import toast from "react-hot-toast";

/**
 * CertificateStep - Certificate linking step in the workflow
 * Handles certificate template selection and linking
 */
const CertificateStep = ({ onStepComplete, isActive }) => {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  // State
  const [certificates, setCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLinked, setIsLinked] = useState(false);
  const [linkedCertificate, setLinkedCertificate] = useState(null);

  // Load existing data on mount
  useEffect(() => {
    loadCertificates();
    checkExistingLink();
  }, []);

  // Auto-save step data
  useEffect(() => {
    if (!isActive) return;

    const timeoutId = setTimeout(() => {
      const stepData = {
        selectedCertificate,
        isLinked,
        linkedCertificate
      };
      
      FormWorkflowManager.saveStepData('certificate', stepData);
      
      // Mark as completed if certificate is linked
      if (isLinked && linkedCertificate) {
        FormWorkflowManager.markStepCompleted('certificate', stepData);
      }
      
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [selectedCertificate, isLinked, linkedCertificate, isActive]);

  // Load available certificates
  const loadCertificates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/certificates', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setCertificates(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading certificates:', error);
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  // Check for existing certificate link
  const checkExistingLink = () => {
    const stepData = FormWorkflowManager.getStepData('certificate');
    if (stepData) {
      setSelectedCertificate(stepData.selectedCertificate || null);
      setIsLinked(stepData.isLinked || false);
      setLinkedCertificate(stepData.linkedCertificate || null);
    } else {
      // Check using legacy method
      const workflowId = FormWorkflowManager.getCurrentWorkflowId();
      if (workflowId) {
        // Check multiple possible certificate linked keys
        const possibleKeys = [
          `certificateLinked_${workflowId}`,
          `certificateLinked_temp_${workflowId}`,
          `certificateLinked_${workflowId.replace('workflow_', 'temp_')}`
        ];
        
        for (const key of possibleKeys) {
          if (localStorage.getItem(key) === "true") {
            setIsLinked(true);
            break;
          }
        }
      }
    }
  };

  // Handle certificate selection
  const handleCertificateSelect = (certificate) => {
    setSelectedCertificate(certificate);
  };

  // Handle certificate linking
  const handleLinkCertificate = async () => {
    if (!selectedCertificate) {
      toast.error('Please select a certificate template first');
      return;
    }

    setLoading(true);
    try {
      const workflowId = FormWorkflowManager.getCurrentWorkflowId();
      if (!workflowId) {
        toast.error('Unable to link certificate - workflow ID not found');
        return;
      }

      // Extract form ID from workflow ID (remove 'workflow_' prefix if present)
      const formId = workflowId.replace('workflow_', '').replace('temp_', '');

      const response = await fetch(`/api/forms/${formId}/draft`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          linkedCertificateId: selectedCertificate._id,
          linkedCertificateType: 'completion',
          certificateTemplateName: selectedCertificate.title,
          isCertificateLinked: true
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsLinked(true);
        setLinkedCertificate(selectedCertificate);

        // Mark certificate as linked in localStorage
        const possibleKeys = [
          `certificateLinked_${workflowId}`,
          `certificateLinked_temp_${workflowId}`,
          `certificateLinked_${workflowId.replace('workflow_', 'temp_')}`
        ];

        possibleKeys.forEach(key => {
          localStorage.setItem(key, "true");
        });

        toast.success('Certificate linked successfully!');
      } else {
        toast.error(data.message || 'Failed to link certificate');
      }
    } catch (error) {
      console.error('Error linking certificate:', error);
      toast.error('Failed to link certificate');
    } finally {
      setLoading(false);
    }
  };

  // Handle certificate unlinking
  const handleUnlinkCertificate = async () => {
    if (!linkedCertificate) return;

    setLoading(true);
    try {
      const workflowId = FormWorkflowManager.getCurrentWorkflowId();
      if (!workflowId) {
        toast.error('Unable to unlink certificate - workflow ID not found');
        return;
      }

      // Extract form ID from workflow ID (remove 'workflow_' prefix if present)
      const formId = workflowId.replace('workflow_', '').replace('temp_', '');

      const response = await fetch(`/api/forms/${formId}/draft`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          linkedCertificateId: null,
          linkedCertificateType: null,
          certificateTemplateName: null,
          isCertificateLinked: false
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsLinked(false);
        setLinkedCertificate(null);

        // Remove certificate linking flags
        const possibleKeys = [
          `certificateLinked_${workflowId}`,
          `certificateLinked_temp_${workflowId}`,
          `certificateLinked_${workflowId.replace('workflow_', 'temp_')}`
        ];

        possibleKeys.forEach(key => {
          localStorage.removeItem(key);
        });

        toast.success('Certificate unlinked successfully');
      } else {
        toast.error(data.message || 'Failed to unlink certificate');
      }
    } catch (error) {
      console.error('Error unlinking certificate:', error);
      toast.error('Failed to unlink certificate');
    } finally {
      setLoading(false);
    }
  };

  // Navigate to certificate management
  const handleManageCertificates = () => {
    // Preserve workflow state before navigation
    const stepData = {
      selectedCertificate,
      isLinked,
      linkedCertificate
    };
    FormWorkflowManager.saveStepData('certificate', stepData);
    
    // Navigate to certificates page based on user role
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const certificatesPath = user.role === 'club-officer' ? '/club-officer/certificates/make' : '/psas/certificates';
    navigate(`${certificatesPath}?from=workflow&returnTo=certificate`);
  };

  // Handle next step
  const handleNextStep = () => {
    if (!isLinked || !linkedCertificate) {
      toast.error('Please link a certificate template before proceeding.');
      return;
    }

    // Mark step as completed
    const stepData = {
      selectedCertificate,
      isLinked,
      linkedCertificate
    };
    
    FormWorkflowManager.markStepCompleted('certificate', stepData);
    onStepComplete?.('review');
  };

  // Handle previous step
  const handlePreviousStep = () => {
    onStepComplete?.('recipients');
  };

  if (!isActive) return null;

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <Award className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Link Certificate Template</h2>
            <p className="text-gray-600">
              Select a certificate template that will be automatically distributed to students upon form completion
            </p>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className={`p-4 rounded-lg ${isLinked ? 'bg-green-50' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2">
              {isLinked ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-gray-400" />
              )}
              <span className={`font-medium ${isLinked ? 'text-green-900' : 'text-gray-700'}`}>
                Status
              </span>
            </div>
            <p className={`text-sm mt-1 ${isLinked ? 'text-green-700' : 'text-gray-500'}`}>
              {isLinked ? 'Certificate linked' : 'No certificate linked'}
            </p>
          </div>
          
          {isLinked && linkedCertificate && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Template</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                {linkedCertificate.title}
              </p>
            </div>
          )}
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-900">Auto-Distribute</span>
            </div>
            <p className="text-sm text-purple-700 mt-1">
              Sent after form completion
            </p>
          </div>
        </div>
      </div>

      {/* Certificate Selection */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Available Certificate Templates</h3>
          <div className="flex gap-2">
            <button
              onClick={loadCertificates}
              disabled={loading}
              className="px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition disabled:opacity-50"
            >
              Refresh
            </button>
            <button
              onClick={handleManageCertificates}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <ExternalLink className="w-4 h-4" />
              Manage Certificates
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-12">
            <Award className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-700 mb-2">No certificates available</h4>
            <p className="text-gray-500 mb-4">
              Create a certificate template first to link it to this form
            </p>
            <button
              onClick={handleManageCertificates}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Create Certificate Template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map((certificate) => {
              const isSelected = selectedCertificate?._id === certificate._id;
              const isCurrentlyLinked = isLinked && linkedCertificate?._id === certificate._id;
              
              return (
                <div
                  key={certificate._id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50'
                      : isCurrentlyLinked
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleCertificateSelect(certificate)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        isSelected ? 'text-purple-900' : 
                        isCurrentlyLinked ? 'text-green-900' : 'text-gray-900'
                      }`}>
                        {certificate.title}
                      </h4>
                      {certificate.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {certificate.description}
                        </p>
                      )}
                    </div>
                    {isCurrentlyLinked && (
                      <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                    )}
                  </div>
                  
                  {certificate.templateData && (
                    <div className="bg-gray-50 rounded p-3 mb-3">
                      <p className="text-xs text-gray-500 mb-1">Template Preview</p>
                      <div className="text-sm text-gray-700">
                        {certificate.templateData.title && (
                          <p><strong>Title:</strong> {certificate.templateData.title}</p>
                        )}
                        {certificate.templateData.organization && (
                          <p><strong>Organization:</strong> {certificate.templateData.organization}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Created {new Date(certificate.createdAt).toLocaleDateString()}
                    </div>
                    {isSelected && !isCurrentlyLinked && (
                      <span className="text-xs text-green-600 font-medium">Currently Linked</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Certificate Actions */}
      {selectedCertificate && !isLinked && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900">Ready to Link Certificate</h4>
              <p className="text-sm text-blue-700 mt-1">
                Link "{selectedCertificate.title}" to this form. Students will receive this certificate automatically after completing the form.
              </p>
            </div>
            <button
              onClick={handleLinkCertificate}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Linking...' : 'Link Certificate'}
            </button>
          </div>
        </div>
      )}

      {/* Linked Certificate Info */}
      {isLinked && linkedCertificate && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h4 className="font-medium text-green-900">Certificate Linked Successfully</h4>
                <p className="text-sm text-green-700 mt-1">
                  "{linkedCertificate.title}" will be automatically sent to all students who complete this form.
                </p>
              </div>
            </div>
            <button
              onClick={handleUnlinkCertificate}
              disabled={loading}
              className="px-4 py-2 text-green-700 border border-green-300 rounded-lg hover:bg-green-100 transition disabled:opacity-50"
            >
              {loading ? 'Unlinking...' : 'Unlink'}
            </button>
          </div>
        </div>
      )}

      {/* Information Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-900">About Certificate Linking</h4>
            <ul className="text-sm text-amber-700 mt-2 space-y-1">
              <li>• Certificates are automatically sent to students who complete the form</li>
              <li>• You can change the certificate template at any time before publishing</li>
              <li>• Each form can only be linked to one certificate template</li>
              <li>• Students will receive a downloadable certificate via email</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t">
        <button
          onClick={handlePreviousStep}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
        >
          Back: Recipients
        </button>
        <button
          onClick={handleNextStep}
          disabled={!isLinked}
          className={`px-6 py-2 rounded-lg transition font-medium ${
            !isLinked
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          Next: Review & Publish
        </button>
      </div>
    </div>
  );
};

export default CertificateStep;
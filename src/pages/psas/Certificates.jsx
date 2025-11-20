import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PSASLayout from "../../components/psas/PSASLayout";
import CertificateEditor from "../../components/psas/certificates/CertificateEditor";
import CertificateGallery from "../../components/psas/certificates/CertificateGallery";
import { FormSessionManager } from "../../utils/formSessionManager";

const Certificates = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [view, setView] = useState("gallery");
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isFromEvaluation, setIsFromEvaluation] = useState(false);
  const [formId, setFormId] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(true);

  // Initialize from URL params
  useEffect(() => {
    const fromEvaluation = searchParams.get("from") === "evaluation";
    const currentFormId = searchParams.get("formId");

    setIsFromEvaluation(fromEvaluation);
    setFormId(currentFormId);

    // Simulate loading delay for consistent user experience
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [searchParams]);

  const handleTemplatePreview = (template, options = {}) => {
    const { action, saveTemplate } = options;

    // Handle template confirmation from gallery - navigate back to form editor
    if (action === "confirm" && saveTemplate) {
      if (isFromEvaluation && formId) {
        // **ROOT CAUSE FIX**: Handle formId conflicts and ensure linkedCertificateId is saved
        const currentFormId = FormSessionManager.getCurrentFormId();
        const navigationFormId = currentFormId || formId;

        // Save form data before navigating back
        const formCreationState = localStorage.getItem("formCreationState");
        let formData = formCreationState
          ? JSON.parse(formCreationState)
          : FormSessionManager.loadFormData();

        if (formData) {
          // Update the loaded form data with certificate linked status
          const updatedFormData = {
            ...formData,
            isCertificateLinked: true,
            linkedCertificateId: template?.id || null,
          };
          FormSessionManager.saveFormData(updatedFormData);
        }

        // Store certificate template data for form editor
        if (template) {
          localStorage.setItem(
            `certificateTemplate_${navigationFormId}`,
            JSON.stringify({
              template: template,
              canvasData: template.data,
              savedAt: new Date().toISOString(),
            })
          );
          // Also save for original formId to be safe
          localStorage.setItem(
            `certificateTemplate_${formId}`,
            JSON.stringify({
              template: template,
              canvasData: template.data,
              savedAt: new Date().toISOString(),
            })
          );
        }

        // Set certificate linked flag
        localStorage.setItem(`certificateLinked_${navigationFormId}`, "true");
        localStorage.setItem(`certificateLinked_${formId}`, "true");

        // Ensure form ID persistence
        FormSessionManager.ensurePersistentFormId(navigationFormId);
        FormSessionManager.preserveFormId();

        // Navigate back to evaluations form editor - preserve formId and set edit mode
        navigate(`/psas/evaluations?edit=${navigationFormId}`);
        return;
      } else {
        // For standalone editing, save template and return to gallery
        if (template && template.data) {
          localStorage.setItem(
            "standaloneCertificateData",
            JSON.stringify({
              canvasData: template.data,
              template: template,
              savedAt: new Date().toISOString(),
            })
          );
        }
        setView("gallery");
        return;
      }
    }

    // Handle template selection for preview/editing
    if (template && action !== "confirm") {
      setSelectedTemplate(template);
      setInitialData(template.data);
      setView("editor");
      setIsPreviewMode(true);
    }
  };

  const handleBlankCanvas = () => {
    // Start with blank canvas
    setSelectedTemplate(null);
    setInitialData(null);
    setView("editor");
  };

  const handleSaveTemplate = (canvasData) => {
    // Handle "Done - Use This Template" from CertificateEditor
    if (isFromEvaluation && formId) {
      // **ROOT CAUSE FIX**: Handle formId conflicts when 3 requirements are completed
      // When all 3 requirements are completed, handlePublish creates a new serverFormId
      // We need to ensure the certificate link uses the correct formId for navigation
      const currentFormId = FormSessionManager.getCurrentFormId();
      const navigationFormId = currentFormId || formId; // Use current formId if available, fallback to original formId

      // Store the customized certificate template data for the correct formId
      if (canvasData) {
        localStorage.setItem(
          `certificateTemplate_${navigationFormId}`,
          JSON.stringify({
            template: selectedTemplate,
            canvasData: canvasData,
            savedAt: new Date().toISOString(),
          })
        );
      }

      // Set certificate linked flag for the correct formId
      localStorage.setItem(`certificateLinked_${navigationFormId}`, "true");

      // **FIXED**: Save form data properly using FormSessionManager
      const formData = FormSessionManager.loadFormData();
      if (formData) {
        // Update the loaded form data with certificate linked status
        const updatedFormData = {
          ...formData,
          isCertificateLinked: true,
          linkedCertificateId: selectedTemplate?.id || null,
        };
        FormSessionManager.saveFormData(updatedFormData);
      }

      // Preserve certificate linking for both formIds to handle the transition
      // This ensures the certificate link survives the formId change during handlePublish
      localStorage.setItem(`certificateLinked_${formId}`, "true");
      if (canvasData) {
        localStorage.setItem(
          `certificateTemplate_${formId}`,
          JSON.stringify({
            template: selectedTemplate,
            canvasData: canvasData,
            savedAt: new Date().toISOString(),
          })
        );
      }

      // Ensure form ID persistence
      FormSessionManager.ensurePersistentFormId(navigationFormId);
      FormSessionManager.preserveFormId();

      // Navigate back to evaluations form editor using the correct formId
      navigate(`/psas/evaluations?edit=${navigationFormId}`);
    } else {
      // Standalone mode - save locally and exit preview mode
      if (canvasData) {
        localStorage.setItem(
          "standaloneCertificateData",
          JSON.stringify({
            canvasData: canvasData,
            template: selectedTemplate,
            savedAt: new Date().toISOString(),
          })
        );
      }
      setIsPreviewMode(false); // Allow full editing
    }
  };

  const handleBackToGallery = () => {
    // Return to gallery without saving changes
    setView("gallery");
    setInitialData(null);
    setSelectedTemplate(null);
    setIsPreviewMode(true);
  };

  // Show loading spinner while data is being initialized
  if (loading) {
    return (
      <PSASLayout>
        <div className="p-4 sm:p-6 md:p-8 bg-linear-to-br from-gray-50 to-blue-50 min-h-[80vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
            <div className="text-center">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1">
                Loading Certificates...
              </h3>
              <p className="text-sm text-gray-600">
                Preparing your certificate templates
              </p>
            </div>
          </div>
        </div>
      </PSASLayout>
    );
  }

  // Editor view with preview mode
  if (view === "editor") {
    return (
      <PSASLayout>
        <CertificateEditor
          initialData={initialData}
          selectedTemplate={selectedTemplate}
          isPreviewMode={isPreviewMode}
          isFromEvaluation={isFromEvaluation}
          formId={formId}
          onSave={handleSaveTemplate}
          onBack={handleBackToGallery}
        />
      </PSASLayout>
    );
  }

  // Gallery view with improved template selection
  return (
    <PSASLayout>
      <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-[80vh]">
        <CertificateGallery
          onTemplateSelect={handleTemplatePreview}
          onBlankCanvas={handleBlankCanvas}
          isFromEvaluation={isFromEvaluation}
          eventName={searchParams.get("eventName")}
        />
      </div>
    </PSASLayout>
  );
};

export default Certificates;

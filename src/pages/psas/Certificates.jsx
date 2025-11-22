import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PSASLayout from "../../components/psas/PSASLayout";
import CertificateEditor from "../../components/psas/certificates/CertificateEditor";
import CertificateGallery from "../../components/psas/certificates/CertificateGallery";
import { FormSessionManager } from "../../utils/formSessionManager";

const Certificates = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [view, setView] = useState("gallery"); // "gallery" or "editor"
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isFromEvaluation, setIsFromEvaluation] = useState(false);
  const [formId, setFormId] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(true);

  // Initialise state from URL parameters
  useEffect(() => {
    const fromEval = searchParams.get("from") === "evaluation" || !searchParams.get("from");
    const currentFormId = searchParams.get("formId");
    setIsFromEvaluation(fromEval);
    setFormId(currentFormId);
    // Simulate a short loading delay for a smoother UX
    setTimeout(() => setLoading(false), 500);
  }, [searchParams]);

  /**
   * Handles selection of a template from the gallery.
   * If the user confirms (clicks "Done - Use This Template"), we persist the link
   * and navigate back to the form creation page.
   */
  const handleTemplatePreview = (template, options = {}) => {
    const { action, saveTemplate } = options;

    // Confirmed from gallery – save link and go back
    if (action === "confirm" && saveTemplate) {
      const navigationFormId = FormSessionManager.ensurePersistentFormId(formId) || FormSessionManager.getCurrentFormId();

      // Persist certificate link in FormSessionManager
      const formCreationState = localStorage.getItem("formCreationState");
      const formData = formCreationState ? JSON.parse(formCreationState) : FormSessionManager.loadFormData();
      if (formData) {
        FormSessionManager.saveFormData({
          ...formData,
          isCertificateLinked: true,
          linkedCertificateId: template?.id || null,
        });
      }

      // Store template data for the form editor (used by CertificateEditor later)
      if (template) {
        const payload = JSON.stringify({ template, canvasData: template.data, savedAt: new Date().toISOString() });
        localStorage.setItem(`certificateTemplate_${navigationFormId}`, payload);
        // Also keep a copy under the original formId for safety
        if (formId) localStorage.setItem(`certificateTemplate_${formId}`, payload);
        localStorage.setItem(`certificateLinked_${navigationFormId}`, "true");
        if (formId) localStorage.setItem(`certificateLinked_${formId}`, "true");
      }

      // Ensure the formId is persisted for the next navigation
      FormSessionManager.ensurePersistentFormId(navigationFormId);
      FormSessionManager.preserveFormId();

      navigate(`/psas/evaluations?edit=${navigationFormId}`);
      return;
    }

    // Otherwise just preview/edit the template
    if (template && action !== "confirm") {
      setSelectedTemplate(template);
      setInitialData(template.data);
      setView("editor");
      setIsPreviewMode(true);
    }
  };

  const handleBlankCanvas = () => {
    setSelectedTemplate(null);
    setInitialData(null);
    setView("editor");
  };

  /**
   * Called by CertificateEditor when the user clicks "Done - Use This Template".
   */
  const handleSaveTemplate = (canvasData) => {
    const navigationFormId = FormSessionManager.ensurePersistentFormId(formId) || FormSessionManager.getCurrentFormId();

    // Persist the customized template
    if (canvasData) {
      const payload = JSON.stringify({ template: selectedTemplate, canvasData, savedAt: new Date().toISOString() });
      localStorage.setItem(`certificateTemplate_${navigationFormId}`, payload);
      if (formId) localStorage.setItem(`certificateTemplate_${formId}`, payload);
    }
    localStorage.setItem(`certificateLinked_${navigationFormId}`, "true");
    if (formId) localStorage.setItem(`certificateLinked_${formId}`, "true");

    // Update form data to reflect the linked certificate
    const formData = FormSessionManager.loadFormData();
    if (formData) {
      FormSessionManager.saveFormData({
        ...formData,
        isCertificateLinked: true,
        linkedCertificateId: selectedTemplate?.id || null,
      });
    }

    // Persist formId and navigate back
    FormSessionManager.ensurePersistentFormId(navigationFormId);
    FormSessionManager.preserveFormId();
    navigate(`/psas/evaluations?edit=${navigationFormId}`);
  };

  const handleBackToGallery = () => {
    setView("gallery");
    setInitialData(null);
    setSelectedTemplate(null);
    setIsPreviewMode(true);
  };

  // Loading spinner
  if (loading) {
    return (
      <PSASLayout>
        <div className="p-4 sm:p-6 md:p-8 bg-linear-to-br from-gray-50 to-blue-50 min-h-[80vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600" />
            <div className="text-center">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1">Loading Certificates...</h3>
              <p className="text-sm text-gray-600">Preparing your certificate templates</p>
            </div>
          </div>
        </div>
      </PSASLayout>
    );
  }

  // Editor view
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

  // Gallery view
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

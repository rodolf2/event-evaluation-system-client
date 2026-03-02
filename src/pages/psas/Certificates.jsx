import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PSASLayout from "../../components/psas/PSASLayout";
import ClubOfficerLayout from "../../components/club-officers/ClubOfficerLayout";
import { useAuth } from "../../contexts/useAuth";
import {
  SkeletonCard,
  SkeletonBase,
  SkeletonText,
} from "../../components/shared/SkeletonLoader";
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
    // Only set isFromEvaluation to true when explicitly coming from evaluation (certificate linking context)
    const fromEval = searchParams.get("from") === "evaluation";
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
      const navigationFormId =
        FormSessionManager.ensurePersistentFormId(formId) ||
        FormSessionManager.getCurrentFormId();

      // Persist certificate link in FormSessionManager
      const formCreationState = localStorage.getItem("formCreationState");
      const formData = formCreationState
        ? JSON.parse(formCreationState)
        : FormSessionManager.loadFormData();
      if (formData) {
        FormSessionManager.saveFormData({
          ...formData,
          isCertificateLinked: true,
          linkedCertificateId: template?.id || null,
        });
      }

      // Store template data for the form editor (used by CertificateEditor later)
      if (template) {
        const payload = JSON.stringify({
          template,
          canvasData: template.data,
          savedAt: new Date().toISOString(),
        });
        localStorage.setItem(
          `certificateTemplate_${navigationFormId}`,
          payload,
        );
        // Also keep a copy under the original formId for safety
        if (formId)
          localStorage.setItem(`certificateTemplate_${formId}`, payload);
        localStorage.setItem(`certificateLinked_${navigationFormId}`, "true");
        if (formId) localStorage.setItem(`certificateLinked_${formId}`, "true");
      }

      // Ensure the formId is persisted for the next navigation
      FormSessionManager.ensurePersistentFormId(navigationFormId);
      FormSessionManager.preserveFormId();

      const basePath = isClubOfficer
        ? "/club-officer/form-creation"
        : "/psas/create-form";
      navigate(`${basePath}?formId=${navigationFormId}`);
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
    const navigationFormId =
      FormSessionManager.ensurePersistentFormId(formId) ||
      FormSessionManager.getCurrentFormId();

    // Persist the customized template
    if (canvasData) {
      const payload = JSON.stringify({
        template: selectedTemplate,
        canvasData,
        savedAt: new Date().toISOString(),
      });
      localStorage.setItem(`certificateTemplate_${navigationFormId}`, payload);
      if (formId)
        localStorage.setItem(`certificateTemplate_${formId}`, payload);
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
    const basePath = isClubOfficer
      ? "/club-officer/form-creation"
      : "/psas/create-form";
    navigate(`${basePath}?formId=${navigationFormId}`);
  };

  const handleBackToGallery = () => {
    setView("gallery");
    setInitialData(null);
    setSelectedTemplate(null);
    setIsPreviewMode(true);
  };

  // Determine layout based on user role
  const { user } = useAuth();
  const isClubOfficer = user?.role === "club-officer";
  const Layout = isClubOfficer ? ClubOfficerLayout : PSASLayout;

  // Loading skeleton
  if (loading) {
    return (
      <Layout>
        <div className="p-4 sm:p-6 md:p-8 min-h-[80vh]">
          {/* Header Section - Match CertificateGallery gradient layout */}
          <div className="shrink-0 mb-6 sm:mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4 sm:mb-6 leading-tight">
              Create a Certificate
            </h2>
            <div className="mb-6 sm:mb-8">
              <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 border-l-4 border-l-gray-300 animate-pulse max-w-xs">
                <div className="w-12 h-12 rounded-lg bg-gray-200 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="h-3 bg-gray-200 rounded w-32" />
                </div>
              </div>
            </div>

            {/* Certificate Template Skeletons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 mb-10">
              {Array.from({ length: 12 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-2.5"
                >
                  <div className="aspect-4/3 bg-gray-50 rounded-lg mb-3 overflow-hidden">
                    <SkeletonBase className="w-full h-full" />
                  </div>
                  <div className="space-y-2">
                    <SkeletonText className="h-3 w-3/4 mx-auto" height="h-3" />
                    <SkeletonText className="h-2 w-1/2 mx-auto" height="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Editor view
  if (view === "editor") {
    return (
      <Layout>
        <CertificateEditor
          initialData={initialData}
          selectedTemplate={selectedTemplate}
          isPreviewMode={isPreviewMode}
          isFromEvaluation={isFromEvaluation}
          formId={formId}
          onSave={handleSaveTemplate}
          onBack={handleBackToGallery}
        />
      </Layout>
    );
  }

  // Gallery view
  return (
    <Layout>
      <div className="p-4 sm:p-6 md:p-8 min-h-[80vh]">
        <CertificateGallery
          onTemplateSelect={handleTemplatePreview}
          onBlankCanvas={handleBlankCanvas}
          isFromEvaluation={isFromEvaluation}
          eventName={searchParams.get("eventName")}
        />
      </div>
    </Layout>
  );
};

export default Certificates;

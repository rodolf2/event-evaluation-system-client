import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PSASLayout from "../../components/psas/PSASLayout";
import ClubOfficerLayout from "../../components/club-officers/ClubOfficerLayout";
import { useAuth } from "../../contexts/useAuth";
import { SkeletonBase } from "../../components/shared/SkeletonLoader";
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
        <div className="min-h-[80vh]">
          <div className="max-h-screen flex flex-col">
            <div className="flex-1 overflow-y-auto">
              {/* Search and Filters Header Skeleton */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
                <div className="relative w-full lg:max-w-md xl:max-w-xl">
                  <SkeletonBase className="w-full h-10 rounded-xl shadow-sm" />
                </div>
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                  <SkeletonBase className="w-36 h-10 rounded-xl shadow-sm" />
                  <SkeletonBase className="w-40 h-10 rounded-xl shadow-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
                {/* Dashed "Blank Canvas" placeholder skeleton */}
                {!isFromEvaluation && (
                  <div className="rounded-xl shadow-sm border-2 border-dashed border-gray-200 h-full min-h-[180px] flex flex-col items-center justify-center bg-gray-50/50">
                    <SkeletonBase className="w-12 h-12 rounded-full mb-3 bg-gray-200" />
                    <SkeletonBase className="h-4 w-24 rounded mb-1 bg-gray-200" />
                    <SkeletonBase className="h-3 w-32 rounded bg-gray-200" />
                  </div>
                )}

                {Array.from({ length: 12 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                  >
                    <div className="aspect-4/3 bg-gray-50 flex items-center justify-center">
                      <SkeletonBase className="w-full h-full" />
                    </div>
                    <div className="p-2.5">
                      <SkeletonBase className="h-3.5 w-3/4 rounded mb-2" />
                      <SkeletonBase className="h-2.5 w-1/2 rounded" />
                    </div>
                  </div>
                ))}
              </div>
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
      <div className="min-h-[80vh]">
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

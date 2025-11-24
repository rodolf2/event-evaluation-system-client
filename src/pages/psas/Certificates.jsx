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
    const fromEval =
      searchParams.get("from") === "evaluation" || !searchParams.get("from");
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
          payload
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
    navigate(`/psas/evaluations?edit=${navigationFormId}`);
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
        <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-[80vh]">
          {/* Header Section - Match CertificateGallery gradient layout */}
          <div className="shrink-0 mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4 sm:mb-6 leading-tight">
              Create a certificate
            </h2>
            <div className="mb-6 sm:mb-8">
              <div
                className="mb-6 sm:mb-8 text-white p-4 sm:p-6 md:p-8 rounded-xl shadow-lg relative"
                style={{
                  background:
                    "linear-gradient(-0.15deg, #324BA3 38%, #002474 100%)",
                }}
              >
                <div className="flex justify-center px-4">
                  <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 md:p-12 lg:p-16 text-center cursor-pointer relative z-10 w-full max-w-md sm:max-w-lg md:max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl">
                    <SkeletonBase className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 mx-auto mb-4 sm:mb-6 md:mb-8 rounded-full bg-gray-200" />
                  </div>
                </div>
                <div className="flex justify-center px-4">
                  <div className="text-center">
                    <SkeletonText
                      lines={1}
                      width="large"
                      height="h-8"
                      className="text-white bg-white/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Choose a template section */}
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 lg:mb-8">
                <SkeletonText
                  lines={1}
                  width="large"
                  height="h-8"
                  className="bg-gray-300"
                />
                <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                  <SkeletonBase className="w-48 h-10 rounded-lg bg-gray-300" />
                  <SkeletonBase className="w-32 h-10 rounded-lg bg-gray-300" />
                  <SkeletonBase className="w-32 h-10 rounded-lg bg-gray-300" />
                </div>
              </div>

              {/* Template Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-md overflow-hidden"
                  >
                    {/* Template Preview */}
                    <div className="bg-linear-to-br from-gray-100 to-gray-200 aspect-4/3 flex items-center justify-center overflow-hidden border border-gray-300">
                      <SkeletonBase className="w-full h-full bg-gray-300" />
                    </div>

                    {/* Template Info */}
                    <div className="p-3 sm:p-4">
                      <SkeletonText
                        lines={1}
                        height="h-4"
                        className="mb-1 bg-gray-300"
                      />
                      <SkeletonText
                        lines={2}
                        height="h-3"
                        className="mb-3 bg-gray-300"
                      />

                      {/* Action Buttons */}
                      <div className="flex gap-1 sm:gap-2">
                        <SkeletonBase className="flex-1 h-8 rounded-lg bg-gray-300" />
                        <SkeletonBase className="h-8 w-8 rounded-lg bg-gray-300" />
                      </div>
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
      <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-[80vh]">
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

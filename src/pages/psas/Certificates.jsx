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
  const isFromEvaluation = searchParams.get("from") === "evaluation";

  useEffect(() => {
    // Simulate loading delay for consistent user experience
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleTemplateSelect = (template) => {
    const formId = searchParams.get("formId");
    if (isFromEvaluation && formId) {
      // Force save form data before navigating back to prevent data loss
      const formCreationState = localStorage.getItem('formCreationState');
      if (formCreationState) {
        // Save to the new local storage manager format as well
        const formData = JSON.parse(formCreationState);
        FormSessionManager.saveFormData(formData);
      }

      // Set a flag in local storage to indicate that a certificate has been linked
      localStorage.setItem(`certificateLinked_${formId}`, 'true');
      // Navigate back to the form creation interface
      navigate(`/psas/evaluations?edit=${formId}`);
    } else {
      setInitialData(template.data);
      setView("editor");
    }
  };

  const handleBlankCanvas = () => {
    setInitialData(null);
    setView("editor");
  };

  // Show loading spinner while data is being initialized
  if (loading) {
    return (
      <PSASLayout>
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PSASLayout>
    );
  }

  if (view === "editor") {
    return (
      <PSASLayout>
        <CertificateEditor onBack={() => setView("gallery")} initialData={initialData} />
      </PSASLayout>
    );
  }

  return (
    <PSASLayout>
      <CertificateGallery onTemplateSelect={handleTemplateSelect} onBlankCanvas={handleBlankCanvas} isFromEvaluation={isFromEvaluation} />
    </PSASLayout>
  );
};

export default Certificates;
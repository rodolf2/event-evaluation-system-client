import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PSASLayout from "../../components/psas/PSASLayout";
import CertificateEditor from "../../components/psas/certificates/CertificateEditor";
import CertificateGallery from "../../components/psas/certificates/CertificateGallery";

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
    if (isFromEvaluation) {
      // Navigate back to evaluation with selected template
      navigate("/psas/evaluations?template=" + template.id);
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
import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { useAuth } from "../../contexts/useAuth";

const CertificateViewer = ({ formId, onDownload, onDone }) => {
  const { token } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [certificateImage, setCertificateImage] = useState(null);

  useEffect(() => {
    if (formId) {
      fetchUserCertificates();
    }
  }, [formId]);

  const fetchUserCertificates = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/certificates/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const userCertificates = data.data || [];
          setCertificates(userCertificates);
          
          // Find certificate for this specific form
          const formCertificate = userCertificates.find(
            cert => cert.formId?._id === formId || cert.eventId?._id === formId
          );
          
          if (formCertificate) {
            setSelectedCertificate(formCertificate);
            await fetchCertificateImage(formCertificate.certificateId);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCertificateImage = async (certificateId) => {
    try {
      const response = await fetch(`/api/certificates/download/${certificateId}?inline=true`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const pdfUrl = URL.createObjectURL(blob);
        setCertificateImage(pdfUrl);
      }
    } catch (error) {
      console.error("Error fetching certificate PDF:", error);
    }
  };

  const handleDownload = async () => {
    if (!selectedCertificate) return;
    
    try {
      const response = await fetch(`/api/certificates/download/${selectedCertificate.certificateId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Certificate_${selectedCertificate.userId?.name || 'Participant'}_${new Date().getFullYear()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        if (onDownload) {
          onDownload();
        }
      }
    } catch (error) {
      console.error("Error downloading certificate:", error);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center bg-white p-8 rounded-lg shadow-sm min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0C2A92] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your certificate...</p>
        </div>
      </div>
    );
  }

  if (!selectedCertificate && certificates.length > 0) {
    return (
      <div className="w-full flex items-center justify-center bg-white p-8 rounded-lg shadow-sm min-h-[400px]">
        <div className="text-center">
          <div className="text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">Certificate not found for this evaluation.</p>
          <button
            onClick={onDone}
            className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Action Buttons - Outside White Background */}
      <div className="w-full flex justify-end mb-6">
        <div className="flex gap-4">
          <button
            onClick={handleDownload}
            className="p-2 border-2 border-[#0C2A92] text-[#0C2A92] rounded-lg hover:bg-[#0C2A92] hover:text-white transition-colors bg-white shadow-sm"
            title="Download Certificate"
          >
            <Download className="w-5 h-5" />
          </button>
          
          <button
            onClick={onDone}
            className="px-4 py-2 bg-[#0C2A92] text-white font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm text-sm"
          >
            Done
          </button>
        </div>
      </div>
      
      {/* White Background Container */}
      <div className="w-full bg-white p-8 rounded-lg shadow-sm">

      {/* Certificate Display */}
      <div className="w-full max-w-4xl flex justify-center">
        {certificateImage ? (
          <div className="relative w-full">
            <iframe
              src={certificateImage}
              title="Certificate Preview"
              className="w-full h-auto rounded-lg shadow-lg border"
              style={{ minHeight: "600px", maxHeight: "800px" }}
            />
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <div className="text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">Certificate preview not available</p>
            <p className="text-sm text-gray-500">Use the download button above to save your certificate</p>
          </div>
        )}
      </div>

      {/* Certificate Info */}
      {selectedCertificate && (
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            <strong>Event:</strong> {selectedCertificate.eventId?.name || "Evaluation Event"}
          </p>
          <p>
            <strong>Type:</strong> {selectedCertificate.certificateType || "Certificate of Participation"}
          </p>
          <p>
            <strong>Issued:</strong> {new Date(selectedCertificate.createdAt).toLocaleDateString()}
          </p>
          <p>
            <strong>Participant:</strong> {selectedCertificate.userId?.name || "Participant"}
          </p>
        </div>
      )}
      </div>
    </div>
  );
};

export default CertificateViewer;
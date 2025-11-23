import { useState, useEffect } from "react";
import { Download, ArrowLeft } from "lucide-react";
import { useAuth } from "../../contexts/useAuth";

const CertificateViewer = ({ certificateId, onDownload, onDone }) => {
  const { token } = useAuth();
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [certificateImage, setCertificateImage] = useState(null);

  useEffect(() => {
    if (certificateId) {
      fetchCertificateData();
    }
  }, [certificateId]);

  const fetchCertificateData = async () => {
    try {
      setLoading(true);

      // First, try to get the certificate details
      const certResponse = await fetch(`/api/certificates/${certificateId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (certResponse.ok) {
        const certData = await certResponse.json();
        if (certData.success) {
          setSelectedCertificate(certData.data);
        }
      } else {
        // Fallback: get from user certificates list if direct fetch fails
        const listResponse = await fetch("/api/certificates/my", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (listResponse.ok) {
          const listData = await listResponse.json();
          if (listData.success) {
            const foundCert = listData.data.find(
              (cert) => cert.certificateId === certificateId
            );
            if (foundCert) {
              setSelectedCertificate(foundCert);
            }
          }
        }
      }

      // Load the PDF/image if certificate was found
      await fetchCertificateImage(certificateId);
    } catch (error) {
      console.error("Error fetching certificate:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCertificateImage = async (certificateId) => {
    try {
      const response = await fetch(
        `/api/certificates/download/${certificateId}?inline=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
      const response = await fetch(
        `/api/certificates/download/${selectedCertificate.certificateId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Certificate_${
          selectedCertificate.userId?.name || "Participant"
        }_${new Date().getFullYear()}.pdf`;
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

  if (!selectedCertificate) {
    return (
      <div className="w-full flex items-center justify-center bg-white p-8 rounded-lg shadow-sm min-h-[400px]">
        <div className="text-center">
          <div className="text-gray-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">Certificate not found.</p>
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
      {/* Action Buttons - Back on left, Actions on right */}
      <div className="w-full flex justify-between items-center mb-6">
        <button
          onClick={onDone}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>

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
        <div className="w-full max-w-3xl mx-auto flex justify-center">
          {certificateImage ? (
            <div
              className="relative w-full bg-gray-100 rounded-lg overflow-hidden"
              style={{ aspectRatio: "1056/816" }}
            >
              <embed
                src={`${certificateImage}#toolbar=0&navpanes=0&scrollbar=0`}
                type="application/pdf"
                className="w-full h-full rounded-lg"
                title="Certificate Preview"
              />
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <div className="text-gray-500 mb-4">
                <svg
                  className="w-16 h-16 mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">
                Certificate preview not available
              </p>
              <p className="text-sm text-gray-500">
                Use the download button above to save your certificate
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CertificateViewer;

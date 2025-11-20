import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ParticipantLayout from "../../components/participants/ParticipantLayout";
import { Search, Download, Eye } from "lucide-react";
import { useAuth } from "../../contexts/useAuth";
import toast from "react-hot-toast";
import CertificateViewer from "../../components/participants/CertificateViewer";

const Certificates = () => {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showCertificateViewer, setShowCertificateViewer] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        if (!user || !user._id) return;

        const response = await fetch(`/api/certificates/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          setCertificates(data.data || []);
        } else {
          console.error("Failed to fetch certificates:", data.message);
        }
      } catch (error) {
        console.error("Error fetching certificates:", error);
        toast.error("Failed to load certificates");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [user, token]);

  // Handle direct certificate viewing
  useEffect(() => {
    if (certificateId && certificates.length > 0) {
      const certificate = certificates.find(
        (cert) => cert.certificateId === certificateId
      );
      if (certificate) {
        setSelectedCertificate(certificate);
        setShowCertificateViewer(true);
      }
    }
  }, [certificateId, certificates]);

  const handleDownload = async (certificateId, certificate) => {
    try {
      const response = await fetch(
        `/api/certificates/download/${certificateId}`,
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
        // Use respondentName as fallback if userId is not populated
        const userName =
          certificate.userId?.name ||
          certificate.respondentName ||
          "Participant";
        a.download = `Certificate_${
          certificate.certificateId
        }_${userName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        toast.error("Failed to download certificate");
      }
    } catch (error) {
      console.error("Error downloading certificate:", error);
      toast.error("Failed to download certificate");
    }
  };

  const handleViewCertificate = (certificate) => {
    setSelectedCertificate(certificate);
    setShowCertificateViewer(true);
  };

  const handleCertificateViewerDone = () => {
    setShowCertificateViewer(false);
    setSelectedCertificate(null);
    // If we came from a direct link, navigate back to certificates list
    if (certificateId) {
      navigate("/participant/certificates");
    }
  };

  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch =
      cert.eventId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certificateType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || cert.certificateType === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    "All",
    ...new Set(
      certificates.map((cert) => cert.certificateType).filter(Boolean)
    ),
  ];

  // Show certificate viewer if requested
  if (showCertificateViewer && selectedCertificate) {
    return (
      <ParticipantLayout>
        <CertificateViewer
          certificateId={selectedCertificate.certificateId}
          onDownload={() =>
            handleDownload(
              selectedCertificate.certificateId,
              selectedCertificate
            )
          }
          onDone={handleCertificateViewerDone}
        />
      </ParticipantLayout>
    );
  }

  if (loading) {
    return (
      <ParticipantLayout>
        <div className="bg-gray-100 min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ParticipantLayout>
    );
  }

  return (
    <ParticipantLayout>
      <div className="bg-gray-100 min-h-screen pb-8">
        <div className="max-w-full px-4 md:px-8">
          <div className="flex items-center mb-8 gap-4">
            <div className="relative w-full sm:w-auto sm:flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search Certificates"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white p-3 rounded-lg border border-gray-300 flex items-center text-gray-700 w-full justify-center sm:w-auto appearance-none pr-8"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredCertificates.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">
                No certificates found
              </div>
              <div className="text-gray-400">
                Complete evaluations to earn certificates
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {filteredCertificates.map((cert) => (
                <div
                  key={cert._id}
                  className="bg-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-md mb-4 p-8 flex items-center justify-center">
                    <div className="text-6xl">🏆</div>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    {cert.eventId?.name || "Certificate"}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 capitalize">
                    {cert.certificateType}
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Issued: {new Date(cert.issuedDate).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handleViewCertificate(cert)}
                      className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      <Eye size={14} />
                      View
                    </button>
                    <button
                      onClick={() => handleDownload(cert.certificateId, cert)}
                      className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      <Download size={14} />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ParticipantLayout>
  );
};

export default Certificates;

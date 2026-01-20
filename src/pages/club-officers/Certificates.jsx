import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ClubOfficerLayout from "../../components/club-officers/ClubOfficerLayout";
import {
  SkeletonCard,
  SkeletonText,
  SkeletonBase,
} from "../../components/shared/SkeletonLoader";
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
  const [searchInput, setSearchInput] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showCertificateViewer, setShowCertificateViewer] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

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
        (cert) => cert.certificateId === certificateId,
      );
      if (certificate) {
        setSelectedCertificate(certificate);
        setShowCertificateViewer(true);
      }
    }
  }, [certificateId, certificates]);

  // State for certificate thumbnails
  const [certificateThumbnails, setCertificateThumbnails] = useState({});

  // Fetch certificate PDFs with authentication and create blob URLs
  useEffect(() => {
    const fetchCertificateThumbnails = async () => {
      for (const cert of certificates) {
        if (!certificateThumbnails[cert.certificateId]) {
          try {
            const response = await fetch(
              `/api/certificates/download/${cert.certificateId}?inline=true`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );

            if (response.ok) {
              const blob = await response.blob();
              const blobUrl = URL.createObjectURL(blob);
              setCertificateThumbnails((prev) => ({
                ...prev,
                [cert.certificateId]: blobUrl,
              }));
            }
          } catch (error) {
            console.error(
              `Error loading thumbnail for ${cert.certificateId}:`,
              error,
            );
          }
        }
      }
    };

    if (certificates.length > 0 && token) {
      fetchCertificateThumbnails();
    }

    // Cleanup blob URLs on unmount
    return () => {
      Object.values(certificateThumbnails).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [certificates, token]);

  const handleDownload = async (certificateId, certificate) => {
    try {
      const response = await fetch(
        `/api/certificates/download/${certificateId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
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
      navigate("/club-officer/certificates/my");
    }
  };

  const filteredCertificates = certificates
    .filter((cert) => {
      const eventName = cert.eventId?.name || "";
      const certType = cert.certificateType || "";

      const matchesSearch =
        eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        certType.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.issuedDate || 0);
      const dateB = new Date(b.issuedDate || 0);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  // Show certificate viewer if requested
  if (showCertificateViewer && selectedCertificate) {
    return (
      <ClubOfficerLayout>
        <CertificateViewer
          certificateId={selectedCertificate.certificateId}
          onDownload={() =>
            handleDownload(
              selectedCertificate.certificateId,
              selectedCertificate,
            )
          }
          onDone={handleCertificateViewerDone}
        />
      </ClubOfficerLayout>
    );
  }

  if (loading) {
    return (
      <ClubOfficerLayout>
        <div className="bg-gray-100 min-h-screen pb-8">
          <div className="max-w-full px-4 md:px-8">
            {/* Search and Filter Skeleton */}
            <div className="flex items-center mb-8 gap-4">
              <div className="relative w-full sm:w-auto sm:flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
                </div>
                <div className="w-full h-12 bg-gray-300 rounded-lg animate-pulse"></div>
              </div>
              <div className="relative">
                <div className="bg-gray-300 p-3 rounded-lg w-32 h-12 animate-pulse"></div>
              </div>
            </div>

            {/* Certificate Cards Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md p-4 text-center"
                >
                  <div
                    className="relative bg-gray-50 rounded-md mb-4 overflow-hidden"
                    style={{ aspectRatio: "1056/816" }}
                  >
                    <SkeletonBase className="w-full h-full" />
                  </div>
                  <div className="flex gap-2 justify-center">
                    <div className="bg-gray-300 px-3 py-1 rounded text-sm h-8 w-16 animate-pulse"></div>
                    <div className="bg-gray-300 px-3 py-1 rounded text-sm h-8 w-20 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ClubOfficerLayout>
    );
  }

  return (
    <ClubOfficerLayout>
      <div className="bg-gray-100 min-h-screen pb-8">
        <div className="max-w-full px-4 md:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center mb-8 gap-4">
            <div className="relative w-full sm:w-auto sm:flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative w-full sm:w-auto">
              <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 focus-within:ring-2 focus-within:ring-green-500">
                <span className="w-3 h-3 bg-[#2662D9] rounded-sm mr-2 shrink-0"></span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="bg-transparent py-3 pr-8 text-gray-700 appearance-none cursor-pointer focus:outline-none w-full text-sm"
                >
                  <option value="desc">Latest First</option>
                  <option value="asc">Oldest First</option>
                </select>
                <div className="absolute right-3 pointer-events-none">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
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
                  <div
                    className="relative bg-gray-50 rounded-md mb-4 overflow-hidden flex items-center justify-center"
                    style={{ aspectRatio: "1056/816" }}
                  >
                    {certificateThumbnails[cert.certificateId] ? (
                      <embed
                        src={`${
                          certificateThumbnails[cert.certificateId]
                        }#toolbar=0&navpanes=0&scrollbar=0`}
                        type="application/pdf"
                        className="w-full h-full"
                        title={`Certificate preview for ${
                          cert.eventId?.name || "Certificate"
                        }`}
                      />
                    ) : (
                      <SkeletonBase className="w-full h-full" />
                    )}
                  </div>

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
    </ClubOfficerLayout>
  );
};

export default Certificates;

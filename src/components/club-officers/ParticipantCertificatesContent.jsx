import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/useAuth";
import { SkeletonCard } from "../shared/SkeletonLoader";

function ParticipantCertificatesContent() {
  const { token } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!token) return;

      try {
        const response = await fetch("/api/certificates/my-certificates", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCertificates(data.success ? data.data : []);
        }
      } catch (error) {
        console.error("Error fetching certificates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [token]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SkeletonCard showImage={true} />
        <SkeletonCard showImage={true} />
        <SkeletonCard showImage={true} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Certificates</h2>

        {certificates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No certificates found</p>
            <p className="text-gray-400 mt-2">You haven't earned any certificates yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <div
                key={certificate._id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="aspect-[4/3] bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-400">Certificate Preview</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  {certificate.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {certificate.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {new Date(certificate.issuedDate).toLocaleDateString()}
                  </span>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View Certificate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ParticipantCertificatesContent;
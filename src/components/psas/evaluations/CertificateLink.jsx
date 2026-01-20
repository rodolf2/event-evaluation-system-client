import { Award } from "lucide-react";

const CertificateLink = ({
  isCertificateLinked,
  currentFormId,
  onLinkCertificate,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Certificate</h3>

      <div className="space-y-4">
        {isCertificateLinked ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <Award className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="text-green-800 font-medium">Certificate Linked</p>
                <p className="text-green-600 text-sm">
                  Recipients will receive certificates upon completion
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Link a Certificate
              </h4>
              <p className="text-gray-600 mb-4">
                Optionally link a certificate that students will receive after
                completing the evaluation.
              </p>
              <button
                onClick={onLinkCertificate}
                disabled={!currentFormId}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {currentFormId ? "Choose Certificate" : "Publish form first"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateLink;

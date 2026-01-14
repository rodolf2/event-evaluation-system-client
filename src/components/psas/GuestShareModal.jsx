import { useState, useEffect } from "react";
import { X, Mail, Copy, Check, Send, Clock, Users, Link2 } from "lucide-react";
import { useAuth } from "../../contexts/useAuth";
import { toast } from "react-hot-toast";

const GuestShareModal = ({ isOpen, onClose, reportId, reportTitle }) => {
  const { token } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [expirationDays, setExpirationDays] = useState(48);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedToken, setGeneratedToken] = useState(null);
  const [existingTokens, setExistingTokens] = useState([]);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("create");

  useEffect(() => {
    if (isOpen && reportId) {
      fetchExistingTokens();
    }
  }, [isOpen, reportId]);

  const fetchExistingTokens = async () => {
    setLoadingTokens(true);
    try {
      const response = await fetch(`/api/guest/tokens/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setExistingTokens(data.data);
      }
    } catch (error) {
      console.error("Error fetching tokens:", error);
    } finally {
      setLoadingTokens(false);
    }
  };

  const handleGenerateToken = async (e) => {
    e.preventDefault();
    if (!email || !name) {
      toast.error("Please enter both name and email");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/guest/generate-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          name,
          reportId,
          expirationDays,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedToken(data.data);
        toast.success("Access token generated successfully!");
        fetchExistingTokens();
      } else {
        toast.error(data.message || "Failed to generate token");
      }
    } catch (error) {
      console.error("Error generating token:", error);
      toast.error("Failed to generate token");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = async (tokenId) => {
    try {
      const response = await fetch(`/api/guest/send-email/${tokenId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Access email sent successfully!");
        fetchExistingTokens();
      } else {
        toast.error(data.message || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email");
    }
  };

  const handleRevokeToken = async (tokenId) => {
    try {
      const response = await fetch(`/api/guest/revoke/${tokenId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Access revoked successfully");
        fetchExistingTokens();
      } else {
        toast.error(data.message || "Failed to revoke access");
      }
    } catch (error) {
      console.error("Error revoking token:", error);
      toast.error("Failed to revoke access");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setEmail("");
    setName("");
    setExpirationDays(48);
    setGeneratedToken(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-[#1F3463] to-[#2d4a8c]">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Share Report with Guest Speaker
            </h2>
            <p className="text-sm text-blue-200 truncate max-w-md">
              {reportTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("create")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "create"
                ? "text-[#1F3463] border-b-2 border-[#1F3463] bg-blue-50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Send className="w-4 h-4 inline mr-2" />
            Create Access
          </button>
          <button
            onClick={() => setActiveTab("manage")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "manage"
                ? "text-[#1F3463] border-b-2 border-[#1F3463] bg-blue-50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Manage Access ({existingTokens.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === "create" ? (
            <div>
              {generatedToken ? (
                /* Success State */
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                      <Check className="w-5 h-5" />
                      Access Token Generated!
                    </div>
                    <p className="text-sm text-green-600">
                      Share this link with {generatedToken.name} or send via
                      email.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Access Link
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={generatedToken.accessLink}
                        className="flex-1 px-3 py-2 border rounded-lg bg-white text-sm"
                      />
                      <button
                        onClick={() =>
                          copyToClipboard(generatedToken.accessLink)
                        }
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSendEmail(generatedToken.tokenId)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#1F3463] text-white rounded-lg hover:bg-[#2d4a8c] transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Send Email to {generatedToken.email}
                    </button>
                    <button
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Create Another
                    </button>
                  </div>
                </div>
              ) : (
                /* Create Form */
                <form onSubmit={handleGenerateToken} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Guest Speaker Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter guest speaker's name"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1F3463] focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1F3463] focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Access Duration (Hours)
                    </label>
                    <select
                      value={expirationDays}
                      onChange={(e) =>
                        setExpirationDays(Number(e.target.value))
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1F3463] focus:border-transparent"
                    >
                      <option value={48}>48 hours</option>
                      <option value={72}>72 hours</option>
                      <option value={96}>96 hours</option>
                      <option value={120}>120 hours</option>
                      <option value={144}>144 hours</option>
                      <option value={168}>168 hours (7 days)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1F3463] text-white rounded-lg hover:bg-[#2d4a8c] transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Link2 className="w-4 h-4" />
                        Generate Access Link
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Manage Tab */
            <div>
              {loadingTokens ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-gray-300 border-t-[#1F3463] rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-gray-500 mt-2">Loading...</p>
                </div>
              ) : existingTokens.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No guest access tokens created yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {existingTokens.map((t) => (
                    <div
                      key={t.id}
                      className={`border rounded-lg p-4 ${
                        t.revoked
                          ? "bg-red-50 border-red-200"
                          : !t.isValid
                          ? "bg-gray-50 border-gray-200"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            {t.name}
                          </div>
                          <div className="text-sm text-gray-500">{t.email}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            Expires:{" "}
                            {new Date(t.expiresAt).toLocaleDateString()}
                            {t.accessCount > 0 && (
                              <span className="ml-2">
                                • Accessed {t.accessCount}x
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {t.revoked ? (
                            <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                              Revoked
                            </span>
                          ) : !t.isValid ? (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                              Expired
                            </span>
                          ) : (
                            <>
                              {!t.emailSent && (
                                <button
                                  onClick={() => handleSendEmail(t.id)}
                                  className="p-2 hover:bg-blue-100 rounded-lg text-blue-600"
                                  title="Send Email"
                                >
                                  <Mail className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    `${window.location.origin}/guest/access?token=${t.token}`
                                  )
                                }
                                className="p-2 hover:bg-gray-100 rounded-lg"
                                title="Copy Link"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRevokeToken(t.id)}
                                className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                                title="Revoke Access"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      {t.emailSent && (
                        <div className="text-xs text-green-600 mt-2">
                          ✓ Email sent on{" "}
                          {new Date(t.emailSentAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestShareModal;

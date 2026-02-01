import { useState, useEffect } from "react";
import { Save, Palette, Type, User, FileText } from "lucide-react";
import toast from "react-hot-toast";

const CertificateCustomizer = ({ formId, onSave, onClose }) => {
  const [customizations, setCustomizations] = useState({
    // Branding
    organizationName: "La Verdad Christian College",
    organizationLogo: "",

    // Colors
    primaryColor: "#0f3b66",
    secondaryColor: "#c89d28",

    // Text content
    customTitle: "Certificate of Participation",
    customSubtitle: "This certificate is proudly presented to",
    customMessage: "",

    // Signatures
    signature1Name: "Dr. Sharene T. Labung",
    signature1Title: "Chancellor / Administrator",
    signature2Name: "Luckie Kristine Villanueva",
    signature2Title: "PSAS Department Head",

    // Download options
    defaultDownloadFormat: "pdf",

    // Display options
    includeEventDate: true,
    includeCompletionDate: true,
    includeFormTitle: true,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (formId) {
      loadCustomizations();
    }
  }, [formId]);

  const loadCustomizations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/certificates/customizations/${formId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      if (data.success && data.data.customizations) {
        setCustomizations(prev => ({
          ...prev,
          ...data.data.customizations,
        }));
      }
    } catch (error) {
      console.error("Error loading customizations:", error);
      toast.error("Failed to load certificate customizations");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/certificates/customizations/${formId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(customizations),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Certificate customizations saved successfully");
        if (onSave) onSave(customizations);
        if (onClose) onClose();
      } else {
        toast.error(data.message || "Failed to save customizations");
      }
    } catch (error) {
      console.error("Error saving customizations:", error);
      toast.error("Failed to save certificate customizations");
    } finally {
      setSaving(false);
    }
  };

  const updateCustomization = (field, value) => {
    setCustomizations(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Palette className="w-6 h-6" />
          Certificate Customization
        </h2>
        <p className="text-gray-600 mt-1">
          Customize the appearance and content of certificates for this form
        </p>
      </div>

      <div className="p-6 space-y-8">
        {/* Branding Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Branding
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name
              </label>
              <input
                type="text"
                value={customizations.organizationName}
                onChange={(e) => updateCustomization("organizationName", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter organization name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Logo URL (optional)
              </label>
              <input
                type="url"
                value={customizations.organizationLogo}
                onChange={(e) => updateCustomization("organizationLogo", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>
        </div>

        {/* Color Scheme */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Color Scheme
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={customizations.primaryColor}
                  onChange={(e) => updateCustomization("primaryColor", e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={customizations.primaryColor}
                  onChange={(e) => updateCustomization("primaryColor", e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="#0f3b66"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={customizations.secondaryColor}
                  onChange={(e) => updateCustomization("secondaryColor", e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={customizations.secondaryColor}
                  onChange={(e) => updateCustomization("secondaryColor", e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="#c89d28"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Type className="w-5 h-5" />
            Certificate Text
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certificate Title
              </label>
              <input
                type="text"
                value={customizations.customTitle}
                onChange={(e) => updateCustomization("customTitle", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Certificate of Participation"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certificate Subtitle
              </label>
              <input
                type="text"
                value={customizations.customSubtitle}
                onChange={(e) => updateCustomization("customSubtitle", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="This certificate is proudly presented to"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Message (optional)
              </label>
              <textarea
                value={customizations.customMessage}
                onChange={(e) => updateCustomization("customMessage", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a custom message that will appear on all certificates..."
              />
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5" />
            Signature Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Left Signature</h4>
              <input
                type="text"
                value={customizations.signature1Name}
                onChange={(e) => updateCustomization("signature1Name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Signature 1 Name"
              />
              <input
                type="text"
                value={customizations.signature1Title}
                onChange={(e) => updateCustomization("signature1Title", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Signature 1 Title"
              />
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Right Signature</h4>
              <input
                type="text"
                value={customizations.signature2Name}
                onChange={(e) => updateCustomization("signature2Name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Signature 2 Name"
              />
              <input
                type="text"
                value={customizations.signature2Title}
                onChange={(e) => updateCustomization("signature2Title", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Signature 2 Title"
              />
            </div>
          </div>
        </div>

        {/* Display Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Display Options</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={customizations.includeEventDate}
                onChange={(e) => updateCustomization("includeEventDate", e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Include event date on certificate</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={customizations.includeCompletionDate}
                onChange={(e) => updateCustomization("includeCompletionDate", e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Include completion date on certificate</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={customizations.includeFormTitle}
                onChange={(e) => updateCustomization("includeFormTitle", e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Include form title in certificate description</span>
            </label>
          </div>
        </div>
      </div>

      <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Customizations"}
        </button>
      </div>
    </div>
  );
};

export default CertificateCustomizer;
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/useAuth";
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  ArrowLeft,
  Filter,
  Check,
  X,
  Languages,
  Smile,
  Frown,
  Meh,
  Save,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ConfirmationModal from "../../components/shared/ConfirmationModal";

const LexiconManagement = () => {
  const { token, currentUser } = useAuth();
  const navigate = useNavigate();
  const [lexicon, setLexicon] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("all");
  const [filterSentiment, setFilterSentiment] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [wordToDelete, setWordToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // New word form state
  const [formData, setFormData] = useState({
    word: "",
    sentiment: "positive",
    weight: 1.0,
    language: "en",
    isPhrase: false,
  });

  const fetchLexicon = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/lexicon", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setLexicon(data.data);
      } else {
        toast.error(data.message || "Failed to fetch lexicon");
      }
    } catch (error) {
      console.error("Error fetching lexicon:", error);
      toast.error("An error occurred while fetching lexicon");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchLexicon();
  }, [fetchLexicon]);

  const handleOpenModal = (word = null) => {
    if (word) {
      setEditingWord(word);
      setFormData({
        word: word.word,
        sentiment: word.sentiment,
        weight: word.weight,
        language: word.language,
        isPhrase: word.isPhrase,
      });
    } else {
      setEditingWord(null);
      setFormData({
        word: "",
        sentiment: "positive",
        weight: 1.0,
        language: "en",
        isPhrase: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingWord(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const url = editingWord
        ? `/api/lexicon/${editingWord._id}`
        : "/api/lexicon";
      const method = editingWord ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(editingWord ? "Word updated" : "Word added");
        fetchLexicon();
        handleCloseModal();
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error saving lexicon item:", error);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id) => {
    setWordToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!wordToDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/lexicon/${wordToDelete}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Word removed from lexicon");
        setLexicon(lexicon.filter((item) => item._id !== wordToDelete));
        setShowDeleteConfirm(false);
      } else {
        toast.error(data.message || "Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting lexicon item:", error);
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
      setWordToDelete(null);
    }
  };

  const filteredLexicon = lexicon.filter((item) => {
    const matchesSearch = item.word
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesLanguage =
      filterLanguage === "all" || item.language === filterLanguage;
    const matchesSentiment =
      filterSentiment === "all" || item.sentiment === filterSentiment;
    return matchesSearch && matchesLanguage && matchesSentiment;
  });

  const SentimentBadge = ({ sentiment }) => {
    const config = {
      positive: {
        icon: Smile,
        color: "bg-green-100 text-green-700",
        label: "Positive",
      },
      negative: {
        icon: Frown,
        color: "bg-red-100 text-red-700",
        label: "Negative",
      },
      neutral: {
        icon: Meh,
        color: "bg-gray-100 text-gray-700",
        label: "Neutral",
      },
    };
    const { icon: Icon, color, label } = config[sentiment];
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
      >
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (window.location.pathname.startsWith("/psas")) {
                  navigate("/psas/system-controls");
                } else {
                  navigate("/mis/settings");
                }
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                Sentiment Lexicon
              </h1>
              <p className="text-gray-500 text-sm">
                Manage Keywords & Dictionary for Feedback Analysis
              </p>
            </div>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Add New Word
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search words or phrases..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-gray-400" />
            <select
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
            >
              <option value="all">All Languages</option>
              <option value="en">English (EN)</option>
              <option value="tl">Tagalog (TL)</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={filterSentiment}
              onChange={(e) => setFilterSentiment(e.target.value)}
            >
              <option value="all">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="negative">Negative</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lexicon Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-gray-500 animate-pulse">Loading dictionary...</p>
          </div>
        ) : filteredLexicon.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-500">
            <Search className="w-12 h-12 mb-2 opacity-20" />
            <p>No words matched your criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Word / Phrase
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Language
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Sentiment
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                    Weight
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLexicon.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {item.word}
                        </span>
                        {item.isPhrase && (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-[10px] font-bold text-blue-700 rounded uppercase">
                            Phrase
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-bold uppercase">
                        {item.language}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <SentimentBadge sentiment={item.sentiment} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-gray-700 bg-gray-50 px-2 py-1 rounded">
                        x{item.weight.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {editingWord ? "Edit Lexicon Word" : "Add New Word"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1 text-gray-400 hover:bg-gray-200 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Word or Phrase
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingWord}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition disabled:bg-gray-50 disabled:text-gray-500"
                  value={formData.word}
                  onChange={(e) =>
                    setFormData({ ...formData, word: e.target.value })
                  }
                  placeholder="e.g., excellent or okay lang"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.language}
                    onChange={(e) =>
                      setFormData({ ...formData, language: e.target.value })
                    }
                  >
                    <option value="en">English (EN)</option>
                    <option value="tl">Tagalog (TL)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sentiment
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.sentiment}
                    onChange={(e) =>
                      setFormData({ ...formData, sentiment: e.target.value })
                    }
                  >
                    <option value="positive">Positive</option>
                    <option value="negative">Negative</option>
                    <option value="neutral">Neutral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight ({formData.weight.toFixed(1)})
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="5.0"
                  step="0.1"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      weight: parseFloat(e.target.value),
                    })
                  }
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>Subtle (0.1)</span>
                  <span>Strong (5.0)</span>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={formData.isPhrase}
                  onChange={(e) =>
                    setFormData({ ...formData, isPhrase: e.target.checked })
                  }
                />
                <div>
                  <div className="text-sm font-medium text-gray-700">
                    Is this a phrase?
                  </div>
                  <div className="text-xs text-gray-400">
                    Phrases are matched exactly as written
                  </div>
                </div>
              </label>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {editingWord ? "Update" : "Save Word"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Word"
        message="Are you sure you want to delete this word from the lexicon? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default LexiconManagement;

import { useState, useEffect } from "react";
import {
  X,
  Edit,
  Trash2,
  Copy,
  Plus,
  Save,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Question from "./Question";

const QuestionPreviewModal = ({
  isOpen,
  onClose,
  questions,
  sections,
  onUpdateQuestion,
  onDuplicateQuestion,
  onRemoveQuestion,
  onAddQuestion,
}) => {
  const [editingQuestions, setEditingQuestions] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Combine all questions from main questions and sections
      const allQuestions = [
        ...questions,
        ...sections.flatMap((s) => s.questions || []),
      ];
      setEditingQuestions(allQuestions);
      setHasChanges(false);
    }
  }, [isOpen, questions, sections]);

  const handleSaveChanges = () => {
    // Here you would typically send the changes back to the parent
    // For now, we'll just close the modal
    setHasChanges(false);
    onClose();
  };

  const handleQuestionUpdate = (questionId, updateFn) => {
    setEditingQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? updateFn(q) : q))
    );
    setHasChanges(true);
  };

  const handleDuplicateQuestion = (questionId) => {
    const question = editingQuestions.find((q) => q.id === questionId);
    if (question) {
      const newQuestion = {
        ...question,
        id: Date.now() + Math.floor(Math.random() * 1000),
        title: `${question.title} (Copy)`,
      };
      setEditingQuestions((prev) => [...prev, newQuestion]);
      setHasChanges(true);
    }
  };

  const handleRemoveQuestion = (questionId) => {
    setEditingQuestions((prev) => prev.filter((q) => q.id !== questionId));
    setHasChanges(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Preview & Edit Questions
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Review and edit the extracted questions before creating your form
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 max-h-[calc(90vh-140px)]">
          {editingQuestions.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Questions Found
              </h3>
              <p className="text-gray-600 mb-6">
                No questions were extracted from your file. You can add questions manually.
              </p>
              <button
                onClick={onAddQuestion}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Questions ({editingQuestions.length})
                </h3>
                <button
                  onClick={onAddQuestion}
                  className="inline-flex items-center px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Question
                </button>
              </div>

              <div className="space-y-4">
                {editingQuestions.map((question, index) => (
                  <div
                    key={question.id}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-600">
                        Question {index + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDuplicateQuestion(question.id)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Duplicate question"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveQuestion(question.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Remove question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <Question
                      {...question}
                      updateQuestion={(updateFn) =>
                        handleQuestionUpdate(question.id, updateFn)
                      }
                      duplicateQuestion={() => handleDuplicateQuestion(question.id)}
                      removeQuestion={() => handleRemoveQuestion(question.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>{editingQuestions.length} questions ready</span>
            </div>
            {hasChanges && (
              <span className="text-sm text-orange-600 font-medium">
                You have unsaved changes
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              className={`px-4 py-2 rounded-lg transition-colors ${
                hasChanges
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-400 text-gray-200 cursor-not-allowed"
              }`}
              disabled={!hasChanges}
            >
              <Save className="w-4 h-4 inline mr-2" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionPreviewModal;
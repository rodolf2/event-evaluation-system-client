import { useState, useCallback } from "react";
import {
  Plus,
  Calendar,
  RotateCcw,
  RotateCw,
  UserPlus,
  AlignLeft,
  MoreVertical,
  Star,
  ChevronsDownUp,
} from "lucide-react";
import { templates } from "../../../templates";
import Question from "./Question";
import Section from "./Section";
import ImportCSVModal from "./ImportCSVModal";

const FormCreationInterface = ({ onBack }) => {
  const [questions, setQuestions] = useState([]);
  const [sections, setSections] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isCertificateLinked, setIsCertificateLinked] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const makeId = () => Date.now() + Math.floor(Math.random() * 1000);

  const addQuestion = (sectionId = null) => {
    const newQuestion = {
      id: makeId(),
      type: "Multiple Choices",
      title: "",
      options: ["Option 1"],
      ratingScale: 5,
      emojiStyle: "Default",
      required: false,
      likertStart: 1,
      likertEnd: 5,
      likertStartLabel: "Poor",
      likertEndLabel: "Excellent",
    };

    if (sectionId) {
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? { ...s, questions: [...(s.questions || []), newQuestion] }
            : s
        )
      );
    } else {
      setQuestions((prev) => [...prev, newQuestion]);
    }
  };

  const addSection = () => {
    const newId =
      sections.length > 0 ? Math.max(...sections.map((s) => s.id)) + 1 : 1;
    setSections((prev) => [
      ...prev,
      {
        id: newId,
        title: "Untitled Section",
        description: "Add a description",
        questions: [],
      },
    ]);
  };

  const updateQuestion = useCallback((questionId, updateFn) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? updateFn(q) : q))
    );
    setSections((prevSections) =>
      prevSections.map((s) => ({
        ...s,
        questions: (s.questions || []).map((q) =>
          q.id === questionId ? updateFn(q) : q
        ),
      }))
    );
  }, []);

  const duplicateQuestion = useCallback((id) => {
    setQuestions((prev) => {
      const q = prev.find((x) => x.id === id);
      if (q) {
        const copy = { ...q, id: makeId() };
        return [...prev, copy];
      }
      return prev;
    });

    setSections((prevSections) =>
      prevSections.map((s) => {
        const newQuestions = [];
        (s.questions || []).forEach((q) => {
          newQuestions.push(q);
          if (q.id === id) newQuestions.push({ ...q, id: makeId() });
        });
        return { ...s, questions: newQuestions };
      })
    );
  }, []);

  const removeQuestion = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    setSections((prev) =>
      prev.map((s) => ({
        ...s,
        questions: (s.questions || []).filter((q) => q.id !== id),
      }))
    );
  };

  const removeSection = (id) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="text-gray-700 hover:text-black mr-4"
            >
              <Plus size={24} className="rotate-45" />
            </button>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              {!selectedDate && (
                <span className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                  Pick a date
                </span>
              )}
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full sm:w-48 ${
                  selectedDate ? "text-gray-800" : "text-transparent"
                }`}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-full">
              <RotateCcw className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-full">
              <RotateCw className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-gray-600 hover:bg-gray-200 rounded-full"
              onClick={() => setShowImportModal(true)}
            >
              <UserPlus className="w-5 h-5" />
            </button>
            <button className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition">
              Publish
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-center relative">
          <div className="w-full max-w-4xl">
            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-10 mb-6 relative min-h-[220px]">
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <MoreVertical size={20} />
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-20 border">
                    <a
                      href="#"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Star size={16} className="mr-3" /> Star
                    </a>
                    <a
                      href="#"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <ChevronsDownUp size={16} className="mr-3" /> Move to
                      folder
                    </a>
                  </div>
                )}
              </div>

              <input
                type="text"
                defaultValue="Untitled Form"
                className="text-3xl sm:text-5xl font-bold w-full border-none outline-none mb-4"
              />
              <textarea
                placeholder="Add a description"
                className="w-full text-base sm:text-lg text-gray-600 border-none outline-none resize-none"
                rows={1}
              />
            </div>

            {questions.map((q) => (
              <Question
                key={q.id}
                {...q}
                updateQuestion={updateQuestion}
                duplicateQuestion={duplicateQuestion}
                removeQuestion={removeQuestion}
              />
            ))}
          </div>

          <div className="mt-4 md:ml-6 md:mt-0 hidden md:flex flex-col gap-2">
            <div className="bg-white rounded-lg shadow-sm p-2 border flex flex-col gap-2">
              <button
                onClick={() => {
                  addQuestion();
                }}
                className="p-3 hover:bg-gray-200 rounded-full"
              >
                <Plus size={20} className="text-gray-700" />
              </button>
              <button
                onClick={() => addSection()}
                className="p-3 hover:bg-gray-200 rounded-full"
              >
                <AlignLeft size={20} className="text-gray-700" />
              </button>
            </div>
          </div>
        </div>

        {sections.map((s) => (
          <div
            className="flex flex-col md:flex-row justify-center relative"
            key={s.id}
          >
            <div className="w-full max-w-4xl">
              <Section {...s} onRemove={removeSection} />
              {(s.questions || []).map((q) => (
                <Question
                  key={q.id}
                  {...q}
                  updateQuestion={updateQuestion}
                  duplicateQuestion={duplicateQuestion}
                  removeQuestion={removeQuestion}
                />
              ))}
            </div>

            <div className="mt-4 md:ml-6 md:mt-14 hidden md:flex flex-col gap-2">
              <div className="bg-white rounded-lg shadow-sm p-2 border flex flex-col gap-2">
                <button
                  onClick={() => addQuestion(s.id)}
                  className="p-3 hover:bg-gray-200 rounded-full"
                >
                  <Plus size={20} className="text-gray-700" />
                </button>
                <button
                  onClick={() => addSection()}
                  className="p-3 hover:bg-gray-200 rounded-full"
                >
                  <AlignLeft size={20} className="text-gray-700" />
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-center py-8 bg-gray-100">
          <button
            onClick={() => setShowCertificateModal(true)}
            className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors ${
              isCertificateLinked
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-500 hover:bg-gray-600"
            }`}
          >
            {isCertificateLinked ? "Certificate Linked" : "Link Certificate"}
          </button>
        </div>

        <div className="md:hidden fixed bottom-6 right-6 z-30">
          {isFabOpen && (
            <div className="flex flex-col items-center gap-3 mb-3">
              <button
                onClick={() => {
                  addSection();
                  setIsFabOpen(false);
                }}
                className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center"
              >
                <AlignLeft size={24} className="text-gray-700" />
              </button>
              <button
                onClick={() => {
                  addQuestion();
                  setIsFabOpen(false);
                }}
                className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center"
              >
                <Plus size={24} className="text-gray-700" />
              </button>
            </div>
          )}
          <button
            onClick={() => setIsFabOpen(!isFabOpen)}
            className="w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center"
          >
            <Plus
              size={32}
              className={`transition-transform duration-300 ${
                isFabOpen ? "rotate-45" : "rotate-0"
              }`}
            />
          </button>
        </div>

        {showCertificateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl z-60">
              <h2 className="text-2xl font-bold mb-4">
                Choose a Certificate Template
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[70vh] overflow-y-auto">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="relative border rounded-lg p-4 text-center hover:shadow-lg hover:border-blue-500 cursor-pointer group"
                  >
                    <div className="bg-gray-200 h-32 flex items-center justify-center rounded-md overflow-hidden">
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-gray-700 font-semibold mt-2">
                      {template.name}
                    </p>
                    <div className="absolute inset-0 bg-[#5F6368] bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                      <button
                        onClick={() => {
                          setSelectedTemplateId(template.id);
                          setIsCertificateLinked(true);
                          setShowCertificateModal(false);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <ImportCSVModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
        />
      </div>
    </div>
  );
};

export default FormCreationInterface;
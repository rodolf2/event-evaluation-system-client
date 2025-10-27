import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Upload,
  Link as LinkIcon,
  FileText,
  X,
} from "lucide-react";
import Question from "./Question";
import Section from "./Section";
import ImportCSVModal from "./ImportCSVModal";
import { useAuth } from "../../../contexts/useAuth";
import toast from "react-hot-toast";

const FormCreationInterface = ({ onBack }) => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [sections, setSections] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  // Event date range state (for future use)
  // const eventStartDate = null;
  // const eventEndDate = null;
  const [isFabOpen, setIsFabOpen] = useState(false);
  // Certificate linking state (for future use)
  // const isCertificateLinked = false;
  const [showImportModal, setShowImportModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [formTitle, setFormTitle] = useState("Untitled Form");
  const [formDescription, setFormDescription] = useState("Form Description");
  // Loading state (for future use)
  // const isLoading = false;

  // Upload functionality states
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedLinks, setUploadedLinks] = useState([]);

  const makeId = () => Date.now() + Math.floor(Math.random() * 1000);

  // Check for uploaded form data on component mount
  useEffect(() => {
    const fetchUploadedForm = async () => {
      const uploadedFormId = sessionStorage.getItem("uploadedFormId");

      if (uploadedFormId && token) {
        // Loading state disabled
        try {
          const response = await fetch(`/api/forms/${uploadedFormId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              const form = data.data;

              // Set form title and description
              setFormTitle(form.title || "Untitled Form");
              setFormDescription(form.description || "Form Description");

              // Use clientQuestions if available, otherwise map from questions
              if (form.clientQuestions && form.clientQuestions.length > 0) {
                setQuestions(
                  form.clientQuestions.map((q) => ({
                    ...q,
                    id: makeId(),
                  }))
                );
              } else if (form.questions && form.questions.length > 0) {
                // Map backend question format to client format
                setQuestions(
                  form.questions.map((q) => {
                    // Convert backend question type to client format
                    let clientType = "Paragraph";
                    switch (q.type) {
                      case "multiple_choice":
                        clientType = "Multiple Choices";
                        break;
                      case "short_answer":
                        clientType = "Short Answer";
                        break;
                      case "paragraph":
                        clientType = "Paragraph";
                        break;
                      case "scale":
                        clientType = "Scale";
                        break;
                      case "date":
                        clientType = "Date";
                        break;
                      case "time":
                        clientType = "Time";
                        break;
                      case "file_upload":
                        clientType = "File Upload";
                        break;
                      default:
                        clientType = "Paragraph";
                    }

                    return {
                      id: makeId(),
                      title: q.title || "Untitled Question",
                      type: clientType,
                      required: q.required || false,
                      options: q.options || [],
                      ratingScale: q.high || 5,
                      likertStart: q.low || 1,
                      likertStartLabel: q.lowLabel || "Poor",
                      likertEndLabel: q.highLabel || "Excellent",
                      emojiStyle: "Default",
                    };
                  })
                );
              }

              // Set uploaded files and links
              if (form.uploadedFiles && form.uploadedFiles.length > 0) {
                setUploadedFiles(form.uploadedFiles);
              }

              if (form.uploadedLinks && form.uploadedLinks.length > 0) {
                setUploadedLinks(form.uploadedLinks);
              }

              toast.success("Form loaded successfully!");
            }
          } else {
            toast.error("Failed to load the uploaded form");
          }
        } catch (error) {
          console.error("Error loading form:", error);
          toast.error("An error occurred while loading the form");
        } finally {
          // Loading state disabled
          // Clear the uploaded form ID from session storage
          sessionStorage.removeItem("uploadedFormId");
        }
      }
    };

    fetchUploadedForm();
  }, [token]);

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

  // Upload functionality
  const handleLinkUpload = async (links) => {
    try {
      // For now, just add to local state since we don't have a form ID yet
      const newLinks = links.map((link) => ({
        url: link.url,
        title: link.title || "",
        description: link.description || "",
        uploadedAt: new Date(),
      }));

      setUploadedLinks((prev) => [...prev, ...newLinks]);
    } catch (error) {
      console.error("Error handling links:", error);
    }
  };

  const removeUploadedFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Map client question format to backend format
  const mapQuestionsToBackend = (clientQuestions) => {
    return clientQuestions.map((q) => {
      let type = "short_answer";
      switch (q.type) {
        case "Multiple Choices":
          type = "multiple_choice";
          break;
        case "Short Answer":
          type = "short_answer";
          break;
        case "Paragraph":
          type = "paragraph";
          break;
        case "Scale":
          type = "scale";
          break;
        case "Date":
          type = "date";
          break;
        case "Time":
          type = "time";
          break;
        case "File Upload":
          type = "file_upload";
          break;
        default:
          type = "short_answer";
      }

      return {
        title: q.title || "Untitled Question",
        type: type,
        required: q.required || false,
        options: q.options || [],
        low: q.likertStart || 1,
        high: q.ratingScale || 5,
        lowLabel: q.likertStartLabel || "Poor",
        highLabel: q.likertEndLabel || "Excellent",
      };
    });
  };

  // Handle form publishing
  const handlePublish = async () => {
    // Flatten questions from sections and main questions
    const allQuestions = [
      ...questions,
      ...sections.flatMap((s) => s.questions || []),
    ];

    if (allQuestions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    const backendQuestions = mapQuestionsToBackend(allQuestions);

    const formData = {
      title: formTitle,
      description: formDescription,
      questions: backendQuestions,
      createdBy: user?._id,
      uploadedFiles: uploadedFiles,
      uploadedLinks: uploadedLinks,
    };

    setIsPublishing(true);
    try {
      // First create the blank form
      const createResponse = await fetch("/api/forms/blank", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const createData = await createResponse.json();

      if (createData.success && createData.data && createData.data.form) {
        // Then publish the form to generate shareable link
        const publishResponse = await fetch(
          `/api/forms/${createData.data.form._id}/publish`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              questions: backendQuestions,
            }),
          }
        );

        const publishData = await publishResponse.json();

        if (publishData.success) {
          toast.success("Form published successfully!");
          // Show the shareable link to the user
          if (publishData.data && publishData.data.shareableLink) {
            toast.success(`Shareable link: ${publishData.data.shareableLink}`);
          }

          // Clear the form inputs after successful publishing
          setFormTitle("Untitled Form");
          setFormDescription("Form Description");
          setQuestions([]);
          setSections([]);
          setUploadedFiles([]);
          setUploadedLinks([]);
          setSelectedDate("");
          // Event dates will be cleared when implemented

          navigate("/psas/evaluations");
        } else {
          toast.error(
            `Error publishing form: ${publishData.message || "Unknown error"}`
          );
        }
      } else {
        toast.error(
          `Error creating form: ${createData.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error publishing form:", error);
      toast.error(`Failed to publish form: ${error.message}`);
    } finally {
      setIsPublishing(false);
    }
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
            <div className="flex items-center gap-4">
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
            <div className="flex gap-2">
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className={`px-6 py-2 font-semibold rounded-md transition ${
                  isPublishing
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isPublishing ? "Publishing..." : "Publish"}
              </button>
            </div>
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
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="text-3xl sm:text-5xl font-bold w-full border-none outline-none mb-4"
              />
              <textarea
                placeholder="Add a description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
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
            onClick={() => navigate("/psas/certificates?from=evaluation")}
            className="px-8 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Link Certificate
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

        {/* Upload Modal - Removed since functionality moved to ImportCSVModal */}

        {/* Display uploaded files and links */}
        {(uploadedFiles.length > 0 || uploadedLinks.length > 0) && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">
              Uploaded Files & Links
            </h3>

            {uploadedFiles.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Files</h4>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                    >
                      <div className="flex items-center gap-3">
                        <FileText size={20} className="text-gray-500" />
                        <div>
                          <p className="font-medium">
                            {file.originalName || file.filename || "File"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {file.size
                              ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                              : "Unknown size"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeUploadedFile(index)}
                        className="p-1 text-red-500 hover:bg-red-100 rounded"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {uploadedLinks.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Links</h4>
                <div className="space-y-2">
                  {uploadedLinks.map((link, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                    >
                      <div className="flex items-center gap-3">
                        <LinkIcon size={20} className="text-gray-500" />
                        <div>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {link.title || link.url}
                          </a>
                          {link.description && (
                            <p className="text-sm text-gray-500">
                              {link.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setUploadedLinks((prev) =>
                            prev.filter((_, i) => i !== index)
                          );
                        }}
                        className="p-1 text-red-500 hover:bg-red-100 rounded"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <ImportCSVModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onFileUpload={(url) => {
            handleLinkUpload([
              {
                url,
                title: "CSV File",
                description: "CSV file for attendee import",
              },
            ]);
            setShowImportModal(false);
          }}
        />
      </div>
    </div>
  );
};

export default FormCreationInterface;

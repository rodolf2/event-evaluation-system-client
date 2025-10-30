import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
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
  Edit,
} from "lucide-react";
import Question from "./Question";
import Section from "./Section";
import ImportCSVModal from "./ImportCSVModal";
import { useAuth } from "../../../contexts/useAuth";
import toast from "react-hot-toast";

const FormCreationInterface = ({ onBack }) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    // Only show confirmation for forms that are being edited (not newly created/uploaded)
    const isEditing = sessionStorage.getItem("editFormId");
    if (isEditing && hasUnsavedChanges) {
      const confirmed = window.confirm("You have unsaved changes. Are you sure you want to leave without saving?");
      if (!confirmed) return;
    }
    onBack();
  };
  const { user, token } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [sections, setSections] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  // Removed selectedDate state as the calendar input was removed
  // Event date range state
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  // Certificate linking state (for future use)
  // const isCertificateLinked = false;
  const [showImportModal, setShowImportModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [formTitle, setFormTitle] = useState("Untitled Form");
  const [formDescription, setFormDescription] = useState("Form Description");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentFormId, setCurrentFormId] = useState(null); // New state for current form ID

  // Loading state (for future use)
  // const isLoading = false;

  // Certificate linking state
  const [isCertificateLinked, setIsCertificateLinked] = useState(false);

  // Upload functionality states
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedLinks, setUploadedLinks] = useState([]);
  const [uploadedCSVData, setUploadedCSVData] = useState(null);

  const makeId = () => Date.now() + Math.floor(Math.random() * 1000);

  // Check for uploaded or edited form data on component mount
  useEffect(() => {
    const fetchFormData = async () => {
      const uploadedFormId = sessionStorage.getItem("uploadedFormId");
      const editFormId = sessionStorage.getItem("editFormId");
      const formId = uploadedFormId || editFormId;
      setCurrentFormId(formId);

      // Initialize isCertificateLinked based on current formId
      if (formId && sessionStorage.getItem(`certificateLinked_${formId}`)) {
        setIsCertificateLinked(true);
      } else {
        setIsCertificateLinked(false);
      }

      const tempFormData = sessionStorage.getItem("tempFormData");

      if (tempFormData) {
        // Load from temporary extracted data
        try {
          const tempData = JSON.parse(tempFormData);

          // Set form title and description
          setFormTitle(tempData.title || "Untitled Form");
          setFormDescription(tempData.description || "Form Description");
          setHasUnsavedChanges(false); // Mark as loaded from temporary data

          // Set questions from temporary data
          if (tempData.questions && tempData.questions.length > 0) {
            setQuestions(
              tempData.questions.map((q) => ({
                ...q,
                id: makeId(),
              }))
            );
          }

          // Set uploaded files and links from temporary data
          if (tempData.uploadedFiles && tempData.uploadedFiles.length > 0) {
            setUploadedFiles(tempData.uploadedFiles);
          }

          if (tempData.uploadedLinks && tempData.uploadedLinks.length > 0) {
            setUploadedLinks(tempData.uploadedLinks);
          }

          toast.success("Form data loaded successfully!");
        } catch (error) {
          console.error("Error parsing temporary form data:", error);
          toast.error("An error occurred while loading the form data");
        } finally {
          // Keep the temp data in sessionStorage until publish
        }
      } else if (formId) { // Use the extracted formId
        if (token) {
          // Loading state disabled
          try {
            const response = await fetch(`/api/forms/${formId}`, {
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
                setHasUnsavedChanges(false); // Mark as loaded from existing form

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
            sessionStorage.removeItem("editFormId");
          }
        }
      }
    };

    fetchFormData();

    const handleFocus = () => {
      const formId = sessionStorage.getItem("uploadedFormId") || sessionStorage.getItem("editFormId");
      setCurrentFormId(formId);
      if (formId && sessionStorage.getItem(`certificateLinked_${formId}`)) {
        setIsCertificateLinked(true);
      } else {
        setIsCertificateLinked(false);
      }
    };
 
    const checkCertificateLink = () => {
      const formId = sessionStorage.getItem("uploadedFormId") || sessionStorage.getItem("editFormId");
      setCurrentFormId(formId);
      if (formId && sessionStorage.getItem(`certificateLinked_${formId}`)) {
        setIsCertificateLinked(true);
      } else {
        setIsCertificateLinked(false);
      }
    };
 
    window.addEventListener('focus', handleFocus);
 
    // Also check when component becomes visible (for navigation returns)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkCertificateLink();
      }
    };
 
    document.addEventListener('visibilitychange', handleVisibilityChange);
 
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [token, currentFormId]); // Added currentFormId to dependency array

  const addQuestion = (sectionId = null) => {
    // Create comprehensive default choices for a "Multiple Choices" question
    const defaultOptions = ["Option 1", "Option 2", "Option 3", "Option 4"];

    const newQuestion = {
      id: makeId(),
      type: "Multiple Choices",
      title: "",
      options: defaultOptions,
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
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
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
        // Create a deep copy of the question including all choices
        const copy = {
          ...q,
          id: makeId(),
          title: `${q.title} (Copy)`, // Add copy indicator to avoid confusion
          options: [...(q.options || [])], // Deep copy of options array
          ratingScale: q.ratingScale,
          likertStart: q.likertStart,
          likertEnd: q.likertEnd,
          likertStartLabel: q.likertStartLabel,
          likertEndLabel: q.likertEndLabel,
          emojiStyle: q.emojiStyle,
        };
        return [...prev, copy];
      }
      return prev;
    });

    setSections((prevSections) =>
      prevSections.map((s) => {
        const newQuestions = [];
        (s.questions || []).forEach((q) => {
          newQuestions.push(q);
          if (q.id === id) {
            // Create a deep copy of the question including all choices
            const copy = {
              ...q,
              id: makeId(),
              title: `${q.title} (Copy)`, // Add copy indicator
              options: [...(q.options || [])], // Deep copy of options array
              ratingScale: q.ratingScale,
              likertStart: q.likertStart,
              likertEnd: q.likertEnd,
              likertStartLabel: q.likertStartLabel,
              likertEndLabel: q.likertEndLabel,
              emojiStyle: q.emojiStyle,
            };
            newQuestions.push(copy);
          }
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
    setHasUnsavedChanges(true);
  };

  const removeSection = (id) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
    setHasUnsavedChanges(true);
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

  // Parse CSV data
  const parseCSV = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const students = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length >= headers.length) {
        const student = {};
        headers.forEach((header, index) => {
          student[header] = values[index]?.trim() || '';
        });
        students.push(student);
      }
    }
    return students;
  };

  // Handle CSV file upload
  const handleCSVUpload = async (url) => {
    try {
      const response = await fetch(url);
      const csvText = await response.text();
      const students = parseCSV(csvText);

      if (students.length > 0) {
        const csvData = {
          filename: url.split('/').pop() || 'uploaded.csv',
          students,
          uploadedAt: new Date(),
          url
        };
        setUploadedCSVData(csvData);

        // Also add to uploaded links for consistency
        handleLinkUpload([{
          url,
          title: "CSV File",
          description: `CSV file with ${students.length} students`,
        }]);
      }
    } catch (error) {
      console.error("Error parsing CSV:", error);
      toast.error("Failed to parse CSV file");
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
    console.log("Starting form publish process");
    console.log("User data:", { user: user?._id, token: token ? "present" : "missing" });

    // Flatten questions from sections and main questions
    const allQuestions = [
      ...questions,
      ...sections.flatMap((s) => s.questions || []),
    ];

    console.log("All questions count:", allQuestions.length);

    if (allQuestions.length === 0) {
      console.log("No questions found, showing error");
      toast.error("Please add at least one question");
      return;
    }

    const backendQuestions = mapQuestionsToBackend(allQuestions);
    console.log("Mapped backend questions:", backendQuestions);

    // Check if this is from temporary extracted data
    const tempFormData = sessionStorage.getItem("tempFormData");
    let formData;

    if (tempFormData) {
      // Use temporary data as base
      const tempData = JSON.parse(tempFormData);
      formData = {
        title: formTitle,
        description: formDescription,
        questions: backendQuestions,
        createdBy: user?._id,
        uploadedFiles: uploadedFiles,
        uploadedLinks: uploadedLinks,
        eventStartDate: eventStartDate,
        eventEndDate: eventEndDate,
      };

      // If there was a file in the temporary data, we need to upload it now
      if (tempData.file) {
        console.log("Uploading file that was temporarily stored...");
        const formDataWithFile = new FormData();
        formDataWithFile.append("file", tempData.file);
        formDataWithFile.append("createdBy", user?._id);

        try {
          const uploadResponse = await fetch("/api/forms/upload", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
            },
            body: formDataWithFile,
          });

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            if (uploadData.success && uploadData.data && uploadData.data.form) {
              console.log("File uploaded successfully, form created with ID:", uploadData.data.form._id);
              toast.success("Form published successfully!");
              // Navigate to evaluations page
              navigate("/psas/evaluations");
              return;
            }
          }
        } catch (error) {
          console.error("Error uploading file:", error);
          toast.error(`Failed to upload file: ${error.message}`);
          return;
        }
      }
    } else {
      // Normal publish flow for blank forms
      formData = {
        title: formTitle,
        description: formDescription,
        questions: backendQuestions,
        createdBy: user?._id,
        uploadedFiles: uploadedFiles,
        uploadedLinks: uploadedLinks,
        eventStartDate: eventStartDate,
        eventEndDate: eventEndDate,
      };
    }

    console.log("Form data to send:", formData);

    setIsPublishing(true);
    try {
      console.log("Creating blank form...");
      // First create the blank form
      const createResponse = await fetch("/api/forms/blank", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      console.log("Create blank form response status:", createResponse.status);
      const createData = await createResponse.json();
      console.log("Create blank form response data:", createData);

      if (createData.success && createData.data && createData.data.form) {
        console.log("Blank form created successfully, form ID:", createData.data.form._id);
        console.log("Publishing form...");

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

        console.log("Publish form response status:", publishResponse.status);
        const publishData = await publishResponse.json();
        console.log("Publish form response data:", publishData);

        if (publishData.success) {
          console.log("Form published successfully");
          toast.success("Form published successfully!");
          // Show the shareable link to the user
          if (publishData.data && publishData.data.shareableLink) {
            console.log("Shareable link:", publishData.data.shareableLink);
            toast.success(`Shareable link: ${publishData.data.shareableLink}`);
          }

          // Clear the form inputs after successful publishing
          setFormTitle("Untitled Form");
          setFormDescription("Form Description");
          setQuestions([]);
          setSections([]);
          setUploadedFiles([]);
          setUploadedLinks([]);
          setEventStartDate("");
          setEventEndDate("");
          setHasUnsavedChanges(false); // Reset unsaved changes flag

          // Clear temporary data after successful publish
          sessionStorage.removeItem("tempFormData");

          navigate("/psas/evaluations");
        } else {
          console.log("Error publishing form:", publishData.message);
          toast.error(
            `Error publishing form: ${publishData.message || "Unknown error"}`
          );
        }
      } else {
        console.log("Error creating blank form:", createData.message);
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
              onClick={handleBackClick}
              className="text-gray-700 hover:text-black mr-4"
            >
              <Plus size={24} className="rotate-45" />
            </button>
            <div className="flex items-center">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Set Event Dates
              </button>
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
                value={formTitle}
                onChange={(e) => {
                  setFormTitle(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                className="text-3xl sm:text-5xl font-bold w-full border-none outline-none mb-4"
              />
              <textarea
                placeholder="Add a description"
                value={formDescription}
                onChange={(e) => {
                  setFormDescription(e.target.value);
                  setHasUnsavedChanges(true);
                }}
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
            onClick={() => navigate(`/psas/certificates?from=evaluation&formId=${sessionStorage.getItem("uploadedFormId") || sessionStorage.getItem("editFormId")}`)}
            className={`px-8 py-3 rounded-lg font-semibold transition-colors
              ${isCertificateLinked
                ? "bg-white text-[#0C2A92] border border-[#0C2A92] hover:bg-blue-50"
                : "bg-white text-[#5F6368] hover:bg-gray-100 border border-gray-300"}
            `}
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

        {/* Event Date Range Modal */}
        {showDatePicker && (
          <div className="fixed inset-0 bg-[#F1F0F0]/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Set Event Dates</h3>
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Start Date
                  </label>
                  <input
                    type="date"
                    value={eventStartDate}
                    onChange={(e) => setEventStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event End Date
                  </label>
                  <input
                    type="date"
                    value={eventEndDate}
                    onChange={(e) => setEventEndDate(e.target.value)}
                    min={eventStartDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => {
                    setEventStartDate("");
                    setEventEndDate("");
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

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
            handleCSVUpload(url);
            setShowImportModal(false);
          }}
          uploadedCSVData={uploadedCSVData}
        />

      </div>
    </div>
  );
};

export default FormCreationInterface;
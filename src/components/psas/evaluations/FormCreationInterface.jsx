import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import SuccessScreen from "./SuccessScreen";
import { useAuth } from "../../../contexts/useAuth";
import { FormSessionManager } from "../../../utils/formSessionManager";
import toast from "react-hot-toast";

const FormCreationInterface = ({ onBack }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBackClick = () => {
    // Only show confirmation for forms that are being edited (not newly created/uploaded)
    const isEditing = localStorage.getItem("editFormId");
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

  // Debug: Add a direct function to force modal open
  const openImportModal = () => {
    setShowImportModal(true);
  };

  useEffect(() => {
  }, [showImportModal]);


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
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  // Load assigned students using FormSessionManager
  const assignedStudents = FormSessionManager.loadStudentAssignments();

  // Persist form state using FormSessionManager
  const persistFormState = useCallback(() => {
    const currentState = {
      formTitle,
      formDescription,
      questions,
      sections,
      uploadedFiles,
      uploadedLinks,
      uploadedCSVData,
      eventStartDate,
      eventEndDate,
      currentFormId,
      isCertificateLinked, // <-- Persist certificate linked status
    };
    FormSessionManager.saveFormData(currentState);
  }, [formTitle, formDescription, questions, sections, uploadedFiles, uploadedLinks, uploadedCSVData, eventStartDate, eventEndDate, currentFormId, isCertificateLinked]);

  // Restore form state using FormSessionManager
  const restoreFormState = useCallback(() => {
    const loadedData = FormSessionManager.loadFormData();
    if (loadedData) {
      setFormTitle(loadedData.formTitle || "Untitled Form");
      setFormDescription(loadedData.formDescription || "Form Description");
      setQuestions(loadedData.questions || []);
      setSections(loadedData.sections || []);
      setUploadedFiles(loadedData.uploadedFiles || []);
      setUploadedLinks(loadedData.uploadedLinks || []);
      setUploadedCSVData(loadedData.uploadedCSVData || null);
      setEventStartDate(loadedData.eventStartDate || "");
      setEventEndDate(loadedData.eventEndDate || "");
      setCurrentFormId(loadedData.currentFormId || FormSessionManager.getCurrentFormId());
      setIsCertificateLinked(loadedData.isCertificateLinked || false); // <-- Restore certificate linked status
      setHasUnsavedChanges(false);
    }
  }, []);

  // Check for recipients parameter from student list navigation
  const [hasShownRecipientsToast, setHasShownRecipientsToast] = useState(false);

  // Combined effect for initialization and handling navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const formIdFromUrl = urlParams.get('formId');

    const recipients = urlParams.get('recipients');
    const edit = urlParams.get('edit');

    // Initialize session with formId from URL or create a new one
    const formId = FormSessionManager.initializeFormSession(formIdFromUrl);
    setCurrentFormId(formId);

    // Restore the state for the initialized session
    const restoreTimeout = setTimeout(restoreFormState, 50);

    // Handle return from student assignment page
    if (recipients && !hasShownRecipientsToast) {
      const csvData = FormSessionManager.loadCSVData();
      if (csvData) {
        setUploadedCSVData(csvData);
      }
      const toastTimeout = setTimeout(() => {
        toast.success(`${recipients} students assigned to this form`);
        setHasShownRecipientsToast(true);
      }, 500);
      return () => clearTimeout(toastTimeout);
    }

    // Handle return from certificate linking page
    if (edit && formId) {
      const certificateLinked = localStorage.getItem(`certificateLinked_${formId}`);
      if (certificateLinked === 'true') {
        setIsCertificateLinked(true);
        localStorage.removeItem(`certificateLinked_${formId}`);
      }
    }

    return () => clearTimeout(restoreTimeout);
  }, [location.search, restoreFormState, hasShownRecipientsToast]);

  // Save form state whenever it changes (with debouncing)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      persistFormState();
    }, 1000); // Debounce to prevent excessive saves

    return () => clearTimeout(timeoutId);
  }, [formTitle, formDescription, questions, sections, uploadedFiles, uploadedLinks, uploadedCSVData, eventStartDate, eventEndDate, currentFormId, persistFormState]);

  // Force persist state immediately when navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      persistFormState();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [persistFormState]);

  const makeId = () => Date.now() + Math.floor(Math.random() * 1000);

  const addQuestion = (sectionId = null) => {
    // Create a "Short Answer" question as default for better user experience
    const newQuestion = {
      id: makeId(),
      type: "Short Answer",
      title: "",
      options: [], // Only used for Multiple Choices
      ratingScale: 5, // Only used for Numeric Ratings
      emojiStyle: "Default", // Only used for Numeric Ratings
      required: false,
      likertStart: 1, // Only used for Likert Scale
      likertEnd: 5, // Only used for Likert Scale
      likertStartLabel: "Poor", // Only used for Likert Scale
      likertEndLabel: "Excellent", // Only used for Likert Scale
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
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
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

  // Handle CSV file upload with FormSessionManager persistence
  const handleCSVUpload = async (csvDataOrUrl) => {
    try {
      // Check if we received a complete CSV data object or just a URL
      let csvData;
      
      if (typeof csvDataOrUrl === 'object' && csvDataOrUrl.students) {
        // We received a complete CSV data object with students
        csvData = csvDataOrUrl;
      } else {
        // We received a URL, need to fetch and parse it
        const url = csvDataOrUrl;
        
        const response = await fetch(url);
        const csvText = await response.text();
        const students = parseCSV(csvText);

        if (students.length > 0) {
          csvData = {
            filename: url.split('/').pop() || 'uploaded.csv',
            students,
            uploadedAt: new Date(),
            url
          };
        } else {
          console.error("🎓 FormCreationInterface - No students found in CSV data");
          toast.error("No valid student data found in CSV file");
          return;
        }
      }
      
      // Validate the CSV data structure
      if (!csvData.students || !Array.isArray(csvData.students) || csvData.students.length === 0) {
        toast.error("CSV file contains no valid student data");
        return;
      }
      
      // Save to both local state and FormSessionManager
      setUploadedCSVData(csvData);
      FormSessionManager.saveCSVData(csvData);

      // Also add to uploaded links for consistency
      handleLinkUpload([{
        url: csvData.url || csvData.filename,
        title: csvData.filename || "CSV File",
        description: `CSV file with ${csvData.students.length} students`,
      }]);
      
      toast.success(`CSV file with ${csvData.students.length} students uploaded successfully`);
      
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
      let backendQuestion = {
        title: q.title || "Untitled Question",
        required: q.required || false,
      };

      switch (q.type) {
        case "Multiple Choices":
          type = "multiple_choice";
          backendQuestion.options = q.options || [];
          break;
        case "Short Answer":
          type = "short_answer";
          break;
        case "Paragraph":
          type = "paragraph";
          break;
        case "Likert Scale":
          type = "scale";
          backendQuestion.low = q.likertStart || 1;
          backendQuestion.high = q.likertEnd || 5;
          backendQuestion.lowLabel = q.likertStartLabel || "";
          backendQuestion.highLabel = q.likertEndLabel || "";
          break;
        case "Numeric Ratings":
          type = "scale";
          backendQuestion.low = 1;
          backendQuestion.high = q.ratingScale || 5;
          // Labels are not typically used for numeric ratings, so they can be omitted or set to default
          backendQuestion.lowLabel = "";
          backendQuestion.highLabel = "";
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

      backendQuestion.type = type;
      return backendQuestion;
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

    // Check if this is from temporary extracted data
    const tempFormData = localStorage.getItem("tempFormData");
    let formData;

    if (tempFormData) {
      // Use temporary data as base
      const tempData = JSON.parse(tempFormData);
      formData = {
        title: formTitle,
        description: formDescription,
        questions: backendQuestions,
        clientQuestions: allQuestions, // Preserve original client format
        createdBy: user?._id,
        uploadedFiles: uploadedFiles,
        uploadedLinks: uploadedLinks,
        eventStartDate: eventStartDate,
        eventEndDate: eventEndDate,
      };

      // If there was a file in the temporary data, we need to upload it now
      if (tempData.file) {
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
        clientQuestions: allQuestions, // Preserve original client format
        createdBy: user?._id,
        uploadedFiles: uploadedFiles,
        uploadedLinks: uploadedLinks,
        eventStartDate: eventStartDate,
        eventEndDate: eventEndDate,
      };
    }

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
        // Update the currentFormId to match the server-generated form ID
        const serverFormId = createData.data.form._id;
        
        setCurrentFormId(serverFormId);
        localStorage.setItem('currentFormId', serverFormId);
        
        // Also update the form session to use the server form ID
        FormSessionManager.initializeFormSession(serverFormId);
        
        // Force save the form data with the correct form ID
        const currentState = {
          formTitle,
          formDescription,
          questions,
          sections,
          uploadedFiles,
          uploadedLinks,
          uploadedCSVData,
          eventStartDate,
          eventEndDate,
          currentFormId: serverFormId,
          isCertificateLinked,
        };
        FormSessionManager.saveFormData(currentState);
        
        // Then publish the form to generate shareable link
        const publishPayload = {
          title: formTitle,
          description: formDescription,
          questions: backendQuestions,
          uploadedFiles: uploadedFiles,
          uploadedLinks: uploadedLinks,
          eventStartDate: eventStartDate,
          eventEndDate: eventEndDate,
        };
        const publishResponse = await fetch(
          `/api/forms/${serverFormId}/publish`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(publishPayload),
          }
        );

        const publishData = await publishResponse.json();

        if (publishData.success) {
          toast.success("Form published successfully!");
          // Show the success screen instead of navigating
          setShowSuccessScreen(true);
        } else {
          toast.error(`Error publishing form: ${publishData.message || "Unknown error"}`);
        }
      } else {
        toast.error(`Error creating form: ${createData.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error publishing form:", error);
      toast.error(`Failed to publish form: ${error.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  if (showSuccessScreen) {
    return (
      <SuccessScreen
        formId={currentFormId} // Pass the current (server) form ID
        onBackToEvaluations={() => {
          // Clear all form data using the enhanced clearing logic
          FormSessionManager.clearFormData();
          
          // Clear additional legacy keys
          localStorage.removeItem("tempFormData");
          localStorage.removeItem("uploadedFormId");
          localStorage.removeItem("editFormId");
          localStorage.removeItem("studentSelection");
          
          // Clear any certificate-related flags
          const currentFormId = FormSessionManager.getCurrentFormId();
          if (currentFormId) {
            localStorage.removeItem(`certificateLinked_${currentFormId}`);
            localStorage.removeItem(`formRecipients_${currentFormId}`);
          }
          
          // Clear current form ID
          localStorage.removeItem("currentFormId");
          
          // Clear local component state
          setQuestions([]);
          setSections([]);
          setFormTitle("Untitled Form");
          setFormDescription("Form Description");
          setUploadedFiles([]);
          setUploadedLinks([]);
          setUploadedCSVData(null);
          setEventStartDate("");
          setEventEndDate("");
          setCurrentFormId(null);
          setIsCertificateLinked(false);
          setHasUnsavedChanges(false);
          
          // Clear success screen state and navigate back
          setShowSuccessScreen(false);
          navigate("/psas/evaluations");
        }}
      />
    );
  }

  return (
    <>
      {/* Debug button */}
      
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
              onClick={() => {
                // Force immediate save of current form state
                persistFormState();

                // Force save CSV data if it exists to ensure persistence
                if (uploadedCSVData) {
                  FormSessionManager.saveCSVData(uploadedCSVData);
                }
                
                // Check if CSV data exists before navigating to student assignment
                const csvData = FormSessionManager.loadCSVData();
                
                // Enhanced validation with better error messages
                if (!csvData) {
                  openImportModal();
                  return;
                }

                if (!csvData.students) {
                  toast.error("CSV file appears to be invalid. Please upload a properly formatted CSV file.");
                  openImportModal();
                  return;
                }

                if (!Array.isArray(csvData.students)) {
                  toast.error("CSV file format is invalid. Please check your file and try again.");
                  openImportModal();
                  return;
                }

                if (csvData.students.length === 0) {
                  toast.error("CSV file contains no student data. Please check your file.");
                  openImportModal();
                  return;
                }
                
                // Navigate to student assignment page with form ID
                const formId = FormSessionManager.getCurrentFormId();
                const navigationUrl = `/psas/students?formId=${formId}`;
                navigate(navigationUrl);
              }}
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
                className="text-3xl sm:text-5xl font-bold w-full border-none outline-none mb-2"
              />
              <textarea
                placeholder="Add a description"
                value={formDescription}
                onChange={(e) => {
                  setFormDescription(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                className="w-full text-base sm:text-lg text-gray-600 border-none outline-none resize-none mb-4"
                rows={1}
              />
              
              {/* Show CSV import status and assigned students indicator */}
              {(() => {
                const csvData = FormSessionManager.loadCSVData();
                const assignedCount = assignedStudents.length;
                const urlParams = new URLSearchParams(location.search);
                const recipients = urlParams.get('recipients');
                
                // Show CSV import status if data exists
                if (csvData && csvData.students && csvData.students.length > 0) {
                  return (
                    <div className="flex flex-col gap-2">
                      {/* CSV Import Success Indicator */}
                      <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                        <Upload size={16} />
                        <span>{csvData.students.length} students loaded from CSV: {csvData.filename || 'uploaded.csv'}</span>
                      </div>
                      
                      {/* Assigned Students Indicator */}
                      {(assignedCount > 0 || recipients) && (
                        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                          <UserPlus size={16} />
                          <span>
                            {assignedCount > 0 ? assignedCount : (recipients ? parseInt(recipients) : 0)}
                            student{(assignedCount > 0 ? assignedCount : (recipients ? parseInt(recipients) : 0)) !== 1 ? 's' : ''} assigned to this form
                          </span>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })()}
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

        <div className="flex flex-col items-center justify-center py-8 bg-gray-100">
          <button
            onClick={() => navigate(`/psas/certificates?from=evaluation&formId=${currentFormId}`)}
            disabled={!currentFormId}
            className={`px-8 py-3 rounded-lg font-semibold transition-colors
              ${isCertificateLinked
                ? "bg-[#0C2A92] text-white hover:bg-blue-800"
                : "bg-white text-[#5F6368] hover:bg-gray-100 border border-gray-300"}
              ${!currentFormId ? "cursor-not-allowed bg-gray-200 text-gray-400 border-gray-200" : ""}
            `}
          >
            {isCertificateLinked ? "Certificate Linked" : "Link Certificate"}
          </button>
          {!currentFormId && (
            <p className="text-sm text-gray-500 mt-2 text-center max-w-xs">
              To link a certificate, please publish the form first. You can then edit the form to add a certificate.
            </p>
          )}
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
          onClose={() => {
            setShowImportModal(false);
          }}
          onFileUpload={(url) => {
            handleCSVUpload(url);
            // Don't automatically close modal on file upload - let user decide when to close
          }}
          uploadedCSVData={uploadedCSVData}
        />

      </div>
    </div>
    </>
  );
};

export default FormCreationInterface;
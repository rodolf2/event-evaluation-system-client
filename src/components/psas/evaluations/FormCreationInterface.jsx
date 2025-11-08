import { useState, useCallback, useEffect, useRef } from "react";
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

  // Active selection state (for Google Forms-like targeting of actions)
  // null / "main" means Section 1 (the top-level block)
  const [activeSectionId, setActiveSectionId] = useState("main");
  const [activeQuestionId, setActiveQuestionId] = useState(null);

  // Refs for tracking scroll alignment if needed later
  const formCanvasRef = useRef(null);

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

  /**
   * ATOMIC STATE MANAGEMENT SYSTEM
   *
   * This system ensures that CSV import, student assignment, and form editing
   * work seamlessly together without conflicts. Previously, these operations
   * would overwrite each other's data due to:
   * 1. Race conditions between multiple useEffect hooks
   * 2. Separate localStorage management for different data types
   * 3. Debounce timer conflicts
   *
   * The solution: All form data updates are now coordinated through this
   * single updateFormState function, ensuring atomic persistence.
   *
   * CSV IMPORT WORKFLOW:
   * 1. CSV data is imported through ImportCSVModal component
   * 2. When "View" is clicked, students list page opens with formId
   * 3. If no formId exists (CSV imported first), a temporary one is created
   * 4. All form data (questions, sections, CSV) persists through navigation
   *
   * STUDENT ASSIGNMENT WORKFLOW:
   * 1. Navigate to student assignment after CSV import
   * 2. Students are selected and saved via FormSessionManager
   * 3. Return to form creation with all data preserved
   * 4. Both questions and student assignments remain intact
   */
  const updateFormState = useCallback((updates) => {
    setFormTitle(prev => updates.formTitle !== undefined ? updates.formTitle : prev);
    setFormDescription(prev => updates.formDescription !== undefined ? updates.formDescription : prev);
    setQuestions(prev => updates.questions !== undefined ? updates.questions : prev);
    setSections(prev => updates.sections !== undefined ? updates.sections : prev);
    setUploadedFiles(prev => updates.uploadedFiles !== undefined ? updates.uploadedFiles : prev);
    setUploadedLinks(prev => updates.uploadedLinks !== undefined ? updates.uploadedLinks : prev);
    setUploadedCSVData(prev => updates.uploadedCSVData !== undefined ? updates.uploadedCSVData : prev);
    setEventStartDate(prev => updates.eventStartDate !== undefined ? updates.eventStartDate : prev);
    setEventEndDate(prev => updates.eventEndDate !== undefined ? updates.eventEndDate : prev);
    setCurrentFormId(prev => updates.currentFormId !== undefined ? updates.currentFormId : prev);
    setIsCertificateLinked(prev => updates.isCertificateLinked !== undefined ? updates.isCertificateLinked : prev);
    
    // Persist all form data atomically to prevent conflicts
    const currentState = {
      formTitle: updates.formTitle !== undefined ? updates.formTitle : formTitle,
      formDescription: updates.formDescription !== undefined ? updates.formDescription : formDescription,
      questions: updates.questions !== undefined ? updates.questions : questions,
      sections: updates.sections !== undefined ? updates.sections : sections,
      uploadedFiles: updates.uploadedFiles !== undefined ? updates.uploadedFiles : uploadedFiles,
      uploadedLinks: updates.uploadedLinks !== undefined ? updates.uploadedLinks : uploadedLinks,
      uploadedCSVData: updates.uploadedCSVData !== undefined ? updates.uploadedCSVData : uploadedCSVData,
      eventStartDate: updates.eventStartDate !== undefined ? updates.eventStartDate : eventStartDate,
      eventEndDate: updates.eventEndDate !== undefined ? updates.eventEndDate : eventEndDate,
      currentFormId: updates.currentFormId !== undefined ? updates.currentFormId : currentFormId,
      isCertificateLinked: updates.isCertificateLinked !== undefined ? updates.isCertificateLinked : isCertificateLinked,
    };
    FormSessionManager.saveFormData(currentState);
    
    // Separate CSV data persistence for StudentList compatibility
    if (updates.uploadedCSVData !== undefined) {
      FormSessionManager.saveCSVData(updates.uploadedCSVData);
    }
  }, [formTitle, formDescription, questions, sections, uploadedFiles, uploadedLinks, uploadedCSVData, eventStartDate, eventEndDate, currentFormId, isCertificateLinked]);

  // Persist form state using FormSessionManager (legacy function for backward compatibility)
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
      isCertificateLinked,
    };
    FormSessionManager.saveFormData(currentState);
  }, [formTitle, formDescription, questions, sections, uploadedFiles, uploadedLinks, uploadedCSVData, eventStartDate, eventEndDate, currentFormId, isCertificateLinked]);

  // Enhanced restore form state with CSV data
  const restoreFormState = useCallback(() => {
    const loadedData = FormSessionManager.loadFormData();
    const csvData = FormSessionManager.loadCSVData();
    
    if (loadedData || csvData) {
      updateFormState({
        formTitle: loadedData?.formTitle || "Untitled Form",
        formDescription: loadedData?.formDescription || "Form Description",
        questions: loadedData?.questions || [],
        sections: loadedData?.sections || [],
        uploadedFiles: loadedData?.uploadedFiles || [],
        uploadedLinks: loadedData?.uploadedLinks || [],
        uploadedCSVData: csvData || loadedData?.uploadedCSVData || null,
        eventStartDate: loadedData?.eventStartDate || "",
        eventEndDate: loadedData?.eventEndDate || "",
        currentFormId: loadedData?.currentFormId || FormSessionManager.getCurrentFormId(),
        isCertificateLinked: loadedData?.isCertificateLinked || false,
      });
      setHasUnsavedChanges(false);
    }
  }, [updateFormState]);

  // Check for recipients parameter from student list navigation
  const [hasShownRecipientsToast, setHasShownRecipientsToast] = useState(false);

  // Combined effect for initialization and handling navigation
  useEffect(() => {
    // Only proceed if we have required dependencies
    if (!location || !location.search) return;
    
    const urlParams = new URLSearchParams(location.search);
    const formIdFromUrl = urlParams.get('formId');
    const recipients = urlParams.get('recipients');
    const edit = urlParams.get('edit');

    // Determine the active form id from URL or existing session
    const urlFormId = edit || formIdFromUrl;
    const existingSessionFormId = FormSessionManager.getCurrentFormId();
    const effectiveFormId = urlFormId || existingSessionFormId;

    // If we have an effective form id and token, try to load it as an edit checkpoint
    if (effectiveFormId && token) {
      const isLikelyValidId =
        typeof effectiveFormId === "string" && effectiveFormId.trim().length > 0;

      if (isLikelyValidId) {
        const fetchFormData = async () => {
          try {
            const response = await fetch(`/api/forms/${effectiveFormId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data) {
                const formData = data.data;

                const mappedFormData = {
                  formTitle: formData.title || "Untitled Form",
                  formDescription: formData.description || "Form Description",
                  questions: formData.questions
                    ? formData.questions.map((q) => {
                        let clientType = "Short Answer";
                        let clientOptions = [];
                        let ratingScale = 5;
                        let emojiStyle = "Default";
                        let likertStart = 1;
                        let likertEnd = 5;
                        let likertStartLabel = "Poor";
                        let likertEndLabel = "Excellent";

                        switch (q.type) {
                          case "multiple_choice":
                            clientType = "Multiple Choices";
                            clientOptions = q.options || [];
                            break;
                          case "short_answer":
                            clientType = "Short Answer";
                            break;
                          case "paragraph":
                            clientType = "Paragraph";
                            break;
                          case "scale":
                            if (q.lowLabel || q.highLabel) {
                              clientType = "Likert Scale";
                              likertStart = q.low || 1;
                              likertEnd = q.high || 5;
                              likertStartLabel = q.lowLabel || "Poor";
                              likertEndLabel = q.highLabel || "Excellent";
                            } else {
                              clientType = "Numeric Ratings";
                              ratingScale = q.high || 5;
                              emojiStyle = "Default";
                            }
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
                            clientType = "Short Answer";
                        }

                        return {
                          id: makeId(),
                          type: clientType,
                          title: q.title || "",
                          options: clientOptions,
                          ratingScale,
                          emojiStyle,
                          required: q.required || false,
                          likertStart,
                          likertEnd,
                          likertStartLabel,
                          likertEndLabel,
                        };
                      })
                    : [],
                  sections: formData.sections || [],
                  uploadedFiles: formData.uploadedFiles || [],
                  uploadedLinks: formData.uploadedLinks || [],
                  eventStartDate: formData.eventStartDate
                    ? new Date(formData.eventStartDate)
                        .toISOString()
                        .split("T")[0]
                    : "",
                  eventEndDate: formData.eventEndDate
                    ? new Date(formData.eventEndDate)
                        .toISOString()
                        .split("T")[0]
                    : "",
                  currentFormId: effectiveFormId,
                  isCertificateLinked: false,
                };

                // Apply mapped data
                setFormTitle(mappedFormData.formTitle);
                setFormDescription(mappedFormData.formDescription);
                setQuestions(mappedFormData.questions);
                setSections(mappedFormData.sections);
                setUploadedFiles(mappedFormData.uploadedFiles);
                setUploadedLinks(mappedFormData.uploadedLinks);
                setEventStartDate(mappedFormData.eventStartDate);
                setEventEndDate(mappedFormData.eventEndDate);
                setCurrentFormId(mappedFormData.currentFormId);
                setHasUnsavedChanges(false);

                // Optional certificate check (non-blocking)
                try {
                  const certificateResponse = await fetch(
                    `/api/certificates/form/${effectiveFormId}`,
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );

                  if (certificateResponse.ok) {
                    const certificateData =
                      await certificateResponse.json();
                    if (
                      certificateData.success &&
                      certificateData.data &&
                      certificateData.data.length > 0
                    ) {
                      setIsCertificateLinked(true);
                      mappedFormData.isCertificateLinked = true;
                    }
                  }
                } catch {
                  // ignore certificate check failures
                }

                // Persist as checkpoint
                FormSessionManager.saveFormData(mappedFormData);
                localStorage.setItem("editFormId", effectiveFormId);
                // Ensure session uses this id
                FormSessionManager.initializeFormSession(effectiveFormId);
              }
            } else if (response.status === 404) {
              // If server doesn't recognize it, fall back to local session/state
              localStorage.removeItem("editFormId");
              const fallbackId =
                existingSessionFormId ||
                FormSessionManager.initializeFormSession(null);
              setCurrentFormId(fallbackId);
              const restoreTimeout = setTimeout(restoreFormState, 50);
              return () => clearTimeout(restoreTimeout);
            } else {
              toast.error("Failed to load form data for editing");
            }
          } catch {
            // On fetch error, restore any existing session instead of looping
            const restoreTimeout = setTimeout(restoreFormState, 50);
            return () => clearTimeout(restoreTimeout);
          }
        };

        fetchFormData();
      } else {
        // If effectiveFormId isn't valid, restore any existing session
        const restoreTimeout = setTimeout(restoreFormState, 50);
        return () => clearTimeout(restoreTimeout);
      }
    } else {
      // No effective id: initialize or restore a local session
      const sessionFormId =
        existingSessionFormId ||
        FormSessionManager.initializeFormSession(null);
      setCurrentFormId(sessionFormId);
      const restoreTimeout = setTimeout(restoreFormState, 50);
      return () => clearTimeout(restoreTimeout);
    }

    // Handle return from student assignment page - preserve ALL form data
    if (recipients && !hasShownRecipientsToast) {
      // Load both form data and CSV data to ensure complete restoration
      const formData = FormSessionManager.loadFormData();
      const csvData = FormSessionManager.loadCSVData();
      
      // Update all form state atomically to prevent data loss
      updateFormState({
        formTitle: formData?.formTitle || "Untitled Form",
        formDescription: formData?.formDescription || "Form Description",
        questions: formData?.questions || [],
        sections: formData?.sections || [],
        uploadedFiles: formData?.uploadedFiles || [],
        uploadedLinks: formData?.uploadedLinks || [],
        uploadedCSVData: csvData || formData?.uploadedCSVData || null,
        eventStartDate: formData?.eventStartDate || "",
        eventEndDate: formData?.eventEndDate || "",
        currentFormId: formData?.currentFormId || FormSessionManager.getCurrentFormId(),
        isCertificateLinked: formData?.isCertificateLinked || false,
      });
      
      setHasUnsavedChanges(false);
      const toastTimeout = setTimeout(() => {
        toast.success(`${recipients} students assigned to this form`);
        setHasShownRecipientsToast(true);
      }, 500);
      return () => clearTimeout(toastTimeout);
    }

    // Handle return from certificate linking page
    if (edit) {
      const activeFormId = FormSessionManager.getCurrentFormId();
      if (activeFormId) {
        const certificateLinked = localStorage.getItem(`certificateLinked_${activeFormId}`);
        if (certificateLinked === "true") {
          setIsCertificateLinked(true);
          localStorage.removeItem(`certificateLinked_${activeFormId}`);

          // Update the saved form data to reflect the certificate linked status
          const currentData = FormSessionManager.loadFormData();
          if (currentData) {
            currentData.isCertificateLinked = true;
            FormSessionManager.saveFormData(currentData);
          }
        }
      }

      // Clear the editFormId since we've successfully handled the edit context
      localStorage.removeItem("editFormId");
    }
  }, [location?.search, hasShownRecipientsToast, token, restoreFormState, updateFormState]);

  // Save form state whenever it changes (with smart debouncing and quota management)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Check storage usage before saving
      const storageUsage = FormSessionManager.getStorageUsage();
      
      // Only save comprehensive data if we have reasonable storage space
      if (storageUsage.usedMB < 4.5) { // Leave 0.5MB buffer under 5MB limit
        persistFormState();
      } else {
        console.warn('⚠️ FormCreationInterface - Storage quota warning, reducing save frequency');
        // Save only essential data when storage is nearly full
        const essentialState = {
          formTitle,
          formDescription,
          eventStartDate,
          eventEndDate,
          currentFormId,
        };
        FormSessionManager.saveFormData(essentialState);
      }
    }, 2000); // Increased debounce to 2 seconds to reduce save frequency

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

  // Centralized helper to create a new default question object
  const createDefaultQuestion = () => ({
    id: makeId(),
    type: "Short Answer",
    title: "",
    options: [],
    ratingScale: 5,
    emojiStyle: "Default",
    required: false,
    likertStart: 1,
    likertEnd: 5,
    likertStartLabel: "Poor",
    likertEndLabel: "Excellent",
  });

  // Add question respecting the active section
  const addQuestion = (targetSectionId = activeSectionId || "main") => {
    const newQuestion = createDefaultQuestion();

    setQuestions((prevMainQuestions) => {
      // If target is main (Section 1)
      if (targetSectionId === "main" || targetSectionId == null) {
        return [...prevMainQuestions, newQuestion];
      }
      return prevMainQuestions;
    });

    setSections((prevSections) => {
      if (targetSectionId === "main" || targetSectionId == null) {
        return prevSections;
      }

      return prevSections.map((section) =>
        section.id === targetSectionId
          ? {
              ...section,
              questions: [...(section.questions || []), newQuestion],
            }
          : section
      );
    });

    setActiveQuestionId(newQuestion.id);
    setHasUnsavedChanges(true);
  };

  // Add section with continuous, zero-gap numbering based on position
  const addSection = () => {
    setSections((prev) => {
      // Create new section and append at the end (UI order defines numbering)
      const newSection = {
        id: Date.now(), // UI-only unique id
        title: "Untitled Section",
        description: "Add a description",
        questions: [],
      };

      const updated = [...prev, newSection];

      // Reindex: ensure continuous 1-based sectionNumber based on order
      const reindexed = updated.map((section, idx) => ({
        ...section,
        sectionNumber: idx + 1,
      }));

      return reindexed;
    });

    // Active section becomes the newly added last section; sectionNumber aligns with order
    // We will set activeSectionId after state update using functional form above
    // by looking at the last element index synchronously from prev is not safe,
    // so use a small timeout tied to current state.
    setTimeout(() => {
      setSections((current) => {
        if (current.length === 0) return current;
        const last = current[current.length - 1];
        setActiveSectionId(last.id);
        setActiveQuestionId(null);
        return current;
      });
    }, 0);

    setHasUnsavedChanges(true);
  };

  // Explicit active setters to be used from sections/questions
  const handleSetActiveSection = (sectionId) => {
    setActiveSectionId(sectionId || "main");
    setActiveQuestionId(null);
  };

  const handleSetActiveQuestion = (sectionId, questionId) => {
    setActiveSectionId(sectionId || "main");
    setActiveQuestionId(questionId);
  };

  const updateQuestion = useCallback((questionId, updateFn) => {
    setQuestions(prev => prev.map((q) => (q.id === questionId ? updateFn(q) : q)));
    setSections(prev => prev.map((s) => ({
      ...s,
      questions: (s.questions || []).map((q) =>
        q.id === questionId ? updateFn(q) : q
      ),
    })));
  }, []);

  const duplicateQuestion = useCallback((id) => {
    const mainQuestionIndex = questions.findIndex(q => q.id === id);
    let updatedQuestions = [...questions];
    let updatedSections = sections.map(s => ({...s, questions: [...(s.questions || [])]}));
    
    // Create deep copy of the question
    const createQuestionCopy = (q) => ({
      ...q,
      id: makeId(),
      title: q.title ? `${q.title} (Copy)` : 'Untitled Question (Copy)',
      options: [...(q.options || [])],
      ratingScale: q.ratingScale,
      likertStart: q.likertStart,
      likertEnd: q.likertEnd,
      likertStartLabel: q.likertStartLabel,
      likertEndLabel: q.likertEndLabel,
      emojiStyle: q.emojiStyle,
    });

    if (mainQuestionIndex !== -1) {
      // Question is in main form
      const originalQuestion = questions[mainQuestionIndex];
      const copy = createQuestionCopy(originalQuestion);
      updatedQuestions.splice(mainQuestionIndex + 1, 0, copy);
    }

    // Check sections for the question
    updatedSections = updatedSections.map(s => {
      const sectionQuestionIndex = (s.questions || []).findIndex(q => q.id === id);
      if (sectionQuestionIndex !== -1) {
        const originalQuestion = s.questions[sectionQuestionIndex];
        const copy = createQuestionCopy(originalQuestion);
        const newQuestions = [...s.questions];
        newQuestions.splice(sectionQuestionIndex + 1, 0, copy);
        return { ...s, questions: newQuestions };
      }
      return s;
    });

    setQuestions(updatedQuestions);
    setSections(updatedSections);
    setHasUnsavedChanges(true);
  }, [questions, sections]);

  const removeQuestion = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    setSections((prev) =>
      prev.map((s) => ({
        ...s,
        questions: (s.questions || []).filter((q) => q.id !== id),
      }))
    );

    if (activeQuestionId === id) {
      setActiveQuestionId(null);
    }
    setHasUnsavedChanges(true);
  };

  const removeSection = (id) => {
    setSections((prev) => {
      // Remove the target section
      const filtered = prev.filter((s) => s.id !== id);

      // Reindex remaining sections to maintain continuous 1-based numbering
      const reindexed = filtered.map((section, idx) => ({
        ...section,
        sectionNumber: idx + 1,
      }));

      return reindexed;
    });

    if (activeSectionId === id) {
      setActiveSectionId("main");
      setActiveQuestionId(null);
    }
    setHasUnsavedChanges(true);
  };

  // Parse CSV data
  const parseCSV = useCallback((csvText) => {
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
  }, []);

  // Handle CSV file upload with FormSessionManager persistence
  const handleCSVUpload = async (csvDataOrUrl) => {
    try {
      let csvData;

      if (typeof csvDataOrUrl === 'object' && csvDataOrUrl.students) {
        // Already parsed CSV data object
        csvData = csvDataOrUrl;
      } else {
        // Treat as URL and fetch/parse CSV
        const url = csvDataOrUrl;
        const response = await fetch(url);
        const csvText = await response.text();
        const students = parseCSV(csvText);

        if (students.length > 0) {
          csvData = {
            filename: url.split('/').pop() || 'uploaded.csv',
            students,
            uploadedAt: new Date(),
            url,
          };
        } else {
          toast.error("No valid student data found in CSV file");
          return;
        }
      }

      // Validate the CSV data structure
      if (!csvData.students || !Array.isArray(csvData.students) || csvData.students.length === 0) {
        toast.error("CSV file contains no valid student data");
        return;
      }

      // Persist CSV data centrally so StudentList and others can read it
      FormSessionManager.saveCSVData(csvData);

      // Reflect CSV data in local state for UI feedback
      setUploadedCSVData(csvData);
      setHasUnsavedChanges(true);
      toast.success(`CSV file with ${csvData.students.length} students uploaded successfully`);
    } catch {
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

    // Load CSV/recipients and certificate link state
    const selectedStudents = FormSessionManager.loadStudentAssignments() || [];
    const hasStudents = Array.isArray(selectedStudents) && selectedStudents.length > 0;
    const hasDates = Boolean(eventStartDate) && Boolean(eventEndDate);
    const hasCertificate = Boolean(isCertificateLinked);

    // Enforce required publishing conditions:
    // - Event start and end dates must be chosen
    // - At least one of: certificate linked OR students uploaded via CSV
    if (!hasDates) {
      toast.error("Please set both the event start date and end date before publishing.");
      return;
    }

    if (!hasCertificate && !hasStudents) {
      toast.error("Please either link a certificate or upload students via CSV before publishing.");
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
        selectedStudents: selectedStudents, // Include selected students
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
        selectedStudents: selectedStudents, // Include selected students
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
                // Force immediate save of current form state using atomic updates
                persistFormState();
                
                // Check if CSV data exists before navigating to student assignment
                const csvData = FormSessionManager.loadCSVData();
                
                // Enhanced validation with better error messages
                if (!csvData) {
                  toast.error("Please import a CSV file first to assign students.");
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

        <div
           ref={formCanvasRef}
           className="flex flex-col md:flex-row justify-center relative"
         >
           <div className="w-full max-w-4xl relative mt-8">
             <div
               className={`bg-white rounded-lg shadow-sm p-6 sm:p-10 mb-6 relative min-h-[220px] ${
                 activeSectionId === "main"
                   ? "ring-2 ring-blue-500/40"
                   : "hover:ring-1 hover:ring-gray-200 transition"
               }`}
               onClick={() => handleSetActiveSection("main")}
             >
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
                className="text-3xl sm:text-5xl font-bold w-full border-none outline-none mb-2 text-center placeholder:text-gray-400"
              />
              <textarea
                placeholder="Add a description"
                value={formDescription}
                onChange={(e) => {
                  setFormDescription(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                className="w-full text-base sm:text-lg text-gray-600 border-none outline-none resize-none mb-4 text-center placeholder:text-gray-400"
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

           {/* Desktop: Add controls beside the first (main) Section 1 card */}
           <div className="hidden md:flex flex-col gap-2 items-center absolute top-6 -right-16">
             {/* Add Question - targets main section */}
             <button
               onClick={() => addQuestion("main")}
               className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-100"
               title="Add question"
             >
               <Plus size={18} className="text-gray-700" />
             </button>
             {/* Add Section */}
             <button
               onClick={addSection}
               className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-100"
               title="Add new section"
             >
               <AlignLeft size={18} className="text-gray-700" />
             </button>
           </div>

            {questions.map((q) => (
              <div
                key={q.id}
                className="relative"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSetActiveQuestion("main", q.id);
                }}
              >
                {/* Desktop: controls beside each main-section question */}
                <div className="hidden md:flex flex-col gap-2 items-center absolute top-6 -right-16">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addQuestion("main");
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-100"
                    title="Add question"
                  >
                    <Plus size={18} className="text-gray-700" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addSection();
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-100"
                    title="Add new section"
                  >
                    <AlignLeft size={18} className="text-gray-700" />
                  </button>
                </div>

                <Question
                  {...q}
                  updateQuestion={updateQuestion}
                  duplicateQuestion={duplicateQuestion}
                  removeQuestion={removeQuestion}
                  isActive={activeQuestionId === q.id}
                />
              </div>
            ))}
          </div>
        </div>

        {sections.map((s, index) => {
          // First Untitled Form is Section 1.
          // Subsequent sections start from Section 2 based on their ordered position.
          const sectionIndex = index + 2;
          const isActiveSection = activeSectionId === s.id;

          return (
            <div
              className="flex flex-col md:flex-row justify-center"
              key={s.id}
            >
              <div className="w-full max-w-4xl relative">
                <div
                  onClick={() => handleSetActiveSection(s.id)}
                  className={`transition ${
                    isActiveSection
                      ? "ring-2 ring-blue-500/40 rounded-lg"
                      : "hover:ring-1 hover:ring-gray-200 rounded-lg"
                  }`}
                >
                  <Section
                    id={s.id}
                    index={sectionIndex}
                    title={s.title}
                    description={s.description}
                    onRemove={removeSection}
                    active={isActiveSection}
                  />
                </div>

                {/* Desktop: Add controls beside this section card (aligned like Section 1) */}
                <div className="hidden md:flex flex-col gap-2 items-center absolute top-6 -right-16">
                  {/* Add Question - targets this specific section */}
                  <button
                    onClick={() => addQuestion(s.id)}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-100"
                    title="Add question"
                  >
                    <Plus size={18} className="text-gray-700" />
                  </button>
                  {/* Add Section - appends next section; numbering logic already continuous */}
                  <button
                    onClick={addSection}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-100"
                    title="Add new section"
                  >
                    <AlignLeft size={18} className="text-gray-700" />
                  </button>
                </div>

                {(s.questions || []).map((q) => (
                  <div
                    key={q.id}
                    className="relative mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetActiveQuestion(s.id, q.id);
                    }}
                  >
                    {/* Desktop: controls beside each section question */}
                    <div className="hidden md:flex flex-col gap-2 items-center absolute top-6 -right-16">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addQuestion(s.id);
                        }}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-100"
                        title="Add question"
                      >
                        <Plus size={18} className="text-gray-700" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addSection();
                        }}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-100"
                        title="Add new section"
                      >
                        <AlignLeft size={18} className="text-gray-700" />
                      </button>
                    </div>

                    <Question
                      {...q}
                      updateQuestion={updateQuestion}
                      duplicateQuestion={duplicateQuestion}
                      removeQuestion={removeQuestion}
                      isActive={activeQuestionId === q.id}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div className="flex flex-col items-center justify-center py-8 bg-gray-100">
          <button
            onClick={() => {
              // Require a persisted form id before navigating to link certificates
              if (!currentFormId) {
                toast.error("Please publish the form first before linking a certificate.");
                return;
              }
              navigate(`/psas/certificates?from=evaluation&formId=${currentFormId}`);
            }}
            className={`px-8 py-3 rounded-lg font-semibold transition-colors
              ${isCertificateLinked
                ? "bg-[#0C2A92] text-white hover:bg-blue-800"
                : "bg-white text-[#5F6368] hover:bg-gray-100 border border-gray-300"}`}
          >
            {isCertificateLinked ? "Certificate Linked" : "Link Certificate"}
          </button>
          {!currentFormId && (
            <p className="text-sm text-gray-500 mt-2 text-center max-w-xs">
              Publish the form first to generate an ID, then you can link a certificate to this evaluation.
            </p>
          )}
        </div>

        {/* Mobile: bottom-fixed FAB toolbar targeting active section */}
        <div className="md:hidden fixed bottom-6 right-6 z-30">
          {isFabOpen && (
            <div className="flex flex-col items-center gap-3 mb-3">
              <button
                onClick={() => {
                  addQuestion(activeSectionId || "main");
                  setIsFabOpen(false);
                }}
                className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center"
                title="Add question to active section"
              >
                <Plus size={24} className="text-gray-700" />
              </button>
              <button
                onClick={() => {
                  addSection();
                  setIsFabOpen(false);
                }}
                className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center"
                title="Add new section"
              >
                <AlignLeft size={24} className="text-gray-700" />
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
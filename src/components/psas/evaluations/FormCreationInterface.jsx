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
  Palette,
} from "lucide-react";
import Question from "./Question";
import Section from "./Section";
import ImportCSVModal from "./ImportCSVModal";
import SuccessScreen from "./SuccessScreen";
import CertificateStatusWidget from "./CertificateStatusWidget";
import InlineCertificatePanel from "./InlineCertificatePanel";
import EnhancedPublishArea from "./EnhancedPublishArea.jsx";
import CertificateCustomizer from "../certificates/CertificateCustomizer";
import { useAuth } from "../../../contexts/useAuth";
import { FormSessionManager } from "../../../utils/formSessionManager";
import PSASLayout from "../../psas/PSASLayout";
import toast from "react-hot-toast";

// Helper to generate IDs

/**
 * FormCreationInterface - Comprehensive form creation system
 * Key principles:
 * - CSV data is never persisted to localStorage
 * - Form metadata is managed through FormSessionManager
 * - Navigation maintains proper form ID context
 * - Student assignments are persisted separately from CSV
 */
const FormCreationInterface = ({ onBack, currentFormId: propFormId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();

  // Core form state
  const [questions, setQuestions] = useState([]);
  const [sections, setSections] = useState([]);
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [formTitle, setFormTitle] = useState("Untitled Form");
  const [formDescription, setFormDescription] = useState("Form Description");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // currentFormId is the SERVER id once created; null means purely local draft
  const [currentFormId, setCurrentFormId] = useState(null);
  const [formWasPublished, setFormWasPublished] = useState(false);

  // UI state
  const [showMenu, setShowMenu] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [showCertificateCustomizer, setShowCertificateCustomizer] =
    useState(false);

  // Form content state
  const [activeSectionId, setActiveSectionId] = useState("main");
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [isCertificateLinked, setIsCertificateLinked] = useState(false);
  const [certificateValidationStatus, setCertificateValidationStatus] =
    useState({ isValid: true, message: "" });
  const [csvValidationStatus, setCSVValidationStatus] = useState({
    isValid: true,
    message: "",
    recordCount: 0,
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedLinks, setUploadedLinks] = useState([]);
  const [uploadedCSVData, setUploadedCSVData] = useState(null);
  const [linkedCertificateId, setLinkedCertificateId] = useState(null);
  const [linkedCertificateType, setLinkedCertificateType] =
    useState("completion");
  const [certificateTemplateName, setCertificateTemplateName] = useState(null);
  // Initialization flag no longer controls the Publish button UI; keep internal-only usage if needed.

  // Form session context
  const formCanvasRef = useRef(null);
  const [assignedStudents, setAssignedStudents] = useState(
    FormSessionManager.loadStudentAssignments() || []
  );

  const handleBackClick = () => {
    const isEditing = localStorage.getItem("editFormId");

    // If form was published, clear all form data and navigate back
    if (formWasPublished) {
      // Clear all form data when going back after successful publish
      FormSessionManager.clearAllFormData();

      // Clear localStorage keys
      const keysToRemove = [
        "tempFormData",
        "uploadedFormId",
        "editFormId",
        "studentSelection",
        "preservedFormId",
        "preservedFormIdTimestamp",
      ];
      keysToRemove.forEach((key) => localStorage.removeItem(key));

      // Clear any certificate-related flags
      if (currentFormId) {
        localStorage.removeItem(`certificateLinked_${currentFormId}`);
        localStorage.removeItem(`formRecipients_${currentFormId}`);
      }

      // Reset all form state
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
      setHasShownRecipientsToast(false);
      setFormWasPublished(false);
      setShowMenu(false);
      setShowDatePicker(false);
      setShowImportModal(false);
      setShowSuccessScreen(false);

      onBack();
      return;
    }

    // For non-published forms, check for unsaved changes
    if (isEditing && hasUnsavedChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to leave without saving?"
      );
      if (!confirmed) return;
    }
    onBack();
  };

  const openImportModal = () => {
    setShowImportModal(true);
  };

  /**
   * Persist form state locally (no network).
   * NOTE:
   * - Must be stable and NOT cause render loops.
   * - Do NOT include persistFormState itself as a dependency of effects that call it.
   */
  const persistFormState = useCallback(() => {
    const currentState = {
      formTitle,
      formDescription,
      questions,
      sections,
      uploadedFiles,
      uploadedLinks,
      eventStartDate,
      eventEndDate,
      currentFormId,
      isCertificateLinked,
      linkedCertificateId,
    };
    FormSessionManager.saveFormData(currentState);
  }, [
    formTitle,
    formDescription,
    questions,
    sections,
    uploadedFiles,
    uploadedLinks,
    eventStartDate,
    eventEndDate,
    currentFormId,
    isCertificateLinked,
    linkedCertificateId,
  ]);

  // Check for recipients parameter from student list navigation
  const [hasShownRecipientsToast, setHasShownRecipientsToast] = useState(false);

  // Helper function to get certificate linked status for current form ID
  const checkCertificateLinkedStatus = useCallback((formId) => {
    if (!formId) return false;

    // Check multiple possible certificate linked keys
    const possibleKeys = [
      `certificateLinked_${formId}`,
      `certificateLinked_temp_${formId}`,
      `certificateLinked_${formId.replace("temp_form_", "temp_")}`,
    ];

    for (const key of possibleKeys) {
      if (localStorage.getItem(key) === "true") {
        return true;
      }
    }
    return false;
  }, []);

  /**
   * Initialization and restore flow:
   * - Restores local draft from FormSessionManager on mount/navigation.
   * - If URL specifies an existing formId (24-char ObjectId), loads from backend.
   * - Does NOT create server draft automatically; that happens lazily on autosave/publish.
   */
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const formIdFromUrl = urlParams.get("formId");
    const recipients = urlParams.get("recipients");
    const edit = urlParams.get("edit");
    const isNewForm =
      urlParams.get("new") === "true" || urlParams.get("view") === "create";

    // Check if we're returning from certificate linking (special case - don't clear data)
    const isReturningFromCertificate = edit && recipients;

    // Only clear existing data when this is an explicit brand-new creation context,
    // NOT on every render without params. This prevents infinite reset loops.
    const shouldClearExistingData =
      isNewForm ||
      (formIdFromUrl === null &&
        !edit &&
        !recipients &&
        !isReturningFromCertificate);

    if (shouldClearExistingData) {
      // Preserve tempFormData if it exists (e.g. from Google Forms extraction)
      const tempFormData = localStorage.getItem("tempFormData");

      FormSessionManager.clearAllFormData();

      // Restore tempFormData
      if (tempFormData) {
        localStorage.setItem("tempFormData", tempFormData);
      }

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
      setHasShownRecipientsToast(false);
      setFormWasPublished(false);

      FormSessionManager.clearPreservedFormId();
      console.log(
        "🧹 FormCreationInterface - Starting with completely empty form state"
      );
    }

    // Check if we're returning from a navigation (CSV upload, certificate linking, etc.)
    const restoredFormId = FormSessionManager.restoreFormId();

    // Determine effective form id from URL, props, or restored id
    // Priority: propFormId > URL params > restored id
    const urlFormId = edit || formIdFromUrl;
    const effectiveFormId = propFormId || restoredFormId || urlFormId || null;

    let finalFormId = null;

    if (!effectiveFormId) {
      // Brand new local draft session; no server form yet
      finalFormId = FormSessionManager.ensurePersistentFormId();
    } else {
      // Normalize/persist when explicit id provided via URL/preserved context.
      finalFormId = FormSessionManager.ensurePersistentFormId(effectiveFormId);
    }

    // Do NOT treat this as server id until confirmed from backend
    setCurrentFormId(
      /^[0-9a-fA-F]{24}$/.test(finalFormId) ? finalFormId : null
    );

    // Update assigned students for the correct formId
    if (finalFormId) {
      FormSessionManager.ensurePersistentFormId(finalFormId);
      const updatedAssignedStudents =
        FormSessionManager.loadStudentAssignments() || [];
      setAssignedStudents(updatedAssignedStudents);
    }

    // If we have an effective form id from URL/preserved AND it looks like a real backend id,
    // try to load it from backend for editing. Never call backend for ids that no longer exist
    // or for purely local draft ids.
    if (effectiveFormId && token) {
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(effectiveFormId);

      if (isValidObjectId) {
        const fetchFormData = async () => {
          try {
            const response = await fetch(`/api/forms/${finalFormId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data) {
                const formData = data.data;

                // Separate main questions and section questions based on sectionId
                const mainQuestions = [];
                const sectionQuestions = [];

                if (formData.questions) {
                  formData.questions.forEach((q) => {
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
                          emojiStyle = null; // Likert doesn't use icons
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

                    const clientQuestion = {
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

                    // Distribute questions based on sectionId
                    if (q.sectionId === "main" || !q.sectionId) {
                      mainQuestions.push(clientQuestion);
                    } else {
                      sectionQuestions.push({
                        ...clientQuestion,
                        sectionId: q.sectionId,
                      });
                    }
                  });
                }

                // Reconstruct sections with their questions
                const reconstructedSections = (formData.sections || []).map(
                  (section) => {
                    return {
                      ...section,
                      questions:
                        sectionQuestions.filter(
                          (q) => q.sectionId === section.id
                        ) || [],
                    };
                  }
                );

                const mappedFormData = {
                  formTitle: formData.title || "Untitled Form",
                  formDescription: formData.description || "Form Description",
                  questions: mainQuestions,
                  sections: reconstructedSections,
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
                  currentFormId: finalFormId,
                  isCertificateLinked: false,
                  linkedCertificateId: formData.certificateId || null,
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
                setHasUnsavedChanges(false);

                // Optional certificate check (non-blocking) for persisted forms only
                try {
                  const isObjectId = /^[0-9a-fA-F]{24}$/.test(finalFormId);
                  if (isObjectId) {
                    const certificateResponse = await fetch(
                      `/api/certificates/form/${finalFormId}`,
                      {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );

                    if (certificateResponse.ok) {
                      const certificateData = await certificateResponse.json();
                      if (
                        certificateData.success &&
                        certificateData.data &&
                        certificateData.data.length > 0
                      ) {
                        setIsCertificateLinked(true);
                        mappedFormData.isCertificateLinked = true;
                      }
                    }
                    // If 404 or non-ok: just means no link yet; do not log noise.
                  }
                } catch {
                  // ignore certificate check failures entirely for UX stability
                }

                // Persist as checkpoint
                FormSessionManager.saveFormData(mappedFormData);
                localStorage.setItem("editFormId", finalFormId);
              }
            } else if (response.status === 404) {
              // Backend says this form id does not exist anymore.
              // Treat this as stale and reset to a clean "new form" state to avoid repeated 404s.
              localStorage.removeItem("editFormId");
              FormSessionManager.clearAllFormData();
              setCurrentFormId(null);
              setFormTitle("Untitled Form");
              setFormDescription("Form Description");
              setQuestions([]);
              setSections([]);
              setUploadedFiles([]);
              setUploadedLinks([]);
              setUploadedCSVData(null);
              setEventStartDate("");
              setEventEndDate("");
              setIsCertificateLinked(false);
              setLinkedCertificateId(null);
              setLinkedCertificateType("completion");
              setCertificateTemplateName(null);
              setHasUnsavedChanges(false);
              return;
            } else {
              toast.error("Failed to load form data for editing");
            }
          } catch {
            // On fetch error, restore any existing session instead of looping
            const restoreTimeout = setTimeout(() => {
              const loadedData = FormSessionManager.loadFormData();
              if (loadedData) {
                setFormTitle(loadedData.formTitle || "Untitled Form");
                setFormDescription(
                  loadedData.formDescription || "Form Description"
                );
                setQuestions(loadedData.questions || []);
                setSections(loadedData.sections || []);
                setUploadedFiles(loadedData.uploadedFiles || []);
                setUploadedLinks(loadedData.uploadedLinks || []);
                setUploadedCSVData(null);
                setEventStartDate(loadedData.eventStartDate || "");
                setEventEndDate(loadedData.eventEndDate || "");
                setIsCertificateLinked(loadedData.isCertificateLinked || false);
                setLinkedCertificateId(loadedData.linkedCertificateId || null);
                setLinkedCertificateType(
                  loadedData.linkedCertificateType || "completion"
                );
                setCertificateTemplateName(
                  loadedData.certificateTemplateName || null
                );
                setAssignedStudents(
                  FormSessionManager.loadStudentAssignments() || []
                );
              }
            }, 50);
            return () => clearTimeout(restoreTimeout);
          }
        };

        fetchFormData();
      } else {
        // Invalid backend id: treat as purely local draft, do NOT call any /api/certificates/form/:id here.
        const restoreTimeout = setTimeout(() => {
          const loadedData = FormSessionManager.loadFormData();
          if (loadedData) {
            setFormTitle(loadedData.formTitle || "Untitled Form");
            setFormDescription(
              loadedData.formDescription || "Form Description"
            );
            setQuestions(loadedData.questions || []);
            setSections(loadedData.sections || []);
            setUploadedFiles(loadedData.uploadedFiles || []);
            setUploadedLinks(loadedData.uploadedLinks || []);
            setUploadedCSVData(null);
            setEventStartDate(loadedData.eventStartDate || "");
            setEventEndDate(loadedData.eventEndDate || "");
            setIsCertificateLinked(
              loadedData.isCertificateLinked ||
                checkCertificateLinkedStatus(
                  FormSessionManager.getCurrentFormId()
                )
            );
            setLinkedCertificateId(loadedData.linkedCertificateId || null);
            setAssignedStudents(
              FormSessionManager.loadStudentAssignments() || []
            );
          }
        }, 50);
        return () => clearTimeout(restoreTimeout);
      }
    } else {
      // No effective id: restore any existing session or create new persistent one
      const restoreTimeout = setTimeout(() => {
        const loadedData = FormSessionManager.loadFormData();
        if (loadedData) {
          setFormTitle(loadedData.formTitle || "Untitled Form");
          setFormDescription(loadedData.formDescription || "Form Description");
          setQuestions(loadedData.questions || []);
          setSections(loadedData.sections || []);
          setUploadedFiles(loadedData.uploadedFiles || []);
          setUploadedLinks(loadedData.uploadedLinks || []);
          setUploadedCSVData(null);
          setEventStartDate(loadedData.eventStartDate || "");
          setEventEndDate(loadedData.eventEndDate || "");
          setIsCertificateLinked(
            loadedData.isCertificateLinked ||
              checkCertificateLinkedStatus(finalFormId)
          );
          setAssignedStudents(
            FormSessionManager.loadStudentAssignments() || []
          );
        }
      }, 50);
      return () => clearTimeout(restoreTimeout);
    }

    // Handle return from student assignment page - preserve form data (CSV remains in-memory only)
    if (recipients && !hasShownRecipientsToast) {
      const formData = FormSessionManager.loadFormData();
      const currentFormId = FormSessionManager.getCurrentFormId();

      if (formData) {
        // Use direct setState instead of updateFormState to avoid dependency issues
        setFormTitle(formData.formTitle || "Untitled Form");
        setFormDescription(formData.formDescription || "Form Description");
        setQuestions(formData.questions || []);
        setSections(formData.sections || []);
        setUploadedFiles(formData.uploadedFiles || []);
        setUploadedLinks(formData.uploadedLinks || []);
        // Do NOT hydrate uploadedCSVData from storage; students list is already resolved
        setUploadedCSVData(null);
        setEventStartDate(formData.eventStartDate || "");
        setEventEndDate(formData.eventEndDate || "");
        setCurrentFormId(currentFormId);
        setIsCertificateLinked(
          formData.isCertificateLinked ||
            checkCertificateLinkedStatus(currentFormId)
        );
        setLinkedCertificateId(formData.linkedCertificateId || null);
        setAssignedStudents(FormSessionManager.loadStudentAssignments() || []);
      }

      // Update assigned students state from FormSessionManager
      const updatedAssignedStudents =
        FormSessionManager.loadStudentAssignments() || [];
      setAssignedStudents(updatedAssignedStudents);

      // Force immediate save again after student assignment to ensure all sections are preserved
      setTimeout(() => {
        persistFormState();
      }, 100);

      setHasUnsavedChanges(false);
      const toastTimeout = setTimeout(() => {
        toast.success(`${recipients} students assigned to this form`);
        setHasShownRecipientsToast(true);
        // Clear preserved form ID after successful return
        FormSessionManager.clearPreservedFormId();
      }, 500);
      return () => clearTimeout(toastTimeout);
    }

    // Handle return from certificate linking page
    if (edit) {
      const currentFormId = FormSessionManager.getCurrentFormId();

      // First priority: restore from saved form data (this preserves sections, questions, etc.)
      const formData = FormSessionManager.loadFormData();
      if (formData) {
        console.log(
          "🔄 Restoring form data from certificate linking:",
          formData
        );

        // Use direct setState to restore all form data including sections
        setFormTitle(formData.formTitle || "Untitled Form");
        setFormDescription(formData.formDescription || "Form Description");
        setQuestions(formData.questions || []);
        // Debug log: show loaded sections
        console.log("[Restore] Loaded sections:", formData.sections);
        setSections(formData.sections || []);
        setUploadedFiles(formData.uploadedFiles || []);
        setUploadedLinks(formData.uploadedLinks || []);
        setEventStartDate(formData.eventStartDate || "");
        setEventEndDate(formData.eventEndDate || "");
        setCurrentFormId(currentFormId || formData.currentFormId);
        setIsCertificateLinked(
          formData.isCertificateLinked ||
            checkCertificateLinkedStatus(
              currentFormId || formData.currentFormId
            )
        );
        setLinkedCertificateId(formData.linkedCertificateId || null);
        setAssignedStudents(FormSessionManager.loadStudentAssignments() || []);
        setHasUnsavedChanges(false); // We've just restored from saved state
      } else {
        console.warn(
          "⚠️ No saved form data found when returning from certificate linking"
        );
      }

      if (currentFormId) {
        // Use the helper function to check for certificate linked status
        const isLinked = checkCertificateLinkedStatus(currentFormId);

        if (isLinked) {
          setIsCertificateLinked(true);

          // Clean up certificate linked flag
          const possibleKeys = [
            `certificateLinked_${currentFormId}`,
            `certificateLinked_temp_${currentFormId}`,
            `certificateLinked_${currentFormId.replace("temp_form_", "temp_")}`,
          ];

          possibleKeys.forEach((key) => {
            localStorage.removeItem(key);
          });

          // Update the saved form data to reflect the certificate linked status
          const currentData = FormSessionManager.loadFormData();
          if (currentData) {
            const updatedData = {
              ...currentData,
              isCertificateLinked: true,
            };
            FormSessionManager.saveFormData(updatedData);
          }
        }
      }

      // Clear preserved form ID after successful return from certificate linking
      FormSessionManager.clearPreservedFormId();

      // Force immediate save again after certificate linking to ensure all sections are preserved
      setTimeout(() => {
        persistFormState();
      }, 100);

      // Clear the editFormId since we've successfully handled the edit context
      localStorage.removeItem("editFormId");
    }

    // Check for tempFormData from URL extraction (Google Forms, file upload, etc.)
    const tempFormDataStr = localStorage.getItem("tempFormData");
    if (tempFormDataStr && !hasShownRecipientsToast && !edit) {
      const loadTimeout = setTimeout(() => {
        try {
          const tempData = JSON.parse(tempFormDataStr);
          console.log(
            "📥 [FormCreationInterface] Loading tempFormData:",
            tempData
          );

          // Convert backend format questions to frontend format
          const convertedQuestions = (tempData.questions || []).map((q) => {
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
                  emojiStyle = null;
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
              sectionId: q.sectionId, // Preserve sectionId
            };
          });

          console.log(
            `✅ [FormCreationInterface] Converted ${convertedQuestions.length} questions`
          );

          // Separate main questions and section questions
          const mainQuestions = [];
          const sectionQuestions = [];

          convertedQuestions.forEach((q) => {
            if (!q.sectionId || q.sectionId === "main") {
              mainQuestions.push(q);
            } else {
              sectionQuestions.push(q);
            }
          });

          // Reconstruct sections with their questions
          const reconstructedSections = (tempData.sections || []).map(
            (section) => ({
              ...section,
              questions: sectionQuestions.filter(
                (q) => q.sectionId === section.id
              ),
            })
          );

          // Load the data into the form
          setFormTitle(tempData.title || "Untitled Form");
          setFormDescription(tempData.description || "Form Description");
          setQuestions(mainQuestions);
          setSections(reconstructedSections);
          setUploadedFiles(tempData.uploadedFiles || []);
          setUploadedLinks(tempData.uploadedLinks || []);

          // Save to FormSessionManager so it persists
          const formDataToSave = {
            formTitle: tempData.title || "Untitled Form",
            formDescription: tempData.description || "Form Description",
            questions: mainQuestions,
            sections: reconstructedSections,
            uploadedFiles: tempData.uploadedFiles || [],
            uploadedLinks: tempData.uploadedLinks || [],
            eventStartDate: "",
            eventEndDate: "",
            currentFormId: finalFormId,
            isCertificateLinked: false,
            linkedCertificateId: null,
          };

          FormSessionManager.saveFormData(formDataToSave);

          // Clear tempFormData after loading
          localStorage.removeItem("tempFormData");

          toast.success(
            `Loaded form with ${convertedQuestions.length} question${
              convertedQuestions.length !== 1 ? "s" : ""
            }`
          );
        } catch (error) {
          console.error("Error loading tempFormData:", error);
          toast.error("Failed to load extracted form data");
          localStorage.removeItem("tempFormData");
        }
      }, 100);
      return () => clearTimeout(loadTimeout);
    }

    // Mark initialization as complete (no longer used to gate Publish button)
    // Previously: setIsInitializing(false);
  }, [
    location?.search,
    hasShownRecipientsToast,
    token,
    checkCertificateLinkedStatus,
    propFormId,
  ]);

  /**
   * Debounced autosave:
   * - Always persists to local storage.
   * - If currentFormId is a real ObjectId (server draft exists), also PATCHes /api/forms/:id/draft.
   * - Does not run when form already published.
   */
  useEffect(() => {
    if (formWasPublished) return;

    const timeoutId = setTimeout(async () => {
      try {
        // Always persist locally
        const storageUsage = FormSessionManager.getStorageUsage();
        if (storageUsage.usedMB < 4.5) {
          persistFormState();
        } else {
          // When storage is limited, still save essential data including sections
          FormSessionManager.saveFormData({
            formTitle,
            formDescription,
            questions,
            sections,
            uploadedFiles,
            uploadedLinks,
            eventStartDate,
            eventEndDate,
            currentFormId,
            isCertificateLinked,
            linkedCertificateId,
          });
        }

        // If we already have a server draft, sync it
        if (currentFormId && /^[0-9a-fA-F]{24}$/.test(currentFormId) && token) {
          // Convert frontend question format to backend format for autosave
          const backendQuestions = mapQuestionsToBackend(questions, sections);

          // Strip questions from sections before sending (backend stores questions flat, not nested)
          const sectionsWithoutQuestions = sections.map((section) => {
            const { questions: _questions, ...rest } = section;
            return rest;
          });

          const draftPayload = {
            title: formTitle,
            description: formDescription,
            questions: backendQuestions,
            sections: sectionsWithoutQuestions,
            uploadedFiles,
            uploadedLinks,
            eventStartDate,
            eventEndDate,
            isCertificateLinked,
            linkedCertificateId,
          };

          const res = await fetch(`/api/forms/${currentFormId}/draft`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(draftPayload),
          });

          if (!res.ok) {
            console.warn(
              "Draft autosave failed",
              res.status,
              await res.text().catch(() => "")
            );
          }
        }
      } catch (err) {
        console.error("Draft autosave error:", err);
      }
    }, 800);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formTitle,
    formDescription,
    questions,
    sections,
    uploadedFiles,
    uploadedLinks,
    eventStartDate,
    eventEndDate,
    currentFormId,
    token,
    formWasPublished,
  ]);

  // Force persist state immediately when navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Only persist if we have actual form content and it's not a new form
      const hasContent =
        questions.length > 0 ||
        sections.length > 0 ||
        formTitle !== "Untitled Form" ||
        eventStartDate ||
        eventEndDate;
      if (hasContent && !formWasPublished) {
        persistFormState();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    questions,
    sections,
    formTitle,
    eventStartDate,
    eventEndDate,
    formWasPublished,
  ]);

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

    if (targetSectionId === "main" || targetSectionId == null) {
      setQuestions((prevMainQuestions) => {
        const updatedQuestions = [...prevMainQuestions, newQuestion];
        // Defer persistence to debounced effect
        return updatedQuestions;
      });
    } else {
      setSections((prevSections) => {
        const updatedSections = prevSections.map((section) =>
          section.id === targetSectionId
            ? {
                ...section,
                questions: [...(section.questions || []), newQuestion],
              }
            : section
        );
        // Defer persistence to debounced effect
        return updatedSections;
      });
    }

    setHasUnsavedChanges(true);
    setActiveQuestionId(newQuestion.id);
  };

  // Add section with continuous, zero-gap numbering based on position
  const addSection = () => {
    const newSection = {
      id: Date.now().toString(), // UI-only unique id
      title: "Untitled Section",
      description: "Add a description",
      questions: [],
    };

    setSections((prev) => {
      const updated = [...prev, newSection];

      // Reindex: ensure continuous 1-based sectionNumber based on order
      const reindexed = updated.map((section, idx) => ({
        ...section,
        sectionNumber: idx + 1,
      }));

      // Debug log: show updated sections array
      console.log("[addSection] Updated sections:", reindexed);

      // Set active section (will trigger debounced persist)
      const last = reindexed[reindexed.length - 1];
      setActiveSectionId(last.id);
      setActiveQuestionId(null);
      setHasUnsavedChanges(true);

      return reindexed;
    });
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
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? updateFn(q) : q))
    );
    setSections((prev) =>
      prev.map((s) => ({
        ...s,
        questions: (s.questions || []).map((q) =>
          q.id === questionId ? updateFn(q) : q
        ),
      }))
    );
  }, []);

  // Handle section title and description updates
  const updateSection = useCallback((sectionId, field, value) => {
    console.log(`🔄 Updating section ${sectionId} ${field}:`, value);
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, [field]: value } : s))
    );
    setHasUnsavedChanges(true);
    // Let the debounced useEffect handle persistence - no need for setTimeout
  }, []);

  const duplicateQuestion = useCallback(
    (id) => {
      const mainQuestionIndex = questions.findIndex((q) => q.id === id);
      let updatedQuestions = [...questions];
      let updatedSections = sections.map((s) => ({
        ...s,
        questions: [...(s.questions || [])],
      }));

      // Create deep copy of the question
      const createQuestionCopy = (q) => ({
        ...q,
        id: makeId(),
        title: q.title ? `${q.title} (Copy)` : "Untitled Question (Copy)",
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
      updatedSections = updatedSections.map((s) => {
        const sectionQuestionIndex = (s.questions || []).findIndex(
          (q) => q.id === id
        );
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
    },
    [questions, sections]
  );

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

  // Robust CSV parsing function that matches server-side logic
  const parseCSV = useCallback((csvText) => {
    const lines = csvText.split(/\r?\n/).filter((line) => line.trim() !== "");
    if (lines.length < 2) return [];

    // Parse headers with trimming
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const nameIndex = headers.indexOf("name");
    const emailIndex = headers.indexOf("email");
    if (nameIndex === -1 || emailIndex === -1) return [];

    const students = [];
    const seen = new Set();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (let i = 1; i < lines.length; i++) {
      const raw = lines[i];
      if (!raw.trim()) continue;

      // Handle quoted fields and commas in CSV more robustly
      const values = [];
      let current = "";
      let inQuotes = false;

      for (let j = 0; j < raw.length; j++) {
        const char = raw[j];

        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim()); // Add the last value

      const name = values[nameIndex] || "";
      const email = (values[emailIndex] || "").toLowerCase().trim();

      if (!name || !email) return [];
      if (!emailRegex.test(email)) return [];

      const normalized = email.toLowerCase();
      if (seen.has(normalized)) return [];
      seen.add(normalized);

      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] ?? "";
      });
      students.push(row);
    }

    return students;
  }, []);

  // Enhanced CSV upload with comprehensive validation
  const handleCSVUpload = async (csvDataOrUrl) => {
    try {
      let csvData = null;

      if (
        csvDataOrUrl &&
        typeof csvDataOrUrl === "object" &&
        Array.isArray(csvDataOrUrl.students)
      ) {
        // Already validated object from ImportCSVModal
        csvData = csvDataOrUrl;
      } else if (typeof csvDataOrUrl === "string") {
        // Fallback for URL-based usage
        const url = csvDataOrUrl;
        const response = await fetch(url);
        const csvText = await response.text();
        const students = parseCSV(csvText);

        if (students.length > 0) {
          csvData = {
            filename: url.split("/").pop() || "uploaded.csv",
            students,
            uploadedAt: new Date().toISOString(),
            url,
          };
        }
      }

      if (
        !csvData ||
        !Array.isArray(csvData.students) ||
        csvData.students.length === 0
      ) {
        const errorMessage =
          "CSV upload failed validation. Ensure it includes 'name' and 'email' columns with unique, valid emails.";
        setCSVValidationStatus({
          isValid: false,
          message: errorMessage,
          recordCount: 0,
        });
        toast.error(errorMessage);
        return;
      }

      // Enhanced validation layer
      const validationResults = validateRecipientsData(csvData.students);
      if (!validationResults.isValid) {
        setCSVValidationStatus({
          isValid: false,
          message: validationResults.error,
          recordCount: csvData.students.length,
        });
        toast.error(validationResults.error);
        return;
      }

      // CSV data must remain in memory only; do NOT persist to localStorage.
      // Keep it in component state for the current session.
      setUploadedCSVData(csvData);

      // Also save to FormSessionManager for cross-page access
      FormSessionManager.saveTransientCSVData(csvData);

      // If this is an existing published form, update the attendee list in the database
      if (currentFormId && /^[0-9a-fA-F]{24}$/.test(currentFormId)) {
        try {
          console.log(
            `[CSV-UPLOAD] Updating attendee list for published form ${currentFormId}`
          );

          // Convert CSV students to attendee format
          const attendeeList = csvData.students.map((student) => ({
            name: student.name,
            email: student.email.toLowerCase().trim(),
            hasResponded: false,
            uploadedAt: new Date(),
          }));

          const response = await fetch(
            `/api/forms/${currentFormId}/attendees-json`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                attendeeFile: {
                  filename: csvData.filename,
                  students: attendeeList,
                },
              }),
            }
          );

          if (response.ok) {
            const result = await response.json();
            console.log(
              `[CSV-UPLOAD] Successfully updated attendee list:`,
              result
            );
            toast.success(
              `Attendee list updated in database (${attendeeList.length} students)`
            );
          } else {
            console.error(
              `[CSV-UPLOAD] Failed to update attendee list:`,
              response.status
            );
            toast.error("CSV uploaded but attendee list update failed");
          }
        } catch (attendeeError) {
          console.error(
            `[CSV-UPLOAD] Error updating attendee list:`,
            attendeeError
          );
          toast.error("CSV uploaded but attendee list update failed");
        }
      }

      setCSVValidationStatus({
        isValid: true,
        message: `Successfully loaded ${csvData.students.length} students`,
        recordCount: csvData.students.length,
      });
      setHasUnsavedChanges(true);
      toast.success(
        `Recipient list loaded: ${csvData.students.length} students from ${
          csvData.filename || "CSV"
        }`
      );
    } catch (error) {
      console.error("CSV upload/parse error:", error);
      const errorMessage =
        error.message ||
        "Failed to process CSV file. Please verify the format and try again.";

      setCSVValidationStatus({
        isValid: false,
        message: errorMessage,
        recordCount: 0,
      });

      toast.error(errorMessage, { duration: 6000 });
    }
  };

  // Comprehensive recipient data validation
  const validateRecipientsData = (students) => {
    // Basic structure validation
    if (!Array.isArray(students) || students.length === 0) {
      return { isValid: false, error: "No student records found in CSV file." };
    }

    // Required field validation
    const requiredFields = ["name", "email"];
    const firstRecord = students[0];
    const missingFields = requiredFields.filter(
      (field) => !(field in firstRecord)
    );

    if (missingFields.length > 0) {
      return {
        isValid: false,
        error: `Missing required fields: ${missingFields.join(
          ", "
        )}. Please ensure your CSV includes 'name' and 'email' columns.`,
      };
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = students.filter(
      (student) => !student.email || !emailRegex.test(student.email.trim())
    );

    if (invalidEmails.length > 0) {
      return {
        isValid: false,
        error: `Found ${invalidEmails.length} invalid email(s). Please ensure all emails are properly formatted.`,
      };
    }

    // Duplicate email validation
    const emailCounts = {};
    const duplicates = [];
    students.forEach((student) => {
      const email = student.email.toLowerCase().trim();
      emailCounts[email] = (emailCounts[email] || 0) + 1;
      if (emailCounts[email] > 1 && !duplicates.includes(email)) {
        duplicates.push(email);
      }
    });

    if (duplicates.length > 0) {
      return {
        isValid: false,
        error: `Found duplicate emails: ${duplicates.slice(0, 3).join(", ")}${
          duplicates.length > 3 ? "..." : ""
        }. Please ensure all emails are unique.`,
      };
    }

    // Name validation
    const invalidNames = students.filter(
      (student) => !student.name || student.name.trim().length < 2
    );

    if (invalidNames.length > 0) {
      return {
        isValid: false,
        error: `Found ${invalidNames.length} invalid name(s). Names must be at least 2 characters long.`,
      };
    }

    // File size and record count validation
    if (students.length > 10000) {
      return {
        isValid: false,
        error:
          "CSV file contains too many records (maximum 10,000 students allowed).",
      };
    }

    return { isValid: true, error: null };
  };

  // Certificate template validation
  const validateCertificateTemplate = useCallback(
    async (certificateId) => {
      try {
        console.log(
          `[Frontend] Starting validation for template: ${certificateId}`
        );
        const response = await fetch(
          `/api/certificates/${certificateId}/validate`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(
          `[Frontend] Validation response status: ${response.status}`
        );

        if (!response.ok) {
          console.error(
            `[Frontend] Validation failed with status ${response.status}`
          );
          const errorData = await response.json().catch(() => ({}));
          console.error(`[Frontend] Error response:`, errorData);
          setCertificateValidationStatus({
            isValid: false,
            message:
              errorData.message ||
              `Template validation failed (${response.status})`,
          });
          return false;
        }

        const data = await response.json();
        console.log(`[Frontend] Validation success:`, data);

        if (data.success && data.data) {
          setCertificateValidationStatus({
            isValid: data.data.isValid,
            message: data.data.message || "Certificate template is valid",
          });
          return data.data.isValid;
        }
      } catch (error) {
        console.error("Certificate validation error:", error);
        setCertificateValidationStatus({
          isValid: false,
          message: `Validation error: ${error.message}`,
        });
        return false;
      }
      return false;
    },
    [token]
  );

  // Auto-validate certificate when linking
  useEffect(() => {
    if (isCertificateLinked && linkedCertificateId) {
      validateCertificateTemplate(linkedCertificateId);
    }
  }, [isCertificateLinked, linkedCertificateId, validateCertificateTemplate]);

  const removeUploadedFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Map client question format to backend format
  const mapQuestionsToBackend = (clientQuestions, sections) => {
    const allQuestionsWithSection = [
      // Main section questions
      ...clientQuestions.map((q) => ({ ...q, sectionId: "main" })),
      // Section questions
      ...sections.flatMap((s, sectionIndex) => {
        const sectionNumber = sectionIndex + 2; // Sections start from 2
        return (s.questions || []).map((q) => ({
          ...q,
          sectionId: s.id, // Use the section id for association
          sectionNumber: sectionNumber,
        }));
      }),
    ];

    return allQuestionsWithSection.map((q) => {
      let type = "short_answer";
      let backendQuestion = {
        title: q.title || "Untitled Question",
        required: q.required || false,
        sectionId: q.sectionId || "main",
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
          backendQuestion.icon = null; // Likert scales don't use icons
          backendQuestion.lowLabel = q.likertStartLabel || "";
          backendQuestion.highLabel = q.likertEndLabel || "";
          break;
        case "Numeric Ratings":
          type = "scale";
          backendQuestion.low = 1;
          backendQuestion.high = q.ratingScale || 5;
          backendQuestion.icon = q.emojiStyle || "star";
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
    if (
      questions.length + sections.flatMap((s) => s.questions?.length || 0) ===
      0
    ) {
      toast.error("Please add at least one question");
      return;
    }

    // Load recipients and certificate link state from FormSessionManager for consistency
    const selectedStudents = FormSessionManager.loadStudentAssignments() || [];
    const transientCSVData = FormSessionManager.loadTransientCSVData();
    const hasCSVRecipients =
      (transientCSVData &&
        transientCSVData.students &&
        transientCSVData.students.length > 0) ||
      (uploadedCSVData &&
        uploadedCSVData.students &&
        uploadedCSVData.students.length > 0);
    const hasStudents =
      Array.isArray(selectedStudents) && selectedStudents.length > 0;
    const hasDates = Boolean(eventStartDate) && Boolean(eventEndDate);

    // Enhanced validation with specific error messages
    const validationErrors = [];

    // Step 1: Form content validation
    if (allQuestions.length === 0) {
      validationErrors.push("Please add at least one question to your form");
    }

    // Step 2: Event dates validation
    if (!hasDates) {
      validationErrors.push("Please set both event start date and end date");
    } else {
      const startDate = new Date(eventStartDate);
      const endDate = new Date(eventEndDate);
      if (startDate >= endDate) {
        validationErrors.push("Event end date must be after start date");
      }
    }

    // Step 3: Recipient validation
    if (!hasCSVRecipients && !hasStudents) {
      validationErrors.push(
        "Please upload a valid CSV recipient list or assign students to this form"
      );
    } else if (hasCSVRecipients && !csvValidationStatus.isValid) {
      validationErrors.push(
        `CSV validation error: ${csvValidationStatus.message}`
      );
    }

    // Step 4: Certificate validation (use normalized state)
    // Check if certificate is linked - use the state flag as the primary indicator
    // since it's set when certificate linking is successful
    const finalHasCertificate = isCertificateLinked;

    if (!finalHasCertificate) {
      validationErrors.push(
        "Please link a certificate template before publishing"
      );
    } else if (!certificateValidationStatus.isValid) {
      validationErrors.push(
        `Certificate validation error: ${certificateValidationStatus.message}`
      );
    }

    // Display validation errors
    if (validationErrors.length > 0) {
      const errorMessage = `Please fix the following before publishing:\n• ${validationErrors.join(
        "\n• "
      )}`;
      toast.error(errorMessage.replace(/\n/g, " "), { duration: 5000 });
      return;
    }

    const backendQuestions = mapQuestionsToBackend(questions, sections);

    // Strip questions from sections for backend (store flat)
    const sectionsWithoutQuestions = sections.map((section) => {
      const { questions: _, ...rest } = section;
      return rest;
    });

    // Use sectionsWithoutQuestions in the publish payload
    console.log("Sections without questions:", sectionsWithoutQuestions);

    // Get certificate information for publishing
    // NOTE: certificate linkage is currently handled separately; no-op placeholder removed

    // Determine final selected students - prioritize explicitly assigned students,
    // then fall back to CSV data (from FormSessionManager for consistency)
    let finalSelectedStudents = selectedStudents;
    if (
      (!selectedStudents || selectedStudents.length === 0) &&
      transientCSVData &&
      transientCSVData.students
    ) {
      finalSelectedStudents = transientCSVData.students;
    } else if (
      (!selectedStudents || selectedStudents.length === 0) &&
      uploadedCSVData &&
      uploadedCSVData.students
    ) {
      // Fallback to component state if FormSessionManager data is not available
      finalSelectedStudents = uploadedCSVData.students;
    }

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
        selectedStudents: finalSelectedStudents, // Include selected students or CSV data
        isCertificateLinked: isCertificateLinked,
        linkedCertificateId: linkedCertificateId,
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
              Authorization: `Bearer ${token}`,
            },
            body: formDataWithFile,
          });

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            if (uploadData.success && uploadData.data && uploadData.data.form) {
              toast.success("Form published successfully!");
              // Comprehensive cleanup then go back to dashboard
              FormSessionManager.clearAllFormData();

              // Clear localStorage keys
              const keysToRemove = [
                "tempFormData",
                "uploadedFormId",
                "editFormId",
                "studentSelection",
                "preservedFormId",
                "preservedFormIdTimestamp",
              ];
              keysToRemove.forEach((key) => localStorage.removeItem(key));

              // Reset all form state
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
              setHasShownRecipientsToast(false);
              setFormWasPublished(true);
              setShowSuccessScreen(false);

              // Go back to dashboard view
              onBack();
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
      // Normal publish flow for blank local drafts
      formData = {
        title: formTitle,
        description: formDescription,
        questions: backendQuestions,
        sections: sections || [],
        uploadedFiles,
        uploadedLinks,
        eventStartDate,
        eventEndDate,
        selectedStudents: finalSelectedStudents,
        isCertificateLinked: isCertificateLinked,
        linkedCertificateId: linkedCertificateId,
      };
    }

    setIsPublishing(true);
    try {
      let serverFormId = currentFormId;

      // 1) Ensure server draft exists
      if (!serverFormId || !/^[0-9a-fA-F]{24}$/.test(serverFormId)) {
        const createPayload = {
          ...formData,
          selectedStudents: finalSelectedStudents, // Include selected students for attendee list
        };
        const createResponse = await fetch("/api/forms/blank", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(createPayload),
        });

        const createData = await createResponse.json();
        if (
          !createResponse.ok ||
          !createData.success ||
          !createData.data?.form?._id
        ) {
          toast.error(
            `Error creating draft form: ${
              createData.message || createResponse.status
            }`
          );
          return;
        }

        serverFormId = createData.data.form._id;
        setCurrentFormId(serverFormId);
        localStorage.setItem("currentFormId", serverFormId);

        // Transfer selected students from old formId to new server formId
        const oldFormId = FormSessionManager.getCurrentFormId();
        if (oldFormId && oldFormId !== serverFormId) {
          const selectedStudents = FormSessionManager.loadStudentAssignments();
          FormSessionManager.initializeFormSession(serverFormId);
          if (selectedStudents && selectedStudents.length > 0) {
            FormSessionManager.saveStudentAssignments(selectedStudents);
          }
        } else {
          FormSessionManager.initializeFormSession(serverFormId);
        }
      } else {
        // 2) Update existing server draft before publish
        const draftRes = await fetch(`/api/forms/${serverFormId}/draft`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
        const draftJson = await draftRes.json();
        if (!draftRes.ok || !draftJson.success) {
          console.warn(
            "Draft update before publish failed",
            draftRes.status,
            draftJson
          );
        }
      }

      // 3) Publish server draft
      const publishPayload = {
        title: formTitle,
        description: formDescription,
        questions: backendQuestions,
        sections: sections || [],
        uploadedFiles,
        uploadedLinks,
        eventStartDate,
        eventEndDate,
        selectedStudents: finalSelectedStudents, // Include selected students for attendee list
        isCertificateLinked,
        linkedCertificateId,
        linkedCertificateType,
        certificateTemplateName,
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

      if (publishResponse.ok && publishData.success) {
        toast.success("Form published successfully!");
        setShowSuccessScreen(true);
        setFormWasPublished(true);
      } else {
        toast.error(
          `Error publishing form: ${
            publishData.message || publishResponse.status
          }`
        );
      }
    } catch (error) {
      console.error("Error publishing form:", error);
      toast.error(`Failed to publish form: ${error.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  // Check if this component is being used as a child component (has onBack prop and other context)
  // If used as child component, don't wrap with PSASLayout
  // If accessed via direct routing, wrap with PSASLayout
  // Preserve layout context across navigation to prevent layout breaking
  const isChildComponent = onBack;

  // Only preserve layout for child components, not for navigation returns
  const shouldPreserveLayout = isChildComponent;

  if (showSuccessScreen) {
    const successContent = (
      <SuccessScreen
        formId={currentFormId}
        onBackToEvaluations={() => {
          // Comprehensive state cleanup
          FormSessionManager.clearAllFormData();

          // Clear localStorage keys
          const keysToRemove = [
            "tempFormData",
            "uploadedFormId",
            "editFormId",
            "studentSelection",
          ];
          keysToRemove.forEach((key) => localStorage.removeItem(key));

          // Clear any certificate-related flags
          if (currentFormId) {
            localStorage.removeItem(`certificateLinked_${currentFormId}`);
            localStorage.removeItem(`formRecipients_${currentFormId}`);
          }

          // Clear all form state
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
          setHasShownRecipientsToast(false);
          setFormWasPublished(false);
          setShowMenu(false);
          setShowDatePicker(false);
          setShowImportModal(false);
          setShowSuccessScreen(false);

          // Navigate back to evaluations page and clear any URL parameters
          navigate("/psas/evaluations", { replace: true });
        }}
      />
    );

    // Only wrap with PSASLayout if accessed via direct routing (no props)
    // Preserve layout context across navigation to prevent layout breaking
    if (isChildComponent || shouldPreserveLayout) {
      return successContent;
    }
    return <PSASLayout>{successContent}</PSASLayout>;
  }

  // Calculate validation states for components
  const allQuestions = [
    ...questions,
    ...sections.flatMap((s) => s.questions || []),
  ];
  const hasQuestions = allQuestions.length > 0;
  const hasDates = Boolean(eventStartDate) && Boolean(eventEndDate);
  const hasStudents =
    Array.isArray(assignedStudents) && assignedStudents.length > 0;

  // Debug function to manually load tempFormData
  const debugLoadTempData = () => {
    const tempFormDataStr = localStorage.getItem("tempFormData");
    if (!tempFormDataStr) {
      alert("No tempFormData found in localStorage!");
      return;
    }
    try {
      const tempData = JSON.parse(tempFormDataStr);

      // Detailed debug for MC questions
      const mcQuestion = tempData.questions?.find(
        (q) => q.type === "multiple_choice" || q.type === "checkbox"
      );
      const mcDebugInfo = mcQuestion
        ? `\nFirst MC Question: "${mcQuestion.title}" has ${
            mcQuestion.options?.length || 0
          } options: [${(mcQuestion.options || []).join(", ")}]`
        : "\nNo MC questions found.";

      alert(
        `Found tempFormData with ${tempData.questions?.length} questions. Title: ${tempData.title}${mcDebugInfo}`
      );

      // Convert backend format questions to frontend format
      const convertedQuestions = (tempData.questions || []).map((q) => {
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
              emojiStyle = null;
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
      });

      setFormTitle(tempData.title || "Untitled Form");
      setFormDescription(tempData.description || "Form Description");
      setQuestions(convertedQuestions);
      setUploadedFiles(tempData.uploadedFiles || []);
      setUploadedLinks(tempData.uploadedLinks || []);

      // Force save
      const formDataToSave = {
        formTitle: tempData.title || "Untitled Form",
        formDescription: tempData.description || "Form Description",
        questions: convertedQuestions,
        sections: [],
        uploadedFiles: tempData.uploadedFiles || [],
        uploadedLinks: tempData.uploadedLinks || [],
        eventStartDate: "",
        eventEndDate: "",
        currentFormId: currentFormId,
        isCertificateLinked: false,
        linkedCertificateId: null,
      };
      FormSessionManager.saveFormData(formDataToSave);

      alert(`Loaded ${convertedQuestions.length} questions!`);
    } catch (e) {
      alert("Error parsing tempFormData: " + e.message);
    }
  };

  const content = (
    <>
      {/* Certificate Status Widget - Floating status indicator */}
      <CertificateStatusWidget
        isCertificateLinked={isCertificateLinked}
        linkedCertificateId={linkedCertificateId}
        certificateValidationStatus={certificateValidationStatus}
      />

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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Set Event Dates
                </button>
                <button
                  onClick={debugLoadTempData}
                  className="px-4 py-2 border border-red-300 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
                >
                  Debug: Load Data
                </button>
                {isCertificateLinked && currentFormId && (
                  <button
                    onClick={() => setShowCertificateCustomizer(true)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Palette size={16} />
                    Customize Certificate
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* TODO: Wire undo/redo using a history stack */}
              <button
                className="p-2 text-gray-600 hover:bg-gray-200 rounded-full"
                // placeholder: no-op for now; prevents page jumps
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                className="p-2 text-gray-600 hover:bg-gray-200 rounded-full"
                // placeholder: no-op for now; prevents page jumps
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <RotateCw className="w-5 h-5" />
              </button>
              <button
                className="p-2 text-gray-600 hover:bg-gray-200 rounded-full"
                onClick={() => {
                  // Force immediate save before navigation to ensure sections are preserved
                  persistFormState();

                  // Ensure we have a stable draft id for this session (local-only at this point)
                  const stableFormId =
                    FormSessionManager.getCurrentFormId() ||
                    FormSessionManager.initializeFormSession();

                  // Also preserve the id for navigation continuity
                  FormSessionManager.preserveFormId();

                  // Require a CSV import before assigning students, but do NOT wipe form state
                  if (
                    !uploadedCSVData ||
                    !Array.isArray(uploadedCSVData.students) ||
                    uploadedCSVData.students.length === 0
                  ) {
                    toast.error(
                      "Please import a CSV file first to assign students. All current form inputs are saved as draft."
                    );
                    openImportModal();
                    return;
                  }

                  // Navigate to student assignment page with the stable form id
                  const navigationUrl = `/psas/students?formId=${encodeURIComponent(
                    stableFormId
                  )}&from=evaluation`;
                  navigate(navigationUrl);
                }}
              >
                <UserPlus className="w-5 h-5" />
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handlePublish}
                  // Keep disabled only while actively publishing, not during init.
                  disabled={isPublishing}
                  className={`px-6 py-2 font-semibold rounded-md transition ${
                    isPublishing
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {/* Always show consistent label as requested (no Loading.../Publishing...) */}
                  Publish
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
                onClick={(e) => {
                  // Don't activate section when clicking on input fields
                  if (
                    e.target.tagName !== "INPUT" &&
                    e.target.tagName !== "TEXTAREA"
                  ) {
                    handleSetActiveSection("main");
                  }
                }}
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
                  value={formTitle === "Untitled Form" ? "" : formTitle}
                  placeholder="Untitled Form"
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormTitle(value || "Untitled Form");
                    setHasUnsavedChanges(true);
                  }}
                  className="text-3xl sm:text-5xl font-bold w-full border-none outline-none mb-2 text-center placeholder:text-gray-400 bg-transparent"
                />
                <textarea
                  value={
                    formDescription === "Form Description"
                      ? ""
                      : formDescription
                  }
                  placeholder="Form Description"
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormDescription(value || "Form Description");
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full text-base sm:text-lg text-gray-600 border-none outline-none resize-none mb-4 text-center placeholder:text-gray-400 bg-transparent"
                  rows={1}
                />

                {/* Show CSV import status and assigned students indicator */}
                {(() => {
                  const csvData = uploadedCSVData;
                  const assignedCount = assignedStudents.length;
                  const urlParams = new URLSearchParams(location.search);
                  const recipients = urlParams.get("recipients");

                  // Show CSV import status if data exists in current session memory
                  if (
                    csvData &&
                    csvData.students &&
                    csvData.students.length > 0
                  ) {
                    return (
                      <div className="flex flex-col gap-2">
                        {/* CSV Import Success Indicator */}
                        <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                          <Upload size={16} />
                          <span>
                            {csvData.students.length} students loaded from CSV:{" "}
                            {csvData.filename || "uploaded.csv"}
                          </span>
                        </div>

                        {/* Assigned Students Indicator */}
                        {(assignedCount > 0 || recipients) && (
                          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                            <UserPlus size={16} />
                            <span>
                              {assignedCount > 0
                                ? assignedCount
                                : recipients
                                ? parseInt(recipients)
                                : 0}
                              student
                              {(assignedCount > 0
                                ? assignedCount
                                : recipients
                                ? parseInt(recipients)
                                : 0) !== 1
                                ? "s"
                                : ""}{" "}
                              assigned to this form
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
                  onClick={(e) => {
                    e.stopPropagation();
                    addQuestion("main");
                  }}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-100"
                  title="Add question"
                >
                  <Plus size={18} className="text-gray-700" />
                </button>
                {/* Add Section */}
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
                      onUpdateSection={updateSection}
                    />
                  </div>

                  {/* Desktop: Add controls beside this section card (aligned like Section 1) */}
                  <div className="hidden md:flex flex-col gap-2 items-center absolute top-6 -right-16">
                    {/* Add Question - targets this specific section */}
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
                    {/* Add Section - appends next section; numbering logic already continuous */}
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

          {/* Inline Certificate Panel with Smart Suggestions */}
          <InlineCertificatePanel
            isCertificateLinked={isCertificateLinked}
            linkedCertificateId={linkedCertificateId}
            certificateValidationStatus={certificateValidationStatus}
            formTitle={formTitle}
            questions={questions}
            sections={sections}
          />

          {/* Enhanced Publish Area with Certificate Validation Feedback */}
          <EnhancedPublishArea
            isPublishing={isPublishing}
            isCertificateLinked={isCertificateLinked}
            certificateValidationStatus={certificateValidationStatus}
            csvValidationStatus={csvValidationStatus}
            hasStudents={hasStudents}
            hasQuestions={hasQuestions}
            hasDates={hasDates}
            onPublish={handlePublish}
          />

          {/* Mobile: bottom-fixed FAB toolbar targeting active section */}
          <div className="md:hidden fixed bottom-6 right-6 z-30">
            {isFabOpen && (
              <div className="flex flex-col items-center gap-3 mb-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addQuestion(activeSectionId || "main");
                    setIsFabOpen(false);
                  }}
                  className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center"
                  title="Add question to active section"
                >
                  <Plus size={24} className="text-gray-700" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
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
                  <h3 className="text-lg font-semibold text-gray-900">
                    Set Event Dates
                  </h3>
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

          {/* Certificate Customizer Modal */}
          {showCertificateCustomizer && currentFormId && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="max-h-[90vh] overflow-y-auto">
                <CertificateCustomizer
                  formId={currentFormId}
                  onSave={(customizations) => {
                    console.log(
                      "Certificate customizations saved:",
                      customizations
                    );
                    // Optionally update local state or show success message
                  }}
                  onClose={() => setShowCertificateCustomizer(false)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  // Only wrap with PSASLayout if accessed via direct routing (no props)
  // Preserve layout context across navigation to prevent layout breaking
  if (isChildComponent || shouldPreserveLayout) {
    return content;
  }
  return <PSASLayout>{content}</PSASLayout>;
};

export default FormCreationInterface;

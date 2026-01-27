// Comprehensive localStorage management for form system
// CRITICAL: CSV data is NEVER written to localStorage - only form metadata
export class FormSessionManager {
  // Initialize local storage for form creation
  static initializeFormSession(formId = null) {
    let IS_NEW_SESSION = false;
    if (!formId) {
      formId = `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      IS_NEW_SESSION = true;
    }

    // Store primary form ID
    localStorage.setItem('currentFormId', formId);

    // Only create a new session if it doesn't exist or is completely new
    const existingSession = this.getFormSession(formId);
    if (!existingSession) {
      localStorage.setItem(`formSession_${formId}`, JSON.stringify({
        formId,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        data: {
          // Form metadata only - no CSV data
          formTitle: "Untitled Form",
          formDescription: "Form Description",
          questions: [],
          sections: [],
          uploadedFiles: [],
          uploadedLinks: [],
          eventStartDate: "",
          eventEndDate: "",
          isCertificateLinked: false
        }
      }));
    }

    return formId;
  }

  // UNIFIED ID MANAGEMENT SYSTEM
  // Ensures single persistent form identifier across all operations

  // Ensure we have a single persistent form ID - reuse existing or create stable one
  static ensurePersistentFormId(preferredId = null) {
    // If a preferred ID is provided, use it and update session (CRITICAL for navigation)
    if (preferredId) {
      localStorage.setItem('currentFormId', preferredId);
      this.initializeFormSession(preferredId);
      return preferredId;
    }

    const existingId = this.getCurrentFormId();

    // If we have an existing ID and no preferred ID was provided, return existing
    if (existingId) {
      return existingId;
    }

    // Generate a new stable ID
    const newId = `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('currentFormId', newId);
    this.initializeFormSession(newId);
    return newId;
  }

  // Start a completely new form creation session with clean slate
  static startNewFormSession() {
    // Clear all existing form data comprehensively
    this.clearAllFormData();

    // Clear any preserved form ID
    this.clearPreservedFormId();

    // Clear any temporary data
    const tempKeys = [
      'tempFormData',
      'uploadedFormId',
      'editFormId',
      'studentSelection',
      'csvData',
      'formCreationState'
    ];
    tempKeys.forEach(key => localStorage.removeItem(key));

    // Remove all form session data
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (key.startsWith('formSession_') ||
        key.startsWith('formRecipients_') ||
        key.startsWith('certificateLinked_')) {
        localStorage.removeItem(key);
      }
    });

    // Generate new form ID for the new session
    const newFormId = `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('currentFormId', newFormId);
    this.initializeFormSession(newFormId);

    console.log('🆕 FormSessionManager - Started new form session with clean slate');
    return newFormId;
  }

  // Preserve current form ID before navigation (for CSV upload, certificate linking, etc.)
  static preserveFormId() {
    const currentId = this.getCurrentFormId();
    if (currentId) {
      localStorage.setItem('preservedFormId', currentId);
      localStorage.setItem('preservedFormIdTimestamp', new Date().toISOString());
      return currentId;
    }
    return null;
  }

  // Restore previously preserved form ID
  static restoreFormId() {
    const preservedId = localStorage.getItem('preservedFormId');
    const preservedTimestamp = localStorage.getItem('preservedFormIdTimestamp');

    if (preservedId) {
      // Check if preserved ID is still valid (not too old - 1 hour limit)
      if (preservedTimestamp) {
        const preservedDate = new Date(preservedTimestamp);
        const now = new Date();
        const hoursDiff = (now - preservedDate) / (1000 * 60 * 60);

        if (hoursDiff > 1) {
          // Too old, clear it
          this.clearPreservedFormId();
          return null;
        }
      }

      // Restore the preserved ID as current
      localStorage.setItem('currentFormId', preservedId);
      return preservedId;
    }

    return null;
  }

  // Clear preserved form ID
  static clearPreservedFormId() {
    localStorage.removeItem('preservedFormId');
    localStorage.removeItem('preservedFormIdTimestamp');
  }

  // Get current form ID with proper fallback
  static getCurrentFormId() {
    return localStorage.getItem('currentFormId');
  }

  // Update form local storage activity
  static updateFormActivity(formId = null) {
    const currentFormId = formId || this.getCurrentFormId();
    if (!currentFormId) return false;

    const localData = this.getFormSession(currentFormId);
    if (localData) {
      localData.lastActivity = new Date().toISOString();
      this.saveFormSession(currentFormId, localData);
      return true;
    }
    return false;
  }

  // Save complete form data with quota management
  static saveFormData(formData) {
    const formId = this.getCurrentFormId();
    if (!formId) return false;

    const localData = this.getFormSession(formId) || { formId, createdAt: new Date().toISOString() };
    localData.data = { ...localData.data, ...formData };
    localData.lastActivity = new Date().toISOString();

    try {
      this.saveFormSession(formId, localData);

      // Also update legacy storage for compatibility (only for essential data)
      const essentialData = {
        formTitle: formData.formTitle,
        formDescription: formData.formDescription,
        questions: formData.questions,
        sections: formData.sections,
        eventStartDate: formData.eventStartDate,
        eventEndDate: formData.eventEndDate,
        currentFormId: formData.currentFormId,
        isCertificateLinked: formData.isCertificateLinked
      };
      localStorage.setItem('formCreationState', JSON.stringify(essentialData));

    } catch (error) {
      if (error.name === 'QuotaExceededError' || error.code === 22) {
        console.warn('⚠️ FormSessionManager - localStorage quota exceeded, cleaning up old data');
        this.cleanupOldFormSessions();
        // Retry save after cleanup
        try {
          this.saveFormSession(formId, localData);
        } catch (retryError) {
          console.error('🔧 FormSessionManager - Failed to save after cleanup:', retryError);
          return false;
        }
      } else {
        throw error;
      }
    }

    return true;
  }

  // Load complete form data
  static loadFormData() {
    const formId = this.getCurrentFormId();
    if (!formId) return null;

    const localData = this.getFormSession(formId);
    if (localData && localData.data) {
      return localData.data;
    }

    // Fallback to legacy storage
    const legacyData = localStorage.getItem('formCreationState');
    if (legacyData) {
      try {
        const parsed = JSON.parse(legacyData);
        return parsed;
      } catch (error) {
        console.error("🔧 FormSessionManager - Error parsing legacy data:", error);
      }
    }

    return null;
  }

  // Save transient CSV data scoped to current form draft.
  // NOTE: To meet security and storage constraints, we store CSV-derived data only
  // as eligible student records (no raw file blobs or unrelated payloads).
  static saveTransientCSVData(csvData) {
    const formId = this.getCurrentFormId();
    if (!formId || !csvData) return false;

    const students = Array.isArray(csvData.students) ? csvData.students : [];
    const lightCsv = {
      filename: csvData.filename || null,
      uploadedAt: csvData.uploadedAt || new Date().toISOString(),
      // Keep only normalized eligible student fields (no large raw CSV text)
      students: students.map((s) => ({
        name: (s.name || s["full name"] || s["student name"] || "").trim(),
        email: (s.email || "").trim(),
        department: s.department || s["department"] || "",
        program: s.program || s["program"] || "",
        year: s.year || s["year"] || "",
      })),
    };

    const session = this.getFormSession(formId) || {
      formId,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      data: {},
    };

    session.data.transientCSVData = lightCsv;
    session.lastActivity = new Date().toISOString();
    this.saveFormSession(formId, session);
    return true;
  }

  // Load transient CSV data from memory session
  static loadTransientCSVData() {
    const formId = this.getCurrentFormId();
    if (!formId) return null;

    const session = this.getFormSession(formId);
    if (session && session.data && session.data.transientCSVData) {
      return session.data.transientCSVData;
    }

    return null;
  }

  // Clear transient CSV data
  static clearTransientCSVData() {
    const formId = this.getCurrentFormId();
    if (!formId) return false;

    const session = this.getFormSession(formId);
    if (session && session.data) {
      delete session.data.transientCSVData;
      session.lastActivity = new Date().toISOString();
      this.saveFormSession(formId, session);
    }
    return true;
  }

  // Legacy CSV methods (deprecated - now no-ops for localStorage)
  static saveCSVData() {
    return true;
  }

  static loadCSVData() {
    return null;
  }

  // Save student assignments
  static saveStudentAssignments(selectedStudents) {
    const formId = this.getCurrentFormId();
    if (!formId) return false;

    const localData = this.getFormSession(formId) || { formId, createdAt: new Date().toISOString() };
    localData.data.selectedStudents = selectedStudents;
    localData.data.studentsAssignedAt = new Date().toISOString();
    localData.lastActivity = new Date().toISOString();

    this.saveFormSession(formId, localData);

    // Also store in legacy location for compatibility
    localStorage.setItem('selectedStudents', JSON.stringify(selectedStudents));
    localStorage.setItem(`formRecipients_${formId}`, JSON.stringify({
      studentIds: selectedStudents.map(s => s.id),
      students: selectedStudents,
      timestamp: new Date().toISOString()
    }));

    return true;
  }

  // Load student assignments
  static loadStudentAssignments() {
    const formId = this.getCurrentFormId();
    if (!formId) return [];

    const localData = this.getFormSession(formId);
    if (localData && localData.data && localData.data.selectedStudents) {
      return localData.data.selectedStudents;
    }

    // Fallback to legacy storage
    const legacyStudents = localStorage.getItem('selectedStudents');
    if (legacyStudents) {
      try {
        const parsed = JSON.parse(legacyStudents);
        return parsed;
      } catch (error) {
        console.error("🔧 FormSessionManager - Error parsing legacy students:", error);
      }
    }

    return [];
  }

  // Get form local storage data
  static getFormSession(formId) {
    const localData = localStorage.getItem(`formSession_${formId}`);
    if (localData) {
      try {
        return JSON.parse(localData);
      } catch (error) {
        console.error("🔧 FormSessionManager - Error parsing local storage data:", error);
        return null;
      }
    }
    return null;
  }

  // Cleanup old form sessions when quota is exceeded
  static cleanupOldFormSessions() {
    const formSessions = this.getAllSessionForms();

    if (formSessions.length <= 2) {
      // Don't cleanup if we only have current and one other session
      return false;
    }

    // Sort by last activity (oldest first)
    const sortedSessions = formSessions
      .filter(session => session.formId !== this.getCurrentFormId()) // Don't delete current form
      .sort((a, b) => new Date(a.lastActivity) - new Date(b.lastActivity));

    // Remove oldest 25% of sessions to free up space
    const sessionsToRemove = Math.ceil(sortedSessions.length * 0.25);
    const sessionsDeleted = sortedSessions.slice(0, sessionsToRemove);

    sessionsDeleted.forEach(session => {
      localStorage.removeItem(`formSession_${session.formId}`);
      // Also clean up related data
      localStorage.removeItem(`formRecipients_${session.formId}`);
    });

    console.log(`🧹 FormSessionManager - Cleaned up ${sessionsDeleted.length} old form sessions`);
    return true;
  }

  // Get current localStorage usage estimate
  static getStorageUsage() {
    let totalSize = 0;
    for (let key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }
    return {
      usedBytes: totalSize,
      usedKB: Math.round(totalSize / 1024 * 100) / 100,
      usedMB: Math.round(totalSize / (1024 * 1024) * 100) / 100
    };
  }

  // Save form local storage data
  static saveFormSession(formId, localData) {
    try {
      localStorage.setItem(`formSession_${formId}`, JSON.stringify(localData));
    } catch (error) {
      if (error.name === 'QuotaExceededError' || error.code === 22) {
        console.error('🔧 FormSessionManager - Critical quota exceeded, attempting emergency cleanup');

        // Aggressive cleanup - remove all but current form
        const allKeys = Object.keys(localStorage);
        const formSessionKeys = allKeys.filter(key => key.startsWith('formSession_'));
        const currentFormId = this.getCurrentFormId();

        // Remove all form sessions except current
        formSessionKeys.forEach(key => {
          if (!key.includes(currentFormId)) {
            localStorage.removeItem(key);
          }
        });

        // Try again
        localStorage.setItem(`formSession_${formId}`, JSON.stringify(localData));
      } else {
        throw error;
      }
    }
  }

  // Comprehensive cleanup of all form-related data (called only after successful publish
  // or when intentionally resetting all drafts).
  static clearAllFormData() {
    const formId = this.getCurrentFormId();

    if (formId) {
      localStorage.removeItem(`formSession_${formId}`);
      localStorage.removeItem(`formRecipients_${formId}`);
      localStorage.removeItem(`certificateLinked_${formId}`);
    }

    // Legacy / shared keys
    localStorage.removeItem('formCreationState');
    localStorage.removeItem('csvData');
    localStorage.removeItem('selectedStudents');
    localStorage.removeItem('currentFormId');
    localStorage.removeItem('editFormId');
    localStorage.removeItem('tempFormData');
    localStorage.removeItem('uploadedFormId');
    localStorage.removeItem('studentSelection');
    localStorage.removeItem('preservedFormId');
    localStorage.removeItem('preservedFormIdTimestamp');
  }

  // Legacy method name for backward compatibility
  static clearFormData() {
    this.clearAllFormData();
  }

  // Get all local forms (for debugging)
  static getAllSessionForms() {
    const forms = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('formSession_')) {
        const formId = key.replace('formSession_', '');
        const localData = this.getFormSession(formId);
        if (localData) {
          forms.push({
            formId,
            createdAt: localData.createdAt,
            lastActivity: localData.lastActivity,
            hasData: !!(localData.data && Object.keys(localData.data).length > 0)
          });
        }
      }
    }
    return forms;
  }

  // Export form data (for backup/migration)
  static exportFormData() {
    const currentFormId = this.getCurrentFormId();
    if (!currentFormId) return null;

    const localData = this.getFormSession(currentFormId);
    const legacyData = {
      formCreationState: localStorage.getItem('formCreationState'),
      // csvData export intentionally omitted to avoid persisting CSV payloads
      selectedStudents: localStorage.getItem('selectedStudents')
    };

    return {
      formId: currentFormId,
      localData,
      legacyData,
      exportedAt: new Date().toISOString()
    };
  }

  // Import form data (for restore/migration)
  static importFormData(exportedData) {
    if (!exportedData || !exportedData.formId) return false;

    // Set current form ID
    localStorage.setItem('currentFormId', exportedData.formId);

    // Restore local data
    if (exportedData.localData) {
      this.saveFormSession(exportedData.formId, exportedData.localData);
    }

    // Restore legacy data (excluding any CSV content)
    if (exportedData.legacyData) {
      if (exportedData.legacyData.formCreationState) {
        localStorage.setItem('formCreationState', exportedData.legacyData.formCreationState);
      }
      // CSV data is NOT restored - only non-CSV form metadata
      if (exportedData.legacyData.selectedStudents) {
        localStorage.setItem('selectedStudents', exportedData.legacyData.selectedStudents);
      }
    }

    return true;
  }
}
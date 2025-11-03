// Comprehensive localStorage management for form system
export class FormSessionManager {
  // Initialize local storage for form creation
  static initializeFormSession(formId = null) {
    let isNewSession = false;
    if (!formId) {
      formId = `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      isNewSession = true;
    }

    // Check if a local storage for this formId already exists
    const existingSession = localStorage.getItem(`formSession_${formId}`);

    // Store primary form ID
    localStorage.setItem('currentFormId', formId);

    // Only create a new local data object if one doesn't exist or if it's a brand new formId
    if (isNewSession || !existingSession) {
      localStorage.setItem(`formSession_${formId}`, JSON.stringify({
        formId,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        data: {}
      }));
    }
    
    return formId;
  }

  // Get current form ID
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

  // Save complete form data
  static saveFormData(formData) {
    const formId = this.getCurrentFormId();
    if (!formId) return false;

    const localData = this.getFormSession(formId) || { formId, createdAt: new Date().toISOString() };
    localData.data = { ...localData.data, ...formData };
    localData.lastActivity = new Date().toISOString();
    
    this.saveFormSession(formId, localData);
    
    // Also update legacy storage for compatibility
    localStorage.setItem('formCreationState', JSON.stringify(formData));
    
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

  // Save CSV data specifically
  static saveCSVData(csvData) {
    const formId = this.getCurrentFormId();
    if (!formId) return false;

    const localData = this.getFormSession(formId) || { formId, createdAt: new Date().toISOString() };
    localData.data.csvData = csvData;
    localData.data.csvImportedAt = new Date().toISOString();
    localData.lastActivity = new Date().toISOString();
    
    this.saveFormSession(formId, localData);
    
    // Also store in legacy location for StudentList compatibility
    localStorage.setItem('csvData', JSON.stringify(csvData));
    
    return true;
  }

  // Load CSV data
  static loadCSVData() {
    const formId = this.getCurrentFormId();
    if (!formId) return null;

    const localData = this.getFormSession(formId);
    if (localData && localData.data && localData.data.csvData) {
      return localData.data.csvData;
    }

    // Fallback to legacy storage
    const legacyCSV = localStorage.getItem('csvData');
    if (legacyCSV) {
      try {
        const parsed = JSON.parse(legacyCSV);
        return parsed;
      } catch (error) {
        console.error("🔧 FormSessionManager - Error parsing legacy CSV:", error);
      }
    }

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

  // Save form local storage data
  static saveFormSession(formId, localData) {
    localStorage.setItem(`formSession_${formId}`, JSON.stringify(localData));
  }

  // Clear all form data (use with caution)
  static clearFormData() {
    const formId = this.getCurrentFormId();
    if (formId) {
      localStorage.removeItem(`formSession_${formId}`);
    }
    localStorage.removeItem('formCreationState');
    localStorage.removeItem('csvData');
    localStorage.removeItem('selectedStudents');
    localStorage.removeItem('currentFormId');
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
      csvData: localStorage.getItem('csvData'),
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
    
    // Restore legacy data
    if (exportedData.legacyData) {
      if (exportedData.legacyData.formCreationState) {
        localStorage.setItem('formCreationState', exportedData.legacyData.formCreationState);
      }
      if (exportedData.legacyData.csvData) {
        localStorage.setItem('csvData', exportedData.legacyData.csvData);
      }
      if (exportedData.legacyData.selectedStudents) {
        localStorage.setItem('selectedStudents', exportedData.legacyData.selectedStudents);
      }
    }
    
    return true;
  }
}
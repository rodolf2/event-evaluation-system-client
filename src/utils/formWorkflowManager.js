// Workflow manager removed during reversion
export const FormWorkflowManager = {
  // Minimal implementation to prevent import errors
  static: {
    markStepCompleted: () => {},
    saveStepData: () => {},
    getStepData: () => null,
    setCurrentStep: () => {},
    getCurrentWorkflowId: () => null,
  }
};
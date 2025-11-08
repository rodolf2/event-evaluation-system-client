import { useMemo } from "react";
import { FormSessionManager } from "../utils/formSessionManager";

export const useFormValidation = (questions, startDate, endDate, isCertificateLinked, currentFormId) => {
  const validationErrors = useMemo(() => {
    const errors = [];

    if (!questions || questions.length === 0) {
      errors.push("At least one question is required");
    }

    if (!startDate || !endDate) {
      errors.push("Event start and end dates are required");
    } else if (new Date(startDate) >= new Date(endDate)) {
      errors.push("End date must be after start date");
    }

    const hasStudents = FormSessionManager.loadStudentAssignments()?.length > 0;
    if (!isCertificateLinked && !hasStudents) {
      errors.push("Either a certificate must be linked or students must be added from CSV");
    }

    return errors;
  }, [questions, startDate, endDate, isCertificateLinked, currentFormId]);

  const canPublish = useMemo(() => {
    return validationErrors.length === 0;
  }, [validationErrors]);

  const getValidationMessage = () => {
    if (!canPublish) {
      return validationErrors.join(". ") + ".";
    }
    return "";
  };

  return {
    validationErrors,
    canPublish,
    getValidationMessage,
  };
};
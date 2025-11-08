import { useState, useCallback } from "react";
import { FormSessionManager } from "../utils/formSessionManager";

export const useFormState = (initialFormId) => {
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [sections, setSections] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentFormId, setCurrentFormId] = useState(null);
  const [editFormId, setEditFormId] = useState(initialFormId || null);
  const [isCertificateLinked, setIsCertificateLinked] = useState(false);

  const updateFormState = useCallback(async (updates) => {
    const newState = {
      formTitle: updates.formTitle ?? formTitle,
      formDescription: updates.formDescription ?? formDescription,
      questions: updates.questions ?? questions,
      sections: updates.sections ?? sections,
      startDate: updates.startDate ?? startDate,
      endDate: updates.endDate ?? endDate,
      currentFormId: updates.currentFormId ?? currentFormId,
      editFormId: updates.editFormId ?? editFormId,
      isCertificateLinked: updates.isCertificateLinked ?? isCertificateLinked,
    };

    // Save to session manager
    await FormSessionManager.saveFormData(newState);

    // Update local state
    setFormTitle(newState.formTitle);
    setFormDescription(newState.formDescription);
    setQuestions(newState.questions);
    setSections(newState.sections);
    setStartDate(newState.startDate);
    setEndDate(newState.endDate);
    setCurrentFormId(newState.currentFormId);
    setEditFormId(newState.editFormId);
    setIsCertificateLinked(newState.isCertificateLinked);
  }, [formTitle, formDescription, questions, sections, startDate, endDate, currentFormId, editFormId, isCertificateLinked]);

  const persistFormState = useCallback(async () => {
    const stateToPersist = {
      formTitle,
      formDescription,
      questions,
      sections,
      startDate,
      endDate,
      currentFormId,
      editFormId,
      isCertificateLinked,
    };
    await FormSessionManager.saveFormData(stateToPersist);
  }, [formTitle, formDescription, questions, sections, startDate, endDate, currentFormId, editFormId, isCertificateLinked]);

  const restoreFormState = useCallback(async (formId) => {
    const restoredState = await FormSessionManager.loadFormData(formId);
    if (restoredState) {
      setFormTitle(restoredState.formTitle || "");
      setFormDescription(restoredState.formDescription || "");
      setQuestions(restoredState.questions || []);
      setSections(restoredState.sections || []);
      setStartDate(restoredState.startDate || "");
      setEndDate(restoredState.endDate || "");
      setCurrentFormId(restoredState.currentFormId || null);
      setEditFormId(restoredState.editFormId || null);
      setIsCertificateLinked(restoredState.isCertificateLinked || false);
    }
  }, []);

  return {
    formTitle,
    setFormTitle,
    formDescription,
    setFormDescription,
    questions,
    setQuestions,
    sections,
    setSections,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    currentFormId,
    setCurrentFormId,
    editFormId,
    setEditFormId,
    isCertificateLinked,
    setIsCertificateLinked,
    updateFormState,
    persistFormState,
    restoreFormState,
  };
};
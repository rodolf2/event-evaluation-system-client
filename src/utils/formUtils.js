export const generateQuestionId = () => `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const generateSectionId = () => `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const createDefaultQuestion = (type = "Multiple Choices") => ({
  id: generateQuestionId(),
  type,
  title: "",
  options: type === "Multiple Choices" ? ["Option 1", "Option 2"] : [],
  required: false,
  ratingScale: 5,
  emojiStyle: "Default",
  likertStart: 1,
  likertEnd: 5,
  likertStartLabel: "Poor",
  likertEndLabel: "Excellent",
});

export const createDefaultSection = () => ({
  id: generateSectionId(),
  title: "",
  questions: [createDefaultQuestion()],
});

export const flattenQuestions = (mainQuestions, sections) => {
  const allQuestions = [...mainQuestions];

  sections.forEach(section => {
    if (section.questions && section.questions.length > 0) {
      allQuestions.push(...section.questions);
    }
  });

  return allQuestions;
};

export const validateQuestion = (question) => {
  const errors = [];

  if (!question.title || question.title.trim() === "") {
    errors.push("Question title is required");
  }

  if (question.type === "Multiple Choices" && (!question.options || question.options.length < 2)) {
    errors.push("Multiple choice questions must have at least 2 options");
  }

  return errors;
};

export const validateSection = (section) => {
  const errors = [];

  if (!section.title || section.title.trim() === "") {
    errors.push("Section title is required");
  }

  if (!section.questions || section.questions.length === 0) {
    errors.push("Section must have at least one question");
  }

  section.questions?.forEach((question, index) => {
    const questionErrors = validateQuestion(question);
    if (questionErrors.length > 0) {
      errors.push(`Question ${index + 1}: ${questionErrors.join(", ")}`);
    }
  });

  return errors;
};
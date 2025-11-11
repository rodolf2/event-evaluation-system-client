// Form validation utilities
export const validateRecipientsData = (students) => {
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
      error: "CSV file contains too many records (maximum 10,000 students allowed).",
    };
  }

  return { isValid: true, error: null };
};

export const validateFormBeforePublish = (formData, csvData, students, certificateStatus) => {
  const validationErrors = [];
  
  // Step 1: Form content validation
  const allQuestions = [
    ...formData.questions,
    ...formData.sections.flatMap((s) => s.questions || []),
  ];
  
  if (allQuestions.length === 0) {
    validationErrors.push("Please add at least one question to your form");
  }

  // Step 2: Event dates validation
  if (!formData.eventStartDate || !formData.eventEndDate) {
    validationErrors.push("Please set both event start date and end date");
  } else {
    const startDate = new Date(formData.eventStartDate);
    const endDate = new Date(formData.eventEndDate);
    if (startDate >= endDate) {
      validationErrors.push("Event end date must be after start date");
    }
  }

  // Step 3: Recipient validation
  const hasCSVRecipients = csvData && csvData.students && csvData.students.length > 0;
  const hasStudents = Array.isArray(students) && students.length > 0;
  
  if (!hasCSVRecipients && !hasStudents) {
    validationErrors.push("Please upload a valid CSV recipient list or assign students to this form");
  }

  // Step 4: Certificate validation
  if (!certificateStatus.isValid) {
    validationErrors.push(`Certificate validation error: ${certificateStatus.message}`);
  }

  return {
    isValid: validationErrors.length === 0,
    errors: validationErrors,
  };
};
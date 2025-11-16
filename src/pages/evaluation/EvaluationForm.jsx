import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ParticipantLayout from "../../components/participants/ParticipantLayout";
import { useAuth } from "../../contexts/useAuth";
import DynamicRatingInput from "../../components/shared/DynamicRatingInput";

const EvaluationForm = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Fetch form data
  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/forms/${formId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch form");
        }
        const data = await response.json();
        setForm(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (formId) {
      fetchForm();
    }
  }, [formId, token]);

  // Load saved responses from localStorage
  useEffect(() => {
    if (formId) {
      const savedResponses = localStorage.getItem(`form_${formId}_responses`);
      if (savedResponses) {
        setResponses(JSON.parse(savedResponses));
      }
    }
  }, [formId]);

  // Save responses to localStorage
  useEffect(() => {
    if (formId && Object.keys(responses).length > 0) {
      localStorage.setItem(
        `form_${formId}_responses`,
        JSON.stringify(responses)
      );
    }
  }, [responses, formId]);

  // Handle response change
  const handleResponseChange = (questionIndex, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionIndex]: value,
    }));
  };

  // Handle form validation
  const validateForm = () => {
    if (!form || !form.questions || !Array.isArray(form.questions))
      return false;
    const requiredQuestions = form.questions.filter((q) => q && q.required);
    const missingResponses = requiredQuestions.filter(
      (q, index) => !responses[index]
    );
    return missingResponses.length === 0;
  };

  // Handle clear form
  const handleClearForm = () => {
    if (showClearConfirm && formId) {
      setResponses({});
      localStorage.removeItem(`form_${formId}_responses`);
      setShowClearConfirm(false);
    } else if (!showClearConfirm) {
      setShowClearConfirm(true);
    }
  };

  // Handle back button
  const handleBack = () => {
    navigate(`/evaluations/start/${formId}`);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      alert("Please answer all required questions before submitting.");
      return;
    }

    if (!formId || !token) {
      alert("Form ID or authentication token is missing.");
      return;
    }

    try {
      const response = await fetch("/api/forms/submit", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formId,
          responses,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit evaluation");
      }

      // Clear saved responses
      if (formId) {
        localStorage.removeItem(`form_${formId}_responses`);
      }

      // Navigate to success page or evaluations list
      alert("Evaluation submitted successfully!");
      navigate("/participant/evaluations");
    } catch (err) {
      alert("Error submitting evaluation: " + err.message);
    }
  };

  // Safe destructuring with comprehensive null checks
  const {
    title = "Loading...",
    description = "Loading description...",
    questions = [],
    sections = [],
  } = form || {};

  // Create sections array: main section + additional sections
  const allSections = [
    {
      id: "main",
      title: "Section 1",
      description: "",
      questions: questions || [],
    },
    ...(sections || []),
  ];

  const currentSection = allSections[currentSectionIndex];
  const totalSections = allSections.length;

  const handleNext = () => {
    if (currentSectionIndex < totalSections - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  // getSectionTitle no longer needed - inline usage

  const getSectionDescription = () => {
    return currentSection?.description || "";
  };

  const getQuestionTypeInfo = (question) => {
    if (question.type === "scale") {
      if (question.lowLabel || question.highLabel) {
        return { type: "Likert Scale" };
      } else {
        // Use exact icon from backend (star/emoji/heart) - no fallback to "star"
        return { type: "Numeric Ratings", icon: question.icon };
      }
    }
    return { type: question.type };
  };

  // Render different question types
  const renderQuestion = (question, questionIndex) => {
    if (!question || !question.title) return null;
    // Calculate global question index for responses
    let globalIndex = questionIndex;
    for (let i = 0; i < currentSectionIndex; i++) {
      globalIndex += allSections[i].questions.length;
    }
    const isRequired = question.required || false;
    const questionTypeInfo = getQuestionTypeInfo(question);

    switch (question.type) {
      case "multiple_choice":
        if (!question.options || !Array.isArray(question.options)) return null;
        return (
          <div key={questionIndex} className="mb-8">
            <label className="block text-lg text-gray-800 mb-4">
              {question.title}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex flex-col space-y-3">
              {question.options.map((option, i) => (
                <label
                  key={i}
                  className="flex items-center p-3 rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={`q${globalIndex}`}
                    value={option}
                    className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                    checked={responses[globalIndex] === option}
                    onChange={(e) =>
                      handleResponseChange(globalIndex, e.target.value)
                    }
                  />
                  <span className="ml-3 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case "short_answer":
        return (
          <div key={questionIndex} className="mb-8">
            <label className="block text-lg text-gray-800 mb-4">
              {question.title}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={responses[globalIndex] || ""}
              onChange={(e) =>
                handleResponseChange(globalIndex, e.target.value)
              }
              placeholder="Enter your response here..."
            />
          </div>
        );

      case "paragraph":
        return (
          <div key={questionIndex} className="mb-8">
            <label className="block text-lg text-gray-800 mb-4">
              {question.title}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              rows="4"
              value={responses[globalIndex] || ""}
              onChange={(e) =>
                handleResponseChange(globalIndex, e.target.value)
              }
              placeholder="Enter your response here..."
            />
          </div>
        );

      case "scale": {
        return (
          <div key={questionIndex} className="mb-8">
            <label className="block text-lg text-gray-800 mb-4">
              {question.title}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <DynamicRatingInput
              type={questionTypeInfo.type}
              scale={question.high || 5}
              icon={questionTypeInfo.icon}
              startLabel={question.lowLabel}
              endLabel={question.highLabel}
              value={responses[globalIndex]}
              onChange={(value) => handleResponseChange(globalIndex, value)}
            />
          </div>
        );
      }

      case "date":
        return (
          <div key={questionIndex} className="mb-8">
            <label className="block text-lg text-gray-800 mb-4">
              {question.title}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="date"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={responses[globalIndex] || ""}
              onChange={(e) =>
                handleResponseChange(globalIndex, e.target.value)
              }
            />
          </div>
        );

      case "time":
        return (
          <div key={questionIndex} className="mb-8">
            <label className="block text-lg text-gray-800 mb-4">
              {question.title}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="time"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={responses[globalIndex] || ""}
              onChange={(e) =>
                handleResponseChange(globalIndex, e.target.value)
              }
            />
          </div>
        );

      case "file_upload":
        return (
          <div key={questionIndex} className="mb-8">
            <label className="block text-lg text-gray-800 mb-4">
              {question.title}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="file"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) =>
                handleResponseChange(globalIndex, e.target.files[0])
              }
            />
          </div>
        );

      default:
        // Default fallback
        return (
          <div key={questionIndex} className="mb-8">
            <label className="block text-lg text-gray-800 mb-4">
              {question.title}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              rows="4"
              value={responses[globalIndex] || ""}
              onChange={(e) =>
                handleResponseChange(globalIndex, e.target.value)
              }
              placeholder="Enter your response here..."
            />
          </div>
        );
    }
  };

  // Show loading state
  if (loading) {
    return (
      <ParticipantLayout>
        <div className="w-full max-w-4xl mx-auto p-8">
          <div className="bg-white p-8 rounded-lg shadow-md mb-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading evaluation form...</p>
          </div>
        </div>
      </ParticipantLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <ParticipantLayout>
        <div className="w-full max-w-4xl mx-auto p-8">
          <div className="bg-white p-8 rounded-lg shadow-md mb-6 text-center">
            <div className="text-red-500 mb-4">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Error Loading Form
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </ParticipantLayout>
    );
  }

  // Don't render form if no form data
  if (!form) {
    return (
      <ParticipantLayout>
        <div className="w-full max-w-4xl mx-auto p-8">
          <div className="bg-white p-8 rounded-lg shadow-md mb-6 text-center">
            <p className="text-gray-600">No form data available.</p>
          </div>
        </div>
      </ParticipantLayout>
    );
  }

  return (
    <ParticipantLayout>
      <div className="w-full max-w-4xl mx-auto p-8">
        {/* Top White Container - Only show title/description on first section */}
        {currentSectionIndex === 0 && (
          <div className="bg-white p-8 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-800">
                  {title || "Loading..."}
                </h1>
                <p className="text-gray-600 mt-2 mb-4">
                  {description || "Loading description..."}
                </p>
              </div>
            </div>
            <hr />
            <div className="flex justify-between items-center mt-4">
              <p className="text-red-500 text-sm">
                * Indicates required questions
              </p>
              {/* Clear Form Link - Google Forms style */}
              <button
                onClick={handleClearForm}
                className="text-blue-600 hover:text-blue-800 text-sm underline focus:outline-none"
              >
                Clear form
              </button>
            </div>
          </div>
        )}

        {/* Section Container - Each section has its own white container */}
        <div className="space-y-6">
          {/* Section Header */}
          <div className="bg-[#1F3463] p-8 rounded-lg shadow-md text-white">
            <h2 className="text-2xl font-bold mb-2">
              Section {currentSectionIndex + 1}:{" "}
              {currentSection?.title || "Untitled Section"}
            </h2>
            {getSectionDescription() && (
              <p className="text-gray-600">{getSectionDescription()}</p>
            )}
          </div>

          {/* Individual Question Containers */}
          {currentSection?.questions?.map((question, index) => (
            <div
              key={index}
              className="bg-white p-6 sm:p-8 rounded-lg shadow-sm border"
            >
              {renderQuestion(question, index)}
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8">
          <div className="flex space-x-3">
            {/* Previous Section Button */}
            {currentSectionIndex > 0 && (
              <button
                onClick={handlePrevious}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Previous
              </button>
            )}
            {/* Back to Start Button - only on first section */}
            {currentSectionIndex === 0 && (
              <button
                onClick={handleBack}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Back
              </button>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {currentSectionIndex < totalSections - 1 ? (
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 shadow-md"
              >
                Next Section
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md"
              >
                Submit
              </button>
            )}
          </div>
        </div>

        {/* Clear Confirmation Dialog */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Clear Form</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to clear all responses? This action cannot
                be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearForm}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ParticipantLayout>
  );
};

export default EvaluationForm;

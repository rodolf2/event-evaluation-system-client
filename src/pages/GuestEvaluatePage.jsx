import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import GuestEvaluatorLayout from "../components/guest/GuestEvaluatorLayout";
import DynamicRatingInput from "../components/shared/DynamicRatingInput";

function GuestEvaluatePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(null);
  const [evaluatorInfo, setEvaluatorInfo] = useState(null);
  const [responses, setResponses] = useState({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  // Fetch form data using token
  useEffect(() => {
    const fetchFormData = async () => {
      if (!token) {
        setError("No access token provided");
        setLoading(false);
        return;
      }

      try {
        // Validate token first
        const validateResponse = await fetch(
          "/api/guest/evaluator/validate-token",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          },
        );

        const validateData = await validateResponse.json();

        if (!validateResponse.ok) {
          if (validateData.completed) {
            setAlreadyCompleted(true);
          }
          setError(validateData.message || "Invalid token");
          setLoading(false);
          return;
        }

        // Fetch form data
        const formResponse = await fetch(`/api/guest/evaluator/form/${token}`);
        const formData = await formResponse.json();

        if (!formResponse.ok) {
          setError(formData.message || "Failed to load form");
          setLoading(false);
          return;
        }

        setForm(formData.data.form);
        setEvaluatorInfo(formData.data.evaluatorInfo);
      } catch (err) {
        console.error("Error fetching form:", err);
        setError("Failed to load evaluation form");
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [token]);

  // Handle response change
  const handleResponseChange = (questionIndex, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionIndex]: value,
    }));
  };

  // Process form sections and questions (same logic as EvaluationForm)
  const processFormSections = () => {
    if (!form) return [];

    const { title = "", questions = [], sections = [] } = form;

    const sectionsData = [
      { id: "main", title: title, description: "", sectionNumber: 0 },
    ];

    let sectionCounter = 1;
    (sections || []).forEach((s) => {
      sectionsData.push({
        ...s,
        id: String(s.id || `section_${sectionCounter}`).trim(),
        sectionNumber: sectionCounter,
        title: s.title || `Section ${sectionCounter + 1}`,
      });
      sectionCounter++;
    });

    sectionsData.sort(
      (a, b) => (a.sectionNumber || 0) - (b.sectionNumber || 0),
    );

    const groupedQuestions = {};
    questions.forEach((q) => {
      if (!q.title || !q.sectionId) return;
      const secId = String(q.sectionId).trim();
      if (!groupedQuestions[secId]) {
        groupedQuestions[secId] = [];
      }
      groupedQuestions[secId].push(q);
    });

    return sectionsData.map((section) => ({
      ...section,
      questions: groupedQuestions[String(section.id || "").trim()] || [],
    }));
  };

  const allSections = processFormSections();
  const currentSection = allSections[currentSectionIndex];
  const totalSections = allSections.length;

  // Validate form
  const validateForm = () => {
    if (!allSections.length) return false;

    let valid = true;
    allSections.forEach((section, sectionIndex) => {
      (section.questions || []).forEach((question, questionIndex) => {
        if (question && question.required) {
          let globalIndex = questionIndex;
          for (let i = 0; i < sectionIndex; i++) {
            globalIndex += allSections[i].questions.length;
          }
          if (!responses[globalIndex]) {
            valid = false;
          }
        }
      });
    });

    return valid;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateForm()) {
      alert("Please answer all required questions before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const formattedResponses = [];
      allSections.forEach((section, sectionIndex) => {
        (section.questions || []).forEach((question, questionIndex) => {
          let globalIndex = questionIndex;
          for (let i = 0; i < sectionIndex; i++) {
            globalIndex += allSections[i].questions.length;
          }

          const responseValue = responses[globalIndex];
          if (responseValue !== undefined) {
            formattedResponses.push({
              questionId: question.id || `question_${globalIndex}`,
              questionTitle: question.title || `Question ${globalIndex + 1}`,
              answer: responseValue,
              sectionId: section.id || "main",
              sectionTitle: section.title || `Section ${sectionIndex + 1}`,
            });
          }
        });
      });

      const response = await fetch(`/api/guest/evaluator/submit/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses: formattedResponses }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to submit evaluation");
      }

      setShowSuccess(true);
    } catch (err) {
      alert("Error submitting evaluation: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Get question type info
  const getQuestionTypeInfo = (question) => {
    if (question.type === "scale") {
      if (question.lowLabel || question.highLabel) {
        return { type: "Likert Scale" };
      }
      return { type: "Numeric Ratings", icon: question.icon };
    }
    return { type: question.type };
  };

  // Render question
  const renderQuestion = (question, questionIndex) => {
    if (!question || !question.title) return null;

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

      case "scale":
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

      default:
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

  // Render start screen
  const renderStartScreen = () => {
    return (
      <GuestEvaluatorLayout>
        <div className="flex justify-center items-center h-full bg-gray-100">
          <div className="max-w-6xl w-full mx-auto p-8">
            <div className="bg-white rounded-lg shadow-lg py-12 text-center mb-6">
              <h1 className="text-4xl font-bold text-gray-900">
                {form?.title || "Event Evaluation Form"}
              </h1>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-xl">
              <p className="mb-4">
                The Event Evaluation Form is now open for submission. Answer it
                on the given time frame so that your response is seen by the
                institution.
              </p>
              <h2 className="text-lg font-semibold mb-2">
                Follow these instructions to have a smooth-sailing evaluation:
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  Use formal language (Filipino or English) in the evaluation.
                </li>
                <li>Avoid using Filipino or English slangs/colloquialisms.</li>
                <li>
                  Do not use emojis on the qualitative feedback part of the
                  evaluation.
                </li>
                <li>
                  Make sure of your responses, the integrity of the evaluation
                  report will be based on these.
                </li>
              </ul>

              <div className="flex justify-center flex-col items-center mt-8">
                {evaluatorInfo && (
                  <div className="text-sm text-gray-500 mb-4 italic">
                    Evaluating as: <strong>{evaluatorInfo.name}</strong>
                  </div>
                )}
                <button
                  onClick={() => setIsStarted(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded-lg shadow-md transition-all duration-200"
                >
                  Begin Evaluation
                </button>
              </div>
            </div>
          </div>
        </div>
      </GuestEvaluatorLayout>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#1F3463] to-[#2d4a8c]">
        <div className="text-center bg-white p-8 rounded-xl shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1F3463] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            Loading evaluation form...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#1F3463] to-[#2d4a8c]">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {alreadyCompleted ? (
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              ) : (
                <AlertCircle className="w-8 h-8 text-red-600" />
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {alreadyCompleted ? "Already Submitted" : "Access Error"}
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (showSuccess) {
    return (
      <GuestEvaluatorLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Thank You!
            </h2>
            <p className="text-gray-600 mb-6">
              Your evaluation has been submitted successfully. We appreciate
              your feedback!
            </p>
            <p className="text-sm text-gray-500">
              You can safely close this window.
            </p>
          </div>
        </div>
      </GuestEvaluatorLayout>
    );
  }

  // Main Render
  if (!isStarted) {
    return renderStartScreen();
  }

  return (
    <GuestEvaluatorLayout>
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          <div className="p-6 sm:p-8">
            {/* Welcome message for guest evaluator */}
            {evaluatorInfo && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                <p className="text-blue-800">
                  Welcome, <strong>{evaluatorInfo.name}</strong>! Please
                  complete the evaluation below.
                </p>
              </div>
            )}

            {/* Form Title - Show on first section */}
            {currentSectionIndex === 0 && form && (
              <div className="bg-white p-8 rounded-lg shadow-md mb-6 border">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-gray-800">
                    {form.title}
                  </h1>
                  {form.description && (
                    <p className="text-gray-600 mt-2">{form.description}</p>
                  )}
                </div>
                <hr className="my-4" />
                <p className="text-red-500 text-sm">
                  * Indicates required questions
                </p>
              </div>
            )}

            {/* Section Container */}
            <div className="space-y-6">
              {/* Section Header */}
              <div className="bg-[#1F3463] p-6 rounded-lg shadow-md text-white">
                <h2 className="text-xl font-bold">
                  Section {currentSectionIndex + 1}:{" "}
                  {currentSection?.title || "Untitled Section"}
                </h2>
                {currentSection?.description && (
                  <p className="text-white/80 mt-2">
                    {currentSection.description}
                  </p>
                )}
              </div>

              {/* Questions */}
              {currentSection?.questions?.map((question, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-sm border"
                >
                  {renderQuestion(question, index)}
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8">
              <div>
                {currentSectionIndex > 0 && (
                  <button
                    onClick={() =>
                      setCurrentSectionIndex(currentSectionIndex - 1)
                    }
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Previous
                  </button>
                )}
              </div>
              <div>
                {currentSectionIndex < totalSections - 1 ? (
                  <button
                    onClick={() =>
                      setCurrentSectionIndex(currentSectionIndex + 1)
                    }
                    className="px-8 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 shadow-md"
                  >
                    Next Section
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </GuestEvaluatorLayout>
  );
}

export default GuestEvaluatePage;

import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/useAuth";
import { useNavigate } from "react-router-dom";
import { X, CheckCircle, Award } from "lucide-react";

const FormViewer = ({ formId, onClose }) => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [certificateGenerated, setCertificateGenerated] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
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

  // Convert backend question format to client format for rendering
  const convertToClientFormat = (question) => {
    let clientType = "Short Answer";

    switch (question.type) {
      case "short_answer":
        clientType = "Short Answer";
        break;
      case "paragraph":
        clientType = "Paragraph";
        break;
      case "multiple_choice":
        clientType = "Multiple Choices";
        break;
      case "scale":
        // Check if it's a numeric rating (no labels) or likert scale (with labels)
        if (question.lowLabel || question.highLabel) {
          clientType = "Likert Scale";
          return {
            ...question,
            type: clientType,
            likertStart: question.low || 1,
            likertEnd: question.high || 5,
            likertStartLabel: question.lowLabel || "Poor",
            likertEndLabel: question.highLabel || "Excellent",
            ratingScale: question.high || 5,
            emojiStyle: "Default",
          };
        } else {
          clientType = "Numeric Ratings";
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
      ...question,
      type: clientType,
      ratingScale: question.high || 5,
      emojiStyle: "Default",
    };
  };

  // Render individual question based on type
  const renderQuestion = (question, index) => {
    const clientQuestion = convertToClientFormat(question);
    const questionId = question._id || `q_${index}`;
    const currentResponse = responses[questionId] || "";

    const updateResponse = (value) => {
      setResponses((prev) => ({
        ...prev,
        [questionId]: value,
      }));
    };

    const renderInput = () => {
      switch (clientQuestion.type) {
        case "Short Answer":
          return (
            <input
              type="text"
              value={currentResponse}
              onChange={(e) => updateResponse(e.target.value)}
              className="w-full border border-gray-200 rounded-md p-2"
              placeholder="Enter your answer"
            />
          );

        case "Date":
          return (
            <input
              type="date"
              value={currentResponse}
              onChange={(e) => updateResponse(e.target.value)}
              className="w-full border border-gray-200 rounded-md p-2"
            />
          );

        case "Time":
          return (
            <input
              type="time"
              value={currentResponse}
              onChange={(e) => updateResponse(e.target.value)}
              className="w-full border border-gray-200 rounded-md p-2"
            />
          );

        case "File Upload":
          return (
            <input
              type="file"
              onChange={(e) => updateResponse(e.target.files[0] || "")}
              className="w-full border border-gray-200 rounded-md p-2"
            />
          );

        case "Multiple Choices":
          return (
            <div className="space-y-2">
              {(clientQuestion.options || []).map((option, optionIndex) => (
                <label key={optionIndex} className="flex items-center">
                  <input
                    type="radio"
                    name={`question-${questionId}`}
                    value={option}
                    checked={currentResponse === option}
                    onChange={(e) => updateResponse(e.target.value)}
                    className="mr-3 h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  {option}
                </label>
              ))}
            </div>
          );

        case "Numeric Ratings":
          return (
            <div className="flex justify-center items-center text-center gap-x-2 sm:gap-x-4">
              {[1, 2, 3, 4, 5].map((num) => (
                <label
                  key={num}
                  className="flex flex-col items-center cursor-pointer"
                >
                  <input
                    type="radio"
                    name={`question-${questionId}`}
                    value={num}
                    checked={parseInt(currentResponse) === num}
                    onChange={(e) => updateResponse(e.target.value)}
                    className="sr-only"
                  />
                  <span
                    className={`text-sm mb-1 ${
                      parseInt(currentResponse) === num
                        ? "text-blue-600 font-semibold"
                        : "text-gray-600"
                    }`}
                  >
                    {num}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      parseInt(currentResponse) === num
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    ⭐
                  </div>
                </label>
              ))}
            </div>
          );

        case "Likert Scale": {
          // Fix: Move range declaration outside switch statement
          const range = [];
          for (
            let i = clientQuestion.likertStart;
            i <= clientQuestion.likertEnd;
            i++
          ) {
            range.push(i);
          }
          return (
            <div className="space-y-4">
              {/* Scale labels */}
              <div className="flex justify-between text-sm text-gray-600">
                <span>{clientQuestion.likertStartLabel || "Low"}</span>
                <span>{clientQuestion.likertEndLabel || "High"}</span>
              </div>
              {/* Scale options */}
              <div className="flex justify-center items-center gap-2">
                {range.map((num) => (
                  <label
                    key={num}
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={`question-${questionId}`}
                      value={num}
                      checked={parseInt(currentResponse) === num}
                      onChange={(e) => updateResponse(e.target.value)}
                      className="sr-only"
                    />
                    <span
                      className={`text-sm mb-1 ${
                        parseInt(currentResponse) === num
                          ? "text-blue-600 font-semibold"
                          : "text-gray-600"
                      }`}
                    >
                      {num}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                        parseInt(currentResponse) === num
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {num}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          );
        }

        case "Paragraph":
          return (
            <textarea
              value={currentResponse}
              onChange={(e) => updateResponse(e.target.value)}
              className="w-full border border-gray-200 rounded-md p-2 min-h-[100px]"
              placeholder="Enter your detailed response"
            />
          );

        default:
          return (
            <input
              type="text"
              value={currentResponse}
              onChange={(e) => updateResponse(e.target.value)}
              className="w-full border border-gray-200 rounded-md p-2"
              placeholder="Enter your answer"
            />
          );
      }
    };

    return (
      <div
        key={questionId}
        className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-4 border"
      >
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {index + 1}. {question.title}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </h3>
        </div>
        <div className="mt-4">{renderInput()}</div>
      </div>
    );
  };

  const handleSubmit = async () => {
    try {
      // Validate required questions
      const requiredQuestions = form.questions.filter((q) => q.required);
      const unansweredRequired = requiredQuestions.filter((q) => {
        const questionId = q._id || `q_${form.questions.indexOf(q)}`;
        const response = responses[questionId];
        return (
          !response || (typeof response === "string" && response.trim() === "")
        );
      });

      if (unansweredRequired.length > 0) {
        alert("Please answer all required questions.");
        return;
      }

      // Format responses for submission
      const formattedResponses = form.questions.map((question, index) => {
        const questionId = question._id || `q_${index}`;
        const response = responses[questionId] || "";

        return {
          questionId,
          questionTitle: question.title,
          answer: response,
        };
      });

      const submitResponse = await fetch(`/api/forms/${formId}/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          responses: formattedResponses,
          respondentEmail: "participant@example.com", // This should come from auth context
          respondentName: "Participant", // This should come from auth context
        }),
      });

      if (submitResponse.ok) {
        const data = await submitResponse.json();
        setSubmitted(true);
        // Check if certificate was generated
        if (data.data?.certificateId) {
          setCertificateGenerated(true);
        }
        //Auto-close after 5 seconds to give user time to read certificate message
        setTimeout(() => {
          onClose();
        }, 5000);
      } else {
        throw new Error("Failed to submit response");
      }
    } catch (err) {
      console.error("Error submitting response:", err);
      alert("Failed to submit response. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-center text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8">
          <p className="text-red-600 text-center">Error: {error}</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-200 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Response Submitted!
          </h3>
          <p className="text-gray-600 mb-4">Thank you for your feedback.</p>

          {certificateGenerated && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-center mb-2">
                <Award className="w-8 h-8 text-blue-600 mr-2" />
                <h4 className="text-lg font-semibold text-blue-900">
                  Certificate Generated!
                </h4>
              </div>
              <p className="text-sm text-blue-700 mb-3">
                Your certificate has been generated and sent to your email.
              </p>
              <button
                onClick={() => {
                  onClose();
                  navigate("/participant/certificates");
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                View My Certificates
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {form.title}
            </h2>
            <p className="text-sm text-gray-600 mt-1">{form.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 max-h-[calc(90vh-140px)]">
          {form.questions && form.questions.length > 0 ? (
            <div>
              {form.questions.map((question, index) =>
                renderQuestion(question, index)
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No questions found in this form.</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Submit Response
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormViewer;

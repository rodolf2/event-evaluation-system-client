import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/useAuth';
import { useParams, useNavigate } from 'react-router-dom';
import { X, CheckCircle } from 'lucide-react';
import ParticipantLayout from '../../components/participants/ParticipantLayout';

const EvaluationForm = () => {
  const { token } = useAuth();
  const { formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`/api/forms/${formId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch form');
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
            emojiStyle: "Default"
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
      emojiStyle: "Default"
    };
  };

  // Render individual question based on type
  const renderQuestion = (question, index) => {
    const clientQuestion = convertToClientFormat(question);
    const questionId = question._id || `q_${index}`;
    const currentResponse = responses[questionId] || '';

    const updateResponse = (value) => {
      setResponses(prev => ({
        ...prev,
        [questionId]: value
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
              onChange={(e) => updateResponse(e.target.files[0] || '')}
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
                <label key={num} className="flex flex-col items-center cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${questionId}`}
                    value={num}
                    checked={parseInt(currentResponse) === num}
                    onChange={(e) => updateResponse(e.target.value)}
                    className="sr-only"
                  />
                  <span className={`text-sm mb-1 ${parseInt(currentResponse) === num ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>
                    {num}
                  </span>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${parseInt(currentResponse) === num ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
                    ⭐
                  </div>
                </label>
              ))}
            </div>
          );

        case "Likert Scale": {
          const range = [];
          for (let i = clientQuestion.likertStart; i <= clientQuestion.likertEnd; i++) {
            range.push(i);
          }
          return (
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{clientQuestion.likertStartLabel || "Low"}</span>
                <span>{clientQuestion.likertEndLabel || "High"}</span>
              </div>
              <div className="flex justify-center items-center gap-2">
                {range.map((num) => (
                  <label key={num} className="flex flex-col items-center cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${questionId}`}
                      value={num}
                      checked={parseInt(currentResponse) === num}
                      onChange={(e) => updateResponse(e.target.value)}
                      className="sr-only"
                    />
                    <span className={`text-sm mb-1 ${parseInt(currentResponse) === num ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>
                      {num}
                    </span>
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${parseInt(currentResponse) === num ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
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
      <div key={questionId} className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-4 border">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {index + 1}. {question.title}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </h3>
        </div>
        <div className="mt-4">
          {renderInput()}
        </div>
      </div>
    );
  };

  const handleSubmit = async () => {
    try {
      const requiredQuestions = form.questions.filter(q => q.required);
      const unansweredRequired = requiredQuestions.filter(q => {
        const questionId = q._id || `q_${form.questions.indexOf(q)}`;
        const response = responses[questionId];
        return !response || (typeof response === 'string' && response.trim() === '');
      });

      if (unansweredRequired.length > 0) {
        alert('Please answer all required questions.');
        return;
      }

      const formattedResponses = form.questions.map((question, index) => {
        const questionId = question._id || `q_${index}`;
        const response = responses[questionId] || '';
        
        return {
          questionId,
          questionTitle: question.title,
          answer: response
        };
      });

      const submitResponse = await fetch(`/api/forms/${formId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responses: formattedResponses,
          respondentEmail: 'participant@example.com', 
          respondentName: 'Participant' 
        }),
      });

      if (submitResponse.ok) {
        setSubmitted(true);
        setTimeout(() => {
          navigate('/participant/evaluations');
        }, 2000);
      } else {
        throw new Error('Failed to submit response');
      }
    } catch (err) {
      console.error('Error submitting response:', err);
      alert('Failed to submit response. Please try again.');
    }
  };

  if (loading) {
    return (
      <ParticipantLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
      </ParticipantLayout>
    );
  }

  if (error) {
    return (
      <ParticipantLayout>
        <div className="flex items-center justify-center h-full">
          <div className="bg-white rounded-lg p-8">
            <p className="text-red-600 text-center">Error: {error}</p>
            <button onClick={() => navigate('/participant/evaluations')} className="mt-4 px-4 py-2 bg-gray-200 rounded-md">Go Back</button>
          </div>
        </div>
      </ParticipantLayout>
    );
  }

  if (submitted) {
    return (
      <ParticipantLayout>
        <div className="flex items-center justify-center h-full">
          <div className="bg-white rounded-lg p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Response Submitted!</h3>
            <p className="text-gray-600">Thank you for your feedback.</p>
          </div>
        </div>
      </ParticipantLayout>
    );
  }

  return (
    <ParticipantLayout>
      <div className="p-6">
          <div className="max-w-6xl w-full mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-6 text-center mb-6">
                  <h2 className="text-3xl font-bold">{form.title}</h2>
                  <p className="text-sm mt-1">{form.description}</p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6">
                  {form.questions && form.questions.length > 0 ? (
                      <div>
                          {form.questions.map((question, index) => renderQuestion(question, index))}
                      </div>
                  ) : (
                      <div className="text-center py-8 text-gray-500">
                          <p>No questions found in this form.</p>
                      </div>
                  )}
              </div>
              <div className="flex items-center justify-end p-6 bg-gray-50">
                  <button 
                      onClick={() => navigate(`/evaluations/start/${formId}`)}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors mr-4"
                  >
                      Go Back
                  </button>
                  <button 
                      onClick={handleSubmit}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                      Submit Response
                  </button>
              </div>
          </div>
      </div>
    </ParticipantLayout>
  );
};

export default EvaluationForm;

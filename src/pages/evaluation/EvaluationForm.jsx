
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ParticipantLayout from '../../components/participants/ParticipantLayout';
import { useAuth } from '../../contexts/useAuth';

const EvaluationForm = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [responses, setResponses] = useState({});
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Fetch form data
  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true);
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
      localStorage.setItem(`form_${formId}_responses`, JSON.stringify(responses));
    }
  }, [responses, formId]);

  // Handle response change
  const handleResponseChange = (questionIndex, value) => {
    setResponses(prev => ({
      ...prev,
      [questionIndex]: value
    }));
  };

  // Handle form validation
  const validateForm = () => {
    if (!form || !form.questions || !Array.isArray(form.questions)) return false;
    const requiredQuestions = form.questions.filter(q => q && q.required);
    const missingResponses = requiredQuestions.filter((q, index) => !responses[index]);
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
      alert('Please answer all required questions before submitting.');
      return;
    }

    if (!formId || !token) {
      alert('Form ID or authentication token is missing.');
      return;
    }

    try {
      const response = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId,
          responses,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit evaluation');
      }

      // Clear saved responses
      if (formId) {
        localStorage.removeItem(`form_${formId}_responses`);
      }
      
      // Navigate to success page or evaluations list
      alert('Evaluation submitted successfully!');
      navigate('/participant/evaluations');
    } catch (err) {
      alert('Error submitting evaluation: ' + err.message);
    }
  };

  // Safe destructuring with comprehensive null checks
  const {
    title = 'Loading...',
    description = 'Loading description...',
    questions = []
  } = form || {};
  
  const questionsPerPage = currentPage === 1 ? 1 : 2;
  const totalPages = questions && Array.isArray(questions) && questions.length > 0
    ? Math.ceil((questions.length - 1) / 2) + 1
    : 1;

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getSectionTitle = () => {
    // Section title in format "Section 1: Title" with fallback
    return `Section ${currentPage}: ${title || 'Form'}`;
  };

  const startIndex = currentPage === 1 ? 0 : 1 + (currentPage - 2) * 2;
  const endIndex = startIndex + questionsPerPage;
  const currentQuestions = questions && Array.isArray(questions) ? questions.slice(startIndex, endIndex) : [];

  // Render different question types
  const renderQuestion = (question, questionIndex) => {
    if (!question || !question.text) return null;
    const actualIndex = startIndex + questionIndex;
    const isRequired = question.required || question.text.includes('*');

    switch (question.type) {
      case 'radio':
        if (!question.options || !Array.isArray(question.options)) return null;
        return (
          <div key={questionIndex} className='mb-8'>
            <label className="block text-lg text-gray-800 mb-4">
              {question.text}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex flex-col space-y-3">
              {question.options.map((option, i) => (
                <label key={i} className="flex items-center p-3 rounded-lg hover:bg-gray-100 cursor-pointer">
                  <input
                    type="radio"
                    name={`q${actualIndex}`}
                    value={option}
                    className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                    checked={responses[actualIndex] === option}
                    onChange={(e) => handleResponseChange(actualIndex, e.target.value)}
                  />
                  <span className='ml-3 text-gray-700'>{option}</span>
                </label>
              ))}
            </div>
          </div>
        );
      
      case 'text':
        return (
          <div key={questionIndex} className='mb-8'>
            <label className="block text-lg text-gray-800 mb-4">
              {question.text}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              rows="4"
              value={responses[actualIndex] || ''}
              onChange={(e) => handleResponseChange(actualIndex, e.target.value)}
              placeholder="Enter your response here..."
            />
          </div>
        );
      
      case 'number':
        return (
          <div key={questionIndex} className='mb-8'>
            <label className="block text-lg text-gray-800 mb-4">
              {question.text}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={responses[actualIndex] || ''}
              onChange={(e) => handleResponseChange(actualIndex, e.target.value)}
              min={question.min || 0}
              max={question.max || 10}
            />
          </div>
        );
      
      default:
        // Default to radio button for backward compatibility
        if (!question.options || !Array.isArray(question.options)) return null;
        return (
          <div key={questionIndex} className='mb-8'>
            <label className="block text-lg text-gray-800 mb-4">
              {question.text}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex flex-col space-y-3">
              {question.options.map((option, i) => (
                <label key={i} className="flex items-center p-3 rounded-lg hover:bg-gray-100 cursor-pointer">
                  <input
                    type="radio"
                    name={`q${actualIndex}`}
                    value={option}
                    className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                    checked={responses[actualIndex] === option}
                    onChange={(e) => handleResponseChange(actualIndex, e.target.value)}
                  />
                  <span className='ml-3 text-gray-700'>{option}</span>
                </label>
              ))}
            </div>
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
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Form</h2>
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
        {/* Top White Container - Only show title/description on first page, subsequent pages show smaller header */}
        <div className="bg-white p-8 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-800">{title || 'Loading...'}</h1>
              <p className="text-gray-600 mt-2 mb-4">{description || 'Loading description...'}</p>
            </div>
          </div>
          <hr />
          {/* Only show red required label on first page */}
          {currentPage === 1 && (
            <div className="flex justify-between items-center mt-4">
              <p className='text-red-500 text-sm'>* Indicates required questions</p>
              {/* Clear Form Link - Google Forms style */}
              <button
                onClick={handleClearForm}
                className="text-blue-600 hover:text-blue-800 text-sm underline focus:outline-none"
              >
                Clear form
              </button>
            </div>
          )}
        </div>

        {/* Middle Blue Container - Section Label */}
        <div className='bg-blue-900 text-white p-4 rounded-lg mb-6'>
          <h2 className="text-xl font-semibold">{getSectionTitle()}</h2>
        </div>

        {/* Bottom White Container - Questions */}
        <div className="bg-white p-8 rounded-lg shadow-md mb-6">
          {currentQuestions.map((question, index) =>
            renderQuestion(question, index)
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8">
            <div>
                {/* Back Button - positioned in lower left corner */}
                <button
                onClick={handleBack}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                Back
                </button>
            </div>
            <div className='flex items-center space-x-4'>
                {currentPage < totalPages ? (
                    <button
                    onClick={handleNext}
                    className="px-8 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 shadow-md"
                    >
                    Next
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
              <p className="text-gray-600 mb-6">Are you sure you want to clear all responses? This action cannot be undone.</p>
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

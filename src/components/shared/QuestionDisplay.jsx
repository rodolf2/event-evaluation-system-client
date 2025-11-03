import React from 'react';

const QuestionDisplay = ({ 
  question, 
  index, 
  showAnswer = false, 
  answer = null, 
  readOnly = true 
}) => {
  // Convert backend question format to client format for rendering
  const convertToClientFormat = (q) => {
    let clientType = "Short Answer";
    
    switch (q.type) {
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
        if (q.lowLabel || q.highLabel) {
          clientType = "Likert Scale";
          return {
            ...q,
            type: clientType,
            likertStart: q.low || 1,
            likertEnd: q.high || 5,
            likertStartLabel: q.lowLabel || "Poor",
            likertEndLabel: q.highLabel || "Excellent",
            ratingScale: q.high || 5,
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
      ...q,
      type: clientType,
      ratingScale: q.high || 5,
      emojiStyle: "Default"
    };
  };

  const clientQuestion = convertToClientFormat(question);

  const renderAnswer = () => {
    if (!showAnswer || answer === null || answer === '') {
      return (
        <div className="text-gray-400 italic">
          {readOnly ? "No response" : "Answer will appear here"}
        </div>
      );
    }

    switch (clientQuestion.type) {
      case "Multiple Choices":
        return (
          <div className="text-gray-900">
            {answer}
          </div>
        );

      case "Numeric Ratings":
      case "Likert Scale":
        return (
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-semibold">{answer}</span>
            <span className="text-gray-500">out of {clientQuestion.high || 5}</span>
          </div>
        );

      case "Date":
        return (
          <div className="text-gray-900">
            {new Date(answer).toLocaleDateString()}
          </div>
        );

      case "File Upload":
        return (
          <div className="text-gray-900">
            File uploaded: {answer.name || answer}
          </div>
        );

      default:
        return (
          <div className="text-gray-900 whitespace-pre-wrap">
            {answer}
          </div>
        );
    }
  };

  const renderQuestionPreview = () => {
    switch (clientQuestion.type) {
      case "Multiple Choices":
        return (
          <div className="space-y-2">
            {(clientQuestion.options || []).map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center">
                <div className="w-4 h-4 border border-gray-300 rounded mr-3"></div>
                <span className="text-gray-700">{option}</span>
              </div>
            ))}
          </div>
        );

      case "Numeric Ratings":
        return (
          <div className="flex justify-center items-center text-center gap-x-2 sm:gap-x-4">
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num} className="flex flex-col items-center">
                <span className="text-sm text-gray-600">{num}</span>
                <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center mt-1">
                  ⭐
                </div>
              </div>
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
            {/* Scale labels */}
            <div className="flex justify-between text-sm text-gray-600">
              <span>{clientQuestion.likertStartLabel || "Low"}</span>
              <span>{clientQuestion.likertEndLabel || "High"}</span>
            </div>
            {/* Scale options */}
            <div className="flex justify-center items-center gap-2">
              {range.map((num) => (
                <div key={num} className="flex flex-col items-center">
                  <span className="text-sm text-gray-600">{num}</span>
                  <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center mt-1">
                    {num}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case "Short Answer":
        return (
          <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
            <span className="text-gray-500">Short answer text</span>
          </div>
        );

      case "Paragraph":
        return (
          <div className="border border-gray-200 rounded-md p-3 bg-gray-50 min-h-[100px]">
            <span className="text-gray-500">Long answer text</span>
          </div>
        );

      case "Date":
        return (
          <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
            <span className="text-gray-500">Select date</span>
          </div>
        );

      case "Time":
        return (
          <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
            <span className="text-gray-500">Select time</span>
          </div>
        );

      case "File Upload":
        return (
          <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
            <span className="text-gray-500">Upload file</span>
          </div>
        );

      default:
        return (
          <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
            <span className="text-gray-500">Answer field</span>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-4 border">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {index + 1}. {question.title}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </h3>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {clientQuestion.type}
        </span>
      </div>
      
      <div className="mt-4">
        {showAnswer ? renderAnswer() : renderQuestionPreview()}
      </div>
    </div>
  );
};

export default QuestionDisplay;
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ParticipantLayout from "../../components/participants/ParticipantLayout";
import { useAuth } from "../../contexts/useAuth";

const EvaluationStart = () => {
  const navigate = useNavigate();
  const { formId } = useParams();
  const { token } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleContinue = () => {
    navigate(`/evaluations/form/${formId}`);
  };

  const handleGoBack = () => {
    navigate("/student/evaluations");
  };

  if (loading) {
    return (
      <ParticipantLayout>
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
      </ParticipantLayout>
    );
  }

  if (error) {
    return (
      <ParticipantLayout>
        <div className="flex justify-center items-center h-full">
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-red-600">Error: {error}</p>
            <button
              onClick={handleGoBack}
              className="mt-4 px-4 py-2 bg-gray-200 rounded-md"
            >
              Go Back
            </button>
          </div>
        </div>
      </ParticipantLayout>
    );
  }

  return (
    <ParticipantLayout>
      <div className="flex justify-center items-center h-full bg-gray-100">
        <div className="max-w-6xl w-full mx-auto p-8">
          <div className="bg-white rounded-lg shadow-lg py-12 text-center mb-6">
            <h1 className="text-6xl font-bold text-gray-900">
              {form?.title || "Event Evaluation Form"}
            </h1>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-xl">
            <p className="mb-4">
              The Event Evaluation Form is now open for submission. Answer it on
              the given time frame so that your response is seen by the
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
            <div className="flex justify-center mt-8">
              <button
                onClick={handleGoBack}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg mr-4"
              >
                Go Back
              </button>
              <button
                onClick={handleContinue}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </ParticipantLayout>
  );
};

export default EvaluationStart;

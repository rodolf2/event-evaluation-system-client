import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ParticipantLayout from "../../components/participants/ParticipantLayout";
import ClubOfficerLayout from "../../components/club-officers/ClubOfficerLayout";
import { useAuth } from "../../contexts/useAuth";

const EvaluationStart = () => {
  const navigate = useNavigate();
  const { formId } = useParams();
  const { token, user } = useAuth();

  // Determine Layout based on role
  const Layout =
    user?.role === "club-officer" ? ClubOfficerLayout : ParticipantLayout;
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const checkSubmission = async () => {
      // Check session storage first for immediate feedback
      const sessionCert = sessionStorage.getItem(`cert_${formId}`);
      if (sessionCert) {
        setIsCompleted(true);
      }

      if (!token || !formId) return;
      try {
        const response = await fetch(`/api/certificates/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            const userCertificates = data.data || [];
            const exists = userCertificates.some(
              (cert) =>
                cert.formId?._id === formId ||
                cert.formId === formId ||
                cert.eventId?._id === formId,
            );
            setIsCompleted(exists);
          }
        }
      } catch (e) {
        console.error("Error checking submission:", e);
      }
    };
    checkSubmission();
  }, [formId, token]);

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
    if (user?.role === "club-officer") {
      navigate("/club-officer/evaluations/my");
    } else {
      navigate("/student/evaluations");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
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
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex justify-center items-center h-full bg-gray-100">
        <div className="max-w-6xl w-full mx-auto p-4 md:p-8">
          <div className="bg-white rounded-lg shadow-lg py-8 md:py-12 text-center mb-6">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 px-4">
              {form?.title || "Event Evaluation Form"}
            </h1>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 text-base md:text-xl font-bold">
            <p className="mb-4">
              The Event Evaluation Form is now open for submission. Answer it on
              the given time frame so that your response is seen by the
              institution.
            </p>
            <h2 className="text-base md:text-lg font-semibold mb-2">
              Follow these instructions to have a smooth-sailing evaluation:
            </h2>
            <ul className="list-disc list-inside space-y-2 text-sm md:text-base">
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
            <div className="flex flex-col sm:flex-row justify-center mt-8 gap-4">
              <button
                onClick={handleGoBack}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg w-full sm:w-auto"
              >
                Go Back
              </button>
              <button
                onClick={handleContinue}
                className={`${isCompleted
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
                  } text-white font-bold py-3 px-6 rounded-lg w-full sm:w-auto`}
              >
                {isCompleted ? "View Certificate" : "Continue"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EvaluationStart;

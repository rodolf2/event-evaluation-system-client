import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/useAuth";
import { SkeletonCard } from "../../components/shared/SkeletonLoader";
import ClubOfficerLayout from "../../components/club-officers/ClubOfficerLayout";

function Evaluations() {
  const { token } = useAuth();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvaluations = async () => {
      if (!token) return;

      try {
        const response = await fetch("/api/forms/my-evaluations", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setEvaluations(data.success ? data.data.forms : []);
        }
      } catch (error) {
        console.error("Error fetching evaluations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, [token]);

  if (loading) {
    return (
      <ClubOfficerLayout>
        <div className="space-y-4">
          <SkeletonCard contentLines={3} />
          <SkeletonCard contentLines={3} />
          <SkeletonCard contentLines={3} />
        </div>
      </ClubOfficerLayout>
    );
  }

  return (
    <ClubOfficerLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">My Evaluations</h2>

          {evaluations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No evaluations found</p>
              <p className="text-gray-400 mt-2">You haven't participated in any evaluations yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {evaluations.map((evaluation) => (
                <div
                  key={evaluation._id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {evaluation.title}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {evaluation.description}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span>Status: {evaluation.status}</span>
                        <span>Due: {new Date(evaluation.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {evaluation.status === "pending" && (
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                          Start Evaluation
                        </button>
                      )}
                      {evaluation.status === "completed" && (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ClubOfficerLayout>
  );
}

export default Evaluations;
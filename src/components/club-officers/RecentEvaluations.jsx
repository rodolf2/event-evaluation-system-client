import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";

const RecentEvaluations = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchRecentEvaluations();
    }
  }, [token]);

  const fetchRecentEvaluations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/forms?limit=5", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch recent evaluations");
      }

      const result = await response.json();
      if (result.success) {
        // Get the forms data (could be in result.data or result.data.forms)
        const forms = result.data.forms || result.data || [];
        setEvaluations(forms.slice(0, 5)); // Ensure max 5 items
      } else {
        throw new Error(result.message || "Failed to fetch recent evaluations");
      }
    } catch (err) {
      console.error("Error fetching recent evaluations:", err);
      setEvaluations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluationClick = (formId) => {
    navigate(`/club-officer/form-creation?formId=${formId}`);
  };

  if (loading) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Recent Evaluations
        </h3>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white shadow rounded-md p-3 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 mb-3">
        Recent Evaluations
      </h3>
      <div className="space-y-2">
        {evaluations.length > 0 ? (
          evaluations.map((evaluation) => (
            <div
              key={evaluation._id}
              onClick={() => handleEvaluationClick(evaluation._id)}
              className="bg-white shadow rounded-md p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:shadow-lg cursor-pointer transition-shadow"
            >
              <div className="flex-1">
                <span className="font-medium text-gray-800 block">
                  {evaluation.title}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      evaluation.status === "published"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {evaluation.status === "published" ? "Published" : "Draft"}
                  </span>
                  <span className="text-gray-600 text-sm">
                    {new Date(evaluation.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white shadow rounded-md p-3 text-center text-gray-500">
            No recent evaluations found
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentEvaluations;

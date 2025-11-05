import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ParticipantLayout from "../../components/participants/ParticipantLayout";
import { Search, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/useAuth';

const Evaluations = () => {
  const navigate = useNavigate();
  const [evaluations, setEvaluations] = useState([]);
  const [filteredEvaluations, setFilteredEvaluations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchMyEvaluations();
  }, [token]);

  useEffect(() => {
    setFilteredEvaluations(
      evaluations.filter(evaluation =>
        evaluation.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, evaluations]);

  const fetchMyEvaluations = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch('/api/forms/my-evaluations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch evaluations: ${response.status}`);
      }

      const data = await response.json();
      setEvaluations(data.success ? data.data.forms : []);
    } catch (err) {
      console.error('Error fetching evaluations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <ParticipantLayout>
        <div className="bg-gray-100 min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ParticipantLayout>
    );
  }

  if (error) {
    return (
      <ParticipantLayout>
        <div className="bg-gray-100 min-h-screen flex items-center justify-center">
          <div className="text-red-600 text-center">
            <p className="text-lg font-semibold">Error loading evaluations</p>
            <p>{error}</p>
            <button
              onClick={fetchMyEvaluations}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </ParticipantLayout>
    );
  }

  return (
    <ParticipantLayout>
      <div className="bg-gray-100 min-h-screen pb-8">
        <div className="max-w-full">
          <div className="flex items-center mb-8 gap-4">
            <div className="relative w-full sm:w-auto sm:flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <button className="bg-white p-3 rounded-lg border border-gray-300 flex items-center text-gray-700 w-full justify-center sm:w-auto">
                <span className="w-3 h-3 bg-blue-600 mr-2 rounded-sm"></span>
                <span>Event</span>
              </button>
            </div>
          </div>

          {filteredEvaluations.length === 0 ? (
            <div className="text-center text-gray-500">
              <p className="text-lg">No evaluations available at this time.</p>
              <p className="text-sm">Evaluations will appear here when assigned to you.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvaluations.map((evaluation, index) => (
                <div
                  key={evaluation.id || index}
                  className="bg-[linear-gradient(-0.15deg,_#324BA3_38%,_#002474_100%)] rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                  onClick={() => navigate(`/evaluations/start/${evaluation._id}`)}
                >
                  <div className="bg-white rounded-r-lg ml-3 p-8 flex items-center h-full">
                      <div className="grow">
                        <h3 className="font-bold text-2xl mb-4 text-gray-800">{evaluation.title}</h3>
                        <div className="text-sm text-gray-500 space-x-4">
                          <span>Open: {formatDate(evaluation.eventStartDate)}</span>
                          <span>Closes: {formatDate(evaluation.eventEndDate)}</span>
                        </div>
                      </div>
                      <div className="ml-4 text-gray-400">
                        <ChevronRight className="h-6 w-6" />
                      </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ParticipantLayout>
  );
};

export default Evaluations;
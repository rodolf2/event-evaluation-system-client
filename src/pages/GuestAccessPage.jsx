import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';

function GuestAccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessInfo, setAccessInfo] = useState(null);

  const token = searchParams.get('token');

  useEffect(() => {
    const fetchReport = async () => {
      if (!token) {
        setError('No access token provided');
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/api/reports/guest-view?token=${token}`);

        if (response.data.success) {
          setReport(response.data.report);
          setAccessInfo({
            expiresAt: response.data.expiresAt,
            eventName: response.data.eventName
          });
        } else {
          setError(response.data.message || 'Failed to load report');
        }
      } catch (err) {
        console.error('Error fetching report:', err);
        setError(err.response?.data?.message || 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [token]);

  const handleLogout = () => {
    // Clear any stored tokens
    localStorage.removeItem('token');
    navigate('/guest-login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">Access Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/guest-login')}
            className="w-full bg-blue-950 hover:bg-blue-900 text-white font-medium py-3 rounded-md transition"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Event Evaluation Report</h1>
              <p className="text-sm text-gray-600">{accessInfo?.eventName}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          {/* Access Information */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-950 mb-2">Guest Access Information</h3>
            <p className="text-sm text-gray-600">
              You have read-only access to this report. Your access will expire on:
              <span className="font-medium"> {new Date(accessInfo?.expiresAt).toLocaleString()}</span>
            </p>
          </div>

          {/* Report Content */}
          <div className="report-content">
            {/* This would be replaced with your actual report viewer component */}
            <h2 className="text-2xl font-bold mb-4">{report?.title}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Event Details</h3>
                <p><strong>Event Name:</strong> {report?.eventName}</p>
                <p><strong>Date:</strong> {new Date(report?.eventDate).toLocaleDateString()}</p>
                <p><strong>Location:</strong> {report?.location}</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-2">Evaluation Summary</h3>
                <p><strong>Total Responses:</strong> {report?.totalResponses}</p>
                <p><strong>Average Rating:</strong> {report?.averageRating}/5</p>
                <p><strong>Completion Rate:</strong> {report?.completionRate}%</p>
              </div>
            </div>

            {/* Report sections would go here */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Evaluation Results</h3>

              {/* Quantitative Results */}
              <div className="mb-6">
                <h4 className="font-medium mb-2">Quantitative Feedback</h4>
                {/* Charts and graphs would be displayed here */}
                <p className="text-sm text-gray-600">Visual representations of ratings and scores</p>
              </div>

              {/* Qualitative Results */}
              <div className="mb-6">
                <h4 className="font-medium mb-2">Qualitative Feedback</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium mb-2">Key Themes</h5>
                  <ul className="list-disc pl-5 space-y-1">
                    {report?.keyThemes?.map((theme, index) => (
                      <li key={index} className="text-sm">{theme}</li>
                    )) || <li>No qualitative feedback available</li>}
                  </ul>
                </div>
              </div>

              {/* Recommendations */}
              <div className="mb-6">
                <h4 className="font-medium mb-2">Recommendations</h4>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <ul className="list-disc pl-5 space-y-2">
                    {report?.recommendations?.map((rec, index) => (
                      <li key={index} className="text-sm">{rec}</li>
                    )) || <li>No recommendations available</li>}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-sm text-gray-500 text-center">
            © {new Date().getFullYear()} La Verdad Christian College - Apalit, Pampanga.
            This is a read-only view of the event evaluation report.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default GuestAccessPage;

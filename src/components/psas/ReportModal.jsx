import { useState, useEffect, useCallback } from 'react';
import { X, Download, Star } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ReportModal = ({ report, onClose }) => {
  const [detailedReport, setDetailedReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_BASE_API_URL;

  const fetchDetailedReport = useCallback(async () => {
    if (!report) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${apiUrl}/api/events/${report.id}/report`);
      if (!response.ok) {
        throw new Error('Failed to fetch detailed report');
      }
      const data = await response.json();
      setDetailedReport(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching detailed report:', err);
    } finally {
      setLoading(false);
    }
  }, [report]);

  useEffect(() => {
    if (report) {
      fetchDetailedReport();
    }
  }, [report, fetchDetailedReport]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }

    return stars;
  };

  const preparePieChartData = (summary) => {
    return [
      { name: 'Positive', value: summary?.positive || 0, color: '#10B981' },
      { name: 'Neutral', value: summary?.neutral || 0, color: '#F59E0B' },
      { name: 'Negative', value: summary?.negative || 0, color: '#EF4444' },
    ].filter(item => item.value > 0);
  };

  const prepareBarChartData = (quantitativeData) => {
    if (!quantitativeData) return [];

    return [
      {
        year: quantitativeData.currentYear?.year?.toString() || 'Current',
        rating: quantitativeData.currentYear?.averageRating || 0,
        responses: quantitativeData.currentYear?.responseCount || 0,
      },
      {
        year: quantitativeData.previousYear?.year?.toString() || 'Previous',
        rating: quantitativeData.previousYear?.averageRating || 0,
        responses: quantitativeData.previousYear?.responseCount || 0,
      }
    ];
  };

  if (!report) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{report.title}</h2>
            <p className="text-gray-600">Event: {report.eventName}</p>
            <p className="text-sm text-gray-500">Date: {formatDate(report.eventDate)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading detailed report...</span>
            </div>
          )}

          {error && (
            <div className="text-red-600 text-center py-8">
              <p className="text-lg font-semibold">Error loading report</p>
              <p>{error}</p>
              <button
                onClick={fetchDetailedReport}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          )}

          {detailedReport && !loading && !error && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900">Average Rating</h3>
                  <div className="flex items-center mt-2">
                    <span className="text-2xl font-bold text-blue-600 mr-2">
                      {detailedReport.averageRating?.toFixed(1) || 'N/A'}
                    </span>
                    <div className="flex">
                      {renderStars(detailedReport.averageRating || 0)}
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900">Total Responses</h3>
                  <span className="text-2xl font-bold text-green-600">
                    {detailedReport.feedbackCount || 0}
                  </span>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900">Generated</h3>
                  <span className="text-sm text-purple-600">
                    {formatDate(detailedReport.generatedAt)}
                  </span>
                </div>
              </div>

              {/* Qualitative Analysis */}
              {detailedReport.qualitativeReport && (
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Qualitative Analysis</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Sentiment Summary Numbers */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{detailedReport.qualitativeReport.summary?.positive || 0}</div>
                        <div className="text-sm text-gray-600">Positive</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{detailedReport.qualitativeReport.summary?.neutral || 0}</div>
                        <div className="text-sm text-gray-600">Neutral</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{detailedReport.qualitativeReport.summary?.negative || 0}</div>
                        <div className="text-sm text-gray-600">Negative</div>
                      </div>
                    </div>

                    {/* Pie Chart */}
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={preparePieChartData(detailedReport.qualitativeReport.summary)}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {preparePieChartData(detailedReport.qualitativeReport.summary).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [value, 'Comments']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Insights</h4>
                      <p className="text-gray-700 mt-1">{detailedReport.qualitativeReport.insights || 'No insights available'}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Recommendations</h4>
                      <p className="text-gray-700 mt-1">{detailedReport.qualitativeReport.recommendations || 'No recommendations available'}</p>
                    </div>

                    {/* Comments Breakdown */}
                    {(detailedReport.qualitativeReport.comments?.positive?.length > 0 ||
                      detailedReport.qualitativeReport.comments?.neutral?.length > 0 ||
                      detailedReport.qualitativeReport.comments?.negative?.length > 0) && (
                      <div className="space-y-6">
                        <h4 className="font-medium text-gray-900">Comments Breakdown</h4>

                        {/* Positive Comments */}
                        {detailedReport.qualitativeReport.comments?.positive?.length > 0 && (
                          <div className="border-l-4 border-green-500 pl-4">
                            <h5 className="font-medium text-green-700 mb-2">Positive Comments ({detailedReport.qualitativeReport.comments.positive.length})</h5>
                            <div className="space-y-2">
                              {detailedReport.qualitativeReport.comments.positive.map((comment, index) => (
                                <div key={index} className="bg-green-50 p-3 rounded text-sm text-gray-700">
                                  "{comment}"
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Neutral Comments */}
                        {detailedReport.qualitativeReport.comments?.neutral?.length > 0 && (
                          <div className="border-l-4 border-yellow-500 pl-4">
                            <h5 className="font-medium text-yellow-700 mb-2">Neutral Comments ({detailedReport.qualitativeReport.comments.neutral.length})</h5>
                            <div className="space-y-2">
                              {detailedReport.qualitativeReport.comments.neutral.map((comment, index) => (
                                <div key={index} className="bg-yellow-50 p-3 rounded text-sm text-gray-700">
                                  "{comment}"
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Negative Comments */}
                        {detailedReport.qualitativeReport.comments?.negative?.length > 0 && (
                          <div className="border-l-4 border-red-500 pl-4">
                            <h5 className="font-medium text-red-700 mb-2">Negative Comments ({detailedReport.qualitativeReport.comments.negative.length})</h5>
                            <div className="space-y-2">
                              {detailedReport.qualitativeReport.comments.negative.map((comment, index) => (
                                <div key={index} className="bg-red-50 p-3 rounded text-sm text-gray-700">
                                  "{comment}"
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quantitative Analysis */}
              {detailedReport.quantitativeReport && (
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Quantitative Analysis</h3>

                  <div className="space-y-6">
                    {/* Bar Chart for Ratings Comparison */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Average Rating Comparison</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={prepareBarChartData(detailedReport.quantitativeReport)}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis domain={[0, 5]} />
                            <Tooltip formatter={(value) => [value?.toFixed(2), 'Average Rating']} />
                            <Legend />
                            <Bar dataKey="rating" fill="#3B82F6" name="Average Rating" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Detailed Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Current Year ({detailedReport.quantitativeReport.currentYear?.year})</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Average Rating:</span>
                            <span className="font-semibold text-lg">{detailedReport.quantitativeReport.currentYear?.averageRating?.toFixed(2) || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Responses:</span>
                            <span className="font-semibold">{detailedReport.quantitativeReport.currentYear?.responseCount || 0}</span>
                          </div>
                          {detailedReport.quantitativeReport.currentYear?.medianRating && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Median Rating:</span>
                              <span className="font-semibold">{detailedReport.quantitativeReport.currentYear.medianRating}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Previous Year ({detailedReport.quantitativeReport.previousYear?.year})</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Average Rating:</span>
                            <span className="font-semibold text-lg">{detailedReport.quantitativeReport.previousYear?.averageRating?.toFixed(2) || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Responses:</span>
                            <span className="font-semibold">{detailedReport.quantitativeReport.previousYear?.responseCount || 0}</span>
                          </div>
                          {detailedReport.quantitativeReport.previousYear?.medianRating && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Median Rating:</span>
                              <span className="font-semibold">{detailedReport.quantitativeReport.previousYear.medianRating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
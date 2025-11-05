import { useState, useEffect, useCallback } from 'react';
import { Search, ArrowUp, ArrowDown } from 'lucide-react';
import PSASLayout from '../../components/psas/PSASLayout';
import { useAuth } from '../../contexts/useAuth';
import QuantitativeRatings from '../reports/QuantitativeRatings';
import QualitativeComments from '../reports/QualitativeComments';
import PositiveComments from '../reports/PositiveComments';
import NegativeComments from '../reports/NegativeComments';
import NeutralComments from '../reports/NeutralComments';
import CompleteReport from '../reports/CompleteReport';

const ReportCard = ({ report, onSelect }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden group">
      <div className="relative">
        <img
          src={report.thumbnail}
          alt={report.title}
          className="w-full h-40 object-cover"
        />
        <div className="absolute inset-0 bg-[#DEDFE0] bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => onSelect(report)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            View Report
          </button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-gray-800 font-semibold text-center">
          {report.title}
        </h3>
        <div className="mt-2 text-sm text-gray-600 text-center">
          <p>{formatDate(report.eventDate)}</p>
          <p>{report.feedbackCount} responses</p>
        </div>
      </div>
    </div>
  );
};

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const [view, setView] = useState('list'); // 'list', 'dashboard', 'quantitative', ...
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events/reports/all', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.status}`);
      }
      const data = await response.json();
      setReports(data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleSelectReport = (report) => {
    setSelectedReport(report);
    setView('dashboard');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedReport(null);
  }

  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortOrder === 'asc') {
      return new Date(a.eventDate) - new Date(b.eventDate);
    }
    return new Date(b.eventDate) - new Date(a.eventDate);
  });

  if (loading) {
    return (
      <PSASLayout>
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PSASLayout>
    );
  }

  if (error) {
    return (
      <PSASLayout>
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-red-600 text-center">
            <p className="text-lg font-semibold">Error loading reports</p>
            <p>{error}</p>
            <button
              onClick={fetchReports}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </PSASLayout>
    );
  }

  return (
    <PSASLayout>
      {view === 'list' && (
        <div className="p-8 bg-gray-100 min-h-full">
          {/* Search and Sort Bar */}
          <div className="flex items-center mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="relative">
                <button
                  onClick={handleSort}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition"
                >
                  {sortOrder === 'asc' ? (
                    <ArrowUp className="w-5 h-5 text-gray-600 mr-2" />
                  ) : (
                    <ArrowDown className="w-5 h-5 text-gray-600 mr-2" />
                  )}
                  <span>Sort</span>
                </button>
              </div>
            </div>
          </div>

          {/* Reports Grid */}
          <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {sortedReports.map(report => (
                      <ReportCard key={report.id} report={report} onSelect={handleSelectReport} />
                  ))}
              </div>
          </div>
        </div>
      )}

      {view === 'dashboard' && selectedReport && (
        <CompleteReport report={selectedReport} onBack={handleBackToList} />
      )}
      {view === 'quantitative' && selectedReport && (
        <QuantitativeRatings report={selectedReport} onBack={() => setView('dashboard')} />
      )}
      {view === 'qualitative' && selectedReport && (
        <QualitativeComments report={selectedReport} onBack={() => setView('dashboard')} />
      )}
      {view === 'positive' && selectedReport && (
        <PositiveComments report={selectedReport} onBack={() => setView('dashboard')} />
      )}
      {view === 'negative' && selectedReport && (
        <NegativeComments report={selectedReport} onBack={() => setView('dashboard')} />
      )}
      {view === 'neutral' && selectedReport && (
        <NeutralComments report={selectedReport} onBack={() => setView('dashboard')} />
      )}
    </PSASLayout>
  );
};

export default Reports;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, BarChart2, Users, Activity, Database, Download, Search } from 'lucide-react';
import { useAuth } from '../../contexts/useAuth';

function MisReports() {
  const { token } = useAuth();
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('all');

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        console.log('Fetching MIS reports...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock report data
        const mockReports = [
          {
            id: 1,
            title: 'System Usage Report',
            type: 'system',
            date: '2024-01-15',
            size: '2.3 MB',
            generatedBy: 'System',
            description: 'Comprehensive system usage statistics and trends'
          },
          {
            id: 2,
            title: 'User Activity Report',
            type: 'user',
            date: '2024-01-10',
            size: '1.8 MB',
            generatedBy: 'System',
            description: 'Detailed user activity and engagement metrics'
          },
          {
            id: 3,
            title: 'Security Audit Report',
            type: 'security',
            date: '2024-01-05',
            size: '1.5 MB',
            generatedBy: 'System',
            description: 'Security events and audit logs'
          },
          {
            id: 4,
            title: 'Performance Report',
            type: 'system',
            date: '2023-12-20',
            size: '3.1 MB',
            generatedBy: 'System',
            description: 'System performance metrics and optimization suggestions'
          },
          {
            id: 5,
            title: 'Data Integrity Report',
            type: 'data',
            date: '2023-12-15',
            size: '2.7 MB',
            generatedBy: 'System',
            description: 'Database integrity checks and validation results'
          }
        ];

        setReports(mockReports);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [token]);

  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getReportIcon = (type) => {
    switch (type) {
      case 'system': return <BarChart2 className="w-5 h-5 text-blue-600" />;
      case 'user': return <Users className="w-5 h-5 text-green-600" />;
      case 'security': return <Database className="w-5 h-5 text-red-600" />;
      case 'data': return <Database className="w-5 h-5 text-purple-600" />;
      default: return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getReportTypeLabel = (type) => {
    switch (type) {
      case 'system': return 'System Report';
      case 'user': return 'User Report';
      case 'security': return 'Security Report';
      case 'data': return 'Data Report';
      default: return 'General Report';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">System Reports</h1>
            <p className="text-gray-600 mt-1">Comprehensive system analytics and generated reports</p>
          </div>
          <Link
            to="/mis/reports/generate"
            className="bg-blue-950 hover:bg-blue-900 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Generate New Report
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="month">Last Month</option>
            <option value="week">Last Week</option>
            <option value="day">Last 24 Hours</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">No reports found matching your criteria.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setTimeRange('all');
            }}
            className="mt-4 text-blue-600 hover:text-blue-800 text-sm"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {getReportIcon(report.type)}
                        <div>
                          <div className="font-medium text-gray-900">{report.title}</div>
                          <div className="text-xs text-gray-500">{report.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.type === 'system' ? 'bg-blue-100 text-blue-800' :
                        report.type === 'user' ? 'bg-green-100 text-green-800' :
                        report.type === 'security' ? 'bg-red-100 text-red-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {getReportTypeLabel(report.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-600">{report.date}</div>
                      <div className="text-xs text-gray-400">Generated by {report.generatedBy}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-600">{report.size}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/mis/reports/${report.id}`}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100"
                          title="View Report"
                        >
                          <FileText className="w-4 h-4" />
                        </Link>
                        <button
                          className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-100"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition">
          <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
            <BarChart2 className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">System Reports</h3>
          <p className="text-gray-600 text-sm mb-3">Performance, usage, and system health reports</p>
          <Link
            to="/mis/reports/system"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition">
          <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">User Reports</h3>
          <p className="text-gray-600 text-sm mb-3">User activity, engagement, and behavior analytics</p>
          <Link
            to="/mis/reports/users"
            className="text-green-600 hover:text-green-800 text-sm font-medium"
          >
            View All →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition">
          <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Database className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">Security Reports</h3>
          <p className="text-gray-600 text-sm mb-3">Security audits, access logs, and vulnerability scans</p>
          <Link
            to="/mis/reports/security"
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            View All →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition">
          <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Activity className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">Activity Reports</h3>
          <p className="text-gray-600 text-sm mb-3">System events, changes, and audit trails</p>
          <Link
            to="/mis/reports/activity"
            className="text-purple-600 hover:text-purple-800 text-sm font-medium"
          >
            View All →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default MisReports;
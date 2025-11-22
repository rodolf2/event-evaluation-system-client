import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  RefreshCw,
  Settings,
  TrendingUp,
  MessageSquare,
  Filter,
} from "lucide-react";
import PSASLayout from "../../components/psas/PSASLayout";
import ReportHeader from "./ReportHeader";
import ReportDescription from "./ReportDescription";
import ReportActions from "./ReportActions";
import { useDynamicReportData } from "../../hooks/useDynamicReportData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

// Dynamic Chart Components
const DynamicBarChart = ({ data, title, subtitle, loading = false }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div>
      <h5 className="text-lg font-semibold text-center mb-2">{title}</h5>
      {subtitle && (
        <p className="text-center text-sm text-gray-500 mb-4">{subtitle}</p>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" width={100} />
          <Tooltip />
          <Bar dataKey="value" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const DynamicPieChart = ({ data, title, subtitle, loading = false }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div>
      <h5 className="text-lg font-semibold text-center mb-2">{title}</h5>
      {subtitle && (
        <p className="text-center text-sm text-gray-500 mb-4">{subtitle}</p>
      )}
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const CommentSection = ({
  title,
  comments,
  loading = false,
  type = "neutral",
}) => {
  const getBorderColor = () => {
    switch (type) {
      case "positive":
        return "border-green-500";
      case "negative":
        return "border-red-500";
      case "neutral":
        return "border-yellow-500";
      default:
        return "border-gray-500";
    }
  };

  const getBgColor = () => {
    switch (type) {
      case "positive":
        return "bg-green-50";
      case "negative":
        return "bg-red-50";
      case "neutral":
        return "bg-yellow-50";
      default:
        return "bg-gray-50";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No comments found</p>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-gray-600 mb-6">
        Total {title}: {comments.length}
      </p>
      <div className="space-y-4">
        {comments.map((comment, index) => (
          <div
            key={comment.id || index}
            className={`${getBgColor()} border-l-4 ${getBorderColor()} p-4 rounded-r-lg`}
          >
            <p className="text-gray-800">{comment.comment}</p>
            {comment.user && (
              <p className="text-xs text-gray-500 mt-2">
                — {comment.user}
                {comment.department && `, ${comment.department}`}
                {comment.yearLevel && `, ${comment.yearLevel}`}
              </p>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

const CompleteReport = ({ report, onBack }) => {
  const navigate = useNavigate();
  const { eventId } = useParams(); // Get eventId from URL if not provided as prop
  const [showFilters, setShowFilters] = useState(false);

  const reportId = report?.id || eventId;

  // Use dynamic data hook
  const {
    quantitativeData,
    qualitativeData,
    loading,
    error,
    lastUpdated,
    filters,
    updateFilters,
    applyFilters,
    refreshData,
  } = useDynamicReportData(reportId);

  // If rendered as child component (with props), don't use PSASLayout
  // If accessed via direct routing (no props), use PSASLayout
  const isChildComponent = report && onBack;

  const handleBackClick = () => {
    if (isChildComponent) {
      onBack();
    } else {
      navigate("/psas/reports");
    }
  };

  const SectionWrapper = ({ title, children, showLiveIndicator = false }) => (
    <div className="section-page">
      <div className="bg-white">
        <ReportHeader
          title={`${title} - ${report?.title || "Event Evaluation Report"}`}
        />
        <ReportDescription title={report?.title} />
        <main className="p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold">
              {report?.title || "EVENT EVALUATION REPORT"}
            </h3>
            <p className="text-xl font-semibold">EVALUATION RESULT</p>
            <p className="text-lg">College Level</p>
            <h4 className="text-xl font-bold mt-4">{title}</h4>
            {showLiveIndicator && lastUpdated && (
              <div className="flex items-center justify-center gap-2 mt-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>
                  Live Data - Last updated:{" "}
                  {new Date(lastUpdated).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
          {children}
        </main>
        <div className="bg-blue-900 text-white text-center py-4">
          <p>
            MacArthur Highway, Sampaloc, Apalit, Pampanga 2016 |
            info@laverdad.edu.ph
          </p>
        </div>
      </div>
    </div>
  );

  const FilterPanel = () => {
    if (!showFilters) return null;

    return (
      <div className="bg-gray-50 p-4 rounded-lg mb-6 border">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700">
            Dynamic Filters
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <div className="space-y-2">
              <input
                type="date"
                value={filters.startDate || ""}
                onChange={(e) => updateFilters({ startDate: e.target.value })}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
              />
              <input
                type="date"
                value={filters.endDate || ""}
                onChange={(e) => updateFilters({ endDate: e.target.value })}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Rating Filter
            </label>
            <select
              value={filters.ratingFilter || ""}
              onChange={(e) => updateFilters({ ratingFilter: e.target.value })}
              className="w-full text-xs border border-gray-300 rounded px-2 py-1"
            >
              <option value="">All Ratings</option>
              <option value="4-5">4.0 - 5.0 (Excellent)</option>
              <option value="3-4">3.0 - 4.0 (Good)</option>
              <option value="2-3">2.0 - 3.0 (Fair)</option>
              <option value="1-2">1.0 - 2.0 (Poor)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Sentiment
            </label>
            <select
              value={filters.sentiment || "all"}
              onChange={(e) => updateFilters({ sentiment: e.target.value })}
              className="w-full text-xs border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={applyFilters}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition"
          >
            Apply Filters
          </button>
          <button
            onClick={() => {
              updateFilters({
                startDate: "",
                endDate: "",
                ratingFilter: "",
                sentiment: "all",
                keyword: "",
              });
              applyFilters();
            }}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-300 transition"
          >
            Clear All
          </button>
        </div>
      </div>
    );
  };

  const content = (
    <>
      <ReportActions onBackClick={handleBackClick} />
      <div className="bg-gray-100 min-h-screen report-print-content print:block">
        <div className="container mx-auto py-8">
          {/* Live Data Controls */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4 print:hidden">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <button
                onClick={refreshData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh Data
              </button>
            </div>

            {quantitativeData?.metrics && (
              <div className="flex items-center gap-4 text-sm print:hidden">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>
                    Avg: {quantitativeData.metrics.averageRating.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                  <span>
                    {quantitativeData.metrics.totalResponses} responses
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="print:hidden">
            <FilterPanel />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">
                Error loading data: {error}
              </p>
              <button
                onClick={refreshData}
                className="mt-2 text-red-700 underline text-sm hover:text-red-800"
              >
                Retry
              </button>
            </div>
          )}

          {/* Quantitative Ratings Section */}
          <SectionWrapper title="Quantitative Ratings" showLiveIndicator={true}>
            <div className="grid grid-cols-1 print:grid-cols-1 md:grid-cols-2 print:space-y-8 print:block gap-8 mb-12">
              <div className="print:mb-8">
                <DynamicBarChart
                  data={quantitativeData?.charts?.yearData}
                  title="Current Year Data"
                  subtitle={`${
                    quantitativeData?.metrics?.totalResponses || 0
                  } Responses`}
                  loading={loading}
                />
              </div>
              <div>
                <DynamicPieChart
                  data={quantitativeData?.charts?.ratingDistribution}
                  title="Rating Distribution"
                  subtitle="How clearly were the examples explained?"
                  loading={loading}
                />
              </div>
            </div>
          </SectionWrapper>

          {/* Qualitative Comments Section */}
          <SectionWrapper title="Qualitative Comments" showLiveIndicator={true}>
            <CommentSection
              title="Qualitative Comments"
              comments={qualitativeData?.categorizedComments?.positive || []}
              loading={loading}
              type="neutral"
            />
          </SectionWrapper>

          {/* Positive Comments Section */}
          <SectionWrapper title="Positive Comments" showLiveIndicator={true}>
            <CommentSection
              title="Positive Comments"
              comments={qualitativeData?.categorizedComments?.positive || []}
              loading={loading}
              type="positive"
            />
          </SectionWrapper>

          {/* Neutral Comments Section */}
          <SectionWrapper title="Neutral Comments" showLiveIndicator={true}>
            <CommentSection
              title="Neutral Comments"
              comments={qualitativeData?.categorizedComments?.neutral || []}
              loading={loading}
              type="neutral"
            />
          </SectionWrapper>

          {/* Negative Comments Section */}
          <SectionWrapper title="Negative Comments" showLiveIndicator={true}>
            <CommentSection
              title="Negative Comments"
              comments={qualitativeData?.categorizedComments?.negative || []}
              loading={loading}
              type="negative"
            />
          </SectionWrapper>
        </div>
      </div>
    </>
  );

  // Only wrap with PSASLayout if accessed via direct routing (no props)
  if (isChildComponent) {
    return content;
  }

  return <PSASLayout>{content}</PSASLayout>;
};

export default CompleteReport;

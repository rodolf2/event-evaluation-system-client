import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import PSASLayout from "../../components/psas/PSASLayout";
import ClubOfficerLayout from "../../components/club-officers/ClubOfficerLayout";
import ReportHeader from "./ReportHeader";
import ReportDescription from "./ReportDescription";
import ReportActions from "./ReportActions";
import { ReportPageFooter } from "./ReportHeaderFooter";
import { useDynamicReportData } from "../../hooks/useDynamicReportData";
import { useAuth } from "../../contexts/useAuth";
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
          <Bar dataKey="value" fill="#3B82F6" isAnimationActive={false} />
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
            isAnimationActive={false}
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
  const [currentPage, setCurrentPage] = React.useState(1);
  const commentsPerPage = 10;

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
      <div className="text-center py-8 text-gray-500 print:hidden">
        <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No comments found</p>
      </div>
    );
  }

  // Calculate pagination
  const totalPages = Math.ceil(comments.length / commentsPerPage);
  const startIndex = (currentPage - 1) * commentsPerPage;
  const endIndex = startIndex + commentsPerPage;
  const currentComments = comments.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <>
      {type !== "neutral" && (
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-gray-600">
            Total {title}: {comments.length} | Page {currentPage} of{" "}
            {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {(type === "neutral" ? comments : currentComments).map(
          (comment, index) => (
            <div
              key={
                comment.id || (type === "neutral" ? index : startIndex + index)
              }
              className="flex gap-2"
            >
              <span className="text-gray-600 mt-1">•</span>
              <p className="text-gray-800 flex-1">{comment.comment}</p>
            </div>
          )
        )}
      </div>
    </>
  );
};

const CompleteReport = ({
  report,
  onBack,
  isGeneratedReport = false,
  isGuestView = false,
  onShareGuest,
}) => {
  const navigate = useNavigate();
  const { eventId } = useParams(); // Get eventId from URL if not provided as prop
  const { user } = useAuth();

  const reportId = report?.formId || eventId;

  // Use dynamic data hook
  const {
    quantitativeData,
    qualitativeData,
    formData,
    loading,
    error,
    lastUpdated,
    refreshData,
  } = useDynamicReportData(reportId);

  // If rendered as child component (with props) or as guest view, don't use PSASLayout
  // If accessed via direct routing (no props), use PSASLayout
  const isChildComponent = (report && onBack) || isGuestView;

  const handleBackClick = () => {
    if (isChildComponent) {
      onBack();
    } else {
      // Navigate to appropriate reports page based on user role
      const reportsPath =
        user?.role === "club-officer"
          ? "/club-officer/reports"
          : "/psas/reports";
      navigate(reportsPath);
    }
  };

  const SectionWrapper = ({ title, children, showLiveIndicator = false }) => (
    <div className="section-page mb-8">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden p-8">
        <div className="text-center mb-8">
          <h4 className="text-lg font-bold">{title}</h4>
        </div>
        {children}
      </div>
    </div>
  );

  // Helper to get year data
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;
  const currentYearData =
    quantitativeData?.charts?.yearData?.find(
      (d) => d.name === String(currentYear)
    )?.value || 0;
  const previousYearData =
    quantitativeData?.charts?.yearData?.find(
      (d) => d.name === String(previousYear)
    )?.value || 0;

  const maxResponseCount = Math.max(currentYearData, previousYearData, 1);

  // Helper to get sentiment data
  const sentiment = qualitativeData?.sentimentBreakdown || {
    positive: { percentage: 0 },
    neutral: { percentage: 0 },
    negative: { percentage: 0 },
  };
  const sentimentData = [
    {
      name: "Positive",
      value: sentiment.positive?.percentage || 0,
      color: "#3B82F6",
    },
    {
      name: "Neutral",
      value: sentiment.neutral?.percentage || 0,
      color: "#9CA3AF",
    },
    {
      name: "Negative",
      value: sentiment.negative?.percentage || 0,
      color: "#EF4444",
    },
  ].filter((d) => d.value > 0);

  // Helper to extract common themes from comments
  const extractThemes = (comments, type) => {
    if (!comments || comments.length === 0) return [];

    const keywords = {
      positive: [
        "good",
        "great",
        "excellent",
        "amazing",
        "wonderful",
        "fantastic",
        "love",
        "like",
        "best",
        "awesome",
        "perfect",
        "satisfied",
        "happy",
        "pleased",
        "enjoyed",
        "fun",
        "informative",
        "helpful",
        "engaging",
        "interesting",
        "venue",
        "speaker",
        "attentive",
      ],
      negative: [
        "bad",
        "terrible",
        "awful",
        "horrible",
        "hate",
        "dislike",
        "worst",
        "disappointed",
        "unsatisfied",
        "sad",
        "angry",
        "frustrated",
        "poor",
        "fail",
        "boring",
        "long",
        "time consuming",
        "improve",
        "better",
        "lacking",
        "confusing",
      ],
    };

    const themes = {};
    const targetKeywords = keywords[type] || [];

    comments.forEach((comment) => {
      const text = (comment.comment || "").toLowerCase();
      targetKeywords.forEach((keyword) => {
        if (text.includes(keyword)) {
          themes[keyword] = (themes[keyword] || 0) + 1;
        }
      });
    });

    // Get top 3 themes
    return Object.entries(themes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([keyword]) => keyword);
  };

  // Generate dynamic summary text
  const generateSummary = (type) => {
    const comments = qualitativeData?.categorizedComments?.[type] || [];
    const count = comments.length;

    if (count === 0) {
      return `No ${type} feedback was received.`;
    }

    const themes = extractThemes(comments, type);

    if (type === "positive") {
      const themeText =
        themes.length > 0
          ? `citing ${themes.slice(0, 2).join(" and ")} experience`
          : "citing good overall experience";
      return `of the responses resulted to positive ${themeText} such as the venue, speakers, and overall event experience.`;
    } else if (type === "neutral") {
      return `of the responses resulted into neutral, providing balanced feedback without strong positive or negative sentiments.`;
    } else if (type === "negative") {
      const themeText =
        themes.length > 0
          ? `particularly regarding ${themes.slice(0, 2).join(" and ")}`
          : "regarding various aspects";
      return `of the responses resulted into negative ${themeText}, suggesting areas that need improvement.`;
    }

    return "";
  };

  // Generate dynamic insights and recommendations
  const generateInsights = () => {
    const positiveComments =
      qualitativeData?.categorizedComments?.positive || [];
    const negativeComments =
      qualitativeData?.categorizedComments?.negative || [];
    const neutralComments = qualitativeData?.categorizedComments?.neutral || [];

    const positiveThemes = extractThemes(positiveComments, "positive");
    const negativeThemes = extractThemes(negativeComments, "negative");

    const insights = [];

    // Overall satisfaction analysis
    const positivePercentage = sentiment.positive?.percentage || 0;
    const neutralPercentage = sentiment.neutral?.percentage || 0;
    const negativePercentage = sentiment.negative?.percentage || 0;
    const totalResponses =
      positiveComments.length +
      negativeComments.length +
      neutralComments.length;

    // Heading with overall assessment
    if (positivePercentage > 70) {
      insights.push(
        `★ Overall Event Success: With ${positivePercentage.toFixed(
          0
        )}% positive feedback from ${totalResponses} responses, the event was highly successful. This strong approval rate indicates excellent execution and participant satisfaction.`
      );
    } else if (positivePercentage >= 50) {
      insights.push(
        `★ Moderate Success: The event received ${positivePercentage.toFixed(
          0
        )}% positive feedback from ${totalResponses} responses. While generally well-received, there is room for improvement to achieve excellence.`
      );
    } else {
      insights.push(
        `★ Needs Significant Improvement: With only ${positivePercentage.toFixed(
          0
        )}% positive feedback from ${totalResponses} responses, substantial changes are needed for future events.`
      );
    }

    // Analyze positive feedback for strengths
    if (positiveThemes.length > 0 && positiveComments.length > 0) {
      const strengthText = positiveThemes.slice(0, 3).join(", ");
      insights.push(
        `• Strengths to Maintain: Participants particularly appreciated ${strengthText}. These elements received ${positiveComments.length} positive mentions and should be prioritized in future planning.`
      );
    }

    // Analyze negative feedback for specific improvements
    if (negativeThemes.length > 0 && negativeComments.length > 0) {
      const improvementAreas = negativeThemes.slice(0, 3);
      const concernText = improvementAreas.join(", ");

      insights.push(
        `• Areas Requiring Attention: ${negativeComments.length} responses highlighted concerns about ${concernText}. These areas should be prioritized for improvement.`
      );

      // Specific recommendations based on themes
      if (
        improvementAreas.some((theme) =>
          ["time consuming", "long", "boring"].includes(theme)
        )
      ) {
        insights.push(
          `• Recommendation - Engagement: Consider reducing session duration, incorporating interactive activities, and adding breaks to maintain participant attention and energy levels.`
        );
      }

      if (
        improvementAreas.some((theme) =>
          ["confusing", "unclear", "lacking"].includes(theme)
        )
      ) {
        insights.push(
          `• Recommendation - Clarity: Improve communication of event objectives, provide clearer instructions, and ensure materials are well-organized and accessible.`
        );
      }

      if (
        improvementAreas.some((theme) =>
          ["venue", "location", "space"].includes(theme)
        )
      ) {
        insights.push(
          `• Recommendation - Facilities: Review venue selection criteria, ensuring adequate space, comfort, and accessibility for all participants.`
        );
      }
    }

    // Neutral feedback analysis
    if (neutralPercentage > 30) {
      insights.push(
        `• Neutral Feedback (${neutralPercentage.toFixed(
          0
        )}%): A significant portion of responses were neutral, suggesting the event met basic expectations but didn't exceed them. Focus on creating more memorable and impactful experiences.`
      );
    }

    // Action items based on overall assessment
    if (negativePercentage > 30) {
      insights.push(
        `⚠ Urgent Action Required: With ${negativePercentage.toFixed(
          0
        )}% negative feedback, conduct a comprehensive post-event review meeting with stakeholders to address systemic issues before the next event.`
      );
    } else if (negativePercentage > 15) {
      insights.push(
        `• Improvement Opportunity: ${negativePercentage.toFixed(
          0
        )}% negative feedback indicates specific areas need attention. Gather follow-up feedback to understand root causes and implement targeted improvements.`
      );
    }

    // Success recommendation
    if (positivePercentage > 70 && negativePercentage < 15) {
      insights.push(
        `✓ Continue Current Approach: The high satisfaction rate indicates successful event planning and execution. Document current practices as a template for future events while remaining open to innovation.`
      );
    }

    // Default insight if no specific themes found
    if (insights.length === 0) {
      insights.push(
        `Based on ${totalResponses} evaluation responses, continue monitoring participant feedback to identify areas for enhancement and maintain event quality. Consider implementing more detailed feedback mechanisms for future events.`
      );
    }

    return insights;
  };

  const content = (
    <>
      {!isGuestView && (
        <ReportActions
          onBackClick={handleBackClick}
          eventId={reportId}
          isGeneratedReport={isGeneratedReport}
          onShareGuest={onShareGuest}
          loading={loading}
        />
      )}
      <div className="bg-gray-100 min-h-screen report-print-content print:block p-8">
        <div className="container mx-auto max-w-5xl">
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

          {/* Report Header and Description - appears only once at top */}
          <div
            id="report-header-block"
            className="bg-white rounded-lg shadow-sm overflow-hidden mb-8"
          >
            <ReportHeader />
            <ReportDescription
              title={formData?.title || "Sample Event Evaluation Report"}
            />
            <div className="p-8 text-center">
              <h3 className="text-xl font-bold mb-2">
                {formData?.title || "EVENT EVALUATION REPORT"}
              </h3>
              <p className="text-lg font-bold">EVALUATION RESULT</p>
              <p className="text-base">College Level</p>
            </div>
          </div>

          {/* Quantitative Ratings Section */}
          <SectionWrapper title="Quantitative Ratings" showLiveIndicator={true}>
            {/* Year Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
              {/* Previous Year */}
              <div>
                <h5 className="font-bold text-lg mb-1">
                  Higher Education Department {previousYear}
                </h5>
                <p className="text-sm text-gray-500 mb-4">
                  {previousYearData} Responses
                </p>
                {/* Mocking bars for visual similarity since we don't have year level breakdown yet */}
                <div className="space-y-3">
                  <div className="w-full bg-blue-100 rounded-r-full h-8 relative">
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium text-blue-800">
                      Total Responses
                    </div>
                    <div
                      className="bg-blue-600 h-8 rounded-r-full flex items-center justify-end px-2 text-white text-xs transition-all duration-500"
                      style={{
                        width: `${
                          (previousYearData / maxResponseCount) * 100
                        }%`,
                        minWidth: "2rem",
                      }}
                    >
                      {previousYearData}
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Year */}
              <div>
                <h5 className="font-bold text-lg mb-1">
                  Higher Education Department {currentYear}
                </h5>
                <p className="text-sm text-gray-500 mb-4">
                  {currentYearData} Responses
                </p>
                <div className="space-y-3">
                  <div className="w-full bg-blue-100 rounded-r-full h-8 relative">
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium text-blue-800">
                      Total Responses
                    </div>
                    <div
                      className="bg-blue-600 h-8 rounded-r-full flex items-center justify-end px-2 text-white text-xs transition-all duration-500"
                      style={{
                        width: `${(currentYearData / maxResponseCount) * 100}%`,
                        minWidth: "2rem",
                      }}
                    >
                      {currentYearData}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Per-Question Visualizations */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : !qualitativeData?.questionBreakdown ||
              qualitativeData.questionBreakdown.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                <p>No question data available</p>
              </div>
            ) : (
              <div className="space-y-12">
                {qualitativeData.questionBreakdown.map((question, idx) => (
                  <div
                    key={question.questionId || idx}
                    className="border-b border-gray-200 pb-8 last:border-0"
                  >
                    <h5 className="text-lg font-bold mb-1">
                      {idx + 1}. {question.questionTitle}
                    </h5>
                    <p className="text-sm text-gray-500 mb-6">
                      {question.responseCount} responses
                    </p>

                    {/* Scale Question - Rating Distribution */}
                    {question.questionType === "scale" &&
                      question.ratingDistribution && (
                        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                          <div className="w-48 h-48">
                            <ResponsiveContainer width="100%" height={192}>
                              <PieChart>
                                <Pie
                                  data={question.ratingDistribution.filter(
                                    (d) => d.count > 0
                                  )}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={0}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="count"
                                  labelLine={false}
                                  label={({ percent }) =>
                                    percent > 0.05
                                      ? `${(percent * 100).toFixed(0)}%`
                                      : ""
                                  }
                                  isAnimationActive={false}
                                >
                                  {question.ratingDistribution.map(
                                    (entry, index) => (
                                      <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                      />
                                    )
                                  )}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="space-y-2">
                            {question.ratingDistribution.map((entry, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-3"
                              >
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor:
                                      COLORS[index % COLORS.length],
                                  }}
                                ></div>
                                <span className="text-sm text-gray-700">
                                  {entry.name}: {entry.count} ({entry.value}%)
                                </span>
                              </div>
                            ))}
                            <p className="text-sm font-medium text-gray-800 mt-2">
                              Average:{" "}
                              {question.averageRating?.toFixed(2) || "N/A"} / 5
                            </p>
                          </div>
                        </div>
                      )}

                    {/* Text Question - Sentiment Breakdown */}
                    {(question.questionType === "paragraph" ||
                      question.questionType === "short_answer") &&
                      question.sentimentBreakdown && (
                        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                          <div className="w-48 h-48">
                            <ResponsiveContainer width="100%" height={192}>
                              <PieChart>
                                <Pie
                                  data={[
                                    {
                                      name: "Positive",
                                      value:
                                        question.sentimentBreakdown.positive
                                          ?.count || 0,
                                      color: "#3B82F6",
                                    },
                                    {
                                      name: "Neutral",
                                      value:
                                        question.sentimentBreakdown.neutral
                                          ?.count || 0,
                                      color: "#9CA3AF",
                                    },
                                    {
                                      name: "Negative",
                                      value:
                                        question.sentimentBreakdown.negative
                                          ?.count || 0,
                                      color: "#EF4444",
                                    },
                                  ].filter((d) => d.value > 0)}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={0}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                  labelLine={false}
                                  label={({ percent }) =>
                                    percent > 0.05
                                      ? `${(percent * 100).toFixed(0)}%`
                                      : ""
                                  }
                                  isAnimationActive={false}
                                >
                                  {[
                                    { color: "#3B82F6" },
                                    { color: "#9CA3AF" },
                                    { color: "#EF4444" },
                                  ].map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={entry.color}
                                    />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                              <span className="text-sm text-gray-700">
                                Positive:{" "}
                                {question.sentimentBreakdown.positive?.count ||
                                  0}{" "}
                                (
                                {question.sentimentBreakdown.positive
                                  ?.percentage || 0}
                                %)
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                              <span className="text-sm text-gray-700">
                                Neutral:{" "}
                                {question.sentimentBreakdown.neutral?.count ||
                                  0}{" "}
                                (
                                {question.sentimentBreakdown.neutral
                                  ?.percentage || 0}
                                %)
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full bg-red-500"></div>
                              <span className="text-sm text-gray-700">
                                Negative:{" "}
                                {question.sentimentBreakdown.negative?.count ||
                                  0}{" "}
                                (
                                {question.sentimentBreakdown.negative
                                  ?.percentage || 0}
                                %)
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Multiple Choice - Option Distribution */}
                    {question.questionType === "multiple_choice" &&
                      question.optionDistribution && (
                        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                          <div className="w-48 h-48">
                            <ResponsiveContainer width="100%" height={192}>
                              <PieChart>
                                <Pie
                                  data={question.optionDistribution.filter(
                                    (d) => d.count > 0
                                  )}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={0}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="count"
                                  labelLine={false}
                                  label={({ percent }) =>
                                    percent > 0.05
                                      ? `${(percent * 100).toFixed(0)}%`
                                      : ""
                                  }
                                  isAnimationActive={false}
                                >
                                  {question.optionDistribution.map(
                                    (entry, index) => (
                                      <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                      />
                                    )
                                  )}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="space-y-2">
                            {question.optionDistribution.map((entry, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-3"
                              >
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor:
                                      COLORS[index % COLORS.length],
                                  }}
                                ></div>
                                <span className="text-sm text-gray-700">
                                  {entry.name}: {entry.count} ({entry.value}%)
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </SectionWrapper>

          {/* Qualitative Comments Section */}
          <SectionWrapper title="Qualitative Comments" showLiveIndicator={true}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-12">
              {/* Sentiment Pie Chart */}
              <div className="h-64">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : !sentimentData || sentimentData.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>No sentiment data available</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={256}>
                    <PieChart>
                      <Pie
                        data={sentimentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={0}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        labelLine={true}
                        label={({ percent }) =>
                          `${(percent * 100).toFixed(0)}%`
                        }
                        isAnimationActive={false}
                      >
                        {sentimentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Report Summary Text */}
              <div>
                <h5 className="text-lg font-bold mb-6 text-center md:text-left">
                  Report Summary
                </h5>

                {/* Legend */}
                <div className="flex gap-6 mb-8 justify-center md:justify-start">
                  {sentimentData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-600">
                        {entry.name}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-6 text-sm text-gray-800 leading-relaxed">
                  <p>
                    <span className="font-bold">
                      {sentiment.positive?.percentage || 0}%
                    </span>{" "}
                    {generateSummary("positive")}
                  </p>
                  <p>
                    <span className="font-bold">
                      {sentiment.neutral?.percentage || 0}%
                    </span>{" "}
                    {generateSummary("neutral")}
                  </p>
                  <p>
                    <span className="font-bold">
                      {sentiment.negative?.percentage || 0}%
                    </span>{" "}
                    {generateSummary("negative")}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-center text-sm font-medium text-gray-900 mb-12">
              Note: Breakdown of qualitative comments will be on the next page
            </p>

            {/* Event Insights */}
            <div className="mb-12">
              <h4 className="text-xl font-bold text-center mb-8">
                Event Insights and Recommendations
              </h4>
              <div className="space-y-6 text-gray-800 max-w-3xl mx-auto">
                {generateInsights().map((insight, index) => (
                  <p key={index}>{insight}</p>
                ))}
                <p className="font-medium mt-8">
                  Disclaimer: This is a system-generated recommendation,
                  decision is still up to the management for implementation
                </p>
              </div>
            </div>

            <div className="text-center font-bold text-gray-800 mt-16 mb-4">
              Thanks be to God!
            </div>
          </SectionWrapper>

          {/* Detailed Comments - Each type on its own page */}
          <SectionWrapper title="Qualitative Comments - Positive">
            <p className="text-gray-600 mb-6 text-center">
              These are the positive comments comprising the{" "}
              {sentiment.positive?.percentage || 0}% from the report summary
            </p>
            <CommentSection
              title="Positive Comments"
              comments={qualitativeData?.categorizedComments?.positive || []}
              loading={loading}
              type="positive"
            />
          </SectionWrapper>

          <SectionWrapper title="Qualitative Comments - Neutral">
            <p className="text-gray-600 mb-6 text-center">
              These are the neutral comments comprising the{" "}
              {sentiment.neutral?.percentage || 0}% from the report summary
            </p>
            <CommentSection
              title="Neutral Comments"
              comments={qualitativeData?.categorizedComments?.neutral || []}
              loading={loading}
              type="neutral"
            />
          </SectionWrapper>

          <SectionWrapper title="Qualitative Comments - Negative">
            <p className="text-gray-600 mb-6 text-center">
              These are the negative comments comprising the{" "}
              {sentiment.negative?.percentage || 0}% from the report summary
            </p>
            <CommentSection
              title="Negative Comments"
              comments={qualitativeData?.categorizedComments?.negative || []}
              loading={loading}
              type="negative"
            />
          </SectionWrapper>

          {/* Report Footer - appears only once at bottom */}
          <div
            id="report-footer-block"
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            <ReportPageFooter />
          </div>
        </div>
      </div>
    </>
  );

  // Only wrap with layout if accessed via direct routing (no props)
  // Guest view should never have a layout wrapper
  if (isChildComponent || isGuestView) {
    return content;
  }

  // Use appropriate layout based on user role
  if (user?.role === "club-officer") {
    return <ClubOfficerLayout>{content}</ClubOfficerLayout>;
  }

  return <PSASLayout>{content}</PSASLayout>;
};

export default CompleteReport;

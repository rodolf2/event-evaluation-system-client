import React from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import PSASLayout from "../../components/psas/PSASLayout";
import ClubOfficerLayout from "../../components/club-officers/ClubOfficerLayout";
import ClubAdviserLayout from "../../components/club-advisers/ClubAdviserLayout";
import ReportHeader from "./ReportHeader";
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

const COLORS = [
  "#3B82F6", // Blue (Positive)
  "#9CA3AF", // Gray (Neutral)
  "#EF4444", // Red (Negative)
  "#0088FE", // Blue
  "#00C49F", // Teal
  "#FFBB28", // Yellow
  "#FF8042", // Orange
  "#8884d8", // Purple
  "#FF6B6B", // Red
  "#4ECDC4", // Turquoise
  "#45B7D1", // Light Blue
  "#96CEB4", // Sage
  "#FFEEAD", // Pale Yellow
];

const SENTIMENT_COLORS = {
  positive: "#3B82F6",
  neutral: "#9CA3AF",
  negative: "#EF4444",
};

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      style={{ fontSize: "12px", fontWeight: "bold" }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

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
    <div className="print-chart-container">
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
    <div className="print-chart-container">
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
            label={renderCustomizedLabel}
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

  // Helper to extract text from comment object or string
  const getCommentText = (c) => {
    if (!c) return "";
    if (typeof c === "string") return c;
    return c.comment || c.text || "";
  };

  // Deduplicate comments based on comment text to prevent visual duplicates
  const uniqueComments = comments.filter(
    (comment, index, self) =>
      index ===
      self.findIndex((c) => getCommentText(c) === getCommentText(comment)),
  );

  return (
    <>
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Total Unique {title}: {uniqueComments.length}
        </p>
      </div>

      <div className="space-y-2 comment-section-container">
        {uniqueComments.map((comment, index) => (
          <div
            key={`${type}-${index}-${getCommentText(comment).substring(0, 20) || index}`}
            className="flex gap-2 comment-item"
          >
            <span className="text-gray-600 mt-1">•</span>
            <p className="text-gray-800 flex-1">{getCommentText(comment)}</p>
          </div>
        ))}
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
  onViewQuantitative,
  onViewQualitative,
  onViewPositive,
  onViewNegative,
  onViewNeutral,
}) => {
  const navigate = useNavigate();
  const { eventId } = useParams(); // Get eventId from URL if not provided as prop
  const { user } = useAuth();

  // Check for dynamic=true in URL query parameters
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isDynamicQuery = queryParams.get("dynamic") === "true";

  // A report is generated if:
  // 1. the isGeneratedReport prop is true OR
  // 2. it's NOT a dynamic query from the analytics page
  const effectivelyGenerated = isGeneratedReport || !isDynamicQuery;

  const reportId = report?.formId || eventId;

  // Use dynamic data hook
  const {
    quantitativeData,
    qualitativeData,
    formData,
    loading,
    error,
    refreshData,
  } = useDynamicReportData(reportId, effectivelyGenerated);

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
          : user?.role === "club-adviser"
            ? "/club-adviser/reports"
            : "/psas/reports";
      navigate(reportsPath);
    }
  };

  const SectionWrapper = ({ title, children, className = "" }) => (
    <div className={`section-page mb-8 ${className}`}>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden p-4 md:p-8">
        {title && (
          <div className="text-center mb-8">
            <h4 className="text-lg font-bold">{title}</h4>
          </div>
        )}
        {children}
      </div>
    </div>
  );

  // Helper to get year data
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;
  const currentYearData =
    quantitativeData?.charts?.yearData?.find(
      (d) => d.name === String(currentYear),
    )?.value || 0;
  const previousYearData =
    quantitativeData?.charts?.yearData?.find(
      (d) => d.name === String(previousYear),
    )?.value || 0;

  // Helper to get sentiment data
  const sentiment = qualitativeData?.sentimentBreakdown || {
    positive: { percentage: 0, count: 0 },
    neutral: { percentage: 0, count: 0 },
    negative: { percentage: 0, count: 0 },
  };
  const sentimentData = [
    {
      name: "Positive",
      value: sentiment.positive?.percentage || 0,
      color: SENTIMENT_COLORS.positive,
    },
    {
      name: "Neutral",
      value: sentiment.neutral?.percentage || 0,
      color: SENTIMENT_COLORS.neutral,
    },
    {
      name: "Negative",
      value: sentiment.negative?.percentage || 0,
      color: SENTIMENT_COLORS.negative,
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
          0,
        )}% positive feedback from ${totalResponses} responses, the event was highly successful. This strong approval rate indicates excellent execution and participant satisfaction.`,
      );
    } else if (positivePercentage >= 50) {
      insights.push(
        `★ Moderate Success: The event received ${positivePercentage.toFixed(
          0,
        )}% positive feedback from ${totalResponses} responses. While generally well-received, there is room for improvement to achieve excellence.`,
      );
    } else {
      insights.push(
        `★ Needs Significant Improvement: With only ${positivePercentage.toFixed(
          0,
        )}% positive feedback from ${totalResponses} responses, substantial changes are needed for future events.`,
      );
    }

    // Analyze positive feedback for strengths
    if (positiveThemes.length > 0 && positiveComments.length > 0) {
      const strengthText = positiveThemes.slice(0, 3).join(", ");
      insights.push(
        `• Strengths to Maintain: Participants particularly appreciated ${strengthText}. These elements received ${positiveComments.length} positive mentions and should be prioritized in future planning.`,
      );
    }

    // Analyze negative feedback for specific improvements
    if (negativeThemes.length > 0 && negativeComments.length > 0) {
      const improvementAreas = negativeThemes.slice(0, 3);
      const concernText = improvementAreas.join(", ");

      insights.push(
        `• Areas Requiring Attention: ${negativeComments.length} responses highlighted concerns about ${concernText}. These areas should be prioritized for improvement.`,
      );

      // Specific recommendations based on themes
      if (
        improvementAreas.some((theme) =>
          ["time consuming", "long", "boring"].includes(theme),
        )
      ) {
        insights.push(
          `• Recommendation - Engagement: Consider reducing session duration, incorporating interactive activities, and adding breaks to maintain participant attention and energy levels.`,
        );
      }

      if (
        improvementAreas.some((theme) =>
          ["confusing", "unclear", "lacking"].includes(theme),
        )
      ) {
        insights.push(
          `• Recommendation - Clarity: Improve communication of event objectives, provide clearer instructions, and ensure materials are well-organized and accessible.`,
        );
      }

      if (
        improvementAreas.some((theme) =>
          ["venue", "location", "space"].includes(theme),
        )
      ) {
        insights.push(
          `• Recommendation - Facilities: Review venue selection criteria, ensuring adequate space, comfort, and accessibility for all participants.`,
        );
      }
    }

    // Neutral feedback analysis
    if (neutralPercentage > 30) {
      insights.push(
        `• Neutral Feedback (${neutralPercentage.toFixed(
          0,
        )}%): A significant portion of responses were neutral, suggesting the event met basic expectations but didn't exceed them. Focus on creating more memorable and impactful experiences.`,
      );
    }

    // Action items based on overall assessment
    if (negativePercentage > 30) {
      insights.push(
        `⚠ Urgent Action Required: With ${negativePercentage.toFixed(
          0,
        )}% negative feedback, conduct a comprehensive post-event review meeting with stakeholders to address systemic issues before the next event.`,
      );
    } else if (negativePercentage > 15) {
      insights.push(
        `• Improvement Opportunity: ${negativePercentage.toFixed(
          0,
        )}% negative feedback indicates specific areas need attention. Gather follow-up feedback to understand root causes and implement targeted improvements.`,
      );
    }

    // Success recommendation
    if (positivePercentage > 70 && negativePercentage < 15) {
      insights.push(
        `✓ Continue Current Approach: The high satisfaction rate indicates successful event planning and execution. Document current practices as a template for future events while remaining open to innovation.`,
      );
    }

    // Default insight if no specific themes found
    if (insights.length === 0) {
      insights.push(
        `Based on ${totalResponses} evaluation responses, continue monitoring participant feedback to identify areas for enhancement and maintain event quality. Consider implementing more detailed feedback mechanisms for future events.`,
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
      <div className="bg-gray-100 min-h-screen report-print-content print:block p-4 md:p-8">
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

          {/* Report Header and Event Title - First Page Content */}
          <div className="bg-white rounded-lg mb-8 pb-4 print:bg-transparent print:shadow-none print:mb-0">
            <div id="report-header-block">
              <ReportHeader />
            </div>

            <div className="p-4 md:p-8 text-center mt-4 print:mt-16 print:pt-6">
              <h1 className="text-3xl md:text-5xl font-extrabold text-blue-900 mb-6 print:!text-black print:!text-5xl print:!font-bold print:!block print:!visible print:!opacity-100">
                {formData?.title || report?.title || "EVENT EVALUATION REPORT"}
              </h1>

              <div className="mx-auto h-1.5 w-1/2 bg-blue-600 rounded mb-6 print:bg-gray-400"></div>

              <p className="text-gray-700 max-w-4xl mx-auto leading-relaxed text-base md:text-lg mb-8 print:!text-black print:!text-lg print:!font-medium print:!opacity-100">
                This evaluation report serves as a guide for the institution to
                acknowledge the impact of the said event on the welfare and
                enjoyment of the students at La Verdad Christian College –
                Apalit, Pampanga.
              </p>

              <div className="space-y-1">
                <p className="text-xl font-bold uppercase tracking-wider text-blue-800 print:!text-black print:!block">
                  Evaluation Result Summary
                </p>
                <p className="text-base font-medium text-gray-600 print:!text-black print:!block">
                  College Level Breakdown
                </p>
              </div>
            </div>
          </div>

          <div className="print-page-break-after-forced">
            {(
              quantitativeData?.charts?.yearLevelBreakdown?.departments || [
                {
                  name: "Higher Education Department",
                  currentYear:
                    quantitativeData?.charts?.yearLevelBreakdown?.currentYear,
                  previousYear:
                    quantitativeData?.charts?.yearLevelBreakdown?.previousYear,
                },
              ]
            ).map((dept, deptIdx) => (
              <SectionWrapper
                key={deptIdx}
                title=""
                className="print:shadow-none print:bg-transparent"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                  {/* Previous Year */}
                  <div>
                    <h5 className="font-bold text-lg mb-1 print-no-break-after print:text-black">
                      {dept.name} {dept.previousYear?.year || previousYear}
                    </h5>
                    <p className="text-sm text-gray-500 mb-4 print:text-black">
                      {dept.previousYear?.total !== undefined
                        ? dept.previousYear.total
                        : previousYearData}{" "}
                      Responses
                    </p>
                    <div className="space-y-3">
                      {dept.previousYear?.breakdown?.length > 0 ? (
                        dept.previousYear.breakdown.map((yearLevel, idx) => {
                          const maxCount = Math.max(
                            ...dept.previousYear.breakdown.map((y) => y.count),
                            1,
                          );
                          return (
                            <div key={idx} className="flex items-center gap-3">
                              <div
                                className="bg-blue-600 h-8 rounded-r-full flex items-center px-3 text-white text-xs font-medium transition-all duration-500"
                                style={{
                                  width: `${Math.max(
                                    (yearLevel.count / maxCount) * 70,
                                    20,
                                  )}%`,
                                  minWidth: "100px",
                                }}
                              >
                                {yearLevel.name}
                              </div>
                              <span className="text-gray-700 text-sm font-medium">
                                {yearLevel.count}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-gray-400 text-sm italic">
                          No year level data available
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Current Year */}
                  <div>
                    <h5 className="font-bold text-lg mb-1 print-no-break-after print:text-black">
                      {dept.name} {dept.currentYear?.year || currentYear}
                    </h5>
                    <p className="text-sm text-gray-500 mb-4 print:text-black">
                      {dept.currentYear?.total !== undefined
                        ? dept.currentYear.total
                        : currentYearData}{" "}
                      Responses
                    </p>
                    <div className="space-y-3">
                      {dept.currentYear?.breakdown?.length > 0 ? (
                        dept.currentYear.breakdown.map((yearLevel, idx) => {
                          const maxCount = Math.max(
                            ...dept.currentYear.breakdown.map((y) => y.count),
                            1,
                          );
                          return (
                            <div key={idx} className="flex items-center gap-3">
                              <div
                                className="bg-blue-600 h-8 rounded-r-full flex items-center px-3 text-white text-xs font-medium transition-all duration-500"
                                style={{
                                  width: `${Math.max(
                                    (yearLevel.count / maxCount) * 70,
                                    20,
                                  )}%`,
                                  minWidth: "100px",
                                }}
                              >
                                {yearLevel.name}
                              </div>
                              <span className="text-gray-700 text-sm font-medium">
                                {yearLevel.count}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-gray-400 text-sm italic">
                          No year level data available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </SectionWrapper>
            ))}
          </div>

          {/* Quantitative Ratings Section */}
          <SectionWrapper
            title="Quantitative Ratings"
            showLiveIndicator={true}
            className="print-page-break-before-forced"
          >
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
              <div className="space-y-4">
                {(() => {
                  const chunks = [];
                  const array = qualitativeData.questionBreakdown;
                  // Chunk questions into groups of 4 for 4 questions per page
                  for (let i = 0; i < array.length; i += 4) {
                    chunks.push(array.slice(i, i + 4));
                  }

                  return chunks.map((group, groupIdx) => (
                    <div
                      key={groupIdx}
                      className={
                        groupIdx > 0 ? "print-page-break-before-forced" : ""
                      }
                    >
                      <div className="qualitative-questions-wrapper space-y-4">
                        {group.map((question, idx) => {
                          const globalIdx = groupIdx * 4 + idx;
                          return (
                            <div
                              key={question.questionId || globalIdx}
                              className="pb-2 question-block print:border-0 print:mb-2"
                            >
                              <div className="print-keep-together">
                                <h5 className="text-lg font-bold mb-0.5 print-no-break-after print:text-base">
                                  {globalIdx + 1}. {question.questionTitle}
                                </h5>
                                <p className="text-sm text-gray-500 mb-2 print:text-black print:text-xs">
                                  {question.responseCount} responses
                                </p>
                              </div>

                              {/* Scale Question - Rating Distribution */}
                              {question.questionType === "scale" &&
                                question.ratingDistribution && (
                                  <div className="flex flex-col md:flex-row items-center justify-center gap-2 print-chart-container print:items-start print:justify-start">
                                    <div className="w-48 h-48 print:w-48 print:h-48 print:p-0">
                                      <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                      >
                                        <PieChart>
                                          <Pie
                                            data={question.ratingDistribution.filter(
                                              (d) => d.count > 0,
                                            )}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={0}
                                            outerRadius={60}
                                            fill="#8884d8"
                                            dataKey="count"
                                            labelLine={false}
                                            label={renderCustomizedLabel}
                                            isAnimationActive={false}
                                          >
                                            {question.ratingDistribution
                                              .filter((d) => d.count > 0)
                                              .map((entry, index) => {
                                                const originalIndex =
                                                  question.ratingDistribution.findIndex(
                                                    (d) =>
                                                      d.name === entry.name,
                                                  );
                                                return (
                                                  <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                      COLORS[
                                                        originalIndex %
                                                          COLORS.length
                                                      ]
                                                    }
                                                  />
                                                );
                                              })}
                                          </Pie>
                                          <Tooltip />
                                          <Legend />
                                        </PieChart>
                                      </ResponsiveContainer>
                                    </div>

                                    <div className="space-y-2">
                                      {question.ratingDistribution.map(
                                        (entry, index) => (
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
                                              {entry.name.replace(/ Star/g, "")}
                                              : {entry.count} ({entry.value}%)
                                            </span>
                                          </div>
                                        ),
                                      )}
                                      {question.averageRating !== undefined && (
                                        <p className="text-sm font-medium text-gray-800 mt-2">
                                          Average:{" "}
                                          {question.averageRating?.toFixed(2) ||
                                            "0.00"}{" "}
                                          (Scale: {question.scaleMin || 1} - {question.scaleMax || 5})
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}

                              {/* Text Question - Sentiment Breakdown */}
                              {(question.questionType === "paragraph" ||
                                question.questionType === "short_answer") &&
                                question.sentimentBreakdown && (
                                  <div className="flex flex-col md:flex-row items-center justify-center gap-2 print-chart-container print:items-start print:justify-start">
                                    <div className="w-48 h-48 print:w-48 print:h-48 print:p-0">
                                      <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                      >
                                        <PieChart>
                                          <Pie
                                            data={[
                                              {
                                                name: "Positive",
                                                value:
                                                  question.sentimentBreakdown
                                                    .positive?.count || 0,
                                              },
                                              {
                                                name: "Neutral",
                                                value:
                                                  question.sentimentBreakdown
                                                    .neutral?.count || 0,
                                              },
                                              {
                                                name: "Negative",
                                                value:
                                                  question.sentimentBreakdown
                                                    .negative?.count || 0,
                                              },
                                            ].filter((d) => d.value > 0)}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={0}
                                            outerRadius={60}
                                            fill="#8884d8"
                                            dataKey="value"
                                            isAnimationActive={false}
                                            labelLine={false}
                                            label={renderCustomizedLabel}
                                          >
                                            {[
                                              {
                                                name: "Positive",
                                                color: "#10b981",
                                              },
                                              {
                                                name: "Neutral",
                                                color: "#f59e0b",
                                              },
                                              {
                                                name: "Negative",
                                                color: "#ef4444",
                                              },
                                            ].map((entry, index) => (
                                              <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                              />
                                            ))}
                                          </Pie>
                                          <Tooltip />
                                          <Legend />
                                        </PieChart>
                                      </ResponsiveContainer>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-3">
                                        <div
                                          className="w-3 h-3 rounded-full"
                                          style={{
                                            backgroundColor:
                                              SENTIMENT_COLORS.positive,
                                          }}
                                        ></div>
                                        <span className="text-sm text-gray-700">
                                          Positive:{" "}
                                          {question.sentimentBreakdown.positive
                                            ?.count || 0}{" "}
                                          (
                                          {question.sentimentBreakdown.positive
                                            ?.percentage || 0}
                                          %)
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <div
                                          className="w-3 h-3 rounded-full"
                                          style={{
                                            backgroundColor:
                                              SENTIMENT_COLORS.neutral,
                                          }}
                                        ></div>
                                        <span className="text-sm text-gray-700">
                                          Neutral:{" "}
                                          {question.sentimentBreakdown.neutral
                                            ?.count || 0}{" "}
                                          (
                                          {question.sentimentBreakdown.neutral
                                            ?.percentage || 0}
                                          %)
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <div
                                          className="w-3 h-3 rounded-full"
                                          style={{
                                            backgroundColor:
                                              SENTIMENT_COLORS.negative,
                                          }}
                                        ></div>
                                        <span className="text-sm text-gray-700">
                                          Negative:{" "}
                                          {question.sentimentBreakdown.negative
                                            ?.count || 0}{" "}
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
                                  <div className="flex flex-col md:flex-row items-center justify-center gap-2 print-chart-container print:items-start print:justify-start">
                                    <div className="w-48 h-48 print:w-48 print:h-48 print:p-0">
                                      <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                      >
                                        <PieChart>
                                          <Pie
                                            data={question.optionDistribution.filter(
                                              (d) => d.count > 0,
                                            )}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={0}
                                            outerRadius={60}
                                            fill="#8884d8"
                                            dataKey="count"
                                            labelLine={false}
                                            label={renderCustomizedLabel}
                                            isAnimationActive={false}
                                          >
                                            {question.optionDistribution
                                              .filter((d) => d.count > 0)
                                              .map((entry, index) => {
                                                const originalIndex =
                                                  question.optionDistribution.findIndex(
                                                    (d) =>
                                                      d.name === entry.name,
                                                  );
                                                return (
                                                  <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                      COLORS[
                                                        originalIndex %
                                                          COLORS.length
                                                      ]
                                                    }
                                                  />
                                                );
                                              })}
                                          </Pie>
                                          <Tooltip />
                                          <Legend />
                                        </PieChart>
                                      </ResponsiveContainer>
                                    </div>
                                    <div className="space-y-2">
                                      {question.optionDistribution.map(
                                        (entry, index) => (
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
                                              {entry.name}: {entry.count} (
                                              {entry.value}%)
                                            </span>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
            {onViewQuantitative && (
              <div className="mt-8 text-center print:hidden">
                <button
                  onClick={onViewQuantitative}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  View Detailed Ratings
                </button>
              </div>
            )}
          </SectionWrapper>

          {/* Qualitative Comments Section */}
          <SectionWrapper
            title="Qualitative Comments"
            showLiveIndicator={true}
            className="print-page-break-before-forced"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-12">
              {/* Sentiment Pie Chart */}
              <div className="h-64 print-chart-container">
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
                        dataKey="value"
                        labelLine={false}
                        outerRadius={110}
                        label={renderCustomizedLabel}
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

                <div className="flex flex-wrap gap-4 mt-8 print:hidden">
                  {onViewPositive && (
                    <button
                      onClick={onViewPositive}
                      className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-200 transition"
                    >
                      View Positive
                    </button>
                  )}
                  {onViewNeutral && (
                    <button
                      onClick={onViewNeutral}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
                    >
                      View Neutral
                    </button>
                  )}
                  {onViewNegative && (
                    <button
                      onClick={onViewNegative}
                      className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-200 transition"
                    >
                      View Negative
                    </button>
                  )}
                </div>

                <div className="space-y-6 text-sm text-gray-800 leading-relaxed">
                  <p>
                    {sentiment.positive?.count > 0 ? (
                      <>
                        <span className="font-bold">
                          {sentiment.positive?.percentage || 0}%
                        </span>{" "}
                      </>
                    ) : null}
                    {generateSummary("positive")}
                  </p>
                  <p>
                    {sentiment.neutral?.count > 0 ? (
                      <>
                        <span className="font-bold">
                          {sentiment.neutral?.percentage || 0}%
                        </span>{" "}
                      </>
                    ) : null}
                    {generateSummary("neutral")}
                  </p>
                  <p>
                    {sentiment.negative?.count > 0 ? (
                      <>
                        <span className="font-bold">
                          {sentiment.negative?.percentage || 0}%
                        </span>{" "}
                      </>
                    ) : null}
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
          <SectionWrapper
            title="Qualitative Comments - Positive"
            className="print-page-break-before-forced print-page-break-after-forced"
          >
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

          <SectionWrapper
            title="Qualitative Comments - Neutral"
            className="print-page-break-before-forced print-page-break-after-forced"
          >
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

          <SectionWrapper
            title="Qualitative Comments - Negative"
            className="print-page-break-before-forced"
          >
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
            {onViewQualitative && (
              <div className="mt-12 text-center print:hidden">
                <button
                  onClick={onViewQualitative}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  View All Detailed Comments
                </button>
              </div>
            )}
          </SectionWrapper>

          {qualitativeData?.previousYearData && (
            <SectionWrapper
              title="Qualitative Comments - Previous Year"
              className="print-page-break-before-forced"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-12">
                {/* Previous Year Sentiment Pie Chart */}
                <div className="h-64 print-chart-container">
                  <ResponsiveContainer width="100%" height={256}>
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Positive",
                            value:
                              qualitativeData.previousYearData.sentiment
                                ?.positive?.count || 0,
                            color: SENTIMENT_COLORS.positive,
                          },
                          {
                            name: "Neutral",
                            value:
                              qualitativeData.previousYearData.sentiment
                                ?.neutral?.count || 0,
                            color: SENTIMENT_COLORS.neutral,
                          },
                          {
                            name: "Negative",
                            value:
                              qualitativeData.previousYearData.sentiment
                                ?.negative?.count || 0,
                            color: SENTIMENT_COLORS.negative,
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={0}
                        dataKey="value"
                        labelLine={false}
                        outerRadius={110}
                        label={renderCustomizedLabel}
                        isAnimationActive={false}
                      >
                        {[
                          {
                            name: "Positive",
                            value:
                              qualitativeData.previousYearData.sentiment
                                ?.positive?.count || 0,
                            color: SENTIMENT_COLORS.positive,
                          },
                          {
                            name: "Neutral",
                            value:
                              qualitativeData.previousYearData.sentiment
                                ?.neutral?.count || 0,
                            color: SENTIMENT_COLORS.neutral,
                          },
                          {
                            name: "Negative",
                            value:
                              qualitativeData.previousYearData.sentiment
                                ?.negative?.count || 0,
                            color: SENTIMENT_COLORS.negative,
                          },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Previous Year Report Summary Text */}
                <div>
                  <h5 className="text-lg font-bold mb-2 text-center md:text-left">
                    Report Summary
                  </h5>
                  <p className="text-sm text-gray-500 mb-6 text-center md:text-left italic">
                    Comparing against:{" "}
                    <strong>{qualitativeData.previousYearData.title}</strong> (
                    {new Date(
                      qualitativeData.previousYearData.date,
                    ).toLocaleDateString()}
                    )
                  </p>

                  {/* Legend */}
                  <div className="flex gap-6 mb-8 justify-center md:justify-start">
                    {[
                      {
                        name: "Positive",
                        value:
                          qualitativeData.previousYearData.sentiment?.positive
                            ?.count || 0,
                        color: SENTIMENT_COLORS.positive,
                      },
                      {
                        name: "Neutral",
                        value:
                          qualitativeData.previousYearData.sentiment?.neutral
                            ?.count || 0,
                        color: SENTIMENT_COLORS.neutral,
                      },
                      {
                        name: "Negative",
                        value:
                          qualitativeData.previousYearData.sentiment?.negative
                            ?.count || 0,
                        color: SENTIMENT_COLORS.negative,
                      },
                    ].map((entry, index) => (
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
                        {qualitativeData.previousYearData.sentiment?.positive
                          ?.percentage || 0}
                        %
                      </span>{" "}
                      of the responses resulted to positive citing informative
                      sessions and engaging speakers such as the keynote address
                      and workshop activities.
                    </p>
                    <p>
                      <span className="font-bold">
                        {qualitativeData.previousYearData.sentiment?.neutral
                          ?.percentage || 0}
                        %
                      </span>{" "}
                      of the responses resulted into neutral, providing balanced
                      feedback without strong positive or negative sentiments.
                    </p>
                    <p>
                      <span className="font-bold">
                        {qualitativeData.previousYearData.sentiment?.negative
                          ?.percentage || 0}
                        %
                      </span>{" "}
                      of the responses resulted into negative particularly
                      regarding venue ventilation and audio quality, suggesting
                      areas that need improvement.
                    </p>
                  </div>
                </div>
              </div>

              {/* Previous Year Event Insights */}
              <div className="mb-12">
                <h4 className="text-xl font-bold text-center mb-8">
                  Event Insights and Recommendations
                </h4>
                <div className="space-y-6 text-gray-800 max-w-3xl mx-auto">
                  <p>
                    ★ Moderate Success: The event received{" "}
                    {qualitativeData.previousYearData.sentiment?.positive
                      ?.percentage || 0}
                    % positive feedback. While generally well-received, there is
                    room for improvement to achieve excellence.
                  </p>
                  <p>
                    • Strengths to Maintain: Participants particularly
                    appreciated the informative sessions and engaging speakers.
                    These elements should be prioritized in future planning.
                  </p>
                  <p>
                    • Areas Requiring Attention: Responses highlighted concerns
                    about venue ventilation and audio quality. These areas
                    should be prioritized for improvement.
                  </p>
                  <p>
                    • Recommendation - Facilities: Ensure that the venue has
                    adequate ventilation and sound systems are tested thoroughly
                    before the event.
                  </p>
                  <p>
                    ⚠ Action Required: With{" "}
                    {qualitativeData.previousYearData.sentiment?.negative
                      ?.percentage || 0}
                    % negative feedback, address the logistical issues raised to
                    prevent recurrence in future events.
                  </p>
                  <p className="font-medium mt-8">
                    Disclaimer: This is a system-generated recommendation based
                    on previous year's data.
                  </p>
                </div>
              </div>
            </SectionWrapper>
          )}

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

  if (user?.role === "club-adviser") {
    return <ClubAdviserLayout>{content}</ClubAdviserLayout>;
  }

  return <PSASLayout>{content}</PSASLayout>;
};

export default CompleteReport;

import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useDynamicReportData } from "../../hooks/useDynamicReportData";
import { useAuth } from "../../contexts/useAuth";
import PSASLayout from "../../components/psas/PSASLayout";
import ClubOfficerLayout from "../../components/club-officers/ClubOfficerLayout";
import ClubAdviserLayout from "../../components/club-advisers/ClubAdviserLayout";
import ReportHeader from "./ReportHeader";
import ReportDescription from "./ReportDescription";
import ReportActions from "./ReportActions";

const QuantitativeRatings = ({ report, onBack, isGeneratedReport = false }) => {
  const navigate = useNavigate();
  const { eventId } = useParams();
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

  // If rendered as child component (with props), don't use PSASLayout
  // If accessed via direct routing (no props), use PSASLayout
  const isChildComponent = report && onBack;

  const handleBackClick = () => {
    if (isChildComponent) {
      onBack();
    } else {
      const reportsPath =
        user?.role === "club-officer"
          ? "/club-officer/reports"
          : user?.role === "club-adviser"
            ? "/club-adviser/reports"
            : "/psas/reports";
      
      const dynamicParam = isDynamicQuery ? "?dynamic=true" : "";
      navigate(`${reportsPath}/${reportId}${dynamicParam}`);
    }
  };

  // Extract quantitative ratings from questionBreakdown
  const quantitativeRatings = (qualitativeData?.questionBreakdown || [])
    .filter(q => q.questionType === "scale")
    .map(q => ({
      category: q.questionTitle,
      rating: q.averageRating || 0,
      totalResponses: q.responseCount || 0,
      average: q.averageRating || 0,
      scaleMax: q.scaleMax || 5,
      scaleMin: q.scaleMin || 1
    }));

  const getRatingColor = (rating, max = 5, min = 1) => {
    const range = max - min;
    const ratio = range > 0 ? (rating - min) / range : 1;
    if (ratio >= 0.9) return "text-green-600";
    if (ratio >= 0.8) return "text-blue-600";
    if (ratio >= 0.7) return "text-yellow-600";
    return "text-red-600";
  };

  const getRatingStars = (rating, max = 5, min = 1) => {
    // Normalize to 5 stars if max is different
    const range = max - min;
    const normalizedRating = range > 0 ? ((rating - min) / range) * 5 : 5;
    const fullStars = Math.floor(normalizedRating);
    const hasHalfStar = normalizedRating % 1 >= 0.5;
    const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));

    return (
      <div className="flex items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <svg
            key={`full-${i}`}
            className="w-5 h-5 text-yellow-400 fill-current"
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
        {hasHalfStar && (
          <div className="relative w-5 h-5 text-gray-300 fill-current">
             <svg
              className="absolute w-5 h-5 text-yellow-400 fill-current"
              viewBox="0 0 20 20"
              style={{ clipPath: 'inset(0 50% 0 0)' }}
            >
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
            <svg
              className="w-5 h-5 text-gray-300 fill-current"
              viewBox="0 0 20 20"
            >
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg
            key={`empty-${i}`}
            className="w-5 h-5 text-gray-300 fill-current"
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
      </div>
    );
  };

  const content = (
    <>
      <ReportActions 
        onBackClick={handleBackClick} 
        eventId={reportId}
        isGeneratedReport={effectivelyGenerated}
        loading={loading}
      />
      <div className="bg-gray-100 min-h-screen report-print-content print:block">
        <div className="container mx-auto py-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 mx-4 md:mx-0">
              <p className="text-red-600 text-sm">Error loading data: {error}</p>
              <button onClick={refreshData} className="mt-2 text-red-700 underline text-sm">Retry</button>
            </div>
          )}
          <div className="bg-white shadow-lg rounded-lg">
            <ReportHeader />
            <ReportDescription title={formData?.title || "Evaluation Report"} />
            <main className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold uppercase">{formData?.title || "EVENT EVALUATION"}</h3>
                <p className="text-xl font-semibold">EVALUATION RESULT</p>
                <p className="text-lg">College Level</p>
              </div>
              <h4 className="text-xl font-bold mb-4">Quantitative Ratings</h4>
              <p className="text-sm text-gray-600 mb-6">
                Total Categories: {quantitativeRatings.length} | Total Responses:{" "}
                {quantitativeData?.metrics?.totalResponses || 0}
              </p>
              
              {loading ? (
                 <div className="flex items-center justify-center py-12">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                 </div>
              ) : quantitativeRatings.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No quantitative data found for this report.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-blue-900 text-white">
                        <th className="border border-gray-300 px-4 py-3 text-left">Category</th>
                        <th className="border border-gray-300 px-4 py-3 text-center">Rating</th>
                        <th className="border border-gray-300 px-4 py-3 text-center">Average</th>
                        <th className="border border-gray-300 px-4 py-3 text-center">Visual Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quantitativeRatings.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="border border-gray-300 px-4 py-3 font-medium">{item.category}</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            <span className={`font-bold ${getRatingColor(item.rating, item.scaleMax, item.scaleMin)}`}>
                              {item.rating.toFixed(1)}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center">{item.average.toFixed(1)}</td>
                          <td className="border border-gray-300 px-4 py-3">
                            <div className="flex items-center justify-center">
                              {getRatingStars(item.rating, item.scaleMax, item.scaleMin)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-900 rounded-r-lg">
                <h5 className="font-bold text-blue-900 mb-2">Summary</h5>
                <p className="text-gray-700">
                  {quantitativeRatings.length > 0 ? (
                    <>
                      The overall quantitative ratings indicate performance
                      across {quantitativeRatings.length} categories. 
                      The highest-rated category is{" "}
                      <span className="font-bold">
                        {quantitativeRatings.reduce((max, item) =>
                          item.rating > max.rating ? item : max
                        ).category}
                      </span>{" "}
                      with a rating of{" "}
                      <span className="font-bold">
                        {quantitativeRatings.reduce((max, item) =>
                          item.rating > max.rating ? item : max
                        ).rating.toFixed(1)}
                      </span>
                      .
                    </>
                  ) : (
                    "No quantitative summary available."
                  )}
                </p>
              </div>
            </main>
            <div className="bg-blue-900 text-white text-center py-4 rounded-b-lg">
              <p>
                MacArthur Highway, Sampaloc, Apalit, Pampanga 2016 |
                info@laverdad.edu.ph
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // Determine layout wrapper
  const LayoutWrapper = user?.role === "club-officer" 
    ? ClubOfficerLayout 
    : user?.role === "club-adviser"
    ? ClubAdviserLayout
    : PSASLayout;

  // Only wrap with Layout if accessed via direct routing (no props)
  if (isChildComponent) {
    return content;
  }

  return <LayoutWrapper>{content}</LayoutWrapper>;
};

export default QuantitativeRatings;

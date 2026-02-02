import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useDynamicReportData } from "../../hooks/useDynamicReportData";
import { useAuth } from "../../contexts/useAuth";
import ClubOfficerLayout from "../../components/club-officers/ClubOfficerLayout";
import ClubAdviserLayout from "../../components/club-advisers/ClubAdviserLayout";
import PSASLayout from "../../components/psas/PSASLayout";
import ReportHeader from "./ReportHeader";
import ReportDescription from "./ReportDescription";
import ReportActions from "./ReportActions";

const PositiveComments = ({ report, onBack, isGeneratedReport = false }) => {
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

  // Get positive comments from sentiment analysis
  const positiveComments = (qualitativeData?.categorizedComments?.positive || []).map(c => 
    typeof c === 'string' ? c : (c.comment || c.text || "")
  ).filter(c => c && c.trim() !== "");

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
              <h4 className="text-xl font-bold mb-4">Positive Comments</h4>
              <p className="text-sm text-gray-600 mb-6">Total Positive Comments: {positiveComments.length}</p>
              
              {loading ? (
                 <div className="flex items-center justify-center py-12">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                 </div>
              ) : positiveComments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No positive comments found for this report.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {positiveComments.map((comment, index) => (
                    <div key={index} className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                      <p className="text-gray-800">{comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </main>
            <div className="bg-blue-900 text-white text-center py-4 rounded-b-lg">
              <p>MacArthur Highway, Sampaloc, Apalit, Pampanga 2016 | info@laverdad.edu.ph</p>
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

  return (
    <LayoutWrapper>
      {content}
    </LayoutWrapper>
  );
};

export default PositiveComments;

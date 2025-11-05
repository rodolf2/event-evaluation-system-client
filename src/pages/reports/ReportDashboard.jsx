import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import PSASLayout from '../../components/psas/PSASLayout';
import ReportActions from './ReportActions';

const ReportDashboard = ({ report, onViewChange, onBack }) => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  // If rendered as child component (with props), don't use PSASLayout
  // If accessed via direct routing (no props), use PSASLayout
  const isChildComponent = report && onViewChange && onBack;

  const handleBackClick = () => {
    if (isChildComponent) {
      onBack();
    } else {
      navigate('/psas/reports');
    }
  };

  const handleCategoryClick = (category) => {
    if (isChildComponent) {
      onViewChange(category);
    } else {
      // Navigate to the appropriate route
      const categoryRoutes = {
        'quantitative': 'quantitative-ratings',
        'qualitative': 'qualitative-comments',
        'positive': 'positive-comments',
        'negative': 'negative-comments',
        'neutral': 'neutral-comments'
      };
      navigate(`/psas/reports/${categoryRoutes[category]}/${eventId || report?.id}`);
    }
  };

  const content = (
    <>
      <ReportActions onBackClick={handleBackClick} />
      <div className="bg-gray-100 min-h-screen report-print-content print:block">
        <div className="container mx-auto py-8">
          <div className="bg-white shadow-lg rounded-lg">
            <main className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold">SAMPLE EVENT EVALUATION</h3>
                <p className="text-xl font-semibold">EVALUATION RESULT</p>
                <p className="text-lg">College Level</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div
                  onClick={() => handleCategoryClick('quantitative')}
                  className="bg-blue-100 p-8 rounded-lg text-center hover:bg-blue-200 transition cursor-pointer"
                >
                  <h4 className="text-xl font-bold">Quantitative Ratings</h4>
                </div>
                <div
                  onClick={() => handleCategoryClick('qualitative')}
                  className="bg-gray-100 p-8 rounded-lg text-center hover:bg-gray-200 transition cursor-pointer"
                >
                  <h4 className="text-xl font-bold">Qualitative Comments</h4>
                </div>
                <div
                  onClick={() => handleCategoryClick('positive')}
                  className="bg-green-100 p-8 rounded-lg text-center hover:bg-green-200 transition cursor-pointer"
                >
                  <h4 className="text-xl font-bold">Positive Comments</h4>
                </div>
                <div
                  onClick={() => handleCategoryClick('negative')}
                  className="bg-red-100 p-8 rounded-lg text-center hover:bg-red-200 transition cursor-pointer"
                >
                  <h4 className="text-xl font-bold">Negative Comments</h4>
                </div>
                <div
                  onClick={() => handleCategoryClick('neutral')}
                  className="bg-yellow-100 p-8 rounded-lg text-center hover:bg-yellow-200 transition cursor-pointer"
                >
                  <h4 className="text-xl font-bold">Neutral Comments</h4>
                </div>
              </div>
            </main>
            <div className="bg-blue-900 text-white text-center py-4 rounded-b-lg">
              <p>MacArthur Highway, Sampaloc, Apalit, Pampanga 2016 | info@laverdad.edu.ph</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // Only wrap with PSASLayout if accessed via direct routing (no props)
  if (isChildComponent) {
    return content;
  }

  return (
    <PSASLayout>
      {content}
    </PSASLayout>
  );
};

export default ReportDashboard;

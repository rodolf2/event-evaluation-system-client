import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PSASLayout from '../../components/psas/PSASLayout';
import ReportHeader from './ReportHeader';
import ReportDescription from './ReportDescription';
import ReportActions from './ReportActions';

const NeutralComments = ({ report, onBack }) => {
  const navigate = useNavigate();
  const { eventId } = useParams();

  // If rendered as child component (with props), don't use PSASLayout
  // If accessed via direct routing (no props), use PSASLayout
  const isChildComponent = report && onBack;

  const handleBackClick = () => {
    if (isChildComponent) {
      onBack();
    } else {
      navigate(`/psas/reports/${eventId}`);
    }
  };

  // Sample neutral comments data
  const neutralComments = [
    "The event was okay, nothing special.",
    "Average experience overall.",
    "Some parts were good, others average.",
    "Met expectations but didn't exceed them.",
    "Standard event format.",
    "Decent organization.",
    "Could be better but wasn't bad.",
    "Mixed feelings about the content.",
    "Neither impressed nor disappointed.",
    "Just another typical event."
  ];

  const content = (
    <>
      <ReportActions onBackClick={handleBackClick} />
      <div className="bg-gray-100 min-h-screen report-print-content print:block">
        <div className="container mx-auto py-8">
          <div className="bg-white shadow-lg rounded-lg">
            <ReportHeader title="Sample Event Evaluation Report" />
            <ReportDescription />
            <main className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold">SAMPLE EVENT EVALUATION</h3>
                <p className="text-xl font-semibold">EVALUATION RESULT</p>
                <p className="text-lg">College Level</p>
              </div>
              <h4 className="text-xl font-bold mb-4">Neutral Comments</h4>
              <p className="text-sm text-gray-600 mb-6">Total Neutral Comments: {neutralComments.length}</p>
              <div className="space-y-4">
                {neutralComments.map((comment, index) => (
                  <div key={index} className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                    <p className="text-gray-800">{comment}</p>
                  </div>
                ))}
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

export default NeutralComments;

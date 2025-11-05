import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PSASLayout from '../../components/psas/PSASLayout';
import ReportHeader from './ReportHeader';
import ReportDescription from './ReportDescription';
import ReportActions from './ReportActions';

const QualitativeComments = ({ report, onBack }) => {
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

  // Sample qualitative comments data
  const qualitativeComments = [
    "The interactive workshops were particularly engaging and helped me understand the concepts better.",
    "I appreciated the diverse range of speakers who brought different perspectives to the discussion.",
    "The networking session provided valuable connections that I hope to maintain in the future.",
    "While the content was good, I would have liked more time for Q&A with the presenters.",
    "The event successfully bridged the gap between theory and practical application.",
    "The venue's location was convenient, and the facilities were well-maintained.",
    "I found the balance between formal presentations and casual discussions to be effective.",
    "The follow-up materials provided after the event were comprehensive and useful.",
    "The event fostered a sense of community among participants from different backgrounds.",
    "Overall, it was a professionally organized event that met my expectations for quality content."
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
              <h4 className="text-xl font-bold mb-4">Qualitative Comments</h4>
              <p className="text-sm text-gray-600 mb-6">Total Qualitative Comments: {qualitativeComments.length}</p>
              <div className="space-y-4">
                {qualitativeComments.map((comment, index) => (
                  <div key={index} className="bg-gray-50 border-l-4 border-gray-500 p-4 rounded-r-lg">
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

export default QualitativeComments;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import PSASLayout from '../../components/psas/PSASLayout';
import ReportHeader from './ReportHeader';
import ReportDescription from './ReportDescription';
import ReportActions from './ReportActions';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const yearData2024 = [
  { name: 'First Year', value: 106 },
  { name: 'Second Year', value: 305 },
  { name: 'Third Year', value: 220 },
  { name: 'Fourth Year', value: 214 },
];

const yearData2025 = [
    { name: 'First Year', value: 185 },
    { name: 'Second Year', value: 305 },
    { name: 'Third Year', value: 237 },
    { name: 'Fourth Year', value: 256 },
];

const pieData = [
  { name: 'Very unclear', value: 20 },
  { name: 'Unclear', value: 20 },
  { name: 'Neutral / Moderately clear', value: 25 },
  { name: 'Clear', value: 15 },
  { name: 'Extremely clear', value: 20 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const CompleteReport = ({ report, onBack }) => {
  const navigate = useNavigate();

  // If rendered as child component (with props), don't use PSASLayout
  // If accessed via direct routing (no props), use PSASLayout
  const isChildComponent = report && onBack;

  const handleBackClick = () => {
    if (isChildComponent) {
      onBack();
    } else {
      navigate('/psas/reports');
    }
  };

  // Sample data for all comment types
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

  const positiveComments = [
    "The event was well-organized and engaging.",
    "I really enjoyed the interactive sessions.",
    "Great speakers and valuable insights shared.",
    "The venue was perfect and comfortable.",
    "Excellent coordination and timely execution.",
    "Learned a lot from this event.",
    "The food and refreshments were amazing.",
    "Good networking opportunities.",
    "Well-planned agenda and activities.",
    "Positive experience overall."
  ];

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

  const negativeComments = [
    "The event started late and ran over time.",
    "Some sessions were not well-prepared.",
    "Limited seating availability.",
    "Technical issues with the audio system.",
    "Food quality could have been better.",
    "Poor time management during activities.",
    "Inadequate parking facilities.",
    "Limited interaction with speakers.",
    "Venue was too crowded.",
    "Registration process was confusing."
  ];

  const SectionWrapper = ({ title, children }) => (
    <div className="section-page">
      <div className="bg-white">
        <ReportHeader title={`${title} - Sample Event Evaluation Report`} />
        <ReportDescription />
        <main className="p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold">SAMPLE EVENT EVALUATION</h3>
            <p className="text-xl font-semibold">EVALUATION RESULT</p>
            <p className="text-lg">College Level</p>
            <h4 className="text-xl font-bold mt-4">{title}</h4>
          </div>
          {children}
        </main>
        <div className="bg-blue-900 text-white text-center py-4">
          <p>MacArthur Highway, Sampaloc, Apalit, Pampanga 2016 | info@laverdad.edu.ph</p>
        </div>
      </div>
    </div>
  );

  const content = (
    <>
      <ReportActions onBackClick={handleBackClick} />
      <div className="bg-gray-100 min-h-screen report-print-content print:block">
        <div className="container mx-auto py-8">

          {/* Quantitative Ratings Section */}
          <SectionWrapper title="Quantitative Ratings">
            <div className="grid grid-cols-1 print:grid-cols-1 md:grid-cols-2 print:space-y-8 print:block gap-8 mb-12">
              <div className="print:mb-8">
                <h5 className="text-lg font-semibold text-center mb-2">Higher Education Department 2024</h5>
                <p className="text-center text-sm text-gray-500 mb-4">536 Responses</p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={yearData2024} layout="vertical">
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h5 className="text-lg font-semibold text-center mb-2">Higher Education Department 2025</h5>
                <p className="text-center text-sm text-gray-500 mb-4">536 Responses</p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={yearData2025} layout="vertical">
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-2">1. How clearly were the examples explained?</h4>
              <p className="text-sm text-gray-500 mb-4">536 responses</p>
              <div className="flex justify-center">
                  <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                      <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={150}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      >
                          {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                      </PieChart>
                  </ResponsiveContainer>
              </div>
            </div>
          </SectionWrapper>

          {/* Qualitative Comments Section */}
          <SectionWrapper title="Qualitative Comments">
            <p className="text-sm text-gray-600 mb-6">Total Qualitative Comments: {qualitativeComments.length}</p>
            <div className="space-y-4">
              {qualitativeComments.map((comment, index) => (
                <div key={index} className="bg-gray-50 border-l-4 border-gray-500 p-4 rounded-r-lg">
                  <p className="text-gray-800">{comment}</p>
                </div>
              ))}
            </div>
          </SectionWrapper>

          {/* Positive Comments Section */}
          <SectionWrapper title="Positive Comments">
            <p className="text-sm text-gray-600 mb-6">Total Positive Comments: {positiveComments.length}</p>
            <div className="space-y-4">
              {positiveComments.map((comment, index) => (
                <div key={index} className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                  <p className="text-gray-800">{comment}</p>
                </div>
              ))}
            </div>
          </SectionWrapper>

          {/* Neutral Comments Section */}
          <SectionWrapper title="Neutral Comments">
            <p className="text-sm text-gray-600 mb-6">Total Neutral Comments: {neutralComments.length}</p>
            <div className="space-y-4">
              {neutralComments.map((comment, index) => (
                <div key={index} className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                  <p className="text-gray-800">{comment}</p>
                </div>
              ))}
            </div>
          </SectionWrapper>

          {/* Negative Comments Section */}
          <SectionWrapper title="Negative Comments">
            <p className="text-sm text-gray-600 mb-6">Total Negative Comments: {negativeComments.length}</p>
            <div className="space-y-4">
              {negativeComments.map((comment, index) => (
                <div key={index} className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                  <p className="text-gray-800">{comment}</p>
                </div>
              ))}
            </div>
          </SectionWrapper>
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

export default CompleteReport;

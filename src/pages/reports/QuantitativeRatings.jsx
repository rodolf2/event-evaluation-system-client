import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

const QuantitativeRatings = ({ report, onBack }) => {
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

      <h4 className="text-xl font-bold mb-4">Quantitative Ratings</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div>
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

export default QuantitativeRatings;

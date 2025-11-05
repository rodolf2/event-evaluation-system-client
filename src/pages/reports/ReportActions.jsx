import React from 'react';
import { Download, Printer, User, ArrowLeft } from 'lucide-react';

const ReportActions = ({ onBackClick }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // For now, trigger print dialog which allows saving as PDF
    // In a production app, this would generate a proper PDF
    const confirmDownload = window.confirm(
      'This will open the print dialog. You can save the report as PDF from there. Would you like to continue?'
    );
    if (confirmDownload) {
      window.print();
    }
  };

  const handleGenerate = () => {
    // Placeholder for report generation functionality
    alert('Report generation feature coming soon!');
  };

  return (
    <div className="bg-gray-50 py-4 px-8 border-b border-gray-200 print:hidden">
      <div className="flex justify-between items-center">
        <button
          onClick={onBackClick}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Go back"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <User size={20} className="text-gray-600" />
          </button>
          <button
            onClick={handlePrint}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Print report"
          >
            <Printer size={20} className="text-gray-600" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Download as PDF"
          >
            <Download size={20} className="text-gray-600" />
          </button>
          <button
            onClick={handleGenerate}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            title="Generate report"
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportActions;

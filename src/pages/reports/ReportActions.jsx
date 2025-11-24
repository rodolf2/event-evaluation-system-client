import { useNavigate } from "react-router-dom";
import { Download, Printer, UserPlus, ArrowLeft } from "lucide-react";

const ReportActions = ({ onBackClick, eventId }) => {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const confirmDownload = window.confirm(
      "This will open the print dialog. You can save the report as PDF from there. Would you like to continue?"
    );
    if (confirmDownload) {
      window.print();
    }
  };

  const handleGenerate = () => {
    alert("Report generation feature coming soon!");
  };

  const handleShowPreparedBy = () => {
    navigate("/psas/reports/prepared-by", {
      state: { reportId: eventId, eventId: eventId },
    });
  };

  return (
    <div className="print:hidden">
      <div className="flex justify-between items-center">
        <button
          onClick={onBackClick}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Go back"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleShowPreparedBy}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="View Prepared By"
          >
            <UserPlus size={20} className="text-gray-600" />
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

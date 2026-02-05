import { Doughnut, Bar } from "react-chartjs-2";

const ChartsSection = ({
  responseRate,
  responseOverview,
  responseRateData,
  responseBreakdownData,
  responseOverviewData,
  responseRateOptions,
  responseBreakdownOptions,
  responseOverviewOptions,
  responseBreakdown,
  onGenerateReport,
  onViewReport,
}) => {
  return (
    <div className="grow grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Response Rate */}
      <div className="bg-white p-6 rounded-lg shadow-md flex flex-col min-h-[350px]">
        <h3 className="text-lg font-semibold mb-4">Response Rate</h3>
        <div className="flex-1 flex flex-col justify-center items-center">
          <div className="relative h-56 w-full max-w-[320px] flex justify-center items-center mb-4">
            <Doughnut data={responseRateData} options={responseRateOptions} />
            <div className="absolute text-center">
              <p className="text-4xl font-bold text-[#1F1F1F]">
                {responseRate}%
              </p>
            </div>
          </div>
          <p className="text-sm text-[#6B7280] text-center max-w-xs">
            The accepted percentage of collected responses is up to 50% and
            above
          </p>
        </div>
      </div>

      {/* Response Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow-md flex flex-col min-h-[350px]">
        <h3 className="text-lg font-semibold mb-4">Response Breakdown</h3>
        <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-8">
          <div className="w-48 h-48">
            <Doughnut
              data={responseBreakdownData}
              options={{
                ...responseBreakdownOptions,
                maintainAspectRatio: true,
              }}
            />
          </div>
          <div className="w-full sm:flex-1">
            <ul className="space-y-3">
              <li className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-[#10B981] rounded-full mr-3"></span>
                  <span className="text-sm font-medium text-[#1F1F1F]">
                    Positive
                  </span>
                </div>
                <span className="text-sm text-[#6B7280]">
                  {responseBreakdown.positive.count} (
                  {responseBreakdown.positive.percentage}%)
                </span>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-[#F59E0B] rounded-full mr-3"></span>
                  <span className="text-sm font-medium text-[#1F1F1F]">
                    Neutral
                  </span>
                </div>
                <span className="text-sm text-[#6B7280]">
                  {responseBreakdown.neutral.count} (
                  {responseBreakdown.neutral.percentage}%)
                </span>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-[#EF4444] rounded-full mr-3"></span>
                  <span className="text-sm font-medium text-[#1F1F1F]">
                    Negative
                  </span>
                </div>
                <span className="text-sm text-[#6B7280]">
                  {responseBreakdown.negative.count} (
                  {responseBreakdown.negative.percentage}%)
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Response Overview */}
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col min-h-[350px]">
        <h3 className="text-xl font-semibold">Response Overview</h3>
        <p className="text-sm text-gray-500 mb-2">
          {responseOverview.dateRange}
        </p>
        <div className="grow relative">
          <Bar
            data={responseOverviewData}
            options={{
              ...responseOverviewOptions,
              maintainAspectRatio: false,
            }}
          />
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-md text-center flex flex-col justify-around">
          <h3 className="text-xl font-semibold">View Report</h3>
          <p className="text-[#1F1F1F] text-sm">
            View the current reports of the evaluation before generating once it
            reached the minimum percentage of collected responses
          </p>
          <button
            onClick={onViewReport}
            className="text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition text-base"
            style={{
              background: "linear-gradient(180deg, #324BA3 38%, #002474 100%)",
            }}
          >
            View Current Report
          </button>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center flex flex-col justify-around">
          <h3 className="text-xl font-semibold">Evaluation Report</h3>
          <p className="text-[#1F1F1F] text-sm">
            In order to generate reports, the minimum accepted percentage of
            collected responses should reach 50% and above
          </p>
          <button
            onClick={onGenerateReport}
            className={`text-white px-4 py-2 rounded-xl transition text-base ${responseRate >= 50 ? "hover:bg-blue-700" : "cursor-not-allowed"
              }`}
            style={{
              background:
                responseRate >= 50
                  ? "linear-gradient(180deg, #324BA3 38%, #002474 100%)"
                  : "linear-gradient(0deg, #3F4250 38%, #404044 100%)",
            }}
            disabled={responseRate < 50}
          >
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;

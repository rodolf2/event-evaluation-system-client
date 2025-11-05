import { Doughnut, Bar } from 'react-chartjs-2';

const ChartsSection = ({
  responseRate,
  responseOverview,
  responseRateData,
  responseBreakdownData,
  responseOverviewData,
  responseRateOptions,
  responseBreakdownOptions,
  responseOverviewOptions,
  responseBreakdown
}) => {
  return (
    <div className="grow grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Response Rate */}
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col justify-center items-center text-center min-h-[350px]">
        <h3 className="text-xl font-semibold w-full text-left">
          Response Rate
        </h3>
        <div className="relative h-60 w-full max-w-[280px] flex justify-center items-center my-3">
          <Doughnut data={responseRateData} options={responseRateOptions} />
          <div className="absolute text-center">
            <p className="text-3xl font-bold">{responseRate}%</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 px-2">
          The accepted percentage of collected responses is up to 50% and above.
        </p>
      </div>

      {/* Response Breakdown */}
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
        <h3 className="text-xl font-semibold text-left">Response Breakdown</h3>
        <div className="grow flex items-center justify-center">
          <div className="w-1/2 h-50 py-3">
            <Doughnut
              data={responseBreakdownData}
              options={{
                ...responseBreakdownOptions,
                maintainAspectRatio: false,
              }}
            />
          </div>
          <div className="w-1/2 pl-4">
            <ul className="text-base">
              <li className="flex items-center mb-2">
                <span className="w-3 h-3 bg-blue-900 rounded-full mr-3"></span>
                Positive {responseBreakdown.positive.count} ({responseBreakdown.positive.percentage}%)
              </li>
              <li className="flex items-center mb-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                Neutral {responseBreakdown.neutral.count} ({responseBreakdown.neutral.percentage}%)
              </li>
              <li className="flex items-center">
                <span className="w-3 h-3 bg-blue-300 rounded-full mr-3"></span>
                Negative {responseBreakdown.negative.count} ({responseBreakdown.negative.percentage}%)
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
          <p className="text-gray-600 text-sm">
            View the current reports of the evaluation.
          </p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-base">
            View Current Report
          </button>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center flex flex-col justify-around">
          <h3 className="text-xl font-semibold">Evaluation Report</h3>
          <p className="text-gray-600 text-sm">
            Generate reports once responses reach 50%.
          </p>
          <button
            className={`${
              responseRate >= 50
                ? "bg-gray-700 hover:bg-gray-800"
                : "bg-gray-400 cursor-not-allowed"
            } text-white px-4 py-2 rounded-lg transition text-base`}
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

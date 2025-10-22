import { useState, useEffect } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import PSASLayout from "../../components/psas/PSASLayout";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import totalAttendeesIcon from "../../assets/icons/total_event_attendess-icon.svg";
import totalResponseIcon from "../../assets/icons/total_response-icon.svg";
import remainingNonResponseIcon from "../../assets/icons/remaining_non_responses-icon.svg";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const EventAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Using mock data for development since backend is not available
        const mockData = {
          totalAttendees: 150,
          totalResponses: 89,
          responseRate: 59.3,
          responseBreakdown: {
            positive: { percentage: 67.4, count: 60 },
            neutral: { percentage: 20.2, count: 18 },
            negative: { percentage: 12.4, count: 11 }
          },
          responseOverview: {
            labels: ["Jan 1", "Jan 8", "Jan 15", "Jan 22", "Jan 29", "Feb 5"],
            data: [12, 19, 15, 25, 22, 18],
            dateRange: "January 1 - February 5, 2024"
          }
        };

        // Simulate API delay for realistic loading experience
        setTimeout(() => {
          setAnalyticsData(mockData);
          setLoading(false);
        }, 1000);

        // If you want to test backend connection, uncomment below:
        /*
        const response = await fetch('/api/events/1/analytics');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setAnalyticsData(data);
        */
      } catch (error) {
        console.error("Failed to fetch event analytics:", error);
        // Even if backend fails, we'll use mock data
        const fallbackData = {
          totalAttendees: 150,
          totalResponses: 89,
          responseRate: 59.3,
          responseBreakdown: {
            positive: { percentage: 67.4, count: 60 },
            neutral: { percentage: 20.2, count: 18 },
            negative: { percentage: 12.4, count: 11 }
          },
          responseOverview: {
            labels: ["Jan 1", "Jan 8", "Jan 15", "Jan 22", "Jan 29", "Feb 5"],
            data: [12, 19, 15, 25, 22, 18],
            dateRange: "January 1 - February 5, 2024"
          }
        };
        setAnalyticsData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Show a loading spinner while data is being fetched
  if (loading || !analyticsData) {
    return (
      <PSASLayout>
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PSASLayout>
    );
  }

  // === DYNAMIC DATA AND OPTIONS ===
  const {
    totalAttendees,
    totalResponses,
    responseRate,
    responseBreakdown,
    responseOverview,
  } = analyticsData;
  const remainingNonResponses = totalAttendees - totalResponses;

  const responseRateData = {
    datasets: [
      {
        data: [responseRate, 100 - responseRate],
        backgroundColor: ["#3B82F6", "#E5E7EB"],
        borderWidth: 0,
      },
    ],
  };

  const responseBreakdownData = {
    labels: ["Positive", "Neutral", "Negative"],
    datasets: [
      {
        data: [
          responseBreakdown.positive.percentage,
          responseBreakdown.neutral.percentage,
          responseBreakdown.negative.percentage,
        ],
        backgroundColor: ["#1E3A8A", "#3B82F6", "#93C5FD"],
        hoverBackgroundColor: ["#1E40AF", "#2563EB", "#60A5FA"],
      },
    ],
  };

  const responseOverviewData = {
    labels: responseOverview?.labels || [],
    datasets: [
      {
        label: "Responses",
        data: responseOverview?.data || [],
        backgroundColor: "#3B82F6",
      },
    ],
  };

  // === OPTIONS ===
  const responseRateOptions = {
    rotation: 270,
    circumference: 180,
    cutout: "70%",
    plugins: { legend: { display: false } },
  };

  const responseBreakdownOptions = {
    cutout: "60%",
    plugins: { legend: { display: false } },
  };

  const responseOverviewOptions = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 20 },
      },
    },
    plugins: { legend: { display: false } },
  };

  return (
    <PSASLayout>
      <div className="p-6 bg-gray-50 h-screen flex flex-col overflow-hidden gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Event Analytics</h1>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            className=" text-white p-4 rounded-lg shadow-md relative"
            style={{ background: "linear-gradient(180deg, #002474, #324BA3)" }}
          >
            <div className="absolute top-4 left-4">
              <img
                src={totalAttendeesIcon}
                alt="Total Event Attendees"
                className="w-6 h-6 opacity-80"
              />
            </div>
            <h2 className="text-lg font-semibold pl-10">
              Total Event Attendees
            </h2>
            <p className="text-4xl font-bold mt-1">{totalAttendees}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md relative">
            <div className="absolute top-4 left-4">
              <img
                src={totalResponseIcon}
                alt="Total Responses"
                className="w-6 h-6"
              />
            </div>
            <h2 className="text-lg font-semibold text-[#002474] pl-10">
              Total Responses
            </h2>
            <p className="text-4xl font-bold text-[#002474] mt-1">
              {totalResponses}
            </p>
          </div>
          <div
            className=" text-white p-4 rounded-lg shadow-md relative"
            style={{ background: "linear-gradient(180deg, #002474, #324BA3)" }}
          >
            <div className="absolute top-4 left-4">
              <img
                src={remainingNonResponseIcon}
                alt="Remaining Non-Responses"
                className="w-6 h-6 opacity-80"
              />
            </div>
            <h2 className="text-lg font-semibold pl-10">
              Remaining Non-Responses
            </h2>
            <p className="text-4xl font-bold mt-1">{remainingNonResponses}</p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Response Rate */}
          <div className="bg-white p-4 rounded-lg shadow-md flex flex-col justify-center items-center text-center">
            <h3 className="text-xl font-semibold w-full text-left">
              Response Rate
            </h3>
            <div className="relative h-40 w-full max-w-[300px] flex justify-center items-center my-4">
              <Doughnut data={responseRateData} options={responseRateOptions} />
              <div className="absolute text-center">
                <p className="text-3xl font-bold">{responseRate}%</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 px-2">
              The accepted percentage of collected responses is up to 50% and
              above.
            </p>
          </div>

          {/* Response Breakdown */}
          <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
            <h3 className="text-xl font-semibold text-left">
              Response Breakdown
            </h3>
            <div className="flex-grow flex items-center justify-center">
              <div className="w-1/2 h-full py-4">
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
                    Positive
                  </li>
                  <li className="flex items-center mb-2">
                    <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                    Neutral
                  </li>
                  <li className="flex items-center">
                    <span className="w-3 h-3 bg-blue-300 rounded-full mr-3"></span>
                    Negative
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Response Overview */}
          <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
            <h3 className="text-xl font-semibold">Response Overview</h3>
            <p className="text-sm text-gray-500 mb-2">
              {responseOverview.dateRange}
            </p>
            <div className="flex-grow relative">
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
          <div className="grid grid-cols-2 gap-6">
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
      </div>
    </PSASLayout>
  );
};

export default EventAnalytics;

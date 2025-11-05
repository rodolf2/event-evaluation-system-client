import { useState, useEffect } from 'react';
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
import StatsCards from "../../components/psas/eventanalytics/StatsCards";
import ChartsSection from "../../components/psas/eventanalytics/ChartsSection";

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
      <div className="p-6 bg-gray-50 min-h-screen flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Event Analytics</h1>
        </div>

        {/* Top Stats */}
        <StatsCards
          totalAttendees={totalAttendees}
          totalResponses={totalResponses}
          remainingNonResponses={remainingNonResponses}
        />

        {/* Main Content Area */}
        <ChartsSection
          responseRate={responseRate}
          responseOverview={responseOverview}
          responseRateData={responseRateData}
          responseBreakdownData={responseBreakdownData}
          responseOverviewData={responseOverviewData}
          responseRateOptions={responseRateOptions}
          responseBreakdownOptions={responseBreakdownOptions}
          responseOverviewOptions={responseOverviewOptions}
          responseBreakdown={responseBreakdown}
        />
      </div>
    </PSASLayout>
  );
};

export default EventAnalytics;

import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import PSASLayout from "../../components/psas/PSASLayout";
import ReportHeader from "./ReportHeader";
import ReportDescription from "./ReportDescription";
import ReportActions from "./ReportActions";

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

  // Sample quantitative ratings data
  const quantitativeRatings = [
    {
      category: "Event Organization",
      rating: 4.5,
      totalResponses: 45,
      average: 4.5,
    },
    {
      category: "Content Quality",
      rating: 4.7,
      totalResponses: 45,
      average: 4.7,
    },
    {
      category: "Speaker Performance",
      rating: 4.8,
      totalResponses: 45,
      average: 4.8,
    },
    {
      category: "Venue & Facilities",
      rating: 4.3,
      totalResponses: 45,
      average: 4.3,
    },
    {
      category: "Networking Opportunities",
      rating: 4.6,
      totalResponses: 45,
      average: 4.6,
    },
    {
      category: "Overall Satisfaction",
      rating: 4.6,
      totalResponses: 45,
      average: 4.6,
    },
  ];

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 4.0) return "text-blue-600";
    if (rating >= 3.5) return "text-yellow-600";
    return "text-red-600";
  };

  const getRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <svg
            key={`full-${i}`}
            className="w-5 h-5 text-yellow-400 fill-current"
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
        {hasHalfStar && (
          <svg
            className="w-5 h-5 text-yellow-400 fill-current"
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg
            key={`empty-${i}`}
            className="w-5 h-5 text-gray-300 fill-current"
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
      </div>
    );
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
              <p className="text-sm text-gray-600 mb-6">
                Total Categories: {quantitativeRatings.length} | Total Responses:{" "}
                {quantitativeRatings[0]?.totalResponses || 0}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-900 text-white">
                      <th className="border border-gray-300 px-4 py-3 text-left">
                        Category
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center">
                        Rating
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center">
                        Average
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center">
                        Visual Rating
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {quantitativeRatings.map((item, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="border border-gray-300 px-4 py-3 font-medium">
                          {item.category}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center">
                          <span className={`font-bold ${getRatingColor(item.rating)}`}>
                            {item.rating.toFixed(1)}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center">
                          {item.average.toFixed(1)}
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <div className="flex items-center justify-center">
                            {getRatingStars(item.rating)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-900 rounded-r-lg">
                <h5 className="font-bold text-blue-900 mb-2">Summary</h5>
                <p className="text-gray-700">
                  The overall quantitative ratings indicate strong performance
                  across all categories, with an average rating of{" "}
                  <span className="font-bold">
                    {(quantitativeRatings.reduce((sum, item) => sum + item.rating, 0) /
                      quantitativeRatings.length).toFixed(1)}
                  </span>{" "}
                  out of 5.0. The highest-rated category is{" "}
                  <span className="font-bold">
                    {quantitativeRatings.reduce((max, item) =>
                      item.rating > max.rating ? item : max
                    ).category}
                  </span>{" "}
                  with a rating of{" "}
                  <span className="font-bold">
                    {quantitativeRatings.reduce((max, item) =>
                      item.rating > max.rating ? item : max
                    ).rating.toFixed(1)}
                  </span>
                  .
                </p>
              </div>
            </main>
            <div className="bg-blue-900 text-white text-center py-4 rounded-b-lg">
              <p>
                MacArthur Highway, Sampaloc, Apalit, Pampanga 2016 |
                info@laverdad.edu.ph
              </p>
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

  return <PSASLayout>{content}</PSASLayout>;
};

export default QuantitativeRatings;
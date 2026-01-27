// src/components/DashboardCard.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, BarChart2, Award, ClipboardCheck } from "lucide-react";

const DashboardCard = ({ image, title, buttonText, link, icon: Icon }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  // Generate consistent gradient color based on title
  const getGradientColor = (title) => {
    const colors = [
      "from-blue-600 to-blue-800",
      "from-indigo-600 to-indigo-800",
      "from-purple-600 to-purple-800",
      "from-teal-600 to-teal-800",
      "from-cyan-600 to-cyan-800",
      "from-emerald-600 to-emerald-800",
    ];
    const hash = (title || "Card")
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Get appropriate icon based on card title
  const getCardIcon = (title) => {
    if (Icon) return Icon;
    const lowerTitle = title?.toLowerCase() || "";
    if (lowerTitle.includes("certificate")) return Award;
    if (lowerTitle.includes("analytics")) return BarChart2;
    if (lowerTitle.includes("evaluation")) return ClipboardCheck;
    return FileText;
  };

  const getNavigationPath = (title) => {
    if (link) return link;

    switch (title) {
      case "Event Analytics":
        return "/psas/analytics";
      case "Event Reports":
        return "/psas/reports";
      case "My Evaluations":
        return "/student/evaluations";
      case "My Certificates":
        return "/student/certificates";
      default:
        return "#";
    }
  };

  const handleButtonClick = () => {
    const path = getNavigationPath(title);
    if (path !== "#") {
      navigate(path);
    }
  };

  const CardIcon = getCardIcon(title);

  // Render CSS gradient fallback
  const renderGradientFallback = () => (
    <div
      className={`rounded-md mb-3 w-full h-48 bg-linear-to-br ${getGradientColor(title)} flex flex-col items-center justify-center`}
    >
      <div className="bg-white/20 rounded-full p-4 mb-2">
        <CardIcon className="w-10 h-10 text-white" />
      </div>
      <p className="text-white text-sm font-medium opacity-90">{title}</p>
    </div>
  );

  return (
    <div
      onClick={handleButtonClick}
      className="bg-white rounded-xl shadow p-4 flex flex-col items-center hover:shadow-lg cursor-pointer h-full transition-shadow duration-300"
    >
      {image && !imageError ? (
        <img
          src={image}
          alt={title}
          className="rounded-md mb-3 w-full h-48 object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        renderGradientFallback()
      )}
      <button
        className="text-blue-600 font-medium hover:underline text-base mt-auto"
      >
        {buttonText}
      </button>
    </div>
  );
};

export default DashboardCard;

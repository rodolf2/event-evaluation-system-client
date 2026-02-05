// src/components/psas/DashboardCard.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  BarChart2,
  Users,
  Activity,
  ClipboardList,
  FileCheck,
} from "lucide-react";

const DashboardCard = ({ image, title, buttonText, link, gradientColor }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  // Generate consistent gradient color based on title
  const getGradientColor = (title) => {
    // Primary system color gradient
    const systemGradient = "from-[#1E3A8A] to-[#1e40af]"; // Blue-900 to Blue-800
    
    const colors = [
      systemGradient,
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
    const lowerTitle = title?.toLowerCase() || "";
    if (lowerTitle.includes("analytics")) return BarChart2;
    if (lowerTitle.includes("report")) return FileCheck;
    if (lowerTitle.includes("user") || lowerTitle.includes("role"))
      return Users;
    if (lowerTitle.includes("health") || lowerTitle.includes("system"))
      return Activity;
    if (lowerTitle.includes("audit") || lowerTitle.includes("log"))
      return ClipboardList;
    return FileText;
  };

  const getNavigationPath = () => {
    // Use the link prop if provided, otherwise fall back to title-based routing
    if (link) {
      return link;
    }

    switch (title) {
      case "Event Analytics":
        return "/psas/analytics";
      case "Event Reports":
        return "/psas/reports";
      case "User Statistics":
        return "/mis/user-statistics";
      case "System Health":
        return "/mis/system-health";
      default:
        return "#";
    }
  };

  const handleCardClick = () => {
    const path = getNavigationPath();
    if (path !== "#") {
      navigate(path);
    }
  };

  const CardIcon = getCardIcon(title);

  // Render CSS gradient fallback
  const renderGradientFallback = () => (
    <div
      className={`rounded-md mb-3 w-full h-48 bg-linear-to-br ${gradientColor || getGradientColor(title)} flex flex-col items-center justify-center`}
    >
      <div className="bg-white/20 rounded-full p-4">
        <CardIcon className="w-10 h-10 text-white" />
      </div>
    </div>
  );

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-xl shadow p-4 flex flex-col items-center hover:shadow-lg cursor-pointer h-full transition-all duration-300 border border-gray-100"
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
      <div className="flex-1 w-full flex items-center justify-center pt-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
          className="text-blue-600 font-medium hover:underline text-base mt-auto transition-colors duration-200"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default DashboardCard;

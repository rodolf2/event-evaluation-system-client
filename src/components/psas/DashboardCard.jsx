// src/components/DashboardCard.jsx
import { useNavigate } from "react-router-dom";

const DashboardCard = ({ image, title, buttonText, link }) => {
  const navigate = useNavigate();

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

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-xl shadow p-4 flex flex-col items-center hover:shadow-lg cursor-pointer h-full transition-shadow duration-200"
    >
      {image ? (
        <img
          src={image}
          alt={title}
          className="rounded-md mb-3 w-full h-48 object-cover"
        />
      ) : (
        <div className="rounded-md mb-3 w-full h-48 bg-linear-to-br from-blue-100 to-blue-200 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">
              {title === "User Statistics" && "📊"}
              {title === "System Health" && "🖥️"}
              {title === "Event Analytics" && "📈"}
              {title === "Event Reports" && "📋"}
              {title === "User Roles" && "👥"}
              {title === "Audit Logs" && "📑"}
              {![
                "User Statistics",
                "System Health",
                "Event Analytics",
                "Event Reports",
                "User Roles",
                "Audit Logs",
              ].includes(title) && "📁"}
            </div>
            <span className="text-gray-500 text-sm">{title}</span>
          </div>
        </div>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleCardClick();
        }}
        className="text-blue-600 font-medium hover:underline text-base"
      >
        {buttonText}
      </button>
    </div>
  );
};

export default DashboardCard;

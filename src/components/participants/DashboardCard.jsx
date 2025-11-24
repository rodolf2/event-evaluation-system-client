// src/components/DashboardCard.jsx
import { useNavigate } from "react-router-dom";

import { FileText } from "lucide-react";

const DashboardCard = ({ image, title, buttonText, link, icon: Icon }) => {
  const navigate = useNavigate();

  const getNavigationPath = (title) => {
    if (link) return link;

    switch (title) {
      case "Event Analytics":
        return "/psas/analytics";
      case "Event Reports":
        return "/psas/reports";
      case "My Evaluations":
        return "/participant/evaluations";
      case "My Certificates":
        return "/participant/certificates";
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

  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center hover:shadow-lg cursor-pointer h-full transition-shadow duration-300">
      {image ? (
        <img
          src={image}
          alt={title}
          className="rounded-md mb-3 w-full h-48 object-cover"
        />
      ) : (
        <div className="rounded-md mb-3 w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
          {Icon ? (
            <Icon className="w-16 h-16" />
          ) : (
            <FileText className="w-16 h-16" />
          )}
        </div>
      )}
      <button
        onClick={handleButtonClick}
        className="text-blue-600 font-medium hover:underline text-base mt-auto"
      >
        {buttonText}
      </button>
    </div>
  );
};

export default DashboardCard;

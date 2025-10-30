// src/components/DashboardCard.jsx
import { useNavigate } from "react-router-dom";

const DashboardCard = ({ image, title, buttonText, link }) => {
  const navigate = useNavigate();

  const getNavigationPath = (title) => {
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
        return link || "#";
    }
  };

  const handleButtonClick = () => {
    const path = getNavigationPath(title);
    if (path !== "#") {
      navigate(path);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center hover:shadow-lg cursor-pointer">
      <img src={image} alt={title} className="rounded-md mb-4 w-40 h-40 object-cover" />
      <button
        onClick={handleButtonClick}
        className="text-blue-600 font-medium hover:underline text-lg"
      >
        {buttonText}
      </button>
    </div>
  );
};

export default DashboardCard;

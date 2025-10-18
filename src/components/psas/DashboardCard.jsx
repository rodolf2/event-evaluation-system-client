// src/components/DashboardCard.jsx
const DashboardCard = ({ image, title, buttonText }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
      <img src={image} alt={title} className="rounded-md mb-3" />
      <button className="text-blue-600 font-medium hover:underline">
        {buttonText}
      </button>
    </div>
  );
};

export default DashboardCard;

// src/components/RecentActivity.jsx
const activities = [
  [
    "Generated Report",
    "Evaluation Report for ICT Week Celebration has been generated",
  ],
  [
    "Evaluation Created",
    "Evaluation Form for Child Protection Seminar has been created",
  ],
  ["Profile Updated", "Profile picture has been updated"],
  ["Changed Password", "Default password has been changed"],
  ["Welcome Aboard!", "First access to account"],
];

const RecentActivity = () => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 mb-3">
        Recent Activity
      </h3>
      <div className="space-y-2 ">
        {activities.map(([title, desc], i) => (
          <div
            key={i}
            className="bg-white shadow rounded-md p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:shadow-lg"
          >
            <span className="font-medium text-gray-800">{title}</span>
            <span className="text-gray-600 text-sm">{desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;

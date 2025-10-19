// src/components/Reminders.jsx
import { Trash2 } from "lucide-react";

const Reminders = ({ reminders, onDelete }) => {
  const safeReminders = Array.isArray(reminders) ? reminders : [];

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="text-lg font-semibold mb-3">
        Reminders ({safeReminders.length})
      </h3>
      {safeReminders.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">
          No reminders yet. Click on a date to add one.
        </p>
      ) : (
        <ul className="space-y-2 max-h-[300px] overflow-y-auto">
          {safeReminders.map((reminder) => (
            <li
              key={reminder._id || reminder.id}
              className="flex justify-between items-start text-gray-700 text-sm group p-2 hover:bg-gray-50 rounded"
            >
              <div className="flex-1 pr-4">
                <div className="font-semibold mb-1">{reminder.title}</div>
                <div className="text-gray-600">{reminder.description}</div>
                <div className="text-gray-400 text-xs mt-1">
                  {new Date(reminder.date).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center mt-1">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                <button
                  onClick={() => onDelete(reminder._id || reminder.id)}
                  className="ml-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                  aria-label="Delete reminder"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Reminders;

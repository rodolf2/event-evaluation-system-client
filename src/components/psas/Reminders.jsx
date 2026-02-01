// src/components/Reminders.jsx
import { Trash2 } from "lucide-react";

const Reminders = ({ reminders, onDelete }) => {
  const safeReminders = Array.isArray(reminders) ? reminders : [];

  return (
    <div className="bg-white rounded-xl shadow p-4 max-h-[400px] flex flex-col">
      <h3 className="text-lg font-semibold mb-3">
        Reminders ({safeReminders.length})
      </h3>
      {safeReminders.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">
          No reminders yet. Click on a date to add one.
        </p>
      ) : (
        <ul className="space-y-2 overflow-y-auto flex-1 pr-1 custom-scrollbar">
          {safeReminders.map((reminder) => (
            <li
              key={reminder._id || reminder.id}
              className="flex justify-between items-start text-gray-700 text-sm group p-2 hover:bg-gray-50 rounded transition-colors"
            >
              <div className="flex-1 pr-4 min-w-0">
                <div className="font-bold text-gray-900 truncate">
                  {reminder.title}
                </div>
                <div className="text-gray-500 text-xs truncate">
                  {new Date(reminder.date).toLocaleDateString()}
                </div>
                {reminder.description && (
                  <div className="text-gray-400 text-[10px] mt-0.5 line-clamp-1">
                    {reminder.description}
                  </div>
                )}
              </div>
              <div className="flex items-center mt-1 shrink-0">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                <button
                  onClick={() => onDelete(reminder._id || reminder.id)}
                  className="ml-2 text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:text-red-600"
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

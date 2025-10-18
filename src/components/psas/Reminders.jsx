// src/components/Reminders.jsx
import { Trash2 } from 'lucide-react';

const Reminders = ({ reminders, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="text-lg font-semibold mb-3">Reminders ({reminders.length})</h3>
      <ul className="space-y-2">
        {reminders.map((reminder) => (
          <li
            key={reminder._id}
            className="flex justify-between items-center text-gray-700 text-sm group"
          >
            <span><strong>{reminder.title}:</strong> {reminder.description} ({new Date(reminder.date).toLocaleDateString()})</span>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              <button onClick={() => onDelete(reminder._id)} className="ml-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Reminders;

// CalendarWidget.jsx for MIS
import { useState } from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CalendarWidget = ({ openModal, reminders = [] }) => {
  const [month, setMonth] = useState(dayjs());

  const daysInMonth = month.daysInMonth();
  const startDay = month.startOf("month").day();

  // Ensure reminders is always an array
  const safeReminders = Array.isArray(reminders) ? reminders : [];

  // Helper function to check if a date has reminders
  const hasReminder = (date) => {
    return safeReminders.some(
      (reminder) =>
        dayjs(reminder.date).format("YYYY-MM-DD") === date.format("YYYY-MM-DD")
    );
  };

  const handlePrev = () => setMonth(month.subtract(1, "month"));
  const handleNext = () => setMonth(month.add(1, "month"));

  return (
    <div className="bg-white rounded-xl shadow p-4 h-90 flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrev}>
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="font-bold text-gray-800 text-lg">
          {month.format("MMMM YYYY")}
        </h2>
        <button onClick={handleNext}>
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Day headers row */}
      <div className="grid grid-cols-7 text-center text-xs text-gray-600 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div
            key={day}
            className="font-semibold flex items-center justify-center"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Dates grid */}
      <div className="grid grid-cols-7 text-center text-xs text-gray-600 flex-1 gap-y-1">
        {[...Array(startDay)].map((_, i) => (
          <div key={`empty-${i}`}></div>
        ))}

        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const date = month.date(day);
          const isToday = date.isSame(dayjs(), "day");

          const handleDayClick = (e) => {
            const calendarRect = e.currentTarget
              .closest(".bg-white")
              .getBoundingClientRect();
            openModal(date, {
              x: calendarRect.left,
              y: calendarRect.top + 50,
            });
          };

          const hasReminderForDay = hasReminder(date);

          return (
            <div
              key={day}
              onClick={handleDayClick}
              className="relative flex items-center justify-center cursor-pointer group"
            >
              <div
                className={`rounded-lg w-8 h-8 flex items-center justify-center text-xs
                  ${
                    isToday
                      ? "bg-[#1F3463] text-white font-bold"
                      : hasReminderForDay
                      ? "bg-blue-100 text-[#1F3463]"
                      : "text-gray-700 group-hover:bg-gray-100"
                  }`}
              >
                {day}
              </div>
              {hasReminderForDay && (
                <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-[#1F3463]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarWidget;

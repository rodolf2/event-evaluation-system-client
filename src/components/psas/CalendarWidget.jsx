// inside CalendarWidget.jsx
import { useState } from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CalendarWidget = ({ openModal, reminders = [] }) => {
  const [month, setMonth] = useState(dayjs());

  const daysInMonth = month.daysInMonth();
  const startDay = month.startOf("month").day();

  // Helper function to check if a date has reminders
  const hasReminder = (date) => {
    return reminders.some(
      (reminder) =>
        dayjs(reminder.date).format("YYYY-MM-DD") === date.format("YYYY-MM-DD")
    );
  };

  const handlePrev = () => setMonth(month.subtract(1, "month"));
  const handleNext = () => setMonth(month.add(1, "month"));

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex justify-between items-center mb-3">
        <button onClick={handlePrev}>
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="font-semibold text-gray-700">
          {month.format("MMMM YYYY")}
        </h2>
        <button onClick={handleNext}>
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-sm text-gray-600">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="font-semibold">
            {day}
          </div>
        ))}

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
              x: calendarRect.left, // Position relative to calendar left edge
              y: calendarRect.top + 50, // Position below the month header
            });
          };

          const hasReminderForDay = hasReminder(date);

          return (
            <div
              key={day}
              onClick={handleDayClick}
              className="relative p-2 cursor-pointer group"
            >
              <div
                className={`rounded-full p-2 flex items-center justify-center
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
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-[#1F3463]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarWidget;

// inside CalendarWidget.jsx
import { useState } from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CalendarWidget = ({
  openModal,
  reminders = [],
  onDateSelect,
  selectedStartDate: propStartDate,
  selectedEndDate: propEndDate,
  onRangeSelect,
}) => {
  const [month, setMonth] = useState(dayjs());
  const [selectedStartDate, setSelectedStartDate] = useState(
    propStartDate || null
  );
  const [selectedEndDate, setSelectedEndDate] = useState(propEndDate || null);

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

  // Helper function to check if date is within selected range
  const isInRange = (date) => {
    if (!selectedStartDate || !selectedEndDate) return false;
    return (
      date.isAfter(selectedStartDate.subtract(1, "day")) &&
      date.isBefore(selectedEndDate.add(1, "day"))
    );
  };

  // Helper function to check if date is start or end date
  const isStartOrEnd = (date) => {
    if (!selectedStartDate && !selectedEndDate) return false;
    return (
      date.isSame(selectedStartDate, "day") ||
      date.isSame(selectedEndDate, "day")
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
          const isPast = date.isBefore(dayjs(), "day");

          const handleDayClick = (e) => {
            if (isPast) return; // Prevent interaction with past dates
            if (onRangeSelect) {
              // Handle date range selection
              if (!selectedStartDate) {
                setSelectedStartDate(date);
                onRangeSelect(date, null);
              } else if (!selectedEndDate && date.isBefore(selectedStartDate)) {
                // If clicking an earlier date, treat as new start date
                setSelectedStartDate(date);
                onRangeSelect(date, null);
                setSelectedEndDate(null);
              } else if (!selectedEndDate) {
                setSelectedEndDate(date);
                onRangeSelect(selectedStartDate, date);
              } else {
                // Reset and start new selection
                setSelectedStartDate(date);
                setSelectedEndDate(null);
                onRangeSelect(date, null);
              }
            } else if (onDateSelect) {
              onDateSelect(date);
            } else {
              const calendarRect = e.currentTarget
                .closest(".bg-white")
                .getBoundingClientRect();
              openModal(date, {
                x: calendarRect.left, // Position relative to calendar left edge
                y: calendarRect.top + 50, // Position below the month header
              });
            }
          };

          const hasReminderForDay = hasReminder(date);
          const inRange = isInRange(date);
          const isStartOrEndDate = isStartOrEnd(date);

          return (
            <div
              key={day}
              onClick={handleDayClick}
              className={`relative flex flex-col items-center justify-center group ${isPast ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                }`}
            >
              <div
                className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm transition-all
                  ${isStartOrEndDate
                    ? "bg-[#1E3A8A] text-white font-bold scale-105"
                    : inRange
                      ? "bg-blue-50 text-blue-700"
                      : isToday
                        ? "bg-[#1E3A8A] text-white font-bold"
                        : hasReminderForDay
                          ? "bg-blue-100 text-[#1E3A8A] font-semibold"
                          : "text-gray-700 group-hover:bg-gray-100"
                  }`}
              >
                {day}
              </div>
              <div className="h-1 mt-0.5 flex items-center justify-center">
                {hasReminderForDay && (
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarWidget;

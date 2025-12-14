import { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { Calendar } from "lucide-react";
import "react-day-picker/style.css";

const EventDates = ({ startDate, setStartDate, endDate, setEndDate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [range, setRange] = useState({
    from: startDate ? new Date(startDate) : undefined,
    to: endDate ? new Date(endDate) : undefined,
  });
  const containerRef = useRef(null);

  // Sync external props with internal range state
  useEffect(() => {
    setRange({
      from: startDate ? new Date(startDate) : undefined,
      to: endDate ? new Date(endDate) : undefined,
    });
  }, [startDate, endDate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRangeSelect = (selectedRange) => {
    setRange(selectedRange);

    // Helper to format date in local timezone (YYYY-MM-DD)
    const formatLocalDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    if (selectedRange?.from) {
      setStartDate(formatLocalDate(selectedRange.from));
    } else {
      setStartDate("");
    }

    if (selectedRange?.to) {
      setEndDate(formatLocalDate(selectedRange.to));
    } else {
      setEndDate("");
    }
  };

  const formatDateRange = () => {
    if (!range?.from) return "Pick a date range";

    const formatDate = (date) => {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    if (!range.to) return formatDate(range.from);
    return `${formatDate(range.from)} - ${formatDate(range.to)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Event Dates</h3>

      <div ref={containerRef} className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date Range *
        </label>

        {/* Date Range Input Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-3 border border-gray-300 rounded-md px-3 py-2.5 text-left hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white transition-colors"
        >
          <Calendar className="w-5 h-5 text-gray-400" />
          <span className={range?.from ? "text-gray-900" : "text-gray-400"}>
            {formatDateRange()}
          </span>
        </button>

        {/* Calendar Dropdown */}
        {isOpen && (
          <div className="absolute z-50 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <style>
              {`
                .custom-calendar .rdp-nav {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  width: 100%;
                }
                .custom-calendar .rdp-month_caption {
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  flex: 1;
                }
                .custom-calendar .rdp-caption_label {
                  font-weight: 600;
                  font-size: 1rem;
                }
                .custom-calendar .rdp-day {
                  border-radius: 6px;
                }
                .custom-calendar .rdp-day_button {
                  border-radius: 6px;
                }
                .custom-calendar .rdp-selected .rdp-day_button,
                .custom-calendar .rdp-range_start .rdp-day_button,
                .custom-calendar .rdp-range_end .rdp-day_button {
                  background-color: #1F3463 !important;
                  color: white !important;
                  border-radius: 6px;
                }
                .custom-calendar .rdp-range_middle .rdp-day_button {
                  background-color: #EBF1FF !important;
                  color: #1F3463 !important;
                  border-radius: 0;
                }
                .custom-calendar .rdp-range_start .rdp-day_button {
                  border-radius: 6px 0 0 6px;
                }
                .custom-calendar .rdp-range_end .rdp-day_button {
                  border-radius: 0 6px 6px 0;
                }
              `}
            </style>
            <div className="custom-calendar">
              <DayPicker
                mode="range"
                selected={range}
                onSelect={handleRangeSelect}
                numberOfMonths={1}
                showOutsideDays
                style={{
                  "--rdp-accent-color": "#1e3a5f",
                  "--rdp-accent-background-color": "#1e3a5f",
                  "--rdp-range_middle-background-color":
                    "rgba(30, 58, 95, 0.2)",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Validation message */}
      {range?.from && range?.to && range.from >= range.to && (
        <p className="text-red-600 text-sm mt-2">
          End date must be after start date
        </p>
      )}
    </div>
  );
};

export default EventDates;

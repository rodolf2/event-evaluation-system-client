// src/components/psas/ReminderModal.jsx
import { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";

const ReminderModal = ({
  isOpen,
  onClose,
  onAddReminder,
  selectedDate,
  position,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Calculate scrollbar width
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      // Prevent body scroll and compensate for scrollbar
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      // Restore body scroll and remove padding compensation
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (dayjs(selectedDate).isBefore(dayjs(), "day")) {
      alert("Cannot add reminders for past dates.");
      return;
    }
    if (title) {
      onAddReminder({ title, description, date: selectedDate });
      setTitle("");
      setDescription("");
      onClose();
    }
  };

  if (!isOpen) return null;

  // Calculate modal position based on screen size
  const modalStyle = position
    ? window.innerWidth >= 768
      ? {
        position: "fixed",
        right: `${window.innerWidth - position.x + 20}px`,
        top: `${Math.min(
          Math.max(position.y, 60),
          window.innerHeight - 400
        )}px`,
      }
      : {
        position: "fixed",
        top: "50%",
        transform: "translateY(-50%)",
      }
    : {};

  return (
    <>
      {/* Background with backdrop blur effect */}
      <div className="fixed inset-0 bg-[#F1F0F0]/80 z-40 modal-overlay" />

      {/* Modal */}
      <div
        ref={modalRef}
        style={modalStyle}
        className="fixed z-50 w-[90vw] md:w-[360px] mx-auto left-0 right-0 md:left-auto md:right-auto md:mx-0"
      >
        {/* Modal Content */}
        <div className="relative bg-white rounded-lg shadow-lg">
          <div className="bg-[#1F3463] text-white p-4 flex justify-between items-center rounded-tl-lg rounded-tr-lg relative">
            <h2 className="text-xl font-semibold">Set Reminder</h2>
            {/* Arrow */}
            <div className="absolute top-1/2 -translate-y-1/2 right-[-16px] w-0 h-0
              border-t-[12px] border-t-transparent
              border-b-[12px] border-b-transparent
              border-l-[16px] border-l-[#1F3463] hidden md:block">
            </div>
          </div>
          <form onSubmit={handleSubmit} className="p-4">
            <div className="mb-3">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Reminder Title:
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Add Title"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description:
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                rows="3"
                placeholder="Add description ..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ReminderModal;

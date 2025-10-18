// src/components/psas/ReminderModal.jsx
import { useState, useEffect, useRef } from "react";

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
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      // Restore body scroll when modal closes
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title) {
      onAddReminder({ title, description, date: selectedDate });
      setTitle("");
      setDescription("");
      onClose();
    }
  };

  if (!isOpen) return null;

  // Calculate modal position
  const modalStyle = position
    ? {
        position: "fixed",
        right: `${window.innerWidth - position.x + 20}px`, // Position to the left of the click position
        top: `${position.y}px`,
      }
    : {};

  return (
    <>
      {/* Background with backdrop blur effect */}
      <div className="fixed inset-0 backdrop-blur-[2px] bg-white/5 z-40 modal-overlay" />

      {/* Modal */}
      <div ref={modalRef} style={modalStyle} className="fixed z-50 w-[360px]">
        {/* Modal Content */}
        <div className="relative bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Arrow - Pointing right and outside container */}
          {/* <div className="absolute right-[-12px] top-3 w-4 h-4 bg-white transform rotate-45 border-t border-r border-gray-200 shadow-[3px_-3px_4px_rgba(0,0,0,0.1)] z-10" /> */}
          <div className="bg-[#1F3463] text-white p-4">
            <h2 className="text-xl font-semibold">Set Reminder</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-4">
            <div className="mb-3">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Reminder Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#1F3463] focus:border-[#1F3463] text-sm"
                placeholder="Enter reminder title"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#1F3463] focus:border-[#1F3463] text-sm"
                rows="3"
                placeholder="Enter description"
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
                className="px-4 py-2 text-sm font-medium text-white bg-[#1F3463] rounded-md hover:bg-[#162544] focus:outline-none"
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

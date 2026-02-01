// src/components/psas/ReminderModal.jsx
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { Trash2, Edit2, Plus, X, Save } from "lucide-react";

const ReminderModal = ({
  isOpen,
  onClose,
  onAddReminder,
  onUpdateReminder,
  onDeleteReminder,
  reminders = [],
  selectedDate,
  position,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  
  const modalRef = useRef(null);

  // Filter reminders for the selected date
  const dateReminders = reminders.filter(
    (r) => dayjs(r.date).format("YYYY-MM-DD") === dayjs(selectedDate).format("YYYY-MM-DD")
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      // Auto-show add form if no reminders exist
      setShowAddForm(dateReminders.length === 0);
      setEditingId(null);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    };
  }, [isOpen, onClose, dateReminders.length]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (dayjs(selectedDate).isBefore(dayjs(), "day")) {
      toast.error("Cannot add reminders for past dates.");
      return;
    }
    if (title) {
      onAddReminder({ title, description, date: selectedDate });
      setTitle("");
      setDescription("");
      setShowAddForm(false);
    }
  };

  const handleUpdate = (id) => {
    if (!editTitle) return;
    onUpdateReminder(id, { title: editTitle, description: editDescription });
    setEditingId(null);
  };

  const startEditing = (reminder) => {
    setEditingId(reminder._id);
    setEditTitle(reminder.title);
    setEditDescription(reminder.description || "");
    setShowAddForm(false);
  };

  if (!isOpen) return null;

  const modalStyle = position
    ? window.innerWidth >= 768
      ? {
        position: "fixed",
        right: `${window.innerWidth - position.x + 20}px`,
        top: `${Math.min(
          Math.max(position.y, 60),
          window.innerHeight - 500
        )}px`,
        transform: "none",
      }
      : {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }
    : {};

  return (
    <>
      <div className="fixed inset-0 bg-[#F1F0F0]/80 z-40 modal-overlay" />

      <div
        ref={modalRef}
        style={modalStyle}
        className="fixed z-50 w-[90vw] md:w-[360px]"
      >
        <div className="relative bg-white rounded-lg shadow-lg flex flex-col">
          {/* Header */}
          <div className="bg-[#1F3463] text-white p-4 flex justify-between items-center relative shrink-0">
            <h2 className="text-xl font-semibold">Reminders</h2>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
            
            {/* Arrow for Desktop */}
            <div className="absolute top-1/2 -translate-y-1/2 right-[-16px] w-0 h-0
              border-t-[12px] border-t-transparent
              border-b-[12px] border-b-transparent
              border-l-[16px] border-l-[#1F3463] hidden md:block">
            </div>
          </div>

          <div className="overflow-y-auto custom-scrollbar p-4 space-y-4 max-h-[400px]">
            {/* Existing Reminders List */}
            {dateReminders.length > 0 && (
              <div className="space-y-3">
                {dateReminders.map((r) => (
                  <div key={r._id} className="bg-gray-50 rounded-md p-3 border border-gray-200 relative group">
                    {editingId === r._id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full border-2 border-blue-500 rounded-md p-2 text-sm outline-none bg-white"
                          placeholder="Reminder Title"
                        />
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full border-2 border-blue-500 rounded-md p-2 text-sm outline-none bg-white resize-none"
                          rows="3"
                          placeholder="Description (optional)"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleUpdate(r._id)}
                            className="bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-green-700 shadow-sm flex items-center gap-1.5"
                          >
                            <Save className="w-3.5 h-3.5" />
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start pr-12">
                          <h3 className="font-bold text-gray-900 leading-tight">{r.title}</h3>
                          <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEditing(r)}
                              className="p-1 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteReminder(r._id)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        {r.description && (
                          <p className="text-gray-600 text-sm mt-1 line-clamp-2 whitespace-pre-wrap">{r.description}</p>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add New Section */}
            {!editingId && (
              <>
                {!showAddForm ? (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Reminder</span>
                  </button>
                ) : (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">New Reminder</h3>
                      {dateReminders.length > 0 && (
                        <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Reminder Title:</label>
                        <input
                          type="text"
                          id="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full border-2 border-gray-300 rounded-md p-2 text-sm focus:border-blue-500 outline-none"
                          placeholder="Add Title"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description:</label>
                        <textarea
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full border-2 border-gray-300 rounded-md p-2 text-sm focus:border-blue-500 outline-none resize-none"
                          rows="3"
                          placeholder="Add description ..."
                        />
                      </div>
                      <div className="flex justify-end pt-2 gap-2">
                        {dateReminders.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setShowAddForm(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="submit"
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ReminderModal;

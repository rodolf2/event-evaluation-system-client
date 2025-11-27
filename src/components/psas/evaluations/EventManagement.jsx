import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/useAuth";
import { Upload, Plus, Eye, Users, Copy } from "lucide-react";
import EventCreationForm from "./EventCreationForm";
import toast from "react-hot-toast";

const EventManagement = () => {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [uploadingEventId, setUploadingEventId] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        toast.error("Failed to fetch events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const handleEventCreated = (newEvent) => {
    setEvents((prev) => [newEvent, ...prev]);
    setShowCreateForm(false);
  };

  const handleAttendeeUpload = async (eventId, file) => {
    if (!file) return;

    setUploadingEventId(eventId);

    const formData = new FormData();
    formData.append("attendees", file);

    try {
      const response = await fetch(`/api/events/${eventId}/attendees`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message);
        // Refresh events to show updated attendee count
        fetchEvents();
      } else {
        toast.error(data.error || "Failed to upload attendees");
      }
    } catch (error) {
      console.error("Error uploading attendees:", error);
      toast.error("Failed to upload attendees");
    } finally {
      setUploadingEventId(null);
    }
  };

  const copyVerificationCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Verification code copied to clipboard");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Management</h1>
          <p className="text-gray-600">Create events and manage attendee lists for guest evaluations</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Create Event
        </button>
      </div>

      {/* Events List */}
      <div className="grid gap-4">
        {events.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Users size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
            <p className="text-gray-600 mb-4">Create your first event to start managing attendee evaluations</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Create Event
            </button>
          </div>
        ) : (
          events.map((event) => (
            <div key={event._id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                  <p className="text-gray-600">{new Date(event.date).toLocaleDateString()}</p>
                  {event.description && (
                    <p className="text-gray-500 text-sm mt-1">{event.description}</p>
                  )}
                </div>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
                  {event.category}
                </span>
              </div>

              {/* Verification Code */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-gray-50 border rounded-md font-mono text-sm">
                    {event.verificationCode}
                  </code>
                  <button
                    onClick={() => copyVerificationCode(event.verificationCode)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition"
                    title="Copy verification code"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Share this code with attendees for guest login
                </p>
              </div>

              {/* Attendee Management */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users size={16} />
                  <span>{event.attendees?.length || 0} attendees registered</span>
                </div>

                <div className="flex gap-2">
                  {/* File Upload */}
                  <label className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer">
                    <Upload size={16} />
                    {uploadingEventId === event._id ? "Uploading..." : "Upload Attendees"}
                    <input
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          handleAttendeeUpload(event._id, file);
                        }
                        e.target.value = ""; // Reset input
                      }}
                      disabled={uploadingEventId === event._id}
                    />
                  </label>

                  {/* View Details */}
                  <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                    <Eye size={16} />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <EventCreationForm
            onEventCreated={handleEventCreated}
            onClose={() => setShowCreateForm(false)}
          />
        </div>
      )}
    </div>
  );
};

export default EventManagement;
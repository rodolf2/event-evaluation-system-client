import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Mail,
  MailOpen,
} from "lucide-react";
import ParticipantLayout from "../../components/participants/ParticipantLayout";
import { useAuth } from "../../contexts/useAuth";

const NotificationItem = ({
  notification,
  isSelected,
  onSelect,
  onMarkAsRead,
  onDelete,
  actionLoading,
  isAllSelected,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center p-3 border-t border-gray-200 cursor-pointer ${
        isAllSelected
          ? "bg-[#E1E8FD]" // All Selected state color
          : notification.read
          ? "bg-[#FAFAFA]" // Read state color
          : "bg-white" // Unread state color
      } hover:bg-gray-100 transition-colors`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(notification.id)}
        onClick={(e) => e.stopPropagation()}
        className="mr-4 h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
      />
      <div className="grow">
        <span
          className={`font-bold ${
            isSelected ? "text-gray-800" : "text-gray-800"
          }`}
        >
          {notification.from} -
        </span>
        <span
          className={
            isSelected
              ? "text-gray-800"
              : notification.read
              ? "text-gray-700"
              : "font-semibold text-gray-900"
          }
        >
          {notification.title} -{" "}
        </span>
        <span className={isSelected ? "text-gray-600" : "text-gray-500"}>
          {notification.preview}
        </span>
      </div>
      {isSelected ? (
        <div
          className="flex items-center gap-4 ml-4"
          onClick={(e) => e.stopPropagation()}
        >
          <Trash2
            className={`w-5 h-5 ${
              actionLoading
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-500 hover:text-red-600 cursor-pointer"
            }`}
            onClick={!actionLoading ? onDelete : undefined}
          />
          <Mail
            className={`w-5 h-5 ${
              actionLoading
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-500 hover:text-blue-600 cursor-pointer"
            }`}
            onClick={!actionLoading ? onMarkAsRead : undefined}
          />
        </div>
      ) : (
        <div
          className={`text-right font-medium w-24 ml-4 ${
            isSelected ? "text-gray-800" : "text-gray-600"
          }`}
        >
          {notification.date}
        </div>
      )}
    </div>
  );
};

const NotificationDetail = ({ notification, onBack }) => {
  const [reminder, setReminder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchReminderDetails = async () => {
      if (
        notification.relatedEntity &&
        notification.relatedEntity.type === "reminder"
      ) {
        try {
          const response = await fetch(
            `/api/reminders/${notification.relatedEntity.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              setReminder(result.data);
            }
          }
        } catch (error) {
          console.error("Error fetching reminder details:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchReminderDetails();
  }, [notification, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Helper to generate calendar days
  const renderCalendar = (dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    const day = date.getDate();

    const daysInMonth = new Date(year, date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, date.getMonth(), 1).getDay();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const isSelected = i === day;
      days.push(
        <div
          key={i}
          className={`h-8 w-8 flex items-center justify-center rounded-full text-sm ${
            isSelected
              ? "bg-[#1E3A8A] text-white font-bold"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {i}
        </div>
      );
    }

    return { month, year, days };
  };

  const { month, year, days } = renderCalendar(
    reminder?.date || notification.date
  );
  const reminderDate = new Date(reminder?.date || notification.date);
  const formattedDate = reminderDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-white rounded-xl shadow-md p-8 min-h-[600px]">
      <button
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Back
      </button>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0"></div>
        <span className="text-gray-600 font-medium">
          Evaluation System for School and Program Events - LVCC Apalit
        </span>
      </div>

      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Hi, {notification.from || "User"}!
        </h1>
        <p className="text-xl text-gray-600">
          You have just created a notification reminder for {formattedDate}.
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-center items-start gap-8 max-w-5xl mx-auto">
        {/* Calendar Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full md:w-80 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <button className="p-1 hover:bg-gray-100 rounded-full">
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            </button>
            <h3 className="text-lg font-bold text-gray-800">
              {month} {year}
            </h3>
            <button className="p-1 hover:bg-gray-100 rounded-full">
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2 text-center">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div
                key={d}
                className="text-xs text-gray-400 font-medium h-8 flex items-center justify-center"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">{days}</div>
        </div>

        {/* Reminder Details Card */}
        <div className="bg-white rounded-2xl shadow-lg w-full md:w-96 border border-gray-100 relative">
          <div className="bg-[#1E3A8A] p-4 flex items-center relative rounded-t-2xl">
            {/* Triangle Pointer */}
            <div className="absolute left-[-10px] top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-10px border-t-transparent border-r-10px border-r-[#1E3A8A] border-b-10px border-b-transparent"></div>
            <span className="text-white font-bold text-lg ml-2">Reminder</span>
          </div>
          <div className="p-6">
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Reminder Title:
              </label>
              <div className="border border-gray-300 rounded-lg p-3 text-gray-700 bg-white">
                {reminder?.title || notification.title}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Description:
              </label>
              <div className="border border-gray-300 rounded-lg p-4 text-gray-700 bg-white min-h-[150px]">
                <p className="mb-4">
                  {reminder?.description || notification.preview}
                </p>
                {!reminder?.description && (
                  <>
                    <p className="mb-2">
                      Take note that four evaluation forms should be created:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Primary Department</li>
                      <li>Junior High Department</li>
                      <li>Senior High Department</li>
                      <li>College Department</li>
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Notifications = () => {
  const { token, isLoading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [selected, setSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [viewingNotification, setViewingNotification] = useState(null);

  const fetchNotifications = useCallback(async () => {
    try {
      // Skip if no token or still loading auth
      if (!token || authLoading) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const response = await fetch(
        `/api/notifications?page=${currentPage}&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          setNotifications([]);
          return;
        }
        throw new Error("Failed to fetch notifications");
      }

      const result = await response.json();

      if (result.success) {
        // Update pagination info
        if (result.pagination) {
          setTotalPages(result.pagination.pages || 1);
          setTotalNotifications(result.pagination.total || 0);
        }
        // Transform API data to match component expectations
        const transformedNotifications = result.data.map((notification) => {
          const from =
            notification.createdBy?.name ||
            (notification.isSystemGenerated ? "System" : "System");

          return {
            id: notification._id,
            from,
            title: notification.title,
            preview: notification.message,
            date: notification.createdAt
              ? new Date(notification.createdAt).toLocaleString()
              : "",
            read: !!notification.isRead,
            type: notification.type,
            relatedEntity: notification.relatedEntity,
          };
        });

        // Sort client-side just in case, newest first
        transformedNotifications.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        setNotifications(transformedNotifications);
      } else {
        throw new Error(result.message || "Failed to fetch notifications");
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      // Set empty notifications on error to prevent showing stale data
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [token, authLoading, currentPage]);

  useEffect(() => {
    if (token !== null && !authLoading) {
      fetchNotifications();
    } else if (!authLoading && !token) {
      // If auth is done loading but no token, set loading to false
      setLoading(false);
      setNotifications([]);
    }
  }, [token, authLoading, fetchNotifications]);

  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setSelected([]); // Clear selection when changing pages
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setSelected([]); // Clear selection when changing pages
    }
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(filteredNotifications.map((n) => n.id));
    } else {
      setSelected([]);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (selected.length === 0) return;

    setActionLoading(true);
    setActionMessage("");

    try {
      const response = await fetch("/api/notifications/read-multiple", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationIds: selected }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark notifications as read");
      }

      const result = await response.json();

      if (result.success) {
        // Update local state to reflect the changes
        setNotifications((prev) =>
          prev.map((notification) =>
            selected.includes(notification.id)
              ? { ...notification, read: true }
              : notification
          )
        );

        setSelected([]);
        setActionMessage(
          `${result.message || selected.length} notifications marked as read`
        );

        // Clear message after 3 seconds
        setTimeout(() => setActionMessage(""), 3000);
      } else {
        throw new Error(
          result.message || "Failed to mark notifications as read"
        );
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      setActionMessage("Failed to mark notifications as read");

      // Clear error message after 3 seconds
      setTimeout(() => setActionMessage(""), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteNotifications = async () => {
    if (selected.length === 0) return;

    // Confirm deletion
    if (
      !window.confirm(
        `Are you sure you want to delete ${selected.length} notification(s)? This action cannot be undone.`
      )
    ) {
      return;
    }

    setActionLoading(true);
    setActionMessage("");

    try {
      const response = await fetch("/api/notifications/multiple", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationIds: selected }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(
            "You do not have permission to delete these notifications"
          );
        }
        throw new Error("Failed to delete notifications");
      }

      const result = await response.json();

      if (result.success) {
        // Remove deleted notifications from local state
        setNotifications((prev) =>
          prev.filter((notification) => !selected.includes(notification.id))
        );

        setSelected([]);
        setActionMessage(
          `${
            result.message || selected.length
          } notifications deleted successfully`
        );

        // Clear message after 3 seconds
        setTimeout(() => setActionMessage(""), 3000);
      } else {
        throw new Error(result.message || "Failed to delete notifications");
      }
    } catch (error) {
      console.error("Error deleting notifications:", error);
      setActionMessage(error.message || "Failed to delete notifications");

      // Clear error message after 3 seconds
      setTimeout(() => setActionMessage(""), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkSingleAsRead = async (notificationId) => {
    setActionLoading(true);
    setActionMessage("");

    try {
      const response = await fetch(
        `/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      const result = await response.json();

      if (result.success) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );

        setActionMessage("Notification marked as read");
        setTimeout(() => setActionMessage(""), 3000);
      } else {
        throw new Error(
          result.message || "Failed to mark notification as read"
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      setActionMessage("Failed to mark notification as read");
      setTimeout(() => setActionMessage(""), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSingle = async (notificationId) => {
    // Confirm deletion
    if (
      !window.confirm(
        "Are you sure you want to delete this notification? This action cannot be undone."
      )
    ) {
      return;
    }

    setActionLoading(true);
    setActionMessage("");

    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(
            "You do not have permission to delete this notification"
          );
        }
        throw new Error("Failed to delete notification");
      }

      const result = await response.json();

      if (result.success) {
        setNotifications((prev) =>
          prev.filter((notification) => notification.id !== notificationId)
        );

        setActionMessage("Notification deleted successfully");
        setTimeout(() => setActionMessage(""), 3000);
      } else {
        throw new Error(result.message || "Failed to delete notification");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      setActionMessage(error.message || "Failed to delete notification");
      setTimeout(() => setActionMessage(""), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleNotificationClick = (notification) => {
    if (
      notification.type === "reminder" ||
      (notification.relatedEntity &&
        notification.relatedEntity.type === "reminder")
    ) {
      setViewingNotification(notification);
      if (!notification.read) {
        handleMarkSingleAsRead(notification.id);
      }
    }
  };

  const filteredNotifications = useMemo(
    () =>
      notifications.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.from.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [notifications, searchQuery]
  );

  const isAllSelected =
    selected.length > 0 && selected.length === filteredNotifications.length;

  // Show loading spinner while data is being initialized
  if (loading && !viewingNotification) {
    return (
      <ParticipantLayout>
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ParticipantLayout>
    );
  }

  return (
    <ParticipantLayout>
      <div className="p-8 bg-gray-100 min-h-full">
        {viewingNotification ? (
          <NotificationDetail
            notification={viewingNotification}
            onBack={() => setViewingNotification(null)}
          />
        ) : (
          <>
            {/* Action Message */}
            {actionMessage && (
              <div
                className={`mb-4 p-3 rounded-lg ${
                  actionMessage.includes("Failed") ||
                  actionMessage.includes("Error")
                    ? "bg-red-100 text-red-700 border border-red-200"
                    : "bg-green-100 text-green-700 border border-green-200"
                }`}
              >
                {actionMessage}
              </div>
            )}

            {/* Top Bar */}
            <div className="flex justify-between items-center mb-4">
              <div className="relative w-1/3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">
                  Page {currentPage} of {totalPages} ({totalNotifications}{" "}
                  total)
                </span>
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-full ${
                    currentPage === 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-full ${
                    currentPage === totalPages
                      ? "text-gray-300 cursor-not-allowed"
                      : "hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notifications Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Header */}
              <div className="flex items-center p-3 bg-gray-200 border-b border-gray-300">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="mr-4 h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <h2 className="text-lg font-semibold text-gray-700">
                  Notification List
                </h2>
                {selected.length > 0 && (
                  <div className="flex items-center gap-4 ml-auto">
                    <span className="font-semibold text-sm text-gray-600">
                      {selected.length} selected
                    </span>
                    <MailOpen
                      className={`w-5 h-5 cursor-pointer transition-colors ${
                        actionLoading
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-600 hover:text-blue-600"
                      }`}
                      title="Mark all as read"
                      onClick={!actionLoading ? handleMarkAllAsRead : undefined}
                    />
                    <Trash2
                      className={`w-5 h-5 cursor-pointer transition-colors ${
                        actionLoading
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-600 hover:text-red-600"
                      }`}
                      title="Delete all"
                      onClick={
                        !actionLoading ? handleDeleteNotifications : undefined
                      }
                    />
                  </div>
                )}
              </div>

              {/* List */}
              <div>
                {filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    {notifications.length === 0
                      ? "No notifications found"
                      : "No notifications match your search"}
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      isSelected={selected.includes(notification.id)}
                      isAllSelected={isAllSelected}
                      onSelect={handleSelect}
                      onMarkAsRead={() =>
                        handleMarkSingleAsRead(notification.id)
                      }
                      onDelete={() => handleDeleteSingle(notification.id)}
                      actionLoading={actionLoading}
                      onClick={() => handleNotificationClick(notification)}
                    />
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </ParticipantLayout>
  );
};

export default Notifications;

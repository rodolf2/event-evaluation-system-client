import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Mail,
  MailOpen,
  Trash2,
  CheckCircle,
  Bell,
} from "lucide-react";
import dayjs from "dayjs";
import { useAuth } from "../../contexts/useAuth";
import { useSocket } from "../../contexts/SocketContext";
import toast from "react-hot-toast";
import CalendarIcon from "../../assets/icons/calendar.svg";

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
  const handleContentClick = () => {
    if (onClick) {
      onClick();
    } else {
      onSelect(notification.id);
    }
  };

  return (
    <div
      onClick={handleContentClick}
      className={`relative flex items-start sm:items-center p-3 sm:p-4 border-t border-gray-200 cursor-pointer transition-all duration-200 ${
        isAllSelected
          ? "bg-blue-100/50 border-l-4 border-blue-600"
          : notification.read
            ? "bg-white border-l-4 border-transparent"
            : "bg-blue-50/40 border-l-4 border-blue-500"
      } hover:bg-gray-50`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(notification.id)}
        onClick={(e) => e.stopPropagation()}
        className="mr-3 sm:mr-4 mt-1 sm:mt-0 h-4 w-4 sm:h-5 sm:w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 shrink-0"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <span
              className={`h-2 w-2 rounded-full shrink-0 ${
                notification.read ? "invisible" : "bg-blue-500"
              }`}
              title={notification.read ? "" : "Unread"}
            ></span>
            <span className={`text-sm sm:text-base truncate ${
              notification.read ? "font-medium text-gray-600" : "font-bold text-gray-900"
            }`}>
              {notification.from}
            </span>
          </div>
          <span className="hidden sm:inline text-gray-400 font-light"> | </span>
          <span
            className={`text-sm sm:text-base truncate ${
              notification.read
                ? "text-gray-600 font-normal"
                : "text-gray-900 font-semibold"
            }`}
          >
            {notification.title}
          </span>
        </div>
        <p
          className={`text-xs sm:text-sm mt-1 line-clamp-1 ${
            notification.read ? "text-gray-400 font-normal" : "text-gray-600 font-medium"
          }`}
        >
          {notification.preview}
        </p>
        <div className="sm:hidden mt-2 text-xs text-gray-400">
          {notification.date}
        </div>
      </div>
      
      {isSelected ? (
        <div
          className="flex items-center gap-3 sm:gap-4 ml-2 sm:ml-4 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <Trash2
            className={`w-4 h-4 sm:w-5 sm:h-5 ${
              actionLoading
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
            }`}
            onClick={!actionLoading ? onDelete : undefined}
          />
          <Mail
            className={`w-4 h-4 sm:w-5 sm:h-5 ${
              actionLoading
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
            }`}
            onClick={!actionLoading ? onMarkAsRead : undefined}
          />
        </div>
      ) : (
        <div
          className={`hidden sm:block text-right font-medium text-xs w-32 ml-4 shrink-0 ${
            notification.read ? "text-gray-400" : "text-gray-500"
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
  const [form, setForm] = useState(null);
  const [allReminders, setAllReminders] = useState([]);
  const [selectedDateReminders, setSelectedDateReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const isFormNotification =
    notification.relatedEntity && notification.relatedEntity.type === "form";
  const isReminderNotification =
    notification.relatedEntity &&
    notification.relatedEntity.type === "reminder";

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }) +
      " - " +
      date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all reminders for this user to show in calendar
        const remindersResponse = await fetch("/api/reminders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (remindersResponse.ok) {
          const remindersResult = await remindersResponse.json();
          setAllReminders(remindersResult);
        }

        if (isReminderNotification) {
          const response = await fetch(
            `/api/reminders/${notification.relatedEntity.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              setReminder(result.data);
              // Set selected date reminders to this one initially
              setSelectedDateReminders([result.data]);
            }
          }
        } else if (isFormNotification) {
          const response = await fetch(
            `/api/forms/${notification.relatedEntity.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              setForm(result.data);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching notification details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [notification, token, isFormNotification, isReminderNotification]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 min-h-[600px] animate-pulse">
        {/* Back button skeleton */}
        <div className="h-6 w-16 bg-gray-200 rounded mb-6"></div>

        {/* Header skeleton */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="h-5 w-64 bg-gray-200 rounded"></div>
        </div>

        {/* Title skeleton */}
        <div className="text-center mb-12">
          <div className="h-8 w-80 bg-gray-200 rounded mx-auto mb-4"></div>
          <div className="h-5 w-96 bg-gray-200 rounded mx-auto"></div>
        </div>

        {/* Calendar and reminder card skeletons */}
        <div className="flex flex-col md:flex-row justify-center items-start gap-8 max-w-5xl mx-auto">
          <div className="bg-gray-100 rounded-2xl p-6 w-full md:w-80">
            <div className="h-6 w-32 bg-gray-200 rounded mx-auto mb-6"></div>
            <div className="grid grid-cols-7 gap-2">
              {[...Array(35)].map((_, i) => (
                <div key={i} className="h-8 w-8 bg-gray-200 rounded-full"></div>
              ))}
            </div>
          </div>
          <div className="w-full md:w-96">
            <div className="h-12 bg-gray-200 rounded-t-2xl mb-0"></div>
            <div className="bg-gray-100 rounded-b-2xl p-6 space-y-4">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-10 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
              <div className="h-32 w-full bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Helper to generate calendar days
  const handleDateClick = (clickedDate) => {
    const targetStr = dayjs(clickedDate).format("YYYY-MM-DD");
    const remindersOnDate = allReminders.filter(
      (r) => dayjs(r.date).format("YYYY-MM-DD") === targetStr
    );
    setSelectedDateReminders(remindersOnDate);
    if (remindersOnDate.length > 0) {
      setReminder(remindersOnDate[0]);
    } else {
      setReminder(null);
    }
  };

  const renderCalendar = (dateString) => {
    const centerpieceDate = new Date(dateString);
    const month = centerpieceDate.toLocaleString("default", { month: "long" });
    const year = centerpieceDate.getFullYear();
    const centerDay = centerpieceDate.getDate();

    const daysInMonth = new Date(year, centerpieceDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, centerpieceDate.getMonth(), 1).getDay();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const currentIterDate = new Date(year, centerpieceDate.getMonth(), i);
      const isSelected = i === centerDay;
      const iterStr = dayjs(currentIterDate).format("YYYY-MM-DD");
      const hasReminders = allReminders.some(
        (r) => dayjs(r.date).format("YYYY-MM-DD") === iterStr
      );

      days.push(
        <div
          key={i}
          onClick={() => handleDateClick(currentIterDate)}
          className="flex flex-col items-center cursor-pointer group"
        >
          <div
            className={`h-9 w-9 flex items-center justify-center rounded-xl text-sm transition-all ${
              isSelected
                ? "bg-[#1E3A8A] text-white font-bold"
                : hasReminders
                  ? "bg-blue-100 text-blue-700 font-semibold group-hover:bg-blue-200"
                  : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {i}
          </div>
          <div className="h-1.5 mt-1 flex items-center justify-center">
            {hasReminders && (
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
            )}
          </div>
        </div>,
      );
    }

    return { month, year, days };
  };

  // Form notification detail view
  if (isFormNotification && user?.role === "psas") {
    const formTitle = form?.title || "Evaluation Form";
    const creatorRole = form?.createdBy?.role;
    const departmentText =
      creatorRole === "club-officer"
        ? "Higher Education Department"
        : "Prefect of Student Affairs and Services Department";

    // Check if this is a "Form Published" success notification for the publisher
    const isPublisherView = notification.type === "success" && notification.title?.toLowerCase().includes("published");

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
          <div className="w-12 h-12 bg-gray-300 rounded-full shrink-0"></div>
          <span className="text-gray-600 font-medium">{departmentText}</span>
        </div>

        {isPublisherView ? (
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Form Successfully Published!
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              The evaluation form <strong>{formTitle}</strong> has been successfully shared with the participants.
            </p>
            <p className="text-gray-600 mb-2">
              You can now monitor the responses and view real-time analytics for this event.
            </p>
            <p className="text-gray-600 mb-6">
              Thank you for your hard work!
            </p>
            <p className="text-gray-700 font-medium">To God be the Glory!</p>
          </div>
        ) : (
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Evaluation Form Update
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              Regarding the evaluation form: <strong>{formTitle}</strong>
            </p>
            <p className="text-gray-600 mb-4">
              You can view the form details and analytics below.
            </p>
            <p className="text-gray-700 font-medium">To God be the Glory!</p>
          </div>
        )}

        <div className="flex flex-col items-center max-w-2xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center sm:-mt-4">
              <img
                src={CalendarIcon}
                alt="Calendar"
                className="w-32 h-32 sm:w-40 sm:h-40"
              />
            </div>
            <div className="space-y-4 pt-4 text-center sm:text-left">
              <div>
                <span className="font-bold text-gray-800">Form Opens:</span>{" "}
                <span className="text-gray-600">
                  {formatDateTime(form?.eventStartDate)}
                </span>
              </div>
              <div>
                <span className="font-bold text-gray-800">Form Closes:</span>{" "}
                <span className="text-gray-600">
                  {formatDateTime(form?.eventEndDate)}
                </span>
              </div>
              <button
                onClick={() =>
                  navigate(
                    `/psas/analytics?formId=${notification.relatedEntity.id}`,
                  )
                }
                className="bg-[#1E3A8A] hover:bg-[#15306e] text-white font-semibold py-3 px-8 rounded-lg transition-colors mt-4"
              >
                View Event Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { month, year, days } = renderCalendar(
    reminder?.date || notification.date,
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
          Hi, {user?.name || "User"}!
        </h1>
        <p className="text-xl text-gray-600">
          {reminder
            ? `You have a reminder for ${formattedDate}.`
            : selectedDateReminders.length === 0
              ? `No reminders set for ${formattedDate}.`
              : `You have reminders for ${formattedDate}.`}
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
            <div className="absolute left-[-10px] top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-10 border-t-transparent border-r-10 border-r-[#1E3A8A] border-b-10 border-b-transparent"></div>
            <span className="text-white font-bold text-lg ml-2">Reminder</span>
          </div>
          <div className="p-6 h-[400px] overflow-y-auto custom-scrollbar">
            {selectedDateReminders && selectedDateReminders.length > 0 ? (
              selectedDateReminders.map((r, idx) => (
                <div key={r._id || idx} className={idx > 0 ? "mt-12 pt-12 border-t-2 border-dashed border-gray-100" : ""}>
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Reminder Title:
                    </label>
                    <div className="border border-gray-300 rounded-lg p-3 text-gray-700 bg-gray-50 font-semibold shadow-sm">
                      {r.title}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Description:
                    </label>
                    <div className="border border-gray-300 rounded-lg p-4 text-gray-700 bg-white min-h-[150px] shadow-inner">
                      <p className="whitespace-pre-wrap">
                        {r.description || "No description provided."}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                <Bell className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm">Select a date with a dot to view reminders.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Notifications = ({ layout: LayoutComponent }) => {
  const navigate = useNavigate();
  const { token, isLoading: authLoading, user } = useAuth();
  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [selected, setSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [viewingNotification, setViewingNotification] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const ITEMS_PER_PAGE = 15;

  const fetchNotifications = useCallback(
    async (page = 1) => {
      try {
        // Skip if no token or still loading auth
        if (!token || authLoading) {
          setLoading(false);
          return;
        }

        setLoading(true);
        const response = await fetch(
          `/api/notifications?page=${page}&limit=${ITEMS_PER_PAGE}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          if (response.status === 403 || response.status === 401) {
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
            setCurrentPage(result.pagination.page || page);
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
              type: notification.type,
              date: notification.createdAt
                ? new Date(notification.createdAt).toLocaleString()
                : "",
              read: !!notification.isRead,
              relatedEntity: notification.relatedEntity,
            };
          });

          // Sort client-side just in case, newest first
          transformedNotifications.sort(
            (a, b) => new Date(b.date) - new Date(a.date),
          );

          setNotifications(transformedNotifications);
        } else {
          throw new Error(result.message || "Failed to fetch notifications");
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    },
    [token, authLoading, ITEMS_PER_PAGE],
  );

  useEffect(() => {
    if (token !== null && !authLoading) {
      fetchNotifications();
    } else if (!authLoading && !token) {
      setLoading(false);
      setNotifications([]);
    }
  }, [token, authLoading, fetchNotifications]);

  // WebSocket listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleNotificationUpdate = () => {
      console.log("📨 Real-time notification update received");
      fetchNotifications(currentPage);
    };

    socket.on("notification-received", handleNotificationUpdate);
    socket.on("notification-updated", handleNotificationUpdate);

    return () => {
      socket.off("notification-received", handleNotificationUpdate);
      socket.off("notification-updated", handleNotificationUpdate);
    };
  }, [socket, fetchNotifications, currentPage]);

  // Handle clicking on a notification to navigate to the relevant page
  const handleNotificationClick = (notification) => {
    // Determine the base path based on user role
    const rolePrefix =
      user?.role === "student"
        ? "/student"
        : user?.role === "club-officer"
          ? "/club-officer"
          : user?.role === "psas"
            ? "/psas"
            : user?.role === "senior-management"
              ? "/senior-management"
              : "";

    if (notification.relatedEntity?.type === "reminder") {
      navigate(`${rolePrefix}/reminders`);
    } else if (notification.relatedEntity?.type === "form") {
      navigate(`${rolePrefix}/evaluations`);
    } else if (notification.relatedEntity?.type === "certificate") {
      navigate(`${rolePrefix}/certificates`);
    }
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
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
              : notification,
          ),
        );

        setSelected([]);
        toast.success(
          `${result.message || selected.length} notifications marked as read`,
        );
      } else {
        throw new Error(
          result.message || "Failed to mark notifications as read",
        );
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      toast.error("Failed to mark notifications as read");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteNotifications = async () => {
    if (selected.length === 0) return;

    // Confirm deletion
    if (
      !window.confirm(
        `Are you sure you want to delete ${selected.length} notification(s)? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setActionLoading(true);

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
            "You do not have permission to delete these notifications",
          );
        }
        throw new Error("Failed to delete notifications");
      }

      const result = await response.json();

      if (result.success) {
        // Remove deleted notifications from local state
        setNotifications((prev) =>
          prev.filter((notification) => !selected.includes(notification.id)),
        );

        setSelected([]);
        toast.success(
          `${
            result.message || selected.length
          } notifications deleted successfully`,
        );
      } else {
        throw new Error(result.message || "Failed to delete notifications");
      }
    } catch (error) {
      console.error("Error deleting notifications:", error);
      toast.error(error.message || "Failed to delete notifications");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkSingleAsRead = async (notificationId) => {
    setActionLoading(true);

    try {
      const response = await fetch(
        `/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
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
              : notification,
          ),
        );

        toast.success("Notification marked as read");
      } else {
        throw new Error(
          result.message || "Failed to mark notification as read",
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark notification as read");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSingle = async (notificationId) => {
    // Confirm deletion
    if (
      !window.confirm(
        "Are you sure you want to delete this notification? This action cannot be undone.",
      )
    ) {
      return;
    }

    setActionLoading(true);

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
            "You do not have permission to delete this notification",
          );
        }
        throw new Error("Failed to delete notification");
      }

      const result = await response.json();

      if (result.success) {
        setNotifications((prev) =>
          prev.filter((notification) => notification.id !== notificationId),
        );

        toast.success("Notification deleted successfully");
      } else {
        throw new Error(result.message || "Failed to delete notification");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error(error.message || "Failed to delete notification");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredNotifications = useMemo(
    () =>
      notifications.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.from.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [notifications, searchQuery],
  );

  const isAllSelected =
    selected.length > 0 && selected.length === filteredNotifications.length;

  const LayoutWrapper = LayoutComponent;

  // Show skeleton loading while data is being initialized
  if (loading && !viewingNotification) {
    return (
      <LayoutWrapper>
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-full">
          {/* Search bar skeleton */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center mb-4">
            <div className="h-10 w-full sm:w-1/3 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="flex items-center gap-2">
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex items-center gap-1">
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Notification list skeleton */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Header skeleton */}
            <div className="flex items-center p-3 bg-gray-200 border-b border-gray-300">
              <div className="h-5 w-5 bg-gray-300 rounded mr-4 animate-pulse"></div>
              <div className="h-5 w-32 bg-gray-300 rounded animate-pulse"></div>
            </div>

            {/* Notification items skeleton */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="flex items-center p-4 border-t border-gray-200 animate-pulse"
              >
                <div className="h-5 w-5 bg-gray-200 rounded mr-4"></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-4 w-48 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-full">
        {viewingNotification ? (
          <NotificationDetail
            notification={viewingNotification}
            onBack={() => setViewingNotification(null)}
          />
        ) : (
          <>
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center mb-4">
              <div className="relative w-full sm:w-1/3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-2">
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} ({totalNotifications}{" "}
                  total)
                </span>
                <div className="flex items-center">
                  <button
                    onClick={() =>
                      currentPage > 1 && fetchNotifications(currentPage - 1)
                    }
                    disabled={currentPage <= 1}
                    className={`p-2 rounded-full ${currentPage > 1 ? "hover:bg-gray-200" : "opacity-50 cursor-not-allowed"}`}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      currentPage < totalPages &&
                      fetchNotifications(currentPage + 1)
                    }
                    disabled={currentPage >= totalPages}
                    className={`p-2 rounded-full ${currentPage < totalPages ? "hover:bg-gray-200" : "opacity-50 cursor-not-allowed"}`}
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
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
    </LayoutWrapper>
  );
};

export default Notifications;

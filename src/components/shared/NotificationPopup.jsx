import { Bell, X, ChevronRight, ClipboardList } from "lucide-react";
import toast from "react-hot-toast";
import { useNotifications } from "../../contexts/useNotifications";
import { useAuth } from "../../contexts/useAuth";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const NotificationPopup = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [reminderDetails, setReminderDetails] = useState(null);
  const timeoutRef = useRef(null);

  // Persist shown notifications in localStorage to prevent re-showing on refresh
  const getShownNotifications = () => {
    try {
      const stored = localStorage.getItem("shownNotificationPopups");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  };

  const saveShownNotification = (notificationId) => {
    try {
      const shown = getShownNotifications();
      shown.add(notificationId);
      // Keep only last 100 to prevent localStorage bloat
      const shownArray = [...shown].slice(-100);
      localStorage.setItem(
        "shownNotificationPopups",
        JSON.stringify(shownArray),
      );
    } catch (e) {
      console.error("Error saving shown notification:", e);
    }
  };

  // Get the latest unread notification that hasn't been shown yet (popup-wise)
  const latestUnreadNotification = notifications
    .filter((n) => {
      if (n.read) return false;
      const shown = getShownNotifications();
      return !shown.has(n.id);
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

  // Fetch reminder details when notification is a reminder
  useEffect(() => {
    const fetchReminderDetails = async () => {
      if (
        latestUnreadNotification &&
        latestUnreadNotification.relatedEntity &&
        latestUnreadNotification.relatedEntity.type === "reminder" &&
        token
      ) {
        try {
          const response = await fetch(
            `/api/reminders/${latestUnreadNotification.relatedEntity.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              setReminderDetails(result.data);
            }
          }
        } catch (error) {
          console.error("Error fetching reminder details:", error);
        }
      } else {
        setReminderDetails(null);
      }
    };

    fetchReminderDetails();
  }, [latestUnreadNotification, token]);



  const handleViewNotification = (notification) => {
    if (notification) {
      markAsRead(notification.id);
      saveShownNotification(notification.id);
      toast.dismiss(notification.id);

      // Navigate to notifications page based on role
      const notificationRoutes = {
        psas: "/psas/notifications",
        "club-officer": "/club-officer/notifications",
        student: "/student/notifications",
        "senior-management": "/senior-management/notifications",
        mis: "/mis/notifications",
      };

      const route = notificationRoutes[user?.role] || "/notifications";
      navigate(route);
    }
  };

  // Show premium custom toast when there's a new unread notification
  useEffect(() => {
    if (latestUnreadNotification && !isVisible) {
      // Small delay to avoid immediate appearance if many events trigger at once
      const showTimer = setTimeout(() => {
        // Check mute settings before showing toast
        const isReminder =
          latestUnreadNotification.type === "reminder" ||
          (latestUnreadNotification.relatedEntity &&
            latestUnreadNotification.relatedEntity.type === "reminder");
            
        if (isReminder && user?.muteReminders) {
          // Skip toast for muted reminders, but mark as "shown" so we don't try again
          saveShownNotification(latestUnreadNotification.id);
          return;
        }
        
        if (!isReminder && user?.muteNotifications) {
           // Skip toast for muted notifications, but mark as "shown" so we don't try again
           saveShownNotification(latestUnreadNotification.id);
           return;
        }

        setIsVisible(true);

        const isForm = latestUnreadNotification.type === "form" || (latestUnreadNotification.relatedEntity && latestUnreadNotification.relatedEntity.type === "form");

        toast.custom((t) => (
          <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-sm w-full bg-white shadow-2xl rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden transition-all duration-300 transform hover:scale-[1.02]`}
            style={{ marginTop: '70px' }} // Below the header
          >
            <div className="flex-1 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className={`p-2 rounded-lg ${isForm ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'}`}>
                    {isForm ? <ClipboardList className="h-6 w-6" /> : <Bell className="h-6 w-6" />}
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-bold text-gray-900 leading-tight">
                    {latestUnreadNotification.title}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2 leading-relaxed">
                    {reminderDetails?.description || latestUnreadNotification.preview}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      onClick={() => {
                        handleViewNotification(latestUnreadNotification);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-transparent text-xs font-semibold rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      {isForm ? "View Form" : "View"}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                      Just Now
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ), {
          id: latestUnreadNotification.id,
          duration: 2000,
          position: 'top-right'
        });

        // If it auto-expires, we still need to mark it as shown so it doesn't pop up again
        setTimeout(() => {
          saveShownNotification(latestUnreadNotification.id);
          setIsVisible(false);
        }, 2000);
      }, 1500);

      return () => clearTimeout(showTimer);
    }
  }, [latestUnreadNotification, isVisible, reminderDetails]);

  return null;
};

export default NotificationPopup;

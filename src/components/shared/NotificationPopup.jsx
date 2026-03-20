import { Bell, X, ChevronRight, ClipboardList } from "lucide-react";
import toast from "react-hot-toast";
import { useNotifications } from "../../contexts/useNotifications";
import { useAuth } from "../../contexts/useAuth";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";

const NotificationPopup = () => {
  const { notifications, unreadCount, markAsRead, loading } = useNotifications();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [reminderDetails, setReminderDetails] = useState(null);
  const initialLoadDone = useRef(false);
  const lastToastedId = useRef(null); // Track the last ID we actually called toast.custom for in this session

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

  // On mount or when loading finishes for the first time, 
  // mark all existing unread notifications as "shown" so they don't pop up.
  // We MUST wait for loading to be false to ensure we have the actual data baseline.
  useEffect(() => {
    if (!loading && !initialLoadDone.current) {
      if (notifications.length > 0) {
        notifications.forEach((n) => {
          if (!n.read) {
            saveShownNotification(n.id);
          }
        });
      }
      initialLoadDone.current = true;
    }
  }, [notifications, loading]);

  // Get the latest unread notification that hasn't been shown yet (popup-wise)
  // Memoize it so the reference only changes when notifications or the suppressed set changes
  const latestUnreadNotification = useMemo(() => {
    return notifications
      .filter((n) => {
        if (n.read) return false;
        const shown = getShownNotifications();
        return !shown.has(n.id);
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  }, [notifications]);

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

  const handleCloseNotification = (e, notificationId) => {
    e.stopPropagation(); // Prevent triggering other clicks if any
    saveShownNotification(notificationId);
    toast.dismiss(notificationId);
    setIsVisible(false);
  };

  // Show premium custom toast when there's a new unread notification
  useEffect(() => {
    // Only show if we have a notification, we aren't currently showing one, 
    // the initial suppression is done, and it's not the one we JUST toasted.
    if (
      latestUnreadNotification && 
      !isVisible && 
      initialLoadDone.current &&
      lastToastedId.current !== latestUnreadNotification.id
    ) {
      // Small delay to avoid immediate appearance if many events trigger at once
      const showTimer = setTimeout(() => {
        // Re-check conditions inside timeout in case state changed
        if (!latestUnreadNotification || isVisible || lastToastedId.current === latestUnreadNotification.id) return;

        // Check mute settings before showing toast
        const isReminder =
          latestUnreadNotification.type === "reminder" ||
          (latestUnreadNotification.relatedEntity &&
            latestUnreadNotification.relatedEntity.type === "reminder");

        if (isReminder && user?.muteReminders) {
          saveShownNotification(latestUnreadNotification.id);
          return;
        }

        if (!isReminder && user?.muteNotifications) {
          saveShownNotification(latestUnreadNotification.id);
          return;
        }

        // Final check before toasting
        if (lastToastedId.current === latestUnreadNotification.id) return;
        
        lastToastedId.current = latestUnreadNotification.id;
        setIsVisible(true);

        const isForm =
          latestUnreadNotification.type === "form" ||
          (latestUnreadNotification.relatedEntity &&
            latestUnreadNotification.relatedEntity.type === "form");

        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "animate-enter" : "animate-leave"
              } max-w-sm w-full bg-white shadow-2xl rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden transition-all duration-300 transform hover:scale-[1.02] relative`}
              style={{ marginTop: "100px", marginRight: "48px" }} // Below the header, offset from edge
            >
              {/* Close Button */}
              <button
                onClick={(e) =>
                  handleCloseNotification(e, latestUnreadNotification.id)
                }
                className="absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Close notification"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex-1 p-4">
                <div className="flex items-start">
                  <div className="shrink-0 pt-0.5">
                    <div
                      className={`p-2 rounded-lg ${isForm ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-600"}`}
                    >
                      {isForm ? (
                        <ClipboardList className="h-6 w-6" />
                      ) : (
                        <Bell className="h-6 w-6" />
                      )}
                    </div>
                  </div>
                  <div className="ml-3 flex-1 pr-6">
                    <p className="text-sm font-bold text-gray-900 leading-tight">
                      {latestUnreadNotification.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2 leading-relaxed">
                      {reminderDetails?.description ||
                        latestUnreadNotification.preview}
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
          ),
          {
            id: latestUnreadNotification.id,
            duration: 4000,
            position: "top-right",
          },
        );

        const autoCloseTimer = setTimeout(() => {
          saveShownNotification(latestUnreadNotification.id);
          setIsVisible(false);
        }, 4000);

        return () => clearTimeout(autoCloseTimer);
      }, 500);

      return () => clearTimeout(showTimer);
    }
  }, [latestUnreadNotification?.id, isVisible, user?.muteReminders, user?.muteNotifications, reminderDetails]); // initialLoadDone is a ref, so it doesn't need to be in dependency, but the effect uses it.

  return null;
};

export default NotificationPopup;

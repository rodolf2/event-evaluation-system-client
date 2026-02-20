
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
  const initialLoadDone = useRef(false);

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

  // On mount, mark all existing unread notifications as "shown" so they don't pop up
  useEffect(() => {
    if (notifications.length > 0 && !initialLoadDone.current) {
      notifications.forEach(n => {
        if (!n.read) {
          saveShownNotification(n.id);
        }
      });
      initialLoadDone.current = true;
    } else if (notifications.length === 0 && !initialLoadDone.current) {
       // If no notifications initially, still mark load as done so subsequent ones CAN show
       // We might want to wait a tick to ensure fetch is done, but useNotifications usually
       // provides `loading` state. However, we can just assume if we are here, we are good.
       // Better approach: use dependency on `notifications`. 
       // If empty initially, it's fine. If it populates later from fetch, we might suppress them too?
       // The requirement is "suppress existing". 
       // Logic: The first batch of notifications we see should be suppressed.
       // Any SUBSEQUENT additions (delta) should be shown.
       // `initialLoadDone` handles this.
       initialLoadDone.current = true;
    }
  }, [notifications]);


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

  const handleCloseNotification = (e, notificationId) => {
    e.stopPropagation(); // Prevent triggering other clicks if any
    saveShownNotification(notificationId);
    toast.dismiss(notificationId);
    setIsVisible(false);
  };

  // Show premium custom toast when there's a new unread notification
  useEffect(() => {
    if (latestUnreadNotification && !isVisible && initialLoadDone.current) {
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
              } max-w-sm w-full bg-white shadow-2xl rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden transition-all duration-300 transform hover:scale-[1.02] relative`}
            style={{ marginTop: '70px' }} // Below the header
          >
            {/* Close Button */}
            <button
                onClick={(e) => handleCloseNotification(e, latestUnreadNotification.id)}
                className="absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Close notification"
            >
                <X className="h-4 w-4" />
            </button>

            <div className="flex-1 p-4">
              <div className="flex items-start">
                <div className="shrink-0 pt-0.5">
                  <div className={`p-2 rounded-lg ${isForm ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'}`}>
                    {isForm ? <ClipboardList className="h-6 w-6" /> : <Bell className="h-6 w-6" />}
                  </div>
                </div>
                <div className="ml-3 flex-1 pr-6"> {/* Added padding-right to avoid overlap with close button */}
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
          duration: 4000, // Increased duration slightly so user has time to read/close
          position: 'top-right'
        });

        // Auto-close logic
        // We need to keep track if the user MANUALLY closed it, but toast.custom doesn't easily return that state unless we manage it.
        // The `saveShownNotification` is done in `handleCloseNotification` AND `handleViewNotification`.
        // If the timeout fires, we also want to mark it as shown.
        // However, if we just rely on `t.visible`, that's controlled by toast library.
        // We set our own `setIsVisible(false)` after a timeout to allow the *next* one to show?
        // Wait, if we want to stop "bombardment", we should NOT show the next one immediately if this one expires.
        // But the logic `latestUnreadNotification` will pick the next one if the current one is marked 'shown'.
        // If we timeout, we mark as shown, so the next one WILL pop up.
        // This is DESIRED behavior for real-time notifications (queueing). 
        // BUT the user complains about "bombardment". This usually means 10 notifications popping up in sequence on load.
        // With `initialLoadDone` check, we suppress the initial batch.
        // So `setTimeout` behavior is fine for *new* notifications.
        
        const autoCloseTimer = setTimeout(() => {
          saveShownNotification(latestUnreadNotification.id);
          setIsVisible(false);
          // Toast library auto-dismisses based on `duration`, but we need to ensure our local logic knows it's "done"
        }, 4000); 

        return () => clearTimeout(autoCloseTimer);

      }, 500); // Reduced initial delay slightly

      return () => clearTimeout(showTimer);
    }
  }, [latestUnreadNotification, isVisible, reminderDetails]); // initialLoadDone is a ref, so it doesn't need to be in dependency, but the effect uses it.

  return null;
};

export default NotificationPopup;

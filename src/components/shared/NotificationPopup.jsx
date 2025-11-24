import { useState, useEffect, useRef } from 'react';
import { Bell, X, ChevronRight } from 'lucide-react';
import { useNotifications } from '../../contexts/useNotifications';
import { useAuth } from '../../contexts/useAuth';
import { useNavigate } from 'react-router-dom';

const NotificationPopup = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [shownNotifications, setShownNotifications] = useState(new Set());
  const [reminderDetails, setReminderDetails] = useState(null);
  const timeoutRef = useRef(null);

  // Get the latest unread notification that hasn't been shown yet
  const latestUnreadNotification = notifications
    .filter(n => !n.read && !shownNotifications.has(n.id))
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

  // Track notification IDs to detect new ones
  const currentUnreadIds = useRef(new Set());

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
            }
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

  useEffect(() => {
    const newUnreadIds = new Set(notifications.filter(n => !n.read).map(n => n.id));
    const previousUnreadIds = currentUnreadIds.current;

    // Check if there are new notifications
    const hasNewNotifications = [...newUnreadIds].some(id => !previousUnreadIds.has(id));

    if (hasNewNotifications) {
      // Reset shown notifications for new ones
      setShownNotifications(new Set());
      setReminderDetails(null); // Reset reminder details for new notifications
    }

    currentUnreadIds.current = newUnreadIds;
  }, [notifications]);

  // Show popup when there's a new unread notification
  useEffect(() => {
    if (latestUnreadNotification && !isVisible) {
      // Delay showing popup to avoid immediate appearance
      const showTimer = setTimeout(() => {
        setIsVisible(true);
        // Auto-hide after 8 seconds
        timeoutRef.current = setTimeout(() => {
          setIsVisible(false);
          // Mark as shown so it won't appear again
          setShownNotifications(prev => new Set([...prev, latestUnreadNotification.id]));
        }, 8000);
      }, 1000);
      return () => clearTimeout(showTimer);
    }
  }, [latestUnreadNotification, isVisible]);

  // Clear timeout when component unmounts or notification changes
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleDismiss = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (latestUnreadNotification) {
      setShownNotifications(prev => new Set([...prev, latestUnreadNotification.id]));
    }
    setIsVisible(false);
  };

  const handleViewNotification = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (latestUnreadNotification) {
      markAsRead(latestUnreadNotification.id);
      setShownNotifications(prev => new Set([...prev, latestUnreadNotification.id]));
      setIsVisible(false);

      // Navigate to notifications page based on role
      const notificationRoutes = {
        psas: '/psas/notifications',
        'club-officer': '/club-officer/notifications',
        participant: '/participant/notifications',
        'school-admin': '/school-admin/notifications',
        mis: '/mis/notifications',
      };

      const route = notificationRoutes[user?.role] || '/notifications';
      navigate(route);
    }
  };

  if (!isVisible || !latestUnreadNotification) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 animate-in slide-in-from-right-2 duration-300">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Bell className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {latestUnreadNotification.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {reminderDetails?.description || latestUnreadNotification.preview}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {latestUnreadNotification.from} • {latestUnreadNotification.date}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={handleViewNotification}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View Notification
            <ChevronRight className="w-4 h-4" />
          </button>
          {unreadCount > 1 && (
            <span className="text-xs text-gray-500">
              +{unreadCount - 1} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;
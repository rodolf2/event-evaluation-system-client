import { useState, useEffect, useCallback, useMemo } from 'react';
import { NotificationContext } from './NotificationContextDefinition';
import { useAuth } from './useAuth';

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token, isLoading: authLoading } = useAuth();

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const fetchNotifications = useCallback(async () => {
    if (!token || authLoading) {
      setNotifications([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 403 || response.status === 401) {
          setNotifications([]);
          return;
        }
        throw new Error("Failed to fetch notifications");
      }

      const result = await response.json();

      if (result.success) {
        const transformedNotifications = result.data.map((notification) => ({
          id: notification._id,
          from: notification.createdBy?.name || (notification.isSystemGenerated ? "System" : "System"),
          title: notification.title,
          preview: notification.message,
          date: notification.createdAt ? new Date(notification.createdAt).toLocaleString() : "",
          read: !!notification.isRead,
          type: notification.type,
          relatedEntity: notification.relatedEntity,
        }));

        transformedNotifications.sort((a, b) => new Date(b.date) - new Date(a.date));
        setNotifications(transformedNotifications);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [token, authLoading]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }, [token]);

  const markMultipleAsRead = useCallback(async (notificationIds) => {
    try {
      const response = await fetch("/api/notifications/read-multiple", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationIds }),
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification =>
            notificationIds.includes(notification.id)
              ? { ...notification, read: true }
              : notification
          )
        );
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  }, [token]);

  // Fetch notifications on mount and periodically
  useEffect(() => {
    if (token && !authLoading) {
      fetchNotifications();

      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [token, authLoading, fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markMultipleAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
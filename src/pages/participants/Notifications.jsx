import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, Trash2, Mail, MailOpen } from 'lucide-react';
import ParticipantLayout from '../../components/participants/ParticipantLayout';
import { useAuth } from '../../contexts/useAuth';

const NotificationItem = ({
  notification,
  isSelected,
  onSelect,
  onMarkAsRead,
  onDelete,
  actionLoading
}) => {
  return (
    <div
      className={`flex items-center p-3 border-t border-gray-200 ${
        isSelected
          ? "bg-[#C0C0C0]" // Selected state color
          : notification.read
            ? "bg-white"
            : "bg-blue-50"
      } hover:bg-gray-100 transition-colors`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(notification.id)}
        className="mr-4 h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
      />
      <div className="grow">
        <span className={`font-bold ${
          isSelected ? "text-white" : "text-gray-800"
        }`}>
          {notification.from} -
        </span>
        <span
          className={
            isSelected
              ? "text-white"
              : notification.read
                ? "text-gray-700"
                : "font-semibold text-gray-900"
          }
        >
          {notification.title} -{" "}
        </span>
        <span className={isSelected ? "text-gray-200" : "text-gray-500"}>
          {notification.preview}
        </span>
      </div>
      {isSelected ? (
        <div className="flex items-center gap-4 ml-4">
          <Trash2
            className={`w-5 h-5 ${
              actionLoading
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-500 hover:text-red-600 cursor-pointer'
            }`}
            onClick={!actionLoading ? onDelete : undefined}
          />
          <Mail
            className={`w-5 h-5 ${
              actionLoading
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-500 hover:text-blue-600 cursor-pointer'
            }`}
            onClick={!actionLoading ? onMarkAsRead : undefined}
          />
        </div>
      ) : (
        <div className={`text-right font-medium w-24 ml-4 ${
          isSelected ? "text-white" : "text-gray-600"
        }`}>
          {notification.date}
        </div>
      )}
    </div>
  );
};

const Notifications = () => {
  const { token, isLoading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [selected, setSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const fetchNotifications = useCallback(async () => {
    try {
      // Skip if no token or still loading auth
      if (!token || authLoading) {
        console.log("[Notifications] Skipping fetch - token:", !!token, "authLoading:", authLoading);
        setLoading(false);
        return;
      }

      console.log("[Notifications] Fetching notifications for participant...");
      setLoading(true);
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("[Notifications] API response status:", response.status);
      console.log(
        "[Notifications] Token:",
        token ? `${token.substring(0, 20)}...` : "NO TOKEN"
      );

      if (!response.ok) {
        if (response.status === 401) {
          console.error("[Notifications] 401 Unauthorized - user may not be logged in");
          // Don't throw, just set empty notifications for 401
          setNotifications([]);
          return;
        }
        throw new Error('Failed to fetch notifications');
      }

      const result = await response.json();
      console.log("[Notifications] API response:", result);

      if (result.success) {
        // Transform API data to match component expectations
        const transformedNotifications = result.data.map((notification) => {
          const from =
            notification.createdBy?.name ||
            (notification.isSystemGenerated ? 'System' : 'System');

          return {
            id: notification._id,
            from,
            title: notification.title,
            preview: notification.message,
            date: notification.createdAt
              ? new Date(notification.createdAt).toLocaleString()
              : '',
            read: !!notification.isRead
          };
        });

        console.log(
          "[Notifications] Transformed notifications:",
          transformedNotifications.length
        );

        // Sort client-side just in case, newest first
        transformedNotifications.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        setNotifications(transformedNotifications);
      } else {
        throw new Error(result.message || 'Failed to fetch notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      // Set empty notifications on error to prevent showing stale data
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [token, authLoading]);

  useEffect(() => {
    if (token !== null && !authLoading) {
      fetchNotifications();
    } else if (!authLoading && !token) {
      // If auth is done loading but no token, set loading to false
      console.log("[Notifications] No token available after auth loading");
      setLoading(false);
      setNotifications([]);
    }
  }, [token, authLoading, fetchNotifications]);
  
    const handleSelect = (id) => {
      setSelected(prev =>
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
      );
    };
  
    const handleSelectAll = (e) => {
      if (e.target.checked) {
        setSelected(filteredNotifications.map(n => n.id));
      } else {
        setSelected([]);
      }
    };
  
    const handleMarkAllAsRead = async () => {
      if (selected.length === 0) return;
      
      setActionLoading(true);
      setActionMessage('');
      
      try {
        const response = await fetch('/api/notifications/read-multiple', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ notificationIds: selected })
        });
    
        if (!response.ok) {
          throw new Error('Failed to mark notifications as read');
        }
    
        const result = await response.json();
        
        if (result.success) {
          // Update local state to reflect the changes
          setNotifications(prev =>
            prev.map(notification =>
              selected.includes(notification.id)
                ? { ...notification, read: true }
                : notification
            )
          );
          
          setSelected([]);
          setActionMessage(`${result.message || selected.length} notifications marked as read`);
          
          // Clear message after 3 seconds
          setTimeout(() => setActionMessage(''), 3000);
        } else {
          throw new Error(result.message || 'Failed to mark notifications as read');
        }
      } catch (error) {
        console.error('Error marking notifications as read:', error);
        setActionMessage('Failed to mark notifications as read');
        
        // Clear error message after 3 seconds
        setTimeout(() => setActionMessage(''), 3000);
      } finally {
        setActionLoading(false);
      }
    };
    
    const handleDeleteNotifications = async () => {
      if (selected.length === 0) return;
      
      // Confirm deletion
      if (!window.confirm(`Are you sure you want to delete ${selected.length} notification(s)? This action cannot be undone.`)) {
        return;
      }
      
      setActionLoading(true);
      setActionMessage('');
      
      try {
        const response = await fetch('/api/notifications/multiple', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ notificationIds: selected })
        });
    
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('You do not have permission to delete these notifications');
          }
          throw new Error('Failed to delete notifications');
        }
    
        const result = await response.json();
        
        if (result.success) {
          // Remove deleted notifications from local state
          setNotifications(prev =>
            prev.filter(notification => !selected.includes(notification.id))
          );
          
          setSelected([]);
          setActionMessage(`${result.message || selected.length} notifications deleted successfully`);
          
          // Clear message after 3 seconds
          setTimeout(() => setActionMessage(''), 3000);
        } else {
          throw new Error(result.message || 'Failed to delete notifications');
        }
      } catch (error) {
        console.error('Error deleting notifications:', error);
        setActionMessage(error.message || 'Failed to delete notifications');
        
        // Clear error message after 3 seconds
        setTimeout(() => setActionMessage(''), 3000);
      } finally {
        setActionLoading(false);
      }
    };
  
    const handleMarkSingleAsRead = async (notificationId) => {
      setActionLoading(true);
      setActionMessage('');
      
      try {
        const response = await fetch(`/api/notifications/${notificationId}/read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
    
        if (!response.ok) {
          throw new Error('Failed to mark notification as read');
        }
    
        const result = await response.json();
        
        if (result.success) {
          setNotifications(prev =>
            prev.map(notification =>
              notification.id === notificationId
                ? { ...notification, read: true }
                : notification
            )
          );
          
          setActionMessage('Notification marked as read');
          setTimeout(() => setActionMessage(''), 3000);
        } else {
          throw new Error(result.message || 'Failed to mark notification as read');
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
        setActionMessage('Failed to mark notification as read');
        setTimeout(() => setActionMessage(''), 3000);
      } finally {
        setActionLoading(false);
      }
    };
    
    const handleDeleteSingle = async (notificationId) => {
      // Confirm deletion
      if (!window.confirm('Are you sure you want to delete this notification? This action cannot be undone.')) {
        return;
      }
      
      setActionLoading(true);
      setActionMessage('');
      
      try {
        const response = await fetch(`/api/notifications/${notificationId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
    
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('You do not have permission to delete this notification');
          }
          throw new Error('Failed to delete notification');
        }
    
        const result = await response.json();
        
        if (result.success) {
          setNotifications(prev =>
            prev.filter(notification => notification.id !== notificationId)
          );
          
          setActionMessage('Notification deleted successfully');
          setTimeout(() => setActionMessage(''), 3000);
        } else {
          throw new Error(result.message || 'Failed to delete notification');
        }
      } catch (error) {
        console.error('Error deleting notification:', error);
        setActionMessage(error.message || 'Failed to delete notification');
        setTimeout(() => setActionMessage(''), 3000);
      } finally {
        setActionLoading(false);
      }
    };
  
    const filteredNotifications = useMemo(() =>
      notifications.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.from.toLowerCase().includes(searchQuery.toLowerCase())
      ), [notifications, searchQuery]);
  
    const isAllSelected = selected.length > 0 && selected.length === filteredNotifications.length;

  // Show loading spinner while data is being initialized
  if (loading) {
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
          {/* Action Message */}
          {actionMessage && (
            <div className={`mb-4 p-3 rounded-lg ${
              actionMessage.includes('Failed') || actionMessage.includes('Error')
                ? 'bg-red-100 text-red-700 border border-red-200'
                : 'bg-green-100 text-green-700 border border-green-200'
            }`}>
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
              <span className="text-gray-600">{filteredNotifications.length} of {notifications.length}</span>
              <button className="p-2 rounded-full hover:bg-gray-200"><ChevronLeft className="w-5 h-5" /></button>
              <button className="p-2 rounded-full hover:bg-gray-200"><ChevronRight className="w-5 h-5" /></button>
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
              <h2 className="text-lg font-semibold text-gray-700">Notification List</h2>
              {selected.length > 0 && (
                <div className="flex items-center gap-4 ml-auto">
                  <span className="font-semibold text-sm text-gray-600">{selected.length} selected</span>
                  <MailOpen
                    className={`w-5 h-5 cursor-pointer transition-colors ${
                      actionLoading
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                    title="Mark all as read"
                    onClick={!actionLoading ? handleMarkAllAsRead : undefined}
                  />
                  <Trash2
                    className={`w-5 h-5 cursor-pointer transition-colors ${
                      actionLoading
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-600 hover:text-red-600'
                    }`}
                    title="Delete all"
                    onClick={!actionLoading ? handleDeleteNotifications : undefined}
                  />
                </div>
              )}
            </div>

          {/* List */}
                    <div>
                      {filteredNotifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          {notifications.length === 0 ? 'No notifications found' : 'No notifications match your search'}
                        </div>
                      ) : (
                        filteredNotifications.map(notification => (
                          <NotificationItem
                            key={notification.id}
                            notification={notification}
                            isSelected={selected.includes(notification.id)}
                            onSelect={handleSelect}
                            onMarkAsRead={() => handleMarkSingleAsRead(notification.id)}
                            onDelete={() => handleDeleteSingle(notification.id)}
                            actionLoading={actionLoading}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </ParticipantLayout>
            );
};

export default Notifications;

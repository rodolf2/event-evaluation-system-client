import { useState, useEffect, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Trash2, Mail, MailOpen } from 'lucide-react';
import PSASLayout from '../../components/psas/PSASLayout';

// Mock data for notifications
const mockNotifications = [
  { id: 1, from: 'System', title: 'You have just created a notification reminder', preview: 'lorem ipsum sit amet, consectetur adipiscing...', date: '8:00 PM', read: false },
  { id: 2, from: 'System', title: 'You have just created a notification reminder', preview: 'lorem ipsum sit amet, consectetur adipiscing...', date: 'Sep 01', read: true },
  { id: 3, from: 'System', title: 'Generate the reports now for "Intramurals 2025" ', preview: 'lorem ipsum sit amet, consectetur adipiscing...', date: 'Aug 30', read: true },
  { id: 4, from: 'System', title: 'Evaluation Form for "Intramurals 2025" is closing soon', preview: 'lorem ipsum sit amet, consectetur adipiscing...', date: 'Aug 28', read: false },
  { id: 5, from: 'System', title: '30% of the responses are now obtained for "Intramurals 2025" ', preview: 'lorem ipsum sit amet, consectetur adipiscing...', date: 'Aug 25', read: true },
  { id: 6, from: 'System', title: 'View the current state of the reports now', preview: 'lorem ipsum sit amet, consectetur adipiscing...', date: 'Aug 23', read: true },
  { id: 7, from: 'System', title: 'Evaluation Form for "Intramurals 2025" is now open for access', preview: 'lorem ipsum sit amet, consectetur adipiscing...', date: 'Aug 22', read: false },
  { id: 8, from: 'System', title: 'You have just created an evaluation titled "Intramurals 2025" ', preview: 'lorem ipsum sit amet, consectetur adipiscing...', date: 'Aug 22', read: true },
  { id: 9, from: 'System', title: 'Create an evaluation now', preview: 'lorem ipsum sit amet, consectetur adipiscing...', date: 'Aug 18', read: true },
  { id: 10, from: 'System', title: 'Welcome Aboard', preview: 'lorem ipsum sit amet, consectetur adipiscing...', date: '12/31/24', read: true },
];

const NotificationItem = ({ notification, isSelected, onSelect }) => {
  return (
    <div
      className={`flex items-center p-3 border-t border-gray-200 ${
        notification.read ? "bg-white" : "bg-blue-50"
      } hover:bg-gray-100 transition-colors`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(notification.id)}
        className="mr-4 h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
      />
      <div className="grow">
        <span className="font-bold text-gray-800">{notification.from} - </span>
        <span
          className={
            notification.read ? "text-gray-700" : "font-semibold text-gray-900"
          }
        >
          {notification.title} -{" "}
        </span>
        <span className="text-gray-500">{notification.preview}</span>
      </div>
      {isSelected ? (
        <div className="flex items-center gap-4 ml-4">
          <Trash2 className="w-5 h-5 text-gray-500 hover:text-red-600 cursor-pointer" />
          <Mail className="w-5 h-5 text-gray-500 hover:text-blue-600 cursor-pointer" />
        </div>
      ) : (
        <div className="text-right text-gray-600 font-medium w-24 ml-4">
          {notification.date}
        </div>
      )}
    </div>
  );
};

const Notifications = () => {
  const [notifications] = useState(mockNotifications);
  const [selected, setSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay for consistent user experience
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

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

  const filteredNotifications = useMemo(() => 
    notifications.filter(n => 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.from.toLowerCase().includes(searchQuery.toLowerCase())
    ), [notifications, searchQuery]);

  const isAllSelected = selected.length > 0 && selected.length === filteredNotifications.length;

  // Show loading spinner while data is being initialized
  if (loading) {
    return (
      <PSASLayout>
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PSASLayout>
    );
  }

  return (
    <PSASLayout>
      <div className="p-8 bg-gray-100 min-h-full">
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
            <span className="text-gray-600">1-10 of 10</span>
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
                <MailOpen className="w-5 h-5 text-gray-600 hover:text-blue-600 cursor-pointer" title="Mark all as read" />
                <Trash2 className="w-5 h-5 text-gray-600 hover:text-red-600 cursor-pointer" title="Delete all" />
              </div>
            )}
          </div>

          {/* List */}
          <div>
            {filteredNotifications.map(notification => (
              <NotificationItem 
                key={notification.id} 
                notification={notification} 
                isSelected={selected.includes(notification.id)}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>
      </div>
    </PSASLayout>
  );
};

export default Notifications;

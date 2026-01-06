import React, { useState, useEffect } from "react";
import { X, Calendar, User, Clock, Search, AlertCircle } from "lucide-react";
import { useAuth } from "../../contexts/useAuth";
import toast from "react-hot-toast";

export default function SettingsChangeLogModal({ onClose }) {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLogs();
  }, [token]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        category: "settings",
        action: "SYSTEM_SETTINGS_UPDATE",
        limit: 50, // Fetch last 50 changes
      });

      const response = await fetch(`/api/mis/audit-logs?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setLogs(data.data);
      } else {
        toast.error("Failed to load change log");
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Error loading history");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(
    (log) =>
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.userName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F4F4F5]/60 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              System Change Log
            </h2>
            <p className="text-sm text-gray-500">
              History of configuration changes
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <span className="text-xs font-medium text-gray-500">
            {filteredLogs.length} records found
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4" />
              <p className="text-gray-500 text-sm">Loading history...</p>
            </div>
          ) : filteredLogs.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredLogs.map((log) => (
                <div
                  key={log._id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm">
                          {log.description}
                        </span>
                        {log.severity === "warning" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-100 text-orange-700">
                            Warning
                          </span>
                        )}
                        {log.severity === "critical" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700">
                            Critical
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {log.userName || "System"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                        {log.ipAddress && (
                          <span className="text-gray-400">
                            IP: {log.ipAddress}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-gray-900">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {log.category.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <History className="w-12 h-12 mb-4 text-gray-300" />
              <p>No changes recorded yet.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function History({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v5h5" />
      <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
    </svg>
  );
}

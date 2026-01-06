import React from "react";
import { ShieldAlert, Wrench } from "lucide-react";

export default function MaintenanceOverlay({ status }) {
  const isLockdown = status.type === "lockdown";
  const title = isLockdown ? "Emergency Lockdown" : "System Maintenance";
  const icon = isLockdown ? (
    <ShieldAlert className="w-16 h-16 text-red-600 mb-4" />
  ) : (
    <Wrench className="w-16 h-16 text-blue-600 mb-4" />
  );

  const bgColor = isLockdown ? "bg-red-50" : "bg-blue-50";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 backdrop-blur-sm">
      <div
        className={`w-full max-w-md p-8 rounded-2xl shadow-2xl ${bgColor} text-center transform transition-all scale-100`}
      >
        <div className="flex justify-center">{icon}</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">
          {status.message ||
            "The system is currently unavailable. Please try again later."}
        </p>

        <div className="text-sm text-gray-500 border-t border-gray-200 pt-4 mt-4">
          Event Evaluation System
        </div>
      </div>
    </div>
  );
}

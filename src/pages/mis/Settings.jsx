import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Settings,
  Shield,
  Bell,
  Database,
  Clock,
  Users,
  UserPlus,
  Lock,
  Cog,
} from "lucide-react";

function SettingsPage() {
  const location = useLocation();

  // Determine active tab based on current path
  const getActiveTab = () => {
    if (location.pathname.includes("/settings/guest")) return "guest";
    if (location.pathname.includes("/settings/security")) return "security";
    if (location.pathname.includes("/settings/notifications"))
      return "notifications";
    if (location.pathname.includes("/settings/data")) return "data";
    if (location.pathname.includes("/settings/automation")) return "automation";
    if (location.pathname.includes("/settings/integration"))
      return "integration";
    if (location.pathname.includes("/settings/access")) return "access";
    return "general";
  };

  const settingsTabs = [
    {
      id: "general",
      path: "/mis/settings/general",
      icon: <Cog className="w-5 h-5" />,
      label: "General Settings",
      description: "System-wide configuration and preferences",
    },
    {
      id: "guest",
      path: "/mis/settings/guest",
      icon: <UserPlus className="w-5 h-5" />,
      label: "Guest Access",
      description: "Guest evaluator and speaker account settings",
    },
    {
      id: "security",
      path: "/mis/settings/security",
      icon: <Shield className="w-5 h-5" />,
      label: "Security Settings",
      description: "Authentication, encryption, and security policies",
    },
    {
      id: "notifications",
      path: "/mis/settings/notifications",
      icon: <Bell className="w-5 h-5" />,
      label: "Notification Settings",
      description: "Email, SMS, and system notification configuration",
    },
    {
      id: "data",
      path: "/mis/settings/data",
      icon: <Database className="w-5 h-5" />,
      label: "Data Management",
      description: "Database, backup, and data retention policies",
    },
    {
      id: "automation",
      path: "/mis/settings/automation",
      icon: <Clock className="w-5 h-5" />,
      label: "Automation Rules",
      description: "Scheduled tasks and automated workflows",
    },
    {
      id: "integration",
      path: "/mis/settings/integration",
      icon: <Users className="w-5 h-5" />,
      label: "System Integration",
      description: "Third-party service connections and APIs",
    },
    {
      id: "access",
      path: "/mis/settings/access",
      icon: <Lock className="w-5 h-5" />,
      label: "Access Control",
      description: "Role-based access and permission management",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-blue-950" />
            <h2 className="text-xl font-bold text-gray-800">System Settings</h2>
          </div>

          <div className="space-y-2">
            {settingsTabs.map((tab) => (
              <Link
                key={tab.id}
                to={tab.path}
                className={`flex items-center gap-3 p-3 rounded-lg transition ${
                  getActiveTab() === tab.id
                    ? "bg-blue-950 text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {tab.icon}
                <div className="flex-1">
                  <div className="font-medium">{tab.label}</div>
                  <div className="text-xs text-gray-400">{tab.description}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3">
        <div className="bg-white rounded-lg shadow-md p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;

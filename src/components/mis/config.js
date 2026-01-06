import { LayoutGrid, Users, Settings, FileText, Lock } from "lucide-react";

export const headerConfig = {
  pageTitles: {
    "/mis": "MIS Dashboard",
    "/mis/user-management": "User Management",
    "/mis/user-roles": "User Roles",
    "/mis/audit-logs": "Audit Logs",
    "/mis/settings": "System Configuration",
    "/mis/security-oversight": "Security Oversight",
    "/mis/notifications": "Notifications",
    "/profile": "My Account",
  },
  defaultTitle: "MIS Dashboard",
  notificationPath: true, // uses /mis/notifications
};

export const sidebarConfig = {
  homePath: "/mis",
  menuItems: [
    { iconComponent: LayoutGrid, label: "Dashboard", path: "/mis" },
    {
      iconComponent: Users,
      label: "User & Roles",
      path: "/mis/user-provisioning",
      subItems: [
        { label: "User Management", path: "/mis/user-management" },
        { label: "User Roles", path: "/mis/user-roles" },
      ],
    },
    {
      iconComponent: Settings,
      label: "System Config",
      path: "/mis/settings",
    },
    // Section divider
    { type: "divider", label: "SECURITY & LOGS" },
    { iconComponent: FileText, label: "Audit Logs", path: "/mis/audit-logs" },
    {
      iconComponent: Lock,
      label: "Security Oversight",
      path: "/mis/security-oversight",
    },
  ],
};

export const layoutConfig = {
  showProfileSection: false,
  profileSectionPaths: [],
  headerConfig,
  sidebarConfig,
};

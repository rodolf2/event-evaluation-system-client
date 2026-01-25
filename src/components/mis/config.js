import {
  LayoutGrid,
  Users,
  Settings,
  FileText,
  Lock,
  FileBarChart,
  Shield,
} from "lucide-react";

export const headerConfig = {
  pageTitles: {
    "/mis": "MIS Dashboard",
    "/mis/user-management": "User Management",
    "/mis/user-roles": "User Roles",
    "/mis/audit-logs": "Audit Logs",
    "/mis/settings": "System Configuration",
    "/mis/security-oversight": "Security Oversight",
    "/mis/notifications": "Notifications",
    "/mis/reports": "Shared Reports",
    "/mis/permissions": "Page Permissions",
    "/profile": "My Account",
  },
  defaultTitle: "MIS Dashboard",
  notificationPath: true, // uses /mis/notifications
};

export const getSidebarConfig = (user) => ({
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
    { iconComponent: FileText, label: "Audit Logs", path: "/mis/audit-logs" },
    {
      iconComponent: Lock,
      label: "Security Oversight",
      path: "/mis/security-oversight",
    },
    {
      iconComponent: Shield,
      label: "Permissions",
      path: "/mis/permissions",
    },
    // Conditionally add Reports if user has canViewSharedReports permission (default to true if not set)
    ...(user?.permissions?.canViewSharedReports !== false
      ? [
          {
            iconComponent: FileBarChart,
            label: "Shared Reports",
            path: "/mis/reports",
          },
        ]
      : []),
  ],
});

export const getLayoutConfig = (user) => ({
  showProfileSection: false,
  profileSectionPaths: [],
  headerConfig,
  sidebarConfig: getSidebarConfig(user),
});

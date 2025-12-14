import HomeIcon from "../../assets/icons/home-icon.svg";
import ReportsIcon from "../../assets/icons/report-icon.svg";
import AnalyticsIcon from "../../assets/icons/analytics-icon.svg";
import UserIcon from "../../assets/icons/profile-icon.svg";
import SettingsIcon from "../../assets/icons/upload-icon.svg";

export const headerConfig = {
  pageTitles: {
    "/mis": "MIS Dashboard",
    "/mis/user-management": "User Management",
    "/mis/notifications": "Notifications",
    "/profile": "My Account",
  },
  defaultTitle: "MIS Dashboard",
  notificationPath: true, // uses /mis/notifications
};

export const sidebarConfig = {
  homePath: "/mis",
  menuItems: [
    { icon: HomeIcon, label: "Dashboard", path: "/mis" },
    { icon: UserIcon, label: "User Management", path: "/mis/user-management" },
    {
      icon: SettingsIcon,
      label: "System Settings",
      path: "/mis/settings",
      subItems: [
        { label: "General Settings", path: "/mis/settings/general" },
        { label: "Security Settings", path: "/mis/settings/security" },
      ],
    },
    { icon: ReportsIcon, label: "System Reports", path: "/mis/reports" },
  ],
};

export const layoutConfig = {
  showProfileSection: false,
  profileSectionPaths: [],
  headerConfig,
  sidebarConfig,
};

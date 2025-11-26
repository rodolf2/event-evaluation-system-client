 import HomeIcon from "../../assets/icons/home-icon.svg";
import ReportsIcon from "../../assets/icons/report-icon.svg";

export const headerConfig = {
  pageTitles: {
    "/school-admin/home": "Home",
    "/school-admin/reports": "Reports",
    "/school-admin/profile": "Profile",
  },
  defaultTitle: "School Admin Portal",
  notificationPath: "/school-admin/notifications",
};

export const sidebarConfig = {
  homePath: "/school-admin/home",
  menuItems: [
    { icon: HomeIcon, label: "Home", path: "/school-admin/home" },
    { icon: ReportsIcon, label: "Reports", path: "/school-admin/reports" },
  ],
};

export const layoutConfig = {
  showProfileSection: false,
  profileSectionPaths: [],
  headerConfig,
  sidebarConfig,
};
import HomeIcon from "../../assets/icons/home-icon.svg";
import ReportsIcon from "../../assets/icons/report-icon.svg";

export const headerConfig = {
  pageTitles: {
    "/senior-management/home": "Home",
    "/senior-management/reports": "Reports",
    "/senior-management/profile": "Profile",
    "/senior-management/notifications": "Notifications",
  },
  defaultTitle: "Senior Management Portal",
  notificationPath: "/senior-management/notifications",
};

export const sidebarConfig = {
  homePath: "/senior-management/home",
  menuItems: [
    { icon: HomeIcon, label: "Home", path: "/senior-management/home" },
    { icon: ReportsIcon, label: "Reports", path: "/senior-management/reports" },
  ],
};

export const layoutConfig = {
  showProfileSection: false,
  profileSectionPaths: [],
  headerConfig,
  sidebarConfig,
};

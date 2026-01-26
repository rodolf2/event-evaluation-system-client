import HomeIcon from "../../assets/icons/home-icon.svg";
import ReportsIcon from "../../assets/icons/report-icon.svg";

export const headerConfig = {
  pageTitles: {
    "/club-adviser/home": "Home",
    "/club-adviser/reports": "Reports",
    "/club-adviser/profile": "Profile",
  },
  defaultTitle: "Club Adviser Portal",
  notificationPath: "/club-adviser/notifications",
};

export const sidebarConfig = {
  homePath: "/club-adviser/home",
  menuItems: [
    { icon: HomeIcon, label: "Home", path: "/club-adviser/home" },
    { icon: ReportsIcon, label: "Reports", path: "/club-adviser/reports" },
  ],
};

export const layoutConfig = {
  showProfileSection: false,
  profileSectionPaths: [],
  headerConfig,
  sidebarConfig,
};

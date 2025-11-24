import HomeIcon from "../../assets/icons/home-icon.svg";
import ReportsIcon from "../../assets/icons/report-icon.svg";
import AnalyticsIcon from "../../assets/icons/analytics-icon.svg";
import EvaluationsIcon from "../../assets/icons/evaluations-icon.svg";
import CertificateIcon from "../../assets/icons/certificate-icon.svg";
import BadgeIcon from "../../assets/icons/badge-icon.svg";

export const headerConfig = {
  pageTitles: {
    "/profile": "My Account",
    "/club-officer/home": "Home",
    "/club-officer/evaluations": "Evaluations",
    "/club-officer/evaluations/create": "Survey Creation",
    "/club-officer/evaluations/my": "My Evaluations",
    "/club-officer/certificates": "Certificates",
    "/club-officer/certificates/make": "Make Certificates",
    "/club-officer/certificates/my": "My Certificates",
    "/club-officer/badges": "My Badges",
    "/club-officer/analytics": "Event Analytics",
    "/club-officer/reports": "Reports",
  },
  defaultTitle: "Home",
  notificationPath: true, // uses /club-officer/notifications
};

export const sidebarConfig = {
  homePath: "/club-officer/home",
  menuItems: [
    { icon: HomeIcon, label: "Home", path: "/club-officer/home" },
    {
      icon: EvaluationsIcon,
      label: "Evaluations",
      path: "/club-officer/evaluations",
      subItems: [
        { label: "Survey Creation", path: "/club-officer/evaluations/create" },
        { label: "My Evaluations", path: "/club-officer/evaluations/my" },
      ]
    },
    {
      icon: CertificateIcon,
      label: "Certificates",
      path: "/club-officer/certificates",
      subItems: [
        { label: "Make Certificates", path: "/club-officer/certificates/make" },
        { label: "My Certificates", path: "/club-officer/certificates/my" },
      ]
    },
    { icon: BadgeIcon, label: "My Badges", path: "/club-officer/badges" },
    { icon: AnalyticsIcon, label: "Event Analytics", path: "/club-officer/analytics" },
    { icon: ReportsIcon, label: "Reports", path: "/club-officer/reports" },
  ],
};

export const layoutConfig = {
  showProfileSection: false,
  profileSectionPaths: ["/club-officer/home"],
  headerConfig,
  sidebarConfig,
};
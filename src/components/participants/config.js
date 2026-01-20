import HomeIcon from "../../assets/icons/home-icon.svg";
import BadgeIcon from "../../assets/icons/badge-icon.svg";
import EvaluationsIcon from "../../assets/icons/evaluations-icon.svg";
import CertificateIcon from "../../assets/icons/certificate-icon.svg";

export const headerConfig = {
  pageTitles: {
    "/profile": "My Account",
    "/student/home": "Home",
    "*evaluations": "My Evaluations",
    "*certificates": "My Certificates",
    "*badges": "My Badges",
  },
  defaultTitle: "Home",
  notificationPath: false, // uses /student/notifications
};

export const sidebarConfig = {
  homePath: "/student/home",
  menuItems: [
    { icon: HomeIcon, label: "Home", path: "/student/home" },
    {
      icon: EvaluationsIcon,
      label: "My Evaluations",
      path: "/student/evaluations",
    },
    {
      icon: CertificateIcon,
      label: "My Certificates",
      path: "/student/certificates",
    },
    { icon: BadgeIcon, label: "My Badges", path: "/student/badges" },
  ],
};

export const layoutConfig = {
  showProfileSection: false,
  profileSectionPaths: ["/student/home"],
  headerConfig,
  sidebarConfig,
};

import HomeIcon from "../../assets/icons/home-icon.svg";
import BadgeIcon from "../../assets/icons/badge-icon.svg";
import EvaluationsIcon from "../../assets/icons/evaluations-icon.svg";
import CertificateIcon from "../../assets/icons/certificate-icon.svg";

export const headerConfig = {
  pageTitles: {
    "/profile": "My Account",
    "/participant/home": "Home",
    "*evaluations": "My Evaluations",
    "*certificates": "My Certificates",
    "*badges": "My Badges",
  },
  defaultTitle: "Home",
  notificationPath: false, // uses /participant/notifications
};

export const sidebarConfig = {
  homePath: "/participant/home",
  menuItems: [
    { icon: HomeIcon, label: "Home", path: "/participant/home" },
    {
      icon: EvaluationsIcon,
      label: "My Evaluations",
      path: "/participant/evaluations",
    },
    {
      icon: CertificateIcon,
      label: "My Certificates",
      path: "/participant/certificates",
    },
    { icon: BadgeIcon, label: "My Badges", path: "/participant/badges" },
  ],
};

export const layoutConfig = {
  showProfileSection: false,
  profileSectionPaths: ["/participant/home"],
  headerConfig,
  sidebarConfig,
};

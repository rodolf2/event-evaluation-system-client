import HomeIcon from "../../assets/icons/home-icon.svg";
import ReportsIcon from "../../assets/icons/report-icon.svg";
import AnalyticsIcon from "../../assets/icons/analytics-icon.svg";
import EvaluationsIcon from "../../assets/icons/evaluations-icon.svg";
import CertificateIcon from "../../assets/icons/certificate-icon.svg";

export const headerConfig = {
  pageTitles: {
    "/profile": "My Account",
    "/psas/home": "Home",
    "*evaluations": "Evaluations",
    "*certificates": "Certificates",
    "/psas/analytics": "Event Analytics",
    "*reports": "Reports",
  },
  defaultTitle: "Home",
  notificationPath: true, // uses /psas/notifications
};

export const getSidebarConfig = (user) => {
  // Build menu items based on permissions
  const menuItems = [
    { icon: HomeIcon, label: "Home", path: "/psas/home" },
    { icon: EvaluationsIcon, label: "Evaluations", path: "/psas/evaluations" },
    { icon: CertificateIcon, label: "Certificate", path: "/psas/certificates" },
  ];

  // Add Analytics if permission is granted (explicitly true for PSAS Head)
  if (user?.role === "psas" && user?.position === "PSAS Head") {
    menuItems.push({
      icon: AnalyticsIcon,
      label: "Event Analytics",
      path: "/psas/analytics",
    });
  }

  // Add Reports if permission is granted (explicitly true for PSAS Head)
  if (user?.role === "psas" && user?.position === "PSAS Head") {
    menuItems.push({
      icon: ReportsIcon,
      label: "Report",
      path: "/psas/reports",
    });
  }

  return {
    homePath: "/psas/home",
    menuItems,
  };
};

export const getLayoutConfig = (user) => ({
  showProfileSection: false,
  profileSectionPaths: ["/psas/home"],
  backgroundColor: "bg-gray-100",
  headerConfig,
  sidebarConfig: getSidebarConfig(user),
});

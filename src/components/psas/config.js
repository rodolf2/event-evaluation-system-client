import HomeIcon from "../../assets/icons/home-icon.svg";
import ReportsIcon from "../../assets/icons/report-icon.svg";
import AnalyticsIcon from "../../assets/icons/analytics-icon.svg";
import EvaluationsIcon from "../../assets/icons/evaluations-icon.svg";
import CertificateIcon from "../../assets/icons/certificate-icon.svg";

import { Users, Settings } from "lucide-react";

export const headerConfig = {
  pageTitles: {
    "/profile": "My Account",
    "/psas/home": "Home",
    "*evaluations": "Evaluations",
    "*certificates": "Certificates",
    "/psas/analytics": "Event Analytics",
    "*reports": "Reports",
    "/psas/student-management": "Student Management",
    "/psas/system-controls": "System Settings",
  },
  defaultTitle: "Home",
  notificationPath: true, // uses /psas/notifications
};

export const getSidebarConfig = (user) => {
  // Build menu items based on permissions
  const menuItems = [
    { icon: HomeIcon, label: "Home", path: "/psas/home" },
  ];

  // [ITSS RESTRICTION] ITSS only sees Home and Student Management
  if (user?.position === "ITSS") {
    menuItems.push({
      iconComponent: Users,
      label: "Student Management",
      path: "/psas/student-management",
    });
    return {
      homePath: "/psas/home",
      menuItems,
    };
  }

  // Standard PSAS items
  menuItems.push(
    { icon: EvaluationsIcon, label: "Evaluations", path: "/psas/evaluations" },
    { icon: CertificateIcon, label: "Certificate", path: "/psas/certificates" }
  );

  // Add Students Management for PSAS Head (for PBOO elevation)
  if (user?.position === "PSAS Head") {
    menuItems.push({
      iconComponent: Users,
      label: "Student Management",
      path: "/psas/student-management",
    });
  }

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
    // System Controls (Global Params, NLP, JWT)
    menuItems.push({
      iconComponent: Settings, // Needs import
      label: "System Settings",
      path: "/psas/system-controls",
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

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

export const getSidebarConfig = (user) => ({
  homePath: "/psas/home",
  menuItems: [
    { icon: HomeIcon, label: "Home", path: "/psas/home" },
    { icon: EvaluationsIcon, label: "Evaluations", path: "/psas/evaluations" },
    { icon: CertificateIcon, label: "Certificate", path: "/psas/certificates" },
    // Conditionally add Analytics and Reports if user has permission
    ...(user?.permissions?.canViewAnalyticsReports
      ? [
          {
            icon: AnalyticsIcon,
            label: "Event Analytics",
            path: "/psas/analytics",
          },
          { icon: ReportsIcon, label: "Report", path: "/psas/reports" },
        ]
      : []),
  ],
});

export const getLayoutConfig = (user) => ({
  showProfileSection: false,
  profileSectionPaths: ["/psas/home"],
  headerConfig,
  sidebarConfig: getSidebarConfig(user),
});

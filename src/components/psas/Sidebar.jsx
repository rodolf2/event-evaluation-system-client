import { X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import HomeIcon from "../../assets/icons/home-icon.svg";
import ReportsIcon from "../../assets/icons/report-icon.svg";
import AnalyticsIcon from "../../assets/icons/analytics-icon.svg";
import EvaluationsIcon from "../../assets/icons/evaluations-icon.svg";
import CertificateIcon from "../../assets/icons/certificate-icon.svg";
import LvccName from "../../assets/fonts/lvcc-name.svg";

const MENU_ITEMS = [
  { icon: HomeIcon, label: "Home", path: "/psas/home" },
  { icon: EvaluationsIcon, label: "Evaluations", path: "/psas/evaluations" },
  { icon: CertificateIcon, label: "Certificate", path: "/psas/certificates" },
  { icon: AnalyticsIcon, label: "Event Analytics", path: "/psas/analytics" },
  { icon: ReportsIcon, label: "Report", path: "/psas/reports" },
];

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <aside
      className={`fixed lg:top-5 lg:left-5 transition-all duration-400 ease-in-out z-30
        ${
          isOpen
            ? "top-0 left-0 w-1/2 h-full lg:w-64 lg:h-[95vh]"
            : "top-0 -left-1/2 lg:left-5 w-1/2 lg:w-24 h-full lg:h-[95vh]"
        }
        bg-[#1F3463] text-white flex flex-col items-center py-6 lg:rounded-[15px]`}
    >
      {/* Mobile Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white lg:hidden p-2 transition-all duration-300 hover:bg-white/10 rounded-lg z-10"
        aria-label="Close menu"
      >
        <X className="w-6 h-6 transition-transform duration-300 hover:rotate-90" />
      </button>

      {/* Logo and Text */}
      <div
        className={`flex items-center w-full px-6 pr-14 lg:pr-6 transition-all duration-500 ease-out ${
          isOpen ? "mb-8" : "mb-6"
        }`}
      >
        <div
          className={`rounded-full bg-white p-1 shrink-0 transition-all duration-300 ease-in-out ${
            isOpen ? "w-14 h-14 lg:w-20 lg:h-20" : "w-12 h-12"
          } flex items-center justify-center`}
        >
          <img
            src="/assets/logo/LOGO.png"
            alt="Logo"
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <div
          className={`flex flex-col justify-center overflow-hidden whitespace-nowrap transition-all duration-500 ease-in-out delay-100
          ${
            isOpen ? "max-w-[200px] opacity-100 ml-2" : "max-w-0 opacity-0 ml-0"
          }`}
        >
          <img
            src={LvccName}
            alt="La Verdad Christian College"
            className={`w-auto object-contain transition-all duration-300 ease-in-out ${
              isOpen ? "h-20" : "h-16"
            }`}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex items-center w-full">
        <nav className="flex flex-col space-y-3 w-full">
          {MENU_ITEMS.map((item) => (
            <SidebarItem
              key={item.path}
              src={item.icon}
              label={item.label}
              isOpen={isOpen}
              isActive={
                item.path === "/psas/home"
                  ? currentPath === item.path
                  : currentPath.startsWith(item.path)
              }
              onClick={() => {
                navigate(item.path);
                if (window.innerWidth < 1024) {
                  onClose();
                }
              }}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
};

const SidebarItem = ({ src, label, isOpen, isActive, onClick }) => (
  <div className="w-full relative" onClick={onClick}>
    {/* Active vertical line on the left edge */}
    {isActive && (
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-md"
        aria-hidden="true"
      />
    )}

    <div
      className={`flex items-center cursor-pointer transition-all duration-300 px-4 ${
        isOpen ? "py-3" : "py-2"
      } mx-4`}
    >
      {/* Icon with conditional white container */}
      <div className="relative shrink-0 mr-3">
        <div
          className={`rounded-lg p-2 transition-all ${
            isActive ? "bg-white shadow-md" : "bg-transparent hover:bg-white/10"
          }`}
        >
          <img
            src={src}
            alt={label}
            className={`w-6 h-6 transition-all ${
              isActive
                ? "brightness-0 opacity-70"
                : "brightness-0 invert opacity-90 hover:opacity-100"
            }`}
          />
        </div>
      </div>

      {/* Text - Only visible when open */}
      <span
        className={`text-sm font-medium overflow-hidden whitespace-nowrap transition-all duration-400 ease-in-out delay-75 ml-3
          text-white
          ${isOpen ? "max-w-[200px] opacity-100" : "max-w-0 opacity-0"}
        `}
      >
        {label}
      </span>
    </div>
  </div>
);

export default Sidebar;

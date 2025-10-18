import { X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import HomeIcon from "../../assets/icons/home-icon.svg";
import ReportsIcon from "../../assets/icons/report-icon.svg";
import AnalyticsIcon from "../../assets/icons/analytics-icon.svg";
import EvaluationsIcon from "../../assets/icons/evaluations-icon.svg";
import CertificateIcon from "../../assets/icons/certificate-icon.svg";

const MENU_ITEMS = [
  { icon: HomeIcon, label: "Home", path: "/psas" },
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
      className={`fixed lg:top-5 lg:left-5 transition-all duration-300 z-30 
        ${
          isOpen
            ? "top-0 left-0 w-full h-full lg:w-64 lg:h-[95vh]"
            : "top-0 -left-full lg:left-5 w-full lg:w-24 h-full lg:h-[95vh]"
        }
        bg-[#1F3463] text-white flex flex-col items-center py-6 lg:rounded-[15px]`}
    >
      {/* Mobile Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white lg:hidden p-2"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Logo and Text */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <img
          src="/src/assets/logo/LOGO.png"
          alt="Logo"
          className="w-12 h-12 rounded-full flex-shrink-0"
        />
        {isOpen && (
          <div className="flex flex-col ">
            <span className="text-white text-lg  font-middleearth uppercase leading-5">
              La Verdad <br />{" "}
              <span className="text-[10px]">Christian College, Inc.</span>
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col items-center justify-center space-y-2 w-full">
        {MENU_ITEMS.map((item) => (
          <SidebarItem
            key={item.path}
            src={item.icon}
            label={item.label}
            isOpen={isOpen}
            isActive={
              item.path === "/psas"
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
    </aside>
  );
};

const SidebarItem = ({ src, label, isOpen, isActive, onClick }) => (
  <div className="w-full relative" onClick={onClick}>
    {/* Active vertical line on the left edge of sidebar */}
    {isActive && (
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-white rounded-r-md"
        aria-hidden="true"
      />
    )}

    <div
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all ${
        isActive
          ? "bg-white text-[#1F3463] rounded-lg mx-4"
          : "text-white hover:bg-white/5 rounded-lg mx-4"
      } ${!isOpen ? "justify-center px-2" : ""}`}
    >
      {/* Icon */}
      <div className={`relative ${!isOpen ? "mx-auto" : ""}`}>
        <img
          src={src}
          alt={label}
          className={`w-6 h-6 transition-all ${
            isActive
              ? "brightness-0" // This will make the icon #1F3463 when parent has white background
              : "brightness-0 invert" // This will make the icon white when inactive
          }`}
        />
      </div>

      {/* Text */}
      {isOpen && (
        <span
          className={`text-sm font-medium ${
            isActive ? "text-[#1F3463]" : "text-white"
          }`}
        >
          {label}
        </span>
      )}
    </div>
  </div>
);

export default Sidebar;

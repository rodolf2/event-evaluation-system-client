import { X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import HomeIcon from "../../assets/icons/home-icon.svg";
import BadgeIcon from "../../assets/icons/badge-icon.svg";
import EvaluationsIcon from "../../assets/icons/evaluations-icon.svg";
import CertificateIcon from "../../assets/icons/certificate-icon.svg";
import LvccName from "../../assets/fonts/lvcc-name.svg";

const MENU_ITEMS = [
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
];

const getIsActive = (item, currentPath) => {
  // Special case for evaluations - also highlight on evaluation form pages
  if (
    item.path.includes("/student/evaluations") ||
    item.label === "My Evaluations"
  ) {
    return (
      currentPath === item.path ||
      currentPath.startsWith("/evaluation/") ||
      currentPath.startsWith("/student/evaluations/")
    );
  }

  // Special case for home path
  if (item.path === "/student/home") {
    return currentPath === item.path;
  }

  // Default behavior - check if current path starts with the item path
  return currentPath.startsWith(item.path);
};

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <aside
      data-tour="sidebar"
      className={`fixed lg:top-5 lg:left-5 transition-all duration-400 ease-in-out z-30 
        ${isOpen
          ? "top-0 left-0 w-full h-full lg:w-64 lg:h-[95vh]"
          : "top-0 -left-full lg:left-5 w-full lg:w-24 h-full lg:h-[95vh]"
        }
        bg-[#1F3463] text-white flex flex-col items-center py-6 lg:rounded-[15px]`}
    >
      {/* Mobile Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors z-10"
        aria-label="Close menu"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Logo and Text */}
      <div className="flex items-center gap-3 mb-8 w-full px-6 pr-14 lg:pr-6">
        <img
          src="/assets/logo/LOGO.png"
          alt="Logo"
          className={`rounded-full shrink-0 transition-all duration-300 ease-in-out ${isOpen ? "w-12 h-12 lg:w-16 lg:h-16" : "w-12 h-12"
            }`}
        />
        {isOpen && (
          <div className="flex flex-col justify-center overflow-hidden whitespace-nowrap">
            <img
              src={LvccName}
              alt="La Verdad Christian College"
              className="w-auto h-16 object-contain"
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col space-y-2 w-full">
        {MENU_ITEMS.map((item) => (
          <SidebarItem
            key={item.path}
            src={item.icon}
            label={item.label}
            isOpen={isOpen}
            isActive={getIsActive(item, currentPath)}
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
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all ${isActive
          ? "bg-white text-[#1F3463] rounded-lg mx-4"
          : "text-white hover:bg-white/5 rounded-lg mx-4"
        }`}
    >
      {/* Icon */}
      <div className={`relative ${isOpen ? "" : "mx-auto"}`}>
        <img
          src={src}
          alt={label}
          className={`w-6 h-6 transition-all ${isActive
              ? "brightness-0" // This will make the icon #1F3463 when parent has white background
              : "brightness-0 invert" // This will make the icon white when inactive
            }`}
        />
      </div>

      {/* Text */}
      {isOpen && (
        <span
          className={`text-sm font-medium ${isActive ? "text-[#1F3463]" : "text-white"
            }`}
        >
          {label}
        </span>
      )}
    </div>
  </div>
);

export default Sidebar;

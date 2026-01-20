import { X, ChevronDown } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef } from "react";
import LvccName from "../../assets/fonts/lvcc-name.svg";

const getIsActive = (item, currentPath, homePath) => {
  // Special case for home path
  if (item.path === homePath) {
    return currentPath === item.path;
  }

  // Check if any sub-item is active
  if (item.subItems) {
    return item.subItems.some((subItem) =>
      currentPath.startsWith(subItem.path),
    );
  }

  // Special case for evaluations - also highlight on evaluation form pages
  if (
    item.path.includes("/student/evaluations") ||
    item.label === "My Evaluations"
  ) {
    return (
      currentPath === item.path ||
      currentPath.startsWith("/evaluations/") ||
      currentPath.startsWith("/student/evaluations/")
    );
  }

  // Default behavior - check if current path starts with the item path
  return currentPath.startsWith(item.path);
};

const Sidebar = ({ isOpen, onClose, config = {}, className = "" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Load expanded state from localStorage
  const [expandedItems, setExpandedItems] = useState(() => {
    const saved = localStorage.getItem("sidebarExpandedItems");
    return saved ? JSON.parse(saved) : {};
  });

  const [hoveredItem, setHoveredItem] = useState(null);

  const { menuItems = [], logo = {} } = config;

  const defaultLogo = {
    src: "/assets/logo/LOGO.png",
    alt: "Logo",
    text: {
      main: "La Verdad",
      sub: "Christian College, Inc.",
    },
  };

  const logoConfig = { ...defaultLogo, ...logo };

  const toggleExpanded = (path) => {
    setExpandedItems((prev) => {
      const newState = {
        ...prev,
        [path]: !prev[path],
      };
      localStorage.setItem("sidebarExpandedItems", JSON.stringify(newState));
      return newState;
    });
  };

  const timeoutRef = useRef(null);

  const handleMouseEnter = (path) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (!isOpen) {
      setHoveredItem(path);
    }
  };

  const handleMouseLeave = () => {
    if (!isOpen) {
      timeoutRef.current = setTimeout(() => {
        setHoveredItem(null);
      }, 300); // 300ms delay to allow moving to the submenu
    }
  };

  return (
    <aside
      className={`fixed lg:top-5 lg:left-5 transition-all duration-400 ease-in-out z-30
        ${
          isOpen
            ? "top-0 left-0 w-1/2 h-full lg:w-64 lg:h-[95vh]"
            : "top-0 -left-1/2 lg:left-5 w-1/2 lg:w-24 h-full lg:h-[95vh]"
        }
        bg-[#1F3463] text-white flex flex-col items-center py-6 lg:rounded-[15px] ${className}`}
    >
      {/* Mobile Close Button - positioned at top right */}
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
          src={logoConfig.src}
          alt={logoConfig.alt}
          className={`rounded-full shrink-0 transition-all duration-300 ease-in-out ${
            isOpen ? "w-12 h-12 lg:w-16 lg:h-16" : "w-12 h-12"
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
        {menuItems.map((item, index) => {
          // Handle section dividers
          if (item.type === "divider") {
            return (
              <div key={`divider-${index}`} className="pt-4 pb-2">
                {isOpen && (
                  <span className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {item.label}
                  </span>
                )}
                {!isOpen && <hr className="border-gray-200 mx-2" />}
              </div>
            );
          }

          return (
            <div
              key={item.path}
              className="relative"
              onMouseEnter={() => handleMouseEnter(item.path)}
              onMouseLeave={handleMouseLeave}
            >
              <SidebarItem
                src={item.icon}
                icon={item.iconComponent}
                label={item.label}
                isOpen={isOpen}
                isActive={getIsActive(item, currentPath, config.homePath)}
                hasSubItems={!!item.subItems}
                isExpanded={expandedItems[item.path]}
                onClick={() => {
                  if (item.subItems) {
                    if (isOpen) {
                      toggleExpanded(item.path);
                    }
                  } else {
                    navigate(item.path);
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }
                }}
              />
              {/* Sub-items (Accordion Style - When Open) */}
              {item.subItems && isOpen && expandedItems[item.path] && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.subItems.map((subItem) => (
                    <SubMenuItem
                      key={subItem.path}
                      label={subItem.label}
                      isActive={currentPath === subItem.path}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent parent onClick from firing
                        navigate(subItem.path);
                        if (window.innerWidth < 1024) {
                          onClose();
                        }
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Sub-items (Floating Style - When Closed) */}
              {item.subItems && !isOpen && hoveredItem === item.path && (
                <div className="absolute left-full top-0 ml-2 w-48 bg-[#1F3463] rounded-lg shadow-xl py-2 z-50 border border-gray-700">
                  <div className="px-4 py-2 border-b border-gray-700 mb-2">
                    <span className="font-semibold text-white">
                      {item.label}
                    </span>
                  </div>
                  {item.subItems.map((subItem) => (
                    <SubMenuItem
                      key={subItem.path}
                      label={subItem.label}
                      isActive={currentPath === subItem.path}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(subItem.path);
                        setHoveredItem(null);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

const SidebarItem = ({
  src,
  icon: IconComponent,
  label,
  isOpen,
  isActive,
  hasSubItems,
  isExpanded,
  onClick,
}) => (
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
      }`}
    >
      {/* Icon */}
      <div className={`relative ${isOpen ? "" : "mx-auto"}`}>
        {IconComponent ? (
          <IconComponent
            className={`w-6 h-6 transition-all ${
              isActive ? "text-[#1F3463]" : "text-white"
            }`}
          />
        ) : (
          <img
            src={src}
            alt={label}
            className={`w-6 h-6 transition-all ${
              isActive
                ? "brightness-0" // This will make the icon #1F3463 when parent has white background
                : "brightness-0 invert" // This will make the icon white when inactive
            }`}
          />
        )}
      </div>

      {/* Text */}
      {isOpen && (
        <div className="flex items-center justify-between flex-1">
          <span
            className={`text-sm font-medium ${
              isActive ? "text-[#1F3463]" : "text-white"
            }`}
          >
            {label}
          </span>
          {hasSubItems && (
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                isExpanded ? "rotate-180" : ""
              } ${isActive ? "text-[#1F3463]" : "text-white"}`}
            />
          )}
        </div>
      )}
    </div>
  </div>
);

const SubMenuItem = ({ label, isActive, onClick }) => (
  <div
    className={`flex items-center px-4 py-2 cursor-pointer transition-all rounded-lg mx-4 ${
      isActive
        ? "bg-white/20 text-white"
        : "text-white/80 hover:bg-white/10 hover:text-white"
    }`}
    onClick={onClick}
  >
    <span className="text-sm">{label}</span>
  </div>
);

export default Sidebar;

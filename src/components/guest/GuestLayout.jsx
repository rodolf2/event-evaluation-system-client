import { useState, useEffect } from "react";
import { Bell, Menu, X, Download } from "lucide-react";
import { useUI } from "../../contexts/useUI";
import reportIcon from "../../assets/icons/report-icon.svg";

// Custom minimal sidebar for guests - always shows Report as active with no navigation
const GuestSidebar = ({ isOpen, onClose }) => {
  return (
    <aside
      className={`fixed lg:top-5 lg:left-5 transition-all duration-400 ease-in-out z-30
        ${
          isOpen
            ? "top-0 left-0 w-1/2 h-full lg:w-64 lg:h-[95vh]"
            : "top-0 -left-1/2 lg:left-5 w-1/2 lg:w-24 h-full lg:h-[95vh]"
        }
        bg-[#1F3463] text-white flex flex-col items-center py-6 lg:rounded-[15px] print:hidden`}
    >
      {/* Mobile Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white lg:hidden p-2"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 w-full pl-6">
        <img
          src="/assets/logo/LOGO.png"
          alt="LA VERDAD"
          className={`rounded-full shrink-0 transition-all duration-300 ease-in-out ${
            isOpen ? "w-16 h-16" : "w-12 h-12"
          }`}
        />
        {isOpen && (
          <div className="flex flex-col justify-center overflow-hidden whitespace-nowrap">
            <span className="text-white font-bold text-sm">La Verdad</span>
            <span className="text-white/80 text-xs">
              Christian College, Inc.
            </span>
          </div>
        )}
      </div>

      {/* Navigation - Single Report item, always active, no navigation */}
      <nav className="flex flex-col space-y-2 w-full">
        <div className="w-full relative">
          {/* Active vertical line */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-white rounded-r-md"
            aria-hidden="true"
          />
          <div className="flex items-center gap-3 px-4 py-3 bg-white text-[#1F3463] rounded-lg mx-4 cursor-default">
            <div className={`relative ${isOpen ? "" : "mx-auto"}`}>
              <img
                src={reportIcon}
                alt="Report"
                className="w-6 h-6 brightness-0"
              />
            </div>
            {isOpen && (
              <span className="text-sm font-medium text-[#1F3463]">Report</span>
            )}
          </div>
        </div>
      </nav>
    </aside>
  );
};

// Custom header for guest users (no auth required)
const GuestHeader = ({ onMenuClick }) => {
  return (
    <header className="sticky top-0 flex items-center justify-between bg-white shadow-sm p-4 rounded-lg z-20 hover:shadow-lg print:hidden">
      {/* Hamburger + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-gray-100 transition lg:hover:bg-gray-100/50"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="font-semibold text-gray-700 text-lg">Report</h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition">
          <Bell className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#1F3463] flex items-center justify-center">
            <span className="text-white text-sm font-medium">G</span>
          </div>
          <span className="font-medium text-gray-700 hidden sm:block">
            Guest
          </span>
        </div>
      </div>
    </header>
  );
};

function GuestLayout({ children }) {
  const { isSidebarOpen, toggleSidebar } = useUI();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`flex min-h-screen bg-gray-100 relative ${
        isMobile ? "items-center justify-center" : ""
      }`}
    >
      <GuestSidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

      <main
        className={`flex-1 p-4 sm:p-6 lg:p-8 space-y-6 transition-all duration-300 relative ${
          isSidebarOpen ? "lg:ml-[276px]" : "lg:ml-[116px]"
        }`}
      >
        <GuestHeader onMenuClick={toggleSidebar} />
        {/* Floating Download Button */}
        <div className="flex justify-end print:hidden">
          <button
            onClick={() => window.print()}
            className="p-2 rounded-lg transition"
            title="Download Report"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
        <div>{children}</div>
      </main>
    </div>
  );
}

export default GuestLayout;

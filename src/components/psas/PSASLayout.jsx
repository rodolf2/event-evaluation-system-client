import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ProfileSection from "./ProfileSection";
import { useUI } from "../../contexts/useUI";
import { useAuth } from "../../contexts/useAuth";

function PSASLayout({ children, isModalOpen }) {
  const { isSidebarOpen, toggleSidebar } = useUI();
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const showProfileSection = location.pathname === "/psas/home";

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isModalOpen]);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`flex min-h-screen bg-gray-100 relative ml-7 ${
        isMobile ? "items-center justify-center" : ""
      }`}
    >
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

      <main
        className={`flex-1 p-4 sm:p-6 lg:p-8 space-y-6 transition-all duration-300 relative ${
          isSidebarOpen ? "lg:ml-60" : "lg:ml-20"
        }`}
      >
        <Header sidebarOpen={isSidebarOpen} onMenuClick={toggleSidebar} />
        {user && showProfileSection && <ProfileSection />}
        <div className={showProfileSection ? "mt-6" : ""}>{children}</div>
      </main>
    </div>
  );
}

export default PSASLayout;

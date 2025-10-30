import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ProfileSection from "../participants/ProfileSection"; // Using participants version as shared
import ProfileModal from "../participants/ProfileModal"; // Using participants version as shared
import { useUI } from "../../contexts/useUI";
import { useAuth } from "../../contexts/useAuth";

function Layout({ children, isModalOpen, pageLoading = false, config = {} }) {
  const { isSidebarOpen, toggleSidebar } = useUI();
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, right: 0 });
  const location = useLocation();

  const {
    showProfileSection = false,
    headerConfig = {},
    sidebarConfig = {},
    profileSectionPaths = []
  } = config;

  const showProfileSectionOnPath = profileSectionPaths.includes(location.pathname);

  const handleProfileClick = (rect) => {
    setModalPosition({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    setProfileModalOpen(!isProfileModalOpen);
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isModalOpen]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={`flex min-h-screen bg-gray-100 relative ml-7 ${
        isMobile ? "items-center justify-center" : ""
      }`}>
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={toggleSidebar}
        config={sidebarConfig}
      />

      {isProfileModalOpen && (
        <div
          className="fixed inset-0 bg-[#F4F4F5]/60 z-40"
          onClick={() => setProfileModalOpen(false)}
        />
      )}

      <main
        className={`flex-1 p-4 sm:p-6 lg:p-8 space-y-6 transition-all duration-300 relative ${
          isSidebarOpen ? "lg:ml-60" : "lg:ml-20"
        }`}
      >
        <Header
          sidebarOpen={isSidebarOpen}
          onMenuClick={toggleSidebar}
          onProfileClick={handleProfileClick}
          config={headerConfig}
        />
        {user && showProfileSection && showProfileSectionOnPath && !pageLoading && <ProfileSection />}
        <div className={showProfileSection && showProfileSectionOnPath ? "mt-6" : ""}>{children}</div>
      </main>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        position={modalPosition}
      />
    </div>
  );
}

export default Layout;
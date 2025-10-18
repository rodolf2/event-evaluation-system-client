import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useUI } from "../../contexts/UIContext";

function PSASLayout({ children, isModalOpen }) {
  const { isSidebarOpen, toggleSidebar } = useUI();
  const [isMobile, setIsMobile] = useState(false);

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
        {children}
      </main>
    </div>
  );
}

export default PSASLayout;

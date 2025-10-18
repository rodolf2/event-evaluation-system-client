import { createContext, useState, useContext } from 'react';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Default to closed

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <UIContext.Provider value={{ isSidebarOpen, toggleSidebar }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext);

import { useState } from 'react';
import { UIContext } from './UIContextDefinition';

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

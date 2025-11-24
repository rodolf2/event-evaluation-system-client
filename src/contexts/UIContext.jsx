import { useState } from 'react';
import { UIContext } from './UIContextDefinition';

export const UIProvider = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Default to closed
  const [expandedItems, setExpandedItems] = useState(new Set());

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const toggleExpandedItem = (itemPath) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemPath)) {
        newSet.delete(itemPath);
      } else {
        newSet.add(itemPath);
      }
      return newSet;
    });
  };

  return (
    <UIContext.Provider value={{
      isSidebarOpen,
      toggleSidebar,
      expandedItems,
      toggleExpandedItem
    }}>
      {children}
    </UIContext.Provider>
  );
};

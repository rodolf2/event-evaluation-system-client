import { createContext } from 'react';

export const UIContext = createContext({
  isSidebarOpen: false,
  toggleSidebar: () => {},
  expandedItems: new Set(),
  toggleExpandedItem: () => {},
});
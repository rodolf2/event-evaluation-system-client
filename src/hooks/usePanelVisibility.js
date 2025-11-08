import { useState } from "react";

export const usePanelVisibility = () => {
  const [leftPanelVisible, setLeftPanelVisible] = useState(true);
  const [rightPanelVisible, setRightPanelVisible] = useState(true);

  const toggleLeftPanel = () => setLeftPanelVisible(!leftPanelVisible);
  const toggleRightPanel = () => setRightPanelVisible(!rightPanelVisible);

  return {
    leftPanelVisible,
    rightPanelVisible,
    toggleLeftPanel,
    toggleRightPanel,
  };
};
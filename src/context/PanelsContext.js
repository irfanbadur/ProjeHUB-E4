// src/context/PanelsContext.js
import React, { createContext, useContext, useRef, useState } from "react";

const PanelsContext = createContext();

export const PanelsProvider = ({ children }) => {
  const [panels, setPanels] = useState({});

  const registerPanel = (name, info) => {
    setPanels(prev => ({ ...prev, [name]: info }));
  };

  const updatePanelPosition = (name, pos) => {
    setPanels(prev => ({
      ...prev,
      [name]: { ...prev[name], ...pos }
    }));
  };

  return (
    <PanelsContext.Provider value={{ panels, registerPanel, updatePanelPosition }}>
      {children}
    </PanelsContext.Provider>
  );
};

export const usePanels = () => useContext(PanelsContext);

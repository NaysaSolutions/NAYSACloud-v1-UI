// src/context/ResetContext.js
import React, { createContext, useContext, useState } from "react";

const ResetContext = createContext();

export const useReset = () => useContext(ResetContext);

export const ResetProvider = ({ children }) => {
  const [resetFlag, setResetFlag] = useState(false);

  const triggerReset = () => {
    setResetFlag(true);
    setTimeout(() => setResetFlag(false), 100); // brief flag for reset signal
  };

  return (
    <ResetContext.Provider value={{ resetFlag, triggerReset }}>
      {children}
    </ResetContext.Provider>
  );
};

export default ResetContext;
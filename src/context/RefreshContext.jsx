// RefreshContext.js
import React, { createContext, useContext, useState } from "react";

const RefreshContext = createContext();

export const useRefresh = () => useContext(RefreshContext);

export const RefreshProvider = ({ children }) => {
  const [refreshSignal, setRefreshSignal] = useState(0);

  const triggerRefresh = () => setRefreshSignal(prev => prev + 1);

  return (
    <RefreshContext.Provider value={{ refreshSignal, triggerRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
};

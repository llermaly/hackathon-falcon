import { AppContext } from "@/context/app-context";
import React, { useContext } from "react";

const useApp = () => {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error("useApp must be used within a AppProvider");
  }

  return context;
};

export default useApp;

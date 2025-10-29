"use client";

import { createContext, useContext, useState } from "react";

type MeterContextType = {
  selectedMeter: string;
  setSelectedMeter: (m: string) => void;
};

const MeterContext = createContext<MeterContextType>({
  selectedMeter: "pqgenius",
  setSelectedMeter: () => {}
});

export const MeterProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedMeter, setSelectedMeter] = useState("pqgenius");
  return (
    <MeterContext.Provider value={{ selectedMeter, setSelectedMeter }}>
      {children}
    </MeterContext.Provider>
  );
};

export const useMeter = () => useContext(MeterContext);
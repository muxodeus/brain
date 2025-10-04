"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type MeterContextType = {
  meter: string;
  setMeter: (m: string) => void;
};

const MeterContext = createContext<MeterContextType | undefined>(undefined);

export function MeterProvider({ children }: { children: ReactNode }) {
  const [meter, setMeter] = useState("pqgenius"); // valor inicial

  return (
    <MeterContext.Provider value={{ meter, setMeter }}>
      {children}
    </MeterContext.Provider>
  );
}

export function useMeter() {
  const ctx = useContext(MeterContext);
  if (!ctx) throw new Error("useMeter debe usarse dentro de MeterProvider");
  return ctx;
}
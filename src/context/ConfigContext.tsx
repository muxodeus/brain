"use client";

import { createContext, useContext, useState } from "react";

type Param = { label: string; field: string; color: string };
type Range = { label: string; value: string };

export type Config = {
  meters: string[];
  params: Param[];
  ranges: Range[];
  branding: {
    companyName: string;
    theme: string;
  };
};

const defaultConfig: Config = {
  meters: ["pqgenius"],
  params: [
    { label: "Voltaje (V)", field: "voltage_A", color: "#3b82f6" },
    { label: "Corriente (A)", field: "current_A", color: "#22c55e" },
    { label: "Potencia (kW)", field: "power_kW", color: "#f59e0b" },
    { label: "Energía (kWh)", field: "energy_kWh", color: "#ef4444" },
    { label: "Frecuencia (Hz)", field: "freq_Hz", color: "#8b5cf6" },
  ],
  ranges: [
    { label: "Última hora", value: "-1h" },
    { label: "Últimas 24h", value: "-24h" },
    { label: "Últimos 7 días", value: "-7d" },
    { label: "Últimos 30 días", value: "-30d" },
  ],
  branding: {
    companyName: "Mi Empresa",
    theme: "light",
  },
};

type ConfigContextType = {
  config: Config;
  setConfig: React.Dispatch<React.SetStateAction<Config>>;
};

const ConfigContext = createContext<ConfigContextType>({
  config: defaultConfig,
  setConfig: () => {
    throw new Error("setConfig debe usarse dentro de un ConfigProvider");
  },
});

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState<Config>(defaultConfig);

  return (
    <ConfigContext.Provider value={{ config, setConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
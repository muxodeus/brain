"use client";

import { useEffect, useState } from "react";

type Realtime = {
  voltage: number;
  current: number;
  power: number;
  freq: number;
};

export default function TiempoRealPage() {
  const [data, setData] = useState<Realtime | null>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch("/api/metrics?meter=pqgenius&param=voltage_A&range=-1m&window=1m");
      const voltage = (await res.json()).rows?.at(-1)?._value ?? 0;

      const res2 = await fetch("/api/metrics?meter=pqgenius&param=current_A&range=-1m&window=1m");
      const current = (await res2.json()).rows?.at(-1)?._value ?? 0;

      const res3 = await fetch("/api/metrics?meter=pqgenius&param=power_kW&range=-1m&window=1m");
      const power = (await res3.json()).rows?.at(-1)?._value ?? 0;

      const res4 = await fetch("/api/metrics?meter=pqgenius&param=freq_Hz&range=-1m&window=1m");
      const freq = (await res4.json()).rows?.at(-1)?._value ?? 0;

      setData({ voltage, current, power, freq });
    }, 5000); // refresco cada 5s

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Tiempo Real</h1>
      {data ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-4 bg-white dark:bg-slate-900 rounded shadow">
            <h3 className="text-xs text-slate-500">Voltaje</h3>
            <p className="text-2xl font-bold">{data.voltage.toFixed(1)} V</p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded shadow">
            <h3 className="text-xs text-slate-500">Corriente</h3>
            <p className="text-2xl font-bold">{data.current.toFixed(2)} A</p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded shadow">
            <h3 className="text-xs text-slate-500">Potencia</h3>
            <p className="text-2xl font-bold">{data.power.toFixed(2)} kW</p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded shadow">
            <h3 className="text-xs text-slate-500">Frecuencia</h3>
            <p className="text-2xl font-bold">{data.freq.toFixed(2)} Hz</p>
          </div>
        </div>
      ) : (
        <p>Cargando datos en tiempo real...</p>
      )}
    </div>
  );
}
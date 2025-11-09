"use client";

import { useEffect, useState } from "react";

export default function ReporteConsumo() {
  const [medidor, setMedidor] = useState("M1");
  const [inicio, setInicio] = useState("2025-11-01");
  const [fin, setFin] = useState("2025-11-07");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/reportes/consumo?medidor=${medidor}&inicio=${inicio}&fin=${fin}`);
      const json = await res.json();
      setData(json);
    }
    fetchData();
  }, [medidor, inicio, fin]);

  return (
    <div className="p-6 space-y-6 bg-slate-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold">📈 Reporte de Consumo Diario</h1>

      {/* Filtros */}
      <div className="flex gap-4 items-center">
        <select value={medidor} onChange={(e) => setMedidor(e.target.value)} className="bg-slate-800 px-3 py-2 rounded">
          <option value="M1">Medidor 1</option>
          <option value="M2">Medidor 2</option>
          <option value="M3">Medidor 3</option>
        </select>
        <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} className="bg-slate-800 px-3 py-2 rounded" />
        <input type="date" value={fin} onChange={(e) => setFin(e.target.value)} className="bg-slate-800 px-3 py-2 rounded" />
      </div>

      {/* KPIs */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-800 rounded shadow">
            <div className="text-sm text-slate-400">Consumo total</div>
            <div className="text-xl font-bold">{data.total} kWh</div>
          </div>
          <div className="p-4 bg-slate-800 rounded shadow">
            <div className="text-sm text-slate-400">Promedio diario</div>
            <div className="text-xl font-bold">{data.promedio} kWh</div>
          </div>
          <div className="p-4 bg-slate-800 rounded shadow">
            <div className="text-sm text-slate-400">Día de mayor consumo</div>
            <div className="text-xl font-bold">{data.maxDia.fecha} ({data.maxDia.consumo} kWh)</div>
          </div>
        </div>
      )}
      {/* Gráfico de barras */}
      {data && (
        <div className="space-y-2">
          <div className="text-sm text-slate-400">Consumo diario</div>
          <div className="grid grid-cols-7 gap-2">
            {data.series.map((d: any) => (
              <div key={d.fecha} className="flex flex-col items-center">
                <div
                  className="w-6 bg-blue-500 rounded"
                  style={{ height: `${d.consumo}px`, minHeight: "10px" }}
                  title={`${d.consumo} kWh`}
                />
                <div className="text-xs mt-1">{d.fecha.slice(5)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
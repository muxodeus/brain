"use client";

import { useEffect, useState } from "react";

type MeterConfig = {
  measurement: string;
  alias: string;
  group: string;
  enabled: boolean;
};

export default function MetersConfigPage() {
  const [meters, setMeters] = useState<MeterConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/config/measurements?bucket=pqgenius")
      .then((res) => {
        if (!res.ok) throw new Error("API error " + res.status);
        return res.json();
      })
      .then((d) => {
        if (d.measurements) {
          const mapped = d.measurements.map((m: string) => ({
            measurement: m,
            alias: m,
            group: "",
            enabled: true
          }));
          setMeters(mapped);
        }
      })
      .catch((err) => console.error("Error cargando measurements:", err))
      .finally(() => setLoading(false));
  }, []);

  const updateMeter = (index: number, key: keyof MeterConfig, value: string | boolean) => {
    const updated = [...meters];
    (updated[index] as any)[key] = value;
    setMeters(updated);
  };

  if (loading) return <p className="text-slate-400">Cargando medidores...</p>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6">
      <h1 className="text-xl font-bold mb-4">Medidores</h1>
      <table className="w-full text-sm border border-slate-700">
        <thead className="bg-slate-800 text-slate-200">
          <tr>
            <th className="p-2">Habilitado</th>
            <th className="p-2">Measurement</th>
            <th className="p-2">Alias</th>
            <th className="p-2">Grupo</th>
          </tr>
        </thead>
        <tbody>
          {meters.map((m, i) => (
            <tr key={m.measurement} className="border-t border-slate-700">
              <td className="p-2 text-center">
                <input
                  type="checkbox"
                  checked={m.enabled}
                  onChange={(e) => updateMeter(i, "enabled", e.target.checked)}
                />
              </td>
              <td className="p-2">{m.measurement}</td>
              <td className="p-2">
                <input
                  className="bg-slate-800 text-slate-200 rounded px-2 py-1 w-full"
                  value={m.alias}
                  onChange={(e) => updateMeter(i, "alias", e.target.value)}
                />
              </td>
              <td className="p-2">
                <input
                  className="bg-slate-800 text-slate-200 rounded px-2 py-1 w-full"
                  value={m.group}
                  onChange={(e) => updateMeter(i, "group", e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={() => console.log("Guardar config:", meters)}
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Guardar
      </button>
    </div>
  );
}
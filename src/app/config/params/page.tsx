"use client";

import { useEffect, useState } from "react";

type ParamConfig = {
  field: string;
  label: string;
  color: string;
  unit: string;
  enabled: boolean;
};

const defaultColors = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function ParamsConfigPage() {
  const [params, setParams] = useState<ParamConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/config/fields?meter=pqgenius")
      .then((res) => {
        if (!res.ok) throw new Error("API error " + res.status);
        return res.json();
      })
      .then((d) => {
        if (d.fields) {
          const mapped = d.fields.map((f: string, i: number) => ({
            field: f,
            label: f,
            color: defaultColors[i % defaultColors.length],
            unit: "",
            enabled: true
          }));
          setParams(mapped);
        }
      })
      .catch((err) => {
        console.error("Error cargando fields:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const updateParam = (index: number, key: keyof ParamConfig, value: string | boolean) => {
    const updated = [...params];
    (updated[index] as any)[key] = value;
    setParams(updated);
  };

  if (loading) return <p className="text-slate-400">Cargando campos...</p>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Parámetros</h1>
      <table className="w-full text-sm border border-slate-700">
        <thead className="bg-slate-800 text-slate-200">
          <tr>
            <th className="p-2">Habilitado</th>
            <th className="p-2">Field</th>
            <th className="p-2">Label</th>
            <th className="p-2">Unidad</th>
            <th className="p-2">Color</th>
          </tr>
        </thead>
        <tbody>
          {params.map((p, i) => (
            <tr key={p.field} className="border-t border-slate-700">
              <td className="p-2 text-center">
                <input
                  type="checkbox"
                  checked={p.enabled}
                  onChange={(e) => updateParam(i, "enabled", e.target.checked)}
                />
              </td>
              <td className="p-2">{p.field}</td>
              <td className="p-2">
                <input
                  className="bg-slate-800 text-slate-200 rounded px-2 py-1 w-full"
                  value={p.label}
                  onChange={(e) => updateParam(i, "label", e.target.value)}
                />
              </td>
              <td className="p-2">
                <input
                  className="bg-slate-800 text-slate-200 rounded px-2 py-1 w-full"
                  value={p.unit}
                  onChange={(e) => updateParam(i, "unit", e.target.value)}
                />
              </td>
              <td className="p-2">
                <input
                  type="color"
                  value={p.color}
                  onChange={(e) => updateParam(i, "color", e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={() => console.log("Guardar config:", params)}
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Guardar
      </button>
    </div>
  );
}
"use client";

import { useConfig } from "@/context/ConfigContext";

export default function ConfiguracionPage() {
  const { config, setConfig } = useConfig();
  const { meters, params, ranges, branding } = config;

  // Helpers
  const updateMeters = (newMeters: string[]) =>
    setConfig({ ...config, meters: newMeters });
  const updateParams = (newParams: typeof params) =>
    setConfig({ ...config, params: newParams });
  const updateRanges = (newRanges: typeof ranges) =>
    setConfig({ ...config, ranges: newRanges });
  const updateBranding = (newBranding: typeof branding) =>
    setConfig({ ...config, branding: newBranding });

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-xl font-bold">Centro de Configuración</h2>

      {/* Medidores */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Medidores</h3>
        {meters.map((m, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              value={m}
              onChange={(e) => {
                const copy = [...meters];
                copy[i] = e.target.value;
                updateMeters(copy);
              }}
              className="bg-slate-100 dark:bg-slate-800 p-2 rounded flex-1"
            />
            <button
              onClick={() => updateMeters(meters.filter((_, idx) => idx !== i))}
              className="text-red-500"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={() => updateMeters([...meters, "nuevo_medidor"])}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          + Añadir Medidor
        </button>
      </section>

      {/* Parámetros */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Parámetros</h3>
        {params.map((p, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              value={p.field}
              onChange={(e) => {
                const copy = [...params];
                copy[i].field = e.target.value;
                updateParams(copy);
              }}
              className="bg-slate-100 dark:bg-slate-800 p-2 rounded flex-1"
            />
            <input
              value={p.label}
              onChange={(e) => {
                const copy = [...params];
                copy[i].label = e.target.value;
                updateParams(copy);
              }}
              className="bg-slate-100 dark:bg-slate-800 p-2 rounded flex-1"
            />
            <button
              onClick={() => updateParams(params.filter((_, idx) => idx !== i))}
              className="text-red-500"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={() =>
            updateParams([...params, { field: "nuevo_param", label: "Nuevo" }])
          }
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          + Añadir Parámetro
        </button>
      </section>

      {/* Rangos */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Rangos de Tiempo</h3>
        {ranges.map((r, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              value={r.value}
              onChange={(e) => {
                const copy = [...ranges];
                copy[i].value = e.target.value;
                updateRanges(copy);
              }}
              className="bg-slate-100 dark:bg-slate-800 p-2 rounded flex-1"
            />
            <input
              value={r.label}
              onChange={(e) => {
                const copy = [...ranges];
                copy[i].label = e.target.value;
                updateRanges(copy);
              }}
              className="bg-slate-100 dark:bg-slate-800 p-2 rounded flex-1"
            />
            <button
              onClick={() => updateRanges(ranges.filter((_, idx) => idx !== i))}
              className="text-red-500"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={() =>
            updateRanges([...ranges, { value: "-custom", label: "Nuevo Rango" }])
          }
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          + Añadir Rango
        </button>
      </section>

      {/* Branding */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Branding</h3>
        <input
          value={branding.companyName}
          onChange={(e) =>
            updateBranding({ ...branding, companyName: e.target.value })
          }
          className="bg-slate-100 dark:bg-slate-800 p-2 rounded w-full mb-2"
        />
        <select
          value={branding.theme}
          onChange={(e) =>
            updateBranding({ ...branding, theme: e.target.value })
          }
          className="bg-slate-100 dark:bg-slate-800 p-2 rounded w-full"
        >
          <option value="dark">Oscuro</option>
          <option value="light">Claro</option>
        </select>
      </section>

      {/* Debug JSON */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Vista previa JSON</h3>
        <pre className="bg-slate-900 text-slate-100 p-3 rounded text-xs overflow-x-auto">
          {JSON.stringify(config, null, 2)}
        </pre>
      </section>
    </div>
  );
}
"use client";

const ranges = [
  { key: "-5m", label: "Últimos 5 min" },
  { key: "-1h", label: "Última hora" },
  { key: "-24h", label: "Últimas 24h" },
  { key: "-7d", label: "Últimos 7 días" },
];

export default function TimeRangeSelector({
  selected,
  onChange,
}: {
  selected: string;
  onChange: (r: string) => void;
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm text-slate-400 mb-1">Rango histórico</label>
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200"
      >
        {ranges.map((r) => (
          <option key={r.key} value={r.key}>
            {r.label}
          </option>
        ))}
      </select>
    </div>
  );
}
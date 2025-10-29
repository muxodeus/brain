"use client";

import { useEffect, useState } from "react";

type Props = {
  value: string;
  onChange: (val: string) => void;
  label: string;
};

export default function MeterSelector({ value, onChange, label }: Props) {
  const [meters, setMeters] = useState<string[]>([]);

  useEffect(() => {
    async function loadMeters() {
      try {
        const res = await fetch("/api/metrics/meta", { cache: "no-store" });
        const json = await res.json();
        if (json.ok && json.meters) {
          setMeters(json.meters);
        }
      } catch (err) {
        console.error("❌ Error cargando medidores:", err);
      }
    }
    loadMeters();
  }, []);

  return (
    <div>
      <label className="block text-sm text-slate-400 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200 w-full"
      >
        {meters.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}
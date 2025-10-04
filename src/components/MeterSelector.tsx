"use client";

import { useEffect, useState } from "react";

export default function MeterSelector({
  value,
  onChange,
  label = "Medidor",
}: {
  value?: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  const [meters, setMeters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch("/api/meta");
      const json = await res.json();
      if (json.ok && Array.isArray(json.meters)) {
        setMeters(json.meters);
        if (!value && json.meters.length) onChange(json.meters[0]);
      } else {
        setMeters(["pqgenius"]);
        if (!value) onChange("pqgenius");
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <label className="block text-sm text-slate-400 mb-1">{label}</label>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200 w-full"
      >
        {loading ? <option>Cargando…</option> : meters.map((m) => <option key={m} value={m}>{m}</option>)}
      </select>
    </div>
  );
}
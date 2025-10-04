"use client";

import { useEffect, useState } from "react";

type Props = {
  selected: string;
  onChange: (p: string) => void;
};

export default function ParamSelector({ selected, onChange }: Props) {
  const [params, setParams] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/meta").then(res => res.json()).then(json => {
      if (json.ok) setParams(json.params);
    });
  }, []);

  useEffect(() => {
    if (params.length && (!selected || !params.includes(selected))) {
      onChange(params.includes("voltage_A") ? "voltage_A" : params[0]);
    }
  }, [params]);

  return (
    <div className="mb-4">
      <label className="block text-sm text-slate-400 mb-1">Parámetro</label>
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200"
      >
        {params.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
    </div>
  );
}
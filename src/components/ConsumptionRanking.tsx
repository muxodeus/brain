"use client";

import { useEffect, useState } from "react";

type Rank = { meter: string; value: number };

export default function ConsumptionRanking({ range }: { range: string }) {
  const [ranking, setRanking] = useState<Rank[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/consumption/ranking?range=${range}`);
      const json = await res.json();
      if (json.ok) setRanking(json.ranking);
    }
    load();
  }, [range]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
      <h2 className="text-sm font-semibold text-slate-200 mb-3">
        Ranking de consumo {range}
      </h2>
      <ul className="space-y-2">
        {ranking.map((r, i) => (
          <li
            key={r.meter}
            className="flex justify-between text-slate-300 text-sm"
          >
            <span>
              {i + 1}. {r.meter}
            </span>
            <span className="font-medium text-sky-400">
              {r.value.toFixed(2)} kWh
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
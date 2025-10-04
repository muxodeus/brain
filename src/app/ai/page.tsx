"use client";

import { useEffect, useState } from "react";
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";

type Insight = {
  id: number;
  type: "forecast" | "anomaly" | "recommendation";
  message: string;
};

export default function AIPage() {
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    async function loadInsights() {
      const res = await fetch("/api/ai", { cache: "no-store" });
      const json = await res.json();
      if (json.ok) setInsights(json.insights);
    }
    loadInsights();
  }, []);

  const iconFor = (type: string) => {
    switch (type) {
      case "forecast":
        return <ChartBarIcon className="h-6 w-6 text-sky-500" />;
      case "anomaly":
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />;
      case "recommendation":
        return <LightBulbIcon className="h-6 w-6 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">AI Insights</h1>
      {insights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="p-5 bg-white dark:bg-slate-900 rounded shadow flex items-start gap-3"
            >
              {iconFor(insight.type)}
              <p className="text-slate-700 dark:text-slate-200">{insight.message}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-500">Cargando insights...</p>
      )}
    </div>
  );
}
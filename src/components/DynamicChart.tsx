"use client";

import { useEffect, useState } from "react";
import HighchartsWrapper from "./HighchartsWrapper";

type Point = [number, number];

export default function DynamicChart({ meter, param }: { meter: string; param: string }) {
  const [data, setData] = useState<Point[]>([]);
  const [meta, setMeta] = useState<any>(null);

  useEffect(() => {
    if (!meter || !param) return;
    fetch(`/api/metrics?meter=${encodeURIComponent(meter)}&param=${encodeURIComponent(param)}&range=-1h&window=1m`)
      .then((res) => res.json())
      .then((json) => {
        if (json.ok) {
          setMeta(json.meta);
          const points = json.rows
            .filter((r: any) => r._value !== null)
            .map((r: any) => [new Date(r._time).getTime(), r._value as number]);
          setData(points);
        } else {
          console.error("API error:", json.error);
          setData([]);
        }
      })
      .catch((e) => {
        console.error("Fetch error:", e);
        setData([]);
      });
  }, [meter, param]);

  return (
    <HighchartsWrapper
      options={{
        chart: { type: "line", backgroundColor: "#0B0F1A" },
        title: { text: `${param} - ${meter}`, style: { color: "#E2E8F0" } },
        xAxis: { type: "datetime", labels: { style: { color: "#94A3B8" } } },
        yAxis: { title: { text: param, style: { color: "#94A3B8" } }, gridLineColor: "#1E293B" },
        series: [{ type: "line", name: param, data, color: "#38BDF8" }],
        tooltip: { shared: true },
        legend: { itemStyle: { color: "#E2E8F0" } },
        credits: { enabled: false },
      }}
      height={350}
    />
  );
}
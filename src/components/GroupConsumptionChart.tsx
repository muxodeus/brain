"use client";

import { useEffect, useState } from "react";
import ChartCard from "./ChartCard";
import HighchartsWrapper from "./HighchartsWrapper";

type Point = [number, number];

export default function GroupConsumptionChart({
  groups,
  range,
  window = "1d",
}: {
  groups: { name: string; meters: string[] }[];
  range: string;
  window?: string;
}) {
  const [series, setSeries] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/consumption/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groups, range, window }),
      });
      const json = await res.json();
      if (json.ok) {
        const all = json.results.map((g: any) => ({
          name: g.group,
          data: g.rows.map((r: any) => [
            new Date(r._time).getTime(),
            Number(r._value),
          ]),
        }));
        setSeries(all);
      }
    }
    load();
  }, [groups, range, window]);

  return (
    <ChartCard title={`Consumo por grupo (${range})`}>
      <HighchartsWrapper
        options={{
          chart: { type: "column", backgroundColor: "#0B0F1A" },
          title: { text: undefined },
          xAxis: { type: "datetime" },
          yAxis: { title: { text: "kWh" } },
          series,
          tooltip: { shared: true },
          legend: { itemStyle: { color: "#E2E8F0" } },
        }}
        height={400}
      />
    </ChartCard>
  );
}
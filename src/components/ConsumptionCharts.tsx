"use client";

import { useEffect, useState } from "react";
import ChartCard from "./ChartCard";
import HighchartsWrapper from "./HighchartsWrapper";

type Point = [number, number];

export default function ConsumptionCharts({
  meters,
  range,
}: {
  meters: string[];
  range: string;
}) {
  const [series, setSeries] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const all: any[] = [];
      for (const m of meters) {
        const res = await fetch(`/api/consumption?meter=${m}&range=${range}`);
        const json = await res.json();
        if (json.ok) {
          const data: Point[] = json.rows.map((r: any) => [
            new Date(r._time).getTime(),
            Number(r._value),
          ]);
          all.push({ name: m, type: "column", data });
        }
      }
      setSeries(all);
    }
    load();
  }, [meters, range]);

  return (
    <ChartCard title={`Consumo energético (${range})`}>
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
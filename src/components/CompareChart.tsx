"use client";

import { useEffect, useState } from "react";
import ChartCard from "./ChartCard";
import HighchartsWrapper from "./HighchartsWrapper";

type Point = [number, number];

export default function CompareChart({
  param,
  label,
  meterA,
  meterB,
  range,
}: {
  param: string;
  label: string;
  meterA: string;
  meterB: string;
  range: string;
}) {
  const [dataA, setDataA] = useState<Point[]>([]);
  const [dataB, setDataB] = useState<Point[]>([]);

  useEffect(() => {
    async function fetchSeries(meter: string) {
      const res = await fetch(`/api/metrics?meter=${meter}&param=${param}&range=${range}`);
      const json = await res.json();
      if (json.ok) {
        return json.rows
          .filter((r: any) => r._value !== null)
          .map((r: any) => [new Date(r._time).getTime(), Number(r._value)]);
      }
      return [];
    }

    async function load() {
      const [a, b] = await Promise.all([fetchSeries(meterA), fetchSeries(meterB)]);
      setDataA(a);
      setDataB(b);
    }

    load();
  }, [param, meterA, meterB, range]);

  return (
    <ChartCard title={`${label} — ${meterA} vs ${meterB}`}>
      <HighchartsWrapper
        options={{
          chart: { type: "line", backgroundColor: "#0B0F1A" },
          title: { text: undefined },
          xAxis: { type: "datetime" },
          yAxis: { title: { text: label } },
          series: [
            {
              type: "line",
              name: meterA,
              data: dataA,
              color: "#38BDF8",
            },
            {
              type: "line",
              name: meterB,
              data: dataB,
              color: "#22C55E",
            },
          ],
          tooltip: { shared: true },
          legend: { itemStyle: { color: "#E2E8F0" } },
          credits: { enabled: false },
        }}
        height={300}
      />
    </ChartCard>
  );
}
"use client";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

type Serie = {
  name: string;
  data: [number, number][];
};

type Props = {
  title: string;
  series: Serie[];
};

export default function TimeSeriesChart({ title, series }: Props) {
  const options: Highcharts.Options = {
    chart: {
      type: "line",
      backgroundColor: "transparent",
    },
    title: {
      text: title,
      style: { color: "#fff" },
    },
    xAxis: {
      type: "datetime",
      labels: { style: { color: "#aaa" } },
    },
    yAxis: {
      title: { text: undefined }, // ✅ antes era null
      labels: { style: { color: "#aaa" } },
      gridLineColor: "#333",
    },
    legend: {
      itemStyle: { color: "#ccc" },
    },
    series: series.map((s) => ({
      ...s,
      type: "line", // ✅ forzamos el tipo en cada serie
    })),
    credits: { enabled: false },
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
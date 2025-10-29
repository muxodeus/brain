"use client";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

type Props = {
  title: string;
  series: { name: string; data: [number, number][] }[];
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
      title: { text: null },
      labels: { style: { color: "#aaa" } },
      gridLineColor: "#333",
    },
    legend: {
      itemStyle: { color: "#ccc" },
    },
    series,
    credits: { enabled: false },
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
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

export default function OverlayChart({ title, series }: Props) {
  const options: Highcharts.Options = {
    chart: {
      type: "line",
      backgroundColor: "transparent",
      zoomType: "x", // permite hacer zoom arrastrando en el eje X
    },
    title: {
      text: title,
      style: { color: "#fff" },
    },
    xAxis: {
      type: "datetime",
      labels: { style: { color: "#aaa" } },
      gridLineColor: "#333",
    },
    yAxis: {
      title: { text: null },
      labels: { style: { color: "#aaa" } },
      gridLineColor: "#333",
    },
    legend: {
      itemStyle: { color: "#ccc" },
    },
    tooltip: {
      shared: true, // muestra todas las series en el mismo punto temporal
      crosshairs: true,
      backgroundColor: "#1e293b",
      style: { color: "#fff" },
    },
    plotOptions: {
      series: {
        marker: { enabled: false }, // sin puntos en cada muestra
        events: {
          legendItemClick: function () {
            return true; // permite ocultar/mostrar series desde la leyenda
          },
        },
      },
    },
    series,
    credits: { enabled: false }, // oculta el logo de Highcharts
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
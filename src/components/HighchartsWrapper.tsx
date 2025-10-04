"use client";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useEffect } from "react";

// ⚡ Configurar Highcharts para usar la zona horaria local del navegador
Highcharts.setOptions({
  time: {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },
});

type Props = {
  options: Highcharts.Options;
  height?: number;
};

export default function HighchartsWrapper({ options, height = 400 }: Props) {
  useEffect(() => {
    // Debug opcional
    console.log("Highcharts timezone:", Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={{
        ...options,
        chart: {
          ...options.chart,
          height,
          backgroundColor: "transparent",
        },
      }}
    />
  );
}
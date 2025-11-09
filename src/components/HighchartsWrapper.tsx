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
    // Inicializar módulos en cliente
    const exp = require("highcharts/modules/exporting");
    const expData = require("highcharts/modules/export-data");
    const fs = require("highcharts/modules/full-screen");

    if (typeof exp === "function") exp(Highcharts);
    else if (exp?.default) exp.default(Highcharts);

    if (typeof expData === "function") expData(Highcharts);
    else if (expData?.default) expData.default(Highcharts);

    if (typeof fs === "function") fs(Highcharts);
    else if (fs?.default) fs.default(Highcharts);

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
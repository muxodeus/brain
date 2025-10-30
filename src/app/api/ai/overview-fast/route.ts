import { NextResponse } from "next/server";
import { runFlux } from "@/lib/influx";

type RowValue = { _value: string; _time?: string };

export async function GET(): Promise<Response> {
  try {
    const bucket = process.env.INFLUX_BUCKET || "pqgenius";

    // Consultas que devuelven solo _value
    const firstRowPromise = runFlux<RowValue>(`
      from(bucket: "${bucket}") |> range(start: -7d)
      |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "energy_kWh")
      |> first()
    `);
    const lastRowPromise = runFlux<RowValue>(`
      from(bucket: "${bucket}") |> range(start: -7d)
      |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "energy_kWh")
      |> last()
    `);
    const anteriorFirstPromise = runFlux<RowValue>(`
      from(bucket: "${bucket}") |> range(start: -14d, stop: -7d)
      |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "energy_kWh")
      |> first()
    `);
    const anteriorLastPromise = runFlux<RowValue>(`
      from(bucket: "${bucket}") |> range(start: -14d, stop: -7d)
      |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "energy_kWh")
      |> last()
    `);
    const maxRowsPromise = runFlux<RowValue>(`
      from(bucket: "${bucket}") |> range(start: -7d)
      |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "power_kW")
      |> max()
    `);
    const meanRowsPromise = runFlux<RowValue>(`
      from(bucket: "${bucket}") |> range(start: -7d)
      |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "power_kW")
      |> mean()
    `);

    // Consultas de series (devuelven _time y _value)
    const actualRowsPromise = runFlux<{ _time: string; _value: string }>(`
      from(bucket: "${bucket}") |> range(start: -7d)
      |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "power_kW")
      |> aggregateWindow(every: 30m, fn: mean, createEmpty: false)
    `);
    const anteriorSerieRowsPromise = runFlux<{ _time: string; _value: string }>(`
      from(bucket: "${bucket}") |> range(start: -14d, stop: -7d)
      |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "power_kW")
      |> aggregateWindow(every: 30m, fn: mean, createEmpty: false)
    `);

    const results = await Promise.allSettled([
      firstRowPromise,
      lastRowPromise,
      anteriorFirstPromise,
      anteriorLastPromise,
      maxRowsPromise,
      meanRowsPromise,
      actualRowsPromise,
      anteriorSerieRowsPromise,
    ]);

    const get = <T>(r: PromiseSettledResult<T>): T | null =>
      r.status === "fulfilled" ? r.value : null;

    const [
      firstRow,
      lastRow,
      anteriorFirst,
      anteriorLast,
      maxRows,
      meanRows,
      actualRows,
      anteriorSerieRows,
    ] = results.map(get);

    // Consumos (kWh acumulados)
    const consumo =
      lastRow && firstRow
        ? Number(lastRow[0]?._value ?? 0) - Number(firstRow[0]?._value ?? 0)
        : 0;

    const consumoAnterior =
      anteriorLast && anteriorFirst
        ? Number(anteriorLast[0]?._value ?? 0) -
          Number(anteriorFirst[0]?._value ?? 0)
        : 0;

    // Variación con protecciones
    let variacion: string;
    if (!consumoAnterior || consumoAnterior < 100) {
      variacion = "N/A";
    } else {
      const v = ((consumo - consumoAnterior) / consumoAnterior) * 100;
      variacion = Math.abs(v) > 200 ? "N/A" : `${v.toFixed(1)}%`;
    }

    // Otros KPIs
    const max = maxRows ? Number(maxRows[0]?._value ?? 0) : 0;
    const mean = meanRows ? Number(meanRows[0]?._value ?? 0) : 0;
    const factorCarga = max ? (mean / max) * 100 : 0;

    const kpis = [
      {
        label: "Consumo total (7d)",
        value: consumo ? `${(consumo / 1e3).toFixed(1)} kWh` : "N/A",
      },
      { label: "Variación vs semana anterior", value: variacion },
      {
        label: "Pico máximo de demanda",
        value: max ? `${max.toFixed(1)} kW` : "N/A",
      },
      {
        label: "Factor de carga",
        value: max ? `${factorCarga.toFixed(1)}%` : "N/A",
      },
    ];

    // Series para Highcharts [timestamp(ms), value]
    const actualSeries =
      actualRows?.length
        ? actualRows
            .filter((r) => r._time) // ✅ filtramos para evitar undefined
            .map((r) => [new Date(r._time!).getTime(), Number(r._value)])
        : [];

    const anteriorSeries =
      anteriorSerieRows?.length
        ? anteriorSerieRows
            .filter((r) => r._time) // ✅ filtramos para evitar undefined
            .map((r) => [new Date(r._time!).getTime(), Number(r._value)])
        : [];

    const trendOptions = {
      chart: { type: "line", backgroundColor: "#000000", zoomType: "x" },
      title: {
        text: "Potencia activa — Últimos 7 días",
        style: { color: "#ffffff" },
      },
      xAxis: { type: "datetime", labels: { style: { color: "#ffffff" } } },
      yAxis: {
        title: { text: "kW", style: { color: "#ffffff" } },
        labels: { style: { color: "#ffffff" } },
      },
      legend: { itemStyle: { color: "#ffffff" } },
      series: [
        {
          type: "line" as const,
          name: "Actual",
          data: actualSeries,
          color: "#00ffcc",
        },
        {
          type: "line" as const,
          name: "Anterior",
          data: anteriorSeries,
          dashStyle: "ShortDash",
          color: "#ffcc00",
        },
      ],
    };

    return NextResponse.json({ kpis, trendOptions });
  } catch (err: any) {
    console.error("overview-fast error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Error en overview-fast" },
      { status: 500 }
    );
  }
}
import { InfluxDB } from "@influxdata/influxdb-client";
import type { EspecificacionAnalisis } from "./types";

// ==============================
// Influx setup + utilities
// ==============================
function queryApi() {
  const url = process.env.INFLUX_URL || "https://us-east-1-1.aws.cloud2.influxdata.com";
  const token = process.env.INFLUX_TOKEN || "ug7vnFSzqQseHoS9I1Jx4YL-135--9CO2DI-dL8kavBtt8KUqCcIQK0yOfPB_tXReyYb_4GIqmXW7r0D-TWXeQ==";
  const org = process.env.INFLUX_ORG || "PQGenius";
  return new InfluxDB({ url, token }).getQueryApi(org);
}

type Punto = { time: string; value: number; campo?: string };

async function runFlux<T = any>(flux: string): Promise<T[]> {
  const out: T[] = [];
  await new Promise<void>((resolve, reject) => {
    queryApi().queryRows(flux, {
      next(row, meta) {
        out.push(meta.toObject(row) as T);
      },
      error(err) {
        reject(err);
      },
      complete() {
        resolve();
      },
    });
  });
  return out;
}

async function fetchSeries(bucket: string, rango: string, campo: string): Promise<Punto[]> {
  const flux = `
    from(bucket: "${bucket}")
      |> range(start: ${rango})
      |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "${campo}")
      |> keep(columns: ["_time", "_value"])
      |> sort(columns: ["_time"])
  `;
  const rows = await runFlux<{ _time: string; _value: string }>(flux);
  return rows.map((r) => ({ time: r._time, value: Number(r._value), campo }));
}

function fmtN(v: number | undefined) {
  return v === undefined || Number.isNaN(v) ? "N/A" : Number(v).toFixed(2);
}

// ==============================
// Integración con Ollama
// ==============================
async function generarRecomendaciones(resumen: string, texto: string, metrics?: Record<string, number>): Promise<string[]> {
  try {
    // Construir prompt enriquecido
    let prompt = `Eres un analista energético industrial.\n\nResumen: ${resumen}\nDetalle: ${texto}\n`;
    if (metrics) {
      prompt += `\nMétricas:\n`;
      for (const [k, v] of Object.entries(metrics)) {
        prompt += `- ${k}: ${v.toFixed(2)}\n`;
      }
    }
    prompt += `\nGenera 3 recomendaciones prácticas o insights para un ingeniero de planta. Sé específico y útil.`;

    const resp = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:3b", // ✅ usa un modelo que sí tienes instalado
        prompt,
        stream: true
      }),
    });

    // Ollama devuelve streaming NDJSON → hay que leer línea a línea
    const reader = resp.body?.getReader();
    if (!reader) return [];

    let fullText = "";
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split("\n")) {
        if (!line.trim()) continue;
        try {
          const json = JSON.parse(line);
          if (json.response) fullText += json.response;
        } catch {
          // ignora líneas que no sean JSON válido
        }
      }
    }

    return fullText
      .split(/\n|-/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  } catch (err) {
    console.error("Error generando recomendaciones con Ollama:", err);
    return ["No se pudieron generar recomendaciones automáticas (Ollama no disponible)."];
  }
}

// ==============================
// Handlers
// ==============================

// Agregado: media/minimo/maximo/mediana/desviacion
async function handleAgregado(bucket: string, spec: EspecificacionAnalisis) {
  const campo = spec.campos[0];
  const mapFn: Record<string, string> = {
    media: "mean",
    minimo: "min",
    maximo: "max",
    mediana: "median",
    desviacion: "stddev",
  };
  const fn = mapFn[spec.agregado || "media"] || "mean";

  const flux = `
    from(bucket: "${bucket}")
      |> range(start: ${spec.rango})
      |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "${campo}")
      |> ${fn}()
  `;
  const rows = await runFlux<{ _value: string }>(flux);
  const valor = rows.length ? Number(rows[0]._value) : NaN;

  const serie = await fetchSeries(bucket, spec.rango, campo);
  const seriesGrafico = [
    { type: "line", name: campo, data: serie.map((v) => [new Date(v.time).getTime(), v.value]) },
  ];

  const resumen = `El ${spec.agregado} de ${campo} en ${spec.rango} es ${fmtN(valor)}.`;
  const texto = `Se muestra la serie temporal y el valor agregado (${spec.agregado}).`;
  const recomendaciones = await generarRecomendaciones(resumen, texto);

  return { resumen, texto, seriesGrafico, recomendaciones };
}

// Umbral: puntos arriba/debajo de un umbral
async function handleUmbral(bucket: string, spec: EspecificacionAnalisis) {
  const campo = spec.campos[0];
  const umbral = spec.umbral ?? 0;
  const operador = spec.direccion === "debajo" ? "<=" : ">=";

  const flux = `
    from(bucket: "${bucket}")
      |> range(start: ${spec.rango})
      |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "${campo}")
      |> filter(fn: (r) => r._value ${operador} ${umbral})
      |> keep(columns: ["_time", "_value"])
      |> sort(columns: ["_time"])
  `;
  const rows = await runFlux<{ _time: string; _value: string }>(flux);
  const puntos = rows.map((r) => [new Date(r._time).getTime(), Number(r._value)] as [number, number]);

  const todas = await fetchSeries(bucket, spec.rango, campo);
  const serieBase = { type: "line", name: campo, data: todas.map((v) => [new Date(v.time).getTime(), v.value]) };
  const serieUmbral = {
    type: "line",
    name: `Umbral ${umbral}`,
    data: todas.map((v) => [new Date(v.time).getTime(), umbral]),
    dashStyle: "ShortDash",
  };
  const marcados = { type: "scatter", name: `Eventos ${operador} ${umbral}`, data: puntos };

  const resumen = `Eventos de ${campo} ${operador} ${umbral} en ${spec.rango}: ${puntos.length}.`;
  const texto = `Se resaltan los puntos que cumplen el criterio con la línea de umbral como referencia.`;
  const recomendaciones = await generarRecomendaciones(resumen, texto);

  return { resumen, texto, seriesGrafico: [serieBase, serieUmbral, marcados], recomendaciones };
}

// Percentil: Pxx del campo
async function handlePercentil(bucket: string, spec: EspecificacionAnalisis) {
  const campo = spec.campos[0];
  const q = spec.percentil ?? 0.95;

  const flux = `
    from(bucket: "${bucket}")
      |> range(start: ${spec.rango})
      |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "${campo}")
      |> quantile(q: ${q}, method: "estimate_tdigest")
  `;
  const rows = await runFlux<{ _value: string }>(flux);
  const valor = rows.length ? Number(rows[0]._value) : NaN;

  const serie = await fetchSeries(bucket, spec.rango, campo);
  const line = { type: "line", name: campo, data: serie.map((v) => [new Date(v.time).getTime(), v.value]) };
  const pLine = {
    type: "line",
    name: `P${Math.round(q * 100)}`,
    data: serie.map((v) => [new Date(v.time).getTime(), valor]),
    dashStyle: "ShortDot",
  };

  const resumen = `El percentil ${Math.round(q * 100)} de ${campo} en ${spec.rango} es ${fmtN(valor)}.`;
  const texto = `Se muestra la serie temporal y la línea del percentil calculado.`;
  const recomendaciones = await generarRecomendaciones(resumen, texto);

  return { resumen, texto, seriesGrafico: [line, pLine], recomendaciones };
}

// Comparar: múltiples campos superpuestos
async function handleComparar(bucket: string, spec: EspecificacionAnalisis) {
  const seriesGrafico: any[] = [];
  for (const campo of spec.campos) {
    const serie = await fetchSeries(bucket, spec.rango, campo);
    seriesGrafico.push({
      type: "line",
      name: campo,
      data: serie.map((v) => [new Date(v.time).getTime(), v.value]),
    });
  }

  const resumen = `Comparación de ${spec.campos.join(" y ")} en ${spec.rango}.`;
  const texto = `Se superponen las series para evaluar diferencias y patrones.`;
  const recomendaciones = await generarRecomendaciones(resumen, texto);

  return { resumen, texto, seriesGrafico, recomendaciones };
}

// Superponer: alias directo de comparar
async function handleSuperponer(bucket: string, spec: EspecificacionAnalisis) {
  return handleComparar(bucket, spec);
}
// Tendencia: periodo actual vs periodo anterior de igual duración
// Tendencia: periodo actual vs periodo anterior de igual duración
async function handleTendencia(bucket: string, spec: EspecificacionAnalisis) {
  const campo = spec.campos[0];

  // Serie actual
  const actual = await fetchSeries(bucket, spec.rango, campo);

  // Serie anterior (misma duración, desplazada)
  const anteriorFlux = `
    import "date"
    from(bucket: "${bucket}")
      |> range(start: ${spec.rango})
      |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "${campo}")
      |> timeShift(duration: ${spec.rango})
      |> keep(columns: ["_time", "_value"])
      |> sort(columns: ["_time"])
  `;
  const anteriorRows = await runFlux<{ _time: string; _value: string }>(anteriorFlux);
  const anterior = anteriorRows.map((r) => ({ time: r._time, value: Number(r._value) }));

  // ============================
  // Cálculo de métricas comparativas
  // ============================
  const valoresActual = actual.map(v => v.value);
  const valoresAnterior = anterior.map(v => v.value);

  const mediaActual = valoresActual.length ? valoresActual.reduce((a,b)=>a+b,0)/valoresActual.length : NaN;
  const mediaAnterior = valoresAnterior.length ? valoresAnterior.reduce((a,b)=>a+b,0)/valoresAnterior.length : NaN;
  const variacion = mediaAnterior ? ((mediaActual - mediaAnterior) / mediaAnterior) * 100 : NaN;

  const maxActual = valoresActual.length ? Math.max(...valoresActual) : NaN;
  const maxAnterior = valoresAnterior.length ? Math.max(...valoresAnterior) : NaN;

  const metrics = {
    "Media actual (kWh)": mediaActual,
    "Media anterior (kWh)": mediaAnterior,
    "Variación (%)": variacion,
    "Máximo actual": maxActual,
    "Máximo anterior": maxAnterior
  };

  // ============================
  // Series para el gráfico
  // ============================
  const seriesGrafico = [
    { type: "line", name: "Actual", data: actual.map((v) => [new Date(v.time).getTime(), v.value]) },
    { type: "line", name: "Anterior", data: anterior.map((v) => [new Date(v.time).getTime(), v.value]), dashStyle: "ShortDash" },
  ];

  // ============================
  // Resumen + texto
  // ============================
  const resumen = `Tendencia de ${campo}: periodo actual vs anterior (${spec.rango}).`;
  const texto = `Se compara la serie actual con la del periodo anterior de igual duración.`;

  // ============================
  // Recomendaciones con Ollama
  // ============================
  const recomendaciones = await generarRecomendaciones(resumen, texto, metrics);

  return { resumen, texto, seriesGrafico, recomendaciones };
}
// Histograma: frecuencia por ventana temporal
async function handleHistograma(bucket: string, spec: EspecificacionAnalisis) {
  const campo = spec.campos[0];
  const every = spec.intervalo || "1h";

  const flux = `
    from(bucket: "${bucket}")
      |> range(start: ${spec.rango})
      |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "${campo}")
      |> aggregateWindow(every: ${every}, fn: count, createEmpty: false)
      |> keep(columns: ["_time", "_value"])
      |> sort(columns: ["_time"])
  `;
  const rows = await runFlux<{ _time: string; _value: string }>(flux);

  // Columnas con categorías temporales (opcional para tu UI)
  const categorias = rows.map((r) => new Date(r._time).toLocaleString());
  const datos = rows.map((r) => Number(r._value));

  const seriesGrafico = [{ type: "column", name: "Frecuencia", data: datos }];

  const resumen = `Histograma temporal de ${campo} agrupado cada ${every}.`;
  const texto = `Frecuencia de ocurrencias por ventana temporal.`;
  const recomendaciones = await generarRecomendaciones(resumen, texto);

  return { resumen, texto, seriesGrafico, recomendaciones, categorias };
}

// Barras diarias: agregación por día (mean por defecto)
async function handleBarrasDiarias(bucket: string, spec: EspecificacionAnalisis) {
  const campo = spec.campos[0];

  const flux = `
    from(bucket: "${bucket}")
      |> range(start: ${spec.rango})
      |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "${campo}")
      |> aggregateWindow(every: 1d, fn: mean, createEmpty: false)
      |> keep(columns: ["_time", "_value"])
      |> sort(columns: ["_time"])
  `;
  const rows = await runFlux<{ _time: string; _value: string }>(flux);
  const datos = rows.map((r) => [new Date(r._time).getTime(), Number(r._value)] as [number, number]);

  const seriesGrafico = [{ type: "column", name: "Promedio diario", data: datos }];

  const resumen = `Barras diarias de ${campo} (promedio por día).`;
  const texto = `Se agregan los valores por día usando media.`;
  const recomendaciones = await generarRecomendaciones(resumen, texto);

  return { resumen, texto, seriesGrafico, recomendaciones };
}

// Correlación: scatter entre dos campos alineados por tiempo
async function handleCorrelacion(bucket: string, spec: EspecificacionAnalisis) {
  const [campoX, campoY] = spec.campos.length >= 2 ? spec.campos : [spec.campos[0], "current_A"];

  const flux = `
    from(bucket: "${bucket}")
      |> range(start: ${spec.rango})
      |> filter(fn: (r) => r._measurement == "pqgenius" and (r._field == "${campoX}" or r._field == "${campoY}"))
      |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> keep(columns: ["_time", "${campoX}", "${campoY}"])
      |> sort(columns: ["_time"])
  `;
  const rows = await runFlux<{ _time: string; [k: string]: string }>(flux);
  const puntos = rows
    .filter((r) => r[campoX] !== undefined && r[campoY] !== undefined)
    .map((r) => [Number(r[campoX]), Number(r[campoY])] as [number, number]);

  const seriesGrafico = [{ type: "scatter", name: `${campoX} vs ${campoY}`, data: puntos }];

  const resumen = `Correlación entre ${campoX} y ${campoY} en ${spec.rango}.`;
  const texto = `Se grafica un scatter con pares de valores alineados por tiempo.`;
  const recomendaciones = await generarRecomendaciones(resumen, texto);

  return { resumen, texto, seriesGrafico, recomendaciones };
}

// ==============================
// Executor principal
// ==============================
export async function ejecutar(spec: EspecificacionAnalisis) {
  const bucket = process.env.INFLUX_BUCKET || "pqgenius";

  switch (spec.operacion) {
    case "agregado":
      return handleAgregado(bucket, spec);
    case "umbral":
      return handleUmbral(bucket, spec);
    case "percentil":
      return handlePercentil(bucket, spec);
    case "comparar":
      return handleComparar(bucket, spec);
    case "superponer":
      return handleSuperponer(bucket, spec);
    case "tendencia":
      return handleTendencia(bucket, spec);
    case "histograma":
      return handleHistograma(bucket, spec);
    case "barras_diarias":
      return handleBarrasDiarias(bucket, spec);
    case "correlacion":
      return handleCorrelacion(bucket, spec);
    default:
      return {
        resumen: "Operación no soportada",
        texto: `La operación "${spec.operacion}" no está implementada.`,
        seriesGrafico: [],
        recomendaciones: [],
      };
  }
}
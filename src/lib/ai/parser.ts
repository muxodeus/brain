import type { EspecificacionAnalisis } from "./types";

// Aliases de campos en español → nombres internos
const aliasCampos: Record<string, string> = {
  voltaje: "voltage_A",
  tensión: "voltage_A",
  corriente: "current_A",
  amperaje: "current_A",
  potencia: "power_kW",
  energía: "energy_kWh",
  consumo: "energy_kWh",
  "consumo energético": "energy_kWh",
};

export function analizarPrompt(prompt: string): EspecificacionAnalisis {
  const p = prompt.toLowerCase();

  // =========================
  // Campos
  // =========================
  const campos = Object.entries(aliasCampos)
    .filter(([alias]) => p.includes(alias))
    .map(([, campo]) => campo);

  if (p.includes("voltaje b")) campos.push("voltage_B");
  if (p.includes("voltaje c")) campos.push("voltage_C");

  if (campos.length === 0) campos.push("voltage_A");

  // =========================
  // Rango temporal
  // =========================
  const rangoDias = p.match(/últim[oa]s?\s+(\d+)\s+d[ií]as/);
  const rangoHoras = p.match(/últim[oa]s?\s+(\d+)\s+horas/);

  const rango = rangoDias
    ? `-${rangoDias[1]}d`
    : rangoHoras
    ? `-${rangoHoras[1]}h`
    : p.includes("última semana")
    ? "-7d"
    : "-7d";

  // =========================
  // Dirección y umbral
  // =========================
  const direccion = p.includes("debajo") || p.includes("menor")
    ? "debajo"
    : p.includes("arriba") || p.includes("mayor")
    ? "arriba"
    : undefined;

  const umbral = p.match(/(\d+)\s*(v|voltios|kw|kwh)?/)?.[1]
    ? parseInt(p.match(/(\d+)\s*(v|voltios|kw|kwh)?/)![1], 10)
    : undefined;

  // =========================
  // Percentil
  // =========================
  const percentil = p.match(/percentil\s*(\d+)/)?.[1]
    ? parseInt(p.match(/percentil\s*(\d+)/)![1], 10) / 100
    : p.match(/\bp(\d{1,3})\b/)?.[1]
    ? parseInt(p.match(/\bp(\d{1,3})\b/)![1], 10) / 100
    : undefined;

  // =========================
  // Agregado
  // =========================
  const agregado = p.includes("promedio") || p.includes("media")
    ? "media"
    : p.includes("mínimo") || p.includes("minimo")
    ? "minimo"
    : p.includes("máximo") || p.includes("maximo")
    ? "maximo"
    : p.includes("mediana")
    ? "mediana"
    : p.includes("desviación")
    ? "desviacion"
    : undefined;

  // =========================
  // Operación
  // =========================
  const operacion =
    p.includes("barras") || p.includes("gráfico en barras")
      ? "barras_diarias"
      : p.includes("histograma")
      ? "histograma"
      : p.includes("percentil") || /\bp\d{1,3}\b/.test(p)
      ? "percentil"
      : p.includes("comparar")
      ? "comparar"
      : p.includes("superponer") || p.includes("superpone") || p.includes("overlay")
      ? "superponer"
      : p.includes("tendencia") || p.includes("comparado con la semana anterior") || p.includes("vs semana anterior")
      ? "tendencia"
      : p.includes("correlación")
      ? "correlacion"
      : direccion
      ? "umbral"
      : agregado
      ? "agregado"
      : "agregado";

  // =========================
  // Intervalo
  // =========================
  let intervalo: string | undefined = undefined;

  if (operacion === "histograma") {
    if (p.includes("cada dia") || p.includes("cada día") || p.includes("diario")) {
      intervalo = "1d";
    } else if (p.includes("cada hora") || p.includes("hora") || p.includes("horario")) {
      intervalo = "1h";
    } else {
      intervalo = "1h"; // valor por defecto
    }
  }

  if (operacion === "barras_diarias") {
    intervalo = "1d";
  }

  // =========================
  // Return spec
  // =========================
  return {
    operacion,
    campos,
    rango,
    direccion,
    umbral: operacion === "umbral"
      ? umbral ?? (campos[0].includes("voltage") ? 120 : undefined)
      : undefined,
    percentil: operacion === "percentil" ? percentil ?? 0.95 : undefined,
    agregado: operacion === "agregado" ? agregado ?? "media" : undefined,
    intervalo,
    agrupadoPor: operacion === "barras_diarias" ? "dia" : undefined,
    rangoComparacion: operacion === "tendencia" ? rango : undefined,
  };
}
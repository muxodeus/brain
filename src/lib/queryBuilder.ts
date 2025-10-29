// Diccionario de alias: cómo el usuario pide un parámetro vs cómo está en Influx
const fieldAliases: Record<string, string> = {
  voltaje: "voltage_A",
  tensión: "voltage_A",
  corriente: "current_A",
  amperaje: "current_A",
  potencia: "power_kW",
  energía: "energy_kWh",
  frecuencia: "freq_Hz",
};

// Rangos de tiempo comunes
function parseTimeRange(prompt: string): { start: string; stop: string } {
  const now = new Date();

  if (/ayer/i.test(prompt)) {
    return {
      start: new Date(now.getTime() - 48 * 3600 * 1000).toISOString(),
      stop: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(),
    };
  }
  if (/anteayer/i.test(prompt)) {
    return {
      start: new Date(now.getTime() - 72 * 3600 * 1000).toISOString(),
      stop: new Date(now.getTime() - 48 * 3600 * 1000).toISOString(),
    };
  }
  if (/semana/i.test(prompt)) {
    return {
      start: new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString(),
      stop: now.toISOString(),
    };
  }
  if (/mes/i.test(prompt)) {
    return {
      start: new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString(),
      stop: now.toISOString(),
    };
  }

  // Por defecto: últimas 24h
  return {
    start: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(),
    stop: now.toISOString(),
  };
}

// Detecta todos los campos mencionados en el prompt
function detectFields(prompt: string): string[] {
  const fields: string[] = [];
  for (const [alias, field] of Object.entries(fieldAliases)) {
    if (prompt.toLowerCase().includes(alias) && !fields.includes(field)) {
      fields.push(field);
    }
  }
  return fields.length ? fields : ["voltage_A"]; // fallback
}

// Detecta todos los medidores mencionados
function detectMedidores(prompt: string): string[] {
  const matches = prompt.match(/medidor\s*(\w+)/gi);
  if (matches) {
    return matches.map((m) => m.replace(/medidor\s*/i, "").trim());
  }
  return ["pqgenius"]; // default
}

// Construye múltiples queries Flux
export function buildFluxQueries(bucket: string, prompt: string): string[] {
  const fields = detectFields(prompt);
  const { start, stop } = parseTimeRange(prompt);
  const medidores = detectMedidores(prompt);

  const queries: string[] = [];

  for (const medidor of medidores) {
    for (const field of fields) {
      queries.push(`
        from(bucket: "${bucket}")
          |> range(start: ${start}, stop: ${stop})
          |> filter(fn: (r) => r._measurement == "${medidor}" and r._field == "${field}")
      `);
    }
  }

  return queries;
}
import { NextResponse } from "next/server";

function generateSeries(base: number, min: number, max: number, variation: number, points: number) {
  const series: number[] = [];
  let current = base;
  for (let i = 0; i < points; i++) {
    const noise = (Math.random() - 0.5) * variation;
    current = Math.min(max, Math.max(min, current + noise));
    series.push(+current.toFixed(2));
  }
  return series;
}

// Serie de enteros (para etapas activas)
function generateIntegerSeries(base: number, min: number, max: number, stepVariation: number, points: number) {
  const series: number[] = [];
  let current = base;
  for (let i = 0; i < points; i++) {
    const step = Math.round((Math.random() - 0.5) * stepVariation);
    current = Math.min(max, Math.max(min, current + step));
    series.push(current);
  }
  return series;
}

export async function GET() {
  const points = 24;
  const medidores = ["M1", "M2", "M3"];
  const data: Record<string, any> = {};

  medidores.forEach((medidor, idx) => {
    const baseValues = {
      A: { voltage: 220 + idx, current: 50 + idx * 5, pf: 0.95, vthd: 2 },
      B: { voltage: 221 + idx, current: 45 + idx * 4, pf: 0.96, vthd: 2.5 },
      C: { voltage: 219 + idx, current: 55 + idx * 3, pf: 0.94, vthd: 3 },
      Total: { voltage: 220 + idx, current: 150 + idx * 10, pf: 0.95, vthd: 2.2 },
    };

    const canales: Record<string, any> = {};
    Object.entries(baseValues).forEach(([ch, base]) => {
      // Base panel eléctrico
      const voltage = generateSeries(base.voltage, 210, 240, 5, points);
      const current = generateSeries(base.current, 0, 250, 10, points);
      const pf = generateSeries(base.pf, 0.85, 1, 0.02, points);
      const vthd = generateSeries(base.vthd, 0, 5, 0.5, points);

      const p_app = voltage.map((v, i) => +(v * current[i] / 1000).toFixed(2));
      const p_act = voltage.map((v, i) => +(v * current[i] * pf[i] / 1000).toFixed(2));
      const p_react = p_app.map((s, i) => +Math.sqrt(Math.max(0, s * s - p_act[i] * p_act[i])).toFixed(2));

      // Motor
      const hp = generateSeries(100 + idx * 10, 50, 500, 20, points);
      const torque = generateSeries(200 + idx * 15, 100, 500, 30, points);
      const speed = generateSeries(1500, 1400, 1800, 20, points);
      const seq = generateSeries(2, 0, 5, 0.5, points);
      const temp = generateSeries(60, 20, 120, 5, points);
      const vibration = generateSeries(2, 0, 5, 0.5, points);

      // Solar (más KPIs)
      const irradiance = generateSeries(800, 0, 1000, 60, points);
      const efficiency = generateSeries(18, 10, 25, 1, points);
      const dc_voltage = generateSeries(600, 400, 1000, 30, points);
      const dc_current = generateSeries(15 + idx, 0, 50, 4, points);
      const inverter_temp = generateSeries(45, 20, 80, 3, points);
      const inverter_eff = generateSeries(96, 90, 99.5, 0.6, points);
      const energy_today = generateSeries(120, 0, 250, 10, points); // kWh acumulado

      // Capacitores (más KPIs)
      const kvar = generateSeries(150, 0, 300, 25, points);
      const pf_corrected = pf.map(v => +Math.min(1, Math.max(0.9, v + 0.03)).toFixed(2));
      const stages = generateIntegerSeries(3, 0, 4, 1, points); // enteros
      const thd_i = generateSeries(4, 0, 12, 1, points);
      const thd_v = generateSeries(2, 0, 8, 0.8, points);
      const switching_count = generateIntegerSeries(12, 0, 40, 2, points);

      canales[ch] = {
        voltage,
        current,
        p_act,
        p_react,
        p_app,
        pf,
        vthd,

        // Motor
        hp, torque, speed, seq, temp, vibration,

        // Solar
        irradiance, efficiency, dc_voltage, dc_current, inverter_temp, inverter_eff, energy_today,

        // Capacitores
        kvar, pf_corrected, stages, thd_i, thd_v, switching_count,
      };
    });

    data[medidor] = canales;
  });

  return NextResponse.json(data);
}
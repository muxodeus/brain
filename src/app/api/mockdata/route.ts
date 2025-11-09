import { NextResponse } from "next/server";

function generateSeries(length: number, intervalMin: number, generator: (i: number) => number) {
  const now = Date.now();
  return Array.from({ length }, (_, i) => {
    const t = new Date(now - (length - i) * intervalMin * 60 * 1000).toISOString();
    return { time: t, value: generator(i) };
  });
}

// Ruido
const noise = {
  gaussian: (spread: number) => (Math.random() + Math.random() + Math.random()) / 3 * spread,
  uniform: (spread: number) => (Math.random() - 0.5) * spread,
  impulsive: (spread: number, freq: number, i: number) =>
    (Math.random() - 0.5) * spread + (i % freq === 0 ? spread * 2 : 0),
};

// Perfiles por sitio
const profiles = {
  Planta: {
    currentA: (i: number) => 100 + ((i % 480) < 60 ? 40 : 0) + noise.impulsive(10, 20, i),
    currentB: (i: number) => 90 + Math.log1p(i % 200) * 2 + noise.uniform(5),
    currentC: (i: number) => 95 + noise.impulsive(15, 15, i),
    voltageA: (i: number) => 120 + noise.uniform(1),
    voltageB: (i: number) => 119 + noise.uniform(1),
    voltageC: (i: number) => 121 + noise.uniform(1),
    vthd: (i: number) => 3 + Math.log1p(i % 50) * 0.1 + noise.uniform(0.2),
    ithd: (i: number) => 6 + noise.impulsive(2, 20, i),
    p_act_dep: "A",
  },
  Hospital: {
    currentA: (i: number) => 85 + noise.uniform(10),
    currentB: (i: number) => 80 + Math.log1p(i % 300) * 1.5 + noise.uniform(5),
    currentC: (i: number) => 75 + noise.impulsive(20, 25, i),
    voltageA: (i: number) => 118 + noise.uniform(1),
    voltageB: (i: number) => 117 + noise.uniform(1),
    voltageC: (i: number) => 119 + noise.uniform(1),
    vthd: (i: number) => 2.5 + Math.log1p(i % 40) * 0.2 + noise.uniform(0.2),
    ithd: (i: number) => 7 + noise.impulsive(3, 18, i),
    p_act_dep: "BC",
  },
  DataCenter: {
    currentA: (i: number) => 110 - (1 - Math.exp(-i / 30)) * 15 + noise.gaussian(3),
    currentB: (i: number) => 105 + Math.log1p(i % 500) * 1 + noise.gaussian(2),
    currentC: (i: number) => 100 + noise.impulsive(10, 40, i),
    voltageA: (i: number) => 119 + noise.gaussian(1),
    voltageB: (i: number) => 118 + noise.gaussian(1),
    voltageC: (i: number) => 120 + noise.gaussian(1),
    vthd: (i: number) => 2 + Math.log1p(i % 60) * 0.15 + noise.gaussian(0.1),
    ithd: (i: number) => 5 + noise.impulsive(2, 25, i),
    p_act_dep: "AVG",
  },
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const site = searchParams.get("site") || "Planta";
  const range = searchParams.get("range") || "-1h";

  const ranges: Record<string, [number, number]> = {
    "-1h": [60, 1],
    "-24h": [96, 15],
    "-7d": [168, 60],
    "-30d": [180, 240],
  };
  const [length, interval] = ranges[range] || [60, 1];

  const profile = profiles[site as keyof typeof profiles] || profiles.Planta;

  // Corriente y voltaje
  const current = {
    A: generateSeries(length, interval, profile.currentA),
    B: generateSeries(length, interval, profile.currentB),
    C: generateSeries(length, interval, profile.currentC),
  };
  const voltage = {
    A: generateSeries(length, interval, profile.voltageA),
    B: generateSeries(length, interval, profile.voltageB),
    C: generateSeries(length, interval, profile.voltageC),
  };

  // Factor de potencia
  const pf = {
    A: generateSeries(length, interval, () => 0.9 + noise.uniform(0.1)),
    B: generateSeries(length, interval, () => 0.85 + noise.uniform(0.1)),
    C: generateSeries(length, interval, () => 0.95 + noise.uniform(0.05)),
  };

  // Potencia activa con dependencias cruzadas
  let p_act: any = {};
  if (profile.p_act_dep === "A") {
    p_act.A = voltage.A.map((v, i) => ({
      time: v.time,
      value: (v.value * current.A[i].value * pf.A[i].value) / 1000,
    }));
  } else if (profile.p_act_dep === "BC") {
    p_act.B = voltage.B.map((v, i) => ({
      time: v.time,
      value: (v.value * current.B[i].value * pf.B[i].value) / 1000,
    }));
    p_act.C = voltage.C.map((v, i) => ({
      time: v.time,
      value: (v.value * current.C[i].value * pf.C[i].value) / 1000,
    }));
  } else if (profile.p_act_dep === "AVG") {
    const avg = current.A.map((_, i) => (current.A[i].value + current.B[i].value + current.C[i].value) / 3);
    p_act.A = voltage.A.map((v, i) => ({
      time: v.time,
      value: (v.value * avg[i] * pf.A[i].value) / 1000,
    }));
  }

  // THD
  const vthd = {
    A: generateSeries(length, interval, profile.vthd),
    B: generateSeries(length, interval, (i) => profile.vthd(i) + 0.2),
    C: generateSeries(length, interval, (i) => profile.vthd(i) - 0.2),
  };
  const ithd = {
    A: generateSeries(length, interval, profile.ithd),
    B: generateSeries(length, interval, (i) => profile.ithd(i) + 0.5),
    C: generateSeries(length, interval, (i) => profile.ithd(i) - 0.5),
  };

  return NextResponse.json({
    voltage_mean: voltage,
    current_mean: current,
    p_act_mean: p_act,
    pf_mean: pf,
    vthd_mean: vthd,
    ithd_mean: ithd,
  });
}
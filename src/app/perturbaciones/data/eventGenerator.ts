// src/app/perturbaciones/data/eventGenerator.ts
export type EventData = {
  timestamp: string;
  durationMs: number;
  magnitudePct: number; // % de la tensión nominal (0–200)
  phase: "L1" | "L2" | "L3";
  type: "sag" | "swell" | "interruption" | "transient";
};

export function generateMockEvents(count: number = 200): EventData[] {
  const phases: EventData["phase"][] = ["L1", "L2", "L3"];
  const types: EventData["type"][] = ["sag", "swell", "interruption", "transient"];
  const events: EventData[] = [];

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const phase = phases[Math.floor(Math.random() * phases.length)];

    let durationMs: number;
    let magnitudePct: number;

    switch (type) {
      case "sag": // 50–90% (bajo nominal), duraciones 8 ms–2 s
        durationMs = Math.floor(Math.random() * 2000) + 8;
        magnitudePct = Math.floor(Math.random() * 40) + 50;
        break;
      case "swell": // 110–150%, duraciones 8 ms–1 s
        durationMs = Math.floor(Math.random() * 1000) + 8;
        magnitudePct = Math.floor(Math.random() * 40) + 110;
        break;
      case "interruption": // 0–10%, duraciones 1 ciclo–10 s
        durationMs = Math.floor(Math.random() * 10000) + 16;
        magnitudePct = Math.floor(Math.random() * 10);
        break;
      case "transient": // 120–200%, 0.5–20 ms
        durationMs = Math.floor(Math.random() * 20) + 1;
        magnitudePct = Math.floor(Math.random() * 80) + 120;
        break;
    }

    const timestamp = new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30)).toISOString();
    events.push({ timestamp, durationMs, magnitudePct, phase, type });
  }

  return events;
}
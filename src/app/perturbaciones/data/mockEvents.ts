export type EventData = {
  timestamp: string;   // Fecha y hora del evento
  durationMs: number;  // Duración en milisegundos
  magnitude: number;   // % de variación de voltaje (negativo = sag, positivo = swell)
  phase: "L1" | "L2" | "L3";
  type: "sag" | "swell" | "interruption" | "transient";
};

export const mockEvents: EventData[] = [
  { timestamp: "2025-11-01T14:32:00", durationMs: 20, magnitude: -25, phase: "L1", type: "sag" },
  { timestamp: "2025-11-01T15:10:00", durationMs: 200, magnitude: -40, phase: "L2", type: "sag" },
  { timestamp: "2025-11-02T09:45:00", durationMs: 50, magnitude: 30, phase: "L3", type: "swell" },
  { timestamp: "2025-11-02T11:20:00", durationMs: 500, magnitude: -10, phase: "L1", type: "interruption" },
  { timestamp: "2025-11-03T18:05:00", durationMs: 5, magnitude: 80, phase: "L2", type: "transient" },
  { timestamp: "2025-11-04T07:50:00", durationMs: 100, magnitude: -15, phase: "L3", type: "sag" },
  { timestamp: "2025-11-05T22:15:00", durationMs: 300, magnitude: -35, phase: "L1", type: "sag" },
  { timestamp: "2025-11-06T13:40:00", durationMs: 60, magnitude: 25, phase: "L2", type: "swell" },
  { timestamp: "2025-11-07T16:30:00", durationMs: 1200, magnitude: -50, phase: "L3", type: "interruption" },
  { timestamp: "2025-11-08T20:10:00", durationMs: 15, magnitude: 70, phase: "L1", type: "transient" },
];
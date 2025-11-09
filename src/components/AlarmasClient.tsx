"use client";

import { useEffect, useState } from "react";

type Severidad = "leve" | "moderada" | "crítica";

type Alarma = {
  id: number;
  titulo: string;
  descripcion: string;
  inicio: string; // fecha/hora
  duracion: string; // ej: "6h"
  severidad: Severidad;
  medidor: string;
};

export default function AlarmasClient() {
  const [alarmas, setAlarmas] = useState<Alarma[]>([]);
  const [filtroSeveridad, setFiltroSeveridad] = useState<Severidad | "todas">("todas");

  useEffect(() => {
    // Datos demo: reemplazar con fetch a /api/alarmas
    setAlarmas([
      {
        id: 1,
        titulo: "Bajo factor de potencia",
        descripcion: "Climatización con FP < 0.85",
        inicio: "2025-11-05 14:00",
        duracion: "6h",
        severidad: "moderada",
        medidor: "Panel Aire Acondicionado",
      },
      {
        id: 2,
        titulo: "Sobrecarga",
        descripcion: "Corriente > 120% en Panel Proceso",
        inicio: "2025-11-05 16:30",
        duracion: "2h",
        severidad: "crítica",
        medidor: "Panel Proceso",
      },
      {
        id: 3,
        titulo: "Interrupciones",
        descripcion: "Cortes intermitentes en Bomba de Aire",
        inicio: "2025-11-05 18:10",
        duracion: "30m",
        severidad: "leve",
        medidor: "Bomba de Aire",
      },
    ]);
  }, []);

  const filtradas =
    filtroSeveridad === "todas"
      ? alarmas
      : alarmas.filter((a) => a.severidad === filtroSeveridad);

  const badgeColor = (sev: Severidad) =>
    sev === "crítica"
      ? "bg-red-900/40 text-red-300 border-red-400/50"
      : sev === "moderada"
      ? "bg-amber-900/30 text-amber-300 border-amber-300/40"
      : "bg-emerald-900/30 text-emerald-300 border-emerald-300/40";

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <h1 className="text-3xl font-bold text-white/90 border-b border-white/10 pb-2">
        🚨 Alarmas
      </h1>

      {/* Filtros */}
      <div className="flex gap-2">
        {["todas", "leve", "moderada", "crítica"].map((f) => (
          <button
            key={f}
            onClick={() => setFiltroSeveridad(f as Severidad | "todas")}
            className={`px-3 py-1 rounded border ${
              filtroSeveridad === f ? "bg-white/20" : "bg-white/5"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Lista de alarmas */}
      <ul className="space-y-3">
        {filtradas.map((a) => (
          <li
            key={a.id}
            className={`rounded-xl border p-4 ${badgeColor(a.severidad)}`}
          >
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">{a.titulo}</h2>
              <span className="text-xs italic">{a.severidad}</span>
            </div>
            <p className="text-sm text-white/80">{a.descripcion}</p>
            <p className="text-xs mt-1">
              📍 {a.medidor} — ⏱ {a.duracion} desde {a.inicio}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
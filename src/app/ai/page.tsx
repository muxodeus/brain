// src/app/ai/page.tsx
"use client";

import { useState } from "react";
import Card from "@/components/ai/Card";
import { getMockResponse } from "@/lib/ai/mockEngine";
import { AIResponse } from "@/types/ai";

const SUGERENCIAS_INICIO = [
  "¿Cuál fue el percentil 95 del voltaje en la última semana?",
  "Compara el consumo de energía de esta semana con la anterior",
  "Haz un histograma diario del consumo de energía en el último mes",
  "Superpone voltaje y corriente en la última hora",
  "Muéstrame las alarmas críticas de las últimas 24 horas",
  "¿Cuál fue el factor de potencia promedio esta semana?",
  "Ver THD por área en la planta",
  "Desglose de costos por tarifa en el último mes",
  "Lista de usuarios activos en la plataforma",
  "Accesos directos para configurar medidores",
  "Frecuencia promedio diaria",
  "Eventos de energía reactiva",
  "Balance de cargas por fase",
  "Top 5 consumos por área",
  "Disponibilidad de gateways",
  "Comparación de tarifas eléctricas",
  "Alarmas históricas del último mes",
  "Exportar reporte PDF",
  "Simulación de ahorro energético",
  "Estado de medidores instalados",
];

export default function AIPage() {
  const [prompt, setPrompt] = useState("");
  const [responses, setResponses] = useState<AIResponse[]>([]);
  const [error, setError] = useState("");

  function enviarConsulta() {
    try {
      setError("");
      const res = getMockResponse(prompt.trim() || "ayuda");
      setResponses((prev) => [res, ...prev]); // lo nuevo arriba
      setPrompt("");
    } catch {
      setError("Ocurrió un error procesando tu consulta.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl mb-8">
        <h1 className="text-3xl font-bold text-center mb-4">⚡ Asistente AI — PQGenius</h1>
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="¿En qué te puedo ayudar hoy?"
            className="flex-1 px-4 py-3 rounded-lg bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={enviarConsulta}
            disabled={!prompt.trim()}
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold disabled:opacity-50"
          >
            Enviar
          </button>
        </div>

        {/* Sugerencias iniciales */}
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGERENCIAS_INICIO.map((s, i) => (
            <button
              key={i}
              onClick={() => setPrompt(s)}
              className="bg-white/10 hover:bg-white/20 text-white/80 px-3 py-1 rounded-full text-xs"
            >
              {s}
            </button>
          ))}
        </div>

        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>

      {/* Feed de respuestas */}
      <div className="w-full max-w-5xl space-y-6">
        {responses.map((r, idx) => (
          <div key={idx} className="space-y-3">
            {r.summary && (
              <div className="bg-slate-800/60 border border-white/10 rounded-xl shadow-md p-4">
                <h2 className="text-lg font-semibold mb-1">Resumen</h2>
                <p className="text-white/70">{r.summary}</p>
                {r.keywords?.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {r.keywords!.map((k, i) => (
                      <span key={i} className="bg-white/10 text-white/80 px-2 py-1 rounded text-xs">{k}</span>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
            {r.cards.map((c, ci) => (
              <Card key={ci} {...c} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
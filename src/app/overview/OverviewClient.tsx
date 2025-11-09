"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

const MapWrapper = dynamic(() => import("../../components/MapWrapper"), { ssr: false });

type KPI = { label: string; value: string };
type Estado = "normal" | "advertencia" | "alarma";
type Jerarquia = "principal" | "secundario" | "terciario";
type Tipo = "subestacion" | "panel" | "bomba";

type Medidor = {
  id: number;
  nombre: string;
  ubicacion: string;
  lat: number;
  lng: number;
  estado: Estado;
  jerarquia?: Jerarquia;
  tipo?: Tipo;
  consumoActual?: number;
};

export default function OverviewClient() {
  const [planta, setPlanta] = useState("Planta Avícola");
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [medidores, setMedidores] = useState<Medidor[]>([]);
  const [usuario, setUsuario] = useState<any>(null);
  const [alarmas, setAlarmas] = useState<number>(0);
  const [horaLocal, setHoraLocal] = useState<string>("");
  const [insights, setInsights] = useState<string[]>([]);

  // Reloj en vivo
  useEffect(() => {
    const updateClock = () => setHoraLocal(new Date().toLocaleString("es-SV"));
    updateClock();
    const id = setInterval(updateClock, 1000);
    return () => clearInterval(id);
  }, []);

  // Datos demo realistas (puedes reemplazar por fetch a tus APIs)
  useEffect(() => {
    setMedidores([
      { id: 1, nombre: "Subestación 1", ubicacion: "Entrada de energía", lat: 13.4831, lng: -88.1822, estado: "advertencia", jerarquia: "principal", tipo: "subestacion", consumoActual: 420 },
      { id: 2, nombre: "Panel Proceso", ubicacion: "Línea de alimento", lat: 13.4829, lng: -88.1828, estado: "normal", jerarquia: "secundario", tipo: "panel", consumoActual: 160 },
      { id: 3, nombre: "Panel Aire Acondicionado", ubicacion: "Climatización de galpones", lat: 13.4836, lng: -88.1819, estado: "alarma", jerarquia: "secundario", tipo: "panel", consumoActual: 220 },
      { id: 4, nombre: "Panel Bombas", ubicacion: "Suministro hidráulico", lat: 13.4833, lng: -88.1824, estado: "normal", jerarquia: "secundario", tipo: "panel", consumoActual: 95 },
      { id: 5, nombre: "Bomba de Agua", ubicacion: "Panel Bombas", lat: 13.4834, lng: -88.1825, estado: "normal", jerarquia: "terciario", tipo: "bomba", consumoActual: 22 },
      { id: 6, nombre: "Bomba de Aire", ubicacion: "Panel Bombas", lat: 13.4835, lng: -88.1826, estado: "advertencia", jerarquia: "terciario", tipo: "bomba", consumoActual: 18 },
      { id: 7, nombre: "Bomba de Riego", ubicacion: "Panel Bombas", lat: 13.4832, lng: -88.1821, estado: "normal", jerarquia: "terciario", tipo: "bomba", consumoActual: 14 },
    ]);

    setUsuario({
      nombre: "Operador",
      rol: "Admin",
      jerarquia: "Supervisor",
      correo: "operador@planta.com",
      telefono: "+503 0000 0000",
    });

    setAlarmas(3);

    setKpis([
      { label: "Consumo promedio", value: "412 kW" },
      { label: "Factor de carga", value: "0.76" },
      { label: "Eficiencia de Planta", value: "92%" },
      { label: "Disponibilidad", value: "98%" },
    ]);

    setInsights([
      "Optimizar horario de bombeo para reducir picos",
      "Revisar capacitores en climatización: bajo FP recurrente",
      "Evaluar variadores en línea de alimento para suavizar arranques",
    ]);
  }, []);

  // Derivados por jerarquía
  const principal = useMemo(() => medidores.filter((m) => m.jerarquia === "principal"), [medidores]);
  const secundarios = useMemo(() => medidores.filter((m) => m.jerarquia === "secundario"), [medidores]);
  const terciarios = useMemo(() => medidores.filter((m) => m.jerarquia === "terciario"), [medidores]);

  // Badge por estado (colores)
  const stateBadge = (estado: Estado) =>
    estado === "alarma"
      ? "text-red-400 bg-red-900/40 border-red-400/50"
      : estado === "advertencia"
      ? "text-amber-300 bg-amber-900/30 border-amber-300/40"
      : "text-emerald-300 bg-emerald-900/30 border-emerald-300/40";

  // Emoji por tipo (visual en lista)
  const typeEmoji = (tipo?: Tipo) =>
    tipo === "subestacion" ? "⚡"
    : tipo === "panel" ? "📊"
    : tipo === "bomba" ? "💧"
    : "🔌";

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-8">
      <h1 className="text-3xl font-bold text-white/90 border-b border-white/10 pb-2">
        ⚡ Overview – {planta}
      </h1>

      {/* KPIs */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-white/10 p-4 text-center">
            <p className="text-2xl font-bold text-white/90">{kpi.value}</p>
            <p className="text-sm text-white/60">{kpi.label}</p>
          </div>
        ))}
      </section>

      {/* Usuario, alarmas (parpadeo suave) y hora */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/10 p-4">
          <h2 className="font-semibold mb-2">Usuario</h2>
          {usuario ? (
            <ul className="text-sm space-y-1">
              <li><strong>Nombre:</strong> {usuario.nombre}</li>
              <li><strong>Rol:</strong> {usuario.rol}</li>
              <li><strong>Jerarquía:</strong> {usuario.jerarquia}</li>
              <li><strong>Correo:</strong> {usuario.correo}</li>
              <li><strong>Teléfono:</strong> {usuario.telefono}</li>
            </ul>
          ) : (
            <p className="text-white/50">Cargando usuario…</p>
          )}
        </div>

        <div className="rounded-xl border border-red-400 bg-red-900/30 p-4 animate-pulse">
          <h2 className="font-semibold mb-2 text-red-300">Alarmas pendientes</h2>
          <p className="text-2xl font-bold text-red-400">{alarmas}</p>
          <ul className="mt-2 space-y-1 text-sm text-red-200">
            <li>⚠️ Bajo factor de potencia en Climatización (6h)</li>
            <li>⚡ Sobrecarga en Panel Proceso</li>
            <li>🔌 Interrupciones en Bomba de Aire</li>
          </ul>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/10 p-4">
          <h2 className="font-semibold mb-2">Hora local</h2>
          <p className="text-lg">{horaLocal || "—"}</p>
        </div>
      </section>

      {/* Jerarquía + Mapa */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Jerarquía */}
        <div className="rounded-xl border border-white/10 bg-white/10 p-4">
          <h2 className="font-semibold mb-3">Jerarquía de Medidores</h2>
          <div className="space-y-4 text-sm">
            <div>
              <strong className="text-white/90">Principal</strong>
              <ul className="mt-2 space-y-2">
                {principal.map((p) => (
                  <li key={p.id} className={`rounded border p-2 flex items-center gap-2 ${stateBadge(p.estado)}`}>
                    <span>{typeEmoji(p.tipo)}</span>
                    <span>{p.nombre} — {p.ubicacion}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <strong className="text-white/90">Secundarios</strong>
              <ul className="mt-2 space-y-2">
                {secundarios.map((s) => (
                  <li key={s.id} className={`rounded border p-2 ${stateBadge(s.estado)}`}>
                    <div className="flex items-center gap-2">
                      <span>{typeEmoji(s.tipo)}</span>
                      <span>{s.nombre} — {s.ubicacion}</span>
                    </div>

                    {/* Tertiarios bajo Panel Bombas */}
                    {s.nombre.toLowerCase().includes("bombas") && (
                      <ul className="ml-4 mt-2 space-y-1 list-disc text-white/80">
                        {terciarios.map((t) => (
                          <li key={t.id} className={`rounded p-1 flex items-center gap-2 ${stateBadge(t.estado)}`}>
                            <span>{typeEmoji(t.tipo)}</span>
                            <span>{t.nombre} — {t.ubicacion}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Mapa */}
        <div className="rounded-xl border border-white/10 bg-white/10 p-4 h-[400px]">
          <h2 className="font-semibold mb-2">Geolocalización</h2>
          <MapWrapper medidores={medidores} />
        </div>
      </section>

      {/* Insights */}
      <section>
        <h2 className="text-lg font-semibold text-white/90 mb-4">Insights automáticos</h2>
        <ul className="space-y-2">
          {insights.map((txt, i) => (
            <li key={i} className="rounded-xl border border-white/10 bg-white/10 p-3 leading-relaxed">
              {txt}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
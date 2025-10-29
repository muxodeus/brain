"use client";

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto text-center mt-20">
      <h1 className="text-4xl font-bold mb-6">Bienvenido a PQGenius</h1>
      <p className="text-lg text-slate-300 mb-4">
        PQGenius es una plataforma de analítica industrial diseñada para monitorear,
        comparar y optimizar el consumo energético en tiempo real.
      </p>
      <p className="text-slate-400">
        Usa el menú lateral para navegar entre Overview, Tendencias, AI, Comparar y Configuración.
      </p>
    </div>
  );
}
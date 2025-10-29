"use client";

type Props = {
  text: string;
  resumen: string;
  recomendaciones: string[];
  keywords: string[];
};

export default function InsightsBox({ text, resumen, recomendaciones, keywords }: Props) {
  return (
    <div className="bg-slate-800 p-6 rounded space-y-4">
      <h2 className="text-xl font-bold text-white">Asistente AI</h2>

      <div>
        <h3 className="text-slate-300 font-semibold">Resumen ejecutivo</h3>
        <p className="text-slate-200">{resumen}</p>
      </div>

      <div>
        <h3 className="text-slate-300 font-semibold">Insights completos</h3>
        <p className="text-slate-400 whitespace-pre-line">{text}</p>
      </div>

      <div>
        <h3 className="text-slate-300 font-semibold">Recomendaciones</h3>
        <ul className="list-disc list-inside text-slate-200">
          {recomendaciones.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-slate-300 font-semibold">Palabras clave</h3>
        <div className="flex gap-2 flex-wrap">
          {keywords.map((k, i) => (
            <span
              key={i}
              className="bg-blue-700 text-white px-2 py-1 rounded text-xs"
            >
              {k}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
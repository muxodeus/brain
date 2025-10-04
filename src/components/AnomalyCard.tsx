"use client";

export type Anomaly = {
  meter: string;
  param: string;
  label: string;
  severity: "low" | "medium" | "high";
  timestamp: string;
  value: number;
  explanation: string;
};

const severityStyles: Record<Anomaly["severity"], string> = {
  low: "bg-green-500/15 text-green-400 border border-green-500/20",
  medium: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
  high: "bg-red-500/15 text-red-400 border border-red-500/20",
};

export default function AnomalyCard({ anomaly }: { anomaly: Anomaly }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow hover:shadow-lg transition">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-200">
          {anomaly.label} — {anomaly.meter}
        </h3>
        <span className={`px-2 py-1 rounded text-xs font-medium ${severityStyles[anomaly.severity]}`}>
          {anomaly.severity.toUpperCase()}
        </span>
      </div>
      <p className="text-xs text-slate-400 mb-2">
        {new Date(anomaly.timestamp).toLocaleString()}
      </p>
      <p className="text-slate-300 text-sm mb-3">{anomaly.explanation}</p>
      <button className="text-sky-400 text-sm font-medium hover:underline">
        Ver serie relacionada →
      </button>
    </div>
  );
}
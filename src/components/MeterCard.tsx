"use client";

type Props = {
  name: string;
  connected: boolean;
  lastUpdate?: string;
  power?: number;
  voltage?: number;
  current?: number;
  frequency?: number;
  pf?: number;
};

export default function MeterCard({
  name,
  connected,
  lastUpdate,
  power,
  voltage,
  current,
  frequency,
  pf,
}: Props) {
  return (
    <div className="rounded-lg border border-slate-800 bg-panel p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">{name}</h2>
        <span
          className={`px-2 py-0.5 rounded text-xs ${
            connected ? "bg-green-600/20 text-green-400" : "bg-red-600/20 text-red-400"
          }`}
        >
          {connected ? "Conectado" : "Desconectado"}
        </span>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        Última actualización: {lastUpdate ?? "--"}
      </p>

      <div className="grid grid-cols-2 gap-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Potencia (kW)</span>
          <span>{power?.toFixed(2) ?? "--"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Voltaje (V)</span>
          <span>{voltage?.toFixed(1) ?? "--"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Corriente (A)</span>
          <span>{current?.toFixed(1) ?? "--"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Frecuencia (Hz)</span>
          <span>{frequency?.toFixed(2) ?? "--"}</span>
        </div>
        <div className="flex justify-between col-span-2">
          <span className="text-slate-400">Factor Potencia</span>
          <span>{pf?.toFixed(2) ?? "--"}</span>
        </div>
      </div>
    </div>
  );
}
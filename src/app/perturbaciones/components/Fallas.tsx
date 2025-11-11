"use client";

import { generateMockEvents } from "../data/eventGenerator";

export default function Fallas() {
  const events = generateMockEvents(30);

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4">🔎 Detalles de Fallas</h2>
      <table className="w-full border-collapse border border-gray-700 text-sm">
        <thead className="bg-gray-800 text-gray-200">
          <tr>
            <th className="border border-gray-700 px-4 py-2">Fecha</th>
            <th className="border border-gray-700 px-4 py-2">Duración (ms)</th>
            <th className="border border-gray-700 px-4 py-2">Magnitud (%)</th>
            <th className="border border-gray-700 px-4 py-2">Fase</th>
            <th className="border border-gray-700 px-4 py-2">Tipo</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e, idx) => (
            <tr key={idx} className="hover:bg-gray-800">
              <td className="border border-gray-700 px-4 py-2">
                {new Date(e.timestamp).toLocaleString()}
              </td>
              <td className="border border-gray-700 px-4 py-2">{e.durationMs}</td>
              <td className="border border-gray-700 px-4 py-2">{e.magnitude}</td>
              <td className="border border-gray-700 px-4 py-2">{e.phase}</td>
              <td className="border border-gray-700 px-4 py-2 capitalize">{e.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
// src/components/ai/Card.tsx
"use client";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { AICard } from "@/types/ai";

export default function Card(props: AICard) {
  return (
    <div className="bg-slate-800/60 border border-white/10 rounded-xl shadow-md p-6">
      <h2 className="text-lg font-semibold mb-2">{props.title}</h2>

      {props.type === "text" && <p className="text-white/70">{props.content}</p>}

      {props.type === "recommendations" && (
        <ul className="list-disc list-inside text-white/70 space-y-1">
          {props.items?.map((it, i) => <li key={i}>{it}</li>)}
        </ul>
      )}

      {props.type === "alert" && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg">
          {props.content}
        </div>
      )}

      {props.type === "chart" && props.chartOptions && (
        <HighchartsReact highcharts={Highcharts} options={props.chartOptions} />
      )}

      {props.type === "table" && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                {props.columns.map((c, i) => (
                  <th key={i} className="text-left px-3 py-2 text-white/80 border-b border-white/10">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {props.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 text-white/70 border-b border-white/5">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {props.type === "actions" && (
        <div className="flex flex-wrap gap-2">
          {props.actions.map((a, i) => (
            <a key={i} href={a.href} className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm">
              {a.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
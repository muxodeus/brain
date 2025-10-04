"use client";

export default function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow">
      <h2 className="text-sm font-semibold text-slate-200 mb-2">{title}</h2>
      {children}
    </div>
  );
}
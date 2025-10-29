"use client";
import { useEffect, useState } from "react";

export function PageHeader({ title }: { title: string }) {
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    setNow(new Date().toLocaleString("es-SV", { hour12: false }));
  }, []);

  return (
    <header className="flex items-center justify-between">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="text-xs text-slate-400">
        Última actualización: {now || "—"}
      </div>
    </header>
  );
}
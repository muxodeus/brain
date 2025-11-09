"use client";

import { useEffect, useState } from "react";

/**
 * Hook reutilizable para cargar Highcharts y sus módulos
 * de forma segura en cliente (evita SSR).
 */
export function useHighcharts() {
  const [Highcharts, setHighcharts] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const HighchartsLib = (await import("highcharts")).default;

        // Cargar módulos de Highcharts
        const modules = [
          () => import("highcharts/modules/heatmap"),
          () => import("highcharts/modules/exporting"),
          () => import("highcharts/modules/export-data"),
          () => import("highcharts/modules/full-screen"),
        ];

        for (const load of modules) {
          const mod = await load();
          if (typeof mod.default === "function") {
            mod.default(HighchartsLib);
          }
        }

        if (mounted) setHighcharts(HighchartsLib);
      } catch (err) {
        console.error("Error cargando Highcharts:", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return Highcharts;
}
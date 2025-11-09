"use client";

import { useMemo } from "react";

/**
 * Hook que convierte un rango (ej. "7d") o fechas personalizadas
 * en un objeto { startDate, endDate } en formato ISO.
 */
export function useDateRange(range: string, from?: string, to?: string) {
  const now = useMemo(() => new Date(), []);

  const { startDate, endDate } = useMemo(() => {
    // Si hay fechas personalizadas, tienen prioridad
    if (from && to) {
      return {
        startDate: new Date(from).toISOString(),
        endDate: new Date(to).toISOString(),
      };
    }

    // Caso contrario, interpretamos el rango
    let start = new Date(now);
    switch (range) {
      case "1h":
        start.setHours(start.getHours() - 1);
        break;
      case "1d":
        start.setDate(start.getDate() - 1);
        break;
      case "7d":
        start.setDate(start.getDate() - 7);
        break;
      case "30d":
        start.setDate(start.getDate() - 30);
        break;
      default:
        start.setDate(start.getDate() - 7); // fallback
    }

    return {
      startDate: start.toISOString(),
      endDate: now.toISOString(),
    };
  }, [range, from, to, now]);

  return { startDate, endDate };
}
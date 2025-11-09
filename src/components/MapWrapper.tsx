"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Estado = "normal" | "advertencia" | "alarma";
type Tipo = "subestacion" | "panel" | "bomba";

type Medidor = {
  id: number;
  nombre: string;
  ubicacion: string;
  lat: number;
  lng: number;
  estado: Estado;
  tipo?: Tipo;
  consumoActual?: number;
};

export default function MapWrapper({ medidores }: { medidores: Medidor[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Resetear contenedor si ya tiene un mapa
    if ((containerRef.current as any)._leaflet_id) {
      (containerRef.current as any)._leaflet_id = null;
    }

    // Crear mapa manualmente
    const map = L.map(containerRef.current).setView([13.6929, -89.2182], 13);

    // Capa base
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    // Función para iconos personalizados
    const getStatusIcon = (estado: Estado, tipo?: Tipo) => {
      const color =
        estado === "alarma" ? "red" : estado === "advertencia" ? "orange" : "green";
      const emoji =
        tipo === "subestacion" ? "⚡" : tipo === "panel" ? "📊" : tipo === "bomba" ? "💧" : "";
      return L.divIcon({
        html: `<div style="background:${color};border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;color:white;font-size:14px;">${emoji}</div>`,
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
    };

    // Añadir marcadores
    medidores.forEach((m) => {
      L.marker([m.lat, m.lng], { icon: getStatusIcon(m.estado, m.tipo) })
        .addTo(map)
        .bindPopup(
          `<strong>${m.nombre}</strong><br/>Ubicación: ${m.ubicacion}<br/>Estado: ${m.estado}${
            m.consumoActual ? `<br/>Consumo actual: ${m.consumoActual} kW` : ""
          }`
        );
    });

    // Ajustar vista a los medidores
    if (medidores.length > 0) {
      const bounds = L.latLngBounds(medidores.map((m) => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }

    // Cleanup al desmontar
    return () => {
      map.remove();
    };
  }, [medidores]);

  return <div ref={containerRef} className="h-full w-full rounded-lg" />;
}
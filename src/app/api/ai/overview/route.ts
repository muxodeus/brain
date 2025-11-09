import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    insights: [
      "Durante las últimas 24 horas, el consumo energético mostró un patrón estable con un pico a las 14:00 horas, coincidiendo con el arranque de maquinaria pesada en la planta.",
      "El factor de potencia promedio se mantuvo en 0.82. Se recomienda evaluar la instalación de bancos de capacitores para optimizarlo y reducir penalizaciones en la factura eléctrica.",
      "Se detectaron dos eventos de sobrecarga en el canal B, ambos resueltos en menos de 10 minutos. Esto refleja buena capacidad de respuesta operativa, aunque también indica la necesidad de revisar la distribución de cargas.",
    ],
  });
}
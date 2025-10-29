import { NextResponse } from "next/server";
import { analizarPrompt } from "@/lib/ai/parser";
import { ejecutar } from "@/lib/ai/executor";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    console.log("Prompt recibido:", prompt);

    const spec = analizarPrompt(prompt || "");
    console.log("Spec generado:", spec);

    const resultado = await ejecutar(spec);
    console.log("Resultado:", resultado);

    return NextResponse.json({
      resumen: resultado.resumen,
      texto: resultado.texto,
      recomendaciones: resultado.recomendaciones || [],
      palabrasClave: [spec.operacion, ...spec.campos, spec.rango],
      seriesGrafico: resultado.seriesGrafico || [],
      categorias: (resultado as any).categorias || undefined,
    });
  } catch (err) {
    console.error("Error en /api/ai/insights:", err);
    return NextResponse.json(
      { resumen: "Error interno", texto: "No se pudo procesar la consulta.", seriesGrafico: [] },
      { status: 500 }
    );
  }
}
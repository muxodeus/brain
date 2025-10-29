// Limpia el stream del LLM y devuelve solo frases (string[])
export async function generarRecomendaciones(prompt: string): Promise<string[]> {
  const resp = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL || "llama3.2:3b",
      prompt,
      stream: true,
    }),
  });

  if (!resp.ok) throw new Error("Error al generar insights");

  const reader = resp.body?.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let tokens: string[] = [];
  let insights: string[] = [];

  // Acumula tokens del stream y corta por frases
  const flushSentences = () => {
    const joined = tokens.join("").trim();
    // Divide por fin de oración
    const parts = joined.split(/([.!?])\s+/).reduce<string[]>((acc, cur, idx, arr) => {
      if (/[.!?]/.test(cur)) acc[acc.length - 1] = (acc[acc.length - 1] || "") + cur + " ";
      else acc.push(cur);
      return acc;
    }, []);
    // Extrae frases completas
    parts.forEach((p) => {
      const t = p.trim();
      if (t.length >= 12 && /[.!?]$/.test(t)) insights.push(t);
    });
    // Mantén último segmento incompleto como tokens
    const tail = parts[parts.length - 1]?.trim() || "";
    tokens = tail ? [tail] : [];
  };

  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // El endpoint emite JSONL: procesa línea por línea
    const lines = buffer.split("\n");
    buffer = lines.pop() || ""; // deja en buffer la última línea si está incompleta

    for (const line of lines) {
      const trimmed = line.trim();
      // Ignora líneas que no son JSON
      if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) continue;

      try {
        const json = JSON.parse(trimmed);
        const text = (json.response ?? "").toString();
        if (!text) continue;

        // Ignora claramente JSON crudo accidental y marcadores
        if (/^\{.*\}$/.test(text) || text === "**" || text === "¡") continue;

        // Limpieza de markdown simple
        const clean = text.replace(/^\*+|\*+$/g, "");

        // Acumula tokens
        tokens.push(clean);

        // Cada vez que entra contenido nuevo, intenta extraer frases
        flushSentences();

        // Si el stream declara final, corta
        if (json.done) break;
      } catch {
        // ignora líneas corruptas
        continue;
      }
    }
  }

  // Si no se cerró ninguna frase completa, usa lo acumulado
  if (insights.length === 0 && tokens.length) {
    const fallback = tokens.join("").trim();
    if (fallback.length >= 20) insights.push(fallback);
  }

  // Fallback final si no se obtuvo nada útil
  if (insights.length === 0) {
    insights = ["No se pudieron generar insights en este momento."];
  }

  // Normaliza y limita
  insights = insights
    .map((t) =>
      t
        .replace(/^\{.*\}$/g, "")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter((t) => t.length >= 12 && /[a-záéíóúñ]/i.test(t));

  return insights.slice(0, 3);
}
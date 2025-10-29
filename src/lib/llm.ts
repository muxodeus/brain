export async function generarRecomendaciones(prompt: string, signal?: AbortSignal): Promise<string[]> {
  const resp = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL || "llama3.2:3b", // asegúrate que coincide con `ollama list`
      prompt,
    }),
    signal,
  });

  if (!resp.ok) {
    throw new Error(`Error LLM: ${resp.statusText}`);
  }

  const text = await resp.text();

  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(0, 3);
}
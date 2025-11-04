#!/usr/bin/env tsx
/**
 * Script CLI para probar Ollama localmente
 * Uso:
 *   npx tsx scripts/test-ollama.ts "Tu prompt aquí"
 */

// ❌ Ya no necesitas importar node-fetch
// import fetch from "node-fetch";

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("❌ Debes pasar un prompt como argumento.");
    console.error('Ejemplo: npx tsx scripts/test-ollama.ts "Explica calidad de energía"');
    process.exit(1);
  }

  const prompt = args.join(" ");

  try {
    const res = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:3b", // cámbialo por el modelo que tengas en Ollama
        prompt,
        stream: false,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("❌ Error al llamar a Ollama:", errText);
      process.exit(1);
    }

    const data = await res.json();
    console.log("\n🧠 Respuesta del modelo:\n");
    console.log(data.response || "⚠️ No se recibió respuesta.");
  } catch (err) {
    console.error("❌ No se pudo conectar a Ollama.");
    console.error("Verifica que Ollama esté corriendo con `ollama serve`.");
    console.error(err);
  }
}

main();
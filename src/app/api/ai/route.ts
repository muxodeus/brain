import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // o el modelo que prefieras
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Error OpenAI:", errText);
      return NextResponse.json({ error: "Error en OpenAI" }, { status: 500 });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim() || "No se generó respuesta.";

    return NextResponse.json({ text });
  } catch (err) {
    console.error("Error en /api/ai:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
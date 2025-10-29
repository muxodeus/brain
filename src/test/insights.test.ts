import { describe, it, expect } from "vitest";
import { POST } from "../src/app/api/ai/insights/route";

async function callApi(prompt: string) {
  const req = new Request("http://localhost/api/ai/insights", {
    method: "POST",
    body: JSON.stringify({ prompt }),
  });
  const res = await POST(req);
  return await res.json();
}

describe("API /api/ai/insights", () => {
  it("detecta 'debajo de 120 voltios'", async () => {
    const result = await callApi("¿qué porcentaje del tiempo el voltaje estuvo por debajo de 120 voltios?");
    expect(result.text).toContain("por debajo de 120V");
  });

  it("detecta 'arriba de 120 voltios'", async () => {
    const result = await callApi("¿qué porcentaje del tiempo el voltaje estuvo por arriba de 120 voltios?");
    expect(result.text).toContain("por arriba de 120V");
  });

  it("detecta 'debajo de 110 voltios'", async () => {
    const result = await callApi("¿qué porcentaje del tiempo el voltaje estuvo por debajo de 110 voltios?");
    expect(result.text).toContain("por debajo de 110V");
  });
});
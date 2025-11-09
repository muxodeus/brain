import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(request: Request) {
  const config = await request.json();
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Renderiza HTML con Chart.js embebido
  await page.setContent(`
    <html>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      </head>
      <body>
        <h1>${config.titulo}</h1>
        <p>Autor: ${config.autor}</p>
        <p>Periodo: ${config.inicio} a ${config.fin}</p>
        <canvas id="chart" width="600" height="400"></canvas>
        <script>
          const ctx = document.getElementById('chart');
          new Chart(ctx, {
            type: 'line',
            data: {
              labels: ${JSON.stringify(config.labels)},
              datasets: [{
                label: 'Voltaje',
                data: ${JSON.stringify(config.voltage)},
                borderColor: 'blue',
                fill: false
              }]
            }
          });
        </script>
      </body>
    </html>
  `);

  const pdfBuffer = await page.pdf({ format: "A4" });
  await browser.close();

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=reporte.pdf",
    },
  });
}
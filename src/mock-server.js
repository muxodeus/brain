// mock-server.js
const express = require("express");

const app = express();
const PORT = 4000;

const mockResponse = {
  resumen:
    "Durante la última semana, el voltaje en PQGenius estuvo por debajo de 120V en un 25% del tiempo.",
  text: "El análisis de los datos muestra que de un total de 168 horas (7 días), en 42 horas el voltaje estuvo por debajo de 120V. Esto representa un 25% del tiempo total. El resto de las 126 horas (75%) se mantuvo en niveles normales. El gráfico tipo pastel adjunto ilustra esta distribución de manera clara.",
  recomendaciones: [
    "Configurar alertas automáticas cuando el voltaje caiga por debajo de 120V.",
    "Revisar la estabilidad de la red eléctrica en los periodos de mayor caída.",
  ],
  keywords: ["voltaje bajo", "PQGenius", "análisis semanal", "gráfico pastel"],
  images: [
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAIAAAD..."
  ],
};

app.post("/api/insights", (req, res) => {
  res.json(mockResponse);
});

app.listen(PORT, () => {
  console.log(`🚀 Mock server corriendo en http://localhost:${PORT}`);
});
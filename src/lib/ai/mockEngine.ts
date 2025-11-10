// src/lib/ai/mockEngine.ts
import { AIResponse, AICard } from "@/types/ai";

type Intent =
  | "percentil"
  | "comparar_semana"
  | "consumo_diario"
  | "correlacion"
  | "alarmas_criticas"
  | "factor_potencia"
  | "thd_area"
  | "costos_tarifa"
  | "usuarios"
  | "config_medidores"
  | "frecuencia_diaria"
  | "energia_reactiva"
  | "balance_fases"
  | "top_consumos"
  | "gateways"
  | "comparar_tarifas"
  | "alarmas_historicas"
  | "exportar_pdf"
  | "simulacion_ahorro"
  | "estado_medidores"
  | "default";

function detectIntent(prompt: string): Intent {
  const p = prompt.toLowerCase();

  if (p.includes("percentil") || p.includes("p95")) return "percentil";
  if ((p.includes("compar") || p.includes("compara")) && p.includes("semana")) return "comparar_semana";
  if (p.includes("histograma") || (p.includes("consumo") && p.includes("diario"))) return "consumo_diario";
  if (p.includes("correlacion") || p.includes("correlación") || p.includes("overlay")) return "correlacion";
  if (p.includes("alarmas") && (p.includes("criticas") || p.includes("críticas"))) return "alarmas_criticas";
  if (p.includes("factor de potencia") || p.includes("fp")) return "factor_potencia";
  if (p.includes("thd")) return "thd_area";
  if ((p.includes("costo") || p.includes("costos")) && p.includes("tarifa")) return "costos_tarifa";
  if (p.includes("usuarios") && (p.includes("activos") || p.includes("conectados"))) return "usuarios";
  if ((p.includes("configura") || p.includes("configuración")) && p.includes("medidor")) return "config_medidores";
  if (p.includes("frecuencia")) return "frecuencia_diaria";
  if (p.includes("reactiva")) return "energia_reactiva";
  if (p.includes("balance") && p.includes("fase")) return "balance_fases";
  if (p.includes("top") && p.includes("consumo")) return "top_consumos";
  if (p.includes("gateway")) return "gateways";
  if ((p.includes("comparar") || p.includes("comparación")) && p.includes("tarifa")) return "comparar_tarifas";
  if (p.includes("alarmas") && p.includes("históricas")) return "alarmas_historicas";
  if (p.includes("exportar") && p.includes("pdf")) return "exportar_pdf";
  if (p.includes("simulación") || p.includes("ahorro")) return "simulacion_ahorro";
  if (p.includes("estado") && p.includes("medidores")) return "estado_medidores";

  return "default";
}

function chartLine(title: string, series: any[], categories?: string[]): AICard {
  return {
    type: "chart",
    title,
    chartOptions: {
      chart: { type: "line", backgroundColor: "transparent" },
      title: { text: title },
      xAxis: { categories: categories ?? ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] },
      yAxis: { title: { text: "kWh" } },
      series,
    },
  };
}

function chartColumn(title: string, series: any[], categories?: string[]): AICard {
  return {
    type: "chart",
    title,
    chartOptions: {
      chart: { type: "column", backgroundColor: "transparent" },
      title: { text: title },
      xAxis: { categories: categories ?? Array.from({ length: 30 }, (_, i) => `Día ${i + 1}`) },
      yAxis: { title: { text: "kWh" } },
      series,
    },
  };
}

function chartPie(title: string, data: { name: string; y: number }[]): AICard {
  return {
    type: "chart",
    title,
    chartOptions: {
      chart: { type: "pie", backgroundColor: "transparent" },
      title: { text: title },
      series: [{ name: "Distribución", data }],
    },
  };
}

export function getMockResponse(prompt: string): AIResponse {
  const intent = detectIntent(prompt);
  const base: AIResponse = {
    prompt,
    summary: "",
    keywords: [],
    suggestions: [],
    cards: [],
  };

  switch (intent) {
    case "percentil": {
      base.summary = "El percentil 95 del voltaje en la última semana es 231.4 V.";
      base.keywords = ["voltaje", "p95", "calidad de energía"];
      base.cards.push(
        { type: "text", title: "Resultado", content: "P95(voltaje) = 231.4 V. Dentro del rango operativo." },
        { type: "recommendations", title: "Acciones sugeridas", items: ["Ver variaciones por turno", "Cruzar con eventos de carga crítica"] }
      );
      base.suggestions = ["Superpone voltaje y corriente en la última hora", "Comparar P95 por fase"];
      return base;
    }

    case "comparar_semana": {
      base.summary = "El consumo total subió 14% vs. la semana anterior.";
      base.keywords = ["consumo", "comparación", "variación"];
      base.cards.push(
        chartLine("Consumo semanal comparado", [
          { name: "Semana actual", data: [120, 150, 180, 130, 170, 200, 160] },
          { name: "Semana anterior", data: [110, 140, 160, 120, 150, 180, 150] },
        ]),
        { type: "text", title: "Insight", content: "Incremento en días de alta producción (Jue-Sáb)." }
      );
      base.suggestions = ["Explorar costos por tarifa", "Ver alarmas de la semana"];
      return base;
    }

    case "consumo_diario": {
      base.summary = "Distribución con picos en fines de semana.";
      base.keywords = ["consumo", "histograma"];
      base.cards.push(
        chartColumn("Consumo diario (último mes)", [
          { name: "kWh", data: Array.from({ length: 30 }, () => Math.floor(120 + Math.random() * 100)) },
        ]),
        { type: "text", title: "Interpretación", content: "Sesgo hacia valores altos en fin de semana." }
      );
      base.suggestions = ["Ver percentiles", "Correlación con producción"];
      return base;
    }

    case "correlacion": {
      base.summary = "Correlación moderada entre corriente y temperatura (r ≈ 0.42).";
      base.keywords = ["correlación", "corriente", "temperatura"];
      base.cards.push(
        chartLine("Overlay corriente vs temperatura", [
          { name: "Corriente", data: [20, 22, 24, 23, 26, 28, 27] },
          { name: "Temperatura", data: [27, 28, 29, 29, 30, 31, 30] },
        ]),
        { type: "text", title: "Insight", content: "Mayor carga coincide con mayor temperatura." },
        { type: "recommendations", title: "Acciones", items: ["Mejorar ventilación", "Programar mantenimiento en picos térmicos"] }
      );
      base.suggestions = ["Scatter plot por hora", "Cruzar con alarmas térmicas"];
      return base;
    }

    case "alarmas_criticas": {
      base.summary = "3 alarmas críticas activas en las últimas 24h.";
      base.keywords = ["alarmas", "críticas"];
      base.cards.push(
        { type: "alert", title: "THD crítico", content: "THD > 8% en tablero principal T-02." },
        { type: "alert", title: "Baja de voltaje", content: "Fase B por debajo de 190 V en L-14." },
        { type: "alert", title: "Pico de corriente", content: "Motor M-07 superó umbral de 120 A." }
      );
      base.suggestions = ["Ver detalles de alarmas", "Programar inspección"];
      return base;
    }

    case "factor_potencia": {
      base.summary = "Factor de potencia promedio semanal: 0.90.";
      base.keywords = ["factor de potencia", "fp"];
      base.cards.push(
        { type: "table", title: "FP por día", columns: ["Día", "FP"], rows: [["Lun", 0.92], ["Mar", 0.88], ["Mié", 0.89], ["Jue", 0.90], ["Vie", 0.91], ["Sáb", 0.87], ["Dom", 0.90]] },
        { type: "text", title: "Insight", content: "Valores aceptables, revisar cargas inductivas nocturnas." },
        { type: "recommendations", title: "Recomendaciones", items: ["Instalar bancos de capacitores", "Ajustar compensación por turnos"] }
      );
      base.suggestions = ["Ver FP por área", "Tendencia mensual de FP"];
      return base;
    }

    case "thd_area": {
      base.summary = "THD por área con umbrales críticos detectados.";
      base.keywords = ["thd", "armónicos"];
      base.cards.push(
        { type: "table", title: "THD por tablero", columns: ["Área", "THD %"], rows: [["T-01", 4.5], ["T-02", 8.2], ["T-03", 3.1], ["T-04", 6.3]] },
        { type: "alert", title: "Alerta THD", content: "THD > 5% en T-02 y T-04. Revisar cargas no lineales." },
        { type: "recommendations", title: "Mitigación", items: ["Filtros activos en T-02", "Reubicar variadores de frecuencia"] }
      );
      base.suggestions = ["Ver THD por fase", "Alarmas históricas de armónicos"];
      return base;
    }

    case "costos_tarifa": {
      base.summary = "Desglose de costos por tarifa del último mes.";
      base.keywords = ["costos", "tarifas"];
      base.cards.push(
        chartPie("Costos por tarifa", [
          { name: "Tarifa A", y: 40 },
          { name: "Tarifa B", y: 35 },
          { name: "Tarifa C", y: 25 },
        ]),
        { type: "table", title: "Detalle mensual", columns: ["Tarifa", "Costo"], rows: [["A", 10000], ["B", 8700], ["C", 6200]] },
        { type: "recommendations", title: "Optimización", items: ["Mover carga a horarios de menor costo", "Negociar contrato en temporada alta"] }
      );
      base.suggestions = ["Comparar tarifas eléctricas", "Simular ahorro por horario"];
      return base;
    }

    case "usuarios": {
      base.summary = "Usuarios activos y roles actuales.";
      base.keywords = ["usuarios", "roles"];
      base.cards.push(
        { type: "table", title: "Usuarios activos", columns: ["Usuario", "Rol"], rows: [["Ana", "Admin"], ["Luis", "Viewer"], ["María", "Editor"], ["Carlos", "Viewer"]] },
        { type: "actions", title: "Gestión rápida", actions: [{ label: "Permisos", href: "/configuracion/users" }, { label: "Auditoría", href: "/reportes?tipo=usuarios" }] }
      );
      base.suggestions = ["Usuarios conectados hoy", "Cambios de rol recientes"];
      return base;
    }

    case "config_medidores": {
      base.summary = "Accesos directos a configuración de medidores.";
      base.keywords = ["medidores", "configuración"];
      base.cards.push({
        type: "actions",
        title: "Configuración",
        actions: [
          { label: "Configurar medidores", href: "/configuracion/medidores" },
          { label: "Plantillas de modelos", href: "/configuracion/medidores/plantillas" },
          { label: "Gateways", href: "/configuracion/gateways" },
        ],
      });
      base.suggestions = ["Importar catálogo de medidores", "Asignar medidores a áreas"];
      return base;
    }

    case "frecuencia_diaria": {
      base.summary = "Frecuencia promedio 60 Hz ±0.2 a lo largo de la semana.";
      base.keywords = ["frecuencia", "estabilidad"];
      base.cards.push(
        chartLine("Frecuencia diaria", [{ name: "Hz", data: [59.9, 60.1, 60.0, 60.2, 59.8, 60.1, 60.0] }], ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"]),
        { type: "text", title: "Insight", content: "Estable dentro de rango nominal." }
      );
      base.suggestions = ["Ver eventos fuera de rango", "Cruzar con cargas pico"];
      return base;
    }

    case "energia_reactiva": {
      base.summary = "Eventos de energía reactiva detectados en tres líneas.";
      base.keywords = ["reactiva", "compensación"];
      base.cards.push(
        { type: "alert", title: "Exceso de reactiva", content: "Línea L-12 excede umbral de reactiva." },
        { type: "recommendations", title: "Acciones", items: ["Ajustar compensación", "Programar revisión de bancos"] }
      );
      base.suggestions = ["Ver FP por línea", "Comparar reactiva mensual"];
      return base;
    }

    case "balance_fases": {
      base.summary = "Desbalance leve en fase B.";
      base.keywords = ["balance", "fases"];
      base.cards.push(
        { type: "table", title: "Balance de cargas por fase", columns: ["Fase", "%"], rows: [["A", 33], ["B", 40], ["C", 27]] },
        chartColumn("Cargas por fase", [{ name: "Carga", data: [33, 40, 27] }], ["A","B","C"]),
        { type: "recommendations", title: "Correcciones", items: ["Redistribuir cargas en tableros", "Revisar alimentadores"] }
      );
      base.suggestions = ["Ver balance por área", "Tendencia semanal de desbalance"];
      return base;
    }

    case "top_consumos": {
      base.summary = "Top 5 áreas con mayor consumo en la semana.";
      base.keywords = ["ranking", "consumo"];
      base.cards.push(
        { type: "table", title: "Top consumos por área", columns: ["Área", "kWh"], rows: [["Producción", 1200], ["Oficinas", 800], ["HVAC", 760], ["Iluminación", 540], ["Servicios", 480]] },
        { type: "recommendations", title: "Oportunidades", items: ["Optimizar HVAC", "Sensores de presencia en iluminación"] }
      );
      base.suggestions = ["Ver costos asociados", "Comparar con semana anterior"];
      return base;
    }

    case "gateways": {
      base.summary = "Disponibilidad de gateways: 2 offline, 5 online.";
      base.keywords = ["gateways", "conectividad"];
      base.cards.push(
        { type: "alert", title: "Gateway offline", content: "G-03 sin conexión desde 02:14." },
        { type: "alert", title: "Gateway offline", content: "G-07 sin conexión desde 06:40." },
        { type: "actions", title: "Acciones rápidas", actions: [{ label: "Ver gateways", href: "/configuracion/gateways" }] }
      );
      base.suggestions = ["Reintentar conexión", "Ver logs de gateway"];
      return base;
    }

    case "comparar_tarifas": {
      base.summary = "Tarifa B más costosa que Tarifa A en hora pico.";
      base.keywords = ["tarifas", "comparación"];
      base.cards.push(
        { type: "table", title: "Comparación de tarifas", columns: ["Tarifa", "Costo pico", "Costo valle"], rows: [["A", 0.18, 0.10], ["B", 0.22, 0.12]] },
        chartPie("Participación de costos", [{ name: "A", y: 45 }, { name: "B", y: 55 }]),
        { type: "recommendations", title: "Optimización", items: ["Desplazar carga a valle", "Evaluar contrato B"] }
      );
      base.suggestions = ["Simular ahorro por horario", "Ver costos mensuales"];
      return base;
    }

    case "alarmas_historicas": {
      base.summary = "10 alarmas registradas en octubre, pico en semana 2.";
      base.keywords = ["alarmas", "histórico"];
      base.cards.push(
        chartColumn("Alarmas por día (octubre)", [{ name: "Alarmas", data: Array.from({ length: 31 }, () => Math.floor(Math.random() * 5)) }], Array.from({ length: 31 }, (_, i) => `${i + 1}`)),
        { type: "text", title: "Insight", content: "Mayor incidencia en semana 2 por carga pico." }
      );
      base.suggestions = ["Ver tipos de alarmas", "Cruzar con producción"];
      return base;
    }

    case "exportar_pdf": {
      base.summary = "Generar reporte PDF de los insights actuales.";
      base.keywords = ["reporte", "pdf"];
      base.cards.push({ type: "actions", title: "Exportar", actions: [{ label: "Generar PDF", href: "/reportes/pdf" }] });
      base.suggestions = ["Configurar secciones del reporte", "Añadir cumplimiento normativo"];
      return base;
    }

    case "simulacion_ahorro": {
      base.summary = "Ahorro potencial del 12% aplicando medidas de eficiencia.";
      base.keywords = ["simulación", "ahorro"];
      base.cards.push(
        chartLine("Proyección de ahorro", [{ name: "Costo", data: [100, 95, 90, 88, 85] }], ["Mes 0","Mes 1","Mes 2","Mes 3","Mes 4"]),
        { type: "text", title: "Escenario", content: "Medidas: optimización HVAC, cambios de iluminación." }
      );
      base.suggestions = ["Ver ROI estimado", "Comparar escenarios A/B"];
      return base;
    }

    case "estado_medidores": {
      base.summary = "Estado de medidores: 3 offline, 12 online.";
      base.keywords = ["medidores", "estado"];
      base.cards.push(
        { type: "table", title: "Estado de medidores", columns: ["Medidor", "Estado"], rows: [["M-01", "Online"], ["M-02", "Offline"], ["M-03", "Online"], ["M-07", "Offline"]] },
        { type: "alert", title: "Medidores offline", content: "M-02, M-07 requieren revisión." }
      );
      base.suggestions = ["Ver mapa de medidores", "Programar mantenimiento"];
      return base;
    }

    default: {
      base.summary = "Puedo ayudarte con consumo, voltaje, alarmas, tarifas y configuración.";
      base.keywords = ["ayuda", "navegación"];
      base.cards.push(
        { type: "text", title: "¿Qué puedo hacer?", content: "Pregunta por P95 de voltaje, consumo semanal, THD por área o exportar PDF." },
        { type: "actions", title: "Explora", actions: [{ label: "Tendencias", href: "/tendencias" }, { label: "Centro de energía", href: "/consumos" }, { label: "Alarmas", href: "/alarmas" }] }
      );
      base.suggestions = [
        "¿Cuál fue el percentil 95 del voltaje en la última semana?",
        "Compara el consumo de energía de esta semana con la anterior",
        "Haz un histograma diario del consumo de energía en el último mes",
      ];
      return base;
    }
  }
}
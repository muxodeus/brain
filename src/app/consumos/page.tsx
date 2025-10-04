"use client";

import { useState } from "react";
import ConsumptionCharts from "@/components/ConsumptionCharts";
import ConsumptionRanking from "@/components/ConsumptionRanking";
import ConsumptionAlerts from "@/components/ConsumptionAlerts";

export default function ConsumosPage() {
  const [meters, setMeters] = useState<string[]>(["pqgenius"]);
  const [range, setRange] = useState("-7d");

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Consumos de Energía</h1>
      <ConsumptionCharts meters={meters} range={range} />
      <ConsumptionRanking range={range} />
      <ConsumptionAlerts range={range} />
    </div>
  );
}
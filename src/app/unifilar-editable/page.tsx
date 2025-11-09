"use client";
import React, { useEffect, useMemo, useState } from "react";
import EditableHierarchyPanel from "./EditableHierarchyPanel";
import UnifilarCanvasEditable from "./UnifilarCanvasEditable";

interface NodeItem {
  id: string;
  name: string;
  children: NodeItem[];
}

type Metrics = {
  kW: number;
  kVAR: number;
  V: number;
  A: number;
  pf: number;
  status: "OK" | "Alarma";
};

type MetricsMap = Record<string, Metrics>;

const uid = () => crypto.randomUUID();

function buildTree(): NodeItem[] {
  return [
    {
      id: uid(),
      name: "Subestación Principal",
      children: [
        {
          id: uid(),
          name: "Panel Norte",
          children: [
            {
              id: uid(),
              name: "Línea Producción A",
              children: [
                {
                  id: uid(),
                  name: "Sección A motores",
                  children: [
                    { id: uid(), name: "Motor Extrusora A1", children: [] },
                    { id: uid(), name: "Motor Ventilador A2", children: [] },
                    { id: uid(), name: "Bomba Agua A3", children: [] },
                  ],
                },
              ],
            },
            {
              id: uid(),
              name: "Línea Producción B",
              children: [
                {
                  id: uid(),
                  name: "Sección B compresión",
                  children: [
                    { id: uid(), name: "Compresor Aire B1", children: [] },
                    { id: uid(), name: "Secador Línea B2", children: [] },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: uid(),
          name: "Panel Sur",
          children: [
            {
              id: uid(),
              name: "Bombas de Servicio",
              children: [
                { id: uid(), name: "Bomba Trasiego S1", children: [] },
                { id: uid(), name: "Bomba Enfriamiento S2", children: [] },
              ],
            },
            {
              id: uid(),
              name: "Servicios Generales",
              children: [
                { id: uid(), name: "Iluminación Planta", children: [] },
                { id: uid(), name: "Tomacorrientes Industriales", children: [] },
              ],
            },
          ],
        },
        {
          id: uid(),
          name: "Panel Banco de Capacitores",
          children: [
            { id: uid(), name: "Capacitor Etapa 1", children: [] },
            { id: uid(), name: "Capacitor Etapa 2", children: [] },
          ],
        },
        {
          id: uid(),
          name: "Campo Fotovoltaico",
          children: [
            { id: uid(), name: "Inversor Solar 1", children: [] },
            { id: uid(), name: "Inversor Solar 2", children: [] },
          ],
        },
      ],
    },
  ];
}

function normalizedWeights(n: number): number[] {
  const raw = Array.from({ length: n }, () => Math.random() + 0.2);
  const sum = raw.reduce((a, b) => a + b, 0);
  return raw.map((w) => w / sum);
}

function computeMetricsMap(tree: NodeItem[], rootKW: number, rootKVAR: number): MetricsMap {
  const map: MetricsMap = {};
  const root = tree[0];
  map[root.id] = {
    kW: rootKW,
    kVAR: rootKVAR,
    V: 230,
    A: +(rootKW / 3).toFixed(1),
    pf: +(0.9 + Math.random() * 0.09).toFixed(2),
    status: "OK",
  };

  const assign = (nodes: NodeItem[], parentKW: number, parentKVAR: number) => {
    if (!nodes.length) return;
    const kwWeights = normalizedWeights(nodes.length);
    const kvarWeights = normalizedWeights(nodes.length);

    nodes.forEach((n, i) => {
      let childKW = parentKW * kwWeights[i];
      let childKVAR = parentKVAR * kvarWeights[i];

      if (n.name.toLowerCase().includes("capacitor")) childKW = 0;
      if (n.name.toLowerCase().includes("inversor")) childKVAR = 0;

      map[n.id] = {
        kW: +childKW.toFixed(1),
        kVAR: +childKVAR.toFixed(1),
        V: Math.round(210 + Math.random() * 30),
        A: +(10 + Math.random() * 90).toFixed(1),
        pf: +(0.8 + Math.random() * 0.2).toFixed(2),
        status: Math.random() > 0.9 ? "Alarma" : "OK",
      };

      if (n.children.length) assign(n.children, childKW, childKVAR);
    });
  };

  assign(root.children, rootKW, rootKVAR);
  return map;
}

export default function UnifilarEditablePage() {
  const [tree, setTree] = useState<NodeItem[]>(() => buildTree());
  const [selectedNode, setSelectedNode] = useState<NodeItem | null>(null);
  const [metricsMap, setMetricsMap] = useState<MetricsMap>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const rootKW = +(800 + Math.random() * 400).toFixed(1);
      const rootKVAR = +(300 + Math.random() * 300).toFixed(1);
      setMetricsMap(computeMetricsMap(tree, rootKW, rootKVAR));
    }, 5000);
    return () => clearInterval(interval);
  }, [tree]);

  const insightsContent = useMemo(() => {
    if (!selectedNode) return null;
    const m = metricsMap[selectedNode.id];
    const root = metricsMap[tree[0].id];
    if (!m || !root) return null;

    const findParent = (list: NodeItem[], id: string): NodeItem | null => {
      for (const n of list) {
        if (n.children.some((c) => c.id === id)) return n;
        const deep = findParent(n.children, id);
        if (deep) return deep;
      }
      return null;
    };
    const parent = findParent(tree, selectedNode.id);
    const parentMetrics = parent ? metricsMap[parent.id] : null;

    const pctKWRoot =
      selectedNode.id === tree[0].id ? "100" : root.kW === 0 ? "0" : ((m.kW / root.kW) * 100).toFixed(1);
    const pctKVARRoot =
      selectedNode.id === tree[0].id ? "100" : root.kVAR === 0 ? "0" : ((m.kVAR / root.kVAR) * 100).toFixed(1);

    const pctKWParent =
      !parentMetrics || selectedNode.id === tree[0].id || parentMetrics.kW === 0
        ? "100"
        : ((m.kW / parentMetrics.kW) * 100).toFixed(1);
    const pctKVARParent =
      !parentMetrics || selectedNode.id === tree[0].id || parentMetrics.kVAR === 0
        ? "100"
        : ((m.kVAR / parentMetrics.kVAR) * 100).toFixed(1);

    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={{ background: "#0b1220", border: "1px solid #334155", borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>Potencia activa</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: "#93c5fd" }}>{m.kW.toFixed(1)} kW</div>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>Contribución</div>
          <div style={{ fontSize: 14, color: "#93c5fd" }}>
            {pctKWParent}% del padre · {pctKWRoot}% del total
          </div>
        </div>
        <div style={{ background: "#0b1220", border: "1px solid #334155", borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>Potencia reactiva</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: "#fbbf24" }}>{m.kVAR.toFixed(1)} kVAR</div>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>Contribución</div>
          <div style={{ fontSize: 14, color: "#fbbf24" }}>
            {pctKVARParent}% del padre · {pctKVARRoot}% del total
          </div>
        </div>
        <div style={{ background: "#0b1220", border: "1px solid #334155", borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>Tensión</div>
          <div style={{ fontSize: 20, fontWeight: 600 }}>{m.V} V</div>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>Corriente</div>
          <div style={{ fontSize: 16 }}>{m.A} A</div>
        </div>
        <div style={{ background: "#0b1220", border: "1px solid #334155", borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>Factor de potencia</div>
          <div style={{ fontSize: 20, fontWeight: 600 }}>{m.pf.toFixed(2)}</div>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>Estado</div>
          <div style={{ fontSize: 16, color: m.status === "OK" ? "#10b981" : "#ef4444" }}>{m.status}</div>
        </div>
      </div>
    );
  }, [selectedNode, metricsMap, tree]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Columna izquierda 30% dividida en dos mitades */}
      <div
        style={{
          width: "30%",
          display: "flex",
          flexDirection: "column",
          background: "#111827",
          color: "#f9fafb",
          borderRight: "1px solid #374151",
        }}
      >
        {/* Mitad superior: jerarquía editable */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
          <h3 style={{ marginBottom: "0.75rem" }}>Jerarquía editable</h3>
          <EditableHierarchyPanel
            initialTree={tree}
            onTreeChange={setTree}
            setSelectedNode={setSelectedNode}
          />
        </div>

        {/* Mitad inferior: insights en tarjetas */}
        <div style={{ flex: 1, background: "#0f172a", padding: "1rem", borderTop: "2px solid #3b82f6" }}>
          <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 600 }}>
              {selectedNode ? `Insights: ${selectedNode.name}` : "Selecciona un nodo"}
            </div>
            {selectedNode && <div style={{ fontSize: 12, color: "#9ca3af" }}>Actualizando cada 5 segundos</div>}
          </div>
          {selectedNode ? (
            insightsContent
          ) : (
            <p style={{ color: "#9ca3af" }}>Pulsa un cuadro en el árbol o en el canvas.</p>
          )}
        </div>
      </div>

      {/* Columna derecha 70%: canvas editable */}
      <div style={{ width: "70%" }}>
        <UnifilarCanvasEditable
          hierarchy={tree}
          selectedNode={selectedNode}
          setSelectedNode={setSelectedNode}
          metricsMap={metricsMap}
        />
      </div>
    </div>
  );
}
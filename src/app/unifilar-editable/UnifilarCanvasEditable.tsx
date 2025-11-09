"use client";
import React, { useMemo } from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

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

export default function UnifilarCanvasEditable({
  hierarchy,
  selectedNode,
  setSelectedNode,
  metricsMap,
}: {
  hierarchy: NodeItem[];
  selectedNode: NodeItem | null;
  setSelectedNode: (n: NodeItem | null) => void;
  metricsMap: MetricsMap;
}) {
  const LEVEL_Y = 180;
  const SIBLING_X = 220;

  const nodes = useMemo(() => {
    const root = hierarchy[0];

    const subtreeWidth = (n: NodeItem): number => {
      if (n.children.length === 0) return 1;
      return n.children.map(subtreeWidth).reduce((a, b) => a + b, 0);
    };

    const toNodes = (n: NodeItem, level = 0, xOffset = 0): any[] => {
      const y = level * LEVEL_Y;
      const width = subtreeWidth(n);
      const m = metricsMap[n.id];

      const rootMetrics = metricsMap[hierarchy[0].id];
      const pctKWRoot =
        rootMetrics && rootMetrics.kW !== 0 && m ? ((m.kW / rootMetrics.kW) * 100).toFixed(1) : null;
      const pctKVARRoot =
        rootMetrics && rootMetrics.kVAR !== 0 && m ? ((m.kVAR / rootMetrics.kVAR) * 100).toFixed(1) : null;

      // Colores especiales
      let bgColor = "#0b1220"; // default
      let nodeWidth = 200;
      let fontSize = 12;

      if (n.name.toLowerCase().includes("capacitor")) bgColor = "#7dd3fc"; // celeste
      if (n.name.toLowerCase().includes("inversor")) bgColor = "#4ade80"; // verde
      if (n.name.toLowerCase().includes("campo fotovoltaico")) bgColor = "#4ade80"; // verde
      if (n.name.toLowerCase().includes("subestación principal")) {
        bgColor = "#f97316"; // anaranjado
        nodeWidth = 400; // doble de tamaño
        fontSize = 16;
      }
      if (selectedNode?.id === n.id) bgColor = "#1e3a8a"; // azul si seleccionado

      // Label con colores en kW/kVAR
      const label = m
        ? `${n.name}
${m.kW.toFixed(1)} kW (${pctKWRoot ?? "—"}%)
${m.kVAR.toFixed(1)} kVAR (${pctKVARRoot ?? "—"}%)`
        : n.name;

      const node = {
        id: n.id,
        position: { x: xOffset * SIBLING_X, y },
        data: {
          label: (
            <div style={{ whiteSpace: "pre-line", fontSize }}>
              <div>{n.name}</div>
              {m && (
                <>
                  <div style={{ color: "#93c5fd" }}>
                    {m.kW.toFixed(1)} kW ({pctKWRoot ?? "—"}%)
                  </div>
                  <div style={{ color: "#fbbf24" }}>
                    {m.kVAR.toFixed(1)} kVAR ({pctKVARRoot ?? "—"}%)
                  </div>
                </>
              )}
            </div>
          ),
        },
        style: {
          background: bgColor,
          color: "#f9fafb",
          border: "1px solid #334155",
          padding: 8,
          borderRadius: 6,
          width: nodeWidth,
        },
      };

      let cursor = xOffset - width / 2;
      const childrenNodes: any[] = [];
      n.children.forEach((child) => {
        const childWidth = subtreeWidth(child);
        const childCenter = cursor + childWidth / 2;
        childrenNodes.push(...toNodes(child, level + 1, childCenter));
        cursor += childWidth;
      });

      return [node, ...childrenNodes];
    };

    return toNodes(root, 0, 0);
  }, [hierarchy, metricsMap, selectedNode]);

  const edges = useMemo(() => {
    const list: any[] = [];
    const walk = (n: NodeItem) => {
      n.children.forEach((c) => {
        list.push({
          id: `${n.id}-${c.id}`,
          source: n.id,
          target: c.id,
          type: "step",
          animated: true,
          style: { stroke: "#3b82f6" },
        });
        walk(c);
      });
    };
    walk(hierarchy[0]);
    return list;
  }, [hierarchy]);

  const handleNodeClick = (_: any, node: any) => {
    const found = findNode(hierarchy, node.id);
    if (found) setSelectedNode(found);
  };

  const findNode = (list: NodeItem[], id: string): NodeItem | null => {
    for (const n of list) {
      if (n.id === id) return n;
      const deep = findNode(n.children, id);
      if (deep) return deep;
    }
    return null;
  };

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodeClick={handleNodeClick}
      fitView
      defaultEdgeOptions={{ type: "step", animated: true }}
      style={{ background: "#111827" }}
      attributionPosition={null} // 🔴 elimina cuadro de React Flow
    >
      <Background color="#333" gap={30} />
      <Controls position="bottom-right" /> {/* ✅ controles de zoom/centrar */}
    </ReactFlow>
  );
}
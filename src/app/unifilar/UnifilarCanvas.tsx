"use client";
import React, { useCallback, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  OnNodeClick,
} from "reactflow";
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

// Calcula el ancho total de un subárbol para distribuir hijos proporcionalmente
function getSubtreeWidth(node: NodeItem, spacingX: number): number {
  if (!node.children.length) return spacingX;
  return node.children.reduce((sum, child) => sum + getSubtreeWidth(child, spacingX), 0);
}

/**
 * Genera nodes y edges para React Flow con:
 * - Porcentajes corregidos (padre y raíz) usando la lógica de insights.
 * - Layout dinámico por ancho de subárbol para evitar sobremontajes.
 * - Cuadros presentables y valores coloreados (kW azul, kVAR naranja).
 * - Líneas animadas sin flechas entre padre e hijos.
 */
function generateFlowData(
  subtree: NodeItem[],              // lista de nodos en este nivel (fragmento del árbol)
  hierarchyRootId: string,          // id del root global
  hierarchyRootMetrics: Metrics,    // métricas del root global
  metricsMap: MetricsMap,
  selectedNodeId?: string,
  level = 0,
  parentId?: string,
  xOffset = 0
): { nodes: Node[]; edges: Edge[] } {
  const spacingY = 240;
  const spacingX = 240; // ligeramente mayor para separar más
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  subtree.forEach((node) => {
    const subtreeWidth = getSubtreeWidth(node, spacingX);
    const x = xOffset + subtreeWidth / 2;
    const y = level * spacingY;

    const m = metricsMap[node.id] ?? {
      kW: 0,
      kVAR: 0,
      V: 0,
      A: 0,
      pf: 1,
      status: "OK",
    };

    // Métricas del padre si existen (para % padre)
    const parentMetrics = parentId ? metricsMap[parentId] : null;

    // % relativo al padre (los hermanos deben sumar 100%)
    const pctKWParent =
      !parentMetrics || node.id === hierarchyRootId || parentMetrics.kW === 0
        ? "100"
        : ((m.kW / parentMetrics.kW) * 100).toFixed(1);

    const pctKVARParent =
      !parentMetrics || node.id === hierarchyRootId || parentMetrics.kVAR === 0
        ? "100"
        : ((m.kVAR / parentMetrics.kVAR) * 100).toFixed(1);

    // % relativo al root global (lógica de insights)
    const pctKWRoot =
      node.id === hierarchyRootId || hierarchyRootMetrics.kW === 0
        ? "100"
        : ((m.kW / hierarchyRootMetrics.kW) * 100).toFixed(1);

    const pctKVARRoot =
      node.id === hierarchyRootId || hierarchyRootMetrics.kVAR === 0
        ? "100"
        : ((m.kVAR / hierarchyRootMetrics.kVAR) * 100).toFixed(1);

    // Label presentable con colores de insights
    const label = (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontWeight: 600 }}>{node.name}</div>
        <div style={{ color: "#93c5fd" }}>
          {m.kW.toFixed(1)} kW ({pctKWParent}% padre · {pctKWRoot}% total)
        </div>
        <div style={{ color: "#fbbf24" }}>
          {m.kVAR.toFixed(1)} kVAR ({pctKVARParent}% padre · {pctKVARRoot}% total)
        </div>
      </div>
    );

    // Color de fondo por tipo
    const bg =
      node.name.toLowerCase().includes("capacitor")
        ? "#1e3a8a" // azul oscuro para banco de capacitores
        : node.name.toLowerCase().includes("inversor")
        ? "#065f46" // verde para inversores/solar
        : "#374151"; // gris para otros

    nodes.push({
      id: node.id,
      position: { x, y },
      data: { label },
      style: {
        background: bg,
        color: "#f9fafb",
        padding: "8px 12px",
        fontSize: "11px",
        borderRadius: "8px",
        border: selectedNodeId === node.id ? "2px solid #f59e0b" : "1px solid #555",
        boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
      },
      type: "default",
    });

    if (parentId) {
      // Línea animada sin flechas entre padre e hijo
      edges.push({
        id: `edge-${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
        type: "step",
        animated: true,
        style: { stroke: "#3b82f6", strokeWidth: 2 },
      } as Edge);
    }

    // Recursión: distribuir hijos proporcionalmente según el ancho del subárbol
    let childXOffset = xOffset;
    node.children.forEach((child) => {
      const childWidth = getSubtreeWidth(child, spacingX);
      const childData = generateFlowData(
        [child],
        hierarchyRootId,
        hierarchyRootMetrics,
        metricsMap,
        selectedNodeId,
        level + 1,
        node.id,
        childXOffset
      );
      nodes.push(...childData.nodes);
      edges.push(...childData.edges);
      childXOffset += childWidth;
    });
  });

  return { nodes, edges };
}
export default function UnifilarCanvas({
  hierarchy,
  selectedNode,
  setSelectedNode,
  metricsMap,
}: {
  hierarchy: NodeItem[];
  selectedNode: NodeItem | null;
  setSelectedNode: (node: NodeItem | null) => void;
  metricsMap: MetricsMap;
}) {
  const selectedNodeId = selectedNode?.id;

  // Root global (jerarquía 1): id y métricas fijas para cálculo de % total
  const hierarchyRootId = hierarchy[0]?.id ?? "";
  const hierarchyRootMetrics = metricsMap[hierarchyRootId] ?? {
    kW: 0,
    kVAR: 0,
    V: 0,
    A: 0,
    pf: 1,
    status: "OK",
  };

  // Genera nodos y edges con layout dinámico y porcentajes corregidos (igual que insights)
  const { nodes, edges } = useMemo(
    () =>
      generateFlowData(
        hierarchy,              // árbol completo
        hierarchyRootId,        // root global fijo
        hierarchyRootMetrics,   // métricas del root global
        metricsMap,
        selectedNodeId
      ),
    [hierarchy, metricsMap, selectedNodeId, hierarchyRootId, hierarchyRootMetrics]
  );

  // Maneja clic en nodo para sincronizar selección con jerarquía
  const handleNodeClick: OnNodeClick = useCallback(
    (_evt, node) => {
      const findNode = (list: NodeItem[]): NodeItem | null => {
        for (const n of list) {
          if (n.id === node.id) return n;
          const found = findNode(n.children);
          if (found) return found;
        }
        return null;
      };
      const found = findNode(hierarchy);
      if (found) setSelectedNode(found);
    },
    [hierarchy, setSelectedNode]
  );

  return (
<ReactFlow
  nodes={nodes}
  edges={edges}
  onNodeClick={handleNodeClick}
  fitView
  defaultEdgeOptions={{ type: "step", animated: true }} // líneas animadas sin flechas
  style={{ background: "#111827" }}
  attributionPosition={null} // 🔴 esto elimina el cuadro/enlace de React Flow
>
  <Background color="#333" gap={30} />
  <Controls />
</ReactFlow>
  );
}
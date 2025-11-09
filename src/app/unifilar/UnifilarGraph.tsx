"use client";
import React, { useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";

export default function UnifilarGraph() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  const [connectModal, setConnectModal] = useState<{ parentId: string } | null>(null);

  const nextIdRef = useRef(1);

  // Crear nodo raíz
  const addRootNode = (name: string, icon: string) => {
    const newId = String(nextIdRef.current++);
    const newNode: Node = {
      id: newId,
      position: { x: 480, y: 40 },
      data: { label: `${icon} ${name}` },
      style: {
        background: "#111827",
        color: "#f9fafb",
        border: "2px solid #3b82f6",
        borderRadius: "6px",
        padding: "6px",
      },
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedParentId(newId);
  };

  // Conectar padre con hijo
  const connectNodes = (parentId: string, childId: string) => {
    const newEdge: Edge = {
      id: `e${parentId}-${childId}`,
      source: parentId,
      target: childId,
      type: "straight",
      animated: true,
      style: { strokeWidth: 2, stroke: "#3b82f6" },
      markerEnd: { type: MarkerType.ArrowClosed },
    };
    setEdges((prev) => [...prev, newEdge]);
  };

  // Eliminar nodo
  const deleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) => prev.filter((e) => e.source !== nodeId && e.target !== nodeId));
    if (selectedParentId === nodeId) setSelectedParentId(null);
    setContextMenu(null);
  };

  // Crear hijo
  const addChildNode = (parentId: string, name: string, icon: string) => {
    const parentNode = nodes.find((n) => n.id === parentId);
    const newId = String(nextIdRef.current++);
    const newNode: Node = {
      id: newId,
      position: {
        x: parentNode ? parentNode.position.x : 480,
        y: parentNode ? parentNode.position.y + 160 : 200,
      },
      data: { label: `${icon} ${name}` },
      style: {
        background: "#1f2937",
        color: "#f9fafb",
        border: "2px solid #f97316",
        borderRadius: "6px",
        padding: "6px",
      },
    };
    setNodes((prev) => [...prev, newNode]);
    connectNodes(parentId, newId);
  };

  return (
    <div className="graph-panel" style={{ position: "relative" }}>
      <div className="graph-panel-header">
        <span>
          Diagrama unifilar{" "}
          {selectedParentId &&
            `| Padre activo: ${
              nodes.find((n) => n.id === selectedParentId)?.data.label
            }`}
        </span>
        <button onClick={() => addRootNode("Subestación Norte", "⚡")}>
          ➕ Añadir raíz
        </button>
      </div>

      <ReactFlow
        nodes={nodes.map((n) => ({
          ...n,
          style: {
            ...n.style,
            border:
              selectedParentId === n.id
                ? "3px solid #3b82f6"
                : n.style?.border || "2px solid #f97316",
          },
        }))}
        edges={edges}
        fitView
        defaultEdgeOptions={{ type: "straight" }}
        onNodeClick={(_, node) => setSelectedParentId(node.id)}
        onNodeContextMenu={(event, node) => {
          event.preventDefault();
          setContextMenu({ x: event.clientX, y: event.clientY, nodeId: node.id });
        }}
      >
        <Background color="#374151" gap={20} />
        <Controls />
      </ReactFlow>

      {/* Menú contextual */}
      {contextMenu && (
        <div
          className="context-menu"
          style={{
            position: "absolute",
            top: contextMenu.y,
            left: contextMenu.x,
            background: "#111827",
            color: "#f9fafb",
            border: "1px solid #374151",
            borderRadius: "6px",
            padding: "6px",
            zIndex: 10,
          }}
        >
          <button onClick={() => setSelectedParentId(contextMenu.nodeId)}>✔ Seleccionar como padre</button>
          <button onClick={() => setConnectModal({ parentId: contextMenu.nodeId })}>➕ Conectar a...</button>
          <button onClick={() => deleteNode(contextMenu.nodeId)}>🗑 Eliminar nodo</button>
        </div>
      )}

      {/* Modal de conexión */}
      {connectModal && (
        <div
          className="connect-modal"
          style={{
            position: "absolute",
            top: "30%",
            left: "30%",
            background: "#1f2937",
            color: "#f9fafb",
            padding: "20px",
            borderRadius: "8px",
            border: "2px solid #3b82f6",
            zIndex: 20,
          }}
        >
          <h3>Conectar {nodes.find((n) => n.id === connectModal.parentId)?.data.label} a:</h3>
          <ul>
            {nodes
              .filter((n) => n.id !== connectModal.parentId)
              .map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => {
                      connectNodes(connectModal.parentId, n.id);
                      setConnectModal(null);
                      setContextMenu(null);
                    }}
                  >
                    {n.data.label}
                  </button>
                </li>
              ))}
          </ul>
          <button onClick={() => setConnectModal(null)}>Cancelar</button>
        </div>
      )}
    </div>
  );
}
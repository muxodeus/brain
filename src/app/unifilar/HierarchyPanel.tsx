"use client";
import React from "react";

interface NodeItem {
  id: string;
  name: string;
  children: NodeItem[];
}

export default function HierarchyPanel({
  tree,
  setSelectedNode,
}: {
  tree: NodeItem[];
  setSelectedNode: (n: NodeItem) => void;
}) {
  return (
    <div>
      {tree.map((node) => (
        <TreeBlock key={node.id} node={node} setSelectedNode={setSelectedNode} />
      ))}
    </div>
  );
}

function TreeBlock({
  node,
  setSelectedNode,
  level = 0,
}: {
  node: NodeItem;
  setSelectedNode: (n: NodeItem) => void;
  level?: number;
}) {
  return (
    <div style={{ marginLeft: level * 16, marginTop: 6 }}>
      <div
        onClick={() => setSelectedNode(node)}
        style={{
          border: "1px solid #445",
          padding: "4px 8px",
          borderRadius: "4px",
          color: "#f9fafb",
          cursor: "pointer",
          fontSize: "12px",
          background: "transparent",
        }}
      >
        {node.name}
      </div>
      {node.children.map((child) => (
        <TreeBlock
          key={child.id}
          node={child}
          setSelectedNode={setSelectedNode}
          level={level + 1}
        />
      ))}
    </div>
  );
}
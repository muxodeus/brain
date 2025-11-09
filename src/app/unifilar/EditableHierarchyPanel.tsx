"use client";
import React, { useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

interface NodeItem {
  id: string;
  name: string;
  children: NodeItem[];
}

export default function EditableHierarchyPanel({
  initialTree,
  onTreeChange,
  setSelectedNode,
}: {
  initialTree: NodeItem[];
  onTreeChange: (t: NodeItem[]) => void;
  setSelectedNode: (n: NodeItem) => void;
}) {
  const [tree, setTree] = useState<NodeItem[]>(initialTree);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sourceId = String(active.id);
    const destId = String(over.id);

    const newTree = moveNode(tree, sourceId, destId);
    setTree(newTree);
    onTreeChange(newTree);
  };

  return (
    <div style={{ padding: "1rem", background: "#111827", color: "#f9fafb" }}>
      <h3 style={{ marginBottom: "0.75rem" }}>Jerarquía editable (dnd‑kit)</h3>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        {tree.map((node) => (
          <Branch key={node.id} node={node} setSelectedNode={setSelectedNode} />
        ))}
      </DndContext>
    </div>
  );
}

function Branch({ node, setSelectedNode, level = 0 }: { node: NodeItem; setSelectedNode: (n: NodeItem) => void; level?: number }) {
  return (
    <div style={{ marginLeft: level * 16 }}>
      <SortableItem node={node} setSelectedNode={setSelectedNode} />
      {node.children.length > 0 && (
        <SortableContext items={node.children.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div style={{ marginLeft: 16, marginTop: 6 }}>
            {node.children.map((child) => (
              <Branch key={child.id} node={child} setSelectedNode={setSelectedNode} level={level + 1} />
            ))}
          </div>
        </SortableContext>
      )}
    </div>
  );
}

function SortableItem({ node, setSelectedNode }: { node: NodeItem; setSelectedNode: (n: NodeItem) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: node.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    border: "1px solid #445",
    padding: "4px 8px",
    borderRadius: "4px",
    color: "#f9fafb",
    cursor: "grab",
    fontSize: "12px",
    background: "#0b1220",
    marginTop: "6px",
  } as React.CSSProperties;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={() => setSelectedNode(node)}>
      {node.name}
    </div>
  );
}

// Mover nodo: extrae sourceId de todo el árbol y lo inserta como hijo de destId
function moveNode(tree: NodeItem[], sourceId: string, destId: string): NodeItem[] {
  let nodeToMove: NodeItem | null = null;

  function removeNode(list: NodeItem[]): NodeItem[] {
    return list
      .map((n) => ({ ...n, children: removeNode(n.children) }))
      .filter((n) => {
        if (n.id === sourceId) {
          nodeToMove = n;
          return false;
        }
        return true;
      });
  }

  const cleaned = removeNode(tree);

  function insertNode(list: NodeItem[]): NodeItem[] {
    return list.map((n) => {
      if (n.id === destId && nodeToMove) {
        return { ...n, children: [...n.children, { ...nodeToMove }] };
      }
      return { ...n, children: insertNode(n.children) };
    });
  }

  return insertNode(cleaned);
}
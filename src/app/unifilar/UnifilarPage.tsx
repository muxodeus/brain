"use client";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import HierarchyPanel from "./HierarchyPanel";

export default function UnifilarPage() {
  return (
    <DndProvider backend={HTML5Backend}>
      <HierarchyPanel />
    </DndProvider>
  );
}
"use client";
import { useDrag } from "react-dnd";

function MedidorItem({ name }: { name: string }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "MEDIDOR",
    item: { name },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }));

  return (
    <li
      ref={drag}
      className="medidor-item"
      style={{ opacity: isDragging ? 0.6 : 1 }}
    >
      {name}
    </li>
  );
}

export default function ConstructorPanel() {
  const medidores = [
    "Subestación Norte",
    "Panel Bombas",
    "Bomba de Soplado",
    "Bomba de Agua",
  ];

  return (
    <div className="constructor-panel">
      <h3>Medidores disponibles</h3>
      <ul className="medidor-list">
        {medidores.map((m) => (
          <MedidorItem key={m} name={m} />
        ))}
      </ul>
      <button className="btn-guardar">Guardar jerarquía</button>
    </div>
  );
}
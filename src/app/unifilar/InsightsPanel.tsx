"use client";

export default function InsightsPanel() {
  return (
    <div className="insights-panel">
      <h3>Detalles del nodo</h3>
      <div className="insight-card">
        <p><strong>kW:</strong> 45.2</p>
        <p><strong>PF:</strong> 0.92</p>
        <p><strong>THD:</strong> 3.1%</p>
      </div>
      <div className="insight-actions">
        <button>Ver tendencia</button>
        <button>Histórico</button>
        <button>Alarmas</button>
      </div>
    </div>
  );
}
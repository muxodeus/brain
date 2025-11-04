"use client";

import { useEffect, useState } from "react";
import MeterFormModal from "@core/components/medidores/MeterFormModal";
import mqtt from "mqtt";

type Meter = {
  id: number;
  name: string;
  ip: string;
  port: number;
  slave_id: number;
  gateway_out: string;
  brand: string;
  model: string;
  status: "on" | "off" | "warning";
  last_seen?: string | null;
};

export default function MedidoresPage() {
  const [meters, setMeters] = useState<Meter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // MQTT client (HiveMQ Cloud)
  const client = mqtt.connect("wss://e410daf6a96e4f55b37e2ec3223aaa47.s1.eu.hivemq.cloud:8884/mqtt", {
    username: "hivemq.webclient.1760898820730",
    password: "d.K0o1?BA!la9;uiWV2Z",
  });

  const fetchMeters = async () => {
    setLoading(true);
    const res = await fetch("/api/meters");
    const data = await res.json();
    setMeters(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMeters();
  }, []);

  const handleSave = async (data: any) => {
    await fetch("/api/meters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setShowModal(false);
    fetchMeters();
  };

  const handleDelete = async (id: number) => {
    await fetch("/api/meters", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchMeters();
  };

  // Publicar configuración de un GW específico
  const publishConfig = (gwId: string) => {
    const gwMeters = meters.filter((m) => m.gateway_out === gwId);
    if (gwMeters.length === 0) {
      alert(`No hay medidores para GW ${gwId}`);
      return;
    }

    const config = {
      site: "Planta X", // puedes parametrizarlo
      gw: gwId,
      meters: gwMeters.map((m) => ({
        meter: m.name,
        ip: m.ip,
        port: m.port,
        unitId: m.slave_id,
        brand: m.brand,
        model: m.model,
      })),
    };

    client.publish(`config/${gwId}/meters`, JSON.stringify(config), { qos: 1 });
    alert(`Configuración publicada a config/${gwId}/meters`);
  };

  const statusBadge = (status: Meter["status"]) => {
    switch (status) {
      case "on":
        return <span className="text-green-400 font-bold">🟢 ON</span>;
      case "off":
        return <span className="text-red-400 font-bold">🔴 OFF</span>;
      case "warning":
        return <span className="text-yellow-400 font-bold">🟡 Warning</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white/90 border-b border-white/10 pb-2">
          ⚙️ Configuración — Medidores
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-teal-600 rounded hover:bg-teal-700"
        >
          ➕ Nuevo Medidor
        </button>
      </header>

      {loading ? (
        <p className="text-white/50 animate-pulse">Cargando medidores…</p>
      ) : meters.length === 0 ? (
        <p className="text-white/60">No hay medidores configurados.</p>
      ) : (
        <>
          <table className="w-full border border-white/10 rounded-lg overflow-hidden">
            <thead className="bg-slate-800/60">
              <tr>
                <th className="p-2 text-left">Nombre</th>
                <th className="p-2 text-left">Marca / Modelo</th>
                <th className="p-2 text-left">IP / ID</th>
                <th className="p-2 text-left">Gateway</th>
                <th className="p-2 text-left">Última lectura</th>
                <th className="p-2 text-left">Estado</th>
                <th className="p-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {meters.map((m) => (
                <tr key={m.id} className="border-t border-white/10">
                  <td className="p-2">{m.name}</td>
                  <td className="p-2">{m.brand} {m.model}</td>
                  <td className="p-2">{m.ip}:{m.port} / {m.slave_id}</td>
                  <td className="p-2">{m.gateway_out}</td>
                  <td className="p-2">
                    {m.last_seen ? new Date(m.last_seen).toLocaleString() : "—"}
                  </td>
                  <td className="p-2">{statusBadge(m.status)}</td>
                  <td className="p-2 space-x-2">
                    <button className="px-2 py-1 bg-slate-700 rounded hover:bg-slate-600">
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="px-2 py-1 bg-red-600 rounded hover:bg-red-700"
                    >
                      🗑️
                    </button>
                    <button
                      onClick={() => publishConfig(m.gateway_out)}
                      className="px-2 py-1 bg-blue-600 rounded hover:bg-blue-700"
                    >
                      📡 Publicar GW
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {showModal && (
        <MeterFormModal
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}